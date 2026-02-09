# 📘 Documentación Completa: Punto 19 - Mundo Ofertas (Promociones PTC)

## 🎯 Objetivo

Implementar el sistema de promociones **"Pague X Lleve Y"** (PTC - Por Compra) en la plataforma headless de PharmaPlus, mostrando productos con promociones activas en la sección "Mundo Ofertas" con filtrado estricto por stock disponible.

---

## ✅ Estado de Implementación

### **FASE 1: MOCK IMPLEMENTATION** ✅ COMPLETADA

Se implementó un sistema completo de promociones usando datos mock (hardcodeados) que simula la tabla `wp_item_ptc` del ERP. Esta implementación permite:

- ✅ Mostrar badges de promoción en tarjetas de producto
- ✅ Filtrar productos con promociones activas en `/ofertas`
- ✅ Aplicar filtro estricto de stock (`instock` only)
- ✅ Mostrar descripciones de promociones (ej: "🎁 Pague 2 Lleve 3")
- ✅ Infraestructura lista para migración a API real

### **FASE 2: API INTEGRATION** 🔴 PENDIENTE

Requiere:
1. Agregar tabla `item_ptc` a `CUSTOM_API_V3.3.md` en WordPress
2. Reemplazar mock en `services/promotions.ts` con fetch real
3. Desplegar snippet actualizado en WordPress

---

## 🏗️ Arquitectura del Sistema

```mermaid
graph TD
    A[ERP - Tabla item_ptc] -->|Futuro: API REST| B[services/promotions.ts]
    B -->|Mock Actual| C[Datos Hardcodeados]
    B --> D[getActivePromotions]
    D --> E[enrichProductsWithPromotions]
    E --> F[MappedProduct con promotion]
    F --> G[ProductCard - Badge 🎁]
    F --> H[/ofertas - Filtrado]
    
    style A fill:#fff3cd
    style B fill:#d1ecf1
    style C fill:#f8d7da
    style E fill:#d4edda
    style G fill:#e7f3ff
    style H fill:#e7f3ff
```

---

## 📁 Archivos Creados/Modificados

### ✨ **Archivos Nuevos**

#### 1. `types/promotion.ts`
**Propósito:** Definiciones de tipos TypeScript para el sistema de promociones.

```typescript
export interface PromotionRule {
  itemId: string;           // SKU del producto base
  giftItemId: string;       // SKU del producto regalo
  buyQuantity: number;      // Cantidad mínima a comprar
  receiveQuantity: number;  // Cantidad de regalo
  startDate: string;        // Fecha inicio (YYYY-MM-DD)
  endDate: string;          // Fecha fin (YYYY-MM-DD)
}

export interface ActivePromotion {
  sku: string;
  rule: PromotionRule;
  description: string;      // ej: "🎁 Pague 2 Lleve 3"
}
```

**Ubicación:** `f:\CLIENTES\PHARMAPLUS\pharma-headless-1a Vercel\types\promotion.ts`

---

#### 2. `services/promotions.ts`
**Propósito:** Servicio de promociones con datos mock y lógica de negocio.

**Funciones Principales:**
- `getActivePromotions()` → Retorna todas las promociones activas
- `getPromotionForProduct(sku)` → Verifica si un SKU tiene promoción
- `getPromotedProductSkus()` → Lista de SKUs con promociones

**Datos Mock Actuales:**
```typescript
const MOCK_PROMOTIONS: PromotionRule[] = [
  {
    itemId: '4652',      // NASAMIST HIPERTONICO
    giftItemId: '68146',
    buyQuantity: 2,
    receiveQuantity: 1,  // Pague 2 Lleve 3
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    itemId: '3294',
    giftItemId: '76205',
    buyQuantity: 1,
    receiveQuantity: 1,  // Pague 1 Lleve 2
    startDate: '2026-01-01',
    endDate: '2026-06-30',
  },
  {
    itemId: '68146',
    giftItemId: '4652',
    buyQuantity: 3,
    receiveQuantity: 2,  // Pague 3 Lleve 5
    startDate: '2026-02-01',
    endDate: '2026-12-31',
  },
];
```

**Ubicación:** `f:\CLIENTES\PHARMAPLUS\pharma-headless-1a Vercel\services\promotions.ts`

