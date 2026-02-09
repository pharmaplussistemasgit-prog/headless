# **🎨 Google Stitch Skills \- Documentación Completa**

**Repositorio:** [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)  
**Organización:** Google Labs (oficial)  
**Fecha:** 2026-02-09  
**Total de Skills:** 6  
---

## **📋 Resumen Ejecutivo**

**Google Stitch Skills** es una biblioteca de skills para agentes de IA que se integra con el servidor MCP de Stitch. Estas skills están diseñadas para trabajar con **Stitch** (herramienta de Google para generar interfaces de usuario) y permiten:

* 🎨 Documentar sistemas de diseño  
* ⚛️ Convertir diseños a componentes React  
* 🔄 Construir sitios web completos iterativamente  
* ✨ Optimizar prompts para generación de UI  
* 🎬 Crear videos walkthrough profesionales  
* 🧩 Integrar componentes shadcn/ui

**Compatibilidad:** Antigravity, Gemini CLI, Claude Code, Cursor  
---

## **🔧 Skills Disponibles**

### 1\. **react:components** (3.8K instalaciones) ⭐

**Descripción:** Convierte diseños de Stitch en sistemas de componentes React modulares usando Vite.  
**Funcionalidades:**

* Transformación de diseños a código React limpio y modular  
* Validación basada en AST (Abstract Syntax Tree)  
* Consistencia de design tokens  
* Type safety con TypeScript  
* Integración con Tailwind CSS

**Cuándo usar:**

* Convertir prototipos de Stitch a código React de producción  
* Crear sistemas de componentes reutilizables  
* Mantener consistencia de diseño en componentes

**Proceso:**

1. **Retrieval:** Obtiene información del proyecto Stitch  
2. **Arquitectura:** Define estructura de componentes  
3. **Ejecución:** Genera código React con validación  
4. **Troubleshooting:** Manejo de errores y optimización

**Instalación:**  
bash  
npx skills add google-labs-code/stitch-skills \--skill react:components \--global  
**Tecnologías:**

* React  
* Vite  
* Tailwind CSS  
* TypeScript  
* shadcn/ui

---

### 2\. **design-md** (3.6K instalaciones) ⭐

**Descripción:** Analiza proyectos de Stitch y genera archivos `DESIGN.md` que documentan sistemas de diseño en lenguaje natural semántico.  
**Funcionalidades:**

* Extracción de identidad del proyecto (nombre, propósito, audiencia)  
* Definición de atmósfera y mood (imagen/HTML)  
* Mapeo de paleta de colores (Tailwind config/JSON)  
* Traducción de geometría y formas (CSS/Tailwind)  
* Descripción de profundidad y elevación

**Cuándo usar:**

* Documentar sistemas de diseño existentes  
* Crear guías de estilo para equipos  
* Optimizar prompts para generación de pantallas en Stitch  
* Mantener consistencia de diseño en proyectos

**Proceso de Análisis:**

1. **Extract Project Identity** → JSON con metadata  
2. **Define Atmosphere** → Imagen o HTML representativo  
3. **Map Color Palette** → Configuración Tailwind  
4. **Translate Geometry** → Patrones CSS/Tailwind  
5. **Describe Depth** → Sistema de elevación

**Output:** Archivo `DESIGN.md` estructurado  
**Instalación:**  
bash  
npx skills add google-labs-code/stitch-skills \--skill design-md \--global  
**Mejores prácticas:**

* Usar lenguaje descriptivo y semántico  
* Evitar valores hardcoded, usar tokens de diseño  
* Incluir ejemplos visuales cuando sea posible  
* Mantener el documento actualizado con cambios

---

### 3\. **stitch-loop** (2.8K instalaciones) 🔄

**Descripción:** Genera sitios web completos de múltiples páginas desde un solo prompt usando Stitch, con un patrón de loop autónomo tipo "baton-passing".  
**Funcionalidades:**

* Construcción iterativa de sitios web  
* Organización automática de archivos  
* Validación de cada iteración  
* Sistema de "baton" para tracking de progreso  
* Integración con sistemas de diseño

**El Sistema de Baton:** Un archivo JSON que rastrea:

* Páginas completadas  
* Siguiente tarea a realizar  
* Contexto del proyecto  
* Estado del sitio

**Protocolo de Ejecución:**

1. **Read the Baton** → Leer estado actual  
2. **Consult Context Files** → Revisar DESIGN.md, SITE.md  
3. **Generate with Stitch** → Crear nueva pantalla  
4. **Integrate into Site** → Agregar al proyecto  
5. **Visual Verification** (opcional) → Validar resultado  
6. **Update Site Documentation** → Actualizar SITE.md  
7. **Prepare Next Baton** → Definir siguiente tarea

**Cuándo usar:**

* Construir sitios web completos desde cero  
* Proyectos con múltiples páginas relacionadas  
* Necesitas automatización de flujo de trabajo  
* Quieres mantener consistencia entre páginas

