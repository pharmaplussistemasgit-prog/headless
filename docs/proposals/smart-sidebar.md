# PROPUESTA: INTEGRACIÓN DE MENÚS INTELIGENTES Y BUSCADOR PRO
**Fecha:** 21 de Enero, 2026

## 1. MENÚS INTELIGENTES DE MARCAS Y ETIQUETAS
El usuario requiere que "Laboratorios" y "Etiquetas" (Forma de uso/Condición) no sean simples listas de checkboxes, sino **Menús de Navegación Inteligentes** que se sientan integrados y potentes.

### Lógica "Data-Driven"
Confirmamos que nuestra lógica actual (`lib/filterUtils.ts`) ya es inteligente:
*   **Origen:** Extrae la data *directamente* de los productos cargados.
*   **Conteo:** Calcula cuántos productos existen por marca/tag en tiempo real.
*   **Limpieza:** Si una marca tiene 0 productos en la vista actual, el menú la oculta automáticamente.

### Propuesta de Diseño (UI)
Transformaremos los bloques de filtros en **Menús Colapsables (Accordions) Premium**:

#### A. Menú "Laboratorios" (Marcas)
*   **Formato:** Acordeón desplegable.
*   **Contenido:** Lista con scroll interno suave.
*   **Estilo:**
    *   Items con checkbox estilizado + Nombre marca + Badge de conteo `(12)` alineado a la derecha.
    *   Buscador *interno* de marcas (cuando hay más de 10) para filtrar la lista rápidamente.

#### B. Menú "Necesidad / Etiquetas"
*   **Formato:** Acordeón desplegable.
*   **Contenido:** Lista inteligente mapeada (ej: "Oral", "Tópico").
*   **Estilo:** Similar a marcas, pero quizás con iconos representativos si es posible (ej: 💊 para Oral).

---

## 2. EVOLUCIÓN DEL BUSCADOR (INTELLIGENT SEARCH)
El input actual se ve "simple". Vamos a elevarlo a la altura de un "Buscador Pro".

### Cambios Visuales y Funcionales
1.  **Diseño "Floating" o "Material":**
    *   Input con bordes redondeados, sombra suave interna.
    *   Icono de Lupa 🔍 interactivo (cambia de color al escribir).
    
2.  **Feedback Visual (Inteligencia):**
    *   Estado **"Escuchando"**: Al hacer focus, el borde brilla azul.
    *   Estado **"Buscando"**: Spinner pequeñito mientras el usuario escribe o presiona Enter (si es server side).
    *   **Placeholder Dinámico:** "Buscar en [Categoría Actual]..."

3.  **Funcionalidad Híbrida:**
    *   Si hay muchos productos (>24), búsqueda Server-Side (Presionar Enter).
    *   Si hay pocos (<24), filtrado instantáneo en tiempo real.

---

## 3. ESQUEMA DEL NUEVO SIDEBAR (MOCKUP LÓGICO)

```text
[ 📍 Árbol de Categorías (Si aplica) ]
   └── ...

[ 🔍 BUSCADOR PRO ]
   -----------------------------
   |  🔍 Buscar en Facial...   |  (Estilo Premium)
   -----------------------------

[ 🧬 LABORATORIOS (Collapse) ]
   [x] Buscador marcas...
   -----------------------
   [ ] Isdin           (15)
   [ ] La Roche Posay  (12)
   [ ] Sesderma        (8)
   ... ver más

[ 💊 FORMA DE USO (Collapse) ]
   [ ] Oral            (40)
   [ ] Tópico          (32)
   [ ] Inyectable      (5)

[ 💰 RANGO DE PRECIO ]
```

## 4. PLAN DE ACCIÓN
1.  **UI Components:** Crear componentes `CollapsibleMenu` y `SmartSearchInput`.
2.  **Integración:** Reemplazar los divs actuales en `SmartFilterSidebar` por estos nuevos componentes.
3.  **Validación:** Verificar que al cambiar de categoría, los menús se regeneran solos con la data correcta (ej: en "Vitaminas" no sale "Despigmentante").
