# Guía de Integración ERP - PharmaPlus Headless

Este documento detalla los requisitos técnicos y la estructura de datos necesaria para la correcta sincronización entre el ERP del cliente, WooCommerce y el Frontend Headless.

## 1. Metadatos de Producto (ERP → WooCommerce)

Para que el frontend muestre la información farmacéutica correcta (Badge de Cadena de Frío, Logos de Laboratorio, Requiere Fórmula, etc.), el ERP debe poblar los siguientes campos en el `meta_data` de cada producto en WooCommerce.

### Estructura JSON Esperada (`meta_data`)

```json
"meta_data": [
    {
        "key": "_marca",
        "value": "GALDERMA" 
    },
    {
        "key": "_registro_invima",
        "value": "NSOC40772-11CO"
    },
    {
        "key": "_tipo_de_producto",
        "value": "MEDICAMENTO"
    },
    {
        "key": "_needs_rx",
        "value": "false" 
    },
    {
        "key": "_cadena_de_frio",
        "value": "true"
    }
]
```

### Tabla de Referencia de Campos

| Campo ERP / Key API | Tipo de Dato | UI Frontend | Descripción |
| :--- | :--- | :--- | :--- |
| `_marca` | String | Detalle de Producto / Filtros | Nombre del laboratorio o marca fabricante. Se usa para agrupaciones y filtros. |
| `_registro_invima` | String | Detalle de Producto | Código oficial de registro sanitario. Se muestra en especificaciones. |
| `_tipo_de_producto` | String | Detalle de Producto | Categorización legal (e.g., MEDICAMENTO, COSMÉTICO, SUPLEMENTO). |
| `_needs_rx` | String ("true"/"false") | Checkout / Detalle | Si es "true", activa la alerta de "Requiere Fórmula Médica". |
| `_cadena_de_frio` | String ("true"/"false") | Badge Azul / Checkout | Si es "true", agrega el fee de nevera ($12.000) y muestra alerta de refrigeración. |

---

## 2. Sincronización de Promociones (ERP → Frontend)

El sistema soporta dos tipos de promociones definidas desde el ERP que deben reflejarse en WooCommerce.

### A. Descuentos Escalonados B2C (Pague X Lleve Y)

Lógica basada en la tabla `wp_descuento_call`. El frontend consulta el endpoint `/wp-json/custom-api/v1/descuento-call`.

- **Lógica**: Si el usuario lleva `D3` unidades, aplica un descuento unitario específico.
- **Matching**: Se realiza por **SKU**. Es vital que el SKU en WooCommerce coincida con el SKU en el ERP.

### B. Precios Fijos B2B (Convenios)

Lógica basada en la tabla `wp_cliente_descuento_item`. El frontend consulta `/wp-json/custom-api/v1/cliente-descuento-item`.

- **Lógica**: Asigna un precio fijo especial a una lista de SKUs para un cliente específico (identificado por `cliente_id` / `nit`).
- **Endpoint**: Requiere autenticación y envío del ID del cliente.

---

## 3. Checklist de Validación para el Equipo ERP

Al realizar la carga o actualización de productos, por favor verificar:

1.  [ ] **SKU Único**: ¿Cada producto tiene un SKU único y válido? (Fundamental para promociones).
2.  [ ] **Stock Explícito**: El campo `stock_quantity` debe ser mayor a 0. No basta con `stock_status: instock`.
3.  [ ] **Metadatos Completos**: ¿Se están enviando `_marca`, `_registro_invima`, etc.?
4.  [ ] **Imágenes**: ¿Las imágenes se cargan en la galería de medios de WP y se asignan al producto?

---

## 4. Notas Técnicas del Frontend

- El frontend usa un mapeador centralizado (`lib/mappers.ts`) que normaliza estos campos.
- Si un campo (`_marca`) no viene, el frontend mostrará "N/A" o ocultará la sección correspondiente.
- Los valores booleanos (`_needs_rx`, `_cadena_de_frio`) aceptan: `true`, `"true"`, `"yes"`, `"on"`, `1`.
