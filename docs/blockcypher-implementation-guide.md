# Guía de Implementación de BlockCypher para Cloud Capital

Esta guía documenta todo lo que se debe tener en cuenta antes de implementar BlockCypher para la gestión de wallets de Bitcoin en Cloud Capital.

---

## 🎯 ¿Qué es BlockCypher y qué hace?

BlockCypher es una **API de infraestructura blockchain** que te permite interactuar con Bitcoin (y otras cryptos) sin tener que:
- Ejecutar tu propio nodo de Bitcoin (que pesa ~500GB y requiere sincronización constante)
- Manejar la complejidad de la blockchain directamente
- Preocuparte por la infraestructura de red

---

## 📊 Límites del Plan Gratuito (CRÍTICO)

### Tier Gratuito
- **200 requests/hora** (3,000/día)
- **3 requests/segundo**
- Sin necesidad de tarjeta de crédito
- Perfecto para desarrollo y MVP

### ¿Es suficiente para Cloud Capital?
**Sí, inicialmente**, pero considera:
- Cada usuario nuevo = 1 request (generar dirección)
- Verificar un depósito = 1-2 requests
- Si tienes 100 usuarios activos verificando depósitos cada hora = problema

**Recomendación:** Empieza gratis, implementa caché agresivo, y escala a plan pagado cuando crezcas.

---

## 🔐 Consideraciones de Seguridad CRÍTICAS

### 1. **Gestión de Claves Privadas**
BlockCypher puede generar direcciones de dos formas:

#### Opción A: BlockCypher genera y guarda las claves (NO RECOMENDADO)
```javascript
// BlockCypher genera TODO
POST /v1/btc/main/addrs
// Respuesta: { "address": "1A1z...", "private": "L1aW3..." }
```
**Problema:** Si BlockCypher es hackeado o cierra, pierdes acceso a los fondos.

#### Opción B: Tú generas, BlockCypher solo monitorea (RECOMENDADO) ✅
```javascript
// Tú generas la dirección localmente con bitcoinjs-lib
// Solo le dices a BlockCypher "monitorea esta dirección"
POST /v1/btc/main/addrs?token=YOUR_TOKEN
Body: { "address": "1A1z..." }
```
**Ventaja:** Tú controlas las claves privadas, BlockCypher solo observa.

### 2. **HD Wallets (Hierarchical Deterministic)**
**Qué es:** Un "árbol" de direcciones generadas desde una semilla maestra.

**Por qué es importante:**
- Generas 1 semilla (12-24 palabras)
- De esa semilla derivas infinitas direcciones
- Si pierdes la BD, recuperas todo con la semilla

**Implementación:**
```javascript
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';

// Una vez, al inicio:
const mnemonic = bip39.generateMnemonic(); // Guarda esto en VAULT
// "abandon abandon abandon ... art"

// Para cada usuario:
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = bitcoin.bip32.fromSeed(seed);
const child = root.derivePath(`m/44'/0'/0'/0/${userId}`);
const address = bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address;
```

---

## 🏗️ Arquitectura Recomendada

### Componentes Necesarios

1. **Backend Service: `btc.service.ts`**
   - Generar direcciones (usando HD Wallet local)
   - Registrar direcciones en BlockCypher para monitoreo
   - Verificar transacciones

2. **Base de Datos**
   ```prisma
   model User {
     btcDepositAddress String? @unique
     btcAddressIndex   Int?    // Índice en HD Wallet
   }
   
   model BtcTransaction {
     id        String @id
     userId    String
     txid      String @unique
     amount    Float
     confirmations Int
     status    String // PENDING, CONFIRMED
   }
   ```

3. **Webhook Endpoint** (Opcional pero recomendado)
   ```typescript
   POST /api/webhooks/blockcypher
   // BlockCypher te notifica cuando llegan fondos
   ```

4. **Cron Job** (Alternativa si no usas webhooks)
   ```typescript
   // Cada 10 minutos, verifica depósitos pendientes
   ```

---

## 💰 Flujo de Fondos Seguro

### Entrada (Depósito)
```
Usuario → btcDepositAddress (monitoreo BlockCypher)
         ↓ (cuando se detecta)
    Hot Wallet (temporal, <$10k)
         ↓ (cada 24h o al alcanzar threshold)
    Cold Wallet (offline, 90% de fondos)
