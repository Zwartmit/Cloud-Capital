# Guía de Despliegue - Cloud Capital

Esta guía explica cómo desplegar el proyecto Cloud Capital usando Docker en diferentes plataformas.

---

## 🚀 Proceso de Despliegue con Docker

### **Opción 1: VPS (Servidor Propio)** - Control Total

#### 1️⃣ **Contratar un VPS**
- **Proveedores recomendados**: DigitalOcean ($6/mes), Hetzner (€5/mes), Linode ($5/mes)
- **Especificaciones mínimas**: 1GB RAM, 1 CPU, 25GB SSD
- **Sistema operativo**: Ubuntu 22.04 LTS

#### 2️⃣ **Configurar el servidor (una sola vez)**
Conectarte vía SSH:
```bash
ssh root@tu-ip-del-servidor
```

Instalar Docker:
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Instalar Git
apt install git -y
```

#### 3️⃣ **Clonar tu proyecto**
```bash
cd /var/www
git clone https://github.com/Zwartmit/Cloud-Capital.git
cd Cloud-Capital
```

#### 4️⃣ **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz
nano .env
```

Contenido del `.env`:
```env
DB_PASSWORD=tu_password_seguro_aqui
DB_NAME=cloudcapital
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
```

#### 5️⃣ **Levantar todo con Docker**
```bash
docker-compose up --build -d
```

Esto:
- Construye las imágenes del frontend y backend
- Descarga MySQL
- Levanta todo en segundo plano

#### 6️⃣ **Inicializar la base de datos**
```bash
# Esperar 10 segundos a que MySQL esté listo
sleep 10

# Aplicar migraciones
docker-compose exec backend sh -c "cd ../database && npx prisma db push"

# Ejecutar seed (datos iniciales)
docker-compose exec backend sh -c "cd ../database && npm run seed"
```

#### 7️⃣ **Configurar dominio y HTTPS** (Opcional pero recomendado)
```bash
# Instalar Nginx como reverse proxy
apt install nginx -y

# Instalar Certbot para SSL gratuito
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
certbot --nginx -d tudominio.com
```

**¡Listo!** Tu aplicación está en vivo en `https://tudominio.com`

---

### **Opción 2: Railway** - Automático y Fácil

#### 1️⃣ **Subir código a GitHub**
```bash
git add .
git commit -m "Dockerized project"
git push origin main
```

#### 2️⃣ **Crear proyecto en Railway**
1. Ve a [railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Elige tu repositorio `Cloud-Capital`

#### 3️⃣ **Railway detecta automáticamente**
- Lee tu `docker-compose.yml`
- Crea servicios para frontend, backend y database
- Asigna URLs públicas automáticamente

#### 4️⃣ **Configurar variables de entorno**
En el dashboard de Railway, agrega:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DB_PASSWORD` (Railway auto-genera `DATABASE_URL`)

#### 5️⃣ **Ejecutar migraciones**
Desde el dashboard de Railway:
```bash
npx prisma db push
npm run seed
```

**¡Listo!** Railway te da una URL como `https://cloud-capital.up.railway.app`

---

## 🔄 Actualizar el Proyecto (Hacer Cambios)

### **En VPS:**
```bash
# 1. Conectarte al servidor
ssh root@tu-servidor

# 2. Ir a la carpeta del proyecto
cd /var/www/Cloud-Capital

# 3. Traer cambios de GitHub
git pull origin main

# 4. Reconstruir contenedores
docker-compose up --build -d

# 5. Si hay cambios en la base de datos
docker-compose exec backend sh -c "cd ../database && npx prisma db push"
```

### **En Railway:**
```bash
# Solo hacer push a GitHub
git push origin main

# Railway detecta el cambio y redesplega automáticamente
```

---

## 📊 Comparación de Opciones

| Característica | VPS | Railway |
|----------------|-----|---------|
| **Costo inicial** | $5-6/mes | Gratis (500h/mes) |
| **Configuración** | Manual (30 min) | Automática (5 min) |
| **Actualizaciones** | `git pull` + `docker-compose up` | Automático con `git push` |
| **Control** | Total | Limitado |
| **Escalabilidad** | Manual | Automática |
| **Ideal para** | Producción seria | MVP/Pruebas |

---

## 💾 Persistencia de Datos

### ¿Se pierden los datos al actualizar?

**NO.** Docker usa volúmenes persistentes para la base de datos:

```yaml
volumes:
  db_data:/var/lib/mysql
```

Este volumen es independiente de los contenedores. Cuando actualizas:
1. Los contenedores viejos se detienen
2. Se construyen nuevos contenedores con el código actualizado
3. Los nuevos contenedores se conectan al **mismo volumen de datos**
4. Todos los usuarios, inversiones y transacciones permanecen intactos

### Reset de Base de Datos

Si necesitas resetear la base de datos completamente:

**Desarrollo local:**
```bash
cd packages/database
npx prisma migrate reset
```

**Docker:**
```bash
docker-compose down
docker volume rm cloudcapital_db_data
docker-compose up -d
docker-compose exec backend sh -c "cd ../database && npx prisma db push"
docker-compose exec backend sh -c "cd ../database && npm run seed"
```

---

## 🎯 Recomendación

**Para Cloud Capital (plataforma de inversión real):**
- **Inicio/Pruebas**: Railway (rápido, fácil, gratis para probar)
- **Producción**: VPS (más control, datos seguros, costo fijo)

---

## 📝 Notas Importantes

1. **Seguridad**: Cambia siempre los valores por defecto de `JWT_SECRET`, `JWT_REFRESH_SECRET` y `DB_PASSWORD` en producción.

2. **Backups**: En VPS, configura backups automáticos de la base de datos:
   ```bash
   # Crear backup manual
   docker-compose exec database mysqldump -u root -p cloudcapital > backup.sql
   ```

3. **Monitoreo**: Revisa los logs regularmente:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

4. **Firewall**: En VPS, configura el firewall para permitir solo los puertos necesarios:
   ```bash
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```
