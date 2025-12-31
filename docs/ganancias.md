# Modelo de Ganancias y Referidos

## 1. Definiciones Iniciales

- Se toman estos dos usuarios como ejemplo: **Usuario A** y **Usuario B**.

---

## 2. Caso de Uso 1

### 2.1 Parte 1: Registro, Primer Aporte y Suscripción (Usuario A)

#### 2.1.1 Registro sin aporte

- Si un usuario se registra y **no realiza ningún aporte**, **no genera ganancias**.

#### 2.1.2 Primer aporte sin suscripción

- Cuando el Usuario A realiza su **primer aporte** (ejemplo: `$50`):

  - Obtiene una ganancia del **3% mensual** sobre ese monto.
  - El 3% mensual se distribuye diariamente durante 30 días:
    - **0.1% diario**
    - Ejemplo:
      - 0.1% diario de $50 = `$0.05`
      - Ganancia mensual total = `$1.50`
- Este beneficio:

  - Se mantiene **únicamente mientras el usuario no esté suscrito a ningún plan**.
  - Funciona como una **estrategia de marketing y fidelización**.

#### 2.1.3 Suscripción a un plan

- Al suscribirse a un plan:

  - El usuario **deja de ganar el 3% mensual**.
  - Comienza a ganar el **porcentaje definido por el plan** seleccionado.
- Si la suscripción ocurre antes de completar el mes:

  - La ganancia diaria del 3% se **detiene inmediatamente**.
  - El nuevo porcentaje se aplica desde el momento de la suscripción.

**Ejemplo:**

- Aporte inicial: `$50`
- Días ganando 0.1% diario: `15`
- Ganancia acumulada: `$0.75`
- Día 16: suscripción a un plan
- Desde ese día, la ganancia se calcula según el plan contratado.

---

### 2.2 Parte 2: Sistema de Referidos (Usuario A → Usuario B)

#### 2.2.1 Registro y aporte del Usuario B

- El Usuario A refiere al Usuario B.
- El Usuario B realiza su **primer aporte** (ejemplo: `$100`).

#### 2.2.2 Ganancias del Usuario B

- El Usuario B obtiene:
  - **3% mensual**.
  - Equivalente a **0.1% diario** sobre su aporte.

#### 2.2.3 Bonificación para el Usuario A

- El Usuario A recibe:
  - **10% del primer aporte del Usuario B**.
  - Ejemplo: `$10` (10% de $100).

#### 2.2.4 Cambio de porcentaje para el Usuario A

- Tras el referido exitoso:
  - El Usuario A **deja de ganar el 3% mensual**.
  - Comienza a ganar **6% mensual** sobre su capital.
  - Equivale a **0.2% diario**.

#### 2.2.5 Destino del bono de referido

- Si el Usuario A **ya tenía capital invertido**:
  - El bono se suma al **profit**.
- Si el Usuario A **no tenía capital invertido**:
  - El bono se suma al **capital base**.

---

### 2.3 Parte 3: Aportes Adicionales

- Cuando un usuario realiza **nuevos aportes**, el porcentaje de ganancia vigente:
  - 3%, 6% o el del plan activo
  - Se aplica sobre el **total acumulado de capital**, no solo sobre el primer aporte.

**Ejemplo (Usuario A):**

- Primer aporte: `$50`
- Segundo aporte: `$80`
- Capital total: `$130`
- El porcentaje de ganancia se calcula sobre `$130`.
