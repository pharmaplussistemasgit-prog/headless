# 🚀 Solución Definitiva: Endpoint Exclusivo de Tracking

Hemos creado un endpoint personalizado **exclusivamente para ti**, compatible con tu autenticación `X-API-KEY`.

No necesitas modificar tu código actual ni intentar conectarte a la API estándar de WooCommerce. Solo apunta tu petición a esta nueva URL.

---

## 🔗 Nuevo Endpoint

**URL:**
```http
https://tienda.pharmaplus.com.co/wp-json/pharma/v1/tracking/{ID_PEDIDO}
```

**Método:**
`POST` o `PUT`

**Headers (Tu autenticación actual):**
```http
X-API-KEY: rwYK B0nN kHbq ujB3 XRbZ slCt
Content-Type: application/json
```

---

## 📝 Body del Request

Puedes enviar los datos como te sea más cómodo (acepta varios formatos):

**Opción A (Simple y recomendada):**
```json
{
  "company": "Coordinadora",
  "tracking_number": "123456789"
}
```

**Opción B (Compatible con WooCommerce):**
```json
{
  "meta_data": [
    {"key": "_shipping_company", "value": "Coordinadora"},
    {"key": "_shipping_tracking_number", "value": "123456789"}
  ]
}
```

---

## ✅ Respuesta Esperada (200 OK)

```json
{
  "success": true,
  "message": "Tracking actualizado correctamente",
  "order_id": 23183,
  "data": {
    "company": "Coordinadora",
    "tracking": "123456789"
  }
}
```

---

## ⚡ Instrucciones

1. **Actualiza el snippet** en WordPress con el archivo adjunto (`wordpress_order_tracking_snippet.php`).
2. **Configura tu Postman/Código** para usar la nueva URL: `/wp-json/pharma/v1/tracking/{id}`
3. **Envía el request** con tu header `X-API-KEY`.

¡Y listo! Funcionará a la primera.
