# Script de Configuracion Completa para Acceso desde Red Local
# IMPORTANTE: Ejecutar PowerShell como ADMINISTRADOR

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Configuracion Completa MySQL Red Local" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se esta ejecutando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Este script requiere permisos de administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, cierra esta ventana y:" -ForegroundColor Yellow
    Write-Host "1. Presiona Win + X" -ForegroundColor Yellow
    Write-Host "2. Selecciona 'Windows PowerShell (Administrador)'" -ForegroundColor Yellow
    Write-Host "3. Navega a la carpeta del proyecto" -ForegroundColor Yellow
    Write-Host "4. Ejecuta: .\scripts\configurar-red-local.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Variables
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$myIniPath = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"

Write-Host "PASO 1: Verificando archivo my.ini" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
if (Test-Path $myIniPath) {
    $myIniContent = Get-Content $myIniPath -Raw
    if ($myIniContent -match "bind-address\s*=\s*0\.0\.0\.0") {
        Write-Host "bind-address ya esta configurado en my.ini" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: Necesitas agregar manualmente a my.ini:" -ForegroundColor Yellow
        Write-Host "  Ubicacion: $myIniPath" -ForegroundColor White
        Write-Host "  Agregar despues de 'port=3306':" -ForegroundColor White
        Write-Host "    bind-address=0.0.0.0" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Deseas continuar sin este cambio? (S/N): " -NoNewline -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne 'S' -and $response -ne 's') {
            Write-Host "Operacion cancelada. Por favor, edita my.ini y ejecuta el script de nuevo." -ForegroundColor Red
            pause
            exit 0
        }
    }
} else {
    Write-Host "ADVERTENCIA: No se encontro my.ini en la ruta esperada" -ForegroundColor Red
}
Write-Host ""

Write-Host "PASO 2: Reiniciando MySQL" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
try {
    Write-Host "Deteniendo MySQL80..." -ForegroundColor Gray
    Stop-Service -Name MySQL80 -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "Iniciando MySQL80..." -ForegroundColor Gray
    Start-Service -Name MySQL80 -ErrorAction Stop
    Write-Host "MySQL80 reiniciado correctamente" -ForegroundColor Green
} catch {
    Write-Host "Error al reiniciar MySQL80: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

Write-Host "PASO 3: Configurando Firewall" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
$existingRule = Get-NetFirewallRule -DisplayName "MySQL Server" -ErrorAction SilentlyContinue
if ($existingRule) {
    Write-Host "La regla de firewall ya existe" -ForegroundColor Green
} else {
    try {
        New-NetFirewallRule -DisplayName "MySQL Server" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Allow -ErrorAction Stop | Out-Null
        Write-Host "Regla de firewall creada correctamente" -ForegroundColor Green
    } catch {
        Write-Host "Error al crear la regla: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "PASO 4: Configurando Permisos MySQL" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
Write-Host "Ingresa la contrasena de root de MySQL: " -NoNewline -ForegroundColor Gray
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$sqlCommands = @"
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '$passwordPlain';
GRANT ALL PRIVILEGES ON cloudcapital.* TO 'root'@'%';
FLUSH PRIVILEGES;
"@

$tempFile = [System.IO.Path]::GetTempFileName()
$sqlCommands | Out-File -FilePath $tempFile -Encoding UTF8

try {
    & $mysqlPath -u root -p"$passwordPlain" -e "source $tempFile" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Permisos MySQL configurados correctamente" -ForegroundColor Green
    } else {
        Write-Host "Error al configurar permisos (verifica la contrasena)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}
Write-Host ""

Write-Host "PASO 5: Verificando Conexion" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object IPAddress, InterfaceAlias

Write-Host "Direcciones IP disponibles:" -ForegroundColor Gray
foreach ($ip in $ips) {
    Write-Host "  - $($ip.IPAddress) ($($ip.InterfaceAlias))" -ForegroundColor White
}
Write-Host ""

Write-Host "Ingresa la IP que usaras para conectarte desde tu celular: " -NoNewline -ForegroundColor Gray
$selectedIP = Read-Host

Write-Host "Verificando conexion al puerto 3306..." -ForegroundColor Gray
try {
    $result = Test-NetConnection -ComputerName $selectedIP -Port 3306 -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "Puerto 3306 esta abierto y accesible" -ForegroundColor Green
    } else {
        Write-Host "No se puede conectar al puerto 3306" -ForegroundColor Red
    }
} catch {
    Write-Host "Error al verificar conexion" -ForegroundColor Red
}
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Configuracion Completada" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Crea el archivo: packages/frontend/.env.local" -ForegroundColor White
Write-Host "   Contenido: VITE_API_URL=http://$selectedIP:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Reinicia el frontend (Ctrl+C y npm run dev:frontend)" -ForegroundColor White
Write-Host ""
Write-Host "3. Accede desde tu celular a: http://$selectedIP:5173/" -ForegroundColor White
Write-Host ""
pause
