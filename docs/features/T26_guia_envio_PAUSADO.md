# [T26] Confirmación de Envío y Guía de Rastreo (⏸️ PAUSADO)

> [!WARNING]
> **ESTADO:** PAUSADO por orden del cliente (26 Enero).
> Este documento se conserva para referencia futura.

## 📋 Descripción del Objetivo
Habilitar a los usuarios para que puedan visualizar el **Número de Guía** y el **Enlace de Rastreo** de sus pedidos directamente desde su panel "Mis Pedidos".

El número de guía se ingresará manualmente en WooCommerce (como un campo personalizado o nota de pedido) y el frontend lo mostrará.

## 🧱 Cambios Propuestos (Pendientes)

### 1. Backend (WooCommerce Simulation / Integration)
*   **Convención:** El número de guía se almacenará en un campo meta del pedido en WooCommerce.
    *   **Key sugerida:** `_tracking_number`
    *   **Key sugerida:** `_tracking_provider` (opcional: Coordinadora, Servientrega, etc.)
*   **API:** Asegurar que el endpoint `/api/orders` (o la llamada que se use) devuelva este metadato.

### 2. Frontend (`app/mi-cuenta/pedidos`)
#### [MODIFY] [page.tsx](file:///F:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel%20-%20copia/app/mi-cuenta/pedidos/page.tsx)
*   Actualizar la interfaz `Order` para incluir `meta_data` o properties específicas `tracking_number` y `tracking_url`.
*   Mostrar un botón "Rastrear Pedido" o el número de guía si el estado es `completed` o `shipped`.

## 🧪 Plan de Pruebas
1.  **Mock Data:** Simular un pedido que retorne datos de tracking.
2.  **UI:** Verificar que aparezca el icono de Camión 🚚 y el número de guía.
