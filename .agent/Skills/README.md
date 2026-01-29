# Base de Conocimiento de Habilidades (Skills)

Esta carpeta contiene las habilidades estandarizadas que el Agente puede utilizar para realizar tareas complejas de manera eficiente.

## Estructura
Cada habilidad debe tener su propia carpeta dentro de `.agent/skills/` y contener un archivo `SKILL.md`.

```
.agent/skills/
├── nombre-de-la-habilidad/
│   ├── SKILL.md          # Instrucciones y metadatos
│   ├── scripts/          # (Opcional) Scripts de utilidad
│   └── templates/        # (Opcional) Plantillas de código
```

## Cómo usar en nuevos proyectos
Para que el Agente "recuerde" estas habilidades en un nuevo proyecto:

1.  **Copiar:** Copia toda la carpeta `.agent` a la raíz de tu nuevo proyecto.
2.  **Verificar:** Asegúrate de que la estructura se mantenga.
3.  **Invocar:** El Agente escaneará esta carpeta y sabrá cómo aplicar las habilidades definidas.

## Idioma de Interacción
⚠️ **REGLA IMPORTANTE:**
Aunque el contenido técnico de los skills (instrucciones, código, nombres de variables) esté en **Inglés**, el Agente debe **siempre** comunicarse, documentar y explicar en **Español**. El Agente actúa como un puente bilingüe: consume conocimiento en inglés pero opera en español para el usuario.

## Formato de `SKILL.md`
```yaml
---
name: nombre-unico-habilidad
description: Descripción corta de lo que hace.
---
# Título

## Propósito
Explicación detallada.

## Instrucciones
Pasos que el agente debe seguir.
```
