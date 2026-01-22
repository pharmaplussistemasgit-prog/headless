# Documentación Técnica: Nuevas Funcionalidades y Snippets (Enero 2026)

Este documento detalla técnicamente las implementaciones recientes ("Snippets") integradas al sistema Headless, explicando su función, ubicación en el código y lógica de negocio.

---

## 1. Validaciones y Lógica B2B (Snippets #05)

### Validación de Compra Mínima
**Objetivo:** Restringir compras pequeñas para clientes mayoristas o empresas.

*   **Ubicación:** `components/checkout/CheckoutForm.tsx`
*   **Lógica (`lines 97-105`):**
    *   Se define `MIN_PURCHASE_AMOUNT = 50000`.
    *   Se verifica si el usuario autenticado tiene roles `empresa` o `wholesale_customer` (usando `auth.getUser().roles`).
    *   Si el `cartTotal` es inferior al mínimo y es usuario B2B, se activa la variable `isBelowMinAmount`.
*   **Impacto UI:**
    *   Bloquea el botón "Pagar Ahora".
    *   Muestra una alerta naranja (`AlertTriangle`) en el resumen del pedido indicando el monto faltante.

---

## 2. Optimización del Checkout (Snippets #09, City Dropdown)

### Captura de Cédula (Document ID)
**Objetivo:** Cumplir con requisitos de facturación electrónica en Colombia.

*   **Ubicación:** `CheckoutForm.tsx`
*   **Implementación:**
    1.  **Frontend:** Input `documentId` que acepta solo números (`replace(/\D/g, '')`).
    2.  **Handover (Paso a Pasarela):** Al enviar los datos a WordPress (`/finalizar-compra/`), se inyectan dos parámetros clave:
        *   `documentId`: Mapeado al campo estándar.
        *   `billing_cedula`: Campo personalizado (meta field) usado por plugins de facturación locales.
        *   `billing_type_document`: Se fuerza a `'cedula'` por defecto.

### Selector de Ciudades en Cascada
**Objetivo:** Evitar errores de digitación en direcciones de envío.

*   **Ubicación:** `CheckoutForm.tsx` & `lib/colombia-data.ts`
*   **Funcionamiento:**
    *   Se utiliza un objeto constante `COLOMBIA_CITIES` donde las llaves son los códigos de departamento (ej: `'CUN'` para Cundinamarca).
    *   Al cambiar el `Select` de Departamento (`selectedState`), se resetea el campo ciudad y se cargan las opciones correspondientes del array.
    *   **Fallback:** Si el departamento no tiene ciudades precargadas, se muestra opción "Otra" o input libre (según configuración).

---

## 3. Visualización de Productos (Snippets #12, #21, #32, #33)

### Badges y Etiquetas ('OFERTA', 'Cadena de Frío')
**Objetivo:** Destacar atributos críticos del producto en el listado (`PLP`).

*   **Ubicación:** `components/product/ProductCard.tsx`
*   **Lógica:** Componente condicional absoluto (`absolute top-2 left-2`).
    *   **Snippet #12 (OFERTA):** Renderiza badge rojo animado (`animate-pulse`) si `product.isOnSale === true`.
    *   **Cadena de Frío:** Usa la utilidad `isColdChain(product)` para mostrar badge azul con ícono `Snowflake`.

### Rangos de Precio Variables ('Desde ...')
**Objetivo:** Claridad en productos con múltiples presentaciones.

*   **Ubicación:** `ProductCard.tsx` / `ProductDetails.tsx`
*   **Lógica (Snippet #33):**
    *   Si es producto variable, WooCommerce retorna `price` (mínimo) y `max_price`.
    *   El componente formatea el precio. Si hay variación significativa, visualmente se indica el precio base.
    *   Nota: En la implementación actual (`ProductCard.tsx`), se prioriza mostrar el precio activo calculado (`formatPrice(product.price)`), tachando el `regularPrice` si hay oferta.

### Acordeones de Descripción (Short Description)
**Objetivo:** Mejorar legibilidad en móviles evitando tabs complejos.

*   **Ubicación:** `components/product/ProductDetails.tsx`
*   **Implementación (Snippet #32):**
    *   Se reemplazaron los tradicionales "Tabs" horizontales por componentes `<Disclosure>` (Headless UI) o acordeones manuales.
    *   Permite expandir/colapsar secciones como "Descripción", "Ficha Técnica" sin ocultar contenido vital por defecto.

---

## 4. Lightbox de Imágenes (Snippet #17)

**Objetivo:** Permitir zoom y detalle en imágenes de producto.

*   **Ubicación:** `components/product/ProductGallery.tsx`
*   **Tecnología:** Librería `yet-another-react-lightbox` o implementación custom con Swiper.
*   **Interactividad:**
    *   Clic en imagen principal -> Abre modal *Full Screen* con fondo oscuro.
    *   Soporte para gestos (swipe) en móvil.

---

## 5. Lógica "Add to Cart" (Snippets #13, #14)

**Objetivo:** Feedback inmediato y prevención de errores de stock.

*   **Ubicación:** `AddToCartButton.tsx` y `ProductCard.tsx`
*   **Estados:**
    1.  **Loading:** Al hacer clic, el botón muestra spinner y texto "Agregando...". Se deshabilita para evitar clics dobles.
    2.  **Out of Stock:** Si `product.isInStock` es falso, el botón se renderiza gris, deshabilitado y con texto "Agotado" (`Snippet #14`).
    3.  **Éxito:** Dispara evento `toast.success` ("Producto agregado") y abre un *Mini Cart* o actualiza el contador del header.

---

## 6. Sistema de Correos Transaccionales (Emails)

### Plantilla de Confirmación (`OrderConfirmation.tsx`)
**Tecnología:** React Email + Tailwind.
**Características:**
*   **Diseño Responsivo:** Estructura de tablas HTML compatible con Outlook/Gmail.
*   **Lógica Condicional:**
    *   Detecta productos de **Cadena de Frío** iterando `line_items`.
    *   Renderiza una **Alerta Azul** (`bg-blue-50`) específica para esos ítems, advirtiendo sobre refrigeración.
*   **Cálculos Frontend:** Recalcula subtotales y descuentos visuales basados en la data cruda del webhook.

### Webhook y Envío (`api/webhooks/orders/created`)
**Flujo:**
1.  **Trigger:** WooCommerce dispara evento `order.created`.
2.  **Validación:** El endpoint verifica la firma HMAC SHA256 (`x-wc-webhook-signature`) usando `WOOCOMMERCE_WEBHOOK_SECRET` para asegurar autenticidad.
3.  **Procesamiento:**
    *   Parsea el JSON de la orden.
    *   Verifica email del cliente.
4.  **Envío (Resend):**
    *   Renderiza la plantilla `OrderConfirmation` a HTML.
    *   Envía vía API de Resend (`resend.emails.send`) al cliente.
    *   Maneja errores y retorna status `200` a WooCommerce para confirmar recepción.

---

**Autor:** Equipo de Desarrollo (Antigravity)
**Fecha:** 20 Enero 2026
