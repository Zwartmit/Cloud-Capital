# Cloud Capital - Plataforma de Inversión

Plataforma moderna de inversión en criptomonedas.

## 📊 Estado del Proyecto

**Progreso General**: 85% completado

- ✅ **Fase 1**: Monorepo Setup - COMPLETADA
- ✅ **Fase 2**: Frontend Implementation - EN PROGRESO
- ✅ **Fase 3**: Backend Implementation - EN PROGRESO
- ✅ **Fase 4**: Database Setup (MySQL) - EN PROGRESO
- ⏳ **Fase 5**: Integration & Testing - EN PROGRESO

**Último Update**: 2025-12-01

> 💡 **Nota**: El sistema está funcional con autenticación (Email/Usuario), gestión de planes de inversión, dashboard de usuario y panel administrativo.

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
Aplicación React con Vite.
- **Landing Page**: Diseño moderno con FAQ y planes dinámicos.
- **Autenticación**: Login (Email/Usuario), Registro con referidos, Recuperación de contraseña.
- **Dashboard**: Vista general de balance, gráficas y estado de cuenta.
- **Planes de Inversión**: Visualización y gestión de planes (Admin).
- **Perfil**: Gestión de datos de usuario.
- **Admin Panel**: Gestión de usuarios y aprobación de tareas.

**Puerto**: 5173 (desarrollo)

### Backend (`packages/backend`)
API REST con Express.
- **Autenticación**: JWT (Access + Refresh Tokens), bcrypt.
- **Usuarios**: CRUD, sistema de referidos.
- **Inversiones**: Lógica de planes y rendimientos.
- **Transacciones**: Depósitos, retiros, reinversiones.
- **Email**: Notificaciones (Bienvenida, Reset Password).

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
