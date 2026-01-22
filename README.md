# 💊 PharmaPlus Headless E-commerce

Aplicación **Headless Commerce** construida con Next.js 15 para PharmaPlus, separando el frontend moderno del backend WordPress/WooCommerce.

---

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de Producción

```bash
# Crear build optimizado
npm run build

# Ejecutar build en producción
npm start
```

---

## 📚 Documentación

La documentación completa del proyecto está organizada en la carpeta [`/docs`](./docs/):

- **[📘 Technical](./docs/technical/)** - Arquitectura, integraciones y sistemas técnicos
- **[✨ Features](./docs/features/)** - Funcionalidades implementadas
- **[💡 Proposals](./docs/proposals/)** - Propuestas de diseño y arquitectura
- **[📖 Guides](./docs/guides/)** - Guías de desarrollo y onboarding
- **[📝 Work Logs](./docs/work-logs/)** - Registros de trabajo diarios

👉 **[Ver índice completo de documentación](./docs/README.md)**

---

## 🛠️ Scripts de Utilidad

El proyecto incluye **38 scripts** para mantenimiento, auditoría y migración:

```bash
# Auditar categorías
npx tsx scripts/audit-categories.ts

# Verificar cadena de frío
npx tsx scripts/verify-cold-chain.ts

# Generar reporte de inventario
npx tsx scripts/generate-inventory-report.ts
```

👉 **[Ver documentación completa de scripts](./scripts/README.md)**

---

## 📊 Estructura del Proyecto

```
pharma-headless-1a Netlify/
├── app/                    # Rutas y páginas (Next.js App Router)
├── components/             # Componentes React reutilizables
├── lib/                    # Lógica de negocio y utilidades
├── hooks/                  # React hooks personalizados
├── docs/                   # 📚 Documentación completa
├── scripts/                # 🛠️ Scripts de utilidad
├── data/                   # 📊 Datos y configuración
│   ├── mappings/          # Mapeos de WooCommerce
│   ├── audit/             # Resultados de auditorías
│   └── cache/             # Caché de productos
├── public/                 # Archivos estáticos
└── types/                  # Definiciones TypeScript
```

---

## 🔧 Tecnologías Principales

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Backend:** WordPress + WooCommerce (Headless)
- **Base de Datos:** Supabase (funcionalidades adicionales)
- **Estado:** React Context API
- **Despliegue:** Vercel

---

## 🌟 Funcionalidades Destacadas

- 🛒 **E-commerce Completo** - Catálogo, carrito, checkout
- 🔍 **Búsqueda en Tiempo Real** - Con debounce y filtros inteligentes
- 💊 **Pastillero Virtual** - Gestión de medicamentos y recordatorios
- ❄️ **Cadena de Frío** - Sistema especial para productos refrigerados
- 💳 **Múltiples Pasarelas** - Integración con Wompi, Bancolombia
- 📱 **PWA Ready** - Optimizado para móviles
- 🚀 **ISR & Performance** - Caché inteligente y optimizaciones

---

## ⚙️ Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
# WooCommerce API
NEXT_PUBLIC_WORDPRESS_API_URL=https://tu-sitio.com/wp-json
NEXT_PUBLIC_WOOCOMMERCE_KEY=ck_xxxxx
WOOCOMMERCE_SECRET=cs_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Otros servicios
NEXT_PUBLIC_MAPBOX_TOKEN=xxxxx
RESEND_API_KEY=re_xxxxx
```

---

## 📖 Guías Rápidas

### Para Nuevos Desarrolladores
1. Lee **[Handover](./docs/guides/handover.md)** para entender el proyecto
2. Revisa **[Arquitectura](./docs/technical/architecture.md)** para la estructura técnica
3. Consulta **[Funcionalidades Recientes](./docs/features/recent-features.md)**

### Para Cambiar Contenido
- **Productos:** Editar en WordPress/WooCommerce (no tocar código)
- **Textos estáticos:** Editar componentes en `/components`
- **Colores de marca:** Modificar variables en `app/globals.css`

---

## 🔗 Enlaces Útiles

- **[Sitio en Producción](https://headless-one-sigma.vercel.app/)**
- **[Panel WordPress](https://tienda.pharmaplus.com.co/wp-admin)**
- **[Documentación Next.js](https://nextjs.org/docs)**
- **[WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)**

---

## 📞 Soporte

Para cambios estructurales, nuevas funcionalidades o errores críticos, contactar al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** 21 de enero de 2026
