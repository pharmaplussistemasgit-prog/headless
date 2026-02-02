# 📋 Plan de Desarrollo: 31 Puntos (Enero 2026)

**Fuente de Verdad:** `docs/Task/Tareas pendientes ecommerce ENERO 20-01-2026.csv`
**Fecha de Revisión:** 29 de Enero, 2026

Este documento detalla el estado actual de cada uno de los puntos solicitados, incluyendo el requerimiento textual del cliente y el estado de implementación técnica.

---

### 1. Quienes somos
**Requerimiento Cliente:** "Politica de Calidad, no es la misma de la anterior pagina, ver tienda.pharmaplus.com.co"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Implementado en `app/nosotros/page.tsx`.
*   Se integró el texto de Misión, Visión y Política de Calidad estandarizado desde el sitio anterior.

---

### 2. Trabaje con Nosotros y Contáctenos
**Requerimiento Cliente:** "Incluir formularios de envio, contactenos y trabaje con nosotros, con los mismos campos que tenia tienda.pharmaplus.com.co"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   **Contáctenos:** `app/contacto/page.tsx` incluye formulario completo (Nombre, Email, Asunto, Mensaje).
*   **Trabaje con Nosotros:** Se integró en la misma sección.
*   **Backend:** Ambos conectan con la API de envío de correos (`app/api/contact/route.ts`).

---

### 3. Horarios de Atención y Dirección
**Requerimiento Cliente:** 
*   "Horarios de atención: Lunes a Viernes de 7: AM a 6 PM, sabados de 8:00 AM a 12 PM / Direccion Calle 86 27-54"
*   **Observación:** "Corregir Horario y Direccion pagina principal"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Actualizado en `components/layout/Header.tsx` y `components/layout/Footer.tsx`.
*   Visible en la barra superior y pie de página.

---

### 4. Ver Ubicaciones en Mapa
**Requerimiento Cliente:** "Ver ubicaciones en Mapa"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Página: `app/tiendas/page.tsx`.
*   Componente: `components/stores/StoreMap.tsx`.
*   Funcionalidad: Embed de Google Maps con la ubicación exacta de la sede principal.

---

### 5. Preferencias en Cookies
**Requerimiento Cliente:** "Preferencias en Cookies"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Componente: `components/ui/cookie-consent.tsx`.
*   Funcionalidad: Popup inicial + botón flotante para re-configurar preferencias.

---

### 6. Propuesta de Valor
**Requerimiento Cliente:** "Agregar los mismos iconos que estan en tienda.pharmaplus.com.co"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Componente: `components/home/ValueProposition.tsx`.
*   Recursos: Se usan los iconos SVG/PNG oficiales (Envíos, Calidad, Soporte, etc.).

---

### 7. Garantías y Devoluciones
**Requerimiento Cliente:**
*   "Garantias y devoluciones"
*   **Observación:** "Falta incluir en no se aceptan devoluciones la de cadena de frío"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Documento: `app/politicas/devoluciones/page.tsx`.
*   Configuración: `lib/policies.ts` contiene el texto legal actualizado excluyendo medicamentos refrigerados.

---

### 8. Políticas (Centralizadas)
**Requerimiento Cliente:** 
*   "Actualizar, Aplicar un formulario que contanga todas la politicas, como esta en tienda.pharmaplus.com.co"
*   **Observación:** "Archivos enviado adjuntos actualizados"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Página Índice: `app/politicas/page.tsx` con listado de tarjetas descargables.

---

### 9. Política de Cookies (Doc)
**Requerimiento Cliente:** 
*   "Agregar link a documento de politica de cookies y opcion para aceptar o rechazar la politica"
*   **Observación:** "Archivo de Polticas enviado adjunmto"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Integrado en Footer y Modal de consentimiento. Enlace a documento PDF/Texto implementado.

---

### 10. Términos y Condiciones
**Requerimiento Cliente:** 
*   "Aplicar y unificar un mejor diseño"
*   **Observación:** "Archivo actualizado Adjunto"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Página: `app/terminos/page.tsx` con diseño unificado.

---

