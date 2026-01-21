# DOCUMENTACIÓN DE MAPEO WOOCOMMERCE - PHARMAPLUS
**Fecha:** 20 de Enero, 2026
**Hora:** 10:55 pm

Este documento detalla el mapeo completo de la estructura de catálogo de PharmaPlus, extraído directamente de la API de WooCommerce. Incluye análisis de Categorías, el caso especial de "Cadena de Frío", Variables (Atributos) y Etiquetas.

---

## 1. RESUMEN EJECUTIVO

Se ha realizado una extracción completa de datos del entorno de producción. Los hallazgos principales son:

*   **Total de Categorías Activas:** 33
*   **Total de Etiquetas (Tags):** 376
*   **Total de Atributos (Variables):** 0 (No configurados)
*   **Estado Cadena de Frío:** Integrada y Mapeada correctamente (ID 3368).

**Archivos Adjuntos Generados:**
1.  `categoria_mapping.json` (Estructura completa de categorías)
2.  `attributes_tags_mapping.json` (Listado de etiquetas y atributos)

---

## 2. ANÁLISIS DE CATEGORÍA "CADENA DE FRÍO"

Esta es la categoría crítica para la operación logística especial. Se ha verificado su existencia y datos:

| Dato | Valor | Estado |
| :--- | :--- | :--- |
| **Nombre** | **CADENA DE FRIO** | ✅ Correcto |
| **ID Sistema** | `3368` | ✅ Verificado |
| **Slug (URL)** | `cadena-de-frio` | ✅ Verificado |
| **Cantidad Productos** | **96** | ✅ Confirmado |
| **Jerarquía** | Nivel 0 (Raíz) | ✅ Visible en Menú |

**Acciones Realizadas:**
*   Se implementó lógica en el Frontend para detectarla automáticamente por este ID/Slug.
*   Se le asignó diseño prioritario (Highlight Azul + Ícono) en el menú de navegación.

---

## 3. MAPEO COMPLETO DE CATEGORÍAS (Top 20 por Volumen)

Listado ordenado por cantidad de productos para entender la distribución del inventario.

| ID | Nombre Categoría | Slug | Cantidad Productos |
| :--- | :--- | :--- | :--- |
| 539 | **Sin categorizar** (*) | `uncategorized` | **413** |
| 289 | SALUD Y MEDICAMENTOS | `salud-y-medicamentos` | 2168 |
| 299 | CUIDADO FACIAL | `cuidado-facial` | 444 |
| 309 | VITAMINAS Y SUPLEMENTOS | `vitaminas-y-suplementos` | 147 |
| 297 | CUIDADO CORPORAL | `cuidado-corporal` | 106 |
| 3391 | OTROS PRODUCTOS | `otros-productos` | 106 |
| 3368 | **CADENA DE FRIO** | `cadena-de-frio` | **96** |
| 3405 | HIDRATANTES | `hidratantes-facial` | 90 |
| 323 | LIMPIADORES Y DESMAQUILLANTES | `limpiadores-y-desmaquillantes` | 82 |
| 3399 | HIDRATANTES (Corporal) | `hidratantes-corporal` | 76 |
| 300 | KITS | `kits` | 66 |
| 3403 | REPARADOR Y CICATRIZANTE | `reparador-y-cicatrizante-facial` | 52 |
| 3397 | MAQUILLAJE | `maquillaje-protector` | 50 |
| 322 | LIMPIADORES | `limpiadores` | 46 |
| 3410 | ANTICAIDA | `anticaida-capilar` | 43 |
| 318 | DESPIGMENTANTES | `despigmentantes-facial` | 41 |
| 3393 | OJOS Y PESTAÑAS | `ojos-y-pestanas` | 39 |
| 3366 | ALIMENTACION ESPECIAL | `alimentacion-especial` | 37 |
| 3408 | NIÑOS (Vitaminas) | `ninos-vitaminas` | 36 |

**(*) Observación Crítica:** La categoría "Sin categorizar" contiene el mayor volumen de productos individuales (413). Se recomienda auditar estos productos en WooCommerce para asignarlos a categorías específicas.

---

## 4. ANÁLISIS DE VARIABLES Y ETIQUETAS

### A. Variables (Atributos de Producto)
*   **Estado:** **NO EXISTEN**.
*   **Análisis:** Actualmente no se utilizan atributos de WooCommerce (como Talla, Color, Gramaje) para crear variaciones. Los productos son simples o la variabilidad no está estructura a nivel de base de datos de atributos.

### B. Etiquetas (Tags) - Top 20
Las etiquetas se están utilizando intensivamente para clasificación secundaria (Vía de administración, patología, tipo de fármaco).

| ID | Nombre Etiqueta | Slug | Cantidad |
| :--- | :--- | :--- | :--- |
| 196 | TOPICO | `topico` | 63 |
| 131 | EMOLIENTES | `emolientes` | 29 |
| 230 | PROD.ANTI-A | `prod-anti-a` | 20 |
| 142 | GASTROPROCI | `gastroproci` | 14 |
| 155 | INHIBIDOR B | `inhibidor-b` | 14 |
| 132 | ANTIHISTAMI | `antihistami` | 12 |
| 110 | ANTIBIOTICO | `antibiotico` | 11 |
| 150 | CORTICOST T | `corticost-t` | 11 |
| 188 | HIPERTENTENSION ARTE | `hipertentension-arte` | 11 |
| 158 | OTROS PROD. | `otros-prod` | 11 |
| 152 | PR DISFUNC | `pr-disfunc` | 11 |
| 148 | ORAL | `oral` | 10 |
| 243 | HIPOTIROIDISMO | `hipotiroidismo` | 9 |
| 16 | Analgésico | `analgesico` | 8 |
| 149 | ANTIHISTAMINICO | `antihistaminico` | 8 |
| 146 | COXIBS SOLO | `coxibs-solo` | 8 |
| 229 | INH.SELEC.R | `inh-selec-r` | 8 |
| 266 | PREPAR MONO | `prepar-mono` | 8 |
| 202 | RESEQUEDAD OCULAR | `resequedad-ocular` | 8 |

