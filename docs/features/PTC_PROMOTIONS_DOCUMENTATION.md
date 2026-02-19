# Documentación Técnica: Sistema de Promociones "Pague X Lleve Y" (PTC)

## 1. Descripción General
Hemos implementado un sistema robusto de promociones tipo **PTC** (Price to Consumer / Pague X Lleve Y) que permite configurar reglas de obsequios automáticos en el carrito de compras.

### Características Principales:
*   **Lógica Flexible:** "Por la compra de X unidades, lleve Y unidades de regalo".
*   **Vigencia:** Control por `FECHA_INICIO` y `FECHA_FIN`.
*   **Protección de Stock (`TOPE_MAXIMO`):** Límite global de unidades que se pueden regalar en una sola transacción.
*   **Límite por Usuario (`LIMITE_POR_USUARIO`):** Restricción de cuántas veces puede un mismo usuario aplicar la promoción en una compra (evita acaparamiento).
*   **Admin UI:** Gestión integrada directamente en la ficha del producto en WooCommerce.
*   **API REST:** Endpoints para creación/actualización automática desde software externo (ERP/SAP).

---

## 2. Estructura de Base de Datos
El sistema utiliza una tabla personalizada independiente para no sobrecargar los metadatos de WordPress (`postmeta`).

**Tabla:** `wp_item_ptc`

```sql
CREATE TABLE `wp_item_ptc` (
  `ITEM_PTC_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ITEM_ID` varchar(50) NOT NULL,          -- SKU del producto disparador (Trigger)
  `POR_COMPRA_DE` int(11) NOT NULL,        -- Cantidad "X" a comprar
  `RECIBE_PTC` int(11) NOT NULL,           -- Cantidad "Y" a recibir
  `ITEM_ID_RECAMBIO` varchar(50) NOT NULL, -- SKU del producto de regalo (usualmente el mismo)
  `FECHA_INICIO` date NOT NULL,            -- Inicio de vigencia
  `FECHA_FIN` date NOT NULL,               -- Fin de vigencia
  `ACUMULA_SN` int(1) DEFAULT 0,           -- (No usado actualmente)
  `CANAL_ID` int(11) DEFAULT 1,            -- Filtro por canal (1 = Tienda Online)
  `AREA_ID` int(11) DEFAULT 0,             -- (Reservado futuro uso)
  `TOPE_MAXIMO` int(11) DEFAULT 1000,      -- Límite global unidades regalo
  `LIMITE_POR_USUARIO` int(11) DEFAULT 0,  -- Límite combos por usuario
  PRIMARY KEY (`ITEM_PTC_ID`),
  UNIQUE KEY `idx_item_id` (`ITEM_ID`)     -- Un SKU solo puede tener una regla activa a la vez
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Guía de Integración para Software Externo (ERP)
Para que el software administrativo sincronice las reglas de negocio con la tienda web, existen dos métodos: **API REST** (Recomendado) o **Inserción Directa SQL**.

### Opción A: Integración vía API REST (Recomendada)
El ERP debe enviar un `POST` cada vez que se cree o modifique una promoción.

*   **Endpoint:** `https://tienda.pharmaplus.com.co/wp-json/custom-api/v1/item-ptc`
*   **Método:** `POST`
*   **Auth:** Header `X-API-KEY: [TU_CLAVE_API]`

**Payload JSON Ejemplo:**
```json
{
    "item_id": "76039",              // SKU del producto que vende
    "item_id_recambio": "76039",     // SKU del producto que regala
    "por_compra_de": 2,              // Compra 2
    "recibe_ptc": 1,                 // Lleva 1 GRATIS (Total 3, O Compra 2 y te damos el 2do gratis, ajustar lógica)
    // En este sistema: "Por compra de 2, recibe 2" significa Paga 2, y en el carrito aparecen 2 GRATIS adicionales? 
    // NO. La lógica actual es: Si compro 2 (padres), recibo 2 (hijos) GRATIS adicionales.
    
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2027-12-31",
    "tope_maximo": 50,               // Máximo 50 unidades de regalo total por pedido
    "limite_por_usuario": 2          // Máximo 2 promociones por cliente (Ej: 2 combos)
}
```

### Opción B: Inserción Directa SQL
Si el integrador tiene acceso directo a la BD (MySQL), puede ejecutar queries `INSERT ... ON DUPLICATE KEY UPDATE`.

```sql
INSERT INTO wp_item_ptc 
(ITEM_ID, POR_COMPRA_DE, RECIBE_PTC, ITEM_ID_RECAMBIO, FECHA_INICIO, FECHA_FIN, TOPE_MAXIMO, LIMITE_POR_USUARIO, CANAL_ID)
VALUES 
('76039', 2, 2, '76039', '2024-01-01', '2027-12-31', 50, 2, 1)
ON DUPLICATE KEY UPDATE
POR_COMPRA_DE = VALUES(POR_COMPRA_DE),
RECIBE_PTC = VALUES(RECIBE_PTC),
FECHA_INICIO = VALUES(FECHA_INICIO),
FECHA_FIN = VALUES(FECHA_FIN),
TOPE_MAXIMO = VALUES(TOPE_MAXIMO),
LIMITE_POR_USUARIO = VALUES(LIMITE_POR_USUARIO);
```

---

## 4. Archivos del Sistema (Snippets)

### 1. API: `wordpress_custom_api_v3_4_COMPLETE.php`
*   **Ubicación Document:** `docs/snippets/wordpress_custom_api_v3_4_COMPLETE.php`
*   **Función:** Maneja los endpoints `/item-ptc` (CRUD reglas) y `/test-ptc-logic` (Simulador Testing).

### 2. Lógica Carrito: `woocommerce_beneficios_b2c_v3_FINAL.php`
*   **Ubicación Document:** `docs/snippets/woocommerce_beneficios_b2c_v3_FINAL.php`
*   **Función:** Hook `woocommerce_before_calculate_totals`. Lee la tabla `wp_item_ptc`, verifica fechas y límites, y agrega los items de regalo al carrito con precio 0.

### 3. Admin UI: `woocommerce_admin_ptc_ui.php`
*   **Ubicación Document:** `docs/snippets/woocommerce_admin_ptc_ui.php`
*   **Función:** Agrega la pestaña "Promociones PTC" en el admin de productos de WooCommerce para gestión manual.

---

## 5. Pruebas y Validación
Para verificar que una regla funciona:

1.  **Validar Regla Activa:**
    *   Ir a WooCommerce -> Producto -> Editar -> Pestaña "Promociones PTC".
    *   Verificar fechas vigentes y cantidades configuradas.
    
2.  **Simulador API (Developer):**
    *   `GET https://tienda.pharmaplus.com.co/wp-json/custom-api/v1/test-ptc-logic?sku=76039&qty=6`
    *   Respuesta esperada: JSON con `veces_aplica_real` y detalles de la promo.

3.  **Prueba Frontend:**
    *   Agregar productos al carrito.
    *   Verificar que se agregue la línea de "Oferta Especial" con precio $0.
