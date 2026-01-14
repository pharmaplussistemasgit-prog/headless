# 🚀 Mejoras y Hoja de Ruta (Roadmap) - Fase 2

Este documento detalla las funcionalidades clave propuestas para llevar el e-commerce de PharmaPlus al siguiente nivel. Sirve como bitácora para futuras iteraciones del desarrollo.

## 1. Pastillero Virtual 2.0: Sincronización en la Nube ☁️
**Estado Actual:** *Local-First* (Los datos viven exclusivamente en el navegador del usuario).
*   **Ventaja:** Privacidad total y carga instantánea.
*   **Desventaja:** Si el usuario cambia de celular o limpia caché, pierde sus alarmas.

## 1. Pastillero Virtual 2.0: Sincronización en la Nube ☁️
**Estado Actual:** ✅ **Fase 2 Implementada (Silent Sync).**
**Arquitectura (Silent Sync):**
*   Se implementó `Silent Sync` usando Next.js API Routes como proxy.
*   **Enlace de Identidad (ID Link):** No usamos el sistema de usuarios de Supabase (`auth.users`). En su lugar, la tabla `reminders` tiene una columna `user_id` de tipo TEXTO donde guardamos **manualmente** el ID de WordPress (ej: `"wp_123"`).
*   **Seguridad:** Next.js valida el token de WordPress, extrae el ID (ej: 123) y le dice a Supabase: *"Dame los medicamentos donde user_id = '123'"*. Supabase confía en Next.js porque usa la credencial de servicio (`SERVICE_ROLE`).
*   **UX:** Sincronización transparente. Sin logins adicionales.


## 2. PWA y Notificaciones Push 📲
**Estado Actual:** ✅ **Fase 1 Implementada (Manifest).** Ya es instalable como App.
**La Propuesta (Fase 2):**
*   **Notificaciones Reales:** Integrar Service Workers para enviar alertas de medicamentos ("¡Hora de tu Loratadina!") incluso si el navegador está cerrado. Esto aumentará masivamente la retención y uso del Pastillero.

## 3. Pharma Prime: Pasarela de Pagos Recurrentes 💳
**Estado Actual:** Página informativa con botones de intención.
**La Propuesta:** Integración real de suscripciones.
*   **Tokenización de Tarjetas:** Usar Wompi o PayU para guardar la tarjeta de forma segura.
*   **Cobro Automático:** Lógica de backend para procesar el cobro mensual/anual sin intervención del usuario.
*   **Gestión de Suscripción:** Panel para cancelar o cambiar plan por el usuario.

## 4. Geolocalización Avanzada y Stock por Tienda 📍
**Estado Actual:** Detección de ciudad para UI.
**La Propuesta:**
*   **Inventario en Tiempo Real:** Conectar con el ERP para consultar stock específico de las bodegas cercanas a la ubicación detectada.
*   **Promesa de Entrega:** Mostrar "Recíbelo HOY en 2 horas" si hay stock en la tienda de su barrio, vs "Envío Nacional 2-3 días".

## 5. Buscador Inteligente con IA 🔍
**Estado Actual:** Búsqueda estándar de WooCommerce (coincidencia exacta).
**La Propuesta:**
*   **Tolerancia a errores:** Entender "icibuprofeno" como "ibuprofeno".
*   **Sinónimos:** Entender "dolor de cabeza" y mostrar analgésicos.
*   **Búsqueda por Voz:** Icono de micrófono en el buscador móvil.

---

---

## 6. Seguridad y Optimización Crítica 🛡️
Puntos vitales detectados en la auditoría técnica reciente. **Prioridad Alta**.

### A. Protección de API Keys (WooCommerce)
**Estado Actual:** Las llaves `NEXT_PUBLIC_WOOCOMMERCE_KEY` son visibles en el navegador del cliente.
**Riesgo:** Si estas llaves tienen permisos de Escritura (Read/Write), un atacante podría crear/borrar productos.
**Solución:**
1.  **Auditoría Inmediata:** Verificar en WooCommerce que las llaves usadas en el frontend sean estrictamente **"Read Only"**.
2.  **Proxy de API:** Mover cualquier operación sensible (Crear Pedido, Actualizar Usuario) a **API Routes de Next.js** (`/app/api/...`). De esta forma, las llaves secretas de escritura (`SECRET_KEY_WRITE`) nunca salen del servidor.

### B. Mantenimiento de Estilos (Tailwind CSS)
**Alerta:** Tailwind v4 está en "bleeding edge".
**Acción:**
*   Monitorear reportes de fallos visuales en navegadores antiguos (iOS antiguos, Safari Desktop).
*   En caso de incompatibilidad, considerar congelar la versión o aplicar `polyfills`.

### C. Auditoría SEO de Productos 🔎
**Estado Actual:** ✅ **OPTIMIZADO** (Enero 2026).
**Mejoras Realizadas:**
*   Se implementó `openGraph` dinámico: Ahora WhatsApp y Facebook muestran la foto del producto, el título exacto y la descripción limpia (sin HTML).
*   Se configuró `twitter:card` (implícito en la metadata extendida).
**Acción Pendiente:** Validar CTR en Search Console post-deploy.
