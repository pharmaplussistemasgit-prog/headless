# 📚 Documentación del Proyecto PharmaPlus

Bienvenido a la documentación centralizada del proyecto **PharmaPlus Headless E-commerce**.

---

## 🗂️ Estructura de Documentación

### 📘 [Technical](./technical/) - Documentación Técnica
Documentación sobre arquitectura, integraciones y sistemas técnicos.

- **[architecture.md](./technical/architecture.md)** - Arquitectura completa del sistema
- **[woocommerce-mapping.md](./technical/woocommerce-mapping.md)** - Mapeo de datos con WooCommerce
- **[search-system.md](./technical/search-system.md)** - Sistema de búsqueda en tiempo real
- **[supabase-setup.md](./technical/supabase-setup.md)** - Configuración de Supabase
- **[authentication.md](./technical/authentication.md)** - Sistema de autenticación
- **[design-system.md](./technical/design-system.md)** - Sistema de diseño y componentes

### ✨ [Features](./features/) - Funcionalidades
Documentación de funcionalidades implementadas.

- **[recent-features.md](./features/recent-features.md)** - Funcionalidades recientes
- **[key-improvements.md](./features/key-improvements.md)** - Mejoras clave del sistema

### 💡 [Proposals](./proposals/) - Propuestas
Propuestas de diseño y arquitectura para nuevas funcionalidades.

- **[sidebar-strategy.md](./proposals/sidebar-strategy.md)** - Estrategia de sidebars
- **[smart-sidebar.md](./proposals/smart-sidebar.md)** - Sidebar inteligente
- **[filter-system.md](./proposals/filter-system.md)** - Sistema de filtros

### 📖 [Guides](./guides/) - Guías
Guías de desarrollo y onboarding.

- **[handover.md](./guides/handover.md)** - Guía de entrega del proyecto
- **[wordpress-checkout-snippet.md](./guides/wordpress-checkout-snippet.md)** - Snippet de checkout de WordPress

### 📝 [Work Logs](./work-logs/) - Registros de Trabajo
Registros diarios de trabajo y cambios realizados.

- **[2026-01-21.md](./work-logs/2026-01-21.md)** - Registro del 21 de enero de 2026

---

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos
1. Lee primero **[Handover](./guides/handover.md)** para entender el proyecto
2. Revisa la **[Arquitectura](./technical/architecture.md)** para conocer la estructura técnica
3. Consulta **[Funcionalidades Recientes](./features/recent-features.md)** para ver qué se ha implementado

### Para Desarrolladores Existentes
- Consulta **[Work Logs](./work-logs/)** para ver cambios recientes
- Revisa **[Proposals](./proposals/)** para propuestas en curso
- Actualiza **[Key Improvements](./features/key-improvements.md)** al implementar mejoras

---

## 📊 Datos del Proyecto

Los datos de configuración y mapeos se encuentran en la carpeta [`/data`](../data/):

- **[/data/mappings](../data/mappings/)** - Mapeos de WooCommerce (categorías, marcas, atributos)
- **[/data/audit](../data/audit/)** - Resultados de auditorías y verificaciones
- **[/data/cache](../data/cache/)** - Caché de productos

---

## 🛠️ Scripts

Los scripts de utilidad se encuentran en [`/scripts`](../scripts/). Consulta el [README de scripts](../scripts/README.md) para más información.

---

## 📌 Convenciones

### Nomenclatura de Archivos
- Usar **kebab-case** para nombres de archivo (ej: `search-system.md`)
- Nombres descriptivos y concisos
- Sin prefijos en mayúsculas

### Organización de Documentos
- **Technical**: Documentación técnica permanente
- **Features**: Documentación de funcionalidades (actualizar al agregar features)
- **Proposals**: Propuestas temporales (mover a Features cuando se implementen)
- **Guides**: Guías de referencia
- **Work Logs**: Registros cronológicos (formato: `YYYY-MM-DD.md`)

### Actualización de Documentación
- Actualizar documentación al implementar cambios significativos
- Crear work logs para sesiones de trabajo importantes
- Mover propuestas implementadas a Features

---

## 🔗 Enlaces Útiles

- [README Principal](../README.md)
- [Repositorio del Proyecto](#)
- [Sitio en Producción](https://headless-one-sigma.vercel.app/)

---

**Última actualización:** 21 de enero de 2026
