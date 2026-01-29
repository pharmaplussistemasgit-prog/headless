# Sistema de Cache y Filtros Inteligentes (Smart Facets)

## 📌 Visión General
Este sistema implementa un mecanismo de "Faceted Search" (Búsqueda por Facetas) optimizado para el servidor, garantizando que los usuarios vean **todos** los filtros disponibles (Marcas, Etiquetas, Precios, Categorías) dentro de una categoría, independientemente de la paginación.

## 🚀 Estrategia de Cache (24 Horas)
Para evitar la sobrecarga a la API de WooCommerce cada vez que un usuario visita una categoría, implementamos una estrategia de **Cache Diario (TTL 86400s)** para datos estructurales y de filtros.

### Componentes Cacheados:
1.  **Árbol de Categorías (`CategoryTree`)**: Se genera una vez cada 24 horas.
2.  **Facetas Globales (`getCategoryGlobalFacets`)**: 
    - Analiza **TODOS** los productos de una categoría (no solo los visibles).
    - Extrae todas las marcas, etiquetas y rangos de precio.
    - El resultado se cachea por 24 horas.
    - Esto permite mostrar "Pfizer (50)" en el filtro incluso si los productos están en la página 5.

## 🛠️ Arquitectura Técnica

### 1. Extracción de Facetas en el Servidor (`lib/woocommerce.ts`)
La función `getCategoryGlobalFacets(categoryId)` es el corazón del sistema:
- Realiza un fetch de todos los productos de la categoría (`wcFetchAll`).
- Mapea los productos a un formato ligero.
- Ejecuta `analyzeProductsForFilters` para contar ocurrencias de cada atributo.
- Retorna un objeto `FilterState` completo.

### 2. SmartFilterSidebar (`components/category/SmartFilterSidebar.tsx`)
El frontend recibe las facetas pre-calculadas y renderiza:
- **Navegación Adaptativa:** Muestra subcategorías si existen en el árbol.
- **Slider de Precios:** Implementado con `@radix-ui/react-slider` para máxima accesibilidad y fluidez. Permite filtrar por rango exacto.
- **Acordeones de Filtros:**
    - **Laboratorios (Marcas):** Lista completa de laboratorios.
    - **Forma de Uso / Condición:** Agrupaciones lógicas basadas en etiquetas (mappeo manual).
    - **Etiquetas (Tags):** Lista completa de todas las etiquetas disponibles ("Otras Etiquetas") para un filtrado granular.

### 3. Paginación y Filtrado Híbrido (`CategoryCatalogue.tsx`)
- **Inicialización:** El estado de filtros se inicializa con los datos del servidor (`facets`).
- **Navegación:** La paginación usa navegación estándar (Link `href`), permitiendo que Google indexe todas las páginas.
- **Filtrado:** Al seleccionar un filtro, la aplicación filtra la lista de productos actual. 
    > _Nota: En futuras iteraciones, se recomienda implementar filtrado por URL (query params) para soportar deep-linking de filtros específicos._

## 📊 Ventajas del Nuevo Sistema
1.  **Velocidad:** La carga inicial es instantánea gracias al cache de Next.js.
2.  **Exactitud:** Los contadores de filtros (ej. "Dolex (15)") son reales y abarcan todo el inventario, no solo la página actual.
3.  **UX Premium:** El slider de precios es visual y táctil, y los acordeones permiten organizar la información densa.
4.  **Escalabilidad:** Al procesar datos en el servidor y cachearlos, el cliente recibe un JSON ligero listo para renderizar, reduciendo el procesamiento en el navegador.

## ⚠️ Mantenimiento
- Si se añaden nuevos productos en WooCommerce, tardarán hasta 24 horas en aparecer en los filtros globales a menos que se fuerce una revalidación (On-Demand Revalidation) o se haga un redeploy.
- El mapeo de etiquetas ("Forma de Uso") se define en `config/filterTagMapping.ts`.
