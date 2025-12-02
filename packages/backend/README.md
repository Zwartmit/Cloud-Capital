# Cloud Capital - Backend API

API REST para la plataforma Cloud Capital, construida con Node.js, Express, TypeScript y Prisma.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Type safety
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📦 Instalación

```bash
# Desde el root del monorepo
npm install

# O solo para el backend
cd packages/backend
npm install
```

## 🔧 Configuración

1. Crear archivo `.env` en el root del proyecto basado en `.env.example`
2. Configurar la URL de PostgreSQL en `DATABASE_URL`
3. Generar secretos seguros para `JWT_SECRET` y `JWT_REFRESH_SECRET`

## 🗄️ Base de Datos

```bash
# Generar Prisma Client
cd packages/database
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Abrir Prisma Studio (GUI para la DB)
npx prisma studio
```

## 🏃 Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# El servidor estará disponible en http://localhost:3000
```

## 🏗️ Build

```bash
# Compilar TypeScript a JavaScript
npm run build

# Ejecutar versión compilada
npm start
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `POST /refresh` - Refrescar access token
- `POST /logout` - Cerrar sesión

### User (`/api/user`) - Requiere autenticación

- `GET /profile` - Obtener perfil del usuario
- `PUT /profile` - Actualizar perfil
- `GET /balance` - Obtener balance
- `GET /transactions` - Historial de transacciones
- `POST /deposit` - Solicitar depósito
- `POST /withdraw` - Solicitar retiro
- `POST /reinvest` - Reinvertir ganancias

### Admin (`/api/admin`) - Requiere rol admin

- `GET /users` - Listar usuarios (paginado)
- `GET /users/search?q=query` - Buscar usuarios
- `GET /users/:id` - Obtener usuario específico
- `PUT /users/:id/balance` - Modificar balance de usuario
- `GET /tasks` - Listar tareas pendientes
- `GET /tasks/:id` - Detalle de tarea
- `PUT /tasks/:id/approve` - Aprobar tarea
- `PUT /tasks/:id/reject` - Rechazar tarea

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación:

1. Login con email y password
2. Recibir `accessToken` (15 min) y `refreshToken` (7 días)
3. Incluir `accessToken` en header: `Authorization: Bearer <token>`
4. Refrescar token cuando expire usando `/api/auth/refresh`

## 👥 Roles de Usuario

- **USER** - Usuario normal
- **SUBADMIN** - Administrador con permisos limitados (pre-aprobación)
- **SUPERADMIN** - Administrador con permisos completos

## 🔄 Flujo de Aprobación de Tareas

1. Usuario crea solicitud (depósito/retiro)
2. Tarea queda en estado `PENDING`
3. SUBADMIN aprueba → estado `PRE_APPROVED`
4. SUPERADMIN aprueba → estado `COMPLETED` + actualización de balance
5. Cualquier admin puede rechazar → estado `REJECTED`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (env vars)
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middleware (auth, roles, errors)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades (JWT, bcrypt)
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración corta (15 min)
- Refresh tokens para renovación segura
- Helmet para headers de seguridad HTTP
- CORS configurado para frontend específico
- Validación de inputs en todos los endpoints

## 🐛 Debugging

```bash
# Ver logs del servidor
npm run dev

# Inspeccionar base de datos
cd ../database
npx prisma studio
```

## 📝 Notas

- Los tipos de Prisma se generan automáticamente en `node_modules/.prisma/client`
- El servidor usa ES modules (`"type": "module"` en package.json)
- Nodemon está configurado para hot reload en desarrollo
