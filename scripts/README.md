# 🛠️ Scripts del Proyecto PharmaPlus

Esta carpeta contiene **38 scripts** de utilidad para mantenimiento, auditoría, migración y debug del proyecto.

---

## 📋 Categorías de Scripts

### 🔍 Scripts de Auditoría
Scripts para analizar y verificar la integridad de datos.

| Script | Descripción |
|--------|-------------|
| `audit-categories.ts` | Audita la estructura de categorías de WooCommerce |
| `audit-csv.ts` | Audita datos desde archivos CSV |
| `audit-deep-mapping.ts` | Auditoría profunda de mapeos de productos |
| `audit-product-mapping.ts` | Verifica mapeo de productos |
| `audit-product.ts` | Auditoría completa de productos |
| `analyze-product-brands.js` | Analiza marcas de productos |

### 🔄 Scripts de Migración
Scripts para migrar datos entre sistemas.

| Script | Descripción |
|--------|-------------|
| `migrate-categories.ts` | Migra categorías a nueva estructura |
| `migrate-tags.ts` | Migra tags de productos |
| `run-migration.ts` | Ejecuta migraciones completas |
| `create-attributes.ts` | Crea atributos en WooCommerce |

### 🗺️ Scripts de Mapeo
Scripts para generar mapeos de datos.

| Script | Descripción |
|--------|-------------|
| `map-all-categories.js` | Mapea todas las categorías |
| `map-attributes-tags.js` | Mapea atributos y tags |
| `map-brands-full.js` | Mapea marcas completas |
| `map-categories-hierarchy.js` | Mapea jerarquía de categorías |

### 🐛 Scripts de Debug
Scripts para debugging y diagnóstico.

| Script | Descripción |
|--------|-------------|
| `debug-api.ts` | Debug de llamadas a API |
| `debug-categories.ts` | Debug de categorías |
| `debug-guayeras.ts` | Debug específico de productos Guayeras |
| `debug-order.ts` | Debug de órdenes |
| `debug-tokio.ts` | Debug específico de productos Tokio |

### 🔧 Scripts de Corrección (Fix)
Scripts para corregir problemas específicos.

| Script | Descripción |
|--------|-------------|
| `fix-all-mapping.ts` | Corrige todos los mapeos |
| `fix-all-stock.ts` | Corrige stock de todos los productos |
| `fix-category-hierarchy.ts` | Corrige jerarquía de categorías |
| `fix-guayeras.ts` | Corrige productos Guayeras |
| `fix-hierarchy-v2.ts` | Corrección v2 de jerarquía |
| `fix-medias-mapping.ts` | Corrige mapeo de medias |
| `fix-tokio-mapping.ts` | Corrige mapeo de productos Tokio |

### ✅ Scripts de Verificación
Scripts para verificar estado del sistema.

| Script | Descripción |
|--------|-------------|
| `verify-cold-chain.ts` | Verifica productos de cadena de frío |
| `verify-woo.js` | Verifica conexión con WooCommerce |
| `standalone-verify.js` | Verificación standalone |

### 📊 Scripts de Reportes
Scripts para generar reportes.

| Script | Descripción |
|--------|-------------|
| `generate-inventory-report.ts` | Genera reporte de inventario |
| `generate-tokio-report.ts` | Genera reporte de productos Tokio |

### 🧪 Scripts de Testing
Scripts para pruebas y simulaciones.

| Script | Descripción |
|--------|-------------|
| `test-category-filter.ts` | Prueba filtros de categorías |
| `test-slug-fetch.ts` | Prueba obtención de slugs |
| `simulate-frontend-flow.ts` | Simula flujo del frontend |

### 🔄 Scripts de Actualización
Scripts para actualizar datos.

| Script | Descripción |
|--------|-------------|
| `update-tokio-stock.ts` | Actualiza stock de productos Tokio |
| `enable-stock-management.ts` | Habilita gestión de stock |

### 🔎 Scripts de Inspección
Scripts para inspeccionar datos específicos.

| Script | Descripción |
|--------|-------------|
| `inspect-category-products.js` | Inspecciona productos por categoría |
| `inspect-medias.ts` | Inspecciona archivos de medias |

---

## 🚀 Cómo Usar los Scripts

### Requisitos Previos
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Ejecutar un Script TypeScript
```bash
npx tsx scripts/nombre-del-script.ts
```

### Ejecutar un Script JavaScript
```bash
node scripts/nombre-del-script.js
```

---

## ⚠️ Precauciones

> [!WARNING]
> **Scripts de Migración y Corrección**: Los scripts que modifican datos (`migrate-*`, `fix-*`, `update-*`) pueden alterar la base de datos de WooCommerce. Siempre:
> 1. Hacer backup antes de ejecutar
> 2. Probar en ambiente de desarrollo primero
> 3. Revisar el código del script antes de ejecutar

> [!IMPORTANT]
> **Variables de Entorno**: Muchos scripts requieren credenciales de WooCommerce. Asegúrate de tener configurado correctamente tu archivo `.env.local`.

---

## 📝 Convenciones

### Nomenclatura
- **audit-**: Scripts de auditoría (solo lectura)
- **debug-**: Scripts de debugging (solo lectura)
- **verify-**: Scripts de verificación (solo lectura)
- **map-**: Scripts de mapeo (generan archivos JSON)
- **migrate-**: Scripts de migración (modifican datos)
- **fix-**: Scripts de corrección (modifican datos)
- **update-**: Scripts de actualización (modifican datos)
- **generate-**: Scripts de generación de reportes
- **test-**: Scripts de prueba
- **inspect-**: Scripts de inspección

### Extensiones
- `.ts` - Scripts TypeScript (requieren `tsx` para ejecutar)
- `.js` - Scripts JavaScript (ejecutar con `node`)

---

## 🔗 Recursos Relacionados

- [Documentación Técnica](../docs/technical/)
- [Mapeos de Datos](../data/mappings/)
- [Resultados de Auditorías](../data/audit/)

---

**Última actualización:** 21 de enero de 2026
