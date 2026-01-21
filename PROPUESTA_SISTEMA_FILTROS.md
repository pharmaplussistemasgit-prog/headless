# PROPUESTA: Sistema de "Navegación Farmacéutica Inteligente" (NFI)

## Objetivo
Crear el motor de búsqueda y filtrado más potente del sector, utilizando el 100% de la data mapeada (Laboratorios + Etiquetas Funcionales + Categorías). El objetivo es que el usuario encuentre su medicamento no solo por nombre, sino por **necesidad** o **preferencia de laboratorio**.

---

## 1. La Visión: Facetas de Descubrimiento

En lugar de simples listas, dividiremos los filtros en 4 Facetas Estratégicas:

### A. Faceta "Confianza" (Laboratorios / Marcas)
*   **Fuente:** Metadata `_marca`.
*   **UX:** Lista con checkbox + Buscador interno.
*   **Valor:** Permite al usuario fiel encontrar "su" marca de confianza (ej: Lafrancol, Pfizer).

### B. Faceta "Necesidad" (Condición / Patología)
*   **Fuente:** Etiquetas (Tags filter).
*   **Lógica:** Agrupación inteligente de tags como `Hipertensión`, `Dolor`, `Cuidado Facial`, `Diabetes`.
*   **Valor:** El usuario busca resolver un problema. "Necesito algo para la gripe".
*   *Nota:* Requiere curar levemente los tags mapeados para agrupar sinónimos.

### C. Faceta "Uso" (Vía de Administración / Forma)
*   **Fuente:** Etiquetas (Tags filter).
*   **Lógica:** Detectar tags como `Oral`, `Tópico`, `Tableta`, `Jarabe`, `Crema`.
*   **Valor:** Vital en farmacia. El usuario prefiere jarabe sobre pastillas, o crema sobre gel.

### D. Faceta "Económica" (Precio)
*   **Componente:** Slider de Rango de Precio (Min - Max).
*   **Valor:** Ajustarse al presupuesto del paciente.

---

## 2. Experiencia de Usuario (UX) - El Sidebar Definitivo

Imagina este Sidebar en la página de **Medicamentos**:

```
[ FILTROS ACTIVOS ]
[x] Oral (x) [x] Lafrancol (x)  [LIMPIAR TODO]

------------------------------
📂 CATEGORÍAS
   < Regresar a Salud y Medicamentos
   **Medicamentos Generales (193)**
   Cuidado Crónico (50)
   ...

------------------------------
🧪 LABORATORIO / MARCA
   [🔍 Buscar marca...]
   [ ] Lafrancol (209)
   [ ] Tecnoquimicas (155)
   [ ] Procaps (160)
   [Show more...]

------------------------------
💊 FORMA DE USO
   [ ] Oral (Jarabe, Tabletas)
   [ ] Tópico (Cremas, Geles)
   [ ] Oftáltmico (Gotas)

------------------------------
🩺 CONDICIÓN
   [ ] Dolor y Fiebre
   [ ] Cuidado de la Piel
   [ ] Hipertensión
   [ ] Gripe y Tos

------------------------------
💰 PRECIO
   $10.000  ⬤━━━━━━⬤ $150.000
```

---

## 3. Implementación Técnica por Fases

### Fase 1: Motor de Filtrado en Cliente (Inmediato)
*   **Cómo funciona:** Al cargar una categoría (ej: Cuidado de la Piel), descargamos los primeros 100 productos.
*   **Magia:** Nuestro código en React analiza *en vivo* las etiquetas y marcas de esos productos y construye el sidebar dinámicamente.
*   **Ventaja:** Si la categoría tiene "La Roche-Posay" y "Vichy", el filtro de marcas mostrará *solo* esas dos. No mostrará "Pfizer". Es **contextual**.

### Fase 2: Agrupación de Etiquetas (Curaduría)
*   Crearemos un archivo de configuración `filterConfig.ts` para mapear los tags "sucios" a grupos limpios.
    *   `Map: ['tableta', 'capsula', 'comprimido'] -> Grupo: "Oral (Sólidos)"`
    *   `Map: ['crema', 'gel', 'locion'] -> Grupo: "Tópico"`
*   Esto limpia el ruido de tener 376 etiquetas sueltas.

### Fase 3: Integración URL Profunda (SEO)
*   Permitir URLs como: `pharma.com/categoria/medicamentos?lab=lafrancol&uso=oral`
*   Esto permite compartir búsquedas específicas en WhatsApp o campañas de Marketing.

---

## Conclusión
Esta propuesta convierte tu catálogo en una herramienta de consulta profesional. Ya no es una lista plana, es un asistente que ayuda al usuario a filtrar por **Laboratorio** (Calidad), **Uso** (Preferencia) y **Condición** (Necesidad).

¿Te parece completa esta visión integral?