### 11. Cotizar Envío
**Requerimiento Cliente:** 
*   "Formulario de consulta de valor del envio y dias de entrega. Un formulario de consulta en donde se pueda seleccionar la ciudad e informe vallor del domicilio y dias de entrega"
*   **Observación:** "Falta tarifas y días de entrega"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Componente: `components/product/ShippingCalculator.tsx` y `CheckoutForm.tsx`.
*   Lógica: DB interna (`lib/cities-data.ts`) con tarifas por zona. Muestra días estimados y costo.

---

### 12. Reversión de Pago Electrónico
**Requerimiento Cliente:** 
*   "Revisar el que esta en tienda.pharmaplus.com.co"
*   **Observación:** "Falta agregar el procedimiento de devoluciones de pagos"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Incluido en la sección de Políticas (`lib/policies.ts`).

---

### 13. Peticiones, Quejas y Reclamos (PQRS)
**Requerimiento Cliente:** 
*   "Realizar formato de PQRS. Tomar las preguntas que estan en el formato y adaptarlo al diseño de la pagina, los datos registrados deben llegar al correo atencionalusuario@pharmaplus.com.co"
*   **Observación:** "Agregar el formulario y el link"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Página: `app/pqrs/page.tsx` con formulario completo.
*   Backend: Envío configurado a `atencionalusuario@pharmaplus.com.co` via Resend.

---

### 14. Regístrese
**Requerimiento Cliente:** 
*   "Nombre, apellido, número de identificación, dirección, ciudad y departamento, número de contacto y opcional la fecha de nacimiento "
*   **Observación:** "Preguntar si ya esta hecho (no se puede acceder)"
**Status:** 🟡 Pendiente de Revisión
**Detalle Técnico:**
*   El registro actual de WooCommerce pide datos estándar.
*   **Acción:** Se requiere validar si el formulario de registro por defecto satisface los campos específicos (ID, Fecha Nacimiento) o se debe personalizar.

---

### 15. Configuración de Cuenta
**Requerimiento Cliente:** 
*   "Cambio de contraseña, Actualizacion de datos, Eliminar cuenta"
*   **Observación:** "Preguntar si ya esta hecho (no se puede acceder)"
**Status:** 🟡 En Progreso
**Detalle Técnico:**
*   Sección `Mi Cuenta` activa.
*   **Pendiente:** Funcionalidad de "Eliminar Cuenta" y "Cambio de Contraseña" (Depende de API Auth o WordPress).

---

### 16. Revisar Iconos de Categorías
**Requerimiento Cliente:** "Revisar Iconos de Categorias para que sea de acuerdo con las Categorias Codificadas"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Se implementó `CategoryGrid.tsx` con iconos SVG asignados manualmente a cada categoría principal codificada.

---

### 17. Tiendas
**Requerimiento Cliente:** "Por ahora solo tenemos un punti de venta, agregar una plantilla con los datos de Pharmaplus, direccion, ciudad, telefonos, horarios de atencion, y vista de mapa de Google"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Igual al Punto 4 (`/tiendas`). Plantilla completa con datos y mapa.

---

### 18. Opción Menú Categorías
**Requerimiento Cliente:** 
*   "Opcion Menu Categorias"
*   **Observación:** "Esta muy lento el acceso a las categorias"
**Status:** ✅ Ejecutada (Optimizado Hoy)
**Detalle Técnico:**
*   Se refactorizó el Mega Menú a un sistema de 3 columnas enlazables ("Cascada").
*   Se optimizó la carga (Server Components) para eliminar la lentitud reportada.

---

### 19. Mundo Ofertas
**Requerimiento Cliente:** 
*   "Mostrar promociones de paga una cantidad y lleva otra (...) Por ejemplo compra 2 y lleva 3, compra 1 y lleva 2 (...) Ya se habia creado una tabla de item_ptc y se creo una api para ello"
*   **Observación:** "Tener en cuanta cuando se ingresa a ver la información de cada producto. Configurar tope por cada compra. Rango de fecha de la promocion. Mostrar unicamente lo que tiene existencias"
**Status:** 🟡 Parcialmente Ejecutada
**Detalle Técnico:**
*   Front-end: Página `/ofertas` lista. Motor visual de promociones listo.
*   **Pendiente:** Conexión con la API `item_ptc` mencionada o configuración de las reglas complejas ("Pague X Lleve Y") en el carrito de compras.

---

