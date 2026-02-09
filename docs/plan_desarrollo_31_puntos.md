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

**Status:** 🟢 **FASE 1 COMPLETADA** (Mock Implementation) | 🔴 **FASE 2 PENDIENTE** (API Integration)

---

#### ✅ **IMPLEMENTACIÓN COMPLETADA (Fecha: 2026-02-06)**

Se implementó un sistema completo de promociones PTC ("Pague X Lleve Y") con datos mock que simula la tabla `wp_item_ptc` del ERP. La implementación incluye:

##### **Archivos Creados:**

1. **`types/promotion.ts`** → Definiciones TypeScript para promociones
   - `PromotionRule`: Estructura de regla de promoción
   - `ActivePromotion`: Promoción activa con descripción

2. **`services/promotions.ts`** → Servicio de promociones con mock data
   - `getActivePromotions()`: Obtiene todas las promociones activas
   - `getPromotionForProduct(sku)`: Verifica promoción por SKU
   - `getPromotedProductSkus()`: Lista de SKUs promocionados
   - **Mock Data:** 3 promociones de ejemplo (SKUs: 4652, 3294, 68146)

3. **`lib/enrichProducts.ts`** → Helper para enriquecer productos
   - `enrichProductsWithPromotions()`: Agrega datos de promoción a productos mapeados

##### **Archivos Modificados:**

1. **`types/product.ts`**
   - Agregado campo `promotion` a `MappedProduct` interface

2. **`lib/mappers.ts`**
   - Inicializa `promotion: null` en `mapWooProduct()`

3. **`app/ofertas/page.tsx`** → **REFACTORIZACIÓN COMPLETA**
   - Filtrado por SKUs con promociones activas
   - Filtro estricto de stock (`stockStatus: 'instock'`)
   - Enriquecimiento de productos con datos de promoción
   - UI mejorada con contador de productos activos
   - Manejo de estado vacío (sin promociones)

4. **`components/product/ProductCard.tsx`** → ✅ **Ya implementado**
   - Badge de promoción morado con animación pulse
   - Usa `getProductPromo()` para mostrar texto dinámico

##### **Funcionalidades Implementadas:**

✅ **Badges de Promoción**
- Se muestran en esquina superior izquierda de ProductCard
- Estilo: Fondo morado (`#9333ea`), animación pulse
- Texto dinámico: "🎁 Pague 2 Lleve 3", "🎁 Pague 1 Lleve 2", etc.

✅ **Página `/ofertas`**
- Muestra solo productos con promociones activas
- Filtro estricto por stock disponible
- Contador: "🎯 X productos con promoción activa"
- Mensaje cuando no hay promociones

✅ **Validaciones**
- Filtro de fechas (startDate/endDate)
- Filtro de stock (solo `instock`)
- Validación de SKU

✅ **Datos Mock Actuales:**
```typescript
// SKU 4652: Pague 2 Lleve 3 (vigente hasta 2026-12-31)
// SKU 3294: Pague 1 Lleve 2 (vigente hasta 2026-06-30)
// SKU 68146: Pague 3 Lleve 5 (vigente hasta 2026-12-31)
```

---

#### 🔴 **PENDIENTE: Integración con API Real**

##### **Problema Identificado:**
- **Endpoint Esperado:** `GET /wp-json/custom-api/v1/item-ptc`
- **Estado Actual:** ❌ **404 Not Found**
- **Causa:** La tabla `wp_item_ptc` NO está registrada en `CUSTOM_API_V3.3.md`

##### **Solución Requerida:**

**Paso 1: Modificar WordPress**
```php
// En CUSTOM_API_V3.3.md, agregar a $cmu_tables:
'item-ptc' => $GLOBALS['wpdb']->prefix . 'item_ptc',
```

**Paso 2: Actualizar `services/promotions.ts`**
- Reemplazar `MOCK_PROMOTIONS` con fetch a API real
- Mapear respuesta de API a estructura `PromotionRule[]`

**Paso 3: Configurar Variables de Entorno**
```bash
NEXT_PUBLIC_WORDPRESS_API_URL=https://tienda.pharmaplus.com.co
WORDPRESS_API_KEY=rwYK_B0nN_kHbq_ujB3_XRbZ_slCt
```

---

#### 📚 **Documentación Completa**

**Ubicación:** `docs/punto_19_mundo_ofertas_documentation.md`

**Contenido:**
- Arquitectura del sistema
- Flujo de datos completo
- Archivos creados/modificados con ejemplos
- Casos de uso
- Guía de migración a API real
- Checklist de implementación

**Referencias:**
- [Documentación Punto 19](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/punto_19_mundo_ofertas_documentation.md)
- [ERP-WordPress API Complete](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/erp_wordpress_api_complete.md)
- [Snippet #21: Beneficios B2C](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/docs/snippets/woocommerce_beneficios_b2c.php)

---

#### 🎯 **Próximos Pasos**

1. **Decisión:** ¿Desplegar API en WordPress o mantener mock temporalmente?
2. **Si API:** Modificar CUSTOM_API, desplegar, actualizar servicio
3. **Testing:** Validar badges, filtrado, y fechas de vigencia
4. **Producción:** Desplegar con promociones reales del ERP

---
   
   $get_primary = function($table) {
       $map = [
           // ... mapeos existentes
           $GLOBALS['wpdb']->prefix . 'item_ptc' => 'ITEM_PTC_ID', // Ajustar según PK real
       ];
       return $map[$table] ?? 'id';
   };
   ```

2. **Endpoints Disponibles Automáticamente:**
   - `GET /custom-api/v1/item-ptc` → Listar todas las promociones
   - `GET /custom-api/v1/item-ptc/{id}` → Obtener promoción específica
   - `POST /custom-api/v1/item-ptc` → Crear promoción
   - `PUT /custom-api/v1/item-ptc/{id}` → Actualizar promoción
   - `DELETE /custom-api/v1/item-ptc/{id}` → Eliminar promoción

##### **Opción B: Mock en Frontend (Temporal)**
- Crear servicio `services/promotions.ts` con datos hardcodeados para desarrollo.
- **Limitación:** No permite gestión dinámica de promociones desde WordPress.

#### 4. **Implementación Frontend (Una vez API disponible)**

##### **A. Servicio de Promociones** (`services/promotions.ts`)
```typescript
interface PromotionRule {
  sku: string;              // SKU del producto base
  giftSku: string;          // SKU del producto regalo
  buyQuantity: number;      // Cantidad mínima a comprar
  getQuantity: number;      // Cantidad de regalo
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
}

export async function getActivePromotions(): Promise<PromotionRule[]> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_URL}/item-ptc?filters[FECHA_INICIO]<=${today}&filters[FECHA_FIN]>=${today}`);
  return res.json();
}
```

