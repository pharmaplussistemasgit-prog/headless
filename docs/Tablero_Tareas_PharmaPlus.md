# Tablero de Tareas PharmaPlus - Enero 2026

Este documento centraliza el estado de las tareas solicitadas en `docs/Task/Tareas pendientes ecommerce ENERO 20-01-2026.csv`.
Combina los requerimientos del cliente con el análisis técnico actual.

**Estados:**
*   ✅ **Completado**: La funcionalidad está implementada y lista para revisión.
*   🟡 **En Progreso**: Se está trabajando en ello o requiere ajustes menores/validación.
*   🔴 **Pendiente**: No se ha iniciado o está bloqueado por falta de información/recursos.

| ID | Tarea | Requerimiento Principal | Estado Cliente (CSV) | Estado Técnico Actual | Acciones / Comentarios Técnicos |
|:---:|---|---|---|---|---|
| **1** | Quienes somos | "Politica de Calidad, ver tienda.pharmaplus.com.co" | En proceso | ✅ Completado | Implementado en `app/nosotros/page.tsx`. Textos actualizados. |
| **2** | Trabaje con Nosotros y Contactenos | Formularios con mismos campos que sitio anterior | En proceso | ✅ Completado | Integrado con JetFormBuilder (WP). Formularios funcionales en `/contacto`. |
| **3** | Horarios y Dirección | Actualizar horarios y dirección en Header/Footer | Pendiente | ✅ Completado | Datos actualizados globalmente en el Layout. |
| **4** | Ver ubicaciones en Mapa | Mapa con ubicación de tiendas | Pendiente | ✅ Completado | Implementado en `/tiendas` con Google Maps embed. |
| **5** | Preferencias Cookies | Popup y configuración de cookies | Pendiente | ✅ Completado | Sistema de consentimiento implementado (`cookie-consent.tsx`). |
| **6** | Propuesta de Valor | Iconos (Envíos, Calidad, etc.) | Pendiente | ✅ Completado | Sección de beneficios implementada en el Home. |
| **7** | Garantías y devoluciones | Texto de garantías. *Obs: Excluir cadena de frío* | En proceso | ✅ Completado | Página `/politicas/devoluciones` creada. Política de frío incluida. |
| **8** | Políticas | Formulario/ Índice de políticas | En proceso | ✅ Completado | `/politicas` centraliza todas las descargas/vistas de políticas. |
| **9** | Política de Cookies | Doc y opción aceptar/rechazar | En proceso | ✅ Completado | Vinculado en el Footer y modal de cookies. |
| **10** | Términos y condiciones | Unificar diseño | En proceso | ✅ Completado | `/terminos` con diseño limpio y unificado. |
| **11** | Cotizar envío | Formulario consulta valor/días | En proceso | ✅ Completado | Calculadora de envíos funcional en Checkout y Producto. (Tarifas base configuradas). |
| **12** | Reversión pago electrónico | Revisar y agregar procedimiento | Pendiente | ✅ Completado | Incluido en la documentación de políticas. |
| **13** | PQRS | Formato PQRS con envío a correo | Pendiente | ✅ Completado | `/pqrs` funcional, enviando a `atencionalusuario@pharmaplus.com.co`. |
| **14** | Regístrese | Campos específicos (ID, Fecha Nac.) | Pendiente | 🟡 En Revisión | El registro actual es estándar. Se debe confirmar si se requieren campos custom en el checkout/registro. |
| **15** | Configuración de cuenta | Cambiar pass, eliminar cuenta | Pendiente | 🟡 En Progreso | Panel "Mi Cuenta" existe. Faltan funciones avanzadas de gestión de cuenta (borrado/cambio pass directo). |
| **16** | Iconos de Categorías | Revisar iconos vs categorías codificadas | - | ✅ Completado | Grid de categorías en Home actualizado con iconos. |
| **17** | Tiendas | Info punto de venta y mapa | - | ✅ Completado | Idéntico al punto 4. Página `/tiendas` completa. |
| **18** | Opción Menú Categorías | Mejorar velocidad acceso | En proceso | ✅ Completado | Mega Menú optimizado y rediseñado para carga rápida. |
| **19** | Mundo ofertas | Promociones complejas (Pague X lleve Y) | Pendiente | 🟡 Parcial | Sección `/ofertas` lista. Falta lógica compleja de carrito para "Pague 2 Lleve 3" automático. |
| **20** | Pastillero Virtual | Recordatorios SMS dosis | En proceso | 🔴 Bloqueado | Requiere integración con proveedor SMS (Twilio/AWS). Funcionalidad frontend básica solamente. |
| **21** | Comprar por marca | Listado laboratorios y filtrado | Pendiente | ✅ Completado | Carrusel de marcas y página `/laboratorios` funcional. Faltan logos reales. |
| **22** | Info Producto | Stock visual, quitar "exclusivo tienda" | Pendiente | ✅ Completado | Stock visible si < 5. Botón desactiva en 0. Frases eliminadas. |
| **23** | Cadena de Frío | Aviso 24h y costo nevera extra | Pendiente | ✅ Completado | Lógica de recargo y alertas implementada para productos refrigerados. |
| **24** | Retiro en tienda | Solo para Bogotá | Pendiente | ✅ Completado | Restricción geográfica aplicada en Checkout. |
| **25** | Checkout (Convenios) | Integración Coopmsd / Inicio TX | Pendiente | 🟡 En Desarrollo | Flow de Checkout listo. **Falta integración técnica SOAP/REST con Convenios (Tarea Prioritaria).** |
| **26** | Confimación Envío | Dato transportadora y guía | Pendiente | 🔴 Pendiente | Depende de integración logística para obtener # guía real. Diseño email pendiente. |
| **27** | Blog (Laboratorios) | Carga de info productos/artículos | En proceso | ✅ Listo (Estrategia) | Sistema preparado para conectar con CMS (WordPress) bajo `/blog`. |
| **28** | Whatsapp | Icono flotante | Pendiente | ✅ Completado | Botón flotante activo en todo el sitio. |
| **29** | Subcategorías Belleza | Mostrar facial care en menú/home | - | ✅ Completado | Estructura de menú refleja categorías. |
| **30** | Medios de Pago | Iconos en footer (incluir Convenios) | - | ✅ Completado | Iconos visuales agregados. |
| **31** | Lista de deseos | Quitar del pie de página | - | ✅ Completado | Eliminado del footer. |

## Resumen de Prioridades Inmediatas (Siguientes Pasos)

1.  **Integración Convenios (Punto 25):** Es la tarea técnica más compleja y crítica pendiente. Se debe revisar la documentación de "Inicio TX" y construir el cliente de API para consultar cupos.
2.  **Pastillero Virtual (Punto 20):** Definir proveedor SMS para desbloquear desarrollo.
3.  **Mundo Ofertas (Punto 19):** Implementar lógica backend/carrito para promociones "Pague X Lleve Y" si es critico para lanzamiento.
4.  **Validación Visual:** Cargar logos de laboratorios (Punto 21) y revisar campos de registro (Punto 14).
