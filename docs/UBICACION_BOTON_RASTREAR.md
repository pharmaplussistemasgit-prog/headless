# 📍 Ubicación del Botón "Rastrear Pedido"

## ✅ Dónde SÍ aparece el botón

### 🌐 **Frontend Headless (Next.js)**

**Ubicación:** `/mi-cuenta/pedidos`

**Flujo del usuario:**

1. Usuario inicia sesión
2. Va a **Mi Cuenta → Mis Pedidos**
3. Ve la lista de pedidos
4. **Hace clic en un pedido** para expandirlo (acordeón)
5. Dentro del pedido expandido, al final, aparece:
   - 🚚 **Información de Envío**
   - Transportadora: Coordinadora
   - Número de Guía: 123456789
   - **[Botón "Rastrear Pedido"]** ← AQUÍ ESTÁ

---

## 🎨 Cómo se ve en el Frontend

```
┌─────────────────────────────────────────────────┐
│  Pedido #23183                    [v]           │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 Detalle de Facturación                      │
│  ┌───────────────────────────────────────────┐ │
│  │ Producto A    x2    $50.000              │ │
│  │ Producto B    x1    $30.000              │ │
│  │ Envío              $8.000                │ │
│  │ ─────────────────────────────────────────│ │
│  │ TOTAL              $88.000               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🚚 Información de Envío                        │
│  ┌───────────────────────────────────────────┐ │
│  │ COORDINADORA                              │ │
│  │ 123456789                    [📋]         │ │
│  │                                           │ │
│  │         [Rastrear Pedido 🔗]  ← AQUÍ     │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## ❌ Dónde NO aparece el botón

### 🔧 **Admin de WordPress**

En el admin de WordPress (donde editas el pedido) **NO hay botón "Rastrear Pedido"**.

Solo ves:
- ✅ Dropdown para seleccionar transportadora
- ✅ Campo de texto para ingresar número de guía
- ❌ **NO hay botón** (es solo para editar, no para rastrear)

**Por qué:** El admin es para que el administrador **ingrese** los datos, no para rastrear.

---

## 🔍 Condiciones para que aparezca el botón

El botón **solo se muestra** si:

1. ✅ El pedido tiene `shipping_company` O `shipping_tracking_number`
2. ✅ El estado del pedido NO es `cancelled` ni `failed`
3. ✅ El usuario expandió el acordeón del pedido

**Código relevante (líneas 304-309):**

```tsx
{(order.shipping_company || order.shipping_tracking_number) && 
 !['cancelled', 'failed'].includes(order.status) && (
    <OrderTracking
        company={order.shipping_company || ''}
        trackingNumber={order.shipping_tracking_number || ''}
    />
)}
```

---

## 🎯 Componente OrderTracking

**Archivo:** `components/order/OrderTracking.tsx`

**Qué hace:**

1. Recibe `company` y `trackingNumber`
2. Normaliza el nombre de la transportadora (ej: "coordinadora", "Coordinadora", "COORDINADORA")
3. Busca la URL de rastreo en el diccionario `CARRIER_LINKS`
4. Si encuentra la URL, muestra el botón **"Rastrear Pedido"**
5. Al hacer clic, abre la página de la transportadora en nueva pestaña

**URLs soportadas:**

- Coordinadora → `https://coordinadora.com/rastreo/rastreo-de-guia/`
- Servientrega → `https://www.servientrega.com/wps/portal/rastreo-envio`
- Interrapidísimo → `https://interrapidisimo.com/sigue-tu-envio/`
- Envia → `https://envia.co/`
- Liberty Express → `https://iqpack.libertyexpress.com/SearchGuide?hreflang=es-co`
- 4-72 → `https://www.4-72.com.co/`
- FedEx → `https://www.fedex.com/es-co/home.html`
- Mensajeros Urbanos → `https://mensajerosurbanos.com/`
- Deprisa → `https://www.deprisa.com/rastreo`
- TCC → `https://tcc.com.co/rastreo/`

---

## 🧪 Cómo Probar

### Paso 1: Asignar tracking al pedido

**Desde Postman:**
```bash
PUT https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
```

**Body:**
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

### Paso 2: Ver en el frontend

1. Ve a `https://tu-sitio.com/mi-cuenta/pedidos`
2. Inicia sesión con el usuario del pedido
3. Busca el pedido #23183
4. **Haz clic en el pedido** para expandirlo
5. Desplázate hacia abajo
6. Deberías ver:
   - 🚚 Información de Envío
   - COORDINADORA
   - 123456789 [📋]
   - **[Rastrear Pedido 🔗]** ← Botón azul

### Paso 3: Probar el botón

1. Haz clic en **"Rastrear Pedido"**
2. Debería abrir en nueva pestaña: `https://coordinadora.com/rastreo/rastreo-de-guia/`

---

## 🐛 Solución de Problemas

### Problema: "No veo el botón en el frontend"

**Checklist:**

1. ✅ ¿Instalaste el snippet de WordPress?
2. ✅ ¿El pedido tiene `shipping_company` o `shipping_tracking_number`?
3. ✅ ¿El estado del pedido NO es `cancelled` o `failed`?
4. ✅ ¿Expandiste el acordeón del pedido? (haz clic en el pedido)
5. ✅ ¿La API devuelve los campos correctamente?

**Verificar API:**
```bash
GET https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183
```

Deberías ver:
```json
{
  "id": 23183,
  "shipping_company": "Coordinadora",
  "shipping_tracking_number": "123456789"
}
```

### Problema: "El botón aparece pero no abre nada"

**Causa:** El nombre de la transportadora no coincide con ninguna clave del diccionario.

**Solución:**
1. Verifica que el nombre sea exactamente uno de estos:
   - Coordinadora
   - Servientrega
   - Interrapidisimo
   - Envia
   - Liberty Express
   - 4-72
   - FedEx
   - Mensajeros Urbanos
   - Deprisa
   - TCC

2. El componente normaliza a minúsculas y busca coincidencias parciales, así que "COORDINADORA" o "coordinadora" también funcionan.

---

## 📸 Capturas de Referencia

### Admin de WordPress (NO tiene botón)
```
┌─────────────────────────────────────┐
│ Información de Envío 🚚             │
├─────────────────────────────────────┤
│ Transportadora:                     │
│ [Coordinadora        ▼]             │
│                                     │
│ Número de Guía:                     │
│ [123456789          ]               │
└─────────────────────────────────────┘
```

### Frontend Headless (SÍ tiene botón)
```
┌─────────────────────────────────────┐
│ 🚚 Información de Envío             │
├─────────────────────────────────────┤
│ COORDINADORA                        │
│ 123456789              [📋 Copiar]  │
│                                     │
│      [Rastrear Pedido 🔗]           │
└─────────────────────────────────────┘
```

---

## ✅ Resumen

| Ubicación | ¿Tiene botón? | ¿Para qué sirve? |
|-----------|---------------|------------------|
| **Admin WordPress** | ❌ NO | Editar/ingresar datos |
| **Frontend Headless** | ✅ SÍ | Ver y rastrear envío |
| **Email al cliente** | ℹ️ Solo info | Mostrar datos (sin botón) |
| **Página "Gracias"** | ℹ️ Solo info | Mostrar datos (sin botón) |

El botón **"Rastrear Pedido"** es exclusivo del **frontend headless** en la página `/mi-cuenta/pedidos`.
