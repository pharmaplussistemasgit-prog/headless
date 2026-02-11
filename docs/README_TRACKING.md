# 📦 Sistema de Tracking de Envíos - Documentación Completa

## 📚 Índice de Documentación

Esta carpeta contiene toda la documentación del sistema de tracking de envíos para WooCommerce + Headless Next.js.

---

## 🎯 Para Empezar Rápido

### 👨‍💻 **Para Desarrolladores (Postman)**
1. **[CHEATSHEET_POSTMAN.md](./CHEATSHEET_POSTMAN.md)** ⭐ **EMPIEZA AQUÍ**
   - Configuración rápida en 5 minutos
   - Ejemplo completo de request
   - Valores permitidos

2. **[GUIA_DESARROLLADOR_POSTMAN.md](./GUIA_DESARROLLADOR_POSTMAN.md)**
   - Guía completa paso a paso
   - Obtener credenciales de WooCommerce
   - Ejemplos de uso
   - Colección de Postman importable
   - Solución de problemas

### 🔧 **Para Administradores (WordPress)**
3. **[SOLUCION_TRACKING_NO_MUESTRA.md](./SOLUCION_TRACKING_NO_MUESTRA.md)** ⭐ **SI NO FUNCIONA**
   - Diagnóstico del problema
   - Instalación del snippet
   - Verificación paso a paso

### 📖 **Documentación Técnica**
4. **[CAMPOS_TRACKING_ENVIO.md](./CAMPOS_TRACKING_ENVIO.md)**
   - Nombres de los campos (meta keys)
   - Integración con API REST
   - Flujo de datos completo
   - Ejemplos de API

5. **[UBICACION_BOTON_RASTREAR.md](./UBICACION_BOTON_RASTREAR.md)**
   - Dónde aparece el botón "Rastrear Pedido"
   - Diferencia entre Admin y Frontend
   - Condiciones para que aparezca
   - Capturas de referencia

---

## 📁 Archivos de Código

### WordPress
- **[snippets/wordpress_order_tracking_snippet.php](./snippets/wordpress_order_tracking_snippet.php)**
  - Snippet completo para WordPress
  - Agrega campos al admin
  - Expone en API REST
  - Muestra en emails

### Frontend (Next.js)
- **[components/order/OrderTracking.tsx](../components/order/OrderTracking.tsx)**
  - Componente de tracking
  - Botón "Rastrear Pedido"
  - URLs de transportadoras

- **[app/mi-cuenta/pedidos/page.tsx](../app/mi-cuenta/pedidos/page.tsx)**
  - Página de pedidos del usuario
  - Integración del componente OrderTracking

---

## 🔑 Información Clave

### Nombres de los Campos

```json
{
  "_shipping_company": "Coordinadora",
  "_shipping_tracking_number": "123456789"
}
```

### Transportadoras Soportadas

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

### Endpoints de API

**Actualizar pedido:**
```
PUT /wp-json/wc/v3/orders/{id}
```

**Obtener pedido:**
```
GET /wp-json/wc/v3/orders/{id}
```

---

## 🚀 Flujo de Implementación

### 1. **Instalación (Una sola vez)**

```
WordPress Admin
    ↓
Instalar snippet: wordpress_order_tracking_snippet.php
    ↓
Activar snippet
    ↓
✅ Listo para recibir datos
```

### 2. **Uso (Cada pedido)**

```
Desarrollador en Postman
    ↓
PUT /wp-json/wc/v3/orders/{id}
    ↓
Envía: shipping_company + tracking_number
    ↓
WooCommerce guarda en meta_data
    ↓
Snippet expone en API REST
    ↓
Frontend muestra botón "Rastrear Pedido"
    ↓
✅ Cliente puede rastrear su envío
```

---

## 📋 Checklist de Implementación

### WordPress
- [ ] Snippet instalado y activo
- [ ] Campos visibles en admin al editar pedido
- [ ] Credenciales de API generadas (Consumer Key/Secret)

### Postman
- [ ] Request configurada con Basic Auth
- [ ] Body JSON correcto
- [ ] Prueba exitosa (200 OK)
- [ ] Datos visibles en GET del pedido

### Frontend
- [ ] Componente OrderTracking funcional
- [ ] Botón "Rastrear Pedido" visible
- [ ] URLs de transportadoras correctas
- [ ] Botón abre sitio de rastreo

---

## 🐛 Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| Datos no se muestran en admin | Instalar snippet de WordPress |
| Error 401 en Postman | Verificar credenciales |
| Botón no aparece en frontend | Verificar que pedido tenga datos de tracking |
| URL de rastreo no abre | Verificar nombre de transportadora |

---

## 📞 Soporte

### Para Desarrolladores
- **Guía Postman:** `GUIA_DESARROLLADOR_POSTMAN.md`
- **Cheat Sheet:** `CHEATSHEET_POSTMAN.md`

### Para Administradores
- **Solución de problemas:** `SOLUCION_TRACKING_NO_MUESTRA.md`
- **Ubicación del botón:** `UBICACION_BOTON_RASTREAR.md`

### Documentación Técnica
- **Campos y API:** `CAMPOS_TRACKING_ENVIO.md`

---

## 🎓 Resumen Ejecutivo

**¿Qué hace este sistema?**

Permite que el administrador o un sistema externo (SAP, n8n, etc.) envíe la información de envío (transportadora y número de guía) a los pedidos de WooCommerce mediante la API REST. Esta información se muestra automáticamente en:

1. ✅ Admin de WordPress (para editar)
2. ✅ API REST (para consultar)
3. ✅ Frontend headless (con botón de rastreo)
4. ✅ Emails transaccionales
5. ✅ Página de "Gracias por tu compra"

**¿Qué necesita el desarrollador?**

1. Credenciales de WooCommerce (Consumer Key/Secret)
2. Configurar Postman según `CHEATSHEET_POSTMAN.md`
3. Enviar requests con los campos `_shipping_company` y `_shipping_tracking_number`

**¿Qué necesita el administrador?**

1. Instalar el snippet `wordpress_order_tracking_snippet.php`
2. Activarlo en WordPress
3. Verificar que los campos aparezcan en el admin

---

## 📅 Última Actualización

**Fecha:** 10 de febrero de 2026

**Versión:** 1.0.0

**Estado:** ✅ Implementado y funcional

---

## 🔗 Enlaces Rápidos

- [Snippet WordPress](./snippets/wordpress_order_tracking_snippet.php)
- [Componente Frontend](../components/order/OrderTracking.tsx)
- [Página de Pedidos](../app/mi-cuenta/pedidos/page.tsx)
- [Plan de Desarrollo](./plan_desarrollo_31_puntos.md) (Punto 26)

---

**¿Listo para empezar?** 

👉 **Desarrollador:** Lee `CHEATSHEET_POSTMAN.md`  
👉 **Administrador:** Lee `SOLUCION_TRACKING_NO_MUESTRA.md`
