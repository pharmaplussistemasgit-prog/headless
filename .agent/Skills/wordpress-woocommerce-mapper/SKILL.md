---
name: WordPress/WooCommerce Headless Mapper
description: Mapea completamente la estructura de WordPress/WooCommerce para proyectos headless. Genera scripts de inspección, documenta APIs disponibles, snippets activos y crea guías de implementación.
---

# WordPress/WooCommerce Headless Mapper

Esta skill te permite mapear **completamente** cualquier instalación de WordPress/WooCommerce para construir aplicaciones headless robustas y sin errores.

## 🎯 Qué hace esta Skill

1. **Inspecciona toda la estructura de WordPress**:
   - Productos (todos los campos disponibles)
   - Categorías con jerarquía
   - Atributos de productos (marcas, laboratorios, etc.)
   - Tags
   - Órdenes
   - Clientes
   - Métodos de envío
   - Métodos de pago

2. **Identifica snippets activos**:
   - Cart customizations
   - Checkout customizations
   - Ofertas y descuentos
   - Campos personalizados

3. **Genera documentación completa**:
   - Estructura de datos
   - Endpoints disponibles
   - Ejemplos de implementación
   - Guías de uso

4. **Crea scripts reutilizables**:
   - Inspección automática
   - Generación de tipos TypeScript
   - Validación de datos

## 📋 Prerequisitos

- Proyecto Next.js/React con TypeScript
- Acceso a WordPress/WooCommerce
- Credenciales de API (Consumer Key/Secret)

## 🚀 Cómo usar esta Skill

### Paso 1: Configurar Variables de Entorno

Primero, asegúrate de tener estas variables en `.env.local`:

```bash
NEXT_PUBLIC_WORDPRESS_URL=https://tu-sitio.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
```

### Paso 2: Ejecutar Inspección Completa

Pídeme que ejecute la inspección:

```
"Mapea completamente WordPress usando la skill de WooCommerce Headless Mapper"
```

Esto generará:
1. Script de inspección (`scripts/inspect-wordpress-complete.js`)
2. Archivo JSON con todos los datos (`wordpress-complete-mapping.json`)
3. Documentación completa (`docs/wordpress-mapping-summary.md`)

### Paso 3: Revisar Resultados

La skill generará:

- **`wordpress-complete-mapping.json`**: Datos completos en JSON
- **`wordpress-mapping-summary.md`**: Resumen ejecutivo
- **`scripts/inspect-wordpress-complete.js`**: Script reutilizable
- **Tipos TypeScript** (opcional): Interfaces para todos los datos

## 📊 Estructura de Salida

### 1. Productos

```typescript
interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: 'publish' | 'draft' | 'pending';
  featured: boolean;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: Category[];
  tags: Tag[];
  attributes: Attribute[];
  images: Image[];
  meta_data: MetaData[];
  // ... 60+ campos más
}
```

### 2. Categorías

```typescript
interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: Image | null;
}
```

### 3. Atributos (Marcas/Laboratorios)

```typescript
interface AttributeTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}
```

## 🔧 Scripts Generados

### `inspect-wordpress-complete.js`

Script Node.js que:
- Se conecta a WooCommerce API
- Inspecciona todas las secciones
- Genera reporte JSON completo
- Documenta snippets activos

**Uso**:
```bash
node scripts/inspect-wordpress-complete.js
```

### `generate-types.js` (opcional)

Genera tipos TypeScript desde el mapeo:
```bash
node scripts/generate-types.js
```

## 📝 Documentación Generada

### `wordpress-mapping-summary.md`

Contiene:
- Resumen ejecutivo
- Estructura de productos (60+ campos)
- Categorías con jerarquía
- Atributos y taxonomías
- Snippets activos (Cart, Checkout, Ofertas)
- Métodos de envío y pago
- Ejemplos de implementación

## 🎨 Casos de Uso

### 1. Construir Filtros Avanzados

```typescript
// Sabiendo la estructura exacta, puedes crear filtros robustos
const filters = {
  categories: allCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    count: cat.count
  })),
  brands: allBrands.map(brand => ({
    id: brand.id,
    name: brand.name,
    count: brand.count
  })),
  priceRange: {
    min: 0,
    max: maxPrice
  },
  inStock: true,
  onSale: false
};
```

### 2. Sidebar de Categorías

```typescript
// Con jerarquía completa
const CategoryTree = ({ categories }) => {
  const rootCategories = categories.filter(cat => cat.parent === 0);
  
  return (
    <div>
      {rootCategories.map(cat => (
        <CategoryItem 
          key={cat.id} 
          category={cat}
          subcategories={categories.filter(c => c.parent === cat.id)}
        />
      ))}
    </div>
  );
};
```

### 3. Sistema de Ofertas

```typescript
// Usando datos mapeados
const calculateDiscount = (regular: number, sale: number) => {
  if (!regular || !sale || sale >= regular) return 0;
  return Math.round(((regular - sale) / regular) * 100);
};

// Mostrar badge
{product.on_sale && (
  <Badge>
    {calculateDiscount(
      parseFloat(product.regular_price),
      parseFloat(product.sale_price)
    )}% OFF
  </Badge>
)}
```

