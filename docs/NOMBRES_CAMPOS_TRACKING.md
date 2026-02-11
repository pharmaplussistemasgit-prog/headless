# 📋 Nombres de Campos para Tracking de Envíos

## 🎯 Resumen

El desarrollador ya tiene conexión con WooCommerce. Solo necesita saber **qué campos llenar** cuando crea o actualiza un pedido.

---

## 🔑 Nombres de los Campos

### Campo 1: Empresa Transportadora
```
Nombre del campo: _shipping_company
Tipo: String
```

**Valores permitidos:**
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

### Campo 2: Número de Guía
```
Nombre del campo: _shipping_tracking_number
Tipo: String (alfanumérico)
```

**Ejemplo:** `123456789`, `GU-2024-001234`, `457585245`

---

## 📝 Cómo Enviar los Datos

### En la API REST de WooCommerce

Cuando cree o actualice un pedido, debe incluir estos campos en `meta_data`:

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

## ✅ Ejemplo Completo

### Crear Pedido con Tracking
```json
{
  "payment_method": "bacs",
  "billing": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com"
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

### Actualizar Pedido Existente
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

## 🔍 Verificar que Funcionó

### En la respuesta de la API

Después de crear/actualizar, la respuesta debe incluir:

```json
{
  "id": 23183,
  "shipping_company": "Coordinadora",
  "shipping_tracking_number": "123456789",
  ...
}
```

### En WordPress Admin

**WooCommerce → Pedidos → #23183**

Debe aparecer la sección: **"Información de Envío 🚚"**

### En el Frontend

**`/mi-cuenta/pedidos`** → El cliente verá el botón **"Rastrear Pedido"**

---

## 📊 Tabla de Referencia Rápida

| Campo | Nombre Técnico | Tipo | Ejemplo |
|-------|----------------|------|---------|
| Transportadora | `_shipping_company` | String | `"Coordinadora"` |
| Número de Guía | `_shipping_tracking_number` | String | `"123456789"` |

---

## 💡 Notas Importantes

1. ✅ Los campos son **opcionales** (no rompen el pedido si no se envían)
2. ✅ Pueden enviarse al **crear** o **actualizar** el pedido
3. ✅ El guion bajo `_` al inicio es **obligatorio**
4. ✅ Los nombres deben ser **exactamente** como se muestran (case-sensitive)
5. ✅ Si solo tiene uno de los dos campos, puede enviar solo ese

---

## 🚀 Eso es Todo

El desarrollador solo necesita agregar estos dos campos a su integración existente con WooCommerce.

**Nombres de los campos:**
- `_shipping_company`
- `_shipping_tracking_number`

**Ubicación:** Dentro de `meta_data` del pedido.

---

## 📞 Contacto

Si tiene dudas sobre cómo se muestran los datos o necesita más información técnica, puede revisar:

- **Documentación técnica completa:** `docs/CAMPOS_TRACKING_ENVIO.md`
- **Ubicación del botón en frontend:** `docs/UBICACION_BOTON_RASTREAR.md`
