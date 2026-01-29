# Plan de Implementación: [T25] Subida de Fórmula Médica (Supabase Storage)

## 🎯 Objetivo
Permitir a los usuarios cargar una foto o PDF de su fórmula médica durante el checkout cuando compran medicamentos restringidos (ej: antibióticos), almacenando el archivo de forma segura y eficiente fuera de WordPress.

## 🏗️ Arquitectura Propuesta: Proxy Seguro
Para evitar exponer credenciales de Supabase en el frontend y permitir subidas de usuarios invitados ("Guest Checkout"), usaremos una arquitectura de **API Route Proxy**.

**Flujo:**
1.  **Frontend (`CheckoutForm`):** El usuario selecciona el archivo.
2.  **Upload:** El frontend envía el archivo (`FormData`) a nuestro propio endpoint `/api/upload/prescription`.
3.  **Backend Proxy (`Next.js`):**
    *   Recibe el archivo.
    *   Valida tipo (img/pdf) y tamaño (< 5MB).
    *   Usa `supabaseAdmin` (Service Role) para subir el archivo al Bucket `medical-prescriptions`.
    *   Obtiene la URL pública.
4.  **Respuesta:** Devuelve la URL pública al frontend.
5.  **Checkout:** El frontend envía esa URL junto con el pedido a WooCommerce como un metadato (`_prescription_url`).

### Ventajas
*   ✅ **Seguridad:** La `SERVICE_ROLE_KEY` nunca sale del servidor.
*   ✅ **Guest Checkout:** No requiere que el usuario tenga cuenta en Supabase.
*   ✅ **Performance:** No carga el servidor de WordPress con archivos pesados.
*   ✅ **Simple:** Desacopla la lógica de almacenamiento de la lógica de negocio.

## 📋 Pasos de Implementación

### 1. Configuración Supabase (Manual / SQL)
*   Crear Bucket `medical-prescriptions` en Storage.
*   Configurar como "Public Bucket" (para lectura fácil por admins) o "Private" con URLs firmadas (mayor privacidad). *Recomendación: Public con ruta ofuscada (uuid) por simplicidad de admin.*

### 2. Backend (API Route)
*   Crear `app/api/upload/prescription/route.ts`.
*   Implementar lógica de recepción de `FormData`.
*   Implementar subida con `supabaseAdmin.storage.from('...').upload(...)`.

### 3. Frontend (CheckoutForm)
*   Crear componente UI `PrescriptionUploader.tsx`.
*   Usar input file nativo o `react-dropzone` (opcional).
*   Mostrar preview de la imagen o nombre del PDF.
*   Estado de carga (`uploading`, `success`, `error`).

### 4. Integración WooCommerce
*   Modificar `createOrder` (en `lib/woocommerce.ts` o `actions/checkout.ts`) para aceptar el campo `prescriptionUrl`.
*   Guardar en `meta_data` del pedido:
    ```json
    {
      "key": "_prescription_url",
      "value": "https://...supabase.co/.../receta-uuid.jpg"
    }
    ```

## 🛡️ Consideraciones de Seguridad
*   **Validación de Archivos:** Solo permitir `image/jpeg`, `image/png`, `application/pdf`. Máximo 5MB.
*   **Nombres de Archivo:** Renombrar archivos con UUID para evitar colisiones y caracteres raros. `[order_ref]_[uuid].[ext]`

## ⏱️ Estimación
*   Configuración API & Supabase: 1.5h
*   Componente Frontend: 2h
*   Integración Checkout: 1h
*   **Total: ~4.5 horas**
