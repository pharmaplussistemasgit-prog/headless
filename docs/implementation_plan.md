# Plan de Implementación - Mundo Ofertas y Autocompletado

## User Review Required
> [!IMPORTANT]
> **API para Promociones (PTC)**: No se encontró el endpoint `item-ptc` en `custom-api`. Se implementará un **Servicio Mock** (`services/promotions.ts`) para simular la lógica de "Pague X Lleve Y" basada en el snippet #21. El cliente deberá proporcionar el endpoint real o desplegarlo.

> [!NOTE]
> **Visibilidad de Stock**: Se aplicará filtro estricto de `instock` en "Mundo Ofertas" y otras secciones principales, excepto el buscador que mostrará agotados (ya implementado).

## Proposed Changes

### Mundo Ofertas (Promociones PTC)
#### [NEW] [promotions.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/services/promotions.ts)
- Servicio para gestionar reglas de "Pague X Lleve Y".
- Mock inicial basado en `item_ptc`.

#### [MODIFY] [ProductCard.tsx](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/components/ui/ProductCard.tsx)
- Integrar visualización de etiqueta "Pague X Lleve Y".

#### [MODIFY] [page.tsx](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/ofertas/page.tsx)
- (Si existe) Asegurar filtrado de stock y mostrar promociones.

### Búsqueda y Autocompletado (Implementado)
- `App/mi-cuenta/pastillero/page.tsx`: Implementado `ProductAutocomplete`.
- `App/actions/products.ts`: Actualizado para soportar búsqueda de agotados.
- `App/tienda/page.tsx`: Actualizado para mostrar agotados solo en búsqueda.

## Verification Plan
### Automated Tests
- Verificar compilación de nuevos componentes `ProductAutocomplete` y cards actualizadas.

### Manual Verification
- **Buscador (Pastillero)**: Verificar que autocompleta con productos (incluso agotados).
- **Mundo Ofertas**: Verificar que muestra etiqueta de promoción (Mock) y solo productos en stock.
- **Tienda**: Verificar que categorías ocultan agotados, pero búsqueda los muestra.
