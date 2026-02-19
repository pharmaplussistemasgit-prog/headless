# 📋 Tareas Pendientes del Proyecto

Este documento rastrea las tareas pendientes para completar la integración del sistema y nuevas funcionalidades.

## 🚀 Prioridad Alta: Sistema de Correos (Resend)

Actualmente, el código para el envío de correos (Bienvenida, Formularios, Envíos) está implementado en la aplicación Next.js, pero **falta la configuración del servicio Resend** para que funcionen.

### 1. Configuración de API Key
- [ ] **Crear cuenta/Login en Resend:** Ir a [resend.com](https://resend.com).
- [ ] **Obtener API Key:** Generar una nueva clave con permisos de envío (`sending access`).
- [ ] **Configurar en Local:** Agregar la clave en el archivo `.env.local` en la variable `RESEND_API_KEY`.
- [ ] **Configurar en Producción (Vercel):** Agregar la misma variable de entorno en el panel de Vercel.

### 2. Verificación de Dominio
- [ ] **Verificar Dominio:** En el dashboard de Resend, agregar y verificar el dominio `pharmaplus.com.co`.
- [ ] **Configurar DNS:** Agregar los registros TXT/CNAME que Resend proporcione en el proveedor de dominio (GoDaddy, HostGator, etc.).
  - *Nota:* Sin esto, los correos saldrán desde una dirección genérica de Resend o caerán en SPAM.

### 3. Webhooks de WooCommerce
- [ ] **Validar Webhook de Envíos:** Confirmar en WooCommerce > Ajustes > Avanzado > Webhooks que el webhook "Notificación Envíos (Next.js)" esté apuntando a la URL de producción correcta (`https://.../api/webhooks/orders/updated`).
- [ ] **Sincronizar Secretos:** Asegurarse de que el "Secret" del webhook en WooCommerce sea exactamente igual a la variable `WOOCOMMERCE_WEBHOOK_SECRET` en Vercel.

### 4. Pruebas de Flujo
- [ ] **Registro:** Crear un usuario nuevo y verificar recepción del correo de bienvenida.
- [ ] **Formularios:** Enviar un mensaje desde "Contáctenos" y verificar que llegue al correo del administrador (`pedidos@pharmaplus.com.co`) y la confirmación al usuario.
- [ ] **Pedidos:** Cambiar el estado de un pedido a "Completado" en WooCommerce y verificar el correo de envío con guía de rastreo.

---

## ✅ Completado Recientemente
*   **Fix Favoritos & Pedidos:** Se resolvió el error `TypeError: fetch failed` mejorando el manejo de errores en `wcFetchRaw` y la API de pedidos.
*   **Consolidación Mi Cuenta:** La sección de favoritos se movió de `/wishlist` a `/mi-cuenta/favoritos` para mayor consistencia.
*   **Navegación:** Se corrigieron los enlaces rotos en el sidebar y el dashboard de la cuenta (Favoritos, Pastillero, Perfil).

---

## 🛠️ Otras Tareas / Pendientes Técnicos
*   **Refinamiento de Correos:** Revisar si el correo de "Confirmación de Pedido" debe dispararse solo cuando el pago sea exitoso (estado `processing`) en lugar de cuando se crea (`pending`).
*   **Limpieza de Código:** Eliminar consoles.log excesivos una vez se validen los webhooks en producción.
*   **Direcciones:** Implementar el formulario de edición de direcciones (actualmente es solo visual).

