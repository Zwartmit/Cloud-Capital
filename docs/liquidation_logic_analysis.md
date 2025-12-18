# Análisis de Lógica de Liquidación Anticipada

Este documento detalla las opciones para manejar la liquidación anticipada de capital y sus implicaciones financieras para el negocio y el usuario.

## Estado Actual (Implementado)
Actualmente, el sistema calcula la penalidad **solo sobre el Capital Inicial**.
*   **Fórmula:** `Neto = (Capital * 0.62) + Ganancias`
*   **Implicación:** El usuario recibe sus ganancias intactas. La penalidad solo "muerde" su aporte original. Esto es muy favorable para el usuario si lleva mucho tiempo generando ganancias.

---

## Opción A: Penalidad Global (Flexible)
Se aplica el 38% de penalidad a **todo el dinero** que el usuario tenga (Capital + Ganancias).

*   **Fórmula:** `Neto = (Capital + Ganancias) * 0.62`
*   **Ejemplo:**
    *   Capital: $10,000
    *   Ganancia: $2,000
    *   Total: $12,000
    *   **Penalidad:** $4,560 (38%)
    *   **Recibe:** $7,440
*   **Ventaja:** Protege más a la empresa que el estado actual. El usuario "paga" por salir antes con parte de sus ganancias.
*   **Desventaja:** El usuario aún se lleva el 62% de sus ganancias generadas.

---

## Opción B: Penalidad Estricta (Estándar de Industria)
En contratos de plazo forzoso, romper el plazo suele implicar la **pérdida total de los rendimientos** no reclamados. La penalidad se aplica al capital para cubrir costos administrativos y operativos.

*   **Fórmula:** `Neto = (Capital * 0.62)` (Las ganancias se pierden / se quedan en la empresa).
*   **Ejemplo:**
    *   Capital: $10,000
    *   Ganancia: $2,000 (Se pierden)
    *   **Penalidad:** $3,800 (38% del Capital)
    *   **Recibe:** $6,200
*   **Ventaja:** Máxima protección para la liquidez de la empresa y desincentivo real a la salida anticipada.
*   **Desventaja:** Es la opción más agresiva para el cliente.

---

## Opción C: Penalidad sobre Capital + Retención de Ganancias (Híbrida)
Se cobra la penalidad sobre el capital y se retiene un porcentaje alto (ej. 50%) de las ganancias.

*   **Fórmula:** `Neto = (Capital * 0.62) + (Ganancias * 0.50)`

## Recomendación para el Cliente
Definir claramente: **¿El objetivo de la cláusula es solo cubrir costos administrativos (Opción A) o desincentivar fuertemente la ruptura del contrato retirando el beneficio obtenido (Opción B)?**
