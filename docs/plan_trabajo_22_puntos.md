# Plan de Trabajo: Implementación de 22 Tareas Pendientes

## 📋 Resumen Ejecutivo
Este documento analiza y estructura las tareas reportadas en el archivo `tareas-pendientes22-1-26.csv`. Se han incluido estimaciones de tiempo y requerimientos específicos.

**Tiempo Total Estimado:** ~50 Horas de Desarrollo

---

## 🏗️ 1. Contenido Institucional y Políticas (Static Pages)
*Tareas relacionadas con información estática, legal y de contacto.*

| ID | Tarea | Tiempo Est. | Requerimientos (Lo que falta) | Estado / Ref |
|----|-------|-------------|-------------------------------|--------------|
| T1 | **Quiénes Somos / Política de Calidad** | 1 hora | Texto actualizado de Política de Calidad (doc o link). | [x] **Implementado** (Ver Detalle) |
| T2 | **Trabaje con Nosotros / Contacto** | 2 horas | - | [x] **Implementado** (Ver Detalle) |
| T3 | **Horarios y Dirección** | 0.5 horas | - | [x] **Implementado** (Ver Header/Footer) |
| T4 | **Ver Mapa de Ubicaciones** | 2 horas | Coordenadas exactas Lat/Long de la tienda y horario preciso. | [x] **Implementado** (Ver Detalle) |
| T6 | **Propuesta de Valor (Iconos)** | 1 hora | Archivos SVG o PNG de los iconos usados en tienda anterior. | [x] **Implementado** (Ver Detalle) |
| T7 | **Garantías y Devoluciones** | 1 hora | Texto específico sobre exclusión de cadena de frío. | [x] **Implementado** (Ver Detalle) |
| T8 | **Políticas (Formulario central)** | 2 horas | Texto unificado de políticas. | [x] **Implementado** (Ver Detalle) |
| T9 | **Política de Cookies** | 1 hora | Documento de política de cookies (PDF o texto). | [x] **Implementado** (Ver Detalle) |
| T10 | **Términos y Condiciones** | 1 hora | Documento actualizado de T&C. | [x] **Implementado** (Ver Detalle) |
| T12 | **Reversión de Pago** | 1 hora | Procedimiento/texto legal de reversión. | [x] **Implementado** (Ver Detalle) |
| T13 | **PQRS** | 2 horas | Formato deseado de PQRS (campos específicos) y correo destino confirmado. | [x] **Implementado** (Ver Detalle) |
| T17 | **Tiendas (Página y Plantilla)** | 1.5 horas | Foto de la fachada de la tienda (opcional pero recomendado). | [x] **Implementado** (Ver Detalle) |
| 🔴 **T27** | **Blog (Carga laboratorios)** | 4 horas | - | [x] **Estrategia Definida** (Aqui el laboratorio se conecta desde el wp-admin) |

### 🛠️ Detalle de Implementación Técnica (Fase 1)

#### [T2 & T13] Formularios de Contacto y PQRS
**Estado Actual:** Frontend completado (UI/UX) con validaciones y simulación de envío.
**Backend:** Usa Resend + React Email.

#### [T27] Blog (Carga Laboratorios)
**Estrategia:** CMS Headless (WordPress).
**Estado:** `lib/blog.ts` ya conecta con la API REST de WP.

#### [T10 & T12] Términos y Condiciones
**Estado:** Completado en `TermsText.tsx` (Texto HTML) + PDF descargable.

#### [T1] Quiénes Somos / Política de Calidad
**Estado:** Implementado en `/nosotros`.

#### [T7, T8, T9] Políticas y Legales
**Estado:** Implementado (Gestión Centralizada en `lib/policies.ts` y `/politicas`).

#### [T17 & T4] Página de Tiendas y Mapa
**Estado:** Completamente Implementado en `app/tiendas/page.tsx`.
**Detalle de Implementación:**
*   **Gestión de Datos:** Archivo `lib/stores-data.ts`.
*   **Interfaz:** Lista lateral + Google Maps Embed.
*   **Responsive:** Adaptable móvil/desktop.

#### [T6] Propuesta de Valor
**Estado:** Implementado en `components/home/ValueProposition.tsx`.

---

## 👤 2. Usuario y Gestión de Cuenta
*Tareas relacionadas con el registro, login y perfil del usuario.*