**🔮 Migración a API Real:**
```typescript
// TODO: Reemplazar MOCK_PROMOTIONS con:
const today = new Date().toISOString().split('T')[0];
const response = await fetch(
  `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/item-ptc?` +
  `filters[FECHA_INICIO]<=${today}&filters[FECHA_FIN]>=${today}`,
  {
    headers: {
      'X-API-KEY': process.env.WORDPRESS_API_KEY || ''
    }
  }
);
return response.json();
```

---

#### 3. `lib/enrichProducts.ts`
**Propósito:** Helper para enriquecer productos con datos de promoción.

```typescript
export async function enrichProductsWithPromotions(
  products: MappedProduct[]
): Promise<MappedProduct[]>
```

**Flujo:**
1. Obtiene promociones activas
2. Crea mapa SKU → Promoción
3. Enriquece cada producto con su promoción si existe

**Ubicación:** `f:\CLIENTES\PHARMAPLUS\pharma-headless-1a Vercel\lib\enrichProducts.ts`

---

### 🔧 **Archivos Modificados**

#### 1. `types/product.ts`
**Cambio:** Agregado campo `promotion` a `MappedProduct`

```typescript
export interface MappedProduct {
  // ... campos existentes
  
  // Promotion Data (PTC - "Pague X Lleve Y")
  promotion?: {
    description: string;
    rule: {
      itemId: string;
      giftItemId: string;
      buyQuantity: number;
      receiveQuantity: number;
      startDate: string;
      endDate: string;
    };
  } | null;
}
```

---

#### 2. `lib/mappers.ts`
**Cambio:** Inicializa campo `promotion` como `null`

```typescript
export function mapWooProduct(p: WooProduct): MappedProduct {
  return {
    // ... campos existentes
    promotion: null, // Will be populated by enrichProductsWithPromotions()
  };
}
```

---

#### 3. `app/ofertas/page.tsx`
**Cambio:** Implementación completa del filtrado por promociones PTC

**Lógica Implementada:**
1. Obtiene SKUs con promociones activas
2. Fetch de productos con `stockStatus: 'instock'`
3. Filtra solo productos promocionados
4. Enriquece con datos de promoción
5. Renderiza con contador de productos activos

**Antes:**
```typescript
const { products: rawProducts } = await getOnSaleProducts(1, 24);
```

**Después:**
```typescript
const promotedSkus = await getPromotedProductSkus();
const { products: rawProducts } = await getProducts({
  perPage: 100,
  stockStatus: 'instock', // CRÍTICO: Solo productos con stock
  orderby: 'popularity',
});
const promotedProducts = allProducts.filter(
  product => product.sku && promotedSkus.includes(product.sku)
);
const enrichedProducts = await enrichProductsWithPromotions(promotedProducts);
```

---

#### 4. `components/product/ProductCard.tsx`
**Estado:** ✅ **YA IMPLEMENTADO** (sin cambios necesarios)

El componente ya usa `getProductPromo(product)` de `lib/promotions.ts` para mostrar badges de promoción. El sistema existente detecta automáticamente las promociones cuando el campo `product.promotion` está poblado.

**Badge Actual:**
```tsx
{promoLabel && (
  <span className="bg-[#9333ea] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
    {promoLabel}
  </span>
)}
```

---

## 🔄 Flujo de Datos Completo

### **1. Carga de Página `/ofertas`**

```
Usuario visita /ofertas
    ↓
OffersContent() se ejecuta (Server Component)
    ↓
getPromotedProductSkus() → ['4652', '3294', '68146']
    ↓
getProducts({ stockStatus: 'instock' }) → 100 productos
    ↓
Filtrar por SKUs promocionados → 3 productos
    ↓
enrichProductsWithPromotions() → Agrega campo 'promotion'
    ↓
ProductGrid renderiza con badges 🎁
```

### **2. Renderizado de ProductCard**

```
ProductCard recibe MappedProduct con promotion
    ↓
getProductPromo(product) lee product.promotion
    ↓
Retorna "🎁 Pague 2 Lleve 3"
    ↓
Badge se muestra en esquina superior izquierda
```

---

## 📊 Datos de Ejemplo

### **Producto con Promoción Activa**

```json
{
  "id": 12345,
  "name": "NASAMIST HIPERTONICO SPRAY X 125 ML",
  "sku": "4652",
  "price": 15000,
  "stock": 50,
  "isInStock": true,
  "promotion": {
    "description": "🎁 Pague 2 Lleve 3",
    "rule": {
      "itemId": "4652",
      "giftItemId": "68146",
      "buyQuantity": 2,
      "receiveQuantity": 1,
      "startDate": "2026-01-01",
      "endDate": "2026-12-31"
    }
  }
}
```