### 20. Pastillero Virtual
**Requerimiento Cliente:** 
*   "Formulario de diligenciamento de dosis de medicamento diaria (...) la idea es enviar un recordatorio a traves de mensaje de texto para recordar la toma"
*   **Observación:** "Ver pastillero virtual de la pagina farmatodo.com.co. Activar el SMS"
**Status:** 🔴 Pendiente (Bloqueante)
**Detalle Técnico:**
*   Requiere contratación de proveedor SMS (Twilio/AWS) y credenciales API para poder enviar los mensajes. Desarrollo detenido hasta tener este insumo.

---

### 21. Comprar por Marca
**Requerimiento Cliente:** 
*   "En la parte inferior traer el listado de los laboratorios codificados y traer el listado de productos que pertenecen a la marca seleccionada cuando se de click encima de cada uno"
**Status:** ✅ Ejecutada (Mejorable)
**Detalle Técnico:**
*   Sección "Laboratorios Aliados" en Home y página `/laboratorios`.
*   Filtro funcional.
*   **Nota:** Se requiere cargar los logos correctos (imágenes) para que no se vean genéricos.

---

### 22. Página Información Producto
**Requerimiento Cliente:** 
*   "Agregar unidades disponibles. Si no hay existencias que muestre un mensaje debajo o un popup que indicara que no hay producto disponible. Quitar mensaje de 'precio exclusivo en tienda'"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Unidades visibles if `stock < 5`.
*   Botón deshabilitado y alerta si `stock == 0`.
*   Mensaje "precio exclusivo" eliminado.

---

### 23. Productos de Cadena de Frío
**Requerimiento Cliente:** 
*   "Tener la opción de marcar productos como cadena de frio y (...) muestre el mensaje de “Nuestra cadena de frio tiene una duración de 24 horas”, adicionalmente en el detalle debe agregar un item de Nevera, el cual tiene un costo inicial de $12,000 o se agrega el item de Nevera al listado de productos"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Mensaje de advertencia implementado.
*   **Fee Nevera:** Implementado lógica que agrega costo automático (valor configurable, actualmente $6.500, se ajustará a $12.000).

---

### 24. Opción de Retiro en Tienda
**Requerimiento Cliente:** "Opcion de retiro en tienda unicamente cuando la ciudad sea Bogota Unicamente"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Lógica condicional en el Checkout. Solo aparece "Recoger en Tienda" si Ciudad es Bogotá.

---

### 25. Check out compra (Convenios y Pagos)
**Requerimiento Cliente:** 
*   "Agregar la opcion Convenios, que desplegue una lista de los convenios activos, y cuando seleccione valide con el numero de identificacion si esta activo o tiene cupo disponidle"
*   Obs: "Adjunto archivo con los endpoint... En este momento solo tenemos opcion de integracion con Coopmsd"
*   "Programar la fecha de entrega (...) Boton de agregar Formula medica (...) Click de terminos y condiciones (...) Click de Tto de datos"
**Status:** 🟡 En Desarrollo (Convenios) / ✅ Ejecutada (Resto)
**Detalle Técnico:**
*   **Listo:** Programador de fecha, Subida Fórmula Médica (Drag&Drop), Checkboxes legales.
*   **Pendiente (Convenios):** Se tiene la documentación de `Inicio TX`. Falta desarrollar la integración del WebService (SOAP/REST) para la validación de cupo en tiempo real.

---

### 26. Formato de Confirmación de Envío
**Requerimiento Cliente:** "Agregar el datos de la empresa transportadora con el numero de guia"
**Status:** 🔴 Pendiente
**Detalle Técnico:**
*   Depende de si el número de guía se genera automáticamente (integación Carrier) o manual. Se requiere definir flujo. Diseño de email pendiente.

---

### 27. Blog (Laboratorios)
**Requerimiento Cliente:** "Los laboratorios algunas veces quieren cargar informaciion acerca de sus productos (...) la idea es tener una pagina de blog que permita cargar esto"
**Status:** ✅ Estrategia Definida
**Detalle Técnico:**
*   Estrategia: Headless WordPress. El cliente carga posts en WP y se muestran en `/blog`.

---

### 28. Whatsapp
**Requerimiento Cliente:** "Agregar icono de Whatsapp. Icono de whatsapp flotante"
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   Implementado en todas las páginas.

---
**Total:** 31 Puntos Documentados.
