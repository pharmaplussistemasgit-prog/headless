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
## 2. PWA y Notificaciones Push 📲 (Próximo Gran Reto)
**Estado Actual:** ✅ **Fase 1 Implementada (Manifest).** Ya es instalable como App.

**La Propuesta (Fase 3 - Service Workers):**
El objetivo es tener un canal directo al usuario sin costos de SMS/WhatsApp.
*   **El Reto Técnico (iOS):** En iPhone, Apple exige que la App esté **instalada en la pantalla de inicio** (PWA) para permitir Notificaciones Web. Además, requiere permisos explícitos del usuario.
*   **La Estrategia:**
    1.  **Service Worker:** Implementar lógica en segundo plano para manejar los eventos `push`.
    2.  **UX Inteligente con "Soft Prompt":** No pedir permiso de entrada (porque lo bloquean).
        *   Usuario entra al Pastillero -> Ve alerta: *"Activa recordatorios para no olvidar tu dosis"*.
        *   Si da clic -> Detectamos si es iOS.
        *   Si es iOS y no está instalada -> Mostramos tutorial *"Agrega a Inicio primero"*.
        *   Si ya es PWA -> Pedimos permiso del sistema.
    3.  **Beneficio:** Notificaciones precisas ("Hora de tu medicina") directo al dispositivo.

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

---

## 7. Cadena de Frío y Refinamiento UX (Enero 2026) ❄️
**Estado Actual:** ✅ **IMPLEMENTADO y VALIDADO**

### A. Sistema de Detección Centralizado (`lib/coldChain.ts`)
*   **Lógica Robusta:** Se creó una utilidad única `isColdChain` que verifica:
    *   **Categorías:** Slugs o nombres que contengan "cadena-de-frio".
    *   **Metadatos:** Claves `_cadena_de_frio` o `cadena_frio` con valores positivos (`yes`, `on`, `true`, `1`).
    *   **Palabras Clave (Fallback):** Búsqueda inteligente de términos como "insulina", "refriger", "vacuna", "never" en nombre y descripciones, soportando camelCase y snake_case.

### B. Visibilidad en UI
*   **Tarjetas de Producto:** Badge flotante "❄️ Cadena de Frío" en la esquina superior izquierda.
*   **Alertas Contextuales:** Mensaje informativo azul ("Este producto requiere cadena de frío...") ubicado estratégicamente debajo del precio en:
    *   Detalle de Producto (`ProductDetails.tsx`).
    *   Modal de Vista Rápida (`QuickAddModal.tsx`).

### C. Refinamiento Total del "Quick Add Modal"
Se transformó el modal estándar en una experiencia premium y optimizada:
*   **Visuales:**
    *   **Ancho Expandido:** `max-w-6xl` en escritorio para mayor amplitud.
    *   **Zoom de Imagen:** Efecto "Lupa" (2x) al pasar el cursor sobre la imagen, con contenedor ampliado para mayor protagonismo.
    *   **Sin Scrollbars:** Diseño `overflow-hidden` visualmente, pero navegable, eliminando barras molestas.
    *   **Sombra Suave:** Ajuste de sombras para una integración más elegante.
*   **Experiencia de Usuario (UX):**
    *   **Botón Cerrar:** Color "Pharma Blue" para visibilidad inmediata.
    *   **Layout Compacto:** Eliminación de espacios vacíos excesivos ("huecos") entre controles y botones.
    *   **Especificaciones al Pie:** Sección compacta y centrada con datos clave (Marca, Presentación, Invima, Tipo).

---

## 8. Implementación de Calculadora de Envíos Dinámica (WooSync) 🚚
**Estado Actual:** ✅ **IMPLEMENTADO y VALIDADO** (Enero 2026 - Fase 2)

El sistema de envíos ha sido completamente refactorizado para eliminar lógica "hardcodeada" y sincronizarse 100% con la configuración real de zonas de WooCommerce.

### A. Arquitectura Técnica (`lib/shipping.ts`)
*   **Servicio Centralizado:** Se creó un servicio robusto que consulta la API de WooCommerce (`/shipping/zones`) para obtener:
    *   Zonas de Envío (ej: Bogotá, Cundinamarca, Resto del País).
    *   Métodos de Envío (ej: Flat Rate, Free Shipping, Local Pickup).
    *   Costos Específicos por zona.
*   **Caché Inteligente:** Implementación de `unstable_cache` con revalidación (`revalidate: 3600`) para garantizar velocidad instantánea sin saturar el servidor de WordPress en cada recarga.
*   **Lógica de Fallback:** Si un departamento no tiene zona específica, el sistema asigna automáticamente la "Zona Default" (Resto del País), asegurando que **nunca** se bloquee una venta por falta de cobertura.

### B. Integración en Checkout (`CheckoutForm.tsx`)
*   **Adiós Hardcoding:** Se eliminaron las tarifas estáticas (ej: `$10.000` fijo) del código frontend.
*   **Cálculo en Tiempo Real:** Al seleccionar un Departamento en el formulario de pago:
    1.  El sistema busca la zona correspondiente en los datos precargados.
    2.  Extrae el costo exacto configurado en WooCommerce.
    3.  Actualiza el total del pedido antes de procesar el pago.