### **Producto sin Promoción**

```json
{
  "id": 67890,
  "name": "Paracetamol 500mg",
  "sku": "PARA-500",
  "price": 5000,
  "stock": 100,
  "isInStock": true,
  "promotion": null
}
```

---

## 🎨 UI/UX Implementada

### **Página `/ofertas`**

**Header:**
```
🎁 Mundo Ofertas

Aprovecha nuestras promociones especiales "Pague X Lleve Y". 
Compra más unidades y recibe productos adicionales gratis. 
Todas las promociones aplican solo para productos con stock disponible.

🎯 3 productos con promoción activa
```

**Grid de Productos:**
- Muestra solo productos con promociones activas
- Cada tarjeta tiene badge morado con animación pulse
- Filtrado estricto por stock (solo `instock`)

### **ProductCard Badge**

**Posición:** Esquina superior izquierda  
**Estilo:** Fondo morado (`#9333ea`), texto blanco, animación pulse  
**Texto:** Dinámico según promoción (ej: "🎁 Pague 2 Lleve 3")

---

## 🔐 Validaciones Implementadas

### **1. Filtro de Fechas**
```typescript
function isPromotionActive(rule: PromotionRule): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(rule.startDate);
  const end = new Date(rule.endDate);
  
  return today >= start && today <= end;
}
```

### **2. Filtro de Stock**
```typescript
const { products: rawProducts } = await getProducts({
  stockStatus: 'instock', // Solo productos con stock disponible
});
```

### **3. Validación de SKU**
```typescript
const promotedProducts = allProducts.filter(
  product => product.sku && promotedSkus.includes(product.sku)
);
```

---

## 📝 Casos de Uso

### **Caso 1: Usuario visita /ofertas**

**Escenario:** Hay 3 promociones activas  
**Resultado:**
- Se muestran 3 productos con badges de promoción
- Contador indica "🎯 3 productos con promoción activa"
- Solo productos con stock disponible

### **Caso 2: No hay promociones activas**

**Escenario:** `MOCK_PROMOTIONS` está vacío o todas las fechas expiraron  
**Resultado:**
```
Mundo Ofertas

No hay promociones activas en este momento. 
Vuelve pronto para descubrir nuestras ofertas especiales.
```

### **Caso 3: Producto con promoción pero sin stock**

**Escenario:** SKU '4652' tiene promoción pero `stock_status: 'outofstock'`  
**Resultado:**
- Producto NO aparece en `/ofertas`
- Filtro de stock lo excluye automáticamente

---

## 🚀 Próximos Pasos (Migración a API Real)

### **Paso 1: Modificar WordPress**

**Archivo:** `docs/snippets/CUSTOM_API_V3.3.md`

**Agregar a `$cmu_tables`:**
```php
$cmu_tables = [
    'cliente-descuento-item' => $GLOBALS['wpdb']->prefix . 'cliente_descuento_item',
    'convenio' => $GLOBALS['wpdb']->prefix . 'convenio',
    // ... otras tablas
    'item-ptc' => $GLOBALS['wpdb']->prefix . 'item_ptc', // ⬅️ NUEVO
];
```

**Registrar endpoints CRUD:**
```php
register_rest_route('custom-api/v1', '/item-ptc', [
    'methods' => 'GET',
    'callback' => 'cmu_get_all_items',
    'permission_callback' => 'cmu_check_api_key',
]);
// ... POST, PUT, DELETE
```

### **Paso 2: Actualizar `services/promotions.ts`**

**Reemplazar:**
```typescript
const MOCK_PROMOTIONS: PromotionRule[] = [ ... ];
```

