# Sistema de Checkout, Pagos y Fórmulas Médicas - PharmaPlus

Este documento detalla la implementación técnica y funcional del sistema de checkout, incluyendo las pasarelas de pago (Wompi, Credibanco), el módulo de convenios empresariales y el sistema de validación de fórmulas médicas con almacenamiento en la nube.

---

## 1. Formulario de Checkout (`CheckoutForm.tsx`)

El formulario de checkout ha sido rediseñado para ser una SPA (Single Page Application) fluida, validando paso a paso la información del usuario antes de permitir el pago.

### Características Principales:
*   **Validación en Tiempo Real**: El botón de pago se mantiene deshabilitado hasta que todos los campos requeridos (Departamento, Ciudad, Dirección, Documento, Celular) estén completos y válidos.
*   **Detección de Cobertura**: Se calcula el costo de envío automáticamente al seleccionar ciudad y departamento. Si no hay cobertura, se bloquea el proceso.
*   **Restricciones de Negocio**:
    *   **Monto Mínimo**: Para clientes mayoristas (rol `empresa`), se exige un monto mínimo de compra (configurado en $50.000).
    *   **Días Festivos/Domingos**: El selector de fecha de entrega bloquea automáticamente los días no laborales.
*   **Políticas Legales**: Casillas de verificación obligatorias para "Términos y Condiciones" y "Política de Tratamiento de Datos".

---

## 2. Pasarelas de Pago Implementadas

### A. Wompi (Bancolombia)
*   **Tipo**: Redirección / Botón de Pago.
*   **Métodos**: Tarjetas de Crédito, Débito (PSE), Nequi, Bancolombia Botón.
*   **Flujo**:
    1.  El usuario completa sus datos.
    2.  Se genera una referencia única de pago (`PP-[Timestamp]-[Documento]`).
    3.  El Widget de Wompi se abre.
    4.  Al finalizar, Wompi retorna el estado de la transacción.
    5.  Si es `APPROVED`, el sistema crea la orden en WooCommerce vía API (`/api/checkout/process-payment`).

### B. Credibanco (Nuevo)
*   **Tipo**: Redirección Segura.
*   **Métodos**: Tarjetas de Crédito y Débito.
*   **Flujo**:
    1.  El sistema crea primero una orden en estado "Pendiente de Pago" en WooCommerce (`/api/checkout/create-pending-order`).
    2.  Con el ID de la orden se solicita un link de pago a la API de Credibanco (`/api/checkout/credibanco`).
    3.  El usuario es redirigido a la pasarela segura de Credibanco.
    4.  Al finalizar, Credibanco notifica al webhook (configurado en el panel) y redirige al usuario a la tienda.

---

## 3. Sistema de Convenios (OrbisFarma / Inicio TX)

Permite a empleados de empresas aliadas pagar utilizando su cupo rotativo o de nómina.

### Funcionalidad:
1.  **Detección**: Un botón "Pagar con Convenio" abre un modal especializado.
2.  **Selección de Proveedor**: Soportamos `Coopmsd` e `Inicio TX`.
3.  **Validación de Cupo (API Externa)**:
    *   Se consulta en tiempo real al endpoint del proveedor de convenios.
    *   Se envía cédula y monto.
    *   Si es aprobado, se recibe un `transactionId` y un código de autorización.
4.  **Confirmación**:
    *   El usuario ve un mensaje de "Cupo Autorizado".
    *   Al confirmar el pedido, este se crea en WooCommerce con el metadato del `transactionId` y el estado del convenio, permitiendo la conciliación posterior.

---

## 4. Sistema de Fórmulas Médicas (Prescription System)

Implementado para cumplir con la normativa de venta de antibióticos y medicamentos controlados.

### A. Detección Inteligente
El sistema determina automáticamente si un producto requiere receta basándose en tres criterios (Lógica en `lib/mappers.ts`):
1.  **Metadatos**: Si el producto tiene el flag `_needs_rx` en WooCommerce.
2.  **Categoría**: Si pertenece a categorías como "Antibióticos", "Medicamentos Controlados".
3.  **Análisis de Nombre (Principios Activos)**:
    *   Detecta palabras clave: *Amoxicilina, Clindamicina, Tramadol, Codeína, Sildenafil, Isotretinoína, etc.*
    *   Esto asegura que incluso si el producto no está bien configurado en el ERP, el frontend capture la restricción.
    *   **IMPORTANTE**: Si el carrito contiene AL MENOS UN producto restringido, se bloquea todo el checkout.

### B. Carga de Archivos (Upload)
*   **Interfaz**: Componente `PrescriptionUploader.tsx`. Diseño minimalista en tonos esmeralda (verde salud).
*   **Validación**: Solo admite imágenes (JPG, PNG) y PDF, con un peso máximo de 5MB.
*   **Seguridad**: El usuario NO puede finalizar la compra sin subir el archivo. Se eliminó la opción de "Declaración Juramentada" para mayor seguridad legal.

### C. Almacenamiento (Supabase Storage)
No se almacenan archivos en el servidor frontend (Vercel) para evitar saturación y mantener la arquitectura "Stateless".
1.  El archivo se envía a `/api/upload/prescription`.
2.  El backend lo sube a un bucket privado en **Supabase**.
3.  Supabase retorna una **URL Pública/Firmada**.
4.  Esta URL se adjunta a la orden de WooCommerce en los metadatos:
    *   `_cl_rx_attachment_url`: Link al archivo.
    *   `_cl_rx_missing`: Flag de control (0 si se adjuntó, 1 si falta).

---

## 5. Ubicación del Código Clave

| Módulo | Archivos Principales | Descripción |
| :--- | :--- | :--- |
| **Frontend Checkout** | `components/checkout/CheckoutForm.tsx` | Lógica principal, estados y validaciones. |
| **Upload Component** | `components/checkout/PrescriptionUploader.tsx` | UI de carga y validación de tipos de archivo. |
| **API Upload** | `app/api/upload/prescription/route.ts` | Endpoint que conecta con Supabase. |
| **API Pagos** | `app/api/checkout/process-payment/route.ts` | Creación de orden final en Woo. |
| **Lógica Productos** | `lib/mappers.ts`, `lib/product-logic.ts` | Detección de keywords y reglas de negocio. |
| **Contexto** | `context/CartContext.tsx` | Manejo global del estado `requiresPrescription`. |
