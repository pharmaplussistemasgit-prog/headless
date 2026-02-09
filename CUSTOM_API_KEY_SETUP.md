# Instrucciones para Configurar CUSTOM_API_KEY

## ⚠️ IMPORTANTE: Necesitas configurar la API Key

Para usar los nuevos scripts que acceden a CUSTOM_API_V3.3, necesitas obtener la `CUSTOM_API_KEY` desde WordPress.

## 📋 Pasos para Obtener la API Key:

### Opción 1: Desde el Código del Plugin (Recomendado)

1. **Accede al administrador de WordPress**:
   ```
   https://tienda.pharmaplus.com.co/wp-admin
   ```

2. **Ve a**: Plugins → Editor de Plugins

3. **Busca el archivo**: `Custom API for Woo (Luis)`

4. **Localiza la línea** que define `CUSTOM_API_KEY`:
   ```php
   if (!defined('CUSTOM_API_KEY')) {
       define('CUSTOM_API_KEY', 'tu-api-key-aqui');
   }
   ```

5. **Copia el valor** de la API Key

### Opción 2: Desde wp-config.php

1. **Accede al servidor** vía FTP o panel de hosting

2. **Abre el archivo**: `wp-config.php`

3. **Busca la línea**:
   ```php
   define('CUSTOM_API_KEY', 'tu-api-key-aqui');
   ```

4. **Copia el valor**

### Opción 3: Consultar con el Administrador

Si no tienes acceso directo, contacta al administrador de WordPress para que te proporcione la `CUSTOM_API_KEY`.

## 🔧 Configurar en el Proyecto

Una vez que tengas la API Key:

1. **Abre el archivo**: `.env.local`

2. **Reemplaza** `TU_API_KEY_AQUI` con el valor real:
   ```bash
   CUSTOM_API_KEY=el-valor-real-de-tu-api-key
   ```

3. **Guarda el archivo**

4. **Ejecuta el script de inspección**:
   ```bash
   node scripts/inspect-wordpress-complete.js
   ```

## ✅ Verificar que Funciona

Si la configuración es correcta, deberías ver:

```
🚀 INICIANDO INSPECCIÓN COMPLETA DE WORDPRESS
📍 URL: https://tienda.pharmaplus.com.co
🔐 API Key: abc1234567...

================================================================================
📋 INSPECCIONANDO TABLA: wp_laboratorio
================================================================================

🔍 Consultando: /laboratorio

✅ Total de laboratorios: 435
```

## 🔒 Seguridad

- **NUNCA** compartas la API Key públicamente
- **NO** la incluyas en commits de Git
- El archivo `.env.local` está en `.gitignore` por seguridad
- Usa variables de entorno en producción (Vercel, Netlify, etc.)

## 📞 Soporte

Si tienes problemas para obtener la API Key, contacta al equipo de desarrollo de PharmaPlus.