**Por:**
```typescript
export async function getActivePromotions(): Promise<ActivePromotion[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/custom-api/v1/item-ptc`,
    {
      headers: {
        'X-API-KEY': process.env.WORDPRESS_API_KEY || ''
      }
    }
  );
  
  const data = await response.json();
  
  // Mapear respuesta de API a PromotionRule[]
  const rules: PromotionRule[] = data.map((item: any) => ({
    itemId: item.ITEM_ID,
    giftItemId: item.ITEM_ID_RECAMBIO,
    buyQuantity: item.POR_COMPRA_DE,
    receiveQuantity: item.RECIBE_PTC,
    startDate: item.FECHA_INICIO,
    endDate: item.FECHA_FIN,
  }));
  
  // Filtrar por fechas activas
  const activePromotions: ActivePromotion[] = [];
  for (const rule of rules) {
    if (isPromotionActive(rule)) {
      activePromotions.push({
        sku: rule.itemId,
        rule,
        description: getPromotionDescription(rule),
      });
    }
  }
  
  return activePromotions;
}
```

### **Paso 3: Configurar Variables de Entorno**

**Archivo:** `.env.local`

```bash
NEXT_PUBLIC_WORDPRESS_API_URL=https://tienda.pharmaplus.com.co
WORDPRESS_API_KEY=rwYK_B0nN_kHbq_ujB3_XRbZ_slCt
```

### **Paso 4: Testing**

1. Verificar endpoint: `GET /wp-json/custom-api/v1/item-ptc`
2. Validar estructura de respuesta
3. Probar filtrado por fechas
4. Verificar badges en ProductCard
5. Confirmar filtrado en `/ofertas`

---

## 📚 Referencias

### **Documentos Relacionados**

- [ERP-WordPress API Complete](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/erp_wordpress_api_complete.md) → Documentación completa de APIs
- [Plan de Desarrollo 31 Puntos](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/plan_desarrollo_31_puntos.md) → Punto 19
- [CUSTOM_API_V3.3.md](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/snippets/CUSTOM_API_V3.3.md) → Snippet de WordPress
- [Snippet #21: Beneficios B2C](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/snippets/woocommerce_beneficios_b2c.php) → Lógica original de PTC

### **Archivos del Proyecto**

| Archivo | Ruta Completa |
|---------|---------------|
| Types | [types/promotion.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/types/promotion.ts) |
| Service | [services/promotions.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/services/promotions.ts) |
| Enricher | [lib/enrichProducts.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/lib/enrichProducts.ts) |
| Mapper | [lib/mappers.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/lib/mappers.ts) |
| Page | [app/ofertas/page.tsx](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/ofertas/page.tsx) |
| ProductCard | [components/product/ProductCard.tsx](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/components/product/ProductCard.tsx) |

---

## ✅ Checklist de Implementación

### **FASE 1: MOCK** ✅ COMPLETADA
- [x] Crear `types/promotion.ts`
- [x] Crear `services/promotions.ts` con mock data
- [x] Crear `lib/enrichProducts.ts`
- [x] Actualizar `types/product.ts` (agregar campo `promotion`)
- [x] Actualizar `lib/mappers.ts` (inicializar `promotion: null`)
- [x] Actualizar `app/ofertas/page.tsx` (filtrado por PTC)
- [x] Verificar `ProductCard.tsx` (badge ya implementado)
- [x] Documentar implementación completa

### **FASE 2: API INTEGRATION** 🔴 PENDIENTE
- [ ] Modificar `CUSTOM_API_V3.3.md` en WordPress
- [ ] Agregar tabla `item-ptc` a `$cmu_tables`
- [ ] Registrar endpoints CRUD para `item-ptc`
- [ ] Desplegar snippet actualizado en WordPress
- [ ] Actualizar `services/promotions.ts` (reemplazar mock)
- [ ] Configurar variables de entorno
- [ ] Testing completo de integración
- [ ] Actualizar documentación con endpoints reales

---

## 🎓 Notas Técnicas

### **¿Por qué Mock Primero?**

1. **Desarrollo Independiente:** Frontend puede avanzar sin esperar backend
2. **Testing Rápido:** Validar UX/UI sin dependencias externas
3. **Migración Suave:** Infraestructura lista para API real
4. **Rollback Fácil:** Si API falla, mock sigue funcionando

### **Diferencia con Sistema de Promociones Existente**

El archivo `lib/promotions.ts` existente maneja:
- Descuentos por categoría (ej: Genfar)
- Descuentos porcentuales
- Precios fijos B2B
- Descuentos escalonados B2C

El nuevo sistema PTC maneja:
- Promociones "Pague X Lleve Y" específicas por SKU
- Validación de fechas de vigencia
- Productos de regalo
- Integración con tabla `item_ptc` del ERP

**Ambos sistemas coexisten** y se complementan.

---

**Última Actualización:** 2026-02-06  
**Estado:** ✅ Mock Implementado | 🔴 API Pendiente  
**Responsable:** Gemini AI Assistant
