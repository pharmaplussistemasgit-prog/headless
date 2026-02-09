# WordPress/WooCommerce Headless Mapper

**Versión**: 1.0  
**Autor**: Gemini AI Assistant  
**Fecha**: 2026-02-05

---

## 📖 Descripción

Skill profesional para mapear **completamente** cualquier instalación de WordPress/WooCommerce y construir aplicaciones headless robustas y sin errores.

Esta skill fue creada a partir de la experiencia real de mapear PharmaPlus y contiene todo el conocimiento necesario para replicar el proceso en cualquier proyecto.

---

## 🎯 ¿Qué Incluye?

### 1. **SKILL.md**
Documentación completa de la skill con:
- Instrucciones de uso
- Prerequisitos
- Estructura de datos
- Casos de uso
- Troubleshooting

### 2. **scripts/inspect-wordpress.js**
Script Node.js que inspecciona:
- ✅ Productos (60+ campos)
- ✅ Categorías (con jerarquía)
- ✅ Atributos (marcas, laboratorios)
- ✅ Tags
- ✅ Órdenes
- ✅ Clientes
- ✅ Métodos de envío
- ✅ Métodos de pago

### 3. **examples/implementation-examples.md**
Ejemplos completos de:
- Página de listado de productos
- Sidebar con filtros
- Cards de productos con ofertas
- Funciones de utilidad
- Caching con Next.js

---

## 🚀 Inicio Rápido

### Paso 1: Configurar Variables

```bash
# .env.local
NEXT_PUBLIC_WORDPRESS_URL=https://tu-sitio.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
```

### Paso 2: Ejecutar Inspección

```bash
node .agent/skills/wordpress-woocommerce-mapper/scripts/inspect-wordpress.js
```

### Paso 3: Revisar Resultados

Se generará:
- `wordpress-complete-mapping.json` (datos completos)
- Documentación en consola

---

## 📊 Resultado

Después de usar esta skill tendrás:

✅ **Mapeo completo** de WordPress/WooCommerce  
✅ **Scripts reutilizables**  
✅ **Documentación exhaustiva**  
✅ **Ejemplos listos para usar**  
✅ **Cero errores** por datos faltantes

---

## 📚 Archivos

```
wordpress-woocommerce-mapper/
├── SKILL.md                          # Documentación principal
├── README.md                         # Este archivo
├── scripts/
│   └── inspect-wordpress.js          # Script de inspección
└── examples/
    └── implementation-examples.md    # Ejemplos de código
```

---

## 💡 Uso con Gemini

Simplemente di:

```
"Usa la skill de WordPress/WooCommerce Headless Mapper para mapear mi instalación"
```

Gemini:
1. Leerá el SKILL.md
2. Ejecutará el script de inspección
3. Generará documentación completa
4. Te dará ejemplos de implementación

---

## 🎓 Aprendizajes Clave

Esta skill fue creada después de mapear exitosamente PharmaPlus y contiene:

1. **Método probado** para inspeccionar WordPress
2. **Estructura exacta** de todos los datos
3. **Snippets activos** identificados (Cart, Checkout, Ofertas)
4. **Optimizaciones** de rendimiento
5. **Manejo de errores** robusto

---

## 🔄 Reutilización

Esta skill es **100% reutilizable** para cualquier proyecto headless con WordPress/WooCommerce.

Solo necesitas:
1. Credenciales de WooCommerce API
2. Ejecutar el script
3. Seguir los ejemplos

---

## 📞 Soporte

Si tienes dudas sobre cómo usar esta skill, simplemente pregúntale a Gemini:

```
"¿Cómo uso la skill de WordPress Mapper?"
"Muéstrame ejemplos de la skill"
"Explícame cómo funciona el script de inspección"
```

---

**Creado con ❤️ para proyectos headless exitosos**
