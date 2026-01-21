# PROPUESTA DE ESTRATEGIA: SIDEBARS ADAPTATIVOS POR CATEGORÍA
**Fecha:** 21 de Enero, 2026

## 1. VISIÓN GENERAL
En lugar de un sidebar único para todos, implementaremos un **Sistema de Sidebar Adaptativo (SSA)**. El sidebar analizará la categoría actual ("Cadena de Frío", "Cuidado Facial", etc.) y renderizará automáticamente los módulos de navegación más útiles para ese contexto específico.

El objetivo es maximizar la **encontrabilidad** del producto sin saturar al usuario con filtros vacíos o irrelevantes.

---

## 2. ARQUETIPOS DE CATEGORÍA
Basado en el análisis de datos de WooCommerce, hemos identificado 3 tipos de categorías que requieren tratos diferentes.

### TIPO A: "JERARQUÍA PROFUNDA"
**Ejemplos:** *Cuidado Facial, Cuidado Corporal, Protección Solar.*
Estas categorías tienen una estructura rica de hijos y nietos. El usuario suele navegar explorando ("quiero ver hidratantes").

*   **Estrategia:** Priorizar la navegación por árbol de categorías.
*   **Módulos del Sidebar:**
    1.  **📍 Navegación:** Árbol desplegable de Subcategorías (Ej: Antiedad, Despigmentantes).
    2.  **🔍 Buscador Inteligente:** "Buscar en Cuidado Facial".
    3.  **🧬 Laboratorios:** Filtro de marcas (Isdin, La Roche, Sesderma).
    4.  **🏷️ Necesidad:** Filtro por etiquetas de piel (Grasa, Seca, Mixta - Mapeado desde Tags).
    5.  **💰 Precio:** Rango de precios.

### TIPO B: "ESPECIALIZADA / PLANA"
**Ejemplos:** *Cadena de Frío, Kits, Vitaminas.*
Tienen pocos o ningún hijo. El usuario ya sabe que quiere algo específico o viene por una necesidad médica puntual.

*   **Estrategia:** Priorizar la búsqueda directa y patología.
*   **Módulos del Sidebar:**
    1.  **🔍 Buscador Inteligente:** "Buscar en Cadena de Frio" (CRÍTICO: permite buscar 'Insulina', 'Vacuna').
    2.  **🧬 Laboratorios:** Filtro de marcas farmacéuticas.
    3.  **💊 Forma de Uso:** (Si aplica) Vial, Ampolla, Caja.
    4.  **💰 Precio:** Rango de precios.
    5.  *(Oculto)*: Subcategorías (si no existen).

### TIPO C: "INVENTARIO MASIVO"
**Ejemplos:** *Salud y Medicamentos.*
Contiene miles de productos (2000+) y la estructura de subcategorías es débil o confusa. La navegación manual es dolorosa.

*   **Estrategia:** Búsqueda potente y filtros funcionales rápidos.
*   **Módulos del Sidebar:**
    1.  **🔍 Buscador PRO:** Barra de búsqueda grande y prominente al inicio.
    2.  **🧬 Laboratorios (Top 20):** Listado de los laboratorios más grandes.
    3.  **🏷️ Vía de Administración:** Oral, Tópico, Inyectable (Basado en Tags).
    4.  **💰 Precio:** Rango de precios.

---

## 3. IMPLEMENTACIÓN TÉCNICA
No crearemos 30 componentes diferentes. Crearemos un componente "Maestro" (`SmartSidebarMaster`) que recibe la configuración de la categoría.

### Lógica de Decisión (Algoritmo):
1.  **¿Tiene Hijos?**
    *   SÍ → Renderizar Módulo "Árbol de Categorías".
    *   NO → Ocultar Módulo.
2.  **¿Es "Cadena de Frío"?**
    *   SÍ → Activar Badge de "Manejo Especial" y priorizar búsqueda de marcas.
3.  **¿Tiene Tags Mapeados?**
    *   Comparar IDs de productos con `filterTagMapping.ts`.
    *   SÍ → Renderizar Módulo "Necesidad / Condición".
    *   NO → Ocultar Módulo (Evitar basura visual).

### Diseño Visual Propuesto:
*   **Headers de Sección:** Tipografía 'Outfit', negrita, iconos para cada sección (🧬, 📍, 🔍).
*   **Buscador:** Input con icono de lupa, búsqueda en servidor (Server-Side) para superar el límite de 24 productos.
*   **Categorías:** Lista con indentación y conteo de productos `(15)`.
*   **Filtros:** Checkboxes con estilos visuales (colores suaves para selección).

---

## 4. MAPEO PROPUESTO POR CATEGORÍA REAL
*(Basado en data real extraída)*

| Categoría | Arquetipo | Módulos Activos |
| :--- | :--- | :--- |
| **Cadena de Frío** | TIPO B (Plana) | Buscador, Marcas, Precio. |
| **Cuidado Facial** | TIPO A (Profunda) | Subcategorías, Buscador, Marcas, Necesidad (Tags), Precio. |
| **Salud y Med.** | TIPO C (Masiva) | Buscador, Marcas, Vía Admin (Tags), Precio. |
| **Cuidado Capilar** | TIPO A (Profunda) | Subcategorías (Anticaida, Shampoo), Marcas, Precio. |
| **Vitamina/Suple.** | TIPO B (Plana) | Buscador, Subcategorías (Niños), Marcas, Precio. |

---

## 5. SIGUIENTES PASOS
1.  **Aprobar Estrategia:** Confirmar si esta lógica de 3 arquetipos cubre sus expectativas.
2.  **Refactorizar Sidebar:** Modificar `CategoryCatalogue` para instanciar el sidebar con estas reglas lógicas.
3.  **Prueba de Fugeo:** Verificar "Cadena de Frío" (Solo marcas + buscador) vs "Facial" (Menú completo).
