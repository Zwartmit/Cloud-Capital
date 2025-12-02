# Shared - Cloud Capital

Tipos TypeScript compartidos entre frontend y backend.

## 🚀 Uso

```bash
# Build
npm run build
```

## 📦 Exports

Este paquete exporta:

- Enums: `UserRole`, `TaskStatus`, `TaskType`, `InvestmentClass`
- Interfaces: `UserDTO`, `AuthResponse`, `TransactionDTO`, `TaskDTO`
- Request types: `LoginRequest`, `RegisterRequest`, `DepositRequest`, etc.

## 💡 Ejemplo

```typescript
import { UserDTO, UserRole } from '@cloud-capital/shared';

const user: UserDTO = {
  id: '123',
  email: 'user@example.com',
  role: UserRole.USER,
  // ...
};
```