---


## 6. MAPEO JERÁRQUICO DETALLADO (PADRE → HIJOS)
*Generado: 20/01/2026*

A continuación se detalla la estructura completa de categorías del sitio, incluyendo conteo de productos por subcategoría.

### CADENA DE FRIO (ID: 3368) - Total: 96
*   (Sin subcategorías)

### CUIDADO CAPILAR (ID: 298) - Total: 282
*   ANTICAIDA = 6
*   ANTICASPA = 31
*   OTROS = 4
*   SHAMPOO = 6

### CUIDADO CORPORAL (ID: 297) - Total: 574
*   DESODORANTES = 8
*   DESPIGMENTANTES = 5
*   HIDRATANTES = 76
*   LIMPIADORES = 46
*   NIÑOS = 4
*   OTROS = 11

### CUIDADO FACIAL (ID: 299) - Total: 444
*   ANTIEDAD = 115
*   DESPIGMENTANTES = 41
*   EXFOLIANTES = 9
*   HIDRATANTES = 90
    *   MAQUILLAJE = 2 (Nieto)
*   LIMPIADORES Y DESMAQUILLANTES = 82
*   MAQUILLAJE = 8
*   NIÑOS = 2
*   OJOS Y PESTAÑAS = 39
*   OTROS = 3
*   PIEL GRASA Y ACNE = 0
*   PROTECCION SOLAR = 1
*   REPARADOR Y CICATRIZANTE = 52

### KITS (ID: 300) - Total: 66
*   PIEL GRASA Y ACNE = 27
*   REPARADOR Y CICRATIZANTE = 1

### PROTECCION SOLAR (ID: 306) - Total: 119
*   MAQUILLAJE = 50
*   NIÑOS = 15

### SALUD Y MEDICAMENTOS (ID: 289) - Total: 2168
*   DISPOSITIVOS E INSUMOS MEDICOS = 10
*   MEDICAMENTOS = 3
*   SALUD VISUAL = 0

### VITAMINAS Y SUPLEMENTOS (ID: 309) - Total: 147
*   ANTICAIDA VITAMINAS = 0
*   NIÑOS = 36

### OTRAS CATEGORÍAS
*   **NINGUNA (ID: 539):** 0 productos
*   **OTROS PRODUCTOS (ID: 3391):** 106 productos (Sin subcategorías)
*   **SIN CATEGORIZAR (ID: 15):** 413 productos

## 5. ANÁLISIS DE MARCAS Y LABORATORIOS

Se realizó un escaneo profundo de la metadata de los productos (`meta_data`) y se identificó que la marca/laboratorio se almacena bajo la clave oculta `_marca`.

*   **Clave de Sistema:** `_marca`
*   **Total Marcas Detectadas:** 107
*   **Observación:** La data es consistente y rica. Se puede utilizar para crear filtros por Laboratorio.

**Top 20 Marcas / Laboratorios (por cantidad de productos):**

| Ranking | Marca / Laboratorio | Cantidad Productos |
| :--- | :--- | :--- |
| 1 | **LAFRANCOL** | 209 |
| 2 | PROCAPS FARMA RX | 160 |
| 3 | TECNOQUIMICAS MK | 155 |
| 4 | PERCOS | 141 |
| 5 | SESDERMA COLOMBIA SA | 131 |
| 6 | SIEGFRIED FARMA | 122 |
| 7 | BUSSIE FARMA | 106 |
| 8 | EUROFARMA | 104 |
| 9 | ISDIN COLOMBIA | 96 |
| 10 | SISCOL FARMA | 87 |
| 11 | ADIUM | 86 |
| 12 | PROCAPS GENERICOS COLMED | 85 |
| 13 | MEGALABS MEDIHEALT | 81 |
| 14 | PFIZER S.A.S | 74 |
| 15 | ABBOTT FORMAS NUTRICIONALES | 71 |
| 16 | HUMAX | 71 |
| 17 | BIOPAS LABORATORIES | 64 |
| 18 | NOVAMED | 62 |
| 19 | ASPEN | 61 |
| 20 | SIEGFRIED DERMA | 60 |

*Se generó el archivo `brands_mapping.json` con el listado completo.*

---

## CONCLUSIONES Y RECOMENDACIONES TÉCNICAS

1.  **Integración Frontend:** Gracias a este mapeo, el Frontend ahora consume dinámicamente la categoría ID `3368` para la "Cadena de Frío", asegurando que si se agregan productos en WooCommerce, aparezcan automáticamente en la web con la alerta visual correspondiente.
2.  **Limpieza de Datos:** Se sugiere revisar los 413 productos en "Sin Categorizar".
3.  **Potencial de Filtros:** Las etiquetas (Tags) tienen una data muy rica ("Tópico", "Oral", "Antibiótico"). Se recomienda implementar un sistema de filtrado lateral en el PLP (Product Listing Page) basado en estas etiquetas para mejorar la experiencia de búsqueda del usuario.

---
*Documento generado automáticamente por Asistente de Desarrollo PharmaPlus.*