```

### Salida (Retiro)
```
Cold Wallet → Hot Wallet (manual, según necesidad)
    ↓
Hot Wallet → Dirección del Usuario (automático tras aprobación)
```

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| **BlockCypher cae** | Tener backup con Blockchain.info API |
| **Límite de requests** | Implementar caché Redis (TTL 5 min) |
| **Hackeo de Hot Wallet** | Mantener saldo bajo, usar multisig |
| **Pérdida de semilla HD** | Backup encriptado en 3 ubicaciones físicas |
| **Transacciones no confirmadas** | Esperar 3+ confirmaciones antes de acreditar |

---

## 📝 Checklist Pre-Implementación

Antes de escribir código, necesitas decidir:

- [ ] **¿Usarás HD Wallet o direcciones individuales?** (Recomiendo HD)
- [ ] **¿Dónde guardarás la semilla maestra?** (Variables de entorno + Vault)
- [ ] **¿Implementarás webhooks o cron jobs?** (Webhooks es mejor)
- [ ] **¿Cuántas confirmaciones requieres?** (Mínimo 3 para BTC)
- [ ] **¿Qué harás con las claves privadas?** (Encriptar en BD o derivar on-demand)
- [ ] **¿Testnet primero?** (SÍ, usa testnet de Bitcoin primero)

---

## 🧪 Plan de Implementación Sugerido

### Fase 1: Setup Básico (Testnet)
1. Crear cuenta en BlockCypher
2. Generar HD Wallet maestra (testnet)
3. Implementar generación de direcciones
4. Probar con Bitcoin Testnet Faucet

### Fase 2: Monitoreo
1. Implementar webhook endpoint
2. Registrar direcciones en BlockCypher
3. Probar recepción de fondos

### Fase 3: Producción
1. Migrar a Mainnet
2. Configurar Cold Wallet
3. Implementar proceso de sweep (Hot → Cold)

---

## 💡 Recomendación Final para Cloud Capital

**Configuración sugerida:**

1. **HD Wallet con bitcoinjs-lib** (tú controlas claves)
2. **BlockCypher solo para monitoreo** (no para generar claves)
3. **Webhooks** para notificaciones en tiempo real
4. **3 confirmaciones** antes de acreditar depósitos
5. **Testnet primero** durante 1-2 semanas

**Costo estimado:**
- Desarrollo: Gratis (plan gratuito BlockCypher)
- Producción (100-500 usuarios): ~$50/mes (plan Hobbyist)
- Escala (1000+ usuarios): ~$200/mes (plan Startup)

---

## 🔗 Recursos Útiles

- [BlockCypher API Docs](https://www.blockcypher.com/dev/bitcoin/)
- [bitcoinjs-lib GitHub](https://github.com/bitcoinjs/bitcoinjs-lib)
- [BIP39 Mnemonic Generator](https://github.com/bitcoinjs/bip39)
- [Bitcoin Testnet Faucet](https://testnet-faucet.mempool.co/)

---

## 📌 Estado Actual del Proyecto

**Implementado:**
- ✅ Schema de base de datos con campos `btcDepositAddress` y `btcWithdrawAddress`
- ✅ Modales frontend para depósitos, retiros y reinversión
- ✅ Endpoints backend básicos (manual)
- ✅ Sistema de Tasks para aprobación de admin

**Pendiente:**
- ⏳ Integración con BlockCypher
- ⏳ Generación automática de direcciones BTC
- ⏳ Monitoreo de transacciones en blockchain
- ⏳ Webhooks para notificaciones en tiempo real

---

## 🚀 Próximos Pasos

1. Decidir entre Testnet o Mainnet para inicio
2. Crear cuenta en BlockCypher
3. Instalar dependencias: `bip39`, `bitcoinjs-lib`
4. Implementar `btc.service.ts`
5. Configurar variables de entorno para semilla HD
6. Probar generación de direcciones
7. Implementar webhook endpoint
8. Testing exhaustivo en Testnet

---

> **Nota:** Este documento debe actualizarse conforme se implementen las funcionalidades descritas.