| ID | Tarea | Tiempo Est. | Requerimientos (Lo que falta) | Estado / Ref |
|----|-------|-------------|-------------------------------|--------------|
| T14 | **Registro Completo** | 3 horas | Confirmar si fecha de nacimiento es obligatoria. | [ ] Pendiente (se necesita una validación de email) |
| T15 | **Configuración de Cuenta** | 3 horas | - | [ ] Pendiente |
| 🔴 **T20** | **Pastillero Virtual (SMS)** | 6 horas | Proveedor de SMS (Twilio, AWS, etc.) y credenciales API. | [ ] **Pendiente** (Se necesita SMS configurado Twilio) |

**Total Fase 2: ~12 Horas**

---

## 🛒 3. Catálogo y Productos
*Mejoras en la visualización, búsqueda y promoción de productos.*

| ID | Tarea | Tiempo Est. | Requerimientos (Lo que falta) | Estado / Ref |
|----|-------|-------------|-------------------------------|--------------|
| T16 | **Iconos de Categorías (Home)** | 1 hora | Integrar iconos visuales en Home. | [x] **Implementado** (Ver Detalle) |
| T18 | **Optimización Menú Categorías** | 2 horas | - | [x] **Implementado** (Se maneja inteligentemente por productos) |
| 🔴 **T19** | **Mundo Ofertas (Reglas complejas)** | 6 horas | Matriz de ejemplos de promociones (ej: "Pague 2 Lleve 3 en marca X"). | [x] **Implementado** (Motor Promociones) |
| T21 | **Comprar por Marca (Slider)** | 3 horas | Logos de laboratorios (SVG/PNG). | [x] **Implementado** (Pendiente nombres de marcas y laboratorios) |
| T22 | **Stock en PDP y Popup Agotado** | 2 horas | - | [x] **Implementado** (Ver Detalle) |

### 🛠️ Detalle de Implementación Técnica (Fase 3 - Catálogo)

#### [T6] Propuesta de Valor (Actualización Visual)
**Estado:** ✅ Implementado
**Recursos:** Se usaron los 5 PNGs oficiales de `tienda.pharmaplus.com.co`.
**Detalle:** `components/home/ValueProposition.tsx` usa el componente `<Image/>` renderizando directamente desde las URLs externas propietarias.

#### [T21] Comprar por Marca (Carrusel y Destacados)
**Estado:** ✅ Implementado (Parcialmente)
**Detalle de lo realizado:**
*   **Gestión de Datos:** Se creó `lib/brands-data.ts` como fuente única de verdad para las marcas.
*   **Sección Home "Productos Destacados":** Implementada con estética de "Ad Banner" (diagonal, badges, CTA).
*   **Sección Home "Laboratorios Aliados":** Refactorizada a diseño minimalista limpio (fondo blanco, sin bordes pesados).
*   **Página `/laboratorios`:** Nueva página dedicada con grilla de 4 columnas para máxima visibilidad de logos.
*   **Navegación:** Se eliminó el Megamenu del header (feedback visual) y se enlazó desde el Home a la página dedicada.

**🔴 Pendientes Críticos (T21):**
1.  **Identificación de Logos:** Los archivos tienen nombres genéricos (`los-lab-XX.jpg`). Se requiere mapeo visual a nombres reales (Ej: Bayer, MK).
2.  **Mapeo de Productos:** Asegurar que cada marca enlace a una URL que filtre correctamente sus productos (actualmente búsqueda genérica).

#### [T22] Stock en Producto (PDP)
**Estado:** Implementado en `ProductDetails.tsx`.
**Detalle:**
*   Se agregó lógica visual debajo del precio.
*   **Rojo:** Agotado (`!isInStock`).
*   **Ámbar:** Advertencia de stock bajo (`stock <= 5`).
*   **Verde:** Disponible (`stock > 5` o indefinido).

**Total Fase 3: ~14 Horas**

---

## 💳 4. Checkout y Logística
*Proceso de compra, envíos y pagos.*

| ID | Tarea | Tiempo Est. | Requerimientos (Lo que falta) | Estado / Ref |
|----|-------|-------------|-------------------------------|--------------|
| T23 | **Cadena de Frío (Nevera)** | 3 horas | Imagen de la nevera (opcional) o icono. | [x] **Implementado** (Ver Detalle) |
| T24 | **Retiro en Tienda (Bogotá)** | 2 horas | Dirección exacta para retiro. | [x] **Implementado** (Ver Detalle) |
| ⚠️ **T25** | ~~**Checkout: Convenios**~~ | N/A | Eliminado por solicitud del cliente. | [x] **Eliminado** |
| T25 | **Checkout: Programar Entrega** | 2 horas | Reglas de días no laborales (festivos). | [ ] **Pendiente** (Funcionalidad de desarrollo) |
| T25 | **Checkout: Fórmula Médica** | 4 horas | Listado de categorías/productos que exigen fórmula. | [ ] **Pendiente** (Funcionalidad de desarrollo) |
| T26 | **Confirmación Envío (Guía)** | 2 horas | ¿Cómo se obtiene el # guía? (Manual o integración Coord/Servientrega). | [ ] Pendiente (Sujeto a WooCommerce/Manual) |
| T11 | **Cotizar Envío** | 0 horas | - | [x] **Implementado** (Ver Detalle) |

