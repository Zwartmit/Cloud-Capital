# Frontend - Cloud Capital

Aplicación React con TypeScript, Vite y Tailwind CSS.

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📁 Estructura

```
src/
├── components/       # Componentes React
│   ├── common/      # Botones, Cards, Modals
│   ├── landing/     # Landing page components
│   ├── auth/        # Login, Register
│   ├── dashboard/   # Dashboard components
│   └── admin/       # Admin panel components
├── pages/           # Páginas principales
├── hooks/           # Custom React hooks
├── context/         # React Context (Auth, User)
├── services/        # API calls
├── utils/           # Helpers, formatters
├── types/           # TypeScript interfaces
└── styles/          # CSS global
```

## 🎨 Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (state management)
- Axios
- Lucide Icons
- Recharts

## 🔗 API

El frontend se conecta al backend en `http://localhost:3000` (configurado en vite.config.ts)
