# 📦 Campos de Tracking de Envío - Guía Técnica

## 📋 Resumen Ejecutivo

Este documento detalla los **campos personalizados (meta_data)** que se crearon en WooCommerce para gestionar la información de envío de pedidos, específicamente la **empresa transportadora** y el **número de guía**.

---

## 🚨 IMPORTANTE: Instalación del Snippet

**⚠️ PASO OBLIGATORIO:** Para que los campos funcionen correctamente, debes instalar el snippet de WordPress en tu sitio.

### Opción 1: Code Snippets Plugin (Recomendado)

1. **Instalar el plugin "Code Snippets"** en WordPress
2. Ir a **Snippets → Add New**
3. Copiar todo el contenido de `docs/snippets/wordpress_order_tracking_snippet.php`
4. Pegar en el editor del snippet
5. **Activar** el snippet
6. Guardar

### Opción 2: functions.php del tema

1. Ir a **Apariencia → Editor de temas**
2. Abrir el archivo `functions.php`
3. Copiar todo el contenido de `docs/snippets/wordpress_order_tracking_snippet.php`
4. Pegar al final del archivo
5. Guardar

### Opción 3: Plugin personalizado

1. Subir el archivo `wordpress_order_tracking_snippet.php` a `/wp-content/plugins/`
2. Ir a **Plugins → Plugins instalados**
3. Activar "PharmaPlus - Order Tracking Fields"

### ✅ Verificar Instalación

Después de instalar el snippet:

1. Ve a **WooCommerce → Pedidos**
2. Abre cualquier pedido
3. Deberías ver una nueva sección **"Información de Envío 🚚"** con:
   - Dropdown de **Transportadora**
   - Campo de texto para **Número de Guía**

---

## 🔑 Nombres de los Campos (Meta Keys)

Los campos personalizados que se utilizan en WooCommerce son:

### 1. **Empresa Transportadora**
```
Meta Key: _shipping_company
```
- **Tipo**: String
- **Descripción**: Nombre de la empresa de transporte (Coordinadora, Servientrega, etc.)
- **Valores sugeridos**:
  - `Coordinadora`
  - `Servientrega`
  - `Interrapidisimo`
  - `Envia`
  - `Liberty Express`
  - `4-72`
  - `FedEx`
  - `Mensajeros Urbanos`
  - `Deprisa`
  - `TCC`

### 2. **Número de Guía**
```
Meta Key: _shipping_tracking_number
```
- **Tipo**: String
- **Descripción**: Número de guía de rastreo del envío
- **Formato**: Alfanumérico (depende de cada transportadora)

---

## 🔌 Integración con la API de WooCommerce

### ✅ Enviar Datos desde el Administrador/API

Sí, el administrador puede enviar estos campos directamente a WooCommerce cuando crea o actualiza un pedido mediante la API REST.

### Ejemplo de Petición API

#### **Crear Pedido con Tracking**
```bash
POST https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders
```

**Body (JSON):**
```json
{
  "payment_method": "bacs",
  "payment_method_title": "Transferencia bancaria",
  "set_paid": true,
  "billing": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "address_1": "Calle 123",
    "city": "Bogotá",
    "state": "DC",
    "postcode": "110111",
    "country": "CO",
    "email": "juan@example.com",
    "phone": "3001234567"
  },
  "shipping": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "address_1": "Calle 123",
    "city": "Bogotá",
    "state": "DC",
    "postcode": "110111",
    "country": "CO"
  },
  "line_items": [
    {
      "product_id": 123,
      "quantity": 2
    }
  ],
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

#### **Actualizar Pedido Existente con Tracking**
```bash
PUT https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/{order_id}
```

**Body (JSON):**
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

---

## 🛠️ Implementación Técnica

### Backend (WordPress/WooCommerce)

Los campos se agregaron mediante un **snippet de WordPress** que:

1. **Agrega campos personalizados** en la página de edición del pedido en el admin
2. **Guarda los valores** en la meta_data del pedido
3. **Expone los campos en la API REST** de WooCommerce
4. **Inyecta la información en los emails** transaccionales

### Frontend (Headless Next.js)

#### **Componente: `OrderTracking.tsx`**
Ubicación: `components/order/OrderTracking.tsx`

**Props:**
```typescript
interface OrderTrackingProps {
    company: string;           // Nombre de la transportadora
    trackingNumber: string;    // Número de guía
}
```

**Funcionalidades:**
- ✅ Muestra el nombre de la transportadora
- ✅ Muestra el número de guía con formato mono
- ✅ Botón para copiar el número de guía al portapapeles
- ✅ Genera automáticamente el enlace de rastreo según la transportadora
- ✅ Botón "Rastrear Pedido" que abre el sitio de la transportadora

**URLs de Rastreo Soportadas:**
```typescript
const CARRIER_LINKS: Record<string, string> = {
    'coordinadora': 'https://coordinadora.com/rastreo/rastreo-de-guia/',
    'servientrega': 'https://www.servientrega.com/wps/portal/rastreo-envio',
    'interrapidisimo': 'https://interrapidisimo.com/sigue-tu-envio/',
    'envia': 'https://envia.co/',
    'liberty': 'https://iqpack.libertyexpress.com/SearchGuide?hreflang=es-co',
    '4-72': 'https://www.4-72.com.co/',
    'fedex': 'https://www.fedex.com/es-co/home.html',
    'mensajeros': 'https://mensajerosurbanos.com/',
    'deprisa': 'https://www.deprisa.com/rastreo',
    'tcc': 'https://tcc.com.co/rastreo/',
};
```

#### **Página: `/mi-cuenta/pedidos`**
Ubicación: `app/mi-cuenta/pedidos/page.tsx`

**Interface del Pedido:**
```typescript
interface Order {
    id: number;
    order_number: string;
    status: string;
    total: string;
    date_created: string;
    // ... otros campos
    shipping_company?: string;           // ← Campo de transportadora
    shipping_tracking_number?: string;   // ← Campo de número de guía
}
```

**Uso del Componente:**
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

## 📡 Flujo de Datos Completo

### 1. **Creación del Pedido**
```
Usuario realiza compra
    ↓
