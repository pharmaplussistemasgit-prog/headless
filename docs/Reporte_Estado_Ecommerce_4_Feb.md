# Reporte de Estado y Plan de Ejecución - E-commerce PharmaPlus
**Fecha:** 4 de Febrero, 2026
**Basado en:** `docs/Tareas_pendientes_ecommerce_4_feb.csv`

Este documento detalla el estado actual de cada requerimiento, nuestras observaciones técnicas y el plan de acción inmediato.

| N° | Tarea | Estado (Cliente) | Estado (Desarrollo) | Observaciones Técnicas | Plan de Ejecución / Detalle de lo Realizado |
|:---|:---|:---|:---|:---|:---|
| 1 | **Quienes somos** | OK | **Completado** | La página ya refleja la política de calidad actualizada. | Ninguna acción requerida. |
| 2 | **Trabaje con Nosotros y Contactenos** | En proceso | **Requiere Ajuste** | Actualmente existen las rutas `/trabaja-con-nosotros` y `/contacto`. Los formularios usan `JetFormBuilder`. | **Acción:** Verificar configuración de correo en WordPress (JetForm). <br> **Nota:** Los correos llegan a la dirección configurada en el formulario de WP, no en el código del front. |
| 3 | **Horarios de atencion y Direccion** | En proceso | **Pendiente** | El texto en el pie de página o header necesita actualización. | **Acción:** Actualizar texto estático a: <br> *Lun-Vie 7am-6pm, Sab 8am-12pm*. <br> Corregir línea fija a (601) 5934010. |
| 4 | **Ver ubicaciones en Mapa** | Ok | **Completado** | Integración de mapa funcional. | Ninguna acción requerida. |
| 5 | **Preferencias en Cookies** | Ok | **Completado** | Módulo de consentimiento implementado. | Ninguna acción requerida. |
| 6 | **Propuesta de valor** | Ok | **Completado** | Iconos agregados. | Ninguna acción requerida. |
| 7 | **Garantias y devoluciones** | Ok | **Pendiente Detalle** | El cliente indica que falta la cláusula de "no devoluciones en cadena de frío". | **Acción:** Agregar párrafo específico sobre cadena de frío en la página de Términos/Devoluciones. |
| 8 | **Politicas** | En proceso | **Pendiente Validación** | Se requiere verificar que todos los archivos PDF estén enlazados correctamente. | **Acción:** Revisar enlaces en `/politicas`. Confirmar que los archivos adjuntos recientes se hayan subido. |
| 9 | **Politica de cookies** | OK | **Completado** | Enlace y funcionalidad OK. | Ninguna acción requerida. |
| 10 | **Terminos y condiciones** | OK | **Completado** | Diseño unificado. | Ninguna acción requerida. |
| 11 | **Cotizar envio** | OK | **Requiere Datos** | El calculador funciona (`/api/shipping/calculate`), pero el cliente indica falta de tarifas/días exactos. | **Acción:** Solicitar/Actualizar tabla CSV de tarifas (`shipping-rates.ts`) con los valores y tiempos reales de la transportadora. |
| 12 | **Reversion de pago electronico** | Pendiente | **Pendiente** | Falta página o sección informativa. | **Acción:** Crear página `/reversion` o agregar sección en Footer con el texto legal de reversión de pagos. |
| 13 | **Peticiones quejas y reclamos (PQRS)** | Pendiente | **Pendiente** | Se requiere formulario específico. | **Acción:** Crear formulario PQRS conectado a API que envíe al correo `atencionalusuario@`. |
| 14 | **Registrese** | Pendiente | **Bug Crítico** | Reporte de "Error de página". Posible fallo en API JetForm o CORS. | **Acción:** Depurar flujo de registro (`/registro`). Verificar logs de API y conexión con WordPress. |
| 15 | **Configuracion de cuenta** | Pendiente | **Completado** | La sección `Mi Cuenta` ya permite editar perfil y ver pedidos. | **Acción:** Verificar acceso a cambio de contraseña. Confirmar funcionalidad con el cliente. |
| 16 | **Revisar Iconos de Categorias** | OK | **Completado** | Iconos ajustados. | Ninguna acción requerida. |
| 17 | **Tiendas** | OK | **Completado** | Página de tiendas con mapa. | Ninguna acción requerida. |
| 18 | **Opcion Menu Categorias** | OK | **Optimización** | Cliente reporta lentitud. | **Acción:** Optimizar carga de menú (lazy loading o caché de categorías). |
| 19 | **Mundo ofertas** | Pendiente | **Desarrollo Complejo** | Faltan reglas de negocio: "Pague X lleve Y", rangos de fecha visibles, acumulables. | **Acción:** <br> 1. Implementar lógica visual para promos complejas. <br> 2. Mostrar fechas de vigencia en ficha de producto. <br> 3. Validar reglas en carrito (Backend/WooCommerce debe soportarlo). |
| 20 | **Pastillero Virtual** | OK | **Integración** | Cliente pide "Activar SMS". | **Acción:** Integrar proveedor de SMS (ej. Twilio o pasarela local) en el cron job de recordatorios. |
| 21 | **Comprar por marca** | Pendiente | **Completado Parcial** | Existe `/laboratorios`. Falta asegurar que *todos* los laboratorios estén listados y vinculados. | **Acción:** Revisar `brands-data.ts` y asegurar cobertura total de marcas codificadas. |
| 22 | **Pagina de Producto** | Pendiente | **Varios Ajustes** | 1. Mostrar stock exacto (o mensaje). <br> 2. Popup "Sin existencias". <br> 3. Fechas promo. | **Acción:** <br> - Modificar `ProductInfo.tsx` para mostrar `stock_quantity`. <br> - Agregar lógica visual para fechas de oferta. |
| 23 | **Productos cadena de frio** | OK | **Completado** | Lógica de "Nevera" y fee adicional implementada en Checkout. | Ninguna acción requerida. |
| 24 | **Retiro en tienda (Bogotá)** | OK | **Completado** | Restricción por ciudad implementada. | Ninguna acción requerida. |
| 25 | **Check out (Pago)** | Observación | **Logica Convenios** | Cliente menciona "Hay dos convenios, pide una sola identificación". | **Acción:** <br> - Implementar *Dropdown* de selección de convenio (Coopmsd, Inicio TX, etc.) antes de pedir cédula. <br> - Integrar endpoints separados según selección. |
| 25.1 | **Envio y Fechas** | OK | **Completado/Mejora** | Calculador implementado. Falta bloquear Domingos/Festivos. | **Acción:** Actualizar `CheckoutForm` -> input fecha (`min`, `filter day`). Agregar array de festivos Colombia. |
| 25.2 | **Datos Facturación** | Pendiente | **Pendiente** | "Agregar teléfonos de contacto". | **Acción:** Asegurar que el campo teléfono se guarde como dato de facturación en la orden. |
| 25.3 | **Finalizar Compra (Lentitud)** | Pendiente | **Optimización** | "Se demora... limpia carrito si devuelve". | **Acción:** Revisar persistencia del carrito (Context/LocalStorage). Optimizar tiempos de respuesta API Checkout. |
| 26 | **Confirmación Envio** | Pendiente | **Pendiente** | Faltan datos de transportadora y guía en el correo. | **Acción:** Editar plantilla de correo (Email Template) y lógica de creación de orden para incluir metadatos de envío simulados o reales. |
| 26.1 | **Diseño Correo** | Pendiente | **Diseño** | "Realizar diseño a la confirmación de pedido". | **Acción:** Maquetar email transaccional HTML responsive con branding de PharmaPlus. |

## Resumen de Prioridades Inmediatas (Siguientes Pasos)

1.  **Bug Crítico:** Arreglar Registro de Usuarios (Item 14).
2.  **Contenido:** Actualizar Horarios y Textos Legales (Items 3, 7, 12).
3.  **Checkout:** Implementar Selector de Convenios (Item 25) y Bloqueo de Festivos (Item 25.1).
4.  **Ofertas:** Visualización de fechas y reglas "Pague X Lleve Y" (Item 19).
5.  **Correos:** Diseño y datos de transporte (Item 26).
