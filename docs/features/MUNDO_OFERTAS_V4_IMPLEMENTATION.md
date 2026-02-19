# Documentación Técnica: Implementación "Mundo Ofertas" (V4.0)

**Fecha:** 11 Febrero 2026
**Versión API:** 4.0 (Custom API for Woo)
**Autor:** Antigravity

---

## 1. Resumen Ejecutivo
Se ha implementado una solución completa para la sección "Mundo Ofertas", optimizando tanto el Backend (WordPress/WooCommerce) como el Frontend (Headless Next.js). El objetivo principal fue permitir un filtrado real de productos en oferta con fechas de vigencia precisas para mostrar contadores regresivos y asegurar que la sección nunca se vea vacía.

---

## 2. Implementación Backend (WordPress)

### Plugin Actualizado: Custom API for Woo (V4.0)
Se actualizó el plugin personalizado para exponer un endpoint optimizado que entrega todos los datos necesarios en una sola petición.

- **Archivo:** `wordpress_custom_api_v3_4_COMPLETE.php`
- **Ruta de Archivo:** `docs/snippets/wordpress_custom_api_v3_4_COMPLETE.php`
- **Endpoint:** `GET /wp-json/custom-api/v1/products`

#### Nuevos Parámetros Soportados:
| Parámetro | Valor | Descripción |
| :--- | :--- | :--- |
| `on_sale` | `true` | **CRÍTICO:** Filtra solo productos con precio rebajado activo. |
| `fields` | `full` | Retorna campos extendidos, incluyendo `date_on_sale_from` y `date_on_sale_to`. |
| `per_page` | `int` | Paginación (Ej: 20). |

#### Lógica de Filtrado (PHP):
El plugin ahora utiliza `wc_get_product_ids_on_sale()` para obtener los IDs reales de productos en oferta y los cruza con la consulta principal (`post__in`), garantizando precisión absoluta.

---

## 3. Implementación Frontend (Next.js Headless)

### A. Conexión a API (`lib/woocommerce.ts`)
Se creó una función dedicada `getCustomApiOffers` que consume el nuevo endpoint V4.0.

```typescript
export async function getCustomApiOffers(page: number = 1, perPage: number = 20) {
  // Llama a /custom-api/v1/products con on_sale=true y fields=full
  // Retorna estructura { products, total, totalPages }
}
```

### B. Componente: Contador Regresivo (`OfferCountDown.tsx`)
Un nuevo componente visual que genera urgencia.
- **Ubicación:** `components/product/OfferCountDown.tsx`
- **Funcionalidad:**
    - Recibe una fecha ISO (`targetDate`).
    - Calcula días, horas, minutos y segundos restantes en tiempo real.
    - Se oculta automáticamente si la oferta ha expirado.
    - Diseño con textos grandes y legibles para fácil lectura.

### C. Tarjeta de Producto (`ProductCard.tsx`)
Se actualizó para soportar una variante visual específica para ofertas.
- **Propiedad:** `variant="offer"`
- **Comportamiento:** Si se activa esta variante y el producto tiene fecha límite, inyecta el componente `OfferCountDown` sobre la imagen del producto.

### D. Nueva Página: `/ofertas` (`app/ofertas/page.tsx`)
Una página dedicada ("Landing Page") para ver todas las ofertas disponibles.
- Diseño con Hero Banner (Rojo/Rosa).
- Grid responsivo de productos.
- Paginación numerada completa.

### E. Sección Home: Mundo Ofertas (`components/home/FlashDeals.tsx`)
Esta fue la sección más crítica. Se implementó una lógica híbrida "Anti-Vacío".

#### Lógica Inteligente de Carga (en `app/page.tsx`):
1.  **Intento 1 (Real):** Solicita ofertas a la API (`on_sale=true`).
2.  **Verificación:** Si recibe menos de 4 ofertas reales...
3.  **Relleno (Fallback):** Completa los espacios faltantes con productos "Populares" (instock).
    - *Resultado:* El carrusel siempre se ve lleno (mínimo 8 productos), mezclando ofertas reales (con contador) y productos populares (sin contador).

#### Mejoras Visuales (FlashDeals.tsx):
- Textos de contadores aumentados (Días, Horas, etc.).
- Barra de stock más visible.
- Fechas de vigencia (Inicio / Fin) explícitas con ícono 📅.
- Etiquetas "Termina en" más grandes.

---

## 4. Guía de Uso para el Administrador

### Para crear una Oferta con Contador:
1.  Ir a **WordPress > Productos**.
2.  Editar un producto.
3.  En "Datos del producto" > **General**:
    - Poner **Precio Rebajado**.
    - Clic en **"Programar"**.
    - Definir **Fecha de inicio** y **Fecha final**.
4.  Guardar.
5.  *Resultado:* El producto aparecerá automáticamente en la sección "Mundo Ofertas" y en `/ofertas` **con el contador regresivo activado**.

### Para una Oferta Simple (Sin fecha):
1.  Solo poner **Precio Rebajado** (sin programar fechas).
2.  *Resultado:* Aparece en la sección pero **sin contador** (solo etiqueta de oferta).

---

## 5. Archivos Modificados/Creados
- `docs/snippets/wordpress_custom_api_v3_4_COMPLETE.php` (NUEVO - Plugin)
- `components/product/OfferCountDown.tsx` (NUEVO - UI)
- `app/ofertas/page.tsx` (NUEVO - Página)
- `lib/woocommerce.ts` (MODIFICADO - Conexión API)
- `components/product/ProductCard.tsx` (MODIFICADO - UI Tarjeta)
- `app/page.tsx` (MODIFICADO - Lógica Home)
- `components/home/FlashDeals.tsx` (MODIFICADO - Diseño Home)
