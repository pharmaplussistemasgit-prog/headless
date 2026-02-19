# 🛠️ Solución Técnica: Soporte para Tracking en Custom API

## 🚨 El Problema

El desarrollador está usando un endpoint personalizado:
`PUT /wp-json/custom-api/v1/order/{id}`

Este endpoint **NO está procesando** el array `meta_data` que se le envía. Por eso, aunque Postman devuelve 200 OK, los campos `_shipping_company` y `_shipping_tracking_number` **no se guardan en la base de datos**.

---

## ✅ La Solución (Código PHP)

El desarrollador debe ubicar el archivo donde definió el endpoint `PUT /order` (probablemente en `functions.php` o un plugin de snippets) y agregar el siguiente bloque de código antes de hacer `$order->save()`:

### 💻 Código a Agregar:

```php
// Obtener datos del request
$data = $request->get_json_params();

// === BLOQUE APEGAR: SOPORTE PARA META_DATA ===
if (!empty($data['meta_data']) && is_array($data['meta_data'])) {
    foreach ($data['meta_data'] as $meta) {
        if (isset($meta['key'], $meta['value'])) {
            // update_meta_data maneja tanto creación como actualización
            $order->update_meta_data($meta['key'], $meta['value']);
        }
    }
}
// =============================================

// Guardar cambios
$order->save();
```

---

## 🔄 Alternativa (Sin Tocar Código)

Si no quieren modificar su API personalizada, pueden usar la **API Estándar de WooCommerce** que ya trae esta funcionalidad nativa:

**Endpoint:**
`PUT /wp-json/wc/v3/orders/{id}`

**Body:**
```json
{
  "meta_data": [
    {"key": "_shipping_company", "value": "Coordinadora"},
    {"key": "_shipping_tracking_number", "value": "123456789"}
  ]
}
```

Esta opción funciona **inmediatamente** sin cambios de código.

---

## 🔍 Resumen para el Desarrollador

1. Tu endpoint `custom-api/v1/order` está ignorando el campo `meta_data`.
2. Tienes que agregar un bucle `foreach` para procesar `meta_data` y llamar a `$order->update_meta_data()`.
3. O usa el endpoint nativo de WooCommerce `wc/v3/orders`.
