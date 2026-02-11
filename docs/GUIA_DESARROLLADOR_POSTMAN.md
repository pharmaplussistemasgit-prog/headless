# 📮 Guía para Desarrollador: Enviar Tracking desde Postman a WordPress

## 🎯 Objetivo

Configurar Postman para enviar la **empresa transportadora** y el **número de guía** a los pedidos de WooCommerce mediante la API REST.

---

## 🔑 Paso 1: Obtener Credenciales de WooCommerce

### 1.1 Generar Consumer Key y Consumer Secret

1. Inicia sesión en WordPress como administrador
2. Ve a **WooCommerce → Configuración → Avanzado → REST API**
3. Haz clic en **"Agregar clave"**
4. Configura:
   - **Descripción:** `API Tracking - Postman`
   - **Usuario:** Selecciona tu usuario administrador
   - **Permisos:** `Lectura/Escritura`
5. Haz clic en **"Generar clave API"**
6. **COPIA Y GUARDA** las credenciales:
   ```
   Consumer Key:    ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   Consumer Secret: cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

⚠️ **IMPORTANTE:** Guarda estas credenciales en un lugar seguro. No se volverán a mostrar.

---

## 🔧 Paso 2: Configurar Postman

### 2.1 Crear una Nueva Request

1. Abre Postman
2. Haz clic en **"New" → "HTTP Request"**
3. Dale un nombre: `WooCommerce - Actualizar Tracking`

### 2.2 Configurar la Request

**Método:** `PUT`

**URL:**
```
https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/{order_id}
```

Reemplaza `{order_id}` con el ID del pedido. Ejemplo:
```
https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
```

### 2.3 Configurar Autenticación

1. Ve a la pestaña **"Authorization"**
2. Selecciona **Type:** `Basic Auth`
3. Ingresa:
   - **Username:** Tu `Consumer Key` (ck_...)
   - **Password:** Tu `Consumer Secret` (cs_...)

### 2.4 Configurar Headers

Ve a la pestaña **"Headers"** y agrega:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |

### 2.5 Configurar Body

1. Ve a la pestaña **"Body"**
2. Selecciona **"raw"**
3. Selecciona **"JSON"** en el dropdown
4. Pega el siguiente JSON:

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

## 📋 Paso 3: Valores Permitidos

### Empresas Transportadoras (shipping_company)

Usa **exactamente** uno de estos valores:

```json
"Coordinadora"
"Servientrega"
"Interrapidisimo"
"Envia"
"Liberty Express"
"4-72"
"FedEx"
"Mensajeros Urbanos"
"Deprisa"
"TCC"
```

⚠️ **Importante:** Respeta mayúsculas y minúsculas para mejor visualización.

### Número de Guía (shipping_tracking_number)

- Puede ser cualquier texto alfanumérico
- Ejemplo: `"123456789"`, `"GU-2024-001234"`, `"457585245"`

---

## 🚀 Paso 4: Ejemplos de Uso

### Ejemplo 1: Actualizar pedido existente

**Request:**
```http
PUT https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
Authorization: Basic {base64(ck_xxx:cs_xxx)}
Content-Type: application/json

