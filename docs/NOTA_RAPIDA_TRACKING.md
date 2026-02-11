# 📌 NOTA RÁPIDA: Campos de Tracking

## Para el Desarrollador

Ya tienes conexión con WooCommerce. Solo necesitas llenar estos 2 campos cuando crees o actualices pedidos:

---

## 🔑 Campos

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

## 🏢 Transportadoras

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

## ✅ Eso es todo

Agrega esos campos a tu integración y automáticamente:
- ✅ Se mostrarán en el admin de WordPress
- ✅ Se expondrán en la API REST
- ✅ Aparecerá el botón "Rastrear Pedido" en el frontend

---

**Documentación completa:** `docs/NOMBRES_CAMPOS_TRACKING.md`
