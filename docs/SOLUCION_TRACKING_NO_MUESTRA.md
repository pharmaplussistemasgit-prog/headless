# 🔧 Solución: Los campos de tracking no se muestran

## 🚨 Problema Identificado

Estás enviando correctamente los datos desde Postman:

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

✅ La API responde **200 OK** (los datos se guardan)  
❌ **NO se muestran en el admin de WordPress**  
❌ **NO se exponen en la API REST para el frontend**

---

## 💡 Causa del Problema

**Falta instalar el snippet de WordPress** que:
1. Crea los campos visuales en el admin
2. Expone los campos en la API REST
3. Los muestra en emails y página de gracias

---

## ✅ Solución Paso a Paso

### Paso 1: Instalar el Snippet en WordPress

#### Opción A: Usando Code Snippets (Recomendado)

1. **Instalar el plugin "Code Snippets"**
   - Ve a **Plugins → Añadir nuevo**
   - Busca "Code Snippets"
   - Instala y activa

2. **Crear el snippet**
   - Ve a **Snippets → Add New**
   - Dale un nombre: `PharmaPlus Order Tracking`
   - Copia TODO el contenido del archivo:
     ```
     docs/snippets/wordpress_order_tracking_snippet.php
     ```
   - Pega en el editor (sin las líneas de cabecera del plugin)
   - **Activa** el snippet
   - Guarda

#### Opción B: Subir como Plugin

1. **Subir el archivo**
   - Conecta por FTP/SFTP a tu servidor
   - Sube `wordpress_order_tracking_snippet.php` a:
     ```
     /wp-content/plugins/
     ```

2. **Activar el plugin**
   - Ve a **Plugins → Plugins instalados**
   - Busca "PharmaPlus - Order Tracking Fields"
   - Haz clic en **Activar**

---

### Paso 2: Verificar que Funciona

1. **En el Admin de WordPress**
   - Ve a **WooCommerce → Pedidos**
   - Abre el pedido #23183
   - Deberías ver una nueva sección **"Información de Envío 🚚"**
   - Verifica que muestra:
     - **Transportadora:** Coordinadora
     - **Número de Guía:** 123456789

2. **En la API REST**
   - Haz una petición GET al pedido:
     ```bash
     GET https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
     ```
   - Deberías ver en la respuesta:
     ```json
     {
       "id": 23183,
       "order_number": "23183",
       "shipping_company": "Coordinadora",
       "shipping_tracking_number": "123456789",
       ...
     }
     ```

3. **En el Frontend Headless**
   - Ve a `/mi-cuenta/pedidos`
   - Abre el pedido #23183
   - Deberías ver el componente de tracking con:
     - Nombre de la transportadora
     - Número de guía
     - Botón "Rastrear Pedido"

---

### Paso 3: Probar Actualización desde Postman

Una vez instalado el snippet, prueba de nuevo tu petición:

```bash
PUT https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
```

**Body:**
```json
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

Ahora SÍ debería:
- ✅ Guardarse en la base de datos
- ✅ Mostrarse en el admin de WordPress
- ✅ Exponerse en la API REST
- ✅ Mostrarse en el frontend headless

---

## 🔍 Diagnóstico: ¿Por qué no funcionaba antes?

### Sin el snippet:
```
Postman → API WooCommerce → Base de datos ✅
                                ↓
                         (Guardado en meta_data)
                                ↓
                         ❌ NO se expone en API REST
                         ❌ NO se muestra en admin
                         ❌ Frontend no puede leerlo
```

### Con el snippet:
```
Postman → API WooCommerce → Base de datos ✅
                                ↓
                         (Guardado en meta_data)
                                ↓
                    Snippet procesa los datos
                                ↓
                    ✅ Se expone en API REST
                    ✅ Se muestra en admin
                    ✅ Frontend lo lee y muestra
```

---

## 📋 Checklist de Verificación

Después de instalar el snippet, verifica:

- [ ] El snippet está activo en WordPress
- [ ] Al editar un pedido en WP Admin, ves la sección "Información de Envío 🚚"
- [ ] Al hacer GET a la API, ves `shipping_company` y `shipping_tracking_number`
- [ ] Al hacer PUT desde Postman, los datos se actualizan correctamente
- [ ] En `/mi-cuenta/pedidos` del frontend, se muestra el componente de tracking
- [ ] El botón "Rastrear Pedido" funciona y abre el sitio de la transportadora

---

## 🆘 Solución de Problemas

### Problema: "No veo la sección en el admin"

**Solución:**
1. Verifica que el snippet esté activo
2. Limpia la caché de WordPress
3. Recarga la página del pedido (Ctrl+F5)

### Problema: "La API no devuelve los campos"

**Solución:**
1. Verifica que el hook `woocommerce_rest_prepare_shop_order_object` esté registrado
2. Prueba desactivar y reactivar el snippet
3. Verifica que no haya errores PHP en el log

### Problema: "El frontend no muestra el tracking"

**Solución:**
1. Verifica que la API devuelva los campos correctamente
2. Revisa la consola del navegador por errores
3. Verifica que el componente `OrderTracking` esté importado correctamente

---

## 📞 Siguiente Paso

Una vez instalado el snippet, **prueba de nuevo tu petición de Postman** y confirma que ahora sí se muestra todo correctamente.

Si tienes algún problema, revisa el log de errores de WordPress en:
```
/wp-content/debug.log
```

(Asegúrate de tener `WP_DEBUG` activado en `wp-config.php`)