**Instalación:**  
bash  
npx skills add google-labs-code/stitch-skills \--skill stitch-loop \--global  
**Estructura de archivos:**  
project/  
├── DESIGN.md          \# Sistema de diseño  
├── SITE.md            \# Documentación del sitio  
├── baton.json         \# Estado actual  
└── screens/           \# Pantallas generadas  
   ├── home.html  
   ├── about.html  
   └── contact.html  
---

### 4\. **enhance-prompt** (1.9K instalaciones) ✨

**Descripción:** Transforma ideas vagas de UI en prompts pulidos y optimizados para Stitch.  
**Funcionalidades:**

* Mejora de especificidad  
* Adición de keywords UI/UX  
* Inyección de contexto de sistema de diseño  
* Estructuración de output para mejores resultados

**Pipeline de Mejora:**

1. **Assess Input** → Analizar prompt original  
2. **Check for DESIGN.md** → Buscar sistema de diseño  
3. **Apply Enhancements:**  
   * Agregar especificidad técnica  
   * Incluir keywords de UI/UX  
   * Inyectar contexto de diseño  
   * Estructurar componentes  
4. **Format Output** → Prompt optimizado

**Cuándo usar:**

* Tienes una idea vaga de UI  
* Quieres mejorar calidad de generación  
* Necesitas consistencia con sistema de diseño  
* Buscas resultados más precisos de Stitch

**Ejemplo de Transformación:**  
**Input vago:**  
"make a login page"  
**Output optimizado:**  
Create a modern login screen with:  
\- Centered card layout with subtle shadow  
\- Email and password input fields with floating labels  
\- Primary CTA button "Sign In"  
\- Secondary link "Forgot password?"  
\- Social login options (Google, GitHub)  
\- Responsive design for mobile and desktop  
\- Use primary color: \#3B82F6  
\- Typography: Inter font family  
**Instalación:**  
bash  
npx skills add google-labs-code/stitch-skills \--skill enhance-prompt \--global  
---

### 5\. **shadcn-ui** (1.2K instalaciones) 🧩

**Descripción:** Guía experta para integrar y construir aplicaciones con componentes shadcn/ui.  
**Funcionalidades:**

* Descubrimiento de componentes  
* Instalación y configuración  
* Customización de componentes  
* Mejores prácticas  
* Optimización

**Áreas cubiertas:**

* Instalación inicial de shadcn/ui  
* Configuración de Tailwind CSS  
* Instalación de componentes individuales  
* Theming con CSS variables  
* Integración con Next.js  
* Patrones de composición  
* Accesibilidad (ARIA)

**Cuándo usar:**

* Integrar shadcn/ui en tu proyecto  
* Customizar componentes existentes  
* Aprender mejores prácticas  
* Resolver problemas de configuración

**Instalación:**  
bash  
npx skills add google-labs-code/stitch-skills \--skill shadcn-ui \--global  
**Tecnologías:**

* shadcn/ui  
* Radix UI  
* Tailwind CSS  
* React

---

### 6\. **remotion** (847 instalaciones) 🎬

**Descripción:** Genera videos walkthrough profesionales desde proyectos de Stitch usando Remotion.  
**Funcionalidades:**

* Transiciones suaves entre pantallas  
* Efectos de zoom  
* Text overlays  
* Hotspots interactivos  
* Integración de voiceover  
* Extracción dinámica de texto

**Estrategia de Composición:**  
**Arquitectura:**

* Composición principal con secuencias  
* Componentes de pantalla individuales  
* Capas de transición  
* Overlays de texto

**Efectos de Transición:**

* Fade in/out  
* Slide transitions  
* Zoom effects  
* Cross-dissolve

**Text Overlays:**

* Títulos de sección  
* Descripciones de features  
* Callouts de UI

**Proceso de Ejecución:**

1. **Gather Screen Assets** → Recopilar pantallas de Stitch  
2. **Generate Remotion Components** → Crear componentes de video  
3. **Preview and Refine** → Previsualizar y ajustar  
4. **Render Video** → Generar video final

**Cuándo usar:**

* Crear demos de producto  
* Videos de marketing  
* Tutoriales de UI/UX  
* Presentaciones de diseño  
* Documentación visual

**Patrones Comunes:**  
**Pattern 1: Simple Slide Show**  
javascript  
// Secuencia de pantallas con fade transitions  
Screen1 → Fade → Screen2 → Fade → Screen3  
**Pattern 2: Feature Highlight**  
javascript  
// Zoom a features específicos con overlays  
Overview → Zoom to Feature → Text Overlay → Zoom Out  
**Pattern 3: User Flow**  
javascript  
// Simulación de interacción de usuario  
Login → Click Animation → Dashboard → Navigation  
**Instalación:**  
bash  
npx skills add google-labs-code/stitch-skills \--skill remotion \--global  
**Prerequisitos:**

* Node.js  
* Remotion instalado  
* Proyecto Stitch con pantallas

**Estructura de archivos:**  
remotion-project/  
├── src/  
│   ├── Root.tsx              \# Composición principal  
│   ├── Composition.tsx       \# Secuencia de video  
│   └── screens/              \# Componentes de pantalla  
│       ├── Screen1.tsx  
│       └── Screen2.tsx  
└── public/  
   └── screens/              \# Assets de Stitch  
       ├── screen1.png  
       └── screen2.png  