##### **B. Componente de Tarjeta de Producto** (`components/ui/ProductCard.tsx`)
- Agregar badge visual "🎁 Pague X Lleve Y" cuando el producto tenga promoción activa.
- Mostrar rango de fechas de la promoción.

##### **C. Página Mundo Ofertas** (`app/ofertas/page.tsx`)
- Filtrar productos que tengan promociones activas en `item_ptc`.
- **Filtro de Stock:** Aplicar `stockStatus: 'instock'` para ocultar agotados (como solicitado).

##### **D. Página de Producto Individual** (`app/producto/[slug]/page.tsx`)
- Mostrar sección destacada con la promoción si aplica.
- Indicar cantidad necesaria para activar el beneficio.

#### 5. **Filtro de Stock (Punto Crítico)**
- **Requerimiento:** "Mostrar únicamente lo que tiene existencias"
- **Implementación:**
  - `lib/woocommerce.ts` → `getProducts()` ya soporta `stockStatus: 'instock'` por defecto.
  - Todas las secciones de homepage (Featured, Flash Deals, etc.) ya filtran por stock.
  - **Excepción:** El buscador (`/tienda?search=...`) muestra agotados (implementado en Punto 31).

#### 6. **Pendientes para Implementación**
- [ ] **WordPress:** Agregar `item-ptc` a CUSTOM_API_V3.3 y desplegar.
- [ ] **Frontend:** Crear servicio `services/promotions.ts`.
- [ ] **Frontend:** Actualizar `ProductCard.tsx` con badge de promoción.
- [ ] **Frontend:** Implementar lógica en `/ofertas` para listar solo productos con promociones activas.
- [ ] **Frontend:** Mostrar detalles de promoción en página de producto individual.
- [ ] **Testing:** Verificar que productos agotados NO aparecen en Mundo Ofertas.

**Decisión Requerida:** ¿Proceder con Opción A (desplegar API) u Opción B (mock temporal)?

---

### 20. Pastillero Virtual
**Requerimiento Cliente:** 
*   "Formulario de diligenciamento de dosis de medicamento diaria (...) la idea es enviar un recordatorio a traves de mensaje de texto para recordar la toma"
*   **Observación:** "Ver pastillero virtual de la pagina farmatodo.com.co. Activar el SMS"
**Status:** ✅ Implementado
**Detalle Técnico:**
*   **Servicio:** Implementado `lib/sms.ts` conectando con API Contacto Virtual.
*   **Frontend:** Página `/pastillero` creada con formulario funcional para pruebas.
*   **API:** Endpoint `/api/sms/send` configurado y asegurado para manejar los envíos.
*   **Detalles de Ejecución:**
    - Se unificó la ruta en `/mi-cuenta/pastillero`.
    - Se creó el formulario con persistencia de contacto (Nombre y Celular) y botón "Cancelar".
    - Se integró autocompletar inteligente de productos en el campo "Medicamento".
    - Se movió el historial de tratamientos al final de la página.
    - Se creó la página `/mi-cuenta/notificaciones` para evitar errores 404.
    - Integración SMS funcional.

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
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   **Estrategia:** WordPress Snippet + Headless Frontend.
*   **WordPress:** Implementado `wordpress_order_tracking_snippet.php` que agrega campos de "Transportadora" (Dropdown) y "Guía" en la edición del pedido, los expone en la API y los inyecta en emails transaccionales.
*   **Headless:** Implementado componente `OrderTracking.tsx` en `/mi-cuenta/pedidos`. Muestra la transportadora y genera el enlace de rastreo dinámico automáticamente (Servientrega, Coordinadora, etc.). Botón de copiado de guía incluido.

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
### 29. Historial de Pedidos Avanzado
**Requerimiento Cliente:** "Mejorar la visualización del historial, incluir filtros, detalle desplegable tipo acordeón y diseño limpio tipo factura."
**Status:** ✅ Ejecutada
**Detalle Técnico:**
*   **Interfaz:** Diseño de **Acordeón** (Colapsado por defecto) para mayor orden.
*   **Visualización:** Estilo "Factura" en el detalle de productos (Tabla de texto, sin imágenes, totales claros).
*   **Filtros:** Separación por Pestañas (Todos/Curso/Historial) y Filtro de Fecha única.
*   **Backend:** API `/api/orders` mejorada para búsqueda dual (ID/Email) y soporte de todos los estados personalizados de WooCommerce (`status: 'any'`).
*   **Tracking:** Integración visual de Línea de Tiempo (`OrderTimeline`) y Rastreo de Envío (`OrderTracking`) dentro del acordeón.

---

**Total:** 31 Puntos Documentados.