{
  "meta_data": [
    {
      "key": "_shipping_company",
      "value": "Servientrega"
    },
    {
      "key": "_shipping_tracking_number",
      "value": "987654321"
    }
  ]
}
```

**Response esperada (200 OK):**
```json
{
  "id": 23183,
  "order_number": "23183",
  "status": "completed",
  "shipping_company": "Servientrega",
  "shipping_tracking_number": "987654321",
  ...
}
```

### Ejemplo 2: Solo actualizar transportadora

```json
{
  "meta_data": [
    {
      "key": "_shipping_company",
      "value": "Coordinadora"
    }
  ]
}
```

### Ejemplo 3: Solo actualizar número de guía

```json
{
  "meta_data": [
    {
      "key": "_shipping_tracking_number",
      "value": "123456789"
    }
  ]
}
```

### Ejemplo 4: Actualizar tracking + estado del pedido

```json
{
  "status": "completed",
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

## 🔍 Paso 5: Verificar que Funcionó

### 5.1 Verificar en la API

Haz una petición GET al mismo pedido:

**Request:**
```http
GET https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
Authorization: Basic {base64(ck_xxx:cs_xxx)}
```

**Busca en la respuesta:**
```json
{
  "id": 23183,
  "shipping_company": "Coordinadora",
  "shipping_tracking_number": "123456789",
  ...
}
```

### 5.2 Verificar en WordPress Admin

1. Ve a **WooCommerce → Pedidos**
2. Abre el pedido #23183
3. Busca la sección **"Información de Envío 🚚"**
4. Deberías ver:
   - **Transportadora:** Coordinadora
   - **Número de Guía:** 123456789

### 5.3 Verificar en el Frontend

1. Ve a `https://tu-sitio.com/mi-cuenta/pedidos`
2. Inicia sesión con el usuario del pedido
3. Abre el pedido #23183
4. Deberías ver el componente de tracking con el botón **"Rastrear Pedido"**

---

## 🔄 Paso 6: Automatización (Opcional)

### Usando Variables en Postman

Crea variables de entorno para reutilizar:

**Variables:**
```
base_url: https://tienda.pharmaplus.com.co
consumer_key: ck_XXXXXXXXXXXXXXXX
consumer_secret: cs_XXXXXXXXXXXXXXXX
```

**URL actualizada:**
```
{{base_url}}/wp-json/wc/v3/orders/{{order_id}}
```

### Script de Postman (Pre-request)

Si quieres generar automáticamente el número de guía:

```javascript
// Pre-request Script
const timestamp = Date.now();
const trackingNumber = `GU-${timestamp}`;
pm.environment.set("tracking_number", trackingNumber);
```

**Body actualizado:**
```json
{
  "meta_data": [
    {
      "key": "_shipping_company",
      "value": "Coordinadora"
    },
    {
      "key": "_shipping_tracking_number",
      "value": "{{tracking_number}}"
    }
  ]
}
```

---

## 🐛 Solución de Problemas

### Error 401: Unauthorized

**Causa:** Credenciales incorrectas

**Solución:**
1. Verifica que copiaste correctamente el Consumer Key y Secret
2. Asegúrate de usar **Basic Auth** en Postman
3. Verifica que el usuario tenga permisos de administrador

### Error 404: Not Found

**Causa:** El pedido no existe o la URL es incorrecta

**Solución:**
1. Verifica que el ID del pedido sea correcto
2. Verifica la URL: `/wp-json/wc/v3/orders/{id}`

### Error 400: Bad Request

**Causa:** JSON mal formado

**Solución:**
1. Verifica que el JSON sea válido (usa un validador)
2. Asegúrate de que las comillas sean dobles `"`
3. Verifica que no falten comas

### Los datos se guardan pero no se muestran

**Causa:** Falta instalar el snippet de WordPress

**Solución:**
1. Instala el snippet `wordpress_order_tracking_snippet.php`
2. Actívalo en WordPress
3. Vuelve a hacer la petición

---

## 📊 Colección de Postman (Importar)

Copia este JSON y guárdalo como `WooCommerce_Tracking.postman_collection.json`:

```json
{
  "info": {
    "name": "WooCommerce - Tracking",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Actualizar Tracking",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"meta_data\": [\n    {\n      \"key\": \"_shipping_company\",\n      \"value\": \"Coordinadora\"\n    },\n    {\n      \"key\": \"_shipping_tracking_number\",\n      \"value\": \"123456789\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183",
          "protocol": "https",
          "host": [
            "tienda",
            "pharmaplus",
            "com",
            "co"
          ],
          "path": [
            "wp-json",
            "wc",
            "v3",
            "orders",
            "23183"
          ]
        },
        "auth": {
          "type": "basic",
          "basic": [
            {
              "key": "username",
              "value": "{{consumer_key}}",
              "type": "string"
            },
            {
              "key": "password",
              "value": "{{consumer_secret}}",
              "type": "string"
            }
          ]
        }
      }
    },
    {
      "name": "Obtener Pedido",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183",
          "protocol": "https",
          "host": [
            "tienda",
            "pharmaplus",
            "com",
            "co"
          ],
          "path": [
            "wp-json",
            "wc",
            "v3",
            "orders",
            "23183"
          ]
        },
        "auth": {
          "type": "basic",
          "basic": [
            {
              "key": "username",
              "value": "{{consumer_key}}",
              "type": "string"
            },
            {
              "key": "password",
              "value": "{{consumer_secret}}",
              "type": "string"
            }
          ]
        }
      }
    }
  ]
}
```

**Importar en Postman:**
1. Postman → File → Import
2. Selecciona el archivo JSON
3. Configura las variables de entorno con tus credenciales

---

## ✅ Checklist Final

Antes de enviar al desarrollador, asegúrate de:

- [ ] El snippet de WordPress está instalado y activo
- [ ] Tienes las credenciales de WooCommerce (Consumer Key y Secret)
- [ ] Probaste la petición en Postman y funciona
- [ ] Los datos se muestran en el admin de WordPress
- [ ] Los datos se muestran en el frontend headless
- [ ] El botón "Rastrear Pedido" funciona correctamente

---

## 📞 Soporte

Si el desarrollador tiene problemas, puede revisar:

- **Documentación completa:** `docs/CAMPOS_TRACKING_ENVIO.md`
- **Solución de problemas:** `docs/SOLUCION_TRACKING_NO_MUESTRA.md`
- **Ubicación del botón:** `docs/UBICACION_BOTON_RASTREAR.md`

---

## 🎓 Resumen Rápido

**Para actualizar tracking de un pedido:**

```bash
PUT https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/{ID_PEDIDO}
Authorization: Basic {consumer_key:consumer_secret}
Content-Type: application/json

{
  "meta_data": [
    {"key": "_shipping_company", "value": "Coordinadora"},
    {"key": "_shipping_tracking_number", "value": "123456789"}
  ]
}
```

**Campos:**
- `_shipping_company` → Nombre de la transportadora
- `_shipping_tracking_number` → Número de guía

**Eso es todo.** 🚀