WooCommerce crea pedido
    ↓
Pedido NO tiene tracking inicialmente
```

### 2. **Asignación de Tracking (Opción A: Manual)**
```
Admin entra a WP Admin
    ↓
Edita el pedido
    ↓
Selecciona transportadora (dropdown)
    ↓
Ingresa número de guía
    ↓
Guarda → Se almacena en meta_data
```

### 3. **Asignación de Tracking (Opción B: API/Automatización)**
```
Sistema externo (SAP, n8n, etc.)
    ↓
Hace PUT a /wp-json/wc/v3/orders/{id}
    ↓
Envía meta_data con _shipping_company y _shipping_tracking_number
    ↓
WooCommerce actualiza el pedido
```

### 4. **Visualización en el Frontend**
```
Usuario entra a /mi-cuenta/pedidos
    ↓
API devuelve pedidos con meta_data
    ↓
Frontend mapea shipping_company y shipping_tracking_number
    ↓
Componente OrderTracking renderiza la información
    ↓
Usuario puede copiar guía y rastrear envío
```

---

## 🔐 Autenticación de la API

Para usar la API REST de WooCommerce necesitas:

### Consumer Key y Consumer Secret

```bash
# Ejemplo de autenticación
curl -X GET \
  'https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders' \
  -u 'ck_XXXXXXXXXXXXXXXX:cs_XXXXXXXXXXXXXXXX'
```

**Generar credenciales:**
1. WP Admin → WooCommerce → Configuración → Avanzado → REST API
2. Agregar clave
3. Copiar Consumer Key y Consumer Secret

---

## 📝 Ejemplo Completo: Actualizar Tracking desde n8n

### Workflow n8n

```json
{
  "nodes": [
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "PUT",
        "url": "https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/{{$json.order_id}}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpBasicAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "meta_data",
              "value": [
                {
                  "key": "_shipping_company",
                  "value": "{{$json.transportadora}}"
                },
                {
                  "key": "_shipping_tracking_number",
                  "value": "{{$json.numero_guia}}"
                }
              ]
            }
          ]
        }
      }
    }
  ]
}
```

---

## ✅ Checklist de Implementación

- [x] Snippet de WordPress creado
- [x] Campos expuestos en la API REST
- [x] Componente `OrderTracking.tsx` implementado
- [x] Integración en `/mi-cuenta/pedidos`
- [x] URLs de rastreo configuradas para 10 transportadoras
- [x] Funcionalidad de copiar guía
- [x] Validación de estados (no mostrar en cancelled/failed)
- [ ] Snippet de WordPress desplegado en producción (pendiente de confirmar)
- [ ] Integración con sistema de logística automatizado (pendiente)

---

## 🚀 Próximos Pasos Sugeridos

1. **Automatización**: Integrar con API de transportadoras para obtener guías automáticamente
2. **Notificaciones**: Enviar SMS/Email cuando se asigne un número de guía
3. **Webhook**: Configurar webhook para actualizar estado cuando la guía cambie
4. **Tracking en Tiempo Real**: Integrar APIs de rastreo para mostrar estado actual del envío

---

## 📞 Soporte

Para más información sobre la implementación, revisar:
- `docs/plan_desarrollo_31_puntos.md` (Punto 26)
- `docs/features/T26_guia_envio_PAUSADO.md`
- `components/order/OrderTracking.tsx`
- `app/mi-cuenta/pedidos/page.tsx`
