# 📘 PharmaPlus Headless - Documentación de Entrega (Handover)

**Versión:** 1.0.0
**Fecha de Entrega:** Enero 2026
**Tecnología:** Next.js 15 (App Router), React, Tailwind CSS, TypeScript.

---

## 🚀 1. Resumen Ejecutivo
Este proyecto es una aplicación **Headless Commerce**. Esto significa que el "Frente" (lo que ve el cliente) está separado del "Cerebro" (WordPress/WooCommerce).
-   **Frontend:** Construido en Next.js para máxima velocidad, SEO y experiencia de usuario moderna (SPA).
-   **Backend:** WordPress + WooCommerce gestionan productos, precios, stock y pedidos.
-   **Base de Datos Adicional:** Supabase (opcional/híbrido) o LocalStorage para funcionalidades offline-first como el Pastillero.

---

## 🛠️ 2. Guía Técnica (Para Desarrolladores)

### Requisitos Previos
-   Node.js 18+
-   NPM o Bun

### Instalación y Despliegue
1.  **Clonar repositorio:** `git clone <repo-url>`
2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    bun install
    ```
3.  **Ejecutar entorno local:**
    ```bash
    npm run dev
    ```
    El sitio cargará en `http://localhost:3000`.

### Variables de Entorno (.env)
El archivo `.env.local` es crítico. Contiene:
-   `NEXT_PUBLIC_WORDPRESS_API_URL`: URL de tu instalación WordPress.
-   `NEXT_PUBLIC_WOOCOMMERCE_KEY` / `SECRET`: Credenciales para leer productos.
-   `NEXT_PUBLIC_MAPBOX_TOKEN` (si aplica): Para mapas.

### Arquitectura de Carpetas
-   `/app`: Rutas del navegador (ej: `/app/pastillero` es la página `pharma.com/pastillero`).
-   `/components`: Piezas de LEGO reutilizables (Botones, Tarjetas de Producto, Header).
-   `/lib`: Lógica de negocio pura (Conexiones API, Autenticación, formateadores de moneda).
-   `/hooks`: Funcionalidades lógicas de React (ej: `useCart` para manejar el carrito).

---

## 🌟 3. Guía Detallada de Funcionalidades
A continuación, se detalla cada módulo desarrollado, qué hace y dónde encontrarlo.

### A. Pastillero Virtual (Virtual Pillbox)
Una herramienta para que los usuarios gestionen sus medicamentos y recordatorios.
-   **Funcionalidad:** Permite agregar medicamentos, establecer horarios (frecuencia), y marcar tomas como realizadas. Muestra un calendario semanal y dashboard diario (Mañana/Tarde/Noche).
-   **Tecnología:** Funciona **Local-First** (los datos se guardan en el navegador del usuario para privacidad y rapidez usando `localStorage`).
-   **Ubicación Código:**
    -   Página: `app/pastillero/page.tsx`
    -   Lógica: `hooks/useReminders.ts`
    -   Componentes: `components/pastillero/*`

### B. Sección de Financiamiento
Landing pages informativas para captar leads interesados en crédito.
-   **Estrategia:** "Información Primero". No obliga al registro inmediato.
-   **Módulos:**
    1.  **Bancolombia:** Landing corporativa con beneficios exclusivos.
    2.  **Crédito Libre:** Incluye un **Simulador Interactivo** (Visual) donde el usuario juega con monto y plazos.
    3.  **Wompi:** Página educativa sobre seguridad en pagos.
-   **Ubicación Código:** Carpeta `app/financiamiento/*`.

### C. Wishlist (Favoritos) y Comparador
Sistema avanzado para guardar y comparar productos.
-   **Wishlist:** Icono de corazón en cada producto. Guarda la lista en el navegador.
-   **Comparador:** Permite seleccionar hasta 3 productos en la página de Wishlist y ver una tabla comparativa (Precio, Marca, Stock) en un modal emergente.
-   **Ubicación Código:** `app/wishlist/page.tsx` y `components/wishlist/ComparisonModal.tsx`.

### D. Pharma Prime
Página de suscripción tipo membresía.
-   **Funcionalidad:** Muestra planes (Mensual/Anual), beneficios y preguntas frecuentes.
-   **Diseño:** Premium, con tablas de precios claras.
-   **Ubicación Código:** `app/prime/page.tsx`.

### E. Sistema de Usuarios y Header Dinámico
-   **Dropdown Inteligente:** El menú de usuario en el header (`AccountButton.tsx`) detecta si estás logueado.
    -   *Si NO estás logueado:* Muestra acceso rápido al Login.
    -   *Si ESTÁS logueado:* Despliega un menú completo con accesos a Prime, Cupones, Pedidos, etc.
-   **Account Sidebar:** Barra de navegación lateral en "Mi Cuenta" (`AccountNav.tsx`) organizada por secciones lógicas.

### F. Geolocalización Automática
-   **Funcionalidad:** Detecta la ciudad del usuario automáticamente al entrar, usando la API del navegador y OpenStreetMap.
-   **Uso:** Muestra la ciudad en el Header para personalizar la experiencia (preparado para filtrar stock por ciudad en el futuro).
-   **Código:** `hooks/useGeolocation.ts`.

---

## 📝 4. Guía de Mantenimiento y Edición

### ¿Cómo cambio un texto o una imagen?

#### Caso A: Productos (Precios, Nombres, Fotos)
**NO toques el código.** Ve a tu panel de administración de **WordPress / WooCommerce**.
1.  Edita el producto en WooCommerce.
2.  Guarda cambios.
3.  La web se actualiza automáticamente (puede requerir recargar caché según configuración).

#### Caso B: Banners y Páginas Estáticas (Quiénes Somos, Financiamiento)
Estos textos están en el código para mayor velocidad.
1.  **Texto de Financiamiento:** Ve a `app/financiamiento/bancolombia/page.tsx` y busca el texto a cambiar.
2.  **Imágenes de Banners:** Sube la nueva imagen a la carpeta `public/banners` y cambia el nombre del archivo en el componente `HeroSection.tsx`.
3.  **Menú:** Para agregar un link al menú, edita `components/layout/Header.tsx`.

### ¿Cómo cambio los colores de la marca?
El proyecto usa variables CSS globales.
-   Ve al archivo `app/globals.css`.
-   Busca `:root`.
-   Cambia los valores de `--color-pharma-blue` o `--color-pharma-green`. ¡Esto cambiará el color en TODOS los botones y textos de la web automáticamente!

---

## 📞 Soporte
Para cambios estructurales, nuevas funcionalidades complejas o errores de servidor (Error 500), se recomienda contactar al equipo de desarrollo.
