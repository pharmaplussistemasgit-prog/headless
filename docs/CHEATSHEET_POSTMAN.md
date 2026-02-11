# 📋 Cheat Sheet: Enviar Tracking desde Postman

## 🚀 Configuración Rápida (5 minutos)

### 1️⃣ Obtener Credenciales

**WordPress Admin → WooCommerce → Configuración → Avanzado → REST API → Agregar clave**

```
Consumer Key:    ck_XXXXXXXXXXXXXXXX
Consumer Secret: cs_XXXXXXXXXXXXXXXX
```

---

### 2️⃣ Configurar Postman

**Método:** `PUT`

**URL:**
```
https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/{ID_PEDIDO}
```

**Authorization:**
- Type: `Basic Auth`
- Username: `ck_XXXXXXXXXXXXXXXX`
- Password: `cs_XXXXXXXXXXXXXXXX`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "meta_data": [
    {
      "key": "_shipping_company",
      "value": "Coordinadora"
    },
    {
      "key": "_shipping_tracking_number",
      "value": "123456789"
    }
  ]
}
```

---

## 📝 Nombres de Campos

| Campo | Valor | Descripción |
|-------|-------|-------------|
| `_shipping_company` | `"Coordinadora"` | Nombre de la transportadora |
| `_shipping_tracking_number` | `"123456789"` | Número de guía |

---

## 🏢 Transportadoras Soportadas

```
Coordinadora
Servientrega
Interrapidisimo
Envia
Liberty Express
4-72
FedEx
Mensajeros Urbanos
Deprisa
TCC
```

---

## ✅ Ejemplo Completo

```http
PUT https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
Authorization: Basic ck_xxx:cs_xxx
Content-Type: application/json

{
  "meta_data": [
    {"key": "_shipping_company", "value": "Coordinadora"},
    {"key": "_shipping_tracking_number", "value": "123456789"}
  ]
}
```

**Respuesta esperada:** `200 OK`

---

## 🔍 Verificar

### En la API:
```http
GET https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
```

Busca:
```json
{
  "shipping_company": "Coordinadora",
  "shipping_tracking_number": "123456789"
}
```

### En WordPress Admin:
**WooCommerce → Pedidos → #23183**

Busca la sección: **"Información de Envío 🚚"**

### En el Frontend:
**`/mi-cuenta/pedidos` → Abrir pedido → Ver botón "Rastrear Pedido"**

---

## 🐛 Errores Comunes

| Error | Solución |
|-------|----------|
| `401 Unauthorized` | Verifica credenciales |
| `404 Not Found` | Verifica ID del pedido |
| `400 Bad Request` | Verifica formato JSON |
| Datos no se muestran | Instala el snippet de WordPress |

---

## 📦 Colección de Postman

Importa este JSON en Postman:

**Archivo:** `WooCommerce_Tracking.postman_collection.json`

[Ver archivo completo en: `docs/GUIA_DESARROLLADOR_POSTMAN.md`]

---

## 📚 Documentación Completa

- **Guía completa:** `docs/GUIA_DESARROLLADOR_POSTMAN.md`
- **Campos técnicos:** `docs/CAMPOS_TRACKING_ENVIO.md`
- **Solución de problemas:** `docs/SOLUCION_TRACKING_NO_MUESTRA.md`
- **Snippet WordPress:** `docs/snippets/wordpress_order_tracking_snippet.php`

---

## 💡 Tips

1. **Usa variables de entorno** en Postman para las credenciales
2. **Guarda las requests** en una colección para reutilizar
3. **Prueba primero con GET** para ver la estructura del pedido
4. **Verifica siempre la respuesta** (debe incluir los campos nuevos)

---

**¿Listo?** Copia la configuración de Postman y empieza a enviar tracking. 🚀
