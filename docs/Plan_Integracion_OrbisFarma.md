# Plan de Integración: WebService OrbisFarma (Convenios)

Este documento detalla la lógica, estructura de datos y flujo de trabajo para integrar el servicio de convenios (OrbisFarma) en el Checkout de PharmaPlus.

## 1. Análisis del Servicio (Reverse Engineering)

Basado en las pruebas realizadas al servicio `https://posdeveloper.orbisfarma.com.mx`:

### Credenciales
*   **API Key:** Se debe enviar en el **Header** (`ApiKey: 4AD42EC77114956F33B16AC27D136F85`).
*   **Ambiente:** Desarrollador (`posdeveloper`).

### Endpoints Identificados

#### A. Inicializar Transacción (`/setTransactionInit`)
*   **Propósito:** Validar el usuario/tarjeta e iniciar sesión de compra.
*   **Input:** `cardnumber` (Cédula/Tarjeta), `storeid`, `posid`.
*   **Output Clave:** `transactionid` (Token único para la sesión), `cardbalance` (Saldo/Cupo).

#### B. Cotizar Carrito (`/setTransactionQuote`)
*   **Propósito:** Enviar los productos del carrito para calcular precios especiales o cubrimiento.
*   **Input:** `transactionid`, `transactionitems` (String pipe-separated: `SKU,QTY,?,?`).
*   **Output Clave:** `transactionitems` con precios actualizados (según respuesta del WS).

#### C. Finalizar Venta (`/setTransactionSale`)
*   **Propósito:** Confirmar la compra y descontar saldo.

---

## 2. Flujo de Usuario Propuesto (Frontend)

El flujo se integrará en el **Checkout**:

1.  **Selección de Método:** El usuario selecciona "Convenio / Payroll" como medio de pago.
2.  **Validación:**
    *   Input: "Número de Identificación / Tarjeta".
    *   Botón: "Validar Convenio".
    *   *Acción:* Llama a `/setTransactionInit`.
3.  **Confirmación Visual:**
    *   Si es exitoso: Muestra ✅ "Convenio Activo" y "Saldo Disponible: $XXX".
    *   Si falla: Muestra error del WS.
4.  **Recálculo (Silent):**
    *   Al validar, se llama a `/setTransactionQuote` con los items del carrito.
    *   Si el WS devuelve precios diferentes, se actualiza el total del carrito visualmente.
5.  **Pago:**
    *   Al dar clic en "Finalizar Compra", se llama a `/setTransactionSale`.

---

## 3. Arquitectura Técnica

### A. Capa de Servicio (`lib/orbisfarma.ts`)
Crearemos un adaptador para encapsular la complejidad del SOAP/REST.

```typescript
interface TransactionResponse {
    transactionId: string;
    balance: number;
    authorized: boolean;
     // ...
}

export const orbisAuth = async (cardNumber: string): Promise<TransactionResponse> => {
    // Logic to call /setTransactionInit
}

export const orbisQuote = async (transactionId: string, items: CartItem[]) => {
    // Logic to format items to "SKU,Qty,1,1|..."
    // Logic to call /setTransactionQuote
}
```

### B. Store Global (`context/CartContext.tsx` o nuevo `AgreementContext`)
Necesitamos guardar el estado del convenio activo en la sesión del usuario para no re-validar en cada paso.

*   `agreementActive`: boolean
*   `agreementBalance`: number
*   `transactionId`: string | null

---

## 4. Preguntas para Validación (Usuario)
Antes de codificar, por favor confirmar:

1.  **Mapeo de SKUs:** ¿El SKU en WooCommerce (ej: `770200...`) es *exactamente* el mismo que espera OrbisFarma? (Crucial para que la cotización funcione).
2.  **Saldo vs Descuento:** ¿El convenio funciona como un **Medio de Pago** (descuenta de un saldo `cardbalance`) o como un **Descuento** (baja el precio de los items)?
    *   *Mi hipótesis:* Funciona como medio de pago con cupo.
3.  **Datos Fijos:** ¿Podemos dejar `storeid: 9999`, `posid: 9999` fijos en el código o deben venir de alguna configuración?

---

## 5. Próximos Pasos (Ejecución)
1.  Crear `lib/orbisfarma.ts`.
2.  Modificar Checkout para agregar la UI de Convenios.
3.  Integrar la validación y mostrar respuesta real del WS.
