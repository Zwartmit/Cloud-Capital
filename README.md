# Cloud Capital - Investment Platform

Una plataforma moderna de inversión que combina minería de criptomonedas con energía limpia y servicios en la nube.

## 📊 Estado del Proyecto

**Progreso General**: 60% completado

- ✅ **Fase 1**: Monorepo Setup - COMPLETADA
- ✅ **Fase 2**: Frontend Implementation - COMPLETADA
- ✅ **Fase 3**: Backend Implementation - COMPLETADA
- ⏳ **Fase 4**: Database Setup - PENDIENTE (schema listo)
- ⏳ **Fase 5**: Integration & Testing - PENDIENTE

**Último Update**: 2025-11-28

> 💡 **Nota**: El backend está completamente implementado con autenticación JWT, middleware de seguridad, y todos los endpoints necesarios. Solo falta configurar PostgreSQL y ejecutar las migraciones para tener el sistema funcionando.


## 🏗️ Arquitectura

Este proyecto utiliza una arquitectura de **monorepo** con las siguientes partes:

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
├── docs/                  # Documentación
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
git clone <repository-url>
cd cloud-capital
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Configurar la base de datos**
```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
```

5. **Iniciar en modo desarrollo**
```bash
# Desde la raíz del proyecto
npm run dev

# O individualmente:
npm run dev:frontend  # Puerto 5173
npm run dev:backend   # Puerto 3000
```

## 📦 Paquetes

### Frontend (`packages/frontend`)
Aplicación React con Vite. Incluye:
- Landing page
- Sistema de autenticación
- Dashboard de usuario
- Panel administrativo
- Gestión de planes de inversión

**Puerto**: 5173 (desarrollo)

### Backend (`packages/backend`)
API REST con Express. Incluye:
- Autenticación JWT
- Gestión de usuarios
- Transacciones
- Sistema de tareas (depósitos/retiros)
- Panel administrativo

**Puerto**: 3000 (desarrollo)

### Shared (`packages/shared`)
Tipos TypeScript compartidos entre frontend y backend.

### Database (`packages/database`)
Esquema Prisma y migraciones para PostgreSQL.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia todos los servicios
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend

# Build
npm run build            # Build de todos los paquetes
npm run build:frontend   # Build del frontend
npm run build:backend    # Build del backend

# Testing
npm run test             # Ejecuta todos los tests

# Limpieza
npm run clean            # Limpia node_modules y builds
```

## 🔐 Autenticación

El sistema implementa autenticación basada en JWT con tres roles:

- **USER**: Usuario regular (puede invertir, retirar, ver su dashboard)
- **SUBADMIN**: Administrador de nivel 1 (puede pre-aprobar depósitos)
- **SUPERADMIN**: Administrador de nivel 2 (aprobación final de depósitos)

## 📊 Base de Datos

El proyecto usa MySQL con Prisma ORM. El esquema incluye:

- **Users**: Usuarios del sistema
- **Transactions**: Historial de transacciones
- **Tasks**: Tareas pendientes (depósitos, retiros, liquidaciones)

Ver `packages/database/prisma/schema.prisma` para más detalles.

## 🌐 API Endpoints

Ver documentación completa en `docs/API.md`

**Principales endpoints:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/user/profile` - Perfil de usuario
- `GET /api/user/balance` - Balance actual
- `POST /api/user/deposit` - Solicitar depósito
- `POST /api/user/withdraw` - Solicitar retiro
- `GET /api/admin/users` - Listar usuarios (admin)
- `GET /api/admin/tasks` - Tareas pendientes (admin)

## 📝 Documentación

- [Guía de Setup](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🎨 Tecnologías Utilizadas

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (state management)
- Axios
- Lucide Icons
- Recharts

**Backend:**
- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- JWT
- bcrypt
- Zod (validation)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Cloud Capital Investment Group © 2025

## 📧 Contacto

Para soporte o consultas: support@cloudcapital.com
