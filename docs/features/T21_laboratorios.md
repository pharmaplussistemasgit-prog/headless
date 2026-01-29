# Plan de Implementación: [T21] Refactorización Laboratorios (Final)

## Descripción del Objetivo
El objetivo final implementado es ajustar la sección de Laboratorios para dar máximo protagonismo a las marcas aliadas sin recargar la navegación.

**Cambios Principales:**
1.  **Página Dedicada:** Se creó `/laboratorios` con una grilla de 4 columnas.
2.  **Home:** Carrusel de "Laboratorios Aliados" limpio y minimalista, con enlace "Ver todos los laboratorios".
3.  **Navegación:** Se descartó la idea del Megamenu en el Header por sobrecarga visual.

## Revisión del Usuario Requerida / Pendientes
> [!IMPORTANT]
> **Identificación de Laboratorios:**
> Los logos actuales tienen nombres de archivo genéricos (`los-lab-XX.jpg`).
> **Acción Requerida:** Identificar visualmente cada logo y mapearlo a su nombre real y `slug` correspondiente en `lib/brands-data.ts`.
> **Estado:** PENDIENTE DE REVISIÓN VISUAL DEL EQUIPO.
>
> **Mapeo de Productos:**
> Asegurar que el `searchTerm` o slug de cada laboratorio coincida con los productos cargados en WooCommerce.
> Url esperada: `/marca/[nombre-laboratorio]` -> Muestra productos de ese laboratorio.

## Implementación Técnica Realizada

### 1. Gestión de Datos (`lib/brands-data.ts`)
*   Se unificaron todas las URLs de imágenes en `ALL_BRANDS_SLIDER`.
*   Se preparó la estructura para soportar `slug` y `title` real una vez identificados.

### 2. Página `/laboratorios` (`app/laboratorios/page.tsx`)
*   **Ruta:** `/laboratorios`
*   **Diseño:** Container centrado, Grid responsive (2 columnas móvil, 4 escritorio).
*   **Interacción:** Hover effects que muestran enlace "Ver Productos".

### 3. Componentes Home
*   **BrandCarousel.tsx:** Se añadió botón de llamada a la acción hacia la nueva página.
*   **FeaturedBrands.tsx:** Se mantuvo para campañas específicas de alta prioridad ("Ad Banners" diagonales).

## Plan de Verificación (Pendiente de Datos)
1.  **Header:** Confirmar que ya NO existe el botón "Laboratorios". (✅ OK)
2.  **Home:** Hacer click en "Ver todos los laboratorios" -> `/laboratorios`. (✅ OK)
3.  **Página:** Click en un logo -> Debe llevar a `/marca/[slug]` y mostrar productos. (⚠️ Requiere nombres reales).
