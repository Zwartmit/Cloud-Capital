# Script de Reversion Completa - Volver a Configuracion Solo Localhost
# IMPORTANTE: Ejecutar PowerShell como ADMINISTRADOR

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Reversion a Configuracion Localhost" -ForegroundColor Cyan
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
    Write-Host "4. Ejecuta: .\scripts\revertir-configuracion.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "ADVERTENCIA: Este script revertira todos los cambios de red local" -ForegroundColor Yellow
Write-Host "Despues de ejecutarlo, solo podras acceder desde localhost" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deseas continuar? (S/N): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne 'S' -and $confirm -ne 's') {
    Write-Host "Operacion cancelada" -ForegroundColor Yellow
    pause
    exit 0
}
Write-Host ""

# Variables
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$myIniPath = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$frontendEnvLocal = "packages\frontend\.env.local"
$backendEnv = "packages\backend\.env"

Write-Host "PASO 1: Eliminando Regla de Firewall" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
$firewallRule = Get-NetFirewallRule -DisplayName "MySQL Server" -ErrorAction SilentlyContinue
if ($firewallRule) {
    try {
        Remove-NetFirewallRule -DisplayName "MySQL Server" -ErrorAction Stop
        Write-Host "Regla de firewall eliminada correctamente" -ForegroundColor Green
    } catch {
        Write-Host "Error al eliminar regla: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "No se encontro regla de firewall (ya estaba eliminada)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "PASO 2: Eliminando Permisos MySQL Remotos" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
Write-Host "Ingresa la contrasena de root de MySQL: " -NoNewline -ForegroundColor Gray
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$sqlCommands = @"
DROP USER IF EXISTS 'root'@'%';
FLUSH PRIVILEGES;
"@

$tempFile = [System.IO.Path]::GetTempFileName()
$sqlCommands | Out-File -FilePath $tempFile -Encoding UTF8

try {
    & $mysqlPath -u root -p"$passwordPlain" -e "source $tempFile" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Usuario remoto eliminado correctamente" -ForegroundColor Green
    } else {
        Write-Host "Error al eliminar usuario (verifica la contrasena)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}
Write-Host ""

Write-Host "PASO 3: Eliminando archivo .env.local del Frontend" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
if (Test-Path $frontendEnvLocal) {
    try {
        Remove-Item $frontendEnvLocal -Force
        Write-Host "Archivo .env.local eliminado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "Error al eliminar archivo: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Archivo .env.local no existe (ya estaba eliminado)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "PASO 4: Verificando configuracion my.ini" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
if (Test-Path $myIniPath) {
    $myIniContent = Get-Content $myIniPath -Raw
    if ($myIniContent -match "bind-address\s*=\s*0\.0\.0\.0") {
        Write-Host "ADVERTENCIA: Necesitas editar manualmente my.ini:" -ForegroundColor Yellow
        Write-Host "  Ubicacion: $myIniPath" -ForegroundColor White
        Write-Host "  Eliminar o comentar la linea: bind-address=0.0.0.0" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Despues de editar, reinicia MySQL manualmente:" -ForegroundColor Yellow
        Write-Host "  Restart-Service -Name MySQL80" -ForegroundColor Cyan
    } else {
        Write-Host "my.ini no tiene bind-address configurado (OK)" -ForegroundColor Green
    }
} else {
    Write-Host "No se encontro my.ini en la ruta esperada" -ForegroundColor Red
}
Write-Host ""

Write-Host "PASO 5: Revertiendo CORS en app.ts" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Gray
Write-Host "ADVERTENCIA: Necesitas revertir manualmente el archivo:" -ForegroundColor Yellow
Write-Host "  packages/backend/src/app.ts" -ForegroundColor White
Write-Host ""
Write-Host "Cambiar la configuracion de CORS (lineas 13-42) a:" -ForegroundColor Yellow
Write-Host "  app.use(cors({" -ForegroundColor Cyan
Write-Host "    origin: process.env.FRONTEND_URL || 'http://localhost:5173'," -ForegroundColor Cyan
Write-Host "    credentials: true," -ForegroundColor Cyan
Write-Host "  }));" -ForegroundColor Cyan
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Reversion Completada (Parcial)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cambios automaticos realizados:" -ForegroundColor Green
Write-Host "  - Regla de firewall eliminada" -ForegroundColor White
Write-Host "  - Usuario MySQL remoto eliminado" -ForegroundColor White
Write-Host "  - Archivo .env.local del frontend eliminado" -ForegroundColor White
Write-Host ""
Write-Host "Cambios manuales pendientes:" -ForegroundColor Yellow
Write-Host "  1. Editar my.ini y eliminar 'bind-address=0.0.0.0'" -ForegroundColor White
Write-Host "  2. Reiniciar MySQL: Restart-Service -Name MySQL80" -ForegroundColor White
Write-Host "  3. Revertir CORS en packages/backend/src/app.ts" -ForegroundColor White
Write-Host "  4. Reiniciar backend (Ctrl+C y npm run dev:backend)" -ForegroundColor White
Write-Host "  5. Reiniciar frontend (Ctrl+C y npm run dev:frontend)" -ForegroundColor White
Write-Host ""
Write-Host "Despues de estos cambios, solo podras acceder desde localhost" -ForegroundColor Gray
Write-Host ""
pause
