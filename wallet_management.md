# Gestión de Wallets y Flujo de Fondos - Cloud Capital

Este documento detalla la arquitectura de gestión de billeteras (wallets) para la plataforma Cloud Capital, analizando las diferentes estrategias disponibles y profundizando en el **Modelo Híbrido** seleccionado.

---

## 🏗️ Modelos de Gestión de Wallets

Existen tres enfoques principales para manejar criptomonedas en una plataforma de inversión:

### 1. Modelo Custodial (El Banco) 🏦
La plataforma tiene el control total de las claves privadas.
*   **Funcionamiento:** Se generan direcciones para los usuarios, pero los fondos se mueven a una "Hot Wallet" centralizada de la empresa y luego a una "Cold Wallet" para seguridad.
*   **Ventajas:** UX simple (el usuario no lidia con claves), transacciones instantáneas internas (off-chain), recuperación de cuentas fácil.
*   **Desventajas:** Alta responsabilidad de seguridad (honeypot para hackers), regulaciones estrictas, costo de fees si no se optimiza.

### 2. Modelo No Custodial (DeFi / Web3) 🛡️
El usuario mantiene el control total de sus fondos.
*   **Funcionamiento:** La plataforma actúa como interfaz. El usuario conecta su wallet (MetaMask, Ledger, etc.) y firma cada transacción.
*   **Ventajas:** La plataforma no custodia fondos (menor riesgo legal/seguridad), "Not your keys, not your coins".
*   **Desventajas:** UX compleja para novatos, si el usuario pierde sus claves pierde todo, difícil de implementar para lógica de inversión automática centralizada.

### 3. Modelo Híbrido (Cloud Capital) 🎯
Combina la facilidad de uso del modelo custodial para la entrada de capital con la seguridad de verificación externa.

#### ¿Por qué para Cloud Capital?
Necesitamos rastrear depósitos de usuarios específicos sin obligarlos a usar Web3 complejo, y necesitamos controlar los retiros manualmente por seguridad administrativa.

---

## ⚙️ Implementación Técnica: Modelo Híbrido

### A. Arquitectura de Cuentas

En este modelo, distinguimos tres tipos de direcciones en el sistema:

1.  **System Deposit Address (`btcDepositAddress`):** Dirección única generada por Cloud Capital para cada usuario. Sirve solo para **identificar** depósitos entrantes.
2.  **User Personal Address (`btcWithdrawAddress`):** Dirección externa del usuario (su Binance, TrustWallet, etc.) donde desea recibir sus ganancias.
3.  **Company Wallets:**
    *   **Hot Wallet:** Billetera conectada a internet para pagos automatizados o rápidos (mantenida con saldo bajo).
    *   **Cold Wallet:** Billetera offline donde se guarda el 90%+ del capital de la empresa.

### B. Flujo de Depósitos (Entrada) 📥

1.  **Generación:** Al registrarse un usuario, el sistema llama a una API (ej. BlockCypher) para generar un par de claves.
    *   *Nota:* Se guarda la Public Key en la BD. La Private Key se encripta y se guarda (o idealmente, se deriva de una HD Wallet maestra de la empresa).
2.  **Recepción:** El usuario envía BTC a su `btcDepositAddress`.
3.  **Detección:**
    *   **Automática (API):** Un webhook o cron job consulta la blockchain. Si detecta fondos en `btcDepositAddress` con `X` confirmaciones -> Crea Tarea de Depósito.
    *   **Manual (Actual):** El usuario sube el TXID. El Admin verifica en explorador y aprueba.
4.  **Consolidación:** Periódicamente, los fondos de las `btcDepositAddress` se barren (sweep) hacia la Cold Wallet de la empresa.

### C. Flujo de Retiros (Salida) 📤

1.  **Solicitud:** Usuario pide retiro en plataforma.
2.  **Validación Interna:** Backend verifica `Profit Disponible >= Monto Solicitado`.
3.  **Creación de Tarea:** Se genera una `Task` tipo `WITHDRAWAL` estado `PENDING`.
4.  **Procesamiento:**
    *   **Método:** El Admin revisa la tarea pendiente.
    *   **Ejecución:** El Admin realiza la transferencia desde la Hot Wallet de la empresa hacia la `btcWithdrawAddress` del usuario.
    *   **Confirmación:** Admin ingresa el TXID de salida en el sistema y marca la tarea como `COMPLETED`.

---

## 🛠️ Stack Tecnológico Recomendado

Para implementar la automatización de este flujo, se recomienda el siguiente stack:

### APIs de Blockchain (Proveedores)
*   **BlockCypher:** Excelente para generar direcciones y webhooks de notificación. (Plan gratuito limitado).
*   **Tatum / Moralis:** Alternativas robustas para nivel empresarial.
*   **Coinbase Commerce:** Muy fácil integración para cobrar, pero menos control sobre la wallet.

### Base de Datos (Schema Actualizado)

```prisma
model User {
  id                 String  @id @default(uuid())
  // ...
  btcDepositAddress  String? @unique // Dirección generada por el sistema para recibir
  btcWithdrawAddress String?         // Dirección personal del usuario para enviar
}

model Task {
  id            String  @id @default(uuid())
  type          TaskType // DEPOSIT_AUTO, DEPOSIT_MANUAL, WITHDRAWAL
  amountUSD     Float
  txid          String?
  btcAddress    String? // Dirección involucrada
  status        TaskStatus // PENDING, APPROVED, REJECTED
  // ...
}
```

---

## 🔐 Medidas de Seguridad Críticas

1.  **Cold Storage:** Nunca mantener grandes sumas en direcciones generadas automáticamente o Hot Wallets. Barrer fondos diariamente.
2.  **Validación Humana:** Mantener el paso de aprobación manual para retiros superiores a cierto monto (ej. > $1000).
3.  **Rate Limiting:** Evitar spam de solicitudes de direcciones o retiros.
4.  **Whitelist:** Para retiros automáticos (futuro), obligar al usuario a confirmar su dirección de retiro por email/2FA antes de usarla.
5.  **Monitoreo de Anomalías:** Alertas si una `btcDepositAddress` recibe fondos inesperados o excesivos.

---

## 📝 Resumen Operativo para Admins

| Acción | Rol Sistema | Rol Admin/Humano |
| :--- | :--- | :--- |
| **Nuevo Usuario** | Genera `btcDepositAddress` (API) | N/A |
| **Usuario Deposita** | Detecta TX en Blockchain | (Opcional) Verifica llegada de fondos si n/auto |
| **Usuario Pide Retiro** | Valida saldo, congela fondos ($), crea Tarea | Revisa destino, envía BTC, aprueba Tarea |
| **Usuario Reinvierte** | Mueve saldo Profit -> Capital (BD) | N/A (Operación interna) |

---

> **Nota:** Actualmente en Cloud Capital estamos operando en una fase manual del Modelo Híbrido, donde la detección y envío se validan manualmente contra la Blockchain, preparando el terreno para conectar las APIs de automatización en la siguiente fase.