*   **Validación:** El botón de pago permanece deshabilitado hasta que se confirma una tarifa de envío válida.

### C. Experiencia de Usuario (UX) - Calculadora Global
Para permitir a los usuarios consultar costos sin iniciar checkout, se implementó una solución no intrusiva:
*   **Acceso Global:** Se añadió un botón **"Cotizar Envío" 🚚** en el menú principal del Header.
*   **Modal Flotante (`ShippingModal.tsx`):** Un modal elegante (animado con Framer Motion) que permite seleccionar el departamento y ver los costos inmediatamente sin abandonar la navegación actual.
*   **Limpieza Visual:** Se eliminaron elementos redundantes del Home y menús poco usados ("Mis Favoritos", "Políticas") para priorizar esta funcionalidad clave.

---

## 9. Blog Corporativo Headless y SEO de Contenidos 📰
**Estado Actual:** ✅ **IMPLEMENTADO** (Enero 2026)

Se implementó un sistema de blog completo que consume contenido directamente del WordPress existente pero lo renderiza con la velocidad y tecnología de Next.js.

### A. Arquitectura Híbrida (`lib/blog.ts`)
*   **Data Fetching:** Conexión directa a la REST API de WordPress (`/wp-json/wp/v2/posts`).
*   **ISR (Incremental Static Regeneration):**
    *   Los artículos NO se generan en cada visita (lento).
    *   NO son puramente estáticos (obsoletos).
    *   **Estrategia:** Se generan y guardan en caché por **1 hora** (`revalidate: 3600`). Si hay una noticia nueva, aparecerá automáticamente en el sitio máximo una hora después de publicada en WP.

### B. Renderizado Seguro y Estilos
*   **Tailwind Typography:** Se integró el plugin oficial `@tailwindcss/typography`. Esto permite que el HTML "crudo" que viene de WordPress (h1, p, listas, citas) se estilice automáticamente con clases `prose prose-blue` sin tener que escribir CSS manual para cada etiqueta.
*   **Sanitización:** Aunque confiamos en el contenido propio, el uso de componentes de React asegura el correcto escapado de scripts maliciosos básicos.

### C. Experiencia de Usuario (UX)
*   **Grilla Visual:** La página principal `/blog` muestra tarjetas limpias con imagen destacada, categoría "BLOG" y fecha formateada localmente.
*   **Lectura Inmersiva:** La página de detalle `/blog/[slug]` cuenta con un diseño tipo "Medium/Substack":
    *   Hero Image gigante con gradiente.
    *   Contenido centrado y legible (`max-w-3xl`).
    *   Metadatos de autor y fecha claros.
*   **Navegación:** Accesos directos integrados en Header Desktop y Menú Móvil para máxima visibilidad.

### D. SEO Automatizado
Cada artículo genera automáticamente sus etiquetas `<meta>`:
*   **Title:** Título del Post | Blog PharmaPlus.
*   **Description:** Extracto (Excerpt) limpio de HTML.

---

## 10. Sistema de Gestión de Cookies y Privacidad 🍪
**Estado Actual:** ✅ **IMPLEMENTADO** (Enero 2026)

Se desarrolló un ecosistema completo para el cumplimiento de normativas de privacidad (GDPR style) y mejora de la confianza del usuario, integrando decisiones granulares sobre el uso de datos.

### A. Arquitectura de Consentimiento (`hooks/useCookieConsent.ts`)
*   **Estado Persistente:** Las decisiones del usuario se guardan en `localStorage` con una vigencia de **6 meses**.
*   **Granularidad:** El sistema no es binario (Sí/No). Permite configurar 4 niveles:
    *   **Esenciales:** Siempre `true` (Seguridad, Sesión).
    *   **Funcionales:** Geolocalización, preferencias de UI.
    *   **Analíticas:** Google Analytics (GTM).
    *   **Marketing:** Pixeles de publicidad.

### B. Componentes de UI ("Glassmorphism")
*   **Banner No Intrusivo (`CookieBanner.tsx`):** Un panel flotante en la parte inferior con estética translúcida (Glassmorphism) que invita a la acción sin bloquear totalmente la navegación.
*   **Panel de Preferencias (`CookiePreferencesModal.tsx`):** Un modal detallado donde el usuario puede activar/desactivar cada categoría con interruptores (toggles) claros y explicaciones de "Para qué sirve cada una".

### C. Privacidad en Geolocalización
Se modificó el hook crítico `useGeolocation.ts` para respetar la privacidad por diseño:
*   **Antes:** La app pedía ubicación apenas cargaba (intrusivo).
*   **Ahora:** La geolocalización automática **SOLO** se dispara si el usuario ha aceptado explícitamente las cookies **Funcionales**.
*   **Fallback:** Si no hay consentimiento, el usuario aún puede usar la función manualmente, pero no se le rastrea silenciosamente.

### D. Transparencia Legal
*   **Nueva Página:** `/politicas/cookies`
*   **Contenido:** Tabla detallada de cookies, proveedores y duraciones.
*   **Control Total:** Botón permanente en esta página para "Re-configurar cookies" en cualquier momento.
