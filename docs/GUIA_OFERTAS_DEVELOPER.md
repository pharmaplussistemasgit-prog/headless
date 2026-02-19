# Guía de Implementación: Mundo Ofertas (Fechas de Rebaja)

## 📌 Contexto
Para que los productos aparezcan en la sección "Mundo Ofertas" y se activen/desactiven automáticamente, es **CRUCIAL** enviar las fechas de inicio y fin de la oferta. La API ha sido actualizada (V3.4) para soportar estos campos.

## 📅 Nuevos Campos
Al crear o actualizar un producto (POST/PUT), ahora se deben incluir:

| Campo | Tipo | Formato | Descripción |
| :--- | :--- | :--- | :--- |
| `sale_price` | string/number | "10000" | Precio rebajado (debe ser menor al `regular_price`). |
| `date_on_sale_from` | string | `YYYY-MM-DD` | Fecha de **inicio** de la oferta (inclusive). Ejemplo: `2023-10-01` |
| `date_on_sale_to` | string | `YYYY-MM-DD` | Fecha de **fin** de la oferta (inclusive). Ejemplo: `2023-10-15` |

> [!IMPORTANT]
> Si se envía `sale_price` SIN fechas, la oferta queda activa indefinidamente (o hasta que se quite el precio manualmente).
> Si se envían fechas, WooCommerce se encarga de activar el precio rebajado SOLO dentro del rango.

## 📝 Ejemplo de Payload (JSON)

Endpoint: `POST /wp-json/custom-api/v1/product` (o `batch`)

```json
{
  "sku": "PROD-123",
  "title": "Producto en Oferta Temporal",
  "regular_price": "50000",
  "sale_price": "40000",
  "date_on_sale_from": "2023-11-01", 
  "date_on_sale_to": "2023-11-30",
  "stock_quantity": 100
}
```

## 🛠️ Verificación
Después de actualizar un producto con estas fechas:
1. En el Admin de WooCommerce -> Producto -> General, deberías ver el enlace "Cancelar programación" y las fechas llenas.
2. En el Frontend, la oferta solo será visible si `hoy >= date_on_sale_from` Y `hoy <= date_on_sale_to`.
