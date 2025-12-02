# Database - Cloud Capital

Esquema Prisma y migraciones para PostgreSQL.

## 🚀 Setup

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run generate

# Crear y aplicar migraciones
npm run migrate

# Abrir Prisma Studio (GUI)
npm run studio

# Seed database (opcional)
npm run seed
```

## 📊 Schema

El esquema incluye:

- **User**: Usuarios del sistema
- **Transaction**: Historial de transacciones
- **Task**: Tareas pendientes (depósitos, retiros, liquidaciones)

Ver `prisma/schema.prisma` para más detalles.

## 🔧 Migraciones

Las migraciones se crean automáticamente con:

```bash
npx prisma migrate dev --name nombre_migracion
```

## 🌐 Prisma Studio

Para explorar la base de datos visualmente:

```bash
npm run studio
```

Abre en: http://localhost:5555