---

## **🔄 Flujo de Trabajo Recomendado**

Para aprovechar al máximo Google Stitch Skills, sigue este flujo:

### 1\. **Definir Sistema de Diseño**

bash  
\# Usar design-md para documentar tu sistema  
npx skills add google-labs-code/stitch-skills \--skill design-md \--global  
→ Genera `DESIGN.md` con paleta, tipografía, componentes

### 2\. **Optimizar Prompts**

bash  
\# Usar enhance-prompt para mejorar ideas  
npx skills add google-labs-code/stitch-skills \--skill enhance-prompt \--global  
→ Convierte ideas vagas en prompts específicos

### 3\. **Construir Sitio**

bash  
\# Usar stitch-loop para generar páginas  
npx skills add google-labs-code/stitch-skills \--skill stitch-loop \--global  
→ Genera sitio completo iterativamente

### 4\. **Convertir a React**

bash  
\# Usar react:components para código de producción  
npx skills add google-labs-code/stitch-skills \--skill react:components \--global  
→ Transforma diseños a componentes React

### 5\. **Integrar Componentes**

bash  
\# Usar shadcn-ui para componentes adicionales  
npx skills add google-labs-code/stitch-skills \--skill shadcn-ui \--global  
→ Agrega componentes shadcn/ui

### 6\. **Crear Video Demo**

bash  
\# Usar remotion para walkthrough  
npx skills add google-labs-code/stitch-skills \--skill remotion \--global  
→ Genera video profesional del proyecto  
---

## **🎯 Casos de Uso por Skill**

| Caso de Uso | Skill Recomendada | Beneficio |
| :---- | :---- | :---- |
| Documentar sistema de diseño | `design-md` | Consistencia y guías claras |
| Mejorar calidad de prompts | `enhance-prompt` | Resultados más precisos |
| Construir sitio completo | `stitch-loop` | Automatización y eficiencia |
| Código React de producción | `react:components` | Componentes modulares y type-safe |
| Integrar biblioteca UI | `shadcn-ui` | Componentes accesibles y customizables |
| Demo de producto | `remotion` | Videos profesionales |

---

## **🛡️ Análisis de Seguridad**

**Estado:** ✅ **TODAS LAS SKILLS SON SEGURAS**

### Verificación:

* ✓ **Repositorio oficial** de Google Labs  
* ✓ **Código abierto** en GitHub  
* ✓ **Sin código malicioso** \- Solo guías y herramientas  
* ✓ **Sin recolección de datos** no autorizados  
* ✓ **Propósito educativo** claro  
* ✓ **Comunidad activa** (3.8K+ instalaciones en skill principal)

### Consideraciones:

* **Prerequisitos:** Algunas skills requieren Node.js, Stitch MCP server  
* **Dependencias:** React, Vite, Tailwind CSS, Remotion (según skill)  
* **Networking:** `react:components` y `remotion` hacen llamadas a MCP server (seguro)

---

## **📦 Instalación Rápida \- Todas las Skills**

bash  
\# Instalar todas las skills de Google Stitch de una vez  
npx skills add google-labs-code/stitch-skills \--skill design-md \--global  
npx skills add google-labs-code/stitch-skills \--skill react:components \--global  
npx skills add google-labs-code/stitch-skills \--skill stitch-loop \--global  
npx skills add google-labs-code/stitch-skills \--skill enhance-prompt \--global  
npx skills add google-labs-code/stitch-skills \--skill shadcn-ui \--global  
npx skills add google-labs-code/stitch-skills \--skill remotion \--global  
---

## **🔗 Enlaces Importantes**

* **Repositorio:** [https://github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)  
* **Skills.sh:** [https://skills.sh/google-labs-code/stitch-skills](https://skills.sh/google-labs-code/stitch-skills)  
* **Documentación Stitch:** [https://stitch.google.dev](https://stitch.google.dev/)  
* **Remotion Docs:** [https://www.remotion.dev](https://www.remotion.dev/)  
* **shadcn/ui:** [https://ui.shadcn.com](https://ui.shadcn.com/)

---

## **💡 Tips para Máximo Aprovechamiento**

1. **Empieza con design-md** → Documenta tu sistema de diseño primero  
2. **Usa enhance-prompt** → Mejora tus prompts antes de generar  
3. **Itera con stitch-loop** → Construye sitios completos de forma eficiente  
4. **Convierte a React** → Usa react:components para código de producción  
5. **Integra shadcn-ui** → Agrega componentes profesionales  
6. **Crea demos** → Usa remotion para videos impactantes

---

## **⚠️ Prerequisitos Generales**

* **Node.js** 18+ (recomendado)  
* **Stitch MCP Server** (para algunas skills)  
* **Git** (para clonar repositorios)  
* **Editor de código** compatible con Agent Skills

---

**Última actualización:** 2026-02-09  
**Mantenido por:** Google Labs  
**Licencia:** Apache 2.0

