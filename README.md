# Cloud Capital - Plataforma de Inversión

Plataforma moderna de inversión en criptomonedas.

## 📊 Estado del Proyecto

**Progreso General**: 92% completado

- ✅ **Fase 1**: Monorepo Setup - COMPLETADA
- ✅ **Fase 2**: Frontend Implementation - COMPLETADA
- ✅ **Fase 3**: Backend Implementation - COMPLETADA
- ✅ **Fase 4**: Database Setup (MySQL) - COMPLETADA
- ⏳ **Fase 5**: Configuration, Integration, Testing & Deployment - EN PROGRESO

**Último Update**: 2025-12-09

> 💡 **Nota**: El sistema está funcional con autenticación completa, gestión de planes de inversión, dashboard interactivo, panel administrativo avanzado, sistema de depósitos/retiros/reinversión con BTC, y gestión de colaboradores.

## 🏗️ Arquitectura

Este proyecto utiliza una arquitectura de monorepo con las siguientes partes:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: MySQL
- **Shared**: Tipos y utilidades compartidas

## 📁 Estructura del Proyecto

```
cloud-capital/
├── packages/
│   ├── frontend/          # Aplicación React
│   ├── backend/           # API REST con Express
│   ├── shared/            # Tipos compartidos
│   └── database/          # Prisma schema y migraciones
├── .env.example           # Variables de entorno ejemplo
├── package.json           # Root package.json con workspaces
└── README.md              # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- MySQL 8+
- npm 9+

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Zwartmit/Cloud-Capital.git
```

2. **Instalar dependencias**
```bash
# Ejecutar desde la raíz del proyecto:
npm install
```

3. **Configurar variables de entorno**
```bash
# Ejecutar desde la raíz del proyecto:

# Backend
cp .env.example packages/backend/.env
# Editar .env con las credenciales de la base de datos

# Frontend
cp packages/frontend/.env.example packages/frontend/.env

# Database
cp .env.example packages/database/.env
```

4. **Configurar la base de datos**
```bash
cd packages\database
npx prisma migrate dev #Si pide nombre, poner "cloud"
npx prisma generate

# Inicializar datos de prueba:
npm run seed
```

5. **Iniciar en modo desarrollo**
```bash
# Abrir dos terminales desde la carpeta raiz y ejecutar:

# Frontend
npm run dev:frontend  # Puerto 5173

# Backend
npm run dev:backend   # Puerto 3000
```

## 📦 Paquetes y Funcionalidades

### Frontend (`packages/frontend`)
Aplicación React con Vite y diseño responsive moderno.
- **Landing Page**: Diseño moderno con FAQ y planes dinámicos.
- **Autenticación**: Login (Email/Usuario), Registro con referidos, Recuperación de contraseña.
- **Dashboard Interactivo**: 
  - Vista general de balance con gráficas animadas (Recharts)
  - Modales de gestión: Depósitos, Retiros, Reinversión, Proyecciones
  - Integración con direcciones BTC para operaciones
  - Sistema de colaboradores para retiros mediados
- **Planes de Inversión**: Visualización y gestión de planes (Admin).
- **Perfil**: Gestión completa de datos de usuario y cambio de contraseña.
- **Admin Panel Avanzado**: 
  - Gestión de usuarios con perfiles detallados
  - Administración de planes de inversión
  - Sistema de aprobación de tareas (depósitos/retiros)
  - Gestión de ganancias (`ProfitManager`)
  - UI optimizada para mobile y tablet

**Puerto**: 5173 (desarrollo)

### Backend (`packages/backend`)
API REST con Express y TypeScript.
- **Autenticación**: JWT (Access + Refresh Tokens), bcrypt, roles (USER/SUBADMIN/SUPERADMIN).
- **Usuarios**: CRUD completo, sistema de referidos, gestión de perfiles.
- **Inversiones**: Lógica de planes y rendimientos, proyecciones automáticas.
- **Transacciones**: Depósitos (auto/manual), retiros (directo BTC/colaborador), reinversiones.
- **Colaboradores**: Sistema de colaboradores para operaciones mediadas.
- **Tareas**: Cola de aprobación para operaciones administrativas.
- **Email**: Notificaciones (Bienvenida, Reset Password, Confirmaciones).

**Puerto**: 3000 (desarrollo)

### Shared (`packages/shared`)
Tipos TypeScript compartidos entre frontend y backend para garantizar consistencia de datos.

### Database (`packages/database`)
Esquema Prisma y migraciones para MySQL.
- **Modelos**: User, Transaction, Task, InvestmentPlan.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend

# Build
npm run build:frontend   # Build del frontend
npm run build:backend    # Build del backend
```

## 🐳 Despliegue con Docker

El proyecto está completamente dockerizado para facilitar el desarrollo y despliegue.

### Desarrollo con Docker Compose
Para levantar todo el entorno (Frontend + Backend + MySQL + phpMyAdmin) ejecutar:

```bash
docker-compose up --build
```

Esto iniciará:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Base de datos**: Puerto 3306

### Inicialización de Base de Datos (Primera vez o nuevo dispositivo)

Si es la primera vez que inicia el proyecto o si está en un dispositivo nuevo (donde el volumen de la base de datos está vacío), debe crear las tablas y poblar los datos:

1. **Crear esquema de base de datos** (usa `db push` para sincronizar directamente el esquema):
```bash
docker-compose exec backend npx prisma db push --schema=../database/prisma/schema.prisma
```

2. **Poblar datos de prueba (Seed)**:
```bash
docker-compose exec backend npm run seed -w @cloud-capital/database
```

### Acceso a Base de Datos

El proyecto incluye **phpMyAdmin** para gestionar la base de datos visualmente.

- **URL**: http://localhost:8080
- **Servidor**: `database`
- **Usuario**: `root`
- **Contraseña**: `admin` (verificar en `docker-compose.yml`)
- **Base de datos**: `cloudcapital`

### Configuración de Producción
El archivo `docker-compose.yml` está listo para ser usado en plataformas como Railway, Render o cualquier VPS con Docker.

Asegúrate de configurar las variables de entorno en tu plataforma de despliegue o en un archivo `.env` seguro.


## 🔐 Autenticación y Roles

El sistema implementa autenticación basada en JWT con tres roles:

- **USER**: Usuario regular. Puede invertir, ver su dashboard y gestionar su perfil.
- **SUBADMIN**: Administrador de nivel 1. Puede ver usuarios y pre-aprobar tareas.
- **SUPERADMIN**: Administrador total. Gestión de planes, aprobación final de depósitos/retiros y gestión de admins.

## 📊 Base de Datos

El proyecto usa **MySQL** con Prisma ORM.
- **Users**: Información de cuenta, balances, referidos.
- **InvestmentPlans**: Configuración dinámica de planes de inversión.
- **Transactions**: Historial financiero.
- **Tasks**: Cola de tareas para operaciones manuales (depósitos/retiros).

## 🎨 Tecnologías Utilizadas

**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS (Estilos)
- Zustand (Estado global)
- Axios (HTTP Client)
- Lucide Icons (Iconos)
- Recharts (Gráficos)

**Backend:**
- Node.js, Express
- TypeScript
- Prisma ORM (MySQL)
- JWT (Auth)
- Nodemailer (Emails)