## 🔍 Identificación de Snippets Activos

La skill también identifica snippets activos en WordPress:

### Cart Snippets
- Precios en oferta
- Cálculo de ahorros
- Resumen personalizado

### Checkout Snippets
- Campos personalizados
- Validaciones
- Opt-ins de marketing

### Ofertas Snippets
- Badges de descuento
- Shortcodes de productos en oferta
- Cálculos de porcentajes

## ⚡ Optimizaciones Recomendadas

### 1. Caching

```typescript
// Cachear datos estáticos
const CACHE_DURATION = 60 * 60; // 1 hora

export const getCachedCategories = cache(
  async () => {
    const response = await fetch('/wp-json/wc/v3/products/categories?per_page=100');
    return response.json();
  },
  ['categories'],
  { revalidate: CACHE_DURATION }
);
```

### 2. Paginación Óptima

```typescript
// Usar paginación eficiente
const PRODUCTS_PER_PAGE = 100; // Máximo permitido

async function fetchAllProducts() {
  let page = 1;
  let allProducts = [];
  let hasMore = true;

  while (hasMore) {
    const products = await fetchProducts({ page, per_page: PRODUCTS_PER_PAGE });
    allProducts = [...allProducts, ...products];
    hasMore = products.length === PRODUCTS_PER_PAGE;
    page++;
  }

  return allProducts;
}
```

### 3. Queries Específicas

```typescript
// Solo traer campos necesarios
const fields = [
  'id',
  'name',
  'slug',
  'price',
  'regular_price',
  'sale_price',
  'images',
  'stock_status'
].join(',');

const response = await fetch(
  `/wp-json/wc/v3/products?_fields=${fields}`
);
```

## 🐛 Troubleshooting

### Error: "No se encontraron productos"

**Solución**: Verifica que las credenciales de WooCommerce sean correctas y tengan permisos de lectura.

### Error: "Timeout en la petición"

**Solución**: Aumenta el timeout o reduce el `per_page`:

```javascript
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000) // 30 segundos
});
```

### Datos incompletos

**Solución**: Algunos campos pueden estar vacíos. Siempre valida:

```typescript
const price = product.price || product.regular_price || '0';
const image = product.images?.[0]?.src || '/placeholder.jpg';
```

## 📚 Recursos Adicionales

- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

## 🎯 Checklist de Implementación

Cuando uses esta skill, asegúrate de:

- [ ] Configurar variables de entorno
- [ ] Ejecutar script de inspección
- [ ] Revisar `wordpress-complete-mapping.json`
- [ ] Leer `wordpress-mapping-summary.md`
- [ ] Identificar snippets activos relevantes
- [ ] Generar tipos TypeScript (opcional)
- [ ] Implementar caching para datos estáticos
- [ ] Validar todos los campos antes de usar
- [ ] Implementar manejo de errores robusto
- [ ] Optimizar queries (solo campos necesarios)

## 💡 Ejemplo Completo: Página de Producto

```typescript
// app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch usando estructura mapeada
  const product = await fetchProductBySlug(params.slug);
  
  if (!product) notFound();

  // Calcular descuento si está en oferta
  const discount = product.on_sale
    ? calculateDiscount(
        parseFloat(product.regular_price),
        parseFloat(product.sale_price)
      )
    : 0;

  return (
    <div>
      <h1>{product.name}</h1>
      
      {/* Imágenes */}
      <ImageGallery images={product.images} />
      
      {/* Precio */}
      <div>
        {product.on_sale ? (
          <>
            <span className="line-through">{product.regular_price}</span>
            <span className="text-red-600">{product.sale_price}</span>
            <Badge>{discount}% OFF</Badge>
          </>
        ) : (
          <span>{product.price}</span>
        )}
      </div>
      
      {/* Stock */}
      <StockIndicator status={product.stock_status} quantity={product.stock_quantity} />
      
      {/* Categorías */}
      <Categories categories={product.categories} />
      
      {/* Atributos (ej: Laboratorio) */}
      <Attributes attributes={product.attributes} />
      
      {/* Descripción */}
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
      
      {/* Meta data personalizada */}
      {product.meta_data.find(m => m.key === 'cadena_frio')?.value && (
        <ColdChainBadge />
      )}
    </div>
  );
}
```

## 🚀 Resultado Final

Después de usar esta skill, tendrás:

✅ **Mapeo completo** de WordPress/WooCommerce  
✅ **Scripts reutilizables** para inspección  
✅ **Documentación exhaustiva** de la estructura  
✅ **Tipos TypeScript** (opcional)  
✅ **Ejemplos de implementación** listos para usar  
✅ **Guías de optimización** para mejor rendimiento  
✅ **Identificación de snippets** activos  
✅ **Cero errores** en producción por datos faltantes

---

**Creado**: 2026-02-05  
**Versión**: 1.0  
**Autor**: Gemini AI Assistant