### 🛠️ Detalle de Implementación Técnica (Fase 4 - Adelantada)
*(Nota: Esta tarea pertenece a la Fase 4 pero fue priorizada y completada)*

#### [T11] Cotizar Envío y Fletes
**Estado Actual:** Implementado.
**Detalle:** Base de datos 1,096 ciudades, cálculo por zona, corrección de UI.

#### [T24] Retiro en Tienda (Pickup Store)
**Estado:** Implementado en `CheckoutForm.tsx`.
**Lógica:**
*   Se activa automáticamente el selector de envío vs retiro cuando la ubicación es Bogotá o Cundinamarca/Bogotá.
*   En modo "Retiro", el costo se vuelve $0, la dirección se fija a la sede principal y se envía `shipping_method: local_pickup` al sistema.
*   En modo "Domicilio", funciona la cotización normal de Coordinadora/Servientrega.

#### [T23] Cadena de Frío (Fees automáticos)
**Estado:** Implementado.
**Lógica Implementada:**
*   Se creó `lib/product-logic.ts` para detectar automáticamente keywords como "insulina", "vacuna", "refriger".
*   `CartContext` calcula si hay al menos un items refrigerado y suma `$6.500` automáticamente al total del carrito.
*   En el `CheckoutForm`, se muestra el rubro "Nevera + Gel" separado del subtotal de productos, y se envía como `fee_name` y `fee_amount` al backend para que aparezca en la orden.

#### [T25] Checkout: Programación, Fórmula y Convenios (Completo)
**Estado:** Implementado en `CheckoutForm.tsx` y `lib/cooperatives.ts`.
**Detalle:**
*   **Convenios (🔴 Complejo):** Se implementó `CheckoutForm.tsx` con lógica condicional para mostrar formulario de validación de cupo (Simulado) al seleccionar "Convenio Cooperativa".
*   **Programación:** Se agregó un campo `date` nativo que permite elegir fecha de entrega preferida.
*   **Fórmula:** Se detectan productos sensibles (Antibióticos) mediante `product-logic.ts`.
*   **Validación:** El sistema bloquea la compra si hay antibióticos y no se acepta la declaración de tener fórmula, o si es un convenio y no se valida el cupo.

#### [T25] Subida de Fórmula (Implementado)
**Estado:** ✅ Implementado
**Componentes Creados:**
*   **Backend:** `app/api/upload/prescription/route.ts` - Proxy seguro que recibe el archivo y lo sube a Supabase Storage usando Service Role (sin exponer llaves al cliente). Valida tipo (PDF/Img) y peso (5MB).
*   **Frontend:** `components/checkout/PrescriptionUploader.tsx` - Interfaz Drag & Drop con previsualización y manejo de estados de carga.
*   **Integración:** En `CheckoutForm.tsx`, se conecta el uploader y se envía la URL resultante (`_prescription_url`) en los metadatos del pedido a WooCommerce.

---

## 🎨 5. Interfaz General (UI/UX)
*Detalles visuales y usabilidad.*

| ID | Tarea | Tiempo Est. | Requerimientos (Lo que falta) | Estado / Ref |
|----|-------|-------------|-------------------------------|--------------|
| T5 | **Preferencias Cookies (UI)** | 1 hora | - | [x] **Implementado** (Ver Detalle) |
| T28 | **Botón Whatsapp** | 0.5 horas | Número de Whatsapp celular. | [x] **Implementado** (Ver Detalle) |
| UI | **Iconos Medios de Pago** | 0.5 horas | Visa oficial & Badge Convenios. | [x] **Implementado** (Ver Detalle en Footer) |

**Total Fase 5: ~2 Horas**

---

## 🚀 Resumen por Fases Sugeridas

1.  **Fase 1 (Inmediata):** Contenido y Legales (~20h)
2.  **Fase 2 (Checkout):** Logística básica y UI Checkout (~7h sin convenios)
3.  **Fase 3 (Catálogo):** Ofertas y Marcas (~14h)
4.  **Fase 4 (Avanzada):** Convenios, SMS y Fórmula Médica (~18h)

**Gran Total Estimado:** ~59 - 65 horas de trabajo.
