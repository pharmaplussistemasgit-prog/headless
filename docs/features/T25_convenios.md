# Plan de Implementación: [T25] Convenios y Cooperativas

## Contexto
PharmaPlus opera con convenios (Fondos de Empleados, Cooperativas). Los usuarios de estos convenios pueden pagar usando su cupo disponible. Esto requiere validación en tiempo real (o simulada) durante el checkout.

## Requerimientos T25
1.  **Nuevo Método de Pago:** "Convenio / Libranza" en el Checkout.
2.  **Selector de Entidad:** Dropdown con lista de convenios (ej: Febor, Coomeva, Fonvalle).
3.  **Validación:**
    *   Input: Cédula / Documento.
    *   Action: Consultar API (Mock inicial).
    *   Response: "Cupo Disponible" o "Rechazado".
4.  **Confirmación:** Si es aprobado, la orden se guarda con estado `processing` y metadatos del convenio.

## Estrategia Técnica

### 1. `lib/cooperatives.ts` (Mock Service)
Crear un servicio simulado que devuelva respuestas exitosas/fallidas basadas en reglas simples (ej: Cédulas terminadas en 9 fallan).

### 2. Modificar `CheckoutForm.tsx`
*   Agregar estado `paymentMethod` (actualmente creo que solo maneja la orden).
*   Insertar sección "Medio de Pago" visible.
*   Si selecciona "Convenio", mostrar sub-formulario de validación.

### 3. Integración con WooCommerce
*   Al crear la orden (`createOrder`), enviar:
    *   `payment_method`: 'bacs' (o 'cod' o personalizado 'convenio').
    *   `payment_method_title`: 'Convenio - FEBOR'.
    *   `meta_data`: Información de autorización.

## Archivos Afectados
*   `components/checkout/CheckoutForm.tsx`
*   `lib/orders.ts` (posiblemente para mapear el pago).
*   `[NEW] lib/cooperative-service.ts`

## Pasos
1.  Crear `lib/cooperative-service.ts`.
2.  Actualizar UI de `CheckoutForm` para incluir selector de Convenios.
3.  Implementar lógica de validación (loading, success, error).
4.  Probar flujo de orden completa.
