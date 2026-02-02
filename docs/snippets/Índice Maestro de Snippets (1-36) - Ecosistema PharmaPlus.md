# 1 \- Cart

**1 \- Cart**

// Mostrar precio en oferta y regular tachado en el carrito  
add\_filter( 'woocommerce\_cart\_item\_price', function( $price\_html, $cart\_item, $cart\_item\_key ){  
    $product \= isset($cart\_item\['data'\]) ? $cart\_item\['data'\] : null;  
    if ( \! $product || \! is\_a($product, 'WC\_Product') ) return $price\_html;

    // Solo si el producto está en oferta  
    if ( $product-\>is\_on\_sale() ) {  
        $sale \= wc\_get\_price\_to\_display( $product, \[ 'price' \=\> $product-\>get\_price() \] );  
        $reg  \= wc\_get\_price\_to\_display( $product, \[ 'price' \=\> $product-\>get\_regular\_price() \] );

        if ( $reg && $sale && floatval($reg) \> floatval($sale) ) {  
            $sale\_html \= wc\_price( $sale );  
            $reg\_html  \= wc\_price( $reg );  
            $price\_html \= sprintf(  
                '\<span class="cl-cart-price"\>\<span class="cl-cart-price\_\_sale"\>%s\</span\>\<br\>\<small class="cl-cart-price\_\_reg"\>\<del\>%s\</del\>\</small\>\</span\>',  
                $sale\_html,  
                $reg\_html  
            );  
        }  
    }  
    return $price\_html;  
}, 10, 3 );

// Inyectar CSS en carrito  
add\_action( 'wp\_head', function(){  
    if ( is\_cart() ) {  
        echo '\<style\>  
        .cl-cart-price\_\_sale {  
            font-weight: 700;  
            line-height: 1.1;  
        }  
        .cl-cart-price\_\_reg {  
            font-size: 0.85em;  
            opacity: .8;  
        }  
        .woocommerce-cart .shop\_table .product-price .cl-cart-price del {  
            text-decoration-thickness: 1px;  
        }  
        \</style\>';  
    }  
});

// \=================== RESUMEN DEL PEDIDO (CARRITO) \===================  
// \- Usa el \<h2\> original de Woo y lo renombra a "Resumen del pedido"  
// \- Centrado \+ tamaño \+ línea divisora debajo  
// \- Inserta "Costo de productos" y "Ahorro en productos"  
// \- Oculta Subtotal y filas de cupones  
// \- Mantiene Envío (renombrado por JS) y Total  
// \====================================================================

if ( \! defined('ABSPATH') ) exit;

/\*\* CÁLCULOS: regular total \+ ahorros (ofertas \+ cupones) \*/  
if ( \! function\_exists('cl\_cart\_regular\_and\_savings') ) {  
	function cl\_cart\_regular\_and\_savings() {  
		$regular\_total \= 0.0;  
		$sale\_saving   \= 0.0;  
		$coupon\_saving \= 0.0;

		if ( function\_exists('WC') && WC()-\>cart && \! WC()-\>cart-\>is\_empty() ) {  
			foreach ( WC()-\>cart-\>get\_cart() as $item ) {  
				$product \= isset($item\['data'\]) ? $item\['data'\] : null;  
				$qty     \= isset($item\['quantity'\]) ? max(0, (int)$item\['quantity'\]) : 0;  
				if ( \! $product || $qty \<= 0 ) continue;

				$reg\_unit \= $product-\>get\_regular\_price();  
				if ( $reg\_unit \=== '' || $reg\_unit \=== null ) {  
					if ( $product-\>is\_type('variation') ) {  
						$parent \= wc\_get\_product( $product-\>get\_parent\_id() );  
						if ( $parent ) $reg\_unit \= $parent-\>get\_regular\_price();  
					}  
				}  
				if ( $reg\_unit \=== '' || $reg\_unit \=== null ) {  
					$reg\_unit \= $product-\>get\_price();  
				}  
				$reg\_unit \= (float) $reg\_unit;

				$line\_regular  \= $reg\_unit \* $qty;  
				$line\_subtotal \= isset($item\['line\_subtotal'\]) ? (float)$item\['line\_subtotal'\] : 0; // base carrito (con sale)  
				$line\_total    \= isset($item\['line\_total'\])    ? (float)$item\['line\_total'\]    : 0; // tras cupones

				$regular\_total \+= $line\_regular;

				$line\_sale\_saving   \= $line\_regular \- $line\_subtotal; if ( $line\_sale\_saving \< 0 ) $line\_sale\_saving \= 0;  
				$sale\_saving       \+= $line\_sale\_saving;

				$line\_coupon\_saving \= $line\_subtotal \- $line\_total;   if ( $line\_coupon\_saving \< 0 ) $line\_coupon\_saving \= 0;  
				$coupon\_saving     \+= $line\_coupon\_saving;  
			}  
		}  
		return array(  
			'regular\_total' \=\> $regular\_total,  
			'savings\_total' \=\> $sale\_saving \+ $coupon\_saving,  
		);  
	}  
}

/\*\* IMPRESIÓN de filas personalizadas (una sola vez) \*/  
if ( \! function\_exists('cl\_print\_custom\_totals\_rows') ) {  
	function cl\_print\_custom\_totals\_rows() {  
		static $printed \= false;  
		if ( $printed ) return;  
		if ( \! function\_exists('WC') || \! is\_cart() ) return;  
		$printed \= true;

		$vals \= cl\_cart\_regular\_and\_savings();  
		$regular\_total \= isset($vals\['regular\_total'\]) ? (float)$vals\['regular\_total'\] : 0;  
		$savings\_total \= isset($vals\['savings\_total'\]) ? (float)$vals\['savings\_total'\] : 0;

		echo '\<tr class="cl-row cl-regular-total"\>  
				\<th\>' . esc\_html\_\_('Costo de productos', 'cl') . '\</th\>  
				\<td data-title="Costo de productos"\>\<span class="woocommerce-Price-amount amount"\>' . wc\_price( $regular\_total ) . '\</span\>\</td\>  
			  \</tr\>';

		$ahorro\_str \= $savings\_total \> 0 ? '-' . wc\_price( $savings\_total ) : wc\_price( 0 );  
		echo '\<tr class="cl-row cl-savings"\>  
				\<th\>' . esc\_html\_\_('Ahorro en productos', 'cl') . '\</th\>  
				\<td data-title="Ahorro en productos"\>\<span class="woocommerce-Price-amount amount cl-negative"\>' . $ahorro\_str . '\</span\>\</td\>  
			  \</tr\>';  
	}  
}  
// Intenta antes de Envío; si no, antes de Total  
add\_action('woocommerce\_cart\_totals\_before\_shipping',     'cl\_print\_custom\_totals\_rows', 5);  
add\_action('woocommerce\_cart\_totals\_before\_order\_total',  'cl\_print\_custom\_totals\_rows', 5);

/\*\* ESTILOS (forzar centrado/tamaño del H2) \*/  
add\_action('wp\_head', function () {  
	if ( \! is\_cart() ) return; ?\>  
	\<style\>  
		/\* Aumentamos especificidad y usamos \!important \*/  
		.e-cart-totals .cart\_totals \> h2,  
		.cart-collaterals .cart\_totals \> h2,  
		.cart\_totals.calculated\_shipping \> h2,  
		.cart\_totals \> h2 {  
			text-align: center \!important;  
			font-size: 24px \!important;      /\* \<- ajusta aquí si quieres más grande \*/  
			line-height: 1.25 \!important;  
			font-weight: 800 \!important;  
			margin: 0 0 12px \!important;  
		}  
		/\* Línea divisora \*/  
		.cart-collaterals .cl-cart-divider{  
			border: 0; border-top: 1px solid \#e5e7eb; margin: 8px 0 12px;  
		}  
		/\* Ocultar Subtotal y cupones \*/  
		.cart\_totals table tr.cart-subtotal{display:none}  
		.cart\_totals table tr.cart-discount{display:none}  
		/\* Estética de nuestras filas \*/  
		.cart\_totals table .cl-row th{font-weight:600}  
		.cart\_totals table .cl-savings .cl-negative{color:\#2ecc71}  
		.cart\_totals table tr \+ tr td,  
		.cart\_totals table tr \+ tr th{border-top:1px solid \#f0f2f5}  
	\</style\>  
\<?php });

/\*\* JS: renombrar H2, insertar línea y reforzar estilos inline \*/  
add\_action('wp\_footer', function(){  
	if ( \! is\_cart() ) return; ?\>  
	\<script\>  
	(function(){  
		var h2 \= document.querySelector('.cart\_totals \> h2');  
		if (h2){  
			h2.textContent \= 'Resumen del pedido';  
			/\* refuerzo inline por si el theme aplica estilos muy específicos \*/  
			h2.style.setProperty('text-align','center','important');  
			h2.style.setProperty('font-size','24px','important');   // \<- cambia aquí si lo quieres aún más grande  
			h2.style.setProperty('font-weight','800','important');  
			h2.style.setProperty('margin','0 0 12px','important');

			if (\!document.querySelector('.cart\_totals .cl-cart-divider')){  
				var hr \= document.createElement('hr');  
				hr.className \= 'cl-cart-divider';  
				h2.insertAdjacentElement('afterend', hr);  
			}  
		}  
		/\* Renombrar encabezado de envío (visual) \*/  
		var th \= document.querySelector('.cart\_totals .woocommerce-shipping-totals th');  
		if (th) th.textContent \= 'Costo Domicilio.';  
	})();  
	\</script\>  
\<?php });

// Reemplazar "Poblacion" por "Ciudad:" o  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
	if ( isset($fields\['city'\]) ) {  
		$fields\['city'\]\['label'\] \= 'Ciudad';  
		$fields\['city'\]\['placeholder'\] \= 'Ciudad';  
	}  
	return $fields;  
}, 20);

// Reemplazar "Envío" por "Costo Domicilio:" en la tabla de totales del carrito  
add\_filter('woocommerce\_shipping\_package\_name', function( $package\_name, $i, $package ){  
    if ( function\_exists('is\_cart') && is\_cart() ) {  
        return 'Costo Domicilio:';  
    }  
    return $package\_name;  
}, 10, 3);

// Ajusta el precio del envio centrado a la derecha  
add\_action('wp\_head', function () {  
  if ( \! is\_cart() ) return; ?\>  
  \<style\>  
    /\* Alineación fina del precio de envío (solo carrito) \*/  
    .cart\_totals .woocommerce-shipping-methods \> li \> label{  
      /\* usar flex, no absolute \*/  
      display:flex \!important;  
      align-items:center \!important;  
      justify-content:space-between \!important;  
      width:100% \!important;  
      position:static \!important;       /\* cancela cualquier absolute previo \*/  
      padding-right:12px \!important;    /\* ajusta la sangría a la derecha \*/  
      box-sizing:border-box \!important;  
      margin:0; gap:12px;  
    }  
    .cart\_totals .woocommerce-shipping-methods \> li \> label .woocommerce-Price-amount{  
      position:static \!important;       /\* por si quedó absolute de antes \*/  
      transform:none \!important;  
      margin-left:auto \!important;      /\* empuja a la derecha dentro del td \*/  
      text-align:right \!important;  
      display:inline-block \!important;  
    }  
  \</style\>  
\<?php });

// Agregar botón extra debajo del "Proceder al pago" en la página del carrito  
add\_action( 'woocommerce\_proceed\_to\_checkout', function(){  
    echo '\<a href="' . esc\_url( wc\_get\_page\_permalink( 'shop' ) ) . '" class="button wc-back-to-shop"\>Seguir comprando\</a\>';  
}, 20 );

// Estilos del botón "Seguir comprando"  
add\_action( 'wp\_head', function(){  
    if ( is\_cart() ) {  
        echo '\<style\>  
        .wc-back-to-shop {  
            background: \#fff \!important;   /\* fondo blanco \*/  
            color: \#1C4595 \!important;     /\* azul personalizado \*/  
            display: block;                /\* bloque completo \*/  
            text-align: center;            /\* centra el texto \*/  
            border: 2px solid \#1C4595;     /\* borde azul \*/  
            margin-top: 10px \!important;  
            transition: all 0.2s ease-in-out;  
        }  
        .wc-back-to-shop:hover {  
            text-decoration: underline \!important;    /\* subraya el texto \*/  
        }  
        \</style\>';  
    }  
});

/\*\*  
 \* Plugin Name: DC Cart Ciudad Select (Carrito)  
 \* Description: Convierte la ciudad del calculador de envío del carrito en un \<select\> dependiente del Departamento (Colombia), alimentado desde la taxonomía 'departamentosciudades'. Tolerante a nonce y compatible con invitados. Intenta usar el AJAX del plugin principal (dc\_get\_ciudades) y si no está, usa su propio endpoint.  
 \* Version:     1.0.0  
 \* Author:      Tu Equipo  
 \* License:     GPLv2 or later  
 \*/

if ( \! defined( 'ABSPATH' ) ) exit;

/\*\* \====== Constantes (coinciden con el plugin principal) \====== \*/  
if ( \! defined('DC\_TAX') )          define('DC\_TAX', 'departamentosciudades');  
if ( \! defined('DC\_COOKIE\_CITY') )  define('DC\_COOKIE\_CITY', 'dc\_city');  
if ( \! defined('DC\_COOKIE\_DEPT') )  define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\*\* \====== Utilidades de cookies \====== \*/  
function dccs\_get\_selected\_city\_id() : ?int {  
	if ( isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\]) ) return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
	return null;  
}  
function dccs\_get\_selected\_dept\_id() : ?int {  
	if ( isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\]) ) return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
	return null;  
}

/\*\* \====== Opciones de términos \====== \*/  
function dccs\_get\_departamentos\_options(): array {  
	$out \= \[\];  
	$terms \= get\_terms(\[  
		'taxonomy'   \=\> DC\_TAX,  
		'hide\_empty' \=\> false,  
		'parent'     \=\> 0,  
		'orderby'    \=\> 'name',  
		'order'      \=\> 'ASC',  
	\]);  
	if ( is\_wp\_error($terms) ) return $out;  
	foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
	return $out;  
}

/\*\* \====== AJAX ciudades (respaldo si el principal no existe) \====== \*/  
add\_action('wp\_ajax\_dc\_cart\_get\_ciudades', 'dccs\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_cart\_get\_ciudades', 'dccs\_ajax\_get\_ciudades');  
function dccs\_ajax\_get\_ciudades() {  
	// Soporta nonce, pero tolerante para invitados  
	$nonce\_ok \= true;  
	if ( isset($\_POST\['nonce'\]) ) {  
		$nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
	}  
	if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
		wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
	}  
	$dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
	if ( \! $dept ) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

	$terms \= get\_terms(\[  
		'taxonomy'   \=\> DC\_TAX,  
		'hide\_empty' \=\> false,  
		'parent'     \=\> $dept,  
		'orderby'    \=\> 'name',  
		'order'      \=\> 'ASC',  
	\]);  
	if ( is\_wp\_error($terms) ) wp\_send\_json\_error(\['message' \=\> 'Error términos'\]);

	$out \= \[\];  
	foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];  
	wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\*\* \====== Estados de CO \= departamentos (para el selector de estado del carrito) \====== \*/  
add\_filter('woocommerce\_states', function($states){  
	$country \= 'CO';  
	$deps \= dccs\_get\_departamentos\_options();  
	if ( \! empty($deps) ) {  
		$states\[$country\] \= $deps;  
	}  
	return $states;  
}, 20);

/\*\* \====== Encolar JS/CSS sólo en el carrito \====== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
	if ( \! function\_exists('is\_cart') || \! is\_cart() ) return;

	$local \= \[  
		'ajaxurl'          \=\> admin\_url('admin-ajax.php'),  
		'nonce'            \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
		'selDept'          \=\> (string) ( dccs\_get\_selected\_dept\_id() ?: '' ),  
		'selCity'          \=\> (string) ( dccs\_get\_selected\_city\_id() ?: '' ),  
		'countryTarget'    \=\> 'CO',  
		// Intentamos usar primero el endpoint del plugin principal:  
		'primaryAction'    \=\> has\_action('wp\_ajax\_dc\_get\_ciudades') || has\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades') ? 'dc\_get\_ciudades' : 'dc\_cart\_get\_ciudades',  
		'fallbackAction'   \=\> 'dc\_cart\_get\_ciudades',  
	\];

	wp\_register\_script('dccs-cart-js', false, \['jquery'\], '1.0.0', true);  
	wp\_enqueue\_script('dccs-cart-js');  
	wp\_localize\_script('dccs-cart-js', 'DCCS', $local);

	$js \= \<\<\<JS  
(function($){  
	// Reemplaza input de ciudad por un \<select\>, dependiente de \#calc\_shipping\_state  
	function ensureCitySelect(){  
		var \\$cityField \= $('\#calc\_shipping\_city');  
		if (\!\\$cityField.length) return null;

		// Si ya es select, devolver directamente  
		if (\\$cityField.is('select')) return \\$cityField;

		// Reemplazar input por select manteniendo atributos clave  
		var name \= \\$cityField.attr('name') || 'calc\_shipping\_city';  
		var id   \= \\$cityField.attr('id')   || 'calc\_shipping\_city';  
		var req  \= \\$cityField.attr('required') ? ' required' : '';  
		var \\$select \= $('\<select'+req+'/\>', { id: id, name: name, class: 'state\_select' });  
		\\$select.append('\<option value=\\"\\"\>— Selecciona —\</option\>');  
		\\$cityField.replaceWith(\\$select);  
		return \\$select;  
	}

	function setClientCookie(name, val){  
		if(val===undefined || val===null) return;  
		document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
	}

	function loadCiudadesForDept(deptId, preselect, done){  
		var actionPrimary  \= DCCS.primaryAction || 'dc\_get\_ciudades';  
		var actionFallback \= DCCS.fallbackAction || 'dc\_cart\_get\_ciudades';

		function renderFrom(resp){  
			var opts \= '\<option value=\\"\\"\>— Selecciona —\</option\>';  
			if(resp && resp.success && resp.data && resp.data.terms){  
				resp.data.terms.forEach(function(t){  
					var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
					opts \+= '\<option value=\\"'+t.id+'\\"'+sel+'\>'+t.name+'\</option\>';  
				});  
			}  
			done(opts);  
		}

		$.post(DCCS.ajaxurl, {action: actionPrimary, nonce: DCCS.nonce, dept: deptId}).done(function(resp){  
			if(resp && resp.success){ renderFrom(resp); }  
			else {  
				$.post(DCCS.ajaxurl, {action: actionFallback, dept: deptId}).done(function(r2){ renderFrom(r2); })  
				.fail(function(){ done('\<option value=\\"\\"\>— Selecciona —\</option\>'); });  
			}  
		}).fail(function(){  
			$.post(DCCS.ajaxurl, {action: actionFallback, dept: deptId}).done(function(r2){ renderFrom(r2); })  
			.fail(function(){ done('\<option value=\\"\\"\>— Selecciona —\</option\>'); });  
		});  
	}

	function hydrateIfCO(){  
		var \\$country \= $('\#calc\_shipping\_country');  
		if (\!\\$country.length) return true; // si no hay país, procedemos  
		var isCO \= String(\\$country.val()||'') \=== String(DCCS.countryTarget||'CO');  
		return isCO;  
	}

	function bootCartCitySelect(){  
		if (\!hydrateIfCO()) return;

		var \\$state \= $('\#calc\_shipping\_state');  
		var \\$city  \= ensureCitySelect();  
		if (\!\\$state.length || \!\\$city) return;

		// Estado inicial  
		var preDept \= \\$state.val() || DCCS.selDept || '';  
		var preCity \= DCCS.selCity || '';

		if (\!preDept){  
			\\$city.prop('disabled', true).html('\<option value=\\"\\"\>— Selecciona —\</option\>');  
		} else {  
			\\$city.prop('disabled', true).html('\<option value=\\"\\"\>Cargando…\</option\>');  
			loadCiudadesForDept(preDept, preCity, function(opts){  
				\\$city.html(opts).prop('disabled', false);  
			});  
		}

		// Cambios  
		$(document).off('change.dccs', '\#calc\_shipping\_state').on('change.dccs', '\#calc\_shipping\_state', function(){  
			var deptId \= $(this).val() || '';  
			setClientCookie('dc\_dept', deptId);  
			\\$city.prop('disabled', true).html('\<option value=\\"\\"\>Cargando…\</option\>');  
			if (\!deptId){  
				\\$city.prop('disabled', true).html('\<option value=\\"\\"\>— Selecciona —\</option\>');  
				return;  
			}  
			loadCiudadesForDept(deptId, null, function(opts){  
				\\$city.html(opts).prop('disabled', false);  
			});  
		});

		$(document).off('change.dccs', '\#calc\_shipping\_city').on('change.dccs', '\#calc\_shipping\_city', function(){  
			var cityId \= $(this).val() || '';  
			setClientCookie('dc\_city', cityId);  
		});

		// Cambio de país: si no es CO, devolvemos a input simple (por compatibilidad)  
		$(document).off('change.dccs', '\#calc\_shipping\_country').on('change.dccs', '\#calc\_shipping\_country', function(){  
			if (hydrateIfCO()){  
				bootCartCitySelect(); // re-inicializa para CO  
			} else {  
				// Revertir a input texto si el theme/woo lo espera para otros países  
				var \\$cur \= $('\#calc\_shipping\_city');  
				if (\\$cur.is('select')){  
					var name \= \\$cur.attr('name'), id \= \\$cur.attr('id');  
					var \\$input \= $('\<input type=\\"text\\" class=\\"input-text\\"/\>',{id:id,name:name,placeholder: \\$cur.data('placeholder') || 'Ciudad'});  
					\\$cur.replaceWith(\\$input);  
				}  
			}  
		});  
	}

	// Al abrir la calculadora (Woo oculta/expande)  
	$(document).on('click', '.shipping-calculator-button', function(){  
		// pequeño delay por animación/DOM  
		setTimeout(bootCartCitySelect, 20);  
	});

	// Inicial por si ya viene abierta  
	$(function(){ setTimeout(bootCartCitySelect, 10); });

})(jQuery);  
JS;  
	wp\_add\_inline\_script('dccs-cart-js', $js);

	// (Opcional) estilo mínimo para el select  
	wp\_register\_style('dccs-cart-css', false, \[\], '1.0.0');  
	wp\_enqueue\_style('dccs-cart-css');  
	wp\_add\_inline\_style('dccs-cart-css', '  
		\#calc\_shipping\_city{min-height:38px;}  
	');  
});

/\*\* \====== Anti-caché suave si hay selección (para evitar servir ciudad vieja en CF/LS) \====== \*/  
add\_action('send\_headers', function(){  
	if ( isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) ) {  
		header('Vary: Cookie, Accept-Encoding');  
	}  
});

# 2 \- Checkout

**2 \- Checkout**

/\*\*  
 \* Plugin Name: WC Vincular Checkout Fields con User Meta  
 \* Description: Usa un mapeo campo\_checkout \=\> user\_meta para prellenar el checkout, guardar en el pedido y (opcional) actualizar el perfil del usuario.  
 \* Version: 1.0.0  
 \* Author: Tú  
 \*/

if (\!defined('ABSPATH')) exit;

/\*\*  
 \* EDITA AQUÍ: slug de tu campo de checkout \=\> meta\_key del usuario.  
 \* Ejemplos (cámbialos por los tuyos reales):  
 \*  \- 'billing\_nit'        \=\> 'user\_company\_nit'  
 \*  \- 'billing\_documento'  \=\> 'user\_document\_id'  
 \*  \- 'billing\_whatsapp'   \=\> 'user\_whatsapp'  
 \*  \- 'order\_birthdate'    \=\> 'user\_birthdate'  
 \*/  
function wccum\_field\_map() : array {  
  return \[  
    'tipo\_de\_documento'    \=\> 'tipo\_de\_documento',  
    'numero\_documento'     \=\> 'cedula',  
	'billing\_first\_name'   \=\> 'first\_name',  
    'billing\_last\_name'    \=\> 'last\_name',  
    'telefono'             \=\> 'billing\_phone',  
    // 'order\_birthdate'   \=\> 'user\_birthdate',  
  \];  
}

/\*\* (Opcional) ¿Actualizar también el perfil del usuario al hacer checkout? \*/  
function wccum\_update\_user\_profile() : bool {  
  return true; // pon false si NO quieres actualizar user\_meta  
}

/\*\*  
 \* 1\) PREFILL: insertar valores desde user\_meta en los campos EXISTENTES del checkout.  
 \* No crea campos; solo llena 'default' si el campo existe.  
 \*/  
add\_filter('woocommerce\_checkout\_fields', function(array $fields){  
  $map    \= wccum\_field\_map();  
  $userId \= get\_current\_user\_id();  
  if (\!$userId || empty($map)) return $fields;

  // WooCommerce agrupa campos en: 'billing', 'shipping', 'account', 'order'  
  $groups \= \['billing','shipping','account','order','additional'\];  
  foreach ($map as $checkout\_key \=\> $user\_meta\_key) {  
    $value \= get\_user\_meta($userId, $user\_meta\_key, true);  
    if ($value \=== '' || $value \=== null) continue;

    foreach ($groups as $group) {  
      if (\!empty($fields\[$group\]) && isset($fields\[$group\]\[$checkout\_key\])) {  
        $fields\[$group\]\[$checkout\_key\]\['default'\] \= $value;  
      }  
    }  
  }  
  return $fields;  
}, 20);

/\*\*  
 \* 2\) GUARDAR: al crear el pedido, tomar lo enviado y guardarlo en meta del pedido.  
 \* También (opcional) actualizar user\_meta según la bandera.  
 \*/  
add\_action('woocommerce\_checkout\_create\_order', function(WC\_Order $order, $data){  
  $map    \= wccum\_field\_map();  
  $userId \= get\_current\_user\_id();

  foreach ($map as $checkout\_key \=\> $user\_meta\_key) {  
    $raw \= $\_POST\[$checkout\_key\] ?? ''; // usa el slug exacto de tu campo de checkout  
    if ($raw \=== '') continue;

    // Sanitizar de forma genérica (ajusta si necesitas casos especiales)  
    $val \= is\_array($raw) ? implode(', ', array\_map('sanitize\_text\_field', $raw))  
                          : sanitize\_text\_field($raw);

    // Guarda en meta del pedido con una clave legible (misma que user\_meta para consistencia)  
    $order-\>update\_meta\_data($user\_meta\_key, $val);

    // (Opcional) Actualiza el perfil del usuario  
    if ($userId && wccum\_update\_user\_profile()) {  
      update\_user\_meta($userId, $user\_meta\_key, $val);  
    }  
  }  
}, 10, 2);

/\*\*  
 \* 3\) Mostrar en el admin del pedido (sección detalles).  
 \* Solo muestra los meta del mapa que existan en el pedido.  
 \*/  
add\_action('woocommerce\_admin\_order\_data\_after\_order\_details', function(WC\_Order $order){  
  $map \= wccum\_field\_map();  
  if (empty($map)) return;

  echo '\<div class="order\_data\_column"\>\<h3\>Datos adicionales del cliente\</h3\>\<table style="width:100%"\>';  
  foreach ($map as $checkout\_key \=\> $user\_meta\_key) {  
    $val \= $order-\>get\_meta($user\_meta\_key);  
    if ($val \=== '' || $val \=== null) continue;

    // Etiqueta bonita a partir del slug (puedes personalizar si quieres)  
    $label \= ucwords(str\_replace(\['\_', '-'\], ' ', $checkout\_key));  
    echo '\<tr\>\<th style="text-align:left;width:40%;"\>'.esc\_html($label).'\</th\>\<td\>'.esc\_html($val).'\</td\>\</tr\>';  
  }  
  echo '\</table\>\</div\>';  
});

/\*\*  
 \* Plugin Name: CL – Opt-in Marketing en Checkout  
 \* Description: Checkbox opcional de consentimiento de marketing en el checkout clásico de WooCommerce. Guarda en orden y usuario.  
 \* Version: 1.0.1  
 \* Author: ClickLab  
 \*/

if ( \! defined('ABSPATH') ) exit;

/\*\*  
 \* Mostrar checkbox justo antes del botón de realizar pedido  
 \*/  
add\_action('woocommerce\_review\_order\_before\_submit', function(){  
    if ( \! function\_exists('WC') || ( function\_exists('is\_checkout') && \! is\_checkout() ) ) return;

    $pref    \= is\_user\_logged\_in() ? get\_user\_meta( get\_current\_user\_id(), 'cl\_marketing\_optin', true ) : '';  
    $checked \= ( $pref \=== 'yes' ) ? 'checked' : '';

    $privacy\_url \= get\_privacy\_policy\_url() ?: home\_url('/politica-de-privacidad/');  
    ?\>  
    \<div class="cl-marketing-optin" style="margin:16px 0;"\>  
      \<label class="woocommerce-form\_\_label woocommerce-form\_\_label-for-checkbox checkbox cl-marketing-optin-label"\>  
        \<input type="checkbox"  
			   .cl-marketing-optin-label{ display:flex; gap:8px; align-items:center; }  
               class="woocommerce-form\_\_input woocommerce-form\_\_input-checkbox input-checkbox"  
               name="cl\_marketing\_optin"  
               id="cl\_marketing\_optin"  
               value="1" \<?php echo $checked; ?\> /\>  
        \<span\>  
          Quiero recibir \<strong\>novedades y promociones\</strong\> por email/WhatsApp.  
          \<a href="\<?php echo esc\_url($privacy\_url); ?\>" target="\_blank" rel="noopener"\>Privacidad\</a\>  
        \</span\>  
      \</label\>  
    \</div\>  
    \<?php  
}, 9);

/\*\*  
 \* Guardar en la orden (HPOS compatible)  
 \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    $optin \= \! empty( $\_POST\['cl\_marketing\_optin'\] ) ? 'yes' : 'no';  
    $order-\>update\_meta\_data( '\_cl\_marketing\_optin', $optin );  
}, 10, 2);

/\*\*  
 \* Persistir en el usuario (si está logueado)  
 \*/  
add\_action('woocommerce\_checkout\_update\_order\_meta', function( $order\_id ){  
    if ( is\_user\_logged\_in() ) {  
        $optin \= \! empty( $\_POST\['cl\_marketing\_optin'\] ) ? 'yes' : 'no';  
        update\_user\_meta( get\_current\_user\_id(), 'cl\_marketing\_optin', $optin );  
    }  
});

/\*\*  
 \* Mostrar en Admin de la orden  
 \*/  
add\_action('woocommerce\_admin\_order\_data\_after\_billing\_address', function( $order ){  
    $optin \= $order-\>get\_meta('\_cl\_marketing\_optin');  
    if ( $optin ) {  
        echo '\<p\>\<strong\>Consentimiento marketing:\</strong\> ' . ( $optin \=== 'yes' ? 'Sí' : 'No' ) . '\</p\>';  
    }  
});

/\*\*  
 \* Incluir en correos  
 \*/  
add\_action('woocommerce\_email\_order\_meta', function( $order, $sent\_to\_admin, $plain\_text ){  
    $optin \= $order-\>get\_meta('\_cl\_marketing\_optin');  
    if ( \! $optin ) return;

    if ( $plain\_text ) {  
        echo "\\nConsentimiento marketing: " . ( $optin \=== 'yes' ? 'Sí' : 'No' ) . "\\n";  
    } else {  
        echo '\<p\>\<strong\>Consentimiento marketing:\</strong\> ' . ( $optin \=== 'yes' ? 'Sí' : 'No' ) . '\</p\>';  
    }  
}, 10, 3);

/\*\*  
 \* Checkout:   
 \* \- Mostrar regular tachado \+ precio en oferta por ítem  
 \* \- Renombrar "Subtotal" a "Costo de productos"  
 \* \- Hacer que el valor del "Subtotal" sea la suma de precios REGULARES  
 \* \- Insertar "Ahorro en productos" debajo  
 \* \- Guardar y mostrar en la orden (emails / gracias / Mi cuenta / admin)  
 \*  
 \* Requiere (opcional): cl\_cart\_regular\_and\_savings() \-\> \['regular\_total'=\>float, 'savings\_total'=\>float\]  
 \* Si no existe, se calcula automáticamente.  
 \*/

/\* \================== Helpers \================== \*/  
/\*\*  
 \* Calcula:  
 \*  \- regular\_total: suma de precios REGULARES (sin ofertas)  
 \*  \- savings\_total: ahorro \= regular\_total \- total\_en\_oferta  
 \*  
 \* NO usa cl\_cart\_regular\_and\_savings()  
 \* NO depende de filtros de precio ni de roles.  
 \*/  
if ( \! function\_exists('cl\_get\_regular\_and\_savings') ) {  
	function cl\_get\_regular\_and\_savings() {  
		$regular\_total \= 0;  
		$current\_total \= 0;

		if ( function\_exists('WC') && WC()-\>cart ) {  
			foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
				if ( empty( $cart\_item\['data'\] ) ) {  
					continue;  
				}

				/\*\* @var WC\_Product $product \*/  
				$product \= $cart\_item\['data'\];  
				$qty     \= max( 1, (int) $cart\_item\['quantity'\] );

				$product\_id \= $product-\>get\_id();

				// Leer SIEMPRE desde meta, sin filtros ni lógicas por rol  
				$reg\_raw  \= get\_post\_meta( $product\_id, '\_regular\_price', true );  
				$sale\_raw \= get\_post\_meta( $product\_id, '\_sale\_price', true );

				// Normalizar  
				$reg\_raw  \= $reg\_raw  \!== '' ? (float) $reg\_raw  : 0.0;  
				$sale\_raw \= $sale\_raw \!== '' ? (float) $sale\_raw : 0.0;

				// Si no hay oferta, el "current" es el regular  
				if ( $sale\_raw \> 0 && $sale\_raw \< $reg\_raw ) {  
					$current\_raw \= $sale\_raw;  
				} else {  
					$current\_raw \= $reg\_raw;  
				}

				// Convertir a precio mostrado (con impuestos si aplica)  
				$unit\_regular \= (float) wc\_get\_price\_to\_display(  
					$product,  
					\[ 'price' \=\> $reg\_raw \]  
				);  
				$unit\_current \= (float) wc\_get\_price\_to\_display(  
					$product,  
					\[ 'price' \=\> $current\_raw \]  
				);

				$regular\_total \+= $unit\_regular \* $qty;  
				$current\_total \+= $unit\_current \* $qty;  
			}  
		}

		$savings\_total \= max( 0, $regular\_total \- $current\_total );  
		return \[ $regular\_total, $savings\_total \];  
	}  
}

/\* \================== 1\) En checkout, mostrar regular tachado \+ oferta por ÍTEM \================== \*/  
// En la columna "Total" por ítem (checkout)  
add\_filter('woocommerce\_cart\_item\_subtotal', function( $subtotal\_html, $cart\_item, $cart\_item\_key ){  
	if ( \! is\_checkout() ) return $subtotal\_html;  
	if ( empty($cart\_item\['data'\]) ) return $subtotal\_html;

	/\*\* @var WC\_Product $product \*/  
	$product \= $cart\_item\['data'\];  
	$qty     \= max(1, (int) $cart\_item\['quantity'\]);

	// Si no está en oferta, no tocamos  
	if ( \! $product-\>is\_on\_sale() ) return $subtotal\_html;

	$reg\_unit  \= (float) wc\_get\_price\_to\_display( $product, \['price' \=\> (float) $product-\>get\_regular\_price()\] );  
	$sale\_base \= $product-\>get\_sale\_price();  
	if ( $sale\_base \=== '' || $sale\_base \=== null ) {  
		$sale\_base \= $product-\>get\_price();  
	}  
	$sale\_unit \= (float) wc\_get\_price\_to\_display( $product, \['price' \=\> (float) $sale\_base\] );

	$reg  \= $reg\_unit \* $qty;  
	$sale \= $sale\_unit \* $qty;

	return sprintf(  
		'\<del\>%s\</del\> \<ins\>%s\</ins\>',  
		wc\_price($reg),  
		wc\_price($sale)  
	);  
}, 10, 3);

// (Opcional) si tu checkout muestra columna de "Precio" por ítem, también la ajusta  
add\_filter('woocommerce\_cart\_item\_price', function( $price\_html, $cart\_item, $cart\_item\_key ){  
	if ( \! is\_checkout() ) return $price\_html;  
	if ( empty($cart\_item\['data'\]) ) return $price\_html;

	/\*\* @var WC\_Product $product \*/  
	$product \= $cart\_item\['data'\];

	if ( \! $product-\>is\_on\_sale() ) return $price\_html;

	$reg  \= (float) wc\_get\_price\_to\_display( $product, \['price' \=\> (float) $product-\>get\_regular\_price()\] );  
	$sale\_base \= $product-\>get\_sale\_price();  
	if ( $sale\_base \=== '' || $sale\_base \=== null ) {  
		$sale\_base \= $product-\>get\_price();  
	}  
	$sale \= (float) wc\_get\_price\_to\_display( $product, \['price' \=\> (float) $sale\_base\] );

	return sprintf('\<del\>%s\</del\> \<ins\>%s\</ins\>', wc\_price($reg), wc\_price($sale));  
}, 10, 3);

/\* \================== 2\) Renombrar "Subtotal" → "Costo de productos" (solo checkout) \================== \*/  
add\_filter('gettext', function( $translated, $original, $domain ){  
	$is\_checkout\_ajax \= ( defined('DOING\_AJAX') && DOING\_AJAX && isset($\_REQUEST\['wc-ajax'\]) && $\_REQUEST\['wc-ajax'\] \=== 'update\_order\_review' );  
	if ( $domain \=== 'woocommerce' && ( is\_checkout() || $is\_checkout\_ajax ) ) {  
		if ( $original \=== 'Subtotal' )  return 'Costo de productos';  
		if ( $original \=== 'Subtotal:' ) return 'Costo de productos:';  
	}  
	return $translated;  
}, 10, 3);

/\* \================== 3\) Hacer que el valor del Subtotal sea la suma de PRECIOS REGULARES \================== \*/  
add\_filter('woocommerce\_cart\_subtotal', function( $cart\_subtotal\_html, $compound, $cart ){  
	if ( \! is\_checkout() && \! ( defined('DOING\_AJAX') && DOING\_AJAX ) ) return $cart\_subtotal\_html;

	list($regular\_total,) \= cl\_get\_regular\_and\_savings();  
	return wc\_price( $regular\_total );  
}, 10, 3);

/\* \================== 4\) Insertar "Ahorro en productos" justo debajo del Subtotal en checkout \================== \*/  
function cl\_checkout\_print\_savings\_under\_subtotal\_row() {  
	if ( \! function\_exists('WC') || \! WC()-\>cart || WC()-\>cart-\>is\_empty() ) return;

	list(, $savings\_total) \= cl\_get\_regular\_and\_savings();  
	$display \= ( $savings\_total \> 0 ? '-' : '' ) . wc\_price( $savings\_total );

	echo '\<tr class="cl-row cl-savings cart-discount"\>  
			\<th\>' . esc\_html\_\_('Ahorro en productos', 'cl') . '\</th\>  
			\<td data-title="' . esc\_attr\_\_('Ahorro en productos', 'cl') . '"\>  
				\<span class="woocommerce-Price-amount amount cl-negative"\>' . $display . '\</span\>  
			\</td\>  
		  \</tr\>';  
}  
// Debajo del subtotal (antes del envío) en el checkout  
add\_action('woocommerce\_review\_order\_before\_shipping', 'cl\_checkout\_print\_savings\_under\_subtotal\_row', 5);

/\* \================== 5\) Guardar en la ORDEN y mostrar en emails / gracias / Mi cuenta \================== \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order ){  
	list($regular\_total, $savings\_total) \= cl\_get\_regular\_and\_savings();  
	$order-\>update\_meta\_data('\_cl\_regular\_total', $regular\_total);  
	$order-\>update\_meta\_data('\_cl\_savings\_total', $savings\_total);  
}, 10, 1);

// Insertar debajo del "cart\_subtotal" en totales de la orden (emails / gracias / ver pedido)  
add\_filter('woocommerce\_get\_order\_item\_totals', function( $totals, $order ){  
	$regular\_total \= (float) $order-\>get\_meta('\_cl\_regular\_total');  
	$savings\_total \= (float) $order-\>get\_meta('\_cl\_savings\_total');

	$new \= \[\];  
	$inserted \= false;

	foreach ( $totals as $key \=\> $row ) {  
		$new\[$key\] \= $row;

		if ( 'cart\_subtotal' \=== $key ) {  
			// Mostramos Costo de productos (regular\_total) y Ahorro en productos  
			$new\['cl\_regular\_total'\] \= \[  
				'label' \=\> esc\_html\_\_('Costo de productos', 'cl'),  
				'value' \=\> wc\_price( $regular\_total ),  
			\];  
			$new\['cl\_savings\_total'\] \= \[  
				'label' \=\> esc\_html\_\_('Ahorro en productos', 'cl'),  
				'value' \=\> ( $savings\_total \> 0 ? '-' : '' ) . wc\_price( $savings\_total ),  
			\];  
			$inserted \= true;  
		}  
	}

	// Si por tema no existe 'cart\_subtotal', inserta antes del total  
	if ( \! $inserted ) {  
		$tmp \= \[\];  
		foreach ( $new as $key \=\> $row ) {  
			if ( 'order\_total' \=== $key ) {  
				$tmp\['cl\_regular\_total'\] \= \[  
					'label' \=\> esc\_html\_\_('Costo de productos', 'cl'),  
					'value' \=\> wc\_price( $regular\_total ),  
				\];  
				$tmp\['cl\_savings\_total'\] \= \[  
					'label' \=\> esc\_html\_\_('Ahorro en productos', 'cl'),  
					'value' \=\> ( $savings\_total \> 0 ? '-' : '' ) . wc\_price( $savings\_total ),  
				\];  
			}  
			$tmp\[$key\] \= $row;  
		}  
		$new \= $tmp;  
	}

	return $new;  
}, 10, 2);

/\* \================== 6\) Admin: totales en edición de pedido \================== \*/  
add\_action('woocommerce\_admin\_order\_totals\_after\_total', function( $order\_id ){  
	$order         \= wc\_get\_order( $order\_id );  
	$regular\_total \= (float) $order-\>get\_meta('\_cl\_regular\_total');  
	$savings\_total \= (float) $order-\>get\_meta('\_cl\_savings\_total');

	if ( $regular\_total \<= 0 && $savings\_total \<= 0 ) return; ?\>  
	\<tr\>  
		\<td class="label"\>\<?php echo esc\_html\_\_('Costo de productos', 'cl'); ?\>:\</td\>  
		\<td width="1%"\>\</td\>  
		\<td class="total"\>\<?php echo wc\_price( $regular\_total ); ?\>\</td\>  
	\</tr\>  
	\<tr\>  
		\<td class="label"\>\<?php echo esc\_html\_\_('Ahorro en productos', 'cl'); ?\>:\</td\>  
		\<td width="1%"\>\</td\>  
		\<td class="total"\>\<?php echo ( $savings\_total \> 0 ? '-' : '' ) . wc\_price( $savings\_total ); ?\>\</td\>  
	\</tr\>  
\<?php  
});

//Wompi  
add\_filter('woocommerce\_gateway\_title', function($title, $payment\_id) {  
    if ($payment\_id \=== 'wompi') {  
        $title \= wp\_strip\_all\_tags($title);  
        $title \= 'Pague con opciones de financiamiento a traves de ';  
    }  
    return $title;  
}, 10, 2);

add\_filter('woocommerce\_gateway\_description', function($description, $payment\_id) {  
    if ($payment\_id \=== 'wompi') {  
        return '';  
    }  
    return $description;  
}, 10, 2);

add\_action('wp\_head', function() {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        echo '\<style\>  
            /\* Oculta el logo original del plugin \*/  
            .payment\_method\_wompi label img {  
                display: none \!important;  
            }

            /\* Ajusta el texto y el logo en la misma línea \*/  
            .payment\_method\_wompi label {  
                display: inline-flex;  
                align-items: center;  
                gap: 6px;  
            }

            /\* Logo personalizado \*/  
            .payment\_method\_wompi label::after {  
                content: "";  
                display: inline-block;  
                width: 80px;  
                height: 40px;  
                background-image: url("https://tienda.pharmaplus.com.co/wp-content/plugins/wompi-portal-de-pagos/assets/img/wompi-logo.png");  
                background-size: contain;  
                background-repeat: no-repeat;  
                background-position: center;  
            }  
        \</style\>';  
    }  
});

/\*\*  
 \* CL – Botón personalizado para subir fórmula médica en el checkout  
 \*/  
add\_action('wp\_head', function() {  
    if (function\_exists('is\_checkout') && \! is\_checkout()) {  
        return;  
    }  
    ?\>  
    \<style\>  
        /\* Escondemos visualmente el botón nativo del input file \*/  
        .woocommerce-checkout form input\[type="file"\] {  
            position: absolute;  
            inset: 0;  
            width: 100%;  
            height: 100%;  
            opacity: 0;  
            cursor: pointer;  
        }

        .cl-file-wrapper {  
            position: relative;  
            display: inline-block;  
        }

        .cl-file-button {  
            display: inline-block;  
            padding: 10px 16px;  
            border-radius: 4px;  
            background: \#0073aa;  
            color: \#ffffff;  
            font-size: 14px;  
            line-height: 1.2;  
            cursor: pointer;  
            white-space: nowrap;  
        }

        .cl-file-button:hover {  
            background: \#005d82;  
        }  
    \</style\>  
    \<?php  
});

add\_action('wp\_footer', function() {  
    if (function\_exists('is\_checkout') && \! is\_checkout()) {  
        return;  
    }  
    ?\>  
    \<script\>  
    document.addEventListener('DOMContentLoaded', function () {  
        // Todos los inputs file en el checkout  
        const fileInputs \= document.querySelectorAll('.woocommerce-checkout input\[type="file"\]');

        fileInputs.forEach(function (input) {  
            // Evitar envolver dos veces  
            if (input.closest('.cl-file-wrapper')) return;

            // Contenedor  
            const wrapper \= document.createElement('div');  
            wrapper.className \= 'cl-file-wrapper';

            // Botón con el texto que quieres  
            const button \= document.createElement('span');  
            button.className \= 'cl-file-button';  
            button.textContent \= 'Dar clic aquí y agrega la fórmula médica';

            // Insertar antes del input y luego meter el input dentro del wrapper  
            input.parentNode.insertBefore(wrapper, input);  
            wrapper.appendChild(button);  
            wrapper.appendChild(input);

            // Cuando seleccione archivo, mostrar el nombre en el botón  
            input.addEventListener('change', function () {  
                if (input.files && input.files.length \> 0\) {  
                    button.textContent \= input.files\[0\].name;  
                } else {  
                    button.textContent \= 'Dar clic aquí y agrega la fórmula médica';  
                }  
            });  
        });  
    });  
    \</script\>  
    \<?php  
});

# 3 \- Checkout Labels

**3 \- Checkout Labels**

add\_action( 'wp\_footer', function () {  
  if ( \! is\_checkout() ) return;  
  ?\>  
  \<script\>  
  jQuery(function($){

    // Mapea: id del field wrapper \=\> nuevo texto del label  
    const LABELS \= {  
      'billing\_city\_field': 'Ciudad',  
      // Ejemplos:  
      // 'billing\_postcode\_field': 'Código postal',  
      // 'billing\_state\_field': 'Departamento / Provincia',  
    };

    function setLabelHtml($field, newText){  
      const $label \= $field.find('label');  
      if (\!$label.length) return;

      // ¿El campo es requerido?  
      const isRequired \= $field.hasClass('validate-required');

      // Intenta recuperar el markup actual del asterisco si existe  
      let reqHtml \= $label.find('.required').prop('outerHTML') || '';

      // Si es requerido y no encontramos markup, creamos uno estándar  
      if (isRequired && \!reqHtml){  
        // WooCommerce suele usar \<abbr class="required" title="required"\>\*\</abbr\>  
        // o \<span class="required"\>\*\</span\>  
        reqHtml \= '\<abbr class="required" title="obligatorio"\>\*\</abbr\>';  
      }

      // Construye el HTML final del label (texto \+ asterisco si aplica)  
      $label.html( isRequired ? (newText \+ ' ' \+ reqHtml) : newText );  
    }

    function fixLabels(){  
      Object.entries(LABELS).forEach((\[fieldId, text\])=\>{  
        const $field \= $('\#'+fieldId);  
        if ($field.length) setLabelHtml($field, text);  
      });  
    }

    // Al cargar  
    fixLabels();  
    // Cuando WooCommerce refresca el checkout o país/estado  
    $(document.body).on('updated\_checkout country\_to\_state\_changed', fixLabels);  
  });  
  \</script\>  
  \<?php  
});

// Cambiar el título y descripción del método de pago "Contra reembolso" y "Credibanco"  
add\_filter( 'woocommerce\_gateway\_title', function( $title, $id ){  
    if( $id \=== 'cod' ){  
        $title \= 'Contra Entrega'; // nuevo título  
    }  
    return $title;  
}, 10, 2 );

add\_filter( 'woocommerce\_gateway\_description', function( $description, $id ){  
    if( $id \=== 'cod' ){  
        $description \= 'Paga en efectivo o datáfono al momento de la entrega.'; // nueva descripción  
    }  
    return $description;  
}, 10, 2 );  
	  
add\_filter( 'woocommerce\_gateway\_title', function( $title, $id ){  
    if( $id \=== 'credibanco' ){  
        $title \= 'Paga por PSE o tarjeta';  
    }  
    return $title;  
}, 10, 2 );

// Cambiar texto de política de privacidad en checkout  
// Cambiar el texto de privacidad en checkout (clásico y bloques)  
add\_filter( 'woocommerce\_get\_privacy\_policy\_text', function( $text, $context ){  
    if ( in\_array( $context, array( 'checkout', 'checkout\_registration', 'pay' ), true ) ) {  
        $url \= 'https://tienda.pharmaplus.com.co/politicas/';  
        return sprintf(  
            'Tus datos personales se usarán para procesar tu pedido, mejorar tu experiencia en este sitio web y para otros fines descritos en nuestra \<a href="%s" class="woocommerce-privacy-policy-link" target="\_blank"\>política de privacidad\</a\>.',  
            esc\_url( $url )  
        );  
    }  
    return $text;  
}, 10, 2 );

# 4 \- Checkout Popup Gate

**4 \- Checkout Popup Gate**

/\*\*  
 \* Plugin Name: LM Elementor Checkout Popup Gate  
 \* Description: Si el usuario NO está logueado, intercepta cualquier intento de ir al Checkout (click, submit, AJAX/JS redirect) y abre el popup de Elementor Pro (ID 12721\) con intento único. Incluye bloqueo server-side \+ cookie de reopen. Anti-autocierre no intrusivo (ESC/overlay bloqueados 1.4s).  
 \* Version:     1.1.2  
 \* Author:      LM  
 \* License:     GPLv2 or later  
 \*/

if ( \! defined('ABSPATH') ) exit;

if ( \! defined('LM\_EPOPUP\_ID') )  define('LM\_EPOPUP\_ID', 12721); // ID del popup de Elementor  
if ( \! defined('LM\_ECPG\_DEBUG') ) define('LM\_ECPG\_DEBUG', false);  // true para depurar

final class LM\_Elementor\_Checkout\_Popup\_Gate {  
    const COOKIE\_REOPEN \= 'lm\_ecpg\_reopen';  
    const COOKIE\_TTL    \= 300; // 5 min

    public function \_\_construct() {  
        add\_action('wp\_enqueue\_scripts', \[ $this, 'enqueue' \]);  
        add\_action('woocommerce\_checkout\_process', \[ $this, 'block\_guest\_checkout' \], 0);  
        add\_action('wp\_footer', \[ $this, 'footer\_anchor' \]);  
    }

    /\*\* Front only \*/  
    public function enqueue() {  
        if ( is\_admin() || ( defined('REST\_REQUEST') && REST\_REQUEST ) ) return;

        wp\_enqueue\_script('jquery'); // por si el tema no lo hace

        $handle \= 'lm-ecpg';  
        wp\_register\_script($handle, false, \[\], '1.1.2', true);

        $selectors \= apply\_filters('lm\_ecpg\_selectors', $this-\>default\_selectors());

        $data \= \[  
            'isLoggedIn'  \=\> is\_user\_logged\_in(),  
            'popupId'     \=\> (int) LM\_EPOPUP\_ID,  
            'selectors'   \=\> array\_values(array\_unique(array\_filter($selectors))),  
            'checkoutUrl' \=\> function\_exists('wc\_get\_checkout\_url') ? wc\_get\_checkout\_url() : home\_url('/checkout/'),  
            'sameHost'    \=\> parse\_url(home\_url(), PHP\_URL\_HOST),  
            'reopen'      \=\> isset($\_COOKIE\[self::COOKIE\_REOPEN\]) ? 1 : 0,  
            'debug'       \=\> LM\_ECPG\_DEBUG ? 1 : 0,  
        \];

        wp\_enqueue\_script($handle);  
        wp\_add\_inline\_script($handle, 'window.LM\_ECPG='.wp\_json\_encode($data).';', 'before');  
        wp\_add\_inline\_script($handle, $this-\>inline\_js(), 'after');

        // Consumir cookie (evitar loops)  
        if ( isset($\_COOKIE\[self::COOKIE\_REOPEN\]) ) {  
            setcookie(self::COOKIE\_REOPEN, '', time()-3600, COOKIEPATH ?: '/', parse\_url(home\_url(), PHP\_URL\_HOST), is\_ssl(), true);  
        }

        // Estilos mínimos para notices ocultos  
        wp\_register\_style('lm-ecpg', false, \[\], '1.1.2');  
        wp\_enqueue\_style('lm-ecpg');  
        wp\_add\_inline\_style('lm-ecpg', '.lm-ecpg-hidden{display:none\!important;}');  
    }

    /\*\* Selectores a interceptar (extensibles por filtro lm\_ecpg\_selectors) \*/  
    private function default\_selectors() {  
        return \[  
            // Core checkout  
            '.checkout-button',  
            '.woocommerce-mini-cart\_\_buttons a.checkout',  
            '.widget\_shopping\_cart\_content .buttons a.checkout',  
            '.mini-cart .buttons a.checkout',  
            '.elementor-menu-cart\_\_footer-buttons a.elementor-button--checkout',  
            'a\[href\*="/checkout"\]',  
            'form\[action\*="/checkout"\] button\[type="submit"\]',

            // “Buy Now” comunes de plugins/temas  
            '.buy-now, .buynow, .button-buy-now, .btn-buy-now',  
            '.single\_add\_to\_cart\_button.buy-now, .single\_add\_to\_cart\_button\[data-buy-now\], .single\_add\_to\_cart\_button\[name\*="buy-now"\]',  
            '\[data-buy-now\], \[data-action\*="buy"\], \[data-redirect\*="checkout"\]',  
            '.direct-checkout-button, .wcdx-buy-now, .wcbn-buy-now, .wc-buy-now',  
            '.ppcp-buy-now, .ppcp-button\_\_checkout', // PayPal “Buy Now”, por si redirige a checkout local  
        \];  
    }

    /\*\* JS inline: versión “one-shot” con guardas \+ anti-autocierre ligero (solo 1.4s) \*/  
    private function inline\_js() {  
        return \<\<\<JS  
(function(){  
  var C \= window.LM\_ECPG || {};  
  var log  \= function(){ if(C.debug) try{ console.log("%c\[LM\_ECPG\]","color:\#09f", ...arguments);}catch(e){} };  
  var warn \= function(){ if(C.debug) try{ console.warn("\[LM\_ECPG\]", ...arguments);}catch(e){} };  
  var err  \= function(){ if(C.debug) try{ console.error("\[LM\_ECPG\]", ...arguments);}catch(e){} };

  if (C.isLoggedIn) { log("Usuario logueado; no interceptar."); return; }

  // \--- Detección checkout \---  
  function normalize(url){ return (url||'').replace(/\\\\/+$/,''); }  
  var BASE \= normalize(C.checkoutUrl||'');  
  function isCheckoutURL(href){  
    if (\!href) return false;  
    try {  
      var u \= new URL(href, window.location.origin);  
      var same \= (u.host \=== C.sameHost);  
      var path \= normalize(u.pathname || '');  
      var base \= BASE;  
      return same && (path.endsWith('/checkout') || normalize(u.href).indexOf(base) \=== 0);  
    } catch(e){ return false; }  
  }

  // \--- Anti-autocierre minimalista: bloquea ESC y clicks en overlay/cerrar por 1.4s  
  function lockPopupClose(ms){  
    ms \= ms || 1400;  
    var until \= Date.now() \+ ms;

    function stopIfActive(e){  
      if (Date.now() \> until) {  
        document.removeEventListener('keydown', stopIfActive, true);  
        document.removeEventListener('click',  stopIfActive, true);  
        return;  
      }  
      // ESC  
      if (e.type \=== 'keydown' && (e.key \=== 'Escape' || e.keyCode \=== 27)) {  
        e.preventDefault(); e.stopImmediatePropagation();  
        return;  
      }  
      // Overlay / botones de cerrar típicos de Elementor  
      if (e.type \=== 'click') {  
        var t \= e.target;  
        if (\!t || \!t.closest) return;  
        if (  
          t.closest('.dialog-widget-overlay') ||  
          t.closest('.elementor-popup-modal .dialog-close-button') ||  
          t.closest('.elementor-popup-modal .eicon-close')  
        ){  
          e.preventDefault(); e.stopImmediatePropagation();  
          return;  
        }  
      }  
    }

    document.addEventListener('keydown', stopIfActive, true);  
    document.addEventListener('click',  stopIfActive, true);  
    setTimeout(function(){  
      document.removeEventListener('keydown', stopIfActive, true);  
      document.removeEventListener('click',  stopIfActive, true);  
    }, ms \+ 50);  
  }

  // \--- Apertura one-shot (sin loop) \+ candado  
  var lastTry \= 0;  
  function openPopupOnce(){  
    var now \= Date.now();  
    if (now \- lastTry \< 1200\) { log("Throttle activo. Saltando."); return; }  
    lastTry \= now;

    if (document.body.classList.contains('elementor-popup-modal-open')) {  
      log("Popup ya abierto.");  
      return;  
    }

    function \_tryOpenOnce(){  
      try {  
        if (window.elementorProFrontend && elementorProFrontend.modules && elementorProFrontend.modules.popup) {  
          lockPopupClose(1400); // Candado ANTES de abrir (cubre el primer click/ESC rezagado)  
          elementorProFrontend.modules.popup.showPopup({ id: C.popupId });  
          log("✅ showPopup one-shot para ID", C.popupId);  
          // Re-afirmar el candado poco después por si el overlay se inyecta asíncrono  
          setTimeout(function(){ lockPopupClose(800); }, 60);  
        } else {  
          requestAnimationFrame(function(){  
            if (window.elementorProFrontend && elementorProFrontend.modules && elementorProFrontend.modules.popup) {  
              lockPopupClose(1400);  
              elementorProFrontend.modules.popup.showPopup({ id: C.popupId });  
              log("✅ showPopup (diferido) para ID", C.popupId);  
              setTimeout(function(){ lockPopupClose(800); }, 60);  
            } else {  
              warn("Módulo de popups no disponible en el único intento. No se reintenta.");  
            }  
          });  
        }  
      } catch(e){  
        err("Error al llamar showPopup:", e);  
      }  
    }  
    \_tryOpenOnce();  
  }

  // \--- Guardas de navegación (location & history) para frenar redirecciones JS a checkout  
  (function guardNavigation(){  
    var loc \= window.location;  
    var \_assign  \= loc.assign ? loc.assign.bind(loc) : null;  
    var \_replace \= loc.replace ? loc.replace.bind(loc) : null;  
    if (\_assign) {  
      loc.assign \= function(url){  
        if (isCheckoutURL(url)) { log("Intercept location.assign \-\> checkout"); openPopupOnce(); return; }  
        return \_assign(url);  
      };  
    }  
    if (\_replace) {  
      loc.replace \= function(url){  
        if (isCheckoutURL(url)) { log("Intercept location.replace \-\> checkout"); openPopupOnce(); return; }  
        return \_replace(url);  
      };  
    }  
    try {  
      var proto \= Object.getPrototypeOf(loc) || Location.prototype;  
      var desc \= Object.getOwnPropertyDescriptor(proto, 'href');  
      if (desc && desc.set && desc.get) {  
        Object.defineProperty(loc, 'href', {  
          configurable: true,  
          get: function(){ return desc.get.call(loc); },  
          set: function(url){  
            if (isCheckoutURL(url)) { log("Intercept location.href= \-\> checkout"); openPopupOnce(); return; }  
            return desc.set.call(loc, url);  
          }  
        });  
      }  
    } catch(e){ warn("No se pudo envolver location.href:", e); }

    try {  
      var H \= window.history;  
      var \_ps \= H.pushState.bind(H);  
      var \_rs \= H.replaceState.bind(H);  
      function guard(fn, name){  
        return function(state, title, url){  
          if (isCheckoutURL(url)) { log("Intercept history."+name+" \-\> checkout"); openPopupOnce(); return; }  
          return fn(state, title, url);  
        }  
      }  
      H.pushState   \= guard(\_ps, 'pushState');  
      H.replaceState= guard(\_rs, 'replaceState');  
    } catch(e){ warn("No se pudo envolver history.\*:", e); }  
  })();

  // \--- Heurística: botones/links cuyo texto sea "Comprar ahora/Buy now"  
  function isBuyNowText(el){  
    try {  
      var txt \= (el.innerText || el.textContent || '').trim();  
      return /comprar\\\\s\*ahora|buy\\\\s\*now/i.test(txt);  
    } catch(e){ return false; }  
  }

  // \--- Interceptores (captura true) SOLO 'click' (evita dobles en touch/mouse)  
  var selectors \= (C.selectors || \[\]).join(',');  
  if (\!selectors) selectors \= 'a\[href\*="/checkout"\], .checkout-button, form\[action\*="/checkout"\] button\[type="submit"\], .elementor-button--checkout';

  function shouldInterceptElement(el){  
    if (\!el) return false;

    // 1\) Enlace directo  
    if (el.tagName \=== 'A') {  
      var href \= el.getAttribute('href') || '';  
      if (isCheckoutURL(href)) return true;  
    }

    // 2\) Botón con form hacia checkout  
    if (el.tagName \=== 'BUTTON' || el.tagName \=== 'INPUT') {  
      var form \= el.form || (el.closest ? el.closest('form') : null);  
      var action \= form ? (form.getAttribute('action') || '') : '';  
      if (action && isCheckoutURL(action)) return true;  
    }

    // 3\) Heurística de texto “Comprar ahora/Buy now”  
    if (isBuyNowText(el)) return true;

    // 4\) Fallback .checkout-button  
    if (el.classList && el.classList.contains('checkout-button')) return true;

    return false;  
  }

  function handleIntercept(e, el){  
    e.preventDefault();  
    e.stopImmediatePropagation();  
    e.stopPropagation();  
    log("Interceptado | abriendo popup (one-shot)");  
    // Defer a microtarea para que no herede el mismo click que abrió  
    setTimeout(openPopupOnce, 0);  
    return false;  
  }

  document.addEventListener('click', function(e){  
    var t \= e.target;  
    if (\!t) return;  
    var el \= t.closest ? (t.closest(selectors) || t.closest('a, button, input\[type="submit"\]')) : null;  
    if (\!el) return;

    if (shouldInterceptElement(el)) {  
      return handleIntercept(e, el);  
    }  
  }, true);

  // Submit global  
  document.addEventListener('submit', function(e){  
    var form \= e.target;  
    if (\!form || form.nodeName \!== 'FORM') return;  
    var action \= form.getAttribute('action') || '';  
    if (action && isCheckoutURL(action)) {  
      e.preventDefault();  
      e.stopImmediatePropagation();  
      e.stopPropagation();  
      log("Intercept submit \-\> abrir popup");  
      setTimeout(openPopupOnce, 0);  
      return false;  
    }  
  }, true);

  // Log opcional de AJAX  
  if (window.jQuery) {  
    try {  
      jQuery(document).ajaxSuccess(function(\_e, xhr, settings){  
        if (\!settings) return;  
        var u \= settings.url || '';  
        if (isCheckoutURL(u)) { log("ajaxSuccess hacia checkout detectado:", u); }  
        try {  
          var r \= xhr && xhr.responseJSON;  
          var redir \= r && (r.redirect || r.url);  
          if (redir && isCheckoutURL(redir)) { log("ajaxSuccess redirect-\>checkout en payload"); }  
        } catch(ex){}  
      });  
    } catch(ex){}  
  }

  // Reopen una sola vez tras load  
  if (C.reopen) {  
    window.addEventListener('load', function(){  
      log("Cookie reopen detectada; abriendo popup (one-shot)...");  
      setTimeout(function(){ openPopupOnce(); }, 350);  
    });  
  }  
})();  
JS;  
    }

    /\*\* Bloqueo server-side si llega a /checkout sin login \+ cookie de reopen \*/  
    public function block\_guest\_checkout() {  
        if ( is\_user\_logged\_in() ) return;

        wc\_add\_notice(  
            \_\_('\<strong\>Inicia sesión o regístrate\</strong\> para finalizar tu compra. Te abriremos el acceso en un momento.', 'lm-ecpg'),  
            'notice'  
        );

        // Cookie accesible por JS para re-abrir el popup al volver  
        setcookie(  
            self::COOKIE\_REOPEN,  
            '1',  
            time() \+ self::COOKIE\_TTL,  
            COOKIEPATH ?: '/',  
            parse\_url(home\_url(), PHP\_URL\_HOST),  
            is\_ssl(),  
            false // NO httpOnly: el JS debe leerla  
        );

        // Redirigir fuera de /checkout (evitar bucles)  
        $redirect \= function\_exists('wc\_get\_cart\_url') ? wc\_get\_cart\_url() : home\_url('/');  
        if ( \! empty($\_SERVER\['HTTP\_REFERER'\]) ) {  
            $ref \= esc\_url\_raw(wp\_unslash($\_SERVER\['HTTP\_REFERER'\]));  
            if (strpos($ref, '/checkout') \=== false) $redirect \= $ref;  
        }

        wp\_safe\_redirect($redirect);  
        exit;  
    }

    /\*\* Contenedor oculto para notices si el theme no los imprime \*/  
    public function footer\_anchor() {  
        if ( function\_exists('wc\_print\_notices') ) {  
            echo '\<div class="lm-ecpg-hidden"\>';  
            wc\_print\_notices();  
            echo '\</div\>';  
        }  
    }  
}

add\_action('plugins\_loaded', function(){  
    if ( class\_exists('WooCommerce') ) new LM\_Elementor\_Checkout\_Popup\_Gate();  
}, 20);

/\*\*  
 \* Redirección de invitados que ingresan directo al Checkout  
 \* \- Define una URL destino con LM\_ECPG\_REDIRECT\_URL o via filtro 'lm\_ecpg\_redirect\_url'  
 \* \- Evita bucles y excluye endpoints como order-pay / order-received  
 \*/

if ( \! defined('LM\_ECPG\_REDIRECT\_URL') ) {  
    // 👇 Cambia esta URL por la que quieras (ej: página de login/registro o landing)  
    define('LM\_ECPG\_REDIRECT\_URL', home\_url('/login/'));  
}

add\_action('template\_redirect', function () {  
    if ( is\_user\_logged\_in() ) return;

    if ( function\_exists('is\_checkout') && is\_checkout() ) {

        // No redirigir en endpoints de pago ya en curso o confirmación  
        $skip\_endpoints \= \[ 'order-pay', 'order-received', 'add-payment-method' \];  
        foreach ( $skip\_endpoints as $ep ) {  
            if ( function\_exists('is\_wc\_endpoint\_url') && is\_wc\_endpoint\_url($ep) ) {  
                return;  
            }  
        }

        $target \= apply\_filters('lm\_ecpg\_redirect\_url', LM\_ECPG\_REDIRECT\_URL);  
        if ( empty($target) ) return;

        // Evitar loop si ya estás en la misma URL  
        $current \= ( is\_ssl() ? 'https://' : 'http://' ) . $\_SERVER\['HTTP\_HOST'\] . $\_SERVER\['REQUEST\_URI'\];  
        if ( trailingslashit($current) \=== trailingslashit($target) ) return;

        // (Opcional) Mensaje de aviso en WooCommerce  
        if ( function\_exists('wc\_add\_notice') ) {  
            wc\_add\_notice(  
                \_\_('Por favor inicia sesión o regístrate para finalizar tu compra.', 'lm-ecpg'),  
                'notice'  
            );  
        }

        wp\_safe\_redirect( esc\_url\_raw($target) );  
        exit;  
    }  
}, 1);

# 5 \- CUSTOM\_API\_V3.3

**5 \- CUSTOM\_API\_V3.3**

/\*\*  
 \* Plugin Name: Custom API for Woo (Luis)  
 \* Description: API REST personalizada para WooCommerce con seguridad reforzada, relaciones por SKU, featured toggle y JetEngine meta tipado.  
 \* Version:     1.1.0  
 \* Author:      ClickLab  
 \*/

if (\!defined('ABSPATH')) exit;

/\* \============================================================================  
 \* 0\) Utilidades de seguridad (CORS, Rate Limit, Auth+Permisos)  
 \* \==========================================================================\*/

// CORS (sólo para rutas de este plugin)  
add\_action('rest\_api\_init', function () {  
    add\_filter('rest\_pre\_serve\_request', function($served, $result, $request, $server){  
        $route \= $request-\>get\_route();  
        if (strpos($route, '/custom-api/v1/') \=== 0\) {  
            $origin  \= get\_option('home');  
            $allowed \= defined('CUSTOM\_API\_CORS\_ORIGIN') ? CUSTOM\_API\_CORS\_ORIGIN : $origin;  
            header('Access-Control-Allow-Origin: ' . esc\_url\_raw($allowed));  
            header('Access-Control-Allow-Headers: Content-Type, X-API-KEY');  
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');  
        }  
        return $served;  
    }, 10, 4);  
});

// Rate limit simple por key/IP  
function cmu\_rate\_limited($bucket='default', $limit=300, $window=60){  
    $ip    \= $\_SERVER\['REMOTE\_ADDR'\] ?? '0.0.0.0';  
    $key   \= isset($\_SERVER\['HTTP\_X\_API\_KEY'\]) ? substr(hash('sha256', $\_SERVER\['HTTP\_X\_API\_KEY'\]),0,12) : 'anon';  
    $k     \= "cmu\_rl\_{$bucket}\_{$key}\_{$ip}";  
    $c     \= (int) get\_transient($k);  
    if ($c \>= $limit) return true;  
    set\_transient($k, $c+1, $window);  
    return false;  
}

// Validación de URL de media  
function cmu\_validate\_media\_url($url){  
    if (\!is\_string($url)) return false;  
    $url \= trim($url);  
    if ($url \=== '') return true;  
    $ok \= filter\_var($url, FILTER\_VALIDATE\_URL);  
    if (\!$ok) return false;  
    $scheme \= wp\_parse\_url($url, PHP\_URL\_SCHEME);  
    return in\_array($scheme, \['https','http'\], true);  
}

// AUTH reforzada \+ capability opcional  
function cmu\_auth(WP\_REST\_Request $request){  
    if (\!defined('CUSTOM\_API\_KEY')) return false;  
    $key \= $request-\>get\_header('X-API-KEY');  
    if (\!$key || \!hash\_equals(CUSTOM\_API\_KEY, $key)) return false;  
    $bucket \= substr(md5($request-\>get\_route()),0,8);  
    if (cmu\_rate\_limited($bucket, 300, 60)) {  
        return new WP\_Error('rate\_limited', 'Too Many Requests', \['status'=\>429\]);  
    }  
    return true;  
}  
function cmu\_permission(WP\_REST\_Request $request){  
    $auth \= cmu\_auth($request);  
    if ($auth \!== true) return $auth;  
    // Defensa adicional si hay sesión (no requerido para API key)  
    if (is\_user\_logged\_in() && \!current\_user\_can('manage\_woocommerce')) {  
        return new WP\_Error('forbidden', 'Insufficient permissions', \['status'=\>403\]);  
    }  
    return true;  
}

/\* \============================================================================  
 \* 1\) Helpers de imágenes con límites (HEAD, tamaño, mime) \+ cache por URL  
 \* \==========================================================================\*/  
function cmu\_set\_image\_from\_url\_cached($url){  
    if (\!$url || \!cmu\_validate\_media\_url($url)) return 0;

    // ¿Adjunto ya creado desde esta URL?  
    $existing \= get\_posts(\[  
        'post\_type'   \=\> 'attachment',  
        'meta\_key'    \=\> '\_source\_url',  
        'meta\_value'  \=\> $url,  
        'numberposts' \=\> 1,  
        'fields'      \=\> 'ids',  
    \]);  
    if (\!empty($existing)) return (int)$existing\[0\];

    // HEAD (10s) para validar tamaño y tipo si el server lo permite  
    add\_filter('http\_request\_timeout', fn() \=\> 10);  
    $head \= wp\_remote\_head($url, \['timeout'=\>10,'redirection'=\>2,'sslverify'=\>true\]);  
    if (\!is\_wp\_error($head)) {  
        $len  \= (int) wp\_remote\_retrieve\_header($head, 'content-length');  
        $type \= wp\_remote\_retrieve\_header($head, 'content-type');  
        if ($len && $len \> 5\*1024\*1024) return 0; // \>5MB  
        if ($type && strpos($type, 'image/') \!== 0\) return 0;  
    }

    require\_once ABSPATH.'wp-admin/includes/image.php';  
    require\_once ABSPATH.'wp-admin/includes/file.php';  
    require\_once ABSPATH.'wp-admin/includes/media.php';

    $tmp \= download\_url($url, 10);  
    if (is\_wp\_error($tmp)) return 0;

    $mime \= function\_exists('mime\_content\_type') ? mime\_content\_type($tmp) : 'image/jpeg';  
    if (strpos((string)$mime, 'image/') \!== 0\) { @unlink($tmp); return 0; }

    $file \= \[  
        'name'     \=\> wp\_basename(parse\_url($url, PHP\_URL\_PATH)),  
        'type'     \=\> $mime,  
        'tmp\_name' \=\> $tmp,  
        'error'    \=\> 0,  
        'size'     \=\> filesize($tmp),  
    \];

    $id \= media\_handle\_sideload($file, 0);  
    if (is\_wp\_error($id)) { @unlink($tmp); return 0; }

    update\_post\_meta($id, '\_source\_url', esc\_url\_raw($url));  
    return (int)$id;  
}

/\* \============================================================================  
 \* 2\) Helpers de términos (Woo/Jet) \+ resolver IDs desde SKUs  
 \* \==========================================================================\*/  
function cmu\_valid\_term\_ids($names, $taxonomy){  
    if (\!is\_array($names)) return \[\];  
    return array\_filter(array\_map(function($name) use ($taxonomy){  
        $name \= trim(wp\_strip\_all\_tags($name));  
        if ($name \=== '') return null;  
        $slug \= sanitize\_title($name);  
        $term \= get\_term\_by('slug', $slug, $taxonomy);  
        if ($term) return (int)$term-\>term\_id;  
        $created \= wp\_insert\_term($name, $taxonomy);  
        return is\_wp\_error($created) ? null : (int)$created\['term\_id'\];  
    }, $names));  
}

function cmu\_resolve\_product\_ids($list, $prefer \= 'sku'){  
    if (\!is\_array($list)) return \[\];  
    $out \= \[\];  
    foreach ($list as $val) {  
        if (is\_int($val)) {  
            $pid \= (int)$val;  
            if ($pid \> 0 && wc\_get\_product($pid)) { $out\[\] \= $pid; }  
            continue;  
        }  
        $s \= trim((string)$val);  
        if ($s \=== '') continue;

        $pid \= 0;  
        if ($prefer \=== 'sku') {  
            $pid \= wc\_get\_product\_id\_by\_sku($s);  
            if (\!$pid && ctype\_digit($s)) {  
                $as\_id \= (int)$s;  
                if ($as\_id \> 0 && wc\_get\_product($as\_id)) $pid \= $as\_id;  
            }  
        } else {  
            if (ctype\_digit($s)) {  
                $as\_id \= (int)$s;  
                if ($as\_id \> 0 && wc\_get\_product($as\_id)) $pid \= $as\_id;  
                if (\!$pid) $pid \= wc\_get\_product\_id\_by\_sku($s);  
            } else {  
                $pid \= wc\_get\_product\_id\_by\_sku($s);  
            }  
        }  
        if ($pid) $out\[\] \= (int)$pid;  
    }  
    return array\_values(array\_unique($out));  
}

/\* \============================================================================  
 \* 3\) JetEngine metacampos: whitelist \+ tipado  
 \* \==========================================================================\*/  
function cmu\_jet\_whitelist(){  
  return \[  
    // Ejemplos: ajusta a tus metacampos reales  
    'jet\_rating'        \=\> 'number',  
    'jet\_is\_new'        \=\> 'bool',  
    'jet\_supplier\_code' \=\> 'text',  
    'jet\_specs'         \=\> 'array', // se guarda como JSON  
  \];  
}  
function cmu\_apply\_meta\_whitelist($post\_id, $meta\_arr){  
  if (\!is\_array($meta\_arr)) return;  
  $map \= cmu\_jet\_whitelist();  
  foreach ($meta\_arr as $k=\>$v){  
    if (\!isset($map\[$k\])) continue;  
    switch ($map\[$k\]){  
      case 'number': $v \= is\_numeric($v) ? 0 \+ $v : null; break;  
      case 'bool':   $v \= (bool)$v ? 1 : 0; break;  
      case 'array':  $v \= wp\_json\_encode($v, JSON\_UNESCAPED\_UNICODE); break;  
      default:       $v \= is\_scalar($v) ? wp\_unslash($v) : wp\_json\_encode($v);  
    }  
    if ($v \=== null) { delete\_post\_meta($post\_id, $k); }  
    else { update\_post\_meta($post\_id, $k, $v); }  
  }  
}

/\* \============================================================================  
 \* 4\) CORE: Upsert de producto simple por SKU (incluye featured, meta, jet\_meta,  
 \*          upsell/crosssell por SKU, related\_skus manuales, imágenes seguras)  
 \* \==========================================================================\*/  
function cmu\_upsert\_simple\_product(array $data){  
    if (\!class\_exists('WC\_Product\_Simple')) {  
        return new WP\_Error('woocommerce\_missing','WooCommerce requerido', \['status'=\>500\]);  
    }

    $existing\_id \= 0;  
    if (\!empty($data\['sku'\])) $existing\_id \= wc\_get\_product\_id\_by\_sku($data\['sku'\]);

    $product \= $existing\_id ? wc\_get\_product($existing\_id) : new WC\_Product\_Simple();  
    if (\!$product) $product \= new WC\_Product\_Simple();

    // Básicos  
    if (\!$existing\_id && \!empty($data\['sku'\])) $product-\>set\_sku(sanitize\_text\_field($data\['sku'\]));  
    if (\!empty($data\['title'\])) $product-\>set\_name($data\['title'\]);  
    if (array\_key\_exists('description',$data))       $product-\>set\_description($data\['description'\] ?? '');  
    if (array\_key\_exists('short\_description',$data)) $product-\>set\_short\_description($data\['short\_description'\] ?? '');

    // Precios  
    if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
        $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
    }  
    if (array\_key\_exists('sale\_price', $data)) {  
        $sp \= $data\['sale\_price'\];  
        $product-\>set\_sale\_price($sp \=== '' || $sp \=== null ? '' : (string)$sp);  
    }

    // Estado de publicación  
    if (\!empty($data\['status'\])) $product-\>set\_status($data\['status'\]);  
    if (\!$existing\_id && empty($data\['status'\])) $product-\>set\_status('publish');

    // \============ INVENTARIO (DEFINIDO Y GUARDADO ANTES DEL SAVE) \============  
    $has\_qty \= array\_key\_exists('stock\_quantity', $data) && $data\['stock\_quantity'\] \!== '' && $data\['stock\_quantity'\] \!== null;  
    $qty     \= $has\_qty ? max(0, (int)$data\['stock\_quantity'\]) : null;  
    $manage  \= array\_key\_exists('manage\_stock', $data) ? (bool)$data\['manage\_stock'\] : null;

    if ($manage \=== true) {  
        $product-\>set\_manage\_stock(true);

        if ($has\_qty) {  
            $product-\>set\_stock\_quantity($qty);  
            if (\!array\_key\_exists('stock\_status', $data)) {  
                $product-\>set\_stock\_status($qty \> 0 ? 'instock' : 'outofstock');  
            }  
        }  
        if (\!empty($data\['stock\_status'\])) {  
            $product-\>set\_stock\_status($data\['stock\_status'\]); // instock|outofstock|onbackorder  
        }  
        if (\!empty($data\['backorders'\])) {  
            $back \= in\_array($data\['backorders'\], \['yes','notify','no'\], true) ? $data\['backorders'\] : 'no';  
            $product-\>set\_backorders($back);  
        }

    } elseif ($manage \=== false) {  
        $product-\>set\_manage\_stock(false);  
        if (\!empty($data\['stock\_status'\])) {  
            $product-\>set\_stock\_status($data\['stock\_status'\]);  
        } elseif ($has\_qty) {  
            // Si mandan cantidad pero NO manejan stock, ignoramos qty y marcamos en stock  
            $product-\>set\_stock\_status('instock');  
        }

    } else {  
        // manage\_stock no enviado: comportamiento por defecto  
        if ($has\_qty) {  
            $product-\>set\_manage\_stock(true);  
            $product-\>set\_stock\_quantity($qty);  
            if (\!array\_key\_exists('stock\_status', $data)) {  
                $product-\>set\_stock\_status($qty \> 0 ? 'instock' : 'outofstock');  
            }  
        } elseif (\!empty($data\['stock\_status'\])) {  
            $product-\>set\_manage\_stock(false);  
            $product-\>set\_stock\_status($data\['stock\_status'\]);  
        }  
    }  
    // \========================================================================

    // Guardamos aquí tras inventario y básicos/precios  
    $product-\>save();  
    $id \= (int)$product-\>get\_id();

    // Imagen destacada  
    if (\!empty($data\['image'\]) && cmu\_validate\_media\_url($data\['image'\])) {  
        $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
        if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
    }

    // Galería  
    if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
        $gallery\_ids \= \[\];  
        foreach ($data\['gallery'\] as $u) {  
            if (\!cmu\_validate\_media\_url($u)) continue;  
            $mid \= cmu\_set\_image\_from\_url\_cached($u);  
            if ($mid) $gallery\_ids\[\] \= $mid;  
        }  
        if ($gallery\_ids) {  
            update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
        } else {  
            delete\_post\_meta($id, '\_product\_image\_gallery');  
        }  
    }

    // Destacado (featured)  
    if (array\_key\_exists('featured', $data)) {  
        $product-\>set\_featured( (bool) $data\['featured'\] );  
        $product-\>save();  
    }

    // Meta libres  
    if (\!empty($data\['meta'\]) && is\_array($data\['meta'\])) {  
        foreach ($data\['meta'\] as $k \=\> $v) {  
            update\_post\_meta($id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    }  
    // Jet meta tipado (whitelist)  
    if (\!empty($data\['jet\_meta'\]) && is\_array($data\['jet\_meta'\])) {  
        cmu\_apply\_meta\_whitelist($id, $data\['jet\_meta'\]);  
    }

    // Taxonomías Woo  
    if (\!empty($data\['categories'\])) {  
        $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
        if ($cat\_ids) wp\_set\_object\_terms($id, $cat\_ids, 'product\_cat', false);  
    }  
    if (\!empty($data\['tags'\])) {  
        $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
        if ($tag\_ids) wp\_set\_object\_terms($id, $tag\_ids, 'product\_tag', false);  
    }

    // Taxonomías Jet/custom  
    if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
        foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
            if (\!taxonomy\_exists($tax)) continue;  
            $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
            if ($term\_ids) wp\_set\_object\_terms($id, $term\_ids, $tax, false);  
        }  
    }

    // Up-sells / Cross-sells  
    $touch\_rel \= false;  
    if (array\_key\_exists('upsell\_skus', $data)) {  
        $product-\>set\_upsell\_ids( cmu\_resolve\_product\_ids((array)$data\['upsell\_skus'\]) );  
        $touch\_rel \= true;  
    }  
    if (array\_key\_exists('crosssell\_skus', $data)) {  
        $product-\>set\_cross\_sell\_ids( cmu\_resolve\_product\_ids((array)$data\['crosssell\_skus'\]) );  
        $touch\_rel \= true;  
    }  
    if ($touch\_rel) $product-\>save();

    // Relacionados manuales  
    if (array\_key\_exists('related\_skus', $data)) {  
        $rel\_ids \= cmu\_resolve\_product\_ids((array)$data\['related\_skus'\]);  
        update\_post\_meta($id, '\_manual\_related\_ids', array\_map('intval', $rel\_ids));  
    }

    return \[  
        'product\_id' \=\> $id,  
        'sku'        \=\> $product-\>get\_sku(),  
        'mode'       \=\> $existing\_id ? 'updated' : 'created'  
    \];  
}

/\* \============================================================================  
 \* 5\) Payload y utilidades por SKU/ID  
 \* \==========================================================================\*/  
function cmu\_product\_payload($id){  
    $product \= wc\_get\_product($id);  
    if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

    $image \= wp\_get\_attachment\_url(get\_post\_thumbnail\_id($id));  
    $gallery\_ids  \= explode(',', (string)get\_post\_meta($id,'\_product\_image\_gallery',true));  
    $gallery\_urls \= array\_values(array\_filter(array\_map('wp\_get\_attachment\_url', array\_filter($gallery\_ids))));

    $get\_terms\_names \= function ($pid, $taxonomy) {  
        $terms \= wp\_get\_post\_terms($pid, $taxonomy);  
        return array\_map(fn($t)=\>$t-\>name, $terms);  
    };

    $jet \= \[\];  
    foreach (get\_object\_taxonomies('product') as $tax) {  
        if (in\_array($tax, \['product\_cat','product\_tag'\])) continue;  
        $names \= $get\_terms\_names($id, $tax);  
        if ($names) $jet\[$tax\] \= $names;  
    }

    $manual\_related \= get\_post\_meta($id, '\_manual\_related\_ids', true);  
    $manual\_related \= is\_array($manual\_related) ? array\_map('intval', $manual\_related) : \[\];

    return \[  
        'id'                 \=\> (int)$id,  
        'title'              \=\> $product-\>get\_name(),  
        'description'        \=\> $product-\>get\_description(),  
        'short\_description'  \=\> $product-\>get\_short\_description(),  
        'price'              \=\> $product-\>get\_price(),  
        'sku'                \=\> $product-\>get\_sku(),  
        'stock\_quantity'     \=\> $product-\>get\_stock\_quantity(),  
        'stock\_status'       \=\> $product-\>get\_stock\_status(),  
        'status'             \=\> get\_post\_status($id),  
        'featured'           \=\> (bool) $product-\>get\_featured(),  
        'image'              \=\> $image,  
        'gallery'            \=\> $gallery\_urls,  
        'categories'         \=\> $get\_terms\_names($id, 'product\_cat'),  
        'tags'               \=\> $get\_terms\_names($id, 'product\_tag'),  
        'jet\_taxonomies'     \=\> $jet,  
        'upsell\_ids'         \=\> array\_map('intval', (array) $product-\>get\_upsell\_ids()),  
        'crosssell\_ids'      \=\> array\_map('intval', (array) $product-\>get\_cross\_sell\_ids()),  
        'upsell\_skus'        \=\> array\_values(array\_filter(array\_map(function($pid){ $p=wc\_get\_product($pid); return $p?$p-\>get\_sku():null; }, (array)$product-\>get\_upsell\_ids()))),  
        'crosssell\_skus'     \=\> array\_values(array\_filter(array\_map(function($pid){ $p=wc\_get\_product($pid); return $p?$p-\>get\_sku():null; }, (array)$product-\>get\_cross\_sell\_ids()))),  
        'related\_ids\_manual' \=\> $manual\_related  
    \];  
}

function cmu\_get\_id\_by\_sku\_or\_404($sku){  
    $sku \= is\_string($sku) ? trim($sku) : '';  
    if ($sku \=== '') return new WP\_Error('invalid','SKU vacío',\['status'=\>400\]);  
    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
    if (\!$pid) return new WP\_Error('not\_found','Product with that SKU not found',\['status'=\>404\]);  
    return (int)$pid;  
}

/\* \============================================================================  
 \* 6\) Hook: mostrar relacionados manuales en frontend (sin romper nativo)  
 \* \==========================================================================\*/  
add\_filter('woocommerce\_related\_products', function($related, $product\_id){  
    $manual \= get\_post\_meta($product\_id, '\_manual\_related\_ids', true);  
    if (is\_array($manual) && \!empty($manual)) {  
        $manual \= array\_values(array\_filter(array\_map('intval', $manual)));  
        $wanted \= (int) apply\_filters('woocommerce\_related\_products\_total', 4);  
        if (count($manual) \>= $wanted) return array\_slice($manual, 0, $wanted);  
        $merge \= array\_values(array\_unique(array\_merge($manual, $related)));  
        return array\_slice($merge, 0, $wanted);  
    }  
    return $related;  
}, 10, 2);

/\* \============================================================================  
 \* 7\) ENDPOINTS  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    /\* \---------- POST /product (upsert) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'title' \=\> \['type'=\>'string','sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'sku'   \=\> \['type'=\>'string','required'=\>true,'sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'regular\_price' \=\> \['type'=\>'string','validate\_callback'=\>fn($v)=\>is\_numeric($v)\],  
            'sale\_price'    \=\> \['type'=\>'string'\],  
            'price'         \=\> \['type'=\>'string'\],  
            'description'   \=\> \['type'=\>'string'\],  
            'short\_description'=\>\['type'=\>'string'\],  
            'categories' \=\> \['type'=\>'array'\],  
            'tags'       \=\> \['type'=\>'array'\],  
            'image'      \=\> \['type'=\>'string','validate\_callback'=\>'cmu\_validate\_media\_url'\],  
            'gallery'    \=\> \['type'=\>'array'\],  
            'upsell\_skus'=\> \['type'=\>'array'\],  
            'crosssell\_skus'=\> \['type'=\>'array'\],  
            'related\_skus'=\>\['type'=\>'array'\],  
            'featured'   \=\> \['type'=\>'boolean'\],  
            'meta'       \=\> \['type'=\>'object'\],  
            'jet\_meta'   \=\> \['type'=\>'object'\],  
            'stock\_quantity' \=\> \['type'=\>'integer'\],  
            'stock\_status'   \=\> \['type'=\>'string'\],  
            'status'         \=\> \['type'=\>'string'\],  
            'jet\_taxonomies' \=\> \['type'=\>'object'\],  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $data \= $request-\>get\_json\_params() ?: \[\];  
            $r \= cmu\_upsert\_simple\_product($data);  
            if (is\_wp\_error($r)) return $r;  
            return \['success'=\>true\] \+ $r;  
        }  
    \]);

    /\* \---------- GET /product/{id} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            return cmu\_product\_payload($id);  
        }  
    \]);

    /\* \---------- DELETE /product/{id} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    /\* \---------- POST /products/batch (create|update auto) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params();  
            $items   \= $payload\['products'\] ?? \[\];  
            $mode    \= $payload\['mode'\] ?? 'auto'; // auto|create\_only|update\_only

            if (\!is\_array($items) || \!$items) {  
                return new WP\_Error('invalid\_data','Envía products como array',\['status'=\>400\]);  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($items as $i=\>$data) {  
                try {  
                    $sku \= $data\['sku'\] ?? null;  
                    $exists\_id \= $sku ? wc\_get\_product\_id\_by\_sku($sku) : 0;

                    if ($mode \=== 'create\_only' && $exists\_id) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU ya existe'\];  
                        continue;  
                    }  
                    if ($mode \=== 'update\_only' && (\!$sku || \!$exists\_id)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU no existe para actualizar'\];  
                        continue;  
                    }

                    $r \= cmu\_upsert\_simple\_product((array)$data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $results\[\] \= \['index'=\>$i,'success'=\>true\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    /\* \---------- POST /products/batch/delete \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params();  
            $ids  \= array\_map('intval', $p\['ids'\]  ?? \[\]);  
            $skus \= $p\['skus'\] ?? \[\];

            if (\!$ids && \!$skus) return new WP\_Error('invalid','Envía ids o skus',\['status'=\>400\]);

            $targets \= $ids;  
            foreach ($skus as $s) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($s));  
                if ($pid) $targets\[\] \= (int)$pid;  
            }  
            $targets \= array\_values(array\_unique(array\_filter($targets)));

            $out \= \[\];  
            foreach ($targets as $id) {  
                $ok \= wp\_delete\_post($id, true);  
                $out\[\] \= \['id'=\>$id,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$out\];  
        }  
    \]);

    /\* \---------- PUT /products/sku/batch (update-only) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/sku/batch', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params() ?: \[\];  
            $updates \= $payload\['updates'\] ?? $payload\['products'\] ?? \[\];  
            if (\!is\_array($updates) || \!$updates) {  
                return new WP\_Error('invalid\_data','Envía "updates" (array de objetos con "sku").',\['status'=\>400\]);  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($updates as $i \=\> $data) {  
                try {  
                    $data \= (array)$data;  
                    $sku  \= isset($data\['sku'\]) ? trim((string)$data\['sku'\]) : '';  
                    if ($sku \=== '') throw new Exception("Fila $i: falta sku");

                    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
                    if (\!$pid) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>'SKU no encontrado (solo update)'\];  
                        continue;  
                    }

                    $data\['sku'\] \= $sku; // fuerza update branch  
                    $r \= cmu\_upsert\_simple\_product($data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $r\['mode'\] \= 'updated';  
                        $results\[\] \= \['index'=\>$i,'success'=\>true,'sku'=\>$sku\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    /\* \---------- GET /products (filtros/paginación, featured opcional) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'date'); // date|title|ID  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');           // ASC|DESC  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $status   \= sanitize\_text\_field($request-\>get\_param('status') ?: 'any');  // any|publish|draft|private  
            $category \= sanitize\_title($request-\>get\_param('category') ?: '');  
            $tag      \= sanitize\_title($request-\>get\_param('tag') ?: '');  
            $skus\_qs  \= trim((string)($request-\>get\_param('skus') ?: ''));  
            $fields   \= strtolower($request-\>get\_param('fields') ?: 'basic');         // basic|full  
            $featured \= $request-\>get\_param('featured'); // 1/0 o true/false

            $args \= \[  
                'post\_type'      \=\> 'product',  
                'post\_status'    \=\> ($status \=== 'any') ? \['publish','draft','private'\] : $status,  
                'orderby'        \=\> in\_array($orderby, \['date','title','ID'\], true) ? $orderby : 'date',  
                'order'          \=\> in\_array($order, \['ASC','DESC'\], true) ? $order : 'DESC',  
                'posts\_per\_page' \=\> $per\_page,  
                'paged'          \=\> $page,  
                's'              \=\> $search ?: '',  
            \];

            $tax\_query \= \[\];  
            if ($category) {  
                $tax\_query\[\] \= \['taxonomy'=\>'product\_cat','field'=\>'slug','terms'=\>\[$category\]\];  
            }  
            if ($tag) {  
                $tax\_query\[\] \= \['taxonomy'=\>'product\_tag','field'=\>'slug','terms'=\>\[$tag\]\];  
            }  
            if ($tax\_query) $args\['tax\_query'\] \= $tax\_query;

            $meta\_query \= \[\];  
            $sku\_list \= \[\];  
            if ($skus\_qs \!== '') {  
                $sku\_list \= array\_values(array\_filter(array\_map('trim', explode(',', $skus\_qs))));  
                if ($sku\_list) {  
                    $meta\_query\[\] \= \['key'=\>'\_sku','value'=\>$sku\_list,'compare'=\>'IN'\];  
                }  
            }  
            if ($featured \!== null) {  
                $want \= in\_array($featured, \['1',1,true,'true'\], true) ? 'yes' : 'no';  
                $meta\_query\[\] \= \['key'=\>'\_featured','value'=\>$want,'compare'=\>'='\];  
            }  
            if ($meta\_query) $args\['meta\_query'\] \= $meta\_query;

            $q \= new WP\_Query($args);  
            $posts \= $q-\>posts ?: \[\];

            $rows \= \[\];  
            foreach ($posts as $p) {  
                $prod \= wc\_get\_product($p-\>ID);  
                if (\!$prod) continue;

                if ($fields \=== 'full') {  
                    $rows\[\] \= cmu\_product\_payload($p-\>ID);  
                } else {  
                    $rows\[\] \= \[  
                        'id'             \=\> (int)$p-\>ID,  
                        'sku'            \=\> $prod-\>get\_sku(),  
                        'title'          \=\> $prod-\>get\_name(),  
                        'price'          \=\> $prod-\>get\_price(),  
                        'stock\_quantity' \=\> $prod-\>get\_stock\_quantity(),  
                        'stock\_status'   \=\> $prod-\>get\_stock\_status(),  
                        'status'         \=\> get\_post\_status($p-\>ID),  
                        'featured'       \=\> (bool) $prod-\>get\_featured(),  
                        'date'           \=\> get\_post\_time('c', true, $p-\>ID),  
                    \];  
                }  
            }

            return \[  
                'success'   \=\> true,  
                'page'      \=\> $page,  
                'per\_page'  \=\> $per\_page,  
                'total'     \=\> (int)$q-\>found\_posts,  
                'pages'     \=\> (int)$q-\>max\_num\_pages,  
                'rows'      \=\> array\_values($rows)  
            \];  
        }  
    \]);

    /\* \---------- GET /product/sku/{sku} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            return cmu\_product\_payload($pid);  
        }  
    \]);

    /\* \---------- PUT /product/sku/{sku} (update) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'title' \=\> \['type'=\>'string','sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'regular\_price' \=\> \['type'=\>'string'\],  
            'sale\_price'    \=\> \['type'=\>'string'\],  
            'price'         \=\> \['type'=\>'string'\],  
            'description'   \=\> \['type'=\>'string'\],  
            'short\_description'=\>\['type'=\>'string'\],  
            'categories' \=\> \['type'=\>'array'\],  
            'tags'       \=\> \['type'=\>'array'\],  
            'image'      \=\> \['type'=\>'string','validate\_callback'=\>'cmu\_validate\_media\_url'\],  
            'gallery'    \=\> \['type'=\>'array'\],  
            'upsell\_skus'=\> \['type'=\>'array'\],  
            'crosssell\_skus'=\> \['type'=\>'array'\],  
            'related\_skus'=\>\['type'=\>'array'\],  
            'featured'   \=\> \['type'=\>'boolean'\],  
            'meta'       \=\> \['type'=\>'object'\],  
            'jet\_meta'   \=\> \['type'=\>'object'\],  
            'stock\_quantity' \=\> \['type'=\>'integer'\],  
            'stock\_status'   \=\> \['type'=\>'string'\],  
            'status'         \=\> \['type'=\>'string'\],  
            'jet\_taxonomies' \=\> \['type'=\>'object'\],  
            'sku'            \=\> \['type'=\>'string'\], // opcional para renombrar  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $product \= wc\_get\_product($pid);  
            if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

            $data \= $request-\>get\_json\_params() ?: \[\];

            if (\!empty($data\['title'\]))                     $product-\>set\_name($data\['title'\]);  
            if (array\_key\_exists('description',$data))      $product-\>set\_description($data\['description'\] ?? '');  
            if (array\_key\_exists('short\_description',$data))$product-\>set\_short\_description($data\['short\_description'\] ?? '');

            if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
                $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
            }  
            if (array\_key\_exists('sale\_price', $data)) {  
                $sp \= $data\['sale\_price'\];  
                $product-\>set\_sale\_price($sp \=== '' || $sp \=== null ? '' : (string)$sp);  
            }

            if (isset($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
            if (\!empty($data\['stock\_status'\]))  $product-\>set\_stock\_status($data\['stock\_status'\]);  
            if (\!empty($data\['status'\]))        $product-\>set\_status($data\['status'\]);

            if (\!empty($data\['sku'\]))           $product-\>set\_sku(sanitize\_text\_field($data\['sku'\])); // permitir cambio

            $product-\>save();

            if (array\_key\_exists('featured', $data)) {  
                $product-\>set\_featured( (bool) $data\['featured'\] );  
                $product-\>save();  
            }

            if (\!empty($data\['meta'\]) && is\_array($data\['meta'\])) {  
                foreach ($data\['meta'\] as $k \=\> $v) {  
                    update\_post\_meta($product-\>get\_id(), sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
                }  
            }  
            if (\!empty($data\['jet\_meta'\]) && is\_array($data\['jet\_meta'\])) {  
                cmu\_apply\_meta\_whitelist($product-\>get\_id(), $data\['jet\_meta'\]);  
            }

            if (\!empty($data\['image'\]) && cmu\_validate\_media\_url($data\['image'\])) {  
                $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
                if ($img\_id) set\_post\_thumbnail($pid, $img\_id);  
            }

            if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
                $gallery\_ids \= \[\];  
                foreach ($data\['gallery'\] as $u) {  
                    if (\!cmu\_validate\_media\_url($u)) continue;  
                    $mid \= cmu\_set\_image\_from\_url\_cached($u);  
                    if ($mid) $gallery\_ids\[\] \= $mid;  
                }  
                if ($gallery\_ids) update\_post\_meta($pid, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
                else delete\_post\_meta($pid, '\_product\_image\_gallery');  
            }

            if (\!empty($data\['categories'\])) {  
                $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
                if ($cat\_ids) wp\_set\_object\_terms($pid, $cat\_ids, 'product\_cat', false);  
            }  
            if (\!empty($data\['tags'\])) {  
                $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
                if ($tag\_ids) wp\_set\_object\_terms($pid, $tag\_ids, 'product\_tag', false);  
            }

            if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
                foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
                    if (\!taxonomy\_exists($tax)) continue;  
                    $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
                    if ($term\_ids) wp\_set\_object\_terms($pid, $term\_ids, $tax, false);  
                }  
            }

            $touch\_rel \= false;  
            if ($request-\>has\_param('upsell\_skus') || array\_key\_exists('upsell\_skus', $data)) {  
                $product-\>set\_upsell\_ids(cmu\_resolve\_product\_ids((array)($data\['upsell\_skus'\] ?? \[\])));  
                $touch\_rel \= true;  
            }  
            if ($request-\>has\_param('crosssell\_skus') || array\_key\_exists('crosssell\_skus', $data)) {  
                $product-\>set\_cross\_sell\_ids(cmu\_resolve\_product\_ids((array)($data\['crosssell\_skus'\] ?? \[\])));  
                $touch\_rel \= true;  
            }  
            if ($touch\_rel) $product-\>save();

            if (array\_key\_exists('related\_skus', $data)) {  
                $rel\_ids \= cmu\_resolve\_product\_ids((array)$data\['related\_skus'\]);  
                update\_post\_meta($pid, '\_manual\_related\_ids', array\_map('intval', $rel\_ids));  
            }

            return \['success'=\>true,'product\_id'=\>$product-\>get\_id(),'mode'=\>'updated'\];  
        }  
    \]);

    /\* \---------- DELETE /product/sku/{sku} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $ok \= wp\_delete\_post($pid, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_sku'=\>$request\['sku'\],'deleted\_id'=\>$pid\];  
        }  
    \]);

    /\* \---------- PATCH /product/sku/{sku}/featured \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)/featured', \[  
        'methods'  \=\> 'PATCH',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'featured' \=\> \['type'=\>'boolean','required'=\>true\],  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $p \= wc\_get\_product($pid);  
            $p-\>set\_featured((bool)$request-\>get\_param('featured'));  
            $p-\>save();  
            return \['success'=\>true,'product\_id'=\>$pid,'featured'=\>$p-\>get\_featured()\];  
        }  
    \]);  
	  
    /\* \---------- POST /product/create-or-update (BATCH Upsert por SKU) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/create-or-update', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'products' \=\> \[  
                'type'        \=\> 'array',  
                'required'    \=\> true,  
                'description' \=\> 'Lista de productos para crear o actualizar.',  
                'items'       \=\> \['type' \=\> 'object'\],  
				'manage\_stock'   \=\> \['type'=\>'boolean'\],   // \<--- NUEVO  
				'backorders'     \=\> \['type'=\>'string'\],    // yes|no|notify (opcional)  
            \],  
        \],  
        'callback' \=\> function (WP\_REST\_Request $request) {  
            $payload \= $request-\>get\_json\_params() ?: \[\];  
            $items   \= $payload\['products'\] ?? \[\];

            if (empty($items) || \!is\_array($items)) {  
                return new WP\_Error('no\_products','Debe enviar un array "products" con al menos un producto.',\['status'=\>400\]);  
            }

            $results \= \[\];  
            foreach ($items as $index \=\> $data) {  
                if (empty($data\['sku'\])) {  
                    $results\[\] \= \['index'=\>$index,'success'=\>false,'error'=\>'SKU requerido'\];  
                    continue;  
                }  
                $r \= cmu\_upsert\_simple\_product($data);  
                if (is\_wp\_error($r)) {  
                    $results\[\] \= \['index'=\>$index,'success'=\>false,'sku'=\>$data\['sku'\],'error'=\>$r-\>get\_error\_message()\];  
                } else {  
                    $results\[\] \= \[  
                        'index'=\>$index,'success'=\>true,  
                        'sku'=\>$r\['sku'\] ?? $data\['sku'\],  
                        'product\_id'=\>$r\['product\_id'\] ?? null,  
                        'mode'=\>$r\['mode'\] ?? 'unknown'  
                    \];  
                }  
            }

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        },  
    \]);  
});

/\* \============================================================================  
 \* 8\) CRUD Tablas Personalizadas (igual a tu versión, con sanitización básica)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    $cmu\_tables \= \[  
        'cliente-descuento-item' \=\> $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item',  
        'convenio'               \=\> $GLOBALS\['wpdb'\]-\>prefix . 'convenio',  
        'costo-tipo'             \=\> $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo',  
        'descuento-call'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call',  
        'laboratorio'            \=\> $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio',  
        'precio-distrib'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib',  
    \];

    $get\_primary \= function($table) {  
        $map \= \[  
            $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item' \=\> 'CLIENTE\_DESCUENTO\_ITEM\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'convenio'               \=\> 'CONVENIO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo'             \=\> 'COSTO\_TIPO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call'         \=\> 'DESCUENTO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio'            \=\> 'LABORATORIO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib'         \=\> 'PRECIO\_DISTRIB\_ID',  
        \];  
        return $map\[$table\] ?? 'id';  
    };

    $table\_columns \= function($table) {  
        global $wpdb;  
        $cols \= $wpdb-\>get\_results("DESCRIBE \`$table\`", ARRAY\_A);  
        return $cols ? array\_map(fn($r) \=\> $r\['Field'\], $cols) : \[\];  
    };

    $sanitize\_row \= function(array $row, array $allowed\_cols) {  
        $clean \= \[\];  
        foreach ($row as $k \=\> $v) {  
            if (in\_array($k, $allowed\_cols, true)) {  
                if (is\_string($v)) {  
                    $clean\[$k\] \= wp\_unslash(wp\_kses\_post(trim($v)));  
                } else {  
                    $clean\[$k\] \= $v;  
                }  
            }  
        }  
        return $clean;  
    };

    foreach ($cmu\_tables as $endpoint \=\> $table\_name) {

        // LISTAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary, $table\_columns) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
                $per\_page \= min(500, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
                $orderby  \= $request-\>get\_param('orderby') ?: $primary;  
                $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
                $search   \= $request-\>get\_param('search');  
                $filters  \= (array) ($request-\>get\_param('filters') ?: \[\]);

                if (\!in\_array($orderby, $cols, true)) $orderby \= $primary;  
                if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

                $where \= "WHERE 1=1";  
                $params \= \[\];  
                foreach ($filters as $col \=\> $val) {  
                    if (in\_array($col, $cols, true)) {  
                        $where .= " AND \`$col\` \= %s";  
                        $params\[\] \= (string)$val;  
                    }  
                }  
                if ($search) {  
                    $search\_like \= '%' . $wpdb-\>esc\_like($search) . '%';  
                    $parts \= \[\];  
                    foreach ($cols as $c) $parts\[\] \= "\`$c\` LIKE %s";  
                    $where .= " AND (" . implode(' OR ', $parts) . ")";  
                    foreach ($cols as $\_) $params\[\] \= $search\_like;  
                }

                $offset \= ($page \- 1\) \* $per\_page;

                $sql\_count \= "SELECT COUNT(\*) FROM \`$table\_name\` $where";  
                $total \= $params ? (int) $wpdb-\>get\_var($wpdb-\>prepare($sql\_count, $params)) : (int) $wpdb-\>get\_var($sql\_count);

                $sql \= "SELECT \* FROM \`$table\_name\` $where ORDER BY \`$orderby\` $order LIMIT %d OFFSET %d";  
                $params\_data \= $params;  
                $params\_data\[\] \= $per\_page;  
                $params\_data\[\] \= $offset;  
                $rows \= $params\_data ? $wpdb-\>get\_results($wpdb-\>prepare($sql, $params\_data), ARRAY\_A) : $wpdb-\>get\_results($sql, ARRAY\_A);

                return \[  
                    'success'   \=\> true,  
                    'page'      \=\> $page,  
                    'per\_page'  \=\> $per\_page,  
                    'total'     \=\> $total,  
                    'rows'      \=\> $rows,  
                    'primary'   \=\> $primary,  
                \];  
            }  
        \]);

        // OBTENER UNO  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $row \= $wpdb-\>get\_row($wpdb-\>prepare("SELECT \* FROM \`$table\_name\` WHERE \`$primary\` \= %d", $id), ARRAY\_A);  
                if (\!$row) return new WP\_Error('not\_found','Registro no encontrado',\['status'=\>404\]);  
                return \['success'=\>true,'row'=\>$row\];  
            }  
        \]);

        // CREAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                if (array\_key\_exists($primary, $row) && ($row\[$primary\] \=== '' || $row\[$primary\] \=== null)) {  
                    unset($row\[$primary\]);  
                }

                $ok \= $wpdb-\>insert($table\_name, $row);  
                if ($ok \=== false) return new WP\_Error('insert\_failed','No se pudo insertar',\['status'=\>500\]);

                return \['success'=\>true,'insert\_id'=\>$wpdb-\>insert\_id\];  
            }  
        \]);

        // ACTUALIZAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'PUT',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                unset($row\[$primary\]);

                if (\!$row) return new WP\_Error('invalid','No hay campos válidos para actualizar',\['status'=\>400\]);

                $ok \= $wpdb-\>update($table\_name, $row, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('update\_failed','No se pudo actualizar',\['status'=\>500\]);

                return \['success'=\>true,'updated\_id'=\>$id\];  
            }  
        \]);

        // ELIMINAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'DELETE',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
                return \['success'=\>true,'deleted\_id'=\>$id\];  
            }  
        \]);

        // MASIVO: create|update|upsert  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $payload \= $request-\>get\_json\_params() ?: \[\];  
                $rows    \= $payload\['rows'\] ?? \[\];  
                $mode    \= strtolower($payload\['mode'\] ?? 'upsert'); // create|update|upsert  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                if (\!is\_array($rows) || empty($rows)) {  
                    return new WP\_Error('invalid\_data','Envía rows como array',\['status'=\>400\]);  
                }  
                if (\!in\_array($mode, \['create','update','upsert'\], true)) {  
                    return new WP\_Error('invalid\_mode','mode debe ser create|update|upsert',\['status'=\>400\]);  
                }

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');

                try {  
                    foreach ($rows as $i \=\> $input) {  
                        $clean \= $sanitize\_row((array)$input, $cols);

                        if ($mode \=== 'create') {  
                            if (array\_key\_exists($primary, $clean) && ($clean\[$primary\] \=== '' || $clean\[$primary\] \=== null)) {  
                                unset($clean\[$primary\]);  
                            }  
                            $ok \= $wpdb-\>insert($table\_name, $clean);  
                            if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];

                        } elseif ($mode \=== 'update') {  
                            if (empty($clean\[$primary\])) throw new Exception("Fila $i: falta $primary");  
                            $pk \= $clean\[$primary\]; unset($clean\[$primary\]);  
                            if (\!$clean) throw new Exception("Fila $i: sin campos a actualizar");  
                            $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                            if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];

                        } else { // upsert  
                            $has\_pk \= \!empty($clean\[$primary\]);  
                            if ($has\_pk) {  
                                $pk \= $clean\[$primary\]; unset($clean\[$primary\]);  
                                $exists \= (int) $wpdb-\>get\_var($wpdb-\>prepare("SELECT COUNT(\*) FROM \`$table\_name\` WHERE \`$primary\`=%d", $pk));  
                                if ($exists) {  
                                    if (\!$clean) {  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'noop','id'=\>$pk\];  
                                    } else {  
                                        $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                                        if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];  
                                    }  
                                } else {  
                                    $clean\[$primary\] \= $pk;  
                                    $ok \= $wpdb-\>insert($table\_name, $clean);  
                                    if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                    $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                                }  
                            } else {  
                                $ok \= $wpdb-\>insert($table\_name, $clean);  
                                if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                            }  
                        }  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
            }  
        \]);

        // MASIVO: delete por ids  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch/delete', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $p   \= $request-\>get\_json\_params() ?: \[\];  
                $ids \= array\_map('intval', $p\['ids'\] ?? \[\]);  
                if (\!$ids) return new WP\_Error('invalid','Envía ids (array)',\['status'=\>400\]);

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');  
                try {  
                    foreach ($ids as $id) {  
                        $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> (int)$id\]);  
                        $results\[\] \= \['id'=\>$id,'deleted'=\> $ok \!== false && $ok \> 0\];  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_delete\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'results'=\>$results\];  
            }  
        \]);  
    }  
});

/\* \============================================================================  
 \* 9\) CRUD de Usuarios (igual a tu versión con pequeños ajustes de sanitización)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    // Helpers  
    $cmu\_find\_user \= function($match\_by, $value) {  
        if (\!$value) return false;  
        switch ($match\_by) {  
            case 'id':       return get\_userdata((int)$value);  
            case 'email':    return get\_user\_by('email', sanitize\_email($value));  
            case 'username': return get\_user\_by('login', sanitize\_user($value, true));  
            default:         return false;  
        }  
    };

    $cmu\_apply\_meta \= function($user\_id, $meta){  
        if (\!is\_array($meta)) return;  
        foreach ($meta as $k=\>$v) {  
            update\_user\_meta($user\_id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    };

    // \========== LISTAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $role     \= sanitize\_text\_field($request-\>get\_param('role') ?: '');  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'ID'); // ID|user\_login|user\_email|user\_registered  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
            if (\!in\_array($orderby, \['ID','user\_login','user\_email','user\_registered'\], true)) $orderby \= 'ID';  
            if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

            $args \= \[  
                'number'   \=\> $per\_page,  
                'paged'    \=\> $page,  
                'orderby'  \=\> $orderby,  
                'order'    \=\> $order,  
                'fields'   \=\> 'all\_with\_meta',  
            \];  
            if ($role)   $args\['role'\] \= $role;  
            if ($search) $args\['search'\] \= '\*' . esc\_attr($search) . '\*';

            $q \= new WP\_User\_Query($args);  
            $users \= array\_map(function($u){  
                return \[  
                    'id'         \=\> (int) $u-\>ID,  
                    'username'   \=\> $u-\>user\_login,  
                    'email'      \=\> $u-\>user\_email,  
                    'role'       \=\> $u-\>roles\[0\] ?? null,  
                    'registered' \=\> $u-\>user\_registered,  
                \];  
            }, $q-\>get\_results());

            return \[  
                'success'  \=\> true,  
                'page'     \=\> $page,  
                'per\_page' \=\> $per\_page,  
                'total'    \=\> (int) $q-\>get\_total(),  
                'rows'     \=\> $users  
            \];  
        }  
    \]);

    // \========== OBTENER UNO \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $user \= get\_userdata((int)$request\['id'\]);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);  
            return \[  
                'success'    \=\> true,  
                'id'         \=\> (int) $user-\>ID,  
                'username'   \=\> $user-\>user\_login,  
                'email'      \=\> $user-\>user\_email,  
                'role'       \=\> $user-\>roles\[0\] ?? null,  
                'registered' \=\> $user-\>user\_registered  
            \];  
        }  
    \]);

    // \========== CREAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $d \= $request-\>get\_json\_params() ?: \[\];  
            $email    \= sanitize\_email($d\['email'\] ?? '');  
            $username \= sanitize\_user($d\['username'\] ?? ( $email ? current(explode('@',$email)) : '' ), true);  
            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
            $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');

            if (\!$email) return new WP\_Error('missing','email es obligatorio',\['status'=\>400\]);  
            if (email\_exists($email)) return new WP\_Error('exists','email ya existe',\['status'=\>409\]);  
            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

            $uid \= wp\_create\_user($username ?: 'user\_'.wp\_generate\_password(6,false,false), $password, $email);  
            if (is\_wp\_error($uid)) return $uid;  
            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);

            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$uid,'mode'=\>'created'\];  
        }  
    \]);

    // \========== ACTUALIZAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $id \= (int)$request\['id'\];  
            $user \= get\_userdata($id);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];  
            $upd \= \['ID'=\>$id\];

            if (\!empty($d\['email'\])) {  
                $email \= sanitize\_email($d\['email'\]);  
                $other \= get\_user\_by('email', $email);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','email ya en uso',\['status'=\>409\]);  
                $upd\['user\_email'\] \= $email;  
            }  
            if (\!empty($d\['username'\])) {  
                $username \= sanitize\_user($d\['username'\], true);  
                $other \= get\_user\_by('login', $username);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','username ya en uso',\['status'=\>409\]);  
                $upd\['user\_login'\] \= $username;  
            }  
            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];

            $res \= wp\_update\_user($upd);  
            if (is\_wp\_error($res)) return $res;

            if (\!empty($d\['role'\])) {  
                $role \= sanitize\_text\_field($d\['role'\]);  
                (new WP\_User($id))-\>set\_role($role);  
            }  
            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($id, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$id,'mode'=\>'updated'\];  
        }  
    \]);

    // \========== ELIMINAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_user($id);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    // \========== MASIVO: create|update|upsert \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_find\_user, $cmu\_apply\_meta){  
            $p        \= $request-\>get\_json\_params() ?: \[\];  
            $rows     \= $p\['customers'\] ?? $p\['rows'\] ?? \[\];  
            $mode     \= strtolower($p\['mode'\] ?? 'upsert');        // create|update|upsert  
            $match\_by \= strtolower($p\['match\_by'\] ?? 'email');     // id|email|username  
            if (\!in\_array($mode, \['create','update','upsert'\], true)) return new WP\_Error('invalid\_mode','mode inválido',\['status'=\>400\]);  
            if (\!in\_array($match\_by, \['id','email','username'\], true)) return new WP\_Error('invalid\_match','match\_by inválido',\['status'=\>400\]);  
            if (\!is\_array($rows) || \!$rows) return new WP\_Error('invalid','customers/rows vacío',\['status'=\>400\]);

            $out \= \[\];  
            foreach ($rows as $i=\>$d) {  
                try {  
                    $d \= (array)$d;  
                    $email    \= sanitize\_email($d\['email'\] ?? '');  
                    $username \= sanitize\_user($d\['username'\] ?? '', true);

                    // resolver usuario según match\_by  
                    $lookup\_value \= $match\_by==='id' ? ($d\['id'\] ?? null) : ($match\_by==='email' ? $email : $username);  
                    $user \= $cmu\_find\_user($match\_by, $lookup\_value);

                    if ($mode \=== 'create') {  
                        if ($user) throw new Exception("Fila $i: ya existe usuario con $match\_by");  
                        if (\!$email) throw new Exception("Fila $i: email requerido");  
                        if (email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                        if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

                        $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                        $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');  
                        $uid \= wp\_create\_user($username ?: current(explode('@',$email)), $password, $email);  
                        if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                        if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];

                    } elseif ($mode \=== 'update') {  
                        if (\!$user) throw new Exception("Fila $i: no existe usuario por $match\_by");

                        $upd \= \['ID'=\>$user-\>ID\];  
                        if (\!empty($d\['email'\])) {  
                            $new\_email \= sanitize\_email($d\['email'\]);  
                            $other \= get\_user\_by('email',$new\_email);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                            $upd\['user\_email'\] \= $new\_email;  
                        }  
                        if (\!empty($d\['username'\])) {  
                            $new\_user \= sanitize\_user($d\['username'\], true);  
                            $other \= get\_user\_by('login',$new\_user);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                            $upd\['user\_login'\] \= $new\_user;  
                        }  
                        if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                        $res \= wp\_update\_user($upd);  
                        if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                        if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                    } else { // upsert  
                        if ($user) {  
                            // update branch  
                            $upd \= \['ID'=\>$user-\>ID\];  
                            if (\!empty($d\['email'\])) {  
                                $new\_email \= sanitize\_email($d\['email'\]);  
                                $other \= get\_user\_by('email',$new\_email);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                                $upd\['user\_email'\] \= $new\_email;  
                            }  
                            if (\!empty($d\['username'\])) {  
                                $new\_user \= sanitize\_user($d\['username'\], true);  
                                $other \= get\_user\_by('login',$new\_user);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                                $upd\['user\_login'\] \= $new\_user;  
                            }  
                            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                            $res \= wp\_update\_user($upd);  
                            if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                            if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                        } else {  
                            // create branch  
                            if (\!$email && \!$username) throw new Exception("Fila $i: requiere email o username");  
                            if ($email && email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

                            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                            $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');

                            $base\_user \= $username ?: ($email ? current(explode('@',$email)) : 'user\_'.wp\_generate\_password(6,false,false));  
                            $uid \= wp\_create\_user($base\_user, $password, $email ?: '');  
                            if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];  
                        }  
                    }

                } catch (Throwable $e) {  
                    $out\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            return \['success'=\>true,'count'=\>count($out),'results'=\>$out\];  
        }  
    \]);

    // \========== MASIVO: delete por ids | emails | usernames \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params() ?: \[\];  
            $ids       \= array\_map('intval', $p\['ids'\] ?? \[\]);  
            $emails    \= array\_map('sanitize\_email', $p\['emails'\] ?? \[\]);  
            $usernames \= array\_map(function($u){return sanitize\_user($u, true);}, $p\['usernames'\] ?? \[\]);

            if (\!$ids && \!$emails && \!$usernames) {  
                return new WP\_Error('invalid','Envía ids o emails o usernames',\['status'=\>400\]);  
            }

            $targets \= $ids;

            foreach ($emails as $e) {  
                $u \= get\_user\_by('email',$e);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }  
            foreach ($usernames as $un) {  
                $u \= get\_user\_by('login',$un);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }

            $targets \= array\_values(array\_unique(array\_filter($targets)));  
            $results \= \[\];  
            foreach ($targets as $uid) {  
                $ok \= wp\_delete\_user($uid);  
                $results\[\] \= \['user\_id'=\>$uid,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$results\];  
        }  
    \]);  
});

/\* \============================================================================  
 \* 10\) CRUD de Órdenes (WooCommerce)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    if ( \! function\_exists('wc\_get\_order') ) return; // Woo requerido

    // \-------- Helpers \--------

    // Normaliza un array asociativo (recorta strings y desescapa)  
    $cmu\_clean\_assoc \= function($arr){  
        $out \= \[\];  
        foreach ((array)$arr as $k=\>$v){  
            if (is\_string($v)) $out\[$k\] \= wp\_unslash(trim($v));  
            else               $out\[$k\] \= $v;  
        }  
        return $out;  
    };  
	  
    // Construye líneas de items a partir de \['sku'| 'product\_id', 'quantity', 'price'?, 'subtotal'?, 'total'?\]  
    $cmu\_order\_set\_items \= function(WC\_Order $order, array $items) {  
        // Elimina items existentes si vamos a reescribir  
        foreach ($order-\>get\_items() as $item\_id \=\> $item) {  
            $order-\>remove\_item($item\_id);  
        }

        foreach ($items as $i=\>$row) {  
            $row \= (array)$row;  
            $qty \= max(1, (int)($row\['quantity'\] ?? 1));

            $pid \= 0;  
            if (\!empty($row\['product\_id'\])) {  
                $pid \= (int)$row\['product\_id'\];  
            } elseif (\!empty($row\['sku'\])) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($row\['sku'\]));  
            }  
            if (\!$pid) throw new Exception("Item $i: falta product\_id o sku válido");

            $product \= wc\_get\_product($pid);  
            if (\!$product) throw new Exception("Item $i: producto inválido ($pid)");

            $item \= new WC\_Order\_Item\_Product();  
            $item-\>set\_product($product);  
            $item-\>set\_quantity($qty);

            // Permitir override de precios si se envía  
            if (isset($row\['subtotal'\])) $item-\>set\_subtotal( (float)$row\['subtotal'\] );  
            if (isset($row\['total'\]))    $item-\>set\_total( (float)$row\['total'\] );  
            // Compat: price directo  
            if (isset($row\['price'\]) && \!isset($row\['subtotal'\]) && \!isset($row\['total'\])) {  
                $price \= (float)$row\['price'\];  
                $item-\>set\_subtotal($price \* $qty);  
                $item-\>set\_total($price \* $qty);  
            }

            // Meta por item (opcional)  
            if (\!empty($row\['meta'\]) && is\_array($row\['meta'\])) {  
                foreach ($row\['meta'\] as $mk=\>$mv){  
                    $item-\>add\_meta\_data(sanitize\_key($mk), is\_scalar($mv)? wp\_unslash($mv) : wp\_json\_encode($mv));  
                }  
            }

            $order-\>add\_item($item);  
        }  
    };

    // Añade/reescribe líneas de envío: \[{method\_id?, method\_title?, total, meta?}\]  
    $cmu\_order\_set\_shipping \= function(WC\_Order $order, array $ship\_lines){  
        foreach ($order-\>get\_items('shipping') as $sid \=\> $sitem) {  
            $order-\>remove\_item($sid);  
        }  
        foreach ($ship\_lines as $i=\>$row){  
            $row \= (array)$row;  
            $ship \= new WC\_Order\_Item\_Shipping();  
            $ship-\>set\_method\_id( sanitize\_text\_field($row\['method\_id'\] ?? 'custom') );  
            $ship-\>set\_method\_title( sanitize\_text\_field($row\['method\_title'\] ?? 'Shipping') );  
            $ship-\>set\_total( (float)($row\['total'\] ?? 0\) );  
            if (\!empty($row\['meta'\]) && is\_array($row\['meta'\])) {  
                foreach ($row\['meta'\] as $mk=\>$mv){  
                    $ship-\>add\_meta\_data(sanitize\_key($mk), is\_scalar($mv)? wp\_unslash($mv) : wp\_json\_encode($mv));  
                }  
            }  
            $order-\>add\_item($ship);  
        }  
    };

    // Añade/reescribe cupones: \[{code, discount?, discount\_tax?}\]  
    $cmu\_order\_set\_coupons \= function(WC\_Order $order, array $coupons){  
        foreach ($order-\>get\_items('coupon') as $cid \=\> $citem) {  
            $order-\>remove\_item($cid);  
        }  
        foreach ($coupons as $i=\>$row){  
            $row \= (array)$row;  
            if (empty($row\['code'\])) continue;  
            $c \= new WC\_Order\_Item\_Coupon();  
            $c-\>set\_code( sanitize\_text\_field($row\['code'\]) );  
            if (isset($row\['discount'\]))     $c-\>set\_discount( (float)$row\['discount'\] );  
            if (isset($row\['discount\_tax'\])) $c-\>set\_discount\_tax( (float)$row\['discount\_tax'\] );  
            $order-\>add\_item($c);  
        }  
    };  
	  
    // Añade/reescribe fees: \[{name, total, tax\_class?, tax\_status?}\]  
    $cmu\_order\_set\_fees \= function(WC\_Order $order, array $fees){  
        foreach ($order-\>get\_items('fee') as $fid \=\> $fitem) {  
            $order-\>remove\_item($fid);  
        }  
        foreach ($fees as $i=\>$row){  
            $row \= (array)$row;  
            if (empty($row\['name'\])) $row\['name'\] \= 'Fee';  
            $fee \= new WC\_Order\_Item\_Fee();  
            $fee-\>set\_name( sanitize\_text\_field($row\['name'\]) );  
            $fee-\>set\_total( (float)($row\['total'\] ?? 0\) );  
            if (\!empty($row\['tax\_class'\]))  $fee-\>set\_tax\_class( sanitize\_text\_field($row\['tax\_class'\]) );  
            if (\!empty($row\['tax\_status'\])) $fee-\>set\_tax\_status( sanitize\_text\_field($row\['tax\_status'\]) ); // taxable|none  
            $order-\>add\_item($fee);  
        }  
    };

	if (\!function\_exists('cmu\_safe\_order\_meta')) {  
		function cmu\_safe\_order\_meta($post\_id) {  
			$all \= get\_post\_meta($post\_id); // key \=\> array(values)  
			// Lista de exclusión por coincidencia exacta  
			$deny\_exact  \= apply\_filters('cmu\_order\_meta\_deny\_exact', \[  
				'\_shipping\_packages',  
				'\_shipping\_methods',  
				'\_thwcfe\_ship\_to\_billing',  
				'\_thwcfe\_disabled\_fields',  
			\], $post\_id);

			// Lista de exclusión por prefijo  
			$deny\_prefix \= apply\_filters('cmu\_order\_meta\_deny\_prefix', \[  
				'\_thwcfe\_',  
			\], $post\_id);

			$out \= \[\];  
			foreach ($all as $k \=\> $vals) {  
				$skip \= in\_array($k, $deny\_exact, true);  
				if (\!$skip && $deny\_prefix) {  
					foreach ($deny\_prefix as $px) {  
						if ($px \!== '' && strpos($k, $px) \=== 0\) { // empieza por prefijo  
							$skip \= true;  
							break;  
						}  
					}  
				}  
				if ($skip) continue;  
				$out\[$k\] \= $vals; // mantiene el mismo shape que get\_post\_meta  
			}  
			return $out;  
		}  
	}

	  
    // Construye payload JSON de orden  
    function cmu\_order\_payload($order\_id){  
        $order \= wc\_get\_order($order\_id);  
        if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);

        $get\_items \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items() as $it){  
                $p   \= $it-\>get\_product();  
                $pid \= $it-\>get\_product\_id();  
                $sku \= $p ? $p-\>get\_sku() : null;  
                $out\[\] \= \[  
                    'item\_id'   \=\> (int)$it-\>get\_id(),  
                    'product\_id'=\> (int)$pid,  
                    'sku'       \=\> $sku,  
                    'name'      \=\> $it-\>get\_name(),  
                    'quantity'  \=\> (float)$it-\>get\_quantity(),  
                    'subtotal'  \=\> (float)$it-\>get\_subtotal(),  
                    'total'     \=\> (float)$it-\>get\_total(),  
                    'meta'      \=\> $it-\>get\_meta\_data(),  
                \];  
            }  
            return $out;  
        };  
        $get\_shipping \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('shipping') as $s){  
                $out\[\] \= \[  
                    'item\_id'      \=\> (int)$s-\>get\_id(),  
                    'method\_id'    \=\> $s-\>get\_method\_id(),  
                    'method\_title' \=\> $s-\>get\_method\_title(),  
                    'total'        \=\> (float)$s-\>get\_total(),  
                    'meta'         \=\> $s-\>get\_meta\_data(),  
                \];  
            }  
            return $out;  
        };  
        $get\_coupons \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('coupon') as $c){  
                $out\[\] \= \[  
                    'item\_id'      \=\> (int)$c-\>get\_id(),  
                    'code'         \=\> $c-\>get\_code(),  
                    'discount'     \=\> (float)$c-\>get\_discount(),  
                    'discount\_tax' \=\> (float)$c-\>get\_discount\_tax(),  
                \];  
            }  
            return $out;  
        };  
        $get\_fees \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('fee') as $f){  
                $out\[\] \= \[  
                    'item\_id'   \=\> (int)$f-\>get\_id(),  
                    'name'      \=\> $f-\>get\_name(),  
                    'total'     \=\> (float)$f-\>get\_total(),  
                    'tax\_class' \=\> $f-\>get\_tax\_class(),  
                    'tax\_status'=\> $f-\>get\_tax\_status(),  
                \];  
            }  
            return $out;  
        };  
		  
		$descuentos \= cmu\_get\_order\_discounts($order);  
		  
        return \[  
            'id'              \=\> (int)$order-\>get\_id(),  
            'status'          \=\> $order-\>get\_status(),  
            'currency'        \=\> $order-\>get\_currency(),  
            'total'           \=\> (float)$order-\>get\_total(),  
            'subtotal'        \=\> (float)$order-\>get\_subtotal(),  
            'discount\_total'  \=\> (float)$order-\>get\_discount\_total(),  
            'shipping\_total'  \=\> (float)$order-\>get\_shipping\_total(),  
            'total\_tax'       \=\> (float)$order-\>get\_total\_tax(),  
            'payment\_method'  \=\> $order-\>get\_payment\_method(),  
            'payment\_title'   \=\> $order-\>get\_payment\_method\_title(),  
            'transaction\_id'  \=\> $order-\>get\_transaction\_id(),  
            'date\_created'    \=\> $order-\>get\_date\_created() ? $order-\>get\_date\_created()-\>date('c') : null,  
            'date\_paid'       \=\> $order-\>get\_date\_paid() ? $order-\>get\_date\_paid()-\>date('c') : null,  
            'customer\_id'     \=\> (int)$order-\>get\_customer\_id(),  
            'customer\_email'  \=\> $order-\>get\_billing\_email(),  
            'billing'         \=\> \[  
                'first\_name' \=\> $order-\>get\_billing\_first\_name(),  
                'last\_name'  \=\> $order-\>get\_billing\_last\_name(),  
                'company'    \=\> $order-\>get\_billing\_company(),  
                'address\_1'  \=\> $order-\>get\_billing\_address\_1(),  
                'address\_2'  \=\> $order-\>get\_billing\_address\_2(),  
                'city'       \=\> $order-\>get\_billing\_city(),  
                'state'      \=\> $order-\>get\_billing\_state(),  
                'postcode'   \=\> $order-\>get\_billing\_postcode(),  
                'country'    \=\> $order-\>get\_billing\_country(),  
                'email'      \=\> $order-\>get\_billing\_email(),  
                'phone'      \=\> $order-\>get\_billing\_phone(),  
            \],  
            'shipping'        \=\> \[  
                'first\_name' \=\> $order-\>get\_shipping\_first\_name(),  
                'last\_name'  \=\> $order-\>get\_shipping\_last\_name(),  
                'company'    \=\> $order-\>get\_shipping\_company(),  
                'address\_1'  \=\> $order-\>get\_shipping\_address\_1(),  
                'address\_2'  \=\> $order-\>get\_shipping\_address\_2(),  
                'city'       \=\> $order-\>get\_shipping\_city(),  
                'state'      \=\> $order-\>get\_shipping\_state(),  
                'postcode'   \=\> $order-\>get\_shipping\_postcode(),  
                'country'    \=\> $order-\>get\_shipping\_country(),  
                'phone'      \=\> $order-\>get\_meta('\_shipping\_phone'),  
            \],  
            'items'           \=\> $get\_items($order),  
            'shipping\_lines'  \=\> $get\_shipping($order),  
            'coupon\_lines'    \=\> $get\_coupons($order),  
            'fee\_lines'       \=\> $get\_fees($order),  
            'meta'            \=\> cmu\_safe\_order\_meta($order-\>get\_id()),// crudo (todas las metas)  
			'Descuentos'      \=\> $descuentos,  
        \];  
    }

	if (\!function\_exists('cmu\_get\_order\_discounts')) {  
		/\*\*  
		 \* Descuentos por orden:  
		 \* \- Items: lista solo si tienen descuento (catálogo y/o línea)  
		 \*   \- DescuentoCatalogo: (regular\_price \- sale\_price)  
		 \*   \- DescuentoLinea: (line\_subtotal \- line\_total)  \[excluye impuestos\]  
		 \*   \- DescuentoTotalProducto: suma de ambos  
		 \* \- Cupones: códigos y montos aplicados a la orden  
		 \*/  
		function cmu\_get\_order\_discounts( WC\_Order $order ) {  
			$items\_desc \= \[\];

			foreach ( $order-\>get\_items('line\_item') as $item\_id \=\> $item ) {  
				$product \= $item-\>get\_product();  
				if ( \! $product ) continue;

				$name \= $item-\>get\_name();  
				$sku  \= $product-\>get\_sku() ?: '';  
				$qty  \= max(1, (int)$item-\>get\_quantity()); // evitar /0

				// \---------- Descuento de Catálogo (regular vs sale) \----------  
				$regular\_raw \= $product-\>get\_regular\_price();  
				$sale\_raw    \= $product-\>get\_sale\_price();

				$desc\_cat\_unit  \= 0.0;  
				$desc\_cat\_total \= 0.0;  
				if ($regular\_raw \!== '' && $sale\_raw \!== '') {  
					$regular \= (float)$regular\_raw;  
					$sale    \= (float)$sale\_raw;  
					if ($regular \> $sale) {  
						$desc\_cat\_unit  \= $regular \- $sale;  
						$desc\_cat\_total \= $desc\_cat\_unit \* $qty;  
					}  
				}

				// \---------- Descuento de Línea (cupones/reglas sobre el ítem) \----------  
				// Nota: subtotal y total EXCLUYEN impuestos. Si lo quieres con impuestos, suma get\_\*\_tax().  
				$line\_subtotal \= (float)$item-\>get\_subtotal();  
				$line\_total    \= (float)$item-\>get\_total();

				$desc\_line\_total \= max(0, $line\_subtotal \- $line\_total);  
				$desc\_line\_unit  \= $qty ? ($desc\_line\_total / $qty) : 0.0;

				// \---------- Solo incluir si hay algún descuento \----------  
				if ( $desc\_cat\_total \> 0 || $desc\_line\_total \> 0 ) {  
					$items\_desc\[\] \= \[  
						'Item'                        \=\> trim( $name . ( $sku ? " ($sku)" : '' ) ),  
						'Nombre'                      \=\> $name,  
						'Sku'                         \=\> $sku,  
						'Cantidad'                    \=\> $qty,

						// Catálogo  
						'RegularPrice'                \=\> isset($regular) ? round($regular, 2\) : null,  
						'SalePrice'                   \=\> isset($sale) ? round($sale, 2\) : null,  
						'DescuentoCatalogoUnitario'   \=\> round($desc\_cat\_unit, 2),  
						'DescuentoCatalogoTotal'      \=\> round($desc\_cat\_total, 2),

						// Línea (por cupones/reglas sobre el ítem)  
						'PrecioLineaSubtotal'         \=\> round($line\_subtotal, 2), // total del ítem antes de descuentos de línea  
						'PrecioLineaTotal'            \=\> round($line\_total, 2),    // total pagado por el ítem (sin impuestos)  
						'DescuentoLineaUnitario'      \=\> round($desc\_line\_unit, 2),  
						'DescuentoLineaTotal'         \=\> round($desc\_line\_total, 2),

						// Total por producto  
						'DescuentoTotalProducto'      \=\> round($desc\_cat\_total \+ $desc\_line\_total, 2),

						'Moneda'                      \=\> $order-\>get\_currency(),  
					\];  
				}  
			}

			// \---------- Cupones de la orden (al final) \----------  
			$cupones \= \[\];  
			foreach ( $order-\>get\_items('coupon') as $c\_item ) {  
				$code  \= $c\_item-\>get\_code();  
				$monto \= (float)$c\_item-\>get\_discount() \+ (float)$c\_item-\>get\_discount\_tax();  
				$cupones\[\] \= \[  
					'Codigo' \=\> $code,  
					'Monto'  \=\> round($monto, 2),  
					'Moneda' \=\> $order-\>get\_currency(),  
				\];  
			}

			return \[  
				'Items'   \=\> array\_values($items\_desc),  
				'Cupones' \=\> array\_values($cupones),  
			\];  
		}  
	}

    // \--------- CREAR \---------  
    register\_rest\_route('custom-api/v1', '/order', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
            $d \= $request-\>get\_json\_params() ?: \[\];

            // Cliente: por id o email  
            $customer\_id \= 0;  
            if (\!empty($d\['customer\_id'\])) {  
                $customer\_id \= (int)$d\['customer\_id'\];  
            } elseif (\!empty($d\['customer\_email'\])) {  
                $u \= get\_user\_by('email', sanitize\_email($d\['customer\_email'\]));  
                if ($u) $customer\_id \= (int)$u-\>ID;  
            }

            $order \= wc\_create\_order(\['customer\_id'=\>$customer\_id\]);

            // Billing / Shipping  
            if (\!empty($d\['billing'\]))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\]), 'billing');  
            if (\!empty($d\['shipping'\])) $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\]), 'shipping');  
            if (\!empty($d\['shipping'\]\['phone'\])) $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($d\['shipping'\]\['phone'\])));

            // Items (requeridos)  
            $items \= $d\['items'\] ?? \[\];  
            if (\!is\_array($items) || \!$items) return new WP\_Error('invalid','Envía items (array)', \['status'=\>400\]);  
            $cmu\_order\_set\_items($order, $items);

            // Fees / Shipping lines / Coupons (opcionales)  
            if (\!empty($d\['fee\_lines'\]) && is\_array($d\['fee\_lines'\])) $cmu\_order\_set\_fees($order, $d\['fee\_lines'\]);  
            if (\!empty($d\['shipping\_lines'\]) && is\_array($d\['shipping\_lines'\])) $cmu\_order\_set\_shipping($order, $d\['shipping\_lines'\]);  
            if (\!empty($d\['coupon\_lines'\]) && is\_array($d\['coupon\_lines'\])) $cmu\_order\_set\_coupons($order, $d\['coupon\_lines'\]);

            // Método de pago / status  
            if (\!empty($d\['payment\_method'\])) {  
                $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
                if (\!empty($d\['payment\_method\_title'\])) {  
                    $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
                }  
            }  
            if (\!empty($d\['status'\])) {  
                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) ); // e.g. pending|processing|completed  
            }

            // Meta libre en la orden (opcional)  
            if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
                foreach ($d\['meta'\] as $k=\>$v) {  
                    $order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
                }  
            }

            $order-\>calculate\_totals();

            // Marcar como pagada (opcional)  
            if (\!empty($d\['set\_paid'\])) {  
                $order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
            } elseif (\!empty($d\['transaction\_id'\])) {  
                $order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
            }

            $order-\>save();

            return \['success'=\>true,'order\_id'=\>(int)$order-\>get\_id(),'status'=\>$order-\>get\_status()\];  
        }  
    \]);

    // \--------- LEER (uno) \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            return cmu\_order\_payload($id);  
        }  
    \]);

    // \--------- LISTAR (paginado \+ filtros avanzados, conteo real) \---------  
	register\_rest\_route('custom-api/v1', '/orders', \[  
		'methods'  \=\> 'GET',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request){

			// \---------- Helpers locales \----------

			// A: parsea lista (coma|array) a array de enteros  
			$parse\_id\_list \= function($v){  
				if (is\_array($v)) {  
					return array\_values(array\_filter(array\_map('intval', $v)));  
				}  
				if (is\_string($v)) {  
					$arr \= array\_map('trim', explode(',', $v));  
					return array\_values(array\_filter(array\_map('intval', $arr)));  
				}  
				return \[\];  
			};

			// B: normaliza status (sin prefijo wc-), soporta coma o array  
			$parse\_status \= function($v){  
				$to\_arr \= is\_array($v) ? $v : (is\_string($v) && $v \!== '' ? preg\_split('/\\s\*,\\s\*/', $v) : \[\]);  
				$out \= \[\];  
				foreach ($to\_arr as $s) {  
					$s \= sanitize\_text\_field($s);  
					if ($s \=== '' || strtolower($s) \=== 'any') continue;  
					if (stripos($s, 'wc-') \=== 0\) $s \= substr($s, 3);  
					$out\[\] \= $s;  
				}  
				// evita duplicados  
				return array\_values(array\_unique($out));  
			};

			// C: valida y normaliza fechas (Y-m-d o ISO8601) para WC\_Order\_Query (after/before)  
			$parse\_date \= function($v){  
				if (\!$v) return null;  
				$v \= trim((string)$v);  
				// strtotime soporta ISO8601/Y-m-d; si falla, null  
				$ts \= strtotime($v);  
				if ($ts \=== false) return null;  
				// Woo acepta string 'Y-m-d H:i:s' o fecha 'Y-m-d'  
				return gmdate('Y-m-d H:i:s', $ts);  
			};

			// D: detección básica de email / dígitos / texto  
			$looks\_email \= function($s){  
				return (bool)filter\_var($s, FILTER\_VALIDATE\_EMAIL);  
			};  
			$is\_digits \= function($s){  
				return (bool)preg\_match('/^\\d+$/', $s);  
			};

			// E: sanitiza operador de meta\_compare  
			$sanitize\_meta\_compare \= function($cmp){  
				$allowed \= \['=', '\!=', '\>', '\>=', '\<', '\<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'EXISTS', 'NOT EXISTS', 'REGEXP', 'NOT REGEXP', 'RLIKE'\];  
				$cmp \= strtoupper(trim((string)$cmp));  
				return in\_array($cmp, $allowed, true) ? $cmp : null;  
			};

			// \---------- Parámetros básicos \----------  
			$page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
			$per\_page \= max(1, min(200, (int)($request-\>get\_param('per\_page') ?: 50)));

			$orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'date'); // date|modified|id|total  
			$order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
			$order    \= in\_array($order, \['ASC','DESC'\], true) ? $order : 'DESC';

			// \---------- Construcción de args base \----------  
			$args \= \[  
				'type'      \=\> 'shop\_order',  
				'paginate'  \=\> true,        // \<- clave: devuelve objeto con orders, total, max\_num\_pages  
				'limit'     \=\> $per\_page,  
				'page'      \=\> $page,  
				'return'    \=\> 'objects',   // obtendremos objetos WC\_Order y luego sacamos payload  
			\];

			// \---------- status (uno o varios) \----------  
			$status\_param \= $request-\>get\_param('status');  
			$statuses \= $parse\_status($status\_param);  
			if (\!empty($statuses)) {  
				$args\['status'\] \= $statuses; // array de slugs sin 'wc-'  
			}  
			// Si llega 'any' o vacío, NO pasar 'status' para que incluya todos

			// \---------- include / exclude \----------  
			$include \= $parse\_id\_list($request-\>get\_param('include'));  
			if ($include) $args\['include'\] \= $include;

			$exclude \= $parse\_id\_list($request-\>get\_param('exclude'));  
			if ($exclude) $args\['exclude'\] \= $exclude;

			// \---------- customer\_id / customer\_email \----------  
			if ($request-\>get\_param('customer\_id') \!== null) {  
				$args\['customer'\] \= max(0, (int)$request-\>get\_param('customer\_id'));  
			}  
			$customer\_email \= sanitize\_email($request-\>get\_param('customer\_email'));  
			if ($customer\_email) {  
				// Filtro exacto por email de facturación si parece email válido  
				$args\['billing\_email'\] \= $customer\_email;  
			}

			// \---------- transaction\_id \----------  
			$transaction\_id \= sanitize\_text\_field($request-\>get\_param('transaction\_id') ?: '');  
			if ($transaction\_id \!== '') {  
				$args\['transaction\_id'\] \= $transaction\_id;  
			}

			// \---------- Rangos de fecha: created \----------  
			$dc\_from \= $parse\_date($request-\>get\_param('date\_created\_from'));  
			$dc\_to   \= $parse\_date($request-\>get\_param('date\_created\_to'));  
			if ($dc\_from || $dc\_to) {  
				$args\['date\_created'\] \= array\_filter(\[  
					'after'     \=\> $dc\_from,  
					'before'    \=\> $dc\_to,  
					'inclusive' \=\> true,  
				\]);  
			}

			// \---------- Rangos de fecha: modified \----------  
			$dm\_from \= $parse\_date($request-\>get\_param('date\_modified\_from'));  
			$dm\_to   \= $parse\_date($request-\>get\_param('date\_modified\_to'));  
			if ($dm\_from || $dm\_to) {  
				$args\['date\_modified'\] \= array\_filter(\[  
					'after'     \=\> $dm\_from,  
					'before'    \=\> $dm\_to,  
					'inclusive' \=\> true,  
				\]);  
			}

			// \---------- Rango de totales \----------  
			$min\_total \= $request-\>get\_param('min\_total');  
			$max\_total \= $request-\>get\_param('max\_total');  
			$meta\_query \= \[\];

			if ($min\_total \!== null || $max\_total \!== null) {  
				$minv \= is\_numeric($min\_total) ? (float)$min\_total : null;  
				$maxv \= is\_numeric($max\_total) ? (float)$max\_total : null;

				if ($minv \!== null && $maxv \!== null && $minv \> $maxv) {  
					return new WP\_Error('bad\_request', 'min\_total no puede ser mayor que max\_total', \['status'=\>400\]);  
				}

				if ($minv \!== null && $maxv \!== null) {  
					$meta\_query\[\] \= \[  
						'key'     \=\> '\_order\_total',  
						'value'   \=\> \[$minv, $maxv\],  
						'compare' \=\> 'BETWEEN',  
						'type'    \=\> 'NUMERIC',  
					\];  
				} elseif ($minv \!== null) {  
					$meta\_query\[\] \= \[  
						'key'     \=\> '\_order\_total',  
						'value'   \=\> $minv,  
						'compare' \=\> '\>=',  
						'type'    \=\> 'NUMERIC',  
					\];  
				} elseif ($maxv \!== null) {  
					$meta\_query\[\] \= \[  
						'key'     \=\> '\_order\_total',  
						'value'   \=\> $maxv,  
						'compare' \=\> '\<=',  
						'type'    \=\> 'NUMERIC',  
					\];  
				}  
			}

			// \---------- meta\_key/meta\_value/meta\_compare (simple) \----------  
			$meta\_key     \= sanitize\_text\_field($request-\>get\_param('meta\_key') ?: '');  
			$meta\_value   \= $request-\>get\_param('meta\_value'); // puede ser string o array  
			$meta\_compare \= $request-\>get\_param('meta\_compare');

			if ($meta\_key \!== '') {  
				$cmp \= $meta\_compare \!== null ? $meta\_compare : '=';  
				$cmp \= $sanitize\_meta\_compare($cmp);  
				if ($cmp \=== null) {  
					return new WP\_Error('bad\_request', 'meta\_compare inválido', \['status'=\>400\]);  
				}  
				$mq \= \[  
					'key'     \=\> $meta\_key,  
					'compare' \=\> $cmp,  
				\];  
				if ($meta\_value \!== null) {  
					// Permite array para IN/NOT IN/BETWEEN  
					if (is\_array($meta\_value)) {  
						$san \= \[\];  
						foreach ($meta\_value as $v) {  
							$san\[\] \= is\_scalar($v) ? wp\_unslash((string)$v) : wp\_json\_encode($v);  
						}  
						$mq\['value'\] \= $san;  
					} else {  
						$mq\['value'\] \= is\_scalar($meta\_value) ? wp\_unslash((string)$meta\_value) : wp\_json\_encode($meta\_value);  
					}  
				}  
				// Si el valor parece numérico y el operador lo amerita, forzamos NUMERIC para ordenar/filtrar mejor  
				if (isset($mq\['value'\]) && (is\_numeric($mq\['value'\]) || (is\_array($mq\['value'\]) && count(array\_filter($mq\['value'\], 'is\_numeric')) \=== count($mq\['value'\])))) {  
					$mq\['type'\] \= 'NUMERIC';  
				}  
				$meta\_query\[\] \= $mq;  
			}

			// \---------- meta\_query JSON avanzada (opcional) \----------  
			$meta\_query\_json \= $request-\>get\_param('meta\_query');  
			if ($meta\_query\_json) {  
				$decoded \= is\_array($meta\_query\_json) ? $meta\_query\_json : json\_decode((string)$meta\_query\_json, true);  
				if (json\_last\_error() \=== JSON\_ERROR\_NONE && is\_array($decoded)) {  
					// Validación muy básica de estructura  
					// Permitimos recibir directamente un array de cláusulas o un array con 'relation'/'clauses'  
					$mq\_norm \= $decoded;  
					// Sanitizado mínimo  
					$sanitize\_clause \= function($clause) use ($sanitize\_meta\_compare) {  
						if (\!is\_array($clause)) return null;  
						$out \= \[\];  
						foreach ($clause as $k=\>$v){  
							switch($k){  
								case 'key':     $out\['key'\] \= sanitize\_text\_field((string)$v); break;  
								case 'value':   $out\['value'\] \= $v; break; // se deja libre (puede ser array)  
								case 'compare':  
									$cmp \= $sanitize\_meta\_compare($v);  
									if ($cmp \=== null) return null;  
									$out\['compare'\] \= $cmp;  
									break;  
								case 'type':  
									// NUMERIC/CHAR/BINARY/DATE/DATETIME/DECIMAL etc. (dejamos pasar tras sanitize\_text\_field)  
									$out\['type'\] \= sanitize\_text\_field((string)$v);  
									break;  
								case 'relation':  
									$rel \= strtoupper((string)$v);  
									$out\['relation'\] \= in\_array($rel, \['AND','OR'\], true) ? $rel : 'AND';  
									break;  
								default:  
									// ignora claves desconocidas  
									break;  
							}  
						}  
						return $out;  
					};

					if (isset($mq\_norm\['relation'\]) || array\_keys($mq\_norm) \!== range(0, count($mq\_norm)-1)) {  
						// Forma asociativa (posible 'relation' \+ cláusulas con índices)  
						$relation \= isset($mq\_norm\['relation'\]) ? strtoupper((string)$mq\_norm\['relation'\]) : 'AND';  
						$relation \= in\_array($relation, \['AND','OR'\], true) ? $relation : 'AND';  
						$composed \= \['relation' \=\> $relation\];

						foreach ($mq\_norm as $k=\>$v){  
							if ($k \=== 'relation') continue;  
							$cl \= $sanitize\_clause($v);  
							if ($cl) $composed\[\] \= $cl;  
						}  
						if (count($composed) \> 1\) {  
							$meta\_query\[\] \= $composed;  
						}  
					} else {  
						// Lista de cláusulas simples  
						$block \= \[\];  
						foreach ($mq\_norm as $clause){  
							$cl \= $sanitize\_clause($clause);  
							if ($cl) $block\[\] \= $cl;  
						}  
						if ($block) $meta\_query \= array\_merge($meta\_query, $block);  
					}  
				} else {  
					return new WP\_Error('bad\_request','meta\_query JSON inválido', \['status'=\>400\]);  
				}  
			}

			if ($meta\_query) {  
				// Si ya hay varias, añadimos relation AND por defecto  
				if (\!isset($meta\_query\['relation'\])) {  
					$args\['meta\_query'\] \= array\_merge(\['relation'=\>'AND'\], $meta\_query);  
				} else {  
					$args\['meta\_query'\] \= $meta\_query;  
				}  
			}

			// \---------- search flexible \----------  
			$search \= (string)($request-\>get\_param('search') ?? '');  
			$search \= trim(wp\_unslash($search));  
			if ($search \!== '') {  
				if ($is\_digits($search)) {  
					// ID exacto  
					$args\['include'\] \= \[ (int)$search \];  
				} elseif ($looks\_email($search)) {  
					$args\['billing\_email'\] \= sanitize\_email($search);  
				} else {  
					// 1\) Intentar número de pedido estilo "\#1234" o secuencial sin '\#'  
					$maybe\_num \= ltrim($search, "\# \\t\\n\\r\\0\\x0B");  
					if ($is\_digits($maybe\_num)) {  
						// Muchos sitios usan \_order\_number (Sequential Order Numbers)  
						$args\['meta\_query'\]\[\] \= \[  
							'key'     \=\> '\_order\_number',  
							'value'   \=\> $maybe\_num,  
							'compare' \=\> '=',  
						\];  
					} else {  
						// 2\) Búsqueda por nombre/apellido y, opcional, teléfono  
						// Nota: Woo no tiene args nativos para LIKE en first/last phone, vamos por meta\_query  
						$like \= '%' . $GLOBALS\['wpdb'\]-\>esc\_like($search) . '%';  
						$name\_block \= \[  
							'relation' \=\> 'OR',  
							\[  
								'key'     \=\> '\_billing\_first\_name',  
								'value'   \=\> $like,  
								'compare' \=\> 'LIKE',  
							\],  
							\[  
								'key'     \=\> '\_billing\_last\_name',  
								'value'   \=\> $like,  
								'compare' \=\> 'LIKE',  
							\],  
						\];  
						// Si además el texto parece teléfono (contiene dígitos suficientes), incluimos phone  
						if (preg\_match('/\\d{3,}/', $search)) {  
							$name\_block\[\] \= \[  
								'key'     \=\> '\_billing\_phone',  
								'value'   \=\> $like,  
								'compare' \=\> 'LIKE',  
							\];  
						}

						// Empujar bloque OR junto a otros meta\_query  
						if (\!isset($args\['meta\_query'\])) {  
							$args\['meta\_query'\] \= \['relation'=\>'AND', $name\_block\];  
						} else {  
							// Si ya existe meta\_query, enganchar el bloque  
							if (\!isset($args\['meta\_query'\]\['relation'\])) {  
								$args\['meta\_query'\] \= array\_merge(\['relation'=\>'AND'\], $args\['meta\_query'\]);  
							}  
							$args\['meta\_query'\]\[\] \= $name\_block;  
						}  
					}  
				}  
			}

			// \---------- orderby mapping \----------  
			// Woo soporta: 'date', 'modified', 'id', 'include' y meta\_value(\_num)  
			switch ($orderby) {  
				case 'id':  
					$args\['orderby'\] \= 'ID';  
					$args\['order'\]   \= $order;  
					break;  
				case 'modified':  
					$args\['orderby'\] \= 'modified';  
					$args\['order'\]   \= $order;  
					break;  
				case 'total':  
					// Ordenar por total requiere meta\_key=\_order\_total \+ meta\_value\_num  
					$args\['meta\_key'\] \= '\_order\_total';  
					$args\['orderby'\]  \= 'meta\_value\_num';  
					$args\['order'\]    \= $order;  
					break;  
				case 'date':  
				default:  
					$args\['orderby'\] \= 'date';  
					$args\['order'\]   \= $order;  
					break;  
			}

			// \---------- Ejecutar query paginada \----------  
			$q \= wc\_get\_orders($args); // objeto: \-\>orders (array), \-\>total (int), \-\>max\_num\_pages (int)

			// \---------- Armar respuesta \----------  
			$rows \= \[\];  
			foreach ((array)$q-\>orders as $order) {  
				// $order es WC\_Order  
				$rows\[\] \= cmu\_order\_payload($order-\>get\_id());  
			}

			return \[  
				'success'    \=\> true,  
				'page'       \=\> (int)$page,  
				'per\_page'   \=\> (int)$per\_page,  
				'total'      \=\> (int)$q-\>total,           // conteo real de la misma consulta  
				'max\_pages'  \=\> (int)$q-\>max\_num\_pages,   // páginas calculadas por WC  
				'rows'       \=\> $rows,  
			\];  
		}  
	\]);

    // \--------- ACTUALIZAR (replace items si se envían) \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
            $id \= (int)$request\['id'\];  
            $order \= wc\_get\_order($id);  
            if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];

            // Direcciones  
            if (array\_key\_exists('billing', $d))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\] ?: \[\]), 'billing');  
            if (array\_key\_exists('shipping',$d))  $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\] ?: \[\]), 'shipping');  
            if (\!empty($d\['shipping'\]\['phone'\]) || array\_key\_exists('shipping', $d)) {  
                $phone \= $d\['shipping'\]\['phone'\] ?? '';  
                if ($phone \=== '') $order-\>delete\_meta\_data('\_shipping\_phone'); else $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($phone)));  
            }

            // Items: si se envía "items", reemplaza todos  
            if (array\_key\_exists('items', $d)) {  
                $items \= (array)$d\['items'\];  
                if ($items) $cmu\_order\_set\_items($order, $items);  
                else {  
                    // si viene vacío, significa limpiar  
                    foreach ($order-\>get\_items() as $iid=\>$it) $order-\>remove\_item($iid);  
                }  
            }

            // Fees, Shipping lines, Coupons  
            if (array\_key\_exists('fee\_lines',$d)) {  
                $fees \= (array)$d\['fee\_lines'\];  
                if ($fees) $cmu\_order\_set\_fees($order, $fees);  
                else foreach ($order-\>get\_items('fee') as $fid=\>$f) $order-\>remove\_item($fid);  
            }  
            if (array\_key\_exists('shipping\_lines',$d)) {  
                $ship \= (array)$d\['shipping\_lines'\];  
                if ($ship) $cmu\_order\_set\_shipping($order, $ship);  
                else foreach ($order-\>get\_items('shipping') as $sid=\>$s) $order-\>remove\_item($sid);  
            }  
            if (array\_key\_exists('coupon\_lines',$d)) {  
                $cps \= (array)$d\['coupon\_lines'\];  
                if ($cps) $cmu\_order\_set\_coupons($order, $cps);  
                else foreach ($order-\>get\_items('coupon') as $cid=\>$c) $order-\>remove\_item($cid);  
            }

            // Cliente / pago / status  
            if (array\_key\_exists('customer\_id',$d))   $order-\>set\_customer\_id( (int)$d\['customer\_id'\] );  
            if (\!empty($d\['payment\_method'\]))        $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
            if (\!empty($d\['payment\_method\_title'\]))  $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
            if (\!empty($d\['status'\]))                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) );

            // Meta libre  
            if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
                foreach ($d\['meta'\] as $k=\>$v) {  
                    $order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
                }  
            }

            // Totales  
            $order-\>calculate\_totals();

            // Pago/Transacción  
            if (\!empty($d\['set\_paid'\])) {  
                $order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
            } elseif (\!empty($d\['transaction\_id'\])) {  
                $order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
            }

            $order-\>save();

            return \['success'=\>true,'order\_id'=\>$order-\>get\_id(),'status'=\>$order-\>get\_status(),'mode'=\>'updated'\];  
        }  
    \]);

    // \--------- BORRAR \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $order \= wc\_get\_order($id);  
            if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);  
	  
	/\* \---------- POST /orders/batch (create\_only) \---------- \*/  
	register\_rest\_route('custom-api/v1', '/orders/batch', \[  
		'methods'  \=\> 'POST',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
			$p \= $request-\>get\_json\_params() ?: \[\];  
			$rows \= $p\['orders'\] ?? $p\['rows'\] ?? \[\];  
			if (\!is\_array($rows) || \!$rows) {  
				return new WP\_Error('invalid\_data','Envía "orders" (array de objetos).',\['status'=\>400\]);  
			}

			$results \= \[\];  
			foreach ($rows as $i=\>$d) {  
				try {  
					$d \= (array)$d;

					// Validación mínima  
					$items \= $d\['items'\] ?? \[\];  
					if (\!is\_array($items) || \!$items) throw new Exception("Fila $i: falta items (array)");

					// Cliente por id o email  
					$customer\_id \= 0;  
					if (\!empty($d\['customer\_id'\])) {  
						$customer\_id \= (int)$d\['customer\_id'\];  
					} elseif (\!empty($d\['customer\_email'\])) {  
						$u \= get\_user\_by('email', sanitize\_email($d\['customer\_email'\]));  
						if ($u) $customer\_id \= (int)$u-\>ID;  
					}

					$order \= wc\_create\_order(\['customer\_id'=\>$customer\_id\]);

					// Billing / Shipping  
					if (\!empty($d\['billing'\]))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\]), 'billing');  
					if (\!empty($d\['shipping'\])) $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\]), 'shipping');  
					if (\!empty($d\['shipping'\]\['phone'\])) $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($d\['shipping'\]\['phone'\])));

					// Items obligatorios  
					$cmu\_order\_set\_items($order, $items);

					// Fees / Shipping / Coupons (opcionales)  
					if (\!empty($d\['fee\_lines'\]) && is\_array($d\['fee\_lines'\]))         $cmu\_order\_set\_fees($order, $d\['fee\_lines'\]);  
					if (\!empty($d\['shipping\_lines'\]) && is\_array($d\['shipping\_lines'\]))$cmu\_order\_set\_shipping($order, $d\['shipping\_lines'\]);  
					if (\!empty($d\['coupon\_lines'\]) && is\_array($d\['coupon\_lines'\]))    $cmu\_order\_set\_coupons($order, $d\['coupon\_lines'\]);

					// Pago / status  
					if (\!empty($d\['payment\_method'\])) {  
						$order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
						if (\!empty($d\['payment\_method\_title'\])) {  
							$order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
						}  
					}  
					if (\!empty($d\['status'\])) {  
						$order-\>set\_status( sanitize\_text\_field($d\['status'\]) );  
					}

					// Meta libre  
					if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
						foreach ($d\['meta'\] as $k=\>$v) {  
							$order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
						}  
					}

					$order-\>calculate\_totals();

					// Pago/Transacción  
					if (\!empty($d\['set\_paid'\])) {  
						$order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
					} elseif (\!empty($d\['transaction\_id'\])) {  
						$order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
					}

					$order-\>save();

					$results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','order\_id'=\>(int)$order-\>get\_id(),'status'=\>$order-\>get\_status()\];

				} catch (Throwable $e) {  
					$results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
				}  
			}

			return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
		}  
	\]);

	/\* \---------- PUT /orders/batch (update\_only) \---------- \*/  
	register\_rest\_route('custom-api/v1', '/orders/batch', \[  
		'methods'  \=\> 'PUT',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
			$p \= $request-\>get\_json\_params() ?: \[\];  
			$rows \= $p\['orders'\] ?? $p\['updates'\] ?? $p\['rows'\] ?? \[\];  
			if (\!is\_array($rows) || \!$rows) {  
				return new WP\_Error('invalid\_data','Envía "orders" (array con "id").',\['status'=\>400\]);  
			}

			$results \= \[\];  
			foreach ($rows as $i=\>$d) {  
				try {  
					$d \= (array)$d;  
					$id \= isset($d\['id'\]) ? (int)$d\['id'\] : 0;  
					if (\!$id) throw new Exception("Fila $i: falta id");

					$order \= wc\_get\_order($id);  
					if (\!$order) { $results\[\] \= \['index'=\>$i,'success'=\>false,'id'=\>$id,'error'=\>'Orden no encontrada'\]; continue; }

					// Direcciones (replace si se envían)  
					if (array\_key\_exists('billing', $d))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\] ?: \[\]), 'billing');  
					if (array\_key\_exists('shipping',$d))  $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\] ?: \[\]), 'shipping');  
					if (\!empty($d\['shipping'\]\['phone'\]) || array\_key\_exists('shipping', $d)) {  
						$phone \= $d\['shipping'\]\['phone'\] ?? '';  
						if ($phone \=== '') $order-\>delete\_meta\_data('\_shipping\_phone'); else $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($phone)));  
					}

					// Items (si viene, reemplaza todo; si \[\], limpia)  
					if (array\_key\_exists('items',$d)) {  
						$items \= (array)$d\['items'\];  
						if ($items) $cmu\_order\_set\_items($order, $items);  
						else foreach ($order-\>get\_items() as $iid=\>$it) $order-\>remove\_item($iid);  
					}

					// Fees / Shipping / Coupons (replace si se envían)  
					if (array\_key\_exists('fee\_lines',$d)) {  
						$fees \= (array)$d\['fee\_lines'\];  
						if ($fees) $cmu\_order\_set\_fees($order, $fees);  
						else foreach ($order-\>get\_items('fee') as $fid=\>$f) $order-\>remove\_item($fid);  
					}  
					if (array\_key\_exists('shipping\_lines',$d)) {  
						$ship \= (array)$d\['shipping\_lines'\];  
						if ($ship) $cmu\_order\_set\_shipping($order, $ship);  
						else foreach ($order-\>get\_items('shipping') as $sid=\>$s) $order-\>remove\_item($sid);  
					}  
					if (array\_key\_exists('coupon\_lines',$d)) {  
						$cps \= (array)$d\['coupon\_lines'\];  
						if ($cps) $cmu\_order\_set\_coupons($order, $cps);  
						else foreach ($order-\>get\_items('coupon') as $cid=\>$c) $order-\>remove\_item($cid);  
					}

					// Cliente / pago / status  
					if (array\_key\_exists('customer\_id',$d))   $order-\>set\_customer\_id( (int)$d\['customer\_id'\] );  
					if (\!empty($d\['payment\_method'\]))        $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
					if (\!empty($d\['payment\_method\_title'\]))  $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
					if (\!empty($d\['status'\]))                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) );

					// Meta libre  
					if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
						foreach ($d\['meta'\] as $k=\>$v) {  
							$order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
						}  
					}

					// Totales  
					$order-\>calculate\_totals();

					// Pago/Transacción  
					if (\!empty($d\['set\_paid'\])) {  
						$order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
					} elseif (\!empty($d\['transaction\_id'\])) {  
						$order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
					}

					$order-\>save();

					$results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','order\_id'=\>$order-\>get\_id(),'status'=\>$order-\>get\_status()\];

				} catch (Throwable $e) {  
					$results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
				}  
			}

			return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
		}  
	\]);  
});

# 6 \- Disable Rest Cache

**6 \- Disable Rest Cache**

/\*\*  
 \* Plugin Name: Disable Cache for REST API (Global)  
 \* Description: Desactiva page cache y envía no-cache headers para cualquier petición REST (/wp-json/\*).  
 \* Author: LM  
 \* Version: 1.0.0  
 \*/

if ( \! defined('ABSPATH') ) exit;

/\*\*  
 \* 1\) Si la petición es REST, marca DONOTCACHEPAGE y LITESPEED\_NO\_CACHE  
 \*    (funciona con Litespeed/Hostinger, algunos proxies, etc.)  
 \*/  
add\_action('init', function () {  
    if ( defined('REST\_REQUEST') && REST\_REQUEST ) {  
        if ( \! defined('DONOTCACHEPAGE') )     define('DONOTCACHEPAGE', true);  
        if ( \! defined('LITESPEED\_NO\_CACHE') ) define('LITESPEED\_NO\_CACHE', true);  
    }  
});

/\*\*  
 \* 2\) Forzar headers no-cache en TODAS las respuestas REST  
 \*    (usa el servidor REST para enviar cabeceras correctamente)  
 \*/  
add\_filter('rest\_pre\_serve\_request', function ($served, $result, $request, $server) {  
    // No-cache fuerte  
    $server-\>send\_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');  
    $server-\>send\_header('Pragma', 'no-cache');  
    $server-\>send\_header('Expires', '0');

    // Ayuda específica para LiteSpeed  
    $server-\>send\_header('X-LiteSpeed-Cache-Control', 'no-cache');

    // Evita mezclar respuestas autenticadas vs públicas  
    // (muy útil si usas tokens en Authorization o CORS)  
    $server-\>send\_header('Vary', 'Authorization,Origin');

    return $served;  
}, 10, 4);

# 7 \- Integración de Checkout Headless para Woo

**7 \- Integración de Checkout Headless para WooCommerce**

add\_action('template\_redirect', 'pharma\_handle\_headless\_handover');

function pharma\_handle\_headless\_handover() {  
    if (isset($\_GET\['saprix\_handover'\]) && $\_GET\['saprix\_handover'\] \== 'true') {  
          
        // Asegurar que WooCommerce y la sesión estén cargados  
        if (function\_exists('WC') && WC()-\>cart) {  
              
            // Si el usuario es invitado y no hay sesión, iniciarla  
            if (\!is\_user\_logged\_in() && WC()-\>session && \!WC()-\>session-\>has\_session()) {  
                WC()-\>session-\>set\_customer\_session\_cookie(true);  
            }

            // 1\. Limpiar carrito actual  
            WC()-\>cart-\>empty\_cart();  
              
            // 2\. Procesar Items  
            if (isset($\_GET\['items'\])) {  
                $items \= explode(',', $\_GET\['items'\]);  
                  
                foreach ($items as $item) {  
                    // Formato esperado: ID:QTY o VARIATION\_ID:QTY  
                    $parts \= explode(':', $item);  
                    $product\_id \= intval($parts\[0\]);  
                    $quantity \= isset($parts\[1\]) ? intval($parts\[1\]) : 1;  
                      
                    if ($product\_id \> 0 && $quantity \> 0\) {  
                        WC()-\>cart-\>add\_to\_cart($product\_id, $quantity);  
                    }  
                }  
            }  
              
            // 3\. Procesar Datos de Cliente (Pre-llenado)  
            if (isset($\_GET\['billing\_email'\])) {  
                $customer\_data \= array(  
                    'billing\_first\_name' \=\> sanitize\_text\_field($\_GET\['billing\_first\_name'\]),  
                    'billing\_last\_name'  \=\> sanitize\_text\_field($\_GET\['billing\_last\_name'\]),  
                    'billing\_email'      \=\> sanitize\_email($\_GET\['billing\_email'\]),  
                    'billing\_phone'      \=\> sanitize\_text\_field($\_GET\['billing\_phone'\]),  
                    'billing\_address\_1'  \=\> sanitize\_text\_field($\_GET\['billing\_address\_1'\]),  
                    'billing\_city'       \=\> sanitize\_text\_field($\_GET\['billing\_city'\]),  
                    'billing\_state'      \=\> sanitize\_text\_field($\_GET\['billing\_state'\]), // Dep maps to billing\_state  
                );  
                  
                // Guardar en sesión de WC para que aparezcan en el checkout  
                foreach ($customer\_data as $key \=\> $value) {  
                    // Solo setear si tiene valor para evitar borrar datos si el user ya estaba logueado  
                    if (\!empty($value) || \!is\_user\_logged\_in()) {  
                         WC()-\>customer-\>set\_props(array($key \=\> $value));  
                    }  
                }  
                WC()-\>customer-\>save();  
            }

            // 4\. Redirigir al Checkout (limpiando la URL)  
            wp\_redirect(wc\_get\_checkout\_url());  
            exit;  
        }  
    }  
}

# 8 \- Listing Home

**8 \- Listing Home**

// Shortcode simple: \[onsale\_ids\]  
add\_shortcode('onsale\_ids', function() {  
    if ( \! function\_exists('wc\_get\_product\_ids\_on\_sale') ) return '';

    $ids \= wc\_get\_product\_ids\_on\_sale(); // WooCommerce ya da todos los IDs en oferta

    if (empty($ids)) {  
        return 'No hay productos en descuento';  
    }

    return implode(', ', $ids);  
});

# 9 \- mb\_out\_of\_stock\_custom\_notice

**9 \- mb\_out\_of\_stock\_custom\_notice**

// Cambia el texto de disponibilidad cuando NO hay stock  
add\_filter( 'woocommerce\_get\_availability\_text', 'mb\_custom\_out\_of\_stock\_text', 10, 2 );  
function mb\_custom\_out\_of\_stock\_text( $text, $product ) {  
    if ( \! $product || $product-\>is\_in\_stock() ) {  
        return $text;  
    }

return 'Este producto no está disponible actualmente. Si deseas que revisemos su disponibilidad, comunícate con un asesor al número teléfono 6015934010\. \<br\>\<br\>\<a href="https://wa.me/576015934010" target="\_blank" rel="noopener noreferrer"\>Escribir por WhatsApp\</a\>';

}

// Agrega el link de WhatsApp debajo del resumen del producto cuando NO hay stock  
add\_action( 'woocommerce\_single\_product\_summary', 'mb\_custom\_out\_of\_stock\_whatsapp', 25 );  
function mb\_custom\_out\_of\_stock\_whatsapp() {

    // Aseguramos que existe la función de WooCommerce  
    if ( \! function\_exists( 'is\_product' ) || \! is\_product() ) {  
        return;  
    }

    global $product;

    if ( \! $product || $product-\>is\_in\_stock() ) {  
        return;  
    }

    // WhatsApp en formato internacional: 57 \+ número (sin \+, espacios ni guiones)  
    $whatsapp\_url \= 'https://wa.me/576015934010?text=' . urlencode(  
        'Hola, quiero consultar por la disponibilidad del producto: ' . $product-\>get\_name()  
    );

    echo '\<div class="woocommerce-info" style="margin-top:15px;"\>';  
    echo 'Este producto no está disponible actualmente. Si deseas que revisemos su disponibilidad, comunícate con un asesor al número teléfono \<strong\>6015934010\</strong\>.';  
    echo '\<br\>\<a href="' . esc\_url( $whatsapp\_url ) . '" target="\_blank" rel="noopener noreferrer" style="text-decoration:underline;"\>Escribir por WhatsApp\</a\>';  
    echo '\</div\>';  
}

# 10 \- Menu Ordenes de Clientes

**10 \- Menu Ordenes de Clientes**

// \===== Helpers de acceso/lookup \=====  
function cl\_get\_order\_from\_context( $maybe\_id \= 0 ){  
    // 0\) Global seteada en template\_redirect  
    global $cl\_current\_order;  
    if ( $cl\_current\_order instanceof WC\_Order ) {  
        return $cl\_current\_order;  
    }

    // 1\) Atributo  
    $id \= absint( $maybe\_id );  
    if ( $id ) {  
        $o \= wc\_get\_order( $id );  
        if ( $o ) return $o;  
    }  
    // 2\) ?order\_id=XX  
    if ( isset($\_GET\['order\_id'\]) ) {  
        $id \= absint($\_GET\['order\_id'\]);  
        if ( $id ) {  
            $o \= wc\_get\_order( $id );  
            if ( $o ) return $o;  
        }  
    }  
    // 3\) Post shop\_order actual  
    if ( is\_singular('shop\_order') ) {  
        $o \= wc\_get\_order( get\_the\_ID() );  
        if ( $o ) return $o;  
    }  
    // 4\) Última orden del usuario logueado  
    if ( is\_user\_logged\_in() ) {  
        $orders \= wc\_get\_orders(\[  
            'customer\_id' \=\> get\_current\_user\_id(),  
            'limit'       \=\> 1,  
            'orderby'     \=\> 'date',  
            'order'       \=\> 'DESC',  
        \]);  
        if ( \! empty($orders) ) return $orders\[0\];  
    }  
    return null;  
}

function cl\_order\_user\_can\_view( $order ){  
    // Admins/gestores pueden ver todo  
    if ( current\_user\_can('manage\_woocommerce') || current\_user\_can('administrator') ) {  
        return true;  
    }  
    $current \= get\_current\_user\_id();  
    if ( $order-\>get\_user\_id() && $order-\>get\_user\_id() \=== $current ) return true;

    // Permite si coincide el email de facturación con el usuario actual  
    if ( is\_user\_logged\_in() ) {  
        $u \= wp\_get\_current\_user();  
        if ( $u && $u-\>user\_email ) {  
            return strtolower( $order-\>get\_billing\_email() ) \=== strtolower( $u-\>user\_email );  
        }  
    }  
    return false;  
}

// \===== Shortcode: \[cl\_order\_field\] \=====  
add\_shortcode('cl\_order\_field', function( $atts ){  
    $a \= shortcode\_atts(\[  
        'field'       \=\> '',  
        'order\_id'    \=\> 0,  
        'before'      \=\> '',  
        'after'       \=\> '',  
        'date\_format' \=\> '', // ej: 'Y-m-d H:i'  
    \], $atts, 'cl\_order\_field' );

    if ( empty( $a\['field'\] ) ) return '';

    $order \= cl\_get\_order\_from\_context( $a\['order\_id'\] );  
    if ( \! $order ) return '';

    if ( \! cl\_order\_user\_can\_view( $order ) ) {  
        return ''; // o devuelve un mensaje si prefieres  
    }

    $field \= strtolower( trim( $a\['field'\] ) );  
    $val   \= '';

    switch ( $field ) {  
        // \--- IDENTIFICADORES / ESTADO / FECHA / TOTALES (igual que antes) \---  
        case 'id':               $val \= $order-\>get\_id(); break;  
        case 'number':  
        case 'order\_number':     $val \= $order-\>get\_order\_number(); break;  
        case 'status':           $val \= wc\_get\_order\_status\_name( $order-\>get\_status() ); break;    
		case 'date':  
		case 'date\_created':  
			$dt \= $order-\>get\_date\_created(); // WC\_DateTime | null  
			if ( $dt ) {  
				if ( \! empty( $a\['date\_format'\] ) ) {  
					// Usa el propio WC\_DateTime para respetar bien la zona horaria  
					$val \= $dt-\>date\_i18n( $a\['date\_format'\] );  
				} else {  
					// Formato por defecto de WooCommerce  
					$val \= wc\_format\_datetime( $dt );  
				}  
			}  
			break;  
			  
        case 'total':            $val \= $order-\>get\_formatted\_order\_total(); break;  
        case 'subtotal':         $val \= wc\_price( (float)$order-\>get\_subtotal() \+ (float)$order-\>get\_cart\_tax() ); break;  
        case 'shipping\_total':   $val \= wc\_price( (float)$order-\>get\_shipping\_total() \+ (float)$order-\>get\_shipping\_tax() ); break;  
        case 'discount\_total':   $val \= wc\_price( (float)$order-\>get\_discount\_total() \+ (float)$order-\>get\_discount\_tax() ); break;

        // \--- PAGO \---  
		case 'payment\_method\_title':  
			// Intenta obtener el título legible guardado en la orden  
			$val \= $order-\>get\_payment\_method\_title();

			// Fallback: si está vacío, busca el título en los gateways activos  
			if ( empty($val) ) {  
				$pm\_id \= $order-\>get\_payment\_method(); // ej: 'cod', 'bacs', 'woo-cc'  
				if ( $pm\_id && function\_exists('WC') ) {  
					$gateways \= WC()-\>payment\_gateways() ? WC()-\>payment\_gateways-\>payment\_gateways() : \[\];  
					if ( isset($gateways\[$pm\_id\]) ) {  
						$val \= $gateways\[$pm\_id\]-\>get\_title();  
					}  
				}  
			}  
			break;

		case 'payment\_method\_id':  
			// Devuelve el ID técnico del método (ej: 'cod', 'stripe', 'bacs')  
			$val \= $order-\>get\_payment\_method();  
			break;

		case 'payment\_method':  
			// Versión combinada: primero título legible, si no hay, devuelve ID  
			$val \= $order-\>get\_payment\_method\_title();  
			if ( empty($val) ) {  
				$val \= $order-\>get\_payment\_method();  
			}  
			if ( empty($val) ) {  
				$pm\_id \= $order-\>get\_payment\_method();  
				if ( $pm\_id && function\_exists('WC') ) {  
					$gateways \= WC()-\>payment\_gateways() ? WC()-\>payment\_gateways-\>payment\_gateways() : \[\];  
					if ( isset($gateways\[$pm\_id\]) ) {  
						$val \= $gateways\[$pm\_id\]-\>get\_title();  
					}  
				}  
			}  
			break;

		case 'transaction\_id':  
			$val \= $order-\>get\_transaction\_id();  
			break;

        // \--- ENVÍO (formateado completo) \---  
        case 'shipping\_address':  
            $val \= $order-\>get\_formatted\_shipping\_address(); break;

        // \--- ENVÍO (campos sueltos) \---  
        case 'shipping\_name':        $val \= trim( $order-\>get\_shipping\_first\_name() . ' ' . $order-\>get\_shipping\_last\_name() ); break;  
        case 'shipping\_address\_1':   $val \= $order-\>get\_shipping\_address\_1(); break;  
        case 'shipping\_address\_2':   $val \= $order-\>get\_shipping\_address\_2(); break;  
        case 'shipping\_city':        $val \= $order-\>get\_shipping\_city(); break;  
        case 'shipping\_state':       $val \= $order-\>get\_shipping\_state(); break;  
        case 'shipping\_postcode':    $val \= $order-\>get\_shipping\_postcode(); break;  
        case 'shipping\_country':     $val \= $order-\>get\_shipping\_country(); break;

        // Nombres legibles para estado/país (envío)  
        case 'shipping\_state\_name':  
            $state  \= $order-\>get\_shipping\_state();  
            $country= $order-\>get\_shipping\_country();  
            $val \= $state;  
            if ( $country && $state && function\_exists('WC') ) {  
                $states \= WC()-\>countries-\>get\_states( $country );  
                if ( is\_array($states) && isset($states\[$state\]) ) $val \= $states\[$state\];  
            }  
            break;  
        case 'shipping\_country\_name':  
            $code \= $order-\>get\_shipping\_country();  
            $val \= $code;  
            if ( $code && function\_exists('WC') ) {  
                $countries \= WC()-\>countries-\>get\_countries();  
                if ( isset($countries\[$code\]) ) $val \= $countries\[$code\];  
            }  
            break;

        // Dirección de envío compacta en una línea (sin nombre)  
        case 'shipping\_address\_plain':  
            $parts \= array\_filter(\[  
                $order-\>get\_shipping\_address\_1(),  
                $order-\>get\_shipping\_address\_2(),  
                $order-\>get\_shipping\_city(),  
                $order-\>get\_shipping\_state(),  
                $order-\>get\_shipping\_postcode(),  
            \]);  
            $val \= implode(', ', $parts);  
            break;

        // \--- FACTURACIÓN (formateado completo) \---  
        case 'billing\_address':  
            $val \= $order-\>get\_formatted\_billing\_address(); break;

        // \--- FACTURACIÓN (campos sueltos) \---  
        case 'billing\_name':       $val \= trim( $order-\>get\_billing\_first\_name() . ' ' . $order-\>get\_billing\_last\_name() ); break;  
        case 'billing\_email':      $val \= $order-\>get\_billing\_email(); break;  
        case 'billing\_phone':      $val \= $order-\>get\_billing\_phone(); break;  
        case 'billing\_address\_1':  $val \= $order-\>get\_billing\_address\_1(); break;  
        case 'billing\_address\_2':  $val \= $order-\>get\_billing\_address\_2(); break;  
        case 'billing\_city':       $val \= $order-\>get\_billing\_city(); break;  
        case 'billing\_state':      $val \= $order-\>get\_billing\_state(); break;  
        case 'billing\_postcode':   $val \= $order-\>get\_billing\_postcode(); break;  
        case 'billing\_country':    $val \= $order-\>get\_billing\_country(); break;

        // Nombres legibles para estado/país (facturación)  
        case 'billing\_state\_name':  
            $state  \= $order-\>get\_billing\_state();  
            $country= $order-\>get\_billing\_country();  
            $val \= $state;  
            if ( $country && $state && function\_exists('WC') ) {  
                $states \= WC()-\>countries-\>get\_states( $country );  
                if ( is\_array($states) && isset($states\[$state\]) ) $val \= $states\[$state\];  
            }  
            break;  
			  
        case 'billing\_country\_name':  
            $code \= $order-\>get\_billing\_country();  
            $val \= $code;  
            if ( $code && function\_exists('WC') ) {  
                $countries \= WC()-\>countries-\>get\_countries();  
                if ( isset($countries\[$code\]) ) $val \= $countries\[$code\];  
            }  
            break;

        // Facturación compacta en una línea  
        case 'billing\_address\_plain':  
            $parts \= array\_filter(\[  
                $order-\>get\_billing\_address\_1(),  
                $order-\>get\_billing\_address\_2(),  
                $order-\>get\_billing\_city(),  
                $order-\>get\_billing\_state(),  
                $order-\>get\_billing\_postcode(),  
            \]);  
            $val \= implode(', ', $parts);  
            break;  
			  
		case 'date\_completed':  
			if ( $order-\>has\_status('completed') ) {  
				$dt \= $order-\>get\_date\_completed(); // WC\_DateTime|null  
				if ( $dt ) {  
					$val \= $a\['date\_format'\]   
						? date\_i18n( $a\['date\_format'\], $dt-\>getTimestamp() )  
						: wc\_format\_datetime( $dt );  
				} else {  
					$val \= 'Producto aún no ha sido entregado';  
				}  
			} else {  
				$val \= 'Producto aún no ha sido entregado';  
			}  
			break;

        // \--- Cupones / Ítems (resúmenes simples) \---  
        case 'coupons':  
            $codes \= $order-\>get\_coupon\_codes();  
            $val \= implode(', ', $codes);  
            break;  
        case 'items\_count':  
            $val \= $order-\>get\_item\_count();  
            break;  
        case 'items\_names':  
            $names \= \[\];  
            foreach ( $order-\>get\_items() as $it ) { $names\[\] \= $it-\>get\_name(); }  
            $val \= implode( ', ', $names );  
            break;  
		  
		case 'items\_details':  
			$lines \= \[\];  
			foreach ( $order-\>get\_items() as $it ) {  
				$name  \= $it-\>get\_name();  
				$qty   \= $it-\>get\_quantity();  
				$total \= $it-\>get\_total() \+ $it-\>get\_total\_tax();

				// Precio sin HTML:  
				$price\_text \= wp\_strip\_all\_tags( wc\_price( $total, \['currency' \=\> $order-\>get\_currency()\] ) );

				$lines\[\] \= sprintf( '%s × %d — %s', $name, $qty, $price\_text );  
			}  
			// usa '\<br\>' si lo quieres en varias líneas  
			$val \= implode( ', ', $lines );  
			break;  
			  
		case 'items\_table':  
			// Construye una tabla HTML con Producto / Cant. / Unitario / Total  
			$rows \= \[\];  
			foreach ( $order-\>get\_items() as $it ) {  
				$name     \= esc\_html( $it-\>get\_name() );  
				$qty      \= (int) $it-\>get\_quantity();  
				$line\_tot \= (float) $it-\>get\_total() \+ (float) $it-\>get\_total\_tax(); // total de la línea c/ impuestos  
				$unit     \= $qty \> 0 ? $line\_tot / $qty : 0;

				$rows\[\] \= sprintf(  
					'\<tr\>  
						\<td class="cl-col-name"\>%s\</td\>  
						\<td class="cl-col-qty" style="text-align:center;"\>%d\</td\>  
						\<td class="cl-col-unit" style="text-align:right;"\>%s\</td\>  
						\<td class="cl-col-total" style="text-align:right;"\>%s\</td\>  
					\</tr\>',  
					$name,  
					$qty,  
					wc\_price( $unit,  \['currency' \=\> $order-\>get\_currency()\] ),  
					wc\_price( $line\_tot, \['currency' \=\> $order-\>get\_currency()\] )  
				);  
			}

			$val \= '\<table class="cl-order-items" style="width:100%;border-collapse:collapse;"\>  
				\<thead\>  
					\<tr\>  
						\<th style="text-align:left;border-bottom:1px solid \#eee;padding:6px 0;"\>Producto\</th\>  
						\<th style="text-align:center;border-bottom:1px solid \#eee;padding:6px 0;white-space:nowrap;"\>Cant.\</th\>  
						\<th style="text-align:right;border-bottom:1px solid \#eee;padding:6px 0;white-space:nowrap;"\>Unitario\</th\>  
						\<th style="text-align:right;border-bottom:1px solid \#eee;padding:6px 0;white-space:nowrap;"\>Total\</th\>  
					\</tr\>  
				\</thead\>  
				\<tbody\>' . implode('', $rows) . '\</tbody\>  
			\</table\>';  
			break;

			  
        default:  
            $maybe \= $order-\>get\_meta( $field );  
            if ( \! empty( $maybe ) || $maybe \=== '0' ) { $val \= $maybe; }  
            else { $val \= ''; }  
    }  
	  
    // Sanitiza/escapa según tipo  
	if ( is\_string( $val ) ) {  
		$allow\_html\_fields \= \['total','billing\_address','shipping\_address','items\_table'\];  
		if ( in\_array( $field, $allow\_html\_fields, true ) || str\_ends\_with( $field, '\_html' ) ) {  
			$val \= wp\_kses\_post( $val );  
		} else {  
			$val \= esc\_html( $val );  
		}  
	}

    if ( $val \=== '' || $val \=== null ) return '';  
    return $a\['before'\] . $val . $a\['after'\];  
});

// Pagina de Resumen de la Orden  
// \=========================  
// Ajusta estos slugs/URLs:  
$CL\_ORDER\_SUMMARY\_SLUG \= 'resumen-de-orden'; // slug de tu página de resumen  
$CL\_LOGIN\_URL  \= 'https://tienda.pharmaplus.com.co/login/';  
$CL\_ACCOUNT\_URL= 'https://tienda.pharmaplus.com.co/cuenta/';  
// \=========================

/\*\* URL actual (para redirect\_to) \*/  
function cl\_current\_url(){  
    $scheme \= is\_ssl() ? 'https' : 'http';  
    $host   \= $\_SERVER\['HTTP\_HOST'\] ?? '';  
    $uri    \= $\_SERVER\['REQUEST\_URI'\] ?? '';  
    return $host && $uri ? esc\_url\_raw( $scheme . '://' . $host . $uri ) : home\_url('/');  
}

/\*\* Consigue WC\_Order según ?order\_id (o lo que tengas ya) \*/  
function cl\_get\_order\_from\_request(){  
    $order\_id \= isset($\_GET\['order\_id'\]) ? absint($\_GET\['order\_id'\]) : 0;  
    if ( \! $order\_id ) return null;  
    $o \= wc\_get\_order($order\_id);  
    return $o ?: null;  
}

/\*\* ¿El usuario actual puede ver esta orden? (dueño o mismo email de facturación) \*/  
function cl\_user\_can\_view\_order( $order ){  
    if ( \! $order ) return false;

    // Admins/gestores: acceso total  
    if ( current\_user\_can('manage\_woocommerce') || current\_user\_can('administrator') ) {  
        return true;  
    }

    $current\_id \= get\_current\_user\_id();  
    if ( $current\_id && $order-\>get\_user\_id() && (int)$order-\>get\_user\_id() \=== (int)$current\_id ) {  
        return true;  
    }

    // Tolerancia por email (por si alguna orden fue de invitado)  
    if ( is\_user\_logged\_in() ) {  
        $u \= wp\_get\_current\_user();  
        if ( $u && $u-\>user\_email ) {  
            return strtolower($order-\>get\_billing\_email()) \=== strtolower($u-\>user\_email);  
        }  
    }  
    return false;  
}

/\*\* Redirecciones de seguridad en la página de resumen \*/  
add\_action( 'template\_redirect', function() use ( $CL\_ORDER\_SUMMARY\_SLUG, $CL\_LOGIN\_URL, $CL\_ACCOUNT\_URL ){  
    if ( \! is\_page( $CL\_ORDER\_SUMMARY\_SLUG ) ) return;

    // Usa contexto amplio (acepta ?order\_id, shop\_order actual, o última del usuario)  
    $order \= cl\_get\_order\_from\_context();

    if ( \! $order ) {  
        wp\_safe\_redirect( $CL\_ACCOUNT\_URL );  
        exit;  
    }

    if ( \! is\_user\_logged\_in() ) {  
        $login \= add\_query\_arg( 'redirect\_to', rawurlencode( cl\_current\_url() ), $CL\_LOGIN\_URL );  
        wp\_safe\_redirect( $login );  
        exit;  
    }

    if ( \! cl\_user\_can\_view\_order( $order ) ) {  
        wp\_safe\_redirect( $CL\_ACCOUNT\_URL );  
        exit;  
    }

    // ✅ Puente de contexto para shortcodes en esta carga  
    global $cl\_current\_order;  
    $cl\_current\_order \= $order;  
});

// Url boton  
//Shortcode \[cl\_order\_url order\_id="123"\]  
add\_shortcode('cl\_order\_url', function( $atts ){  
    $a \= shortcode\_atts(\[  
        'order\_id' \=\> 0,  
    \], $atts, 'cl\_order\_url');

    $order\_id \= absint($a\['order\_id'\]);  
    if ( \! $order\_id ) return '';

    $url \= add\_query\_arg(  
        \['order\_id' \=\> $order\_id\],  
        home\_url('/resumen-de-orden/')  
    );

    return esc\_url($url);  
});

# 11 \- Nombre Receta médica cond V2

**11 \- Nombre Receta médica condicional en checkout  V2**

/\*\*  
 \* Receta médica condicional en checkout (pre-subida por AJAX, obligatorio en submit)  
 \*/

if ( \! defined('ABSPATH') ) exit;

const CL\_RX\_META\_KEY   \= '\_needs\_rx';  
const CL\_RX\_FIELD\_KEY  \= 'cl\_rx\_upload';  
const CL\_RX\_HIDDEN\_KEY \= 'cl\_rx\_attachment\_id';

/\*\* ¿El carrito requiere receta? \*/  
function cl\_rx\_cart\_requires\_prescription(): bool {  
	if ( is\_admin() && \! defined('DOING\_AJAX') ) return false;  
	if ( \! WC()-\>cart ) return false;

	foreach ( WC()-\>cart-\>get\_cart() as $item ) {  
		$product \= $item\['data'\] ?? null;  
		if ( \! $product ) continue;

		$raw \= get\_post\_meta( $product-\>get\_id(), CL\_RX\_META\_KEY, true );  
		$val \= is\_string($raw) ? strtolower(trim($raw)) : $raw;  
		if ( $val \=== true || $val \=== 'true' || $val \=== 'yes' || $val \=== '1' || $val \=== 'on' || $val \=== 1 ) {  
			return true;  
		}  
	}  
	return false;  
}

/\*\* Pintar el campo file debajo de "Notas del pedido" \*/  
function cl\_rx\_render\_field\_once(){  
	static $printed \= false;  
	if ( $printed ) return; $printed \= true;

	$requires \= cl\_rx\_cart\_requires\_prescription();  
	?\>  
	\<p class="form-row form-row-wide thwcfe-input-field-wrapper" id="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>\_field"\>  
		\<label for="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>"\>  
			\<?php esc\_html\_e('Fórmula médica (PDF/JPG/PNG)', 'cl'); ?\>  
			\<?php if ( $requires ): ?\>\<abbr class="required" title="obligatorio"\>\*\</abbr\>\<?php endif; ?\>  
		\</label\>  
		\<span class="woocommerce-input-wrapper"\>  
			\<input  
				type="file"  
				class="input-text thwcfe-input-field"  
				name="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>"  
				id="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>"  
				accept="application/pdf,image/jpeg,image/png"  
				\<?php /\* Nota: no usamos HTML5 required para evitar el bloqueo del navegador y así mostrar el error de Woo arriba \*/ ?\>  
			/\>  
			\<input type="hidden" name="\<?php echo esc\_attr(CL\_RX\_HIDDEN\_KEY); ?\>" id="\<?php echo esc\_attr(CL\_RX\_HIDDEN\_KEY); ?\>" value=""\>  
			\<small id="cl-rx-msg" class="description"\>  
				\<?php echo $requires  
					? esc\_html\_\_('Obligatorio por productos con prescripción. Si no la subes, verás un error al finalizar.', 'cl')  
					: esc\_html\_\_('Sólo se solicitará si el pedido contiene productos con prescripción.', 'cl'); ?\>  
			\</small\>  
		\</span\>  
	\</p\>  
	\<?php  
}  
add\_action('woocommerce\_after\_order\_notes', 'cl\_rx\_render\_field\_once', 10);  
add\_action('woocommerce\_checkout\_after\_customer\_details', 'cl\_rx\_render\_field\_once', 99);

/\*\* JS: multipart, pre-subida por wc-ajax, sin deshabilitar el botón \*/  
add\_action('wp\_footer', function(){  
	if ( \! is\_checkout() ) return;  
	$needs \= cl\_rx\_cart\_requires\_prescription() ? 'true' : 'false';  
	?\>  
	\<script\>  
	(function($){  
		function ensureMultipart(){  
			var f \= document.querySelector('form.checkout');  
			if (f){  
				f.setAttribute('enctype', 'multipart/form-data');  
				f.setAttribute('encoding', 'multipart/form-data');  
			}  
		}  
		function ajaxUrl(endpoint){  
			if (window.wc\_checkout\_params && wc\_checkout\_params.wc\_ajax\_url){  
				return wc\_checkout\_params.wc\_ajax\_url.toString().replace('%%endpoint%%', endpoint);  
			}  
			return (window.location.origin || '') \+ '/?wc-ajax=' \+ endpoint;  
		}  
		function setMsg(text, isError){  
			var el \= document.getElementById('cl-rx-msg');  
			if(\!el) return;  
			el.textContent \= text || '';  
			el.style.color \= isError ? 'red' : '';  
		}

		function relocateField(){  
			var field  \= document.getElementById('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>\_field');  
			var target \= document.querySelector('.woocommerce-shipping-fields \#ship-to-different-address');  
			if (field && target && target.parentNode){  
				target.parentNode.insertBefore(field, target);  
			}  
		}

		function toggleUI(){  
			ensureMultipart();  
			var field \= document.getElementById('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>\_field');  
			if(field) field.style.display \= (\<?php echo $needs; ?\>) ? '' : 'none';  
			// Importante: no deshabilitamos \#place\_order  
		}

		function bindUpload(){  
			var input  \= document.getElementById('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>');  
			var hidden \= document.getElementById('\<?php echo esc\_js(CL\_RX\_HIDDEN\_KEY); ?\>');  
			if(\!input) return;

			input.removeEventListener('change', window.\_\_cl\_rx\_on\_change || function(){});  
			window.\_\_cl\_rx\_on\_change \= function(){  
				setMsg('', false);  
				if (\!input.files || \!input.files\[0\]) { if(hidden) hidden.value=''; toggleUI(); return; }

				var file \= input.files\[0\];  
				var okTypes \= \['application/pdf','image/jpeg','image/png'\];  
				if (okTypes.indexOf(file.type) \=== \-1){  
					setMsg('Formato no permitido. Sube PDF, JPG o PNG.', true);  
					input.value \= '';  
					if(hidden) hidden.value='';  
					toggleUI();  
					return;  
				}  
				if (file.size \> 10 \* 1024 \* 1024){  
					setMsg('El archivo supera 10MB. Reduce el tamaño e inténtalo de nuevo.', true);  
					input.value \= '';  
					if(hidden) hidden.value='';  
					toggleUI();  
					return;  
				}

				var fd \= new FormData();  
				fd.append('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>', file);

				setMsg('Cargando archivo...', false);

				$.ajax({  
					url: ajaxUrl('cl\_rx\_upload'),  
					type: 'POST',  
					data: fd,  
					contentType: false,  
					processData: false,  
					success: function(resp){  
						if (resp && resp.success && resp.data && resp.data.attachment\_id){  
							if(hidden) hidden.value \= resp.data.attachment\_id;  
							setMsg('Archivo cargado correctamente.', false);  
						} else {  
							var msg \= (resp && resp.data && resp.data.message) ? resp.data.message : 'Error al subir el archivo.';  
							setMsg(msg, true);  
							if(hidden) hidden.value='';  
							input.value='';  
						}  
					},  
					error: function(){  
						setMsg('Error de red al subir el archivo.', true);  
						if(hidden) hidden.value='';  
						input.value='';  
					},  
					complete: function(){  
						toggleUI(); // sin tocar el botón  
					}  
				});  
			};  
			input.addEventListener('change', window.\_\_cl\_rx\_on\_change);  
		}

		function initCycle(){  
			relocateField();  
			toggleUI();  
			bindUpload();  
		}

		document.addEventListener('DOMContentLoaded', initCycle);  
		jQuery(document.body).on('updated\_checkout', initCycle);  
	})(jQuery);  
	\</script\>  
	\<?php  
});

/\*\*  
 \* VALIDACIÓN servidor: bloquear si falta (error arriba del checkout)  
 \*/  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
	if ( \! cl\_rx\_cart\_requires\_prescription() ) return;

	$att\_id \= isset($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) ? absint($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) : 0;

	if ( \! $att\_id || get\_post\_type($att\_id) \!== 'attachment' ) {  
		// Error (bloquea el checkout y muestra notice rojo arriba)  
		$errors-\>add( 'cl\_rx\_missing', \_\_( 'Falta subir fórmula médica', 'cl' ) );  
		// También podrías usar: wc\_add\_notice( 'Falta subir fórmula médica', 'error' );  
		// pero el $errors-\>add es lo más estándar aquí.  
	}  
}, 10, 2);

/\*\* CREAR PEDIDO: guardar attachment (si existe) y flag \_cl\_rx\_missing (1/0) \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order ){  
	$requires \= cl\_rx\_cart\_requires\_prescription();  
	$att\_id   \= isset($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) ? absint($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) : 0;

	$missing \= ( $requires && ( \! $att\_id || get\_post\_type($att\_id) \!== 'attachment' ) ) ? 1 : 0;  
	$order-\>update\_meta\_data('\_cl\_rx\_missing', $missing);

	if ( \! $requires || \! $att\_id ) return;

	// Actualiza attachment y lo asocia al pedido  
	wp\_update\_post(array(  
		'ID'          \=\> $att\_id,  
		'post\_title'  \=\> sprintf( 'Fórmula médica – Pedido \#%s', $order-\>get\_order\_number() ),  
		'post\_parent' \=\> $order-\>get\_id(),  
	));

	$url \= wp\_get\_attachment\_url($att\_id);  
	$order-\>update\_meta\_data('\_cl\_rx\_attachment\_id', $att\_id);  
	$order-\>update\_meta\_data('\_cl\_rx\_attachment\_url', esc\_url\_raw($url));  
}, 20);

/\*\* Chip UX en carrito (se mantiene) \*/  
add\_filter('woocommerce\_cart\_item\_name', function( $name, $cart\_item ){  
	$product \= $cart\_item\['data'\] ?? null;  
	if ( \! $product ) return $name;  
	$raw \= get\_post\_meta( $product-\>get\_id(), CL\_RX\_META\_KEY, true );  
	$val \= is\_string($raw) ? strtolower(trim($raw)) : $raw;  
	if ( $val \=== true || $val \=== 'true' || $val \=== 'yes' || $val \=== '1' || $val \=== 'on' || $val \=== 1 ) {  
		$name .= '\<br\>\<small style="margin-top:4px;padding:2px 6px;border:1px solid currentColor;border-radius:4px"\>'  
		       . esc\_html\_\_('Requiere fórmula médica', 'cl') . '\</small\>';  
	}  
	return $name;  
}, 10, 2);

/\*\* Admin del pedido: link si hay archivo; si falta, texto claro \*/  
add\_action('woocommerce\_admin\_order\_data\_after\_billing\_address', function( $order ){  
	$att\_id   \= $order-\>get\_meta('\_cl\_rx\_attachment\_id');  
	$att\_url  \= $order-\>get\_meta('\_cl\_rx\_attachment\_url');  
	$missing  \= (int) $order-\>get\_meta('\_cl\_rx\_missing');  
	$url      \= $att\_url ?: ( $att\_id ? wp\_get\_attachment\_url($att\_id) : '' );

	echo '\<div class="cl-rx-admin"\>';  
	if ( $url ) {  
		echo '\<p\>\<strong\>' . esc\_html\_\_('Fórmula médica:', 'cl') . '\</strong\> '  
		   . '\<a href="' . esc\_url($url) . '" target="\_blank" rel="noopener"\>' . esc\_html\_\_('Ver archivo', 'cl') . '\</a\>\</p\>';  
	} elseif ( $missing \=== 1 ) {  
		echo '\<p\>\<strong\>' . esc\_html\_\_('Fórmula médica:', 'cl') . '\</strong\> '  
		   . esc\_html\_\_('El cliente no adjuntó fórmula médica.', 'cl') . '\</p\>';  
	}  
	echo '\</div\>';  
});

/\*\* Mi cuenta \> Pedido: si hay archivo, mostrar link \*/  
add\_action('woocommerce\_order\_details\_after\_order\_table', function( $order ){  
	$att\_id  \= $order-\>get\_meta('\_cl\_rx\_attachment\_id');  
	$att\_url \= $order-\>get\_meta('\_cl\_rx\_attachment\_url');  
	$url     \= $att\_url ?: ( $att\_id ? wp\_get\_attachment\_url($att\_id) : '' );  
	if ( $url ) {  
		echo '\<p\>\<strong\>' . esc\_html\_\_('Fórmula médica enviada:', 'cl') . '\</strong\> '  
		   . '\<a href="' . esc\_url($url) . '" target="\_blank" rel="noopener"\>' . esc\_html\_\_('Descargar', 'cl') . '\</a\>\</p\>';  
	}  
});

/\*\* Emails: si hay archivo, incluir link \*/  
add\_filter('woocommerce\_email\_order\_meta\_fields', function( $fields, $sent\_to\_admin, $order ){  
	$att\_id  \= $order-\>get\_meta('\_cl\_rx\_attachment\_id');  
	$att\_url \= $order-\>get\_meta('\_cl\_rx\_attachment\_url');  
	$url     \= $att\_url ?: ( $att\_id ? wp\_get\_attachment\_url($att\_id) : '' );  
	if ( $url ) {  
		$fields\['cl\_rx\_link'\] \= array(  
			'label' \=\> \_\_('Fórmula médica', 'cl'),  
			'value' \=\> '\<a href="' . esc\_url($url) . '"\>' . esc\_html\_\_('Ver archivo', 'cl') . '\</a\>',  
		);  
	}  
	return $fields;  
}, 10, 3);

/\*\* \==== WC-AJAX: subir archivo y crear attachment \==== \*/  
add\_action('wc\_ajax\_cl\_rx\_upload', 'cl\_rx\_ajax\_upload');  
add\_action('wc\_ajax\_nopriv\_cl\_rx\_upload', 'cl\_rx\_ajax\_upload');  
function cl\_rx\_ajax\_upload(){  
	if ( empty($\_FILES\[ CL\_RX\_FIELD\_KEY \]) || empty($\_FILES\[ CL\_RX\_FIELD\_KEY \]\['name'\]) ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('No se recibió archivo.', 'cl') ) );  
	}

	$file \= $\_FILES\[ CL\_RX\_FIELD\_KEY \];

	$allowed\_mimes \= array('application/pdf','image/jpeg','image/png');  
	if ( empty($file\['type'\]) || \! in\_array($file\['type'\], $allowed\_mimes, true) ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('Formato no permitido. Sube PDF, JPG o PNG.', 'cl') ) );  
	}  
	if ( \! empty($file\['size'\]) && $file\['size'\] \> 10 \* 1024 \* 1024 ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('El archivo supera 10MB.', 'cl') ) );  
	}

	require\_once ABSPATH . 'wp-admin/includes/file.php';  
	require\_once ABSPATH . 'wp-admin/includes/media.php';  
	require\_once ABSPATH . 'wp-admin/includes/image.php';

	$upload \= wp\_handle\_upload( $file, array( 'test\_form' \=\> false ) );  
	if ( isset($upload\['error'\]) ) {  
		wp\_send\_json\_error( array( 'message' \=\> $upload\['error'\] ) );  
	}

	$attachment\_id \= wp\_insert\_attachment( array(  
		'post\_mime\_type' \=\> $upload\['type'\],  
		'post\_title'     \=\> 'Fórmula médica (pre-subida)',  
		'post\_content'   \=\> '',  
		'post\_status'    \=\> 'inherit',  
	), $upload\['file'\] );

	if ( is\_wp\_error($attachment\_id) ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('No se pudo crear el adjunto.', 'cl') ) );  
	}

	wp\_update\_attachment\_metadata( $attachment\_id, wp\_generate\_attachment\_metadata( $attachment\_id, $upload\['file'\] ) );  
	wp\_send\_json\_success( array(  
		'attachment\_id' \=\> $attachment\_id,  
		'url'           \=\> $upload\['url'\],  
	) );  
}

# 12 \- Oferta

**12 \- Oferta**

.woocommerce span.onsale {  
  background-color: \#0E8F46;  
  color: \#fff \!important;  
  width: 80px;            /\* ← cambia este valor para hacerlo más grande/pequeño \*/  
  height: 55px;           /\* mismo valor que width \*/  
  /\*padding: 0 \!important;  /\* evita que se deforme (ovalo) \*/  
  display: inline-flex;  
  align-items: center;  
  justify-content: center;  
  border-radius: 100%;               
}

# 13 \- Poput Cart

**13 \- Poput Cart**

// Guarda el conteo inicial del carrito en una variable JS  
add\_action('wp\_footer', function () {  
    if ( \! function\_exists('WC') || \! WC()-\>cart ) return;  
    $initial \= (int) WC()-\>cart-\>get\_cart\_contents\_count();  
    ?\>  
    \<div id="cl-cart-sensor" data-count="\<?php echo $initial; ?\>" style="display:none"\>\</div\>  
    \<script\>  
      (function(){ window.\_\_CL\_CART\_COUNT\_\_ \= \<?php echo $initial; ?\>; })();  
    \</script\>  
    \<?php  
});

// ABRE el popup si el conteo del carrito aumentó  
add\_filter('woocommerce\_add\_to\_cart\_fragments', function ($fragments) {  
    if ( \! function\_exists('WC') || \! WC()-\>cart ) return $fragments;

    $popup\_id  \= 9779; // \<-- REEMPLAZA por el ID de tu popup  
    $new\_count \= (int) WC()-\>cart-\>get\_cart\_contents\_count();

    ob\_start(); ?\>  
      \<div id="cl-cart-sensor" data-count="\<?php echo $new\_count; ?\>" style="display:none"\>\</div\>  
      \<script\>  
      (function(){  
        var NEW  \= \<?php echo (int) $new\_count; ?\>;  
        var PREV \= parseInt(window.\_\_CL\_CART\_COUNT\_\_ || 0, 10);  
        window.\_\_CL\_CART\_COUNT\_\_ \= NEW; // actualizar siempre

        if (NEW \> PREV) {  
          var tries \= 0, max \= 25;  
          (function open(){  
            if (document.body.classList.contains('elementor-popup-modal-open')) return; // evita doble  
            if (window.elementorProFrontend && elementorProFrontend.modules && elementorProFrontend.modules.popup) {  
              elementorProFrontend.modules.popup.showPopup({ id: \<?php echo (int) $popup\_id; ?\> });  
            } else if (++tries \< max) {  
              setTimeout(open, 80);  
            }  
          })();  
        }  
      })();  
      \</script\>  
    \<?php  
    $fragments\['\#cl-cart-sensor'\] \= ob\_get\_clean();  
    return $fragments;  
});

// Refrescar el contenido del shortcode \[cl\_cart\_products\] en popups o widgets  
add\_filter('woocommerce\_add\_to\_cart\_fragments', function($fragments) {  
    ob\_start();  
    echo do\_shortcode('\[cl\_cart\_products\]');  
    $fragments\['.cl-cart-products-wrapper'\] \= ob\_get\_clean();  
    return $fragments;  
});

// Shortcode: \[cl\_cart\_products\]  
add\_shortcode('cl\_cart\_products', function() {  
    if ( \! function\_exists('WC') || \! WC()-\>cart ) return '';

    $cart \= WC()-\>cart-\>get\_cart();  
    if ( empty($cart) ) {  
        return '\<div class="cl-cart-products-wrapper"\>\<p\>Tu carrito está vacío.\</p\>\</div\>';  
    }

    // Tomar SOLO el último producto añadido  
    $last\_item \= end($cart);  
    $product   \= $last\_item\['data'\] ?? null;  
    if ( \! $product || \! $product-\>exists() ) {  
        return '\<div class="cl-cart-products-wrapper"\>\<p\>Tu carrito está vacío.\</p\>\</div\>';  
    }

    $qty \= isset($last\_item\['quantity'\]) ? (int)$last\_item\['quantity'\] : 1;

    // HTML: imagen izquierda, texto derecha  
    $out  \= '\<div class="cl-cart-products-wrapper"\>';  
    $out .= '  \<div class="cl-cart-item"\>';  
    $out .= '    \<div class="cl-cart-img"\>'.$product-\>get\_image( 'woocommerce\_thumbnail' ).'\</div\>';  
    $out .= '    \<div class="cl-cart-info"\>';  
    $out .= '      \<div class="cl-title"\>'.esc\_html( $product-\>get\_name() ).'\</div\>';  
    $out .= '      \<div class="cl-qty"\>Cantidad: '.$qty.'\</div\>';  
    $out .= '    \</div\>';  
    $out .= '  \</div\>';  
    $out .= '\</div\>';

    // Estilos básicos (ajusta el width a tu gusto)  
    $out .= '\<style\>  
      .cl-cart-item{display:flex;align-items:center;gap:12px}  
      .cl-cart-img img{width:80px;height:auto;border-radius:6px} /\* ⇦ cambia 80px si quieres \*/  
      .cl-cart-info{flex:1;display:flex;flex-direction:column}  
      .cl-title{font-weight:600;font-size:14px;line-height:1.3;margin-bottom:4px}  
      .cl-qty{font-size:13px;color:\#555}  
    \</style\>';

    return $out;  
});

# 14 \- Porcentaje de descuento de productos

**14 \- Porcentaje de descuento de productos**

// Shortcode para mostrar el porcentaje de descuento de un producto  
function wc\_product\_discount\_percentage\_shortcode() {  
    global $product;

    if (\!$product) return '';

    // Obtener precios  
    $regular\_price \= (float) $product-\>get\_regular\_price();  
    $sale\_price    \= (float) $product-\>get\_sale\_price();

    // Si no hay precio en oferta o precios inválidos  
    if (\!$regular\_price || \!$sale\_price || $sale\_price \>= $regular\_price) {  
        return '0%';  
    }

    // Calcular descuento  
    $discount\_amount \= $regular\_price \- $sale\_price;  
    $discount\_percentage \= round(($discount\_amount / $regular\_price) \* 100);

    // Retornar porcentaje de descuento  
    return $discount\_percentage . '%';  
}  
add\_shortcode('product\_discount\_percentage', 'wc\_product\_discount\_percentage\_shortcode');

# 15 \- Shortcode Outstock

**15 \- Shortcode Outstock**

// Shortcode: \[wc\_outofstock\_ids sep=", "\] \[wc\_outofstock\_ids\]  
add\_shortcode('wc\_outofstock\_ids', function($atts){  
    // Atributos opcionales: separador  
    $atts \= shortcode\_atts(\[  
        'sep' \=\> ', ', // separador entre IDs  
    \], $atts, 'wc\_outofstock\_ids');

    // Asegurarnos de que WooCommerce está activo  
    if ( \! function\_exists('wc\_get\_products') ) {  
        return 'WooCommerce no está disponible.';  
    }

    // Obtener todos los productos SIN stock  
    $ids \= wc\_get\_products(\[  
        'status'       \=\> 'publish',  
        'stock\_status' \=\> 'outofstock',  
        'limit'        \=\> \-1,      // sin límite  
        'return'       \=\> 'ids',   // solo IDs  
    \]);

    if (empty($ids)) {  
        return 'No hay productos sin stock.';  
    }

    // Devolver como texto "12, 23, 45"  
    return implode($atts\['sep'\], $ids);  
});

# 16 \- Shortcode Productos (Oferta)

**16 \- Shortcode Productos (Oferta)**

// \[ids\_en\_oferta mode="all" output="csv" sep="," status="publish"\]  
// mode: all | parents | variations  
// output: csv | list | json  
add\_shortcode('ids\_en\_oferta', function($atts){  
    if (\!function\_exists('wc\_get\_product\_ids\_on\_sale')) return '';

    $a \= shortcode\_atts(\[  
        'mode'   \=\> 'all',      // all \= IDs tal cual (simples \+ variaciones)  
        'output' \=\> 'csv',      // csv | list | json  
        'sep'    \=\> ',',        // separador para csv  
        'status' \=\> 'publish',  // filtra por estado del post  
    \], $atts, 'ids\_en\_oferta');

    // 1\) Obtener IDs "on sale" (WooCommerce maneja fechas y reglas)  
    $ids \= wc\_get\_product\_ids\_on\_sale(); // incluye variaciones

    // 2\) Filtrar por estado  
    $ids \= array\_filter($ids, function($id) use ($a){  
        return get\_post\_status($id) \=== $a\['status'\];  
    });

    // 3\) Transformar según mode  
    if ($a\['mode'\] \=== 'parents') {  
        $mapped \= \[\];  
        foreach ($ids as $id) {  
            if (get\_post\_type($id) \=== 'product\_variation') {  
                $parent \= (int) wp\_get\_post\_parent\_id($id);  
                if ($parent) $mapped\[\] \= $parent;  
            } else {  
                $mapped\[\] \= (int) $id; // producto simple  
            }  
        }  
        $ids \= array\_values(array\_unique($mapped));  
    } elseif ($a\['mode'\] \=== 'variations') {  
        $ids \= array\_values(array\_filter($ids, function($id){  
            return get\_post\_type($id) \=== 'product\_variation';  
        }));  
    } else {  
        // all: dejar como viene (simples \+ variaciones)  
        $ids \= array\_map('intval', $ids);  
    }

    sort($ids);

    // 4\) Formatos de salida  
    switch (strtolower($a\['output'\])) {  
        case 'list':  
            $html \= '\<ul class="ids-en-oferta"\>';  
            foreach ($ids as $id) {  
                $html .= '\<li\>' . esc\_html($id) . '\</li\>';  
            }  
            $html .= '\</ul\>';  
            return $html;

        case 'json':  
            return '\<pre\>' . esc\_html(wp\_json\_encode($ids)) . '\</pre\>';

        case 'csv':  
        default:  
            return esc\_html(implode($a\['sep'\] . ' ', $ids));  
    }  
});

# 17 \- Shortcode Sección Medicamentos del Home

**17 \- Shortcode Sección Medicamentos del Home**

// Shortcode: \[product\_ids\_active\]  
add\_shortcode('product\_ids\_active', function($atts){  
    if ( \! function\_exists('wc\_get\_products') ) {  
        return '';  
    }

    $atts \= shortcode\_atts(\[  
        'meta\_key' \=\> '\_needs\_rx', // por si quieres cambiar la key  
        'sep'      \=\> ', ',        // separador de salida  
        'limit'    \=\> \-1,          // \-1 \= sin límite  
    \], $atts, 'product\_ids\_active');

    // Meta query para incluir productos donde \_needs\_rx NO sea '1'  
    // y también incluir cuando el meta no existe.  
    $meta\_query \= \[  
        'relation' \=\> 'OR',  
        \[  
            'key'     \=\> $atts\['meta\_key'\],  
            'compare' \=\> 'NOT EXISTS',  
        \],  
        \[  
            'key'     \=\> $atts\['meta\_key'\],  
            'value'   \=\> '1',  
            'compare' \=\> '\!=',  
            'type'    \=\> 'CHAR',  
        \],  
    \];

    // Consulta WooCommerce  
    $ids \= wc\_get\_products(\[  
        'status'       \=\> 'publish',           // "activos"  
        'stock\_status' \=\> 'instock',           // con inventario  
        'limit'        \=\> intval($atts\['limit'\]),  
        'return'       \=\> 'ids',  
        'meta\_query'   \=\> $meta\_query,  
    \]);

    if ( empty($ids) ) {  
        return '';  
    }

    return implode( $atts\['sep'\], array\_map('intval', $ids) );  
});

# 18 \- Single Product

**18 \- Single Product**

// En SINGLE PRODUCT, mostrar precios sin decimales pero conservar el HTML/estilos por defecto   
add\_filter( 'wc\_price\_args', function( $args ) {   
	if ( is\_product() ) {  
		$args\['decimals'\] \= 0; // sin decimales   
		// $args\['price\_format'\] \= '%1$s%2$s'; // opcional: formato por  
		//  defecto con símbolo \+ cantidad   
	}   
	return $args;   
}, 10 );

/\*\*  
 \* Metas virtuales para precios "Antes/Ahora".  
 \*  \- wciv\_antes\_ahora / wciv\_antes\_ahora\_inline  
 \*  \- wciv\_precio\_antes / wciv\_precio\_ahora  
 \*  \- wciv\_precio\_antes\_text  (AHORA tachado)  
 \*  \- wciv\_precio\_ahora\_text  
 \*  \- wciv\_precio\_antes\_raw / wciv\_precio\_ahora\_raw  
 \*/  
add\_filter('get\_post\_metadata', function ($value, $object\_id, $meta\_key, $single) {

    $keys \= \[  
        'wciv\_antes\_ahora','wciv\_antes\_ahora\_inline',  
        'wciv\_precio\_antes','wciv\_precio\_ahora',  
        'wciv\_precio\_antes\_text','wciv\_precio\_ahora\_text',  
        'wciv\_precio\_antes\_raw','wciv\_precio\_ahora\_raw',  
    \];  
    if ( \! in\_array($meta\_key, $keys, true) ) return null;

    $pt \= get\_post\_type($object\_id);  
    if ($pt \!== 'product' && $pt \!== 'product\_variation') return $single ? '' : \[''\];

    $product \= wc\_get\_product($object\_id);  
    if ( \! $product ) return $single ? '' : \[''\];

    // Precios (soporta variables)  
    if ( $product-\>is\_type('variable') ) {  
        $reg \= (float) $product-\>get\_variation\_regular\_price('min', false);  
        $sal \= $product-\>get\_variation\_sale\_price('min', false);  
        $sal \= ($sal \=== '' || $sal \=== null) ? null : (float) $sal;  
        $cur \= (float) $product-\>get\_variation\_price('min', false);  
    } else {  
        $reg \= (float) $product-\>get\_regular\_price();  
        $sal \= $product-\>get\_sale\_price();  
        $sal \= ($sal \=== '' || $sal \=== null) ? null : (float) $sal;  
        $cur \= (float) $product-\>get\_price();  
    }

    // ¿Está en oferta?  
    $has\_sale \= ($sal \!== null && $sal \> 0 && $reg \> 0 && $sal \< $reg) || ($cur \> 0 && $reg \> 0 && $cur \< $reg);

    // Formato sin decimales  
    $dec \= 0;  
    $reg\_html \= $reg \> 0 ? wc\_price($reg, \['decimals'=\>$dec\]) : '';  
    $sal\_html \= ($sal \!== null && $sal \> 0\) ? wc\_price($sal, \['decimals'=\>$dec\]) : '';  
    $cur\_html \= wc\_price($cur \> 0 ? $cur : $reg, \['decimals'=\>$dec\]);

    $lbl\_antes \= '\<span class="wciv-label wciv-antes"\>Antes\</span\>';  
    $lbl\_ahora \= '\<span class="wciv-label wciv-ahora"\>Ahora\</span\>';

    $antes\_html \= $has\_sale ? '\<del\>'.$reg\_html.'\</del\>' : '';  
    $ahora\_html \= $has\_sale ? ($sal\_html ?: $cur\_html) : ($reg\_html ?: $cur\_html);

    $antes\_raw \= $has\_sale ? $reg : 0;  
    $ahora\_raw \= $has\_sale ? ($sal ?? $cur) : ($reg ?: $cur);

    switch ($meta\_key) {  
        case 'wciv\_precio\_antes':       $out \= $antes\_html; break;  
        case 'wciv\_precio\_ahora':       $out \= '\<ins\>'.$ahora\_html.'\</ins\>'; break;

        // ⬇️ CORREGIDO: precio con \<del\> \+ "Antes"  
        case 'wciv\_precio\_antes\_text':  
			$out \= $has\_sale  
				? '\<span class="wciv-line wciv-before"\>'.$antes\_html.' \<span class="wciv-label wciv-antes"\>Antes\</span\>\</span\>'  
				: '';  
			break;

		case 'wciv\_precio\_ahora\_text':  
		// Si hay oferta \-\> "80 Ahora"; si no, solo el precio sin etiqueta  
			$out \= '\<span class="wciv-line wciv-now"\>'.$ahora\_html. ( $has\_sale ? ' \<span class="wciv-label wciv-ahora"\>Ahora\</span\>' : '' ) .'\</span\>';  
    		break;

        case 'wciv\_antes\_ahora\_inline':  
            $out \= $has\_sale  
                ? '\<span class="wciv-antes-ahora inline"\>\<span class="wciv-before"\>'.$antes\_html.' '.$lbl\_antes.'\</span\> \<span class="wciv-now"\>\<span\>'.$ahora\_html.'\</span\> '.$lbl\_ahora.'\</span\>\</span\>'  
                : '\<span class="wciv-antes-ahora inline"\>\<span class="wciv-now"\>\<span\>'.$ahora\_html.'\</span\> '.$lbl\_ahora.'\</span\>\</span\>';  
            break;

        case 'wciv\_antes\_ahora':  
            $out \= $has\_sale  
                ? '\<span class="wciv-antes-ahora"\>\<span class="wciv-line wciv-before"\>'.$antes\_html.' '.$lbl\_antes.'\</span\>\<span class="wciv-line wciv-now"\>\<span\>'.$ahora\_html.'\</span\> '.$lbl\_ahora.'\</span\>\</span\>'  
                : '\<span class="wciv-antes-ahora"\>\<span class="wciv-line wciv-now"\>\<span\>'.$ahora\_html.'\</span\> '.$lbl\_ahora.'\</span\>\</span\>';  
            break;

        case 'wciv\_precio\_antes\_raw':   $out \= $antes\_raw; break;  
        case 'wciv\_precio\_ahora\_raw':   $out \= $ahora\_raw; break;  
        default:                        $out \= '';  
    }

    return $single ? $out : \[$out\];  
}, 10, 4);

// (Opcional) estilos suaves para estas etiquetas  
add\_action('wp\_head', function () {  
    echo '\<style\>  
    .wciv-antes-ahora{display:inline-block; line-height:1.25;}  
    .wciv-antes-ahora .wciv-line{display:block; white-space:nowrap;}  
    .wciv-antes-ahora.inline .wciv-before{margin-right:.6em;}  
    .wciv-antes-ahora del{opacity:.8; text-decoration:line-through;}  
    .wciv-label{margin-left:.35em; font-size:.85em; text-transform:uppercase; letter-spacing:.02em;}  
    .wciv-label.wciv-antes{color:\#6b7280;}  
    .wciv-label.wciv-ahora{font-weight:600;}  
    \</style\>';  
});

// Tamaño y alineación centrada de "Antes" y "Ahora"  
add\_action('wp\_head', function () {  
  echo '\<style\>  
    /\* Contenedor por línea: centra verticalmente precio y palabra \*/  
    .wciv-line{  
      display:inline-flex;  
      align-items:center;      /\* ← centrado vertical \*/  
      gap:.45em;               /\* espacio entre precio y palabra \*/  
      line-height:1;  
      vertical-align:middle;  
    }  
    /\* Asegura que el precio no rompa el centrado \*/  
    .wciv-line del, .wciv-line ins, .wciv-line \> span:first-child{  
      display:inline-block \!important;  
      line-height:1;  
    }  
    /\* Solo las PALABRAS (no el precio) → ajusta tamaños aquí \*/  
    .wciv-label{ line-height:1; display:inline-block; }  
    .wciv-label.wciv-antes{ font-size:0.50em; font-weight:500; }  
    .wciv-label.wciv-ahora{ font-size:0.50em; font-weight:700; }  
  \</style\>';  
});

# 19 \- Traducción Woo

**19 \- Traducción Woo**

// Single product  
add\_filter('woocommerce\_product\_single\_add\_to\_cart\_text', function($text){  
    return 'Añadir al carrito';  
});

// Listados/archivo de productos  
add\_filter('woocommerce\_product\_add\_to\_cart\_text', function($text, $product){  
    return 'Añadir al carrito';  
}, 10, 2);

// Última red: forzar traducción por dominio (WooCommerce \+ Blocks)  
add\_filter('gettext', function($translated, $original, $domain){  
    if ( in\_array($domain, \['woocommerce','woo-gutenberg-products-block','elementor-pro','elementor'\]) ) {  
        if ( $original \=== 'Add to cart' || $original \=== 'Add to Cart' ) {  
            return 'Añadir al carrito';  
        }  
    }  
    return $translated;  
}, 10, 3);

add\_filter('gettext', function($translated, $original, $domain){  
    if ( in\_array($domain, \['woocommerce','woo-gutenberg-products-block'\]) ) {  
        if ($original \=== 'Select options') return 'Seleccionar opciones';  
    }  
    return $translated;  
}, 10, 3);

# 20 \- Upsales

**20 \- Upsales**

// Shortcode: \[product\_upsell\_id\]  
// Atributos:  
// \- product\_id (int, opcional)  \-\> fuerza un producto concreto  
// \- sep (string, opcional)       \-\> separador (por defecto ",")  
// \- unique (bool, opcional)      \-\> true/false (default true)  
// \- limit (int, opcional)        \-\> limitar cantidad  
// \- debug (bool, opcional)       \-\> true para mensajes de diagnóstico  
add\_action('init', function () {  
    add\_shortcode('product\_upsell\_id', 'lm\_sc\_product\_upsell\_id');  
});

function lm\_sc\_product\_upsell\_id($atts \= \[\]) {  
    if ( \! class\_exists('WooCommerce') ) return '';

    $atts \= shortcode\_atts(\[  
        'product\_id' \=\> '',  
        'sep'        \=\> ',',  
        'unique'     \=\> 'true',  
        'limit'      \=\> '',  
        'debug'      \=\> 'false',  
    \], $atts, 'product\_upsell\_id');

    $debug  \= filter\_var($atts\['debug'\], FILTER\_VALIDATE\_BOOLEAN);  
    $product \= lm\_get\_product\_context($atts\['product\_id'\]);

    if ( \! $product instanceof WC\_Product ) {  
        return $debug ? 'ERROR: product not found in context' : '';  
    }

    // Si es variación, usa el padre  
    if ( $product-\>is\_type('variation') ) {  
        $parent\_id \= $product-\>get\_parent\_id();  
        if ( $parent\_id ) {  
            $parent \= wc\_get\_product($parent\_id);  
            if ( $parent ) $product \= $parent;  
        }  
    }

    $ids \= $product-\>get\_upsell\_ids(); // array de IDs

    if ( empty($ids) ) {  
        return $debug ? 'NO\_UPSELLS' : '';  
    }

    // Únicos y límite  
    $unique \= filter\_var($atts\['unique'\], FILTER\_VALIDATE\_BOOLEAN);  
    $ids \= $unique ? array\_values(array\_unique(array\_map('absint', $ids))) : array\_map('absint', $ids);

    $limit \= ($atts\['limit'\] \!== '') ? max(0, intval($atts\['limit'\])) : 0;  
    if ($limit \> 0\) $ids \= array\_slice($ids, 0, $limit);

    return esc\_html(implode((string)$atts\['sep'\], $ids));  
}

// Intenta obtener el producto desde: atributo \-\> global $product \-\> objeto consultado \-\> $post actual  
function lm\_get\_product\_context($maybe\_id \= '') {  
    if ($maybe\_id \!== '') {  
        $p \= wc\_get\_product(absint($maybe\_id));  
        if ($p) return $p;  
    }

    // Global de WooCommerce (single product, loops bien configurados)  
    global $product;  
    if ($product instanceof WC\_Product) return $product;

    // ID del objeto consultado (single product)  
    if (function\_exists('get\_queried\_object\_id')) {  
        $qid \= get\_queried\_object\_id();  
        if ($qid) {  
            $p \= wc\_get\_product($qid);  
            if ($p) return $p;  
        }  
    }

    // $post en el Loop (útil en listings/Elementor/JetEngine)  
    $post \= get\_post();  
    if ($post && in\_array($post-\>post\_type, \['product', 'product\_variation'\], true)) {  
        $p \= wc\_get\_product($post-\>ID);  
        if ($p) return $p;  
    }

    return null;  
}

# 21 \- Woocommerce Beneficios B2C

**21 \- Woocommerce Beneficios B2C**

add\_action('woocommerce\_before\_calculate\_totals', 'agregar\_beneficio\_por\_plan\_de\_tratamiento', 15, 1);

function agregar\_beneficio\_por\_plan\_de\_tratamiento($cart) {  
    if (is\_admin() && \!defined('DOING\_AJAX')) return;

    if (\!is\_user\_logged\_in()) return;

    $user \= wp\_get\_current\_user();  
    if (\!in\_array('customer', (array) $user-\>roles)) return;

    global $wpdb;  
    $hoy \= date('Y-m-d');  
    $tabla \= $wpdb-\>prefix . 'item\_ptc';

    $productos\_beneficio\_ids \= \[\];

    foreach ($cart-\>get\_cart() as $cart\_item\_key \=\> $cart\_item) {  
        // Ignorar los productos que ya son beneficio  
        if (\!empty($cart\_item\['is\_gift'\])) continue;

        $producto \= wc\_get\_product($cart\_item\['product\_id'\]);  
        if (\!$producto) continue;

        $sku \= $producto-\>get\_sku();  
        $cantidad \= $cart\_item\['quantity'\];

        // Buscar si hay un beneficio para este producto (por SKU)  
        $query \= $wpdb-\>prepare(  
            "SELECT \* FROM $tabla  
             WHERE ITEM\_ID \= %s  
             AND FECHA\_INICIO \<= %s  
             AND FECHA\_FIN \>= %s  
             LIMIT 1",  
            $sku, $hoy, $hoy  
        );

        $beneficio \= $wpdb-\>get\_row($query);

        if ($beneficio) {  
            $producto\_beneficio\_id \= wc\_get\_product\_id\_by\_sku($beneficio-\>ITEM\_ID\_RECAMBIO);  
            if (\!$producto\_beneficio\_id) continue;

            $productos\_beneficio\_ids\[\] \= $producto\_beneficio\_id;

            $ya\_en\_carrito \= false;  
            $key\_beneficio \= null;

            foreach ($cart-\>get\_cart() as $key \=\> $item) {  
                if ($item\['product\_id'\] \== $producto\_beneficio\_id && \!empty($item\['is\_gift'\])) {  
                    $ya\_en\_carrito \= true;  
                    $key\_beneficio \= $key;  
                    break;  
                }  
            }

            // Agregar si cumple la cantidad y no está  
            if ($cantidad \>= $beneficio-\>POR\_COMPRA\_DE && \!$ya\_en\_carrito) {  
                $cart-\>add\_to\_cart($producto\_beneficio\_id, $beneficio-\>RECIBE\_PTC, 0, \[\], \['is\_gift' \=\> true\]);  
            }

            // Remover si ya no cumple y sí está  
            if ($cantidad \< $beneficio-\>POR\_COMPRA\_DE && $ya\_en\_carrito && $key\_beneficio) {  
                $cart-\>remove\_cart\_item($key\_beneficio);  
            }  
        }  
    }

    // Limpieza adicional: remover productos de beneficio si el producto base ya no está  
    foreach ($cart-\>get\_cart() as $key \=\> $item) {  
        if (\!empty($item\['is\_gift'\]) && \!in\_array($item\['product\_id'\], $productos\_beneficio\_ids)) {  
            $cart-\>remove\_cart\_item($key);  
        }  
    }  
}

add\_filter('woocommerce\_get\_item\_data', function($item\_data, $cart\_item) {  
    if (\!empty($cart\_item\['is\_gift'\])) {  
        $item\_data\[\] \= \[  
            'name' \=\> 'Beneficio',  
            'value' \=\> 'Producto gratuito por plan de tratamiento',  
        \];  
    }  
    return $item\_data;  
}, 10, 2);

add\_action('woocommerce\_before\_calculate\_totals', function($cart) {  
    if (is\_admin() && \!defined('DOING\_AJAX')) return;

    foreach ($cart-\>get\_cart() as $cart\_item) {  
        if (\!empty($cart\_item\['is\_gift'\]) && $cart\_item\['is\_gift'\] \=== true) {  
            $cart\_item\['data'\]-\>set\_price(0);  
        }  
    }  
}, 30, 1);

# 22 \- Woocommerce Descuento B2C Custumer

**22 \- Woocommerce Descuento B2C Custumer**

add\_action('woocommerce\_before\_calculate\_totals', 'aplicar\_descuentos\_por\_unidad\_escalonados\_hasta\_d10', 20, 1);

function aplicar\_descuentos\_por\_unidad\_escalonados\_hasta\_d10($cart) {  
    if (is\_admin() && \!defined('DOING\_AJAX')) return;  
    if (\!class\_exists('WooCommerce')) return;  
    if (\!is\_user\_logged\_in() || \!current\_user\_can('customer')) return;

    global $wpdb;  
    $hoy \= date('Y-m-d');

    foreach ($cart-\>get\_cart() as $cart\_item) {  
        $product \= wc\_get\_product($cart\_item\['product\_id'\]);  
        if (\!$product) continue;

        $sku \= $product-\>get\_sku();  
        $quantity \= $cart\_item\['quantity'\];  
        if (\!$sku || $quantity \<= 0\) continue;

        // Restaurar el precio base antes de aplicar nuevos descuentos  
        $precio\_base \= floatval($product-\>get\_regular\_price());  
        $cart\_item\['data'\]-\>set\_price($precio\_base);

        if ($quantity \=== 1\) continue; // No aplicar descuento si solo hay una unidad

        $tabla\_descuentos \= $wpdb-\>prefix . 'descuento\_call';  
        $query \= $wpdb-\>prepare(  
            "SELECT \* FROM $tabla\_descuentos   
             WHERE ITEM\_ID \= %s   
             AND FECHA\_INICIO \<= %s   
             AND FECHA\_FINAL \>= %s",  
             $sku, $hoy, $hoy  
        );

        $descuento \= $wpdb-\>get\_row($query);  
        if ($descuento) {  
            $descuento\_total \= 0;

            // Aplicar descuentos solo a unidades 2 y siguientes  
            for ($i \= 2; $i \<= $quantity; $i++) {  
                $campo \= 'D' . $i;  
                if (property\_exists($descuento, $campo)) {  
                    $descuento\_total \+= floatval($descuento-\>$campo);  
                }  
            }

            if ($descuento\_total \> 0\) {  
                $nuevo\_precio \= max($precio\_base \- ($descuento\_total / $quantity), 0);  
                $cart\_item\['data'\]-\>set\_price($nuevo\_precio);  
            }  
        }  
    }  
}

# 23 \- Woocommerce Descuentos Comerciales B2B

**23 \- Woocommerce Descuentos Comerciales B2B**

add\_action('woocommerce\_before\_calculate\_totals', 'aplicar\_descuentos\_por\_empresa\_personalizados', 20, 1);

function aplicar\_descuentos\_por\_empresa\_personalizados($cart) {  
    if (is\_admin() && \!defined('DOING\_AJAX')) return;

    if (\!class\_exists('WooCommerce')) return;  
    if (\!is\_user\_logged\_in()) return;

    $user \= wp\_get\_current\_user();

    // Verificamos que tenga el rol 'empresa'  
    if (\!in\_array('empresa', (array) $user-\>roles)) return;

    // Obtenemos el ID de cliente (CLIENTE\_ID) desde el campo meta personalizado 'id\_empresa'  
    $cliente\_id \= get\_user\_meta(get\_current\_user\_id(), 'id\_empresa', true);  
    if (\!$cliente\_id) return;

    global $wpdb;  
    $hoy \= date('Y-m-d');

    foreach ($cart-\>get\_cart() as $cart\_item) {  
        $product \= wc\_get\_product($cart\_item\['product\_id'\]);  
        if (\!$product) continue;

        $sku \= $product-\>get\_sku();  
        $quantity \= $cart\_item\['quantity'\];  
        if (\!$sku || $quantity \<= 0\) continue;

        // Usamos SKU como ITEM\_ID  
        $tabla \= $wpdb-\>prefix . 'cliente\_descuento\_item';  
        $query \= $wpdb-\>prepare(  
            "SELECT \* FROM $tabla  
             WHERE CLIENTE\_ID \= %d  
             AND ITEM\_ID \= %s  
             AND FECHA\_INICIAL \<= %s  
             AND FECHA\_FINAL \>= %s  
             LIMIT 1",  
            $cliente\_id, $sku, $hoy, $hoy  
        );

        $descuento \= $wpdb-\>get\_row($query);

        if ($descuento) {  
            $precio\_base \= floatval($cart\_item\['data'\]-\>get\_regular\_price());  
            $descuento\_unitario \= 0;

            if ($descuento-\>PORCENTAJE\_COM \> 0\) {  
                $descuento\_unitario \= $precio\_base \* ($descuento-\>PORCENTAJE\_COM / 100);  
            } elseif ($descuento-\>VALOR \> 0\) {  
                $descuento\_unitario \= floatval($descuento-\>VALOR);  
            }

            $nuevo\_precio \= max($precio\_base \- $descuento\_unitario, 0);  
            $cart\_item\['data'\]-\>set\_price($nuevo\_precio);  
        }  
    }  
}

# 24 \- CUSTOM\_API

**24 \- CUSTOM\_API**

define('CUSTOM\_API\_KEY', 'rwYK B0nN kHbq ujB3 XRbZ slCt');

add\_action('rest\_api\_init', function () {  
    register\_rest\_route('custom-api/v1', '/product', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> 'custom\_api\_create\_product',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods' \=\> 'GET',  
        'callback' \=\> 'custom\_api\_get\_product',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods' \=\> 'PUT',  
        'callback' \=\> 'custom\_api\_update\_product',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods' \=\> 'DELETE',  
        'callback' \=\> 'custom\_api\_delete\_product',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);  
});

function custom\_api\_auth($request) {  
    $key \= $request-\>get\_header('X-API-KEY');  
    return $key \=== 'rwYK B0nN kHbq ujB3 XRbZ slCt';  
}

function set\_image\_from\_url($url) {  
    require\_once ABSPATH . 'wp-admin/includes/image.php';  
    require\_once ABSPATH . 'wp-admin/includes/file.php';  
    require\_once ABSPATH . 'wp-admin/includes/media.php';

    $tmp \= download\_url($url);  
    if (is\_wp\_error($tmp)) return 0;

    $file \= \[  
        'name'     \=\> basename($url),  
        'type'     \=\> mime\_content\_type($tmp),  
        'tmp\_name' \=\> $tmp,  
        'error'    \=\> 0,  
        'size'     \=\> filesize($tmp),  
    \];

    $id \= media\_handle\_sideload($file, 0);  
    return is\_wp\_error($id) ? 0 : $id;  
}

function assign\_terms($id, $taxonomy, $terms) {  
    $term\_ids \= \[\];  
    foreach ($terms as $term\_name) {  
        $term \= term\_exists($term\_name, $taxonomy);  
        if (\!$term) {  
            $term \= wp\_insert\_term($term\_name, $taxonomy);  
            if (is\_wp\_error($term)) continue;  
        }  
        $term\_ids\[\] \= is\_array($term) ? $term\['term\_id'\] : $term;  
    }  
    wp\_set\_object\_terms($id, $term\_ids, $taxonomy);  
}

function get\_or\_create\_term\_id($term\_name, $taxonomy) {  
    $slug \= sanitize\_title($term\_name);  
    $term \= get\_term\_by('slug', $slug, $taxonomy);

    if ($term) return $term-\>term\_id;

    $new\_term \= wp\_insert\_term($term\_name, $taxonomy);  
    if (is\_wp\_error($new\_term)) return 0;

    return $new\_term\['term\_id'\];  
}

// Crear Producto  
function custom\_api\_create\_product($request) {  
    if (\!custom\_api\_auth($request)) return new WP\_Error('unauthorized', 'Invalid API Key', \['status' \=\> 403\]);

    $data \= $request-\>get\_json\_params();  
    $product \= new WC\_Product\_Simple();

    $product-\>set\_name($data\['title'\]);  
    $product-\>set\_description($data\['description'\] ?? '');  
    $product-\>set\_short\_description($data\['short\_description'\] ?? '');  
    $product-\>set\_regular\_price($data\['price'\]);  
    if (\!empty($data\['sku'\])) $product-\>set\_sku($data\['sku'\]);  
    if (\!empty($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity($data\['stock\_quantity'\]);  
    if (\!empty($data\['stock\_status'\])) $product-\>set\_stock\_status($data\['stock\_status'\]);  
    $product-\>set\_status('publish');  
    $product-\>save();  
    $id \= $product-\>get\_id();

    // Imagen destacada  
    if (\!empty($data\['image'\])) {  
        $img\_id \= set\_image\_from\_url($data\['image'\]);  
        if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
    }

    // Galería  
    if (\!empty($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
        $gallery\_ids \= \[\];  
        foreach ($data\['gallery'\] as $url) {  
            $img\_id \= set\_image\_from\_url($url);  
            if ($img\_id) $gallery\_ids\[\] \= $img\_id;  
        }  
        if ($gallery\_ids) update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
    }

    $product\_id \= $product-\>get\_id();

	// 🔹 Helper: asegurar términos válidos  
	function valid\_term\_ids($names, $taxonomy) {  
		return array\_filter(array\_map(function($name) use ($taxonomy) {  
			$id \= get\_or\_create\_term\_id($name, $taxonomy);  
			return $id \> 0 ? $id : null;  
		}, $names));  
	}

	// 🔹 Categorías  
	if (\!empty($data\['categories'\]) && is\_array($data\['categories'\])) {  
		$cat\_ids \= valid\_term\_ids($data\['categories'\], 'product\_cat');  
		if (\!empty($cat\_ids)) {  
			wp\_set\_object\_terms($product\_id, $cat\_ids, 'product\_cat');  
		}  
	}

	// 🔹 Etiquetas  
	if (\!empty($data\['tags'\]) && is\_array($data\['tags'\])) {  
		$tag\_ids \= valid\_term\_ids($data\['tags'\], 'product\_tag');  
		if (\!empty($tag\_ids)) {  
			wp\_set\_object\_terms($product\_id, $tag\_ids, 'product\_tag');  
		}  
	}

	// 🔹 JetEngine Taxonomías Personalizadas  
	if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
		foreach ($data\['jet\_taxonomies'\] as $taxonomy \=\> $terms) {  
			if (\!taxonomy\_exists($taxonomy)) continue;

			$term\_ids \= valid\_term\_ids($terms, $taxonomy);  
			if (\!empty($term\_ids)) {  
				wp\_set\_object\_terms($product\_id, $term\_ids, $taxonomy);  
			}  
		}  
	}

    return \['success' \=\> true, 'product\_id' \=\> $id\];  
}

// Obtener Producto  
function custom\_api\_get\_product($request) {  
    if (\!custom\_api\_auth($request)) return new WP\_Error('unauthorized', 'Invalid API Key', \['status' \=\> 403\]);  
    $id \= $request\['id'\];  
    $product \= wc\_get\_product($id);  
    if (\!$product) return new WP\_Error('not\_found', 'Product not found', \['status' \=\> 404\]);

    $image \= wp\_get\_attachment\_url(get\_post\_thumbnail\_id($id));  
    $gallery\_ids \= explode(',', get\_post\_meta($id, '\_product\_image\_gallery', true));  
    $gallery\_urls \= array\_map('wp\_get\_attachment\_url', array\_filter($gallery\_ids));

    $get\_terms\_names \= function ($id, $taxonomy) {  
        $terms \= wp\_get\_post\_terms($id, $taxonomy);  
        return array\_map(fn($t) \=\> $t-\>name, $terms);  
    };

    $jet\_taxonomies \= \[\];  
    foreach (get\_object\_taxonomies('product') as $tax) {  
        if (in\_array($tax, \['product\_cat', 'product\_tag'\])) continue;  
        $names \= $get\_terms\_names($id, $tax);  
        if ($names) $jet\_taxonomies\[$tax\] \= $names;  
    }

    return \[  
        'id' \=\> $id,  
        'title' \=\> $product-\>get\_name(),  
        'description' \=\> $product-\>get\_description(),  
        'short\_description' \=\> $product-\>get\_short\_description(),  
        'price' \=\> $product-\>get\_price(),  
        'sku' \=\> $product-\>get\_sku(),  
        'stock\_quantity' \=\> $product-\>get\_stock\_quantity(),  
        'stock\_status' \=\> $product-\>get\_stock\_status(),  
        'image' \=\> $image,  
        'gallery' \=\> $gallery\_urls,  
        'categories' \=\> $get\_terms\_names($id, 'product\_cat'),  
        'tags' \=\> $get\_terms\_names($id, 'product\_tag'),  
        'jet\_taxonomies' \=\> $jet\_taxonomies  
    \];  
}

// Actualizar Producto  
function custom\_api\_update\_product($request) {  
    if (\!custom\_api\_auth($request)) return new WP\_Error('unauthorized', 'Invalid API Key', \['status' \=\> 403\]);

    $id \= $request\['id'\];  
    $product \= wc\_get\_product($id);  
    if (\!$product) return new WP\_Error('not\_found', 'Product not found', \['status' \=\> 404\]);  
    $data \= $request-\>get\_json\_params();

    if (\!empty($data\['title'\])) $product-\>set\_name($data\['title'\]);  
    if (\!empty($data\['description'\])) $product-\>set\_description($data\['description'\]);  
    if (\!empty($data\['short\_description'\])) $product-\>set\_short\_description($data\['short\_description'\]);  
    if (\!empty($data\['price'\])) $product-\>set\_regular\_price($data\['price'\]);  
    if (\!empty($data\['sku'\])) $product-\>set\_sku($data\['sku'\]);  
    if (\!empty($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity($data\['stock\_quantity'\]);  
    if (\!empty($data\['stock\_status'\])) $product-\>set\_stock\_status($data\['stock\_status'\]);  
    $product-\>save();

    if (\!empty($data\['image'\])) {  
        $img\_id \= set\_image\_from\_url($data\['image'\]);  
        if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
    }

    if (\!empty($data\['gallery'\])) {  
        $gallery\_ids \= \[\];  
        foreach ($data\['gallery'\] as $url) {  
            $img\_id \= set\_image\_from\_url($url);  
            if ($img\_id) $gallery\_ids\[\] \= $img\_id;  
        }  
        update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
    }

    if (\!empty($data\['categories'\])) assign\_terms($id, 'product\_cat', $data\['categories'\]);  
    if (\!empty($data\['tags'\])) assign\_terms($id, 'product\_tag', $data\['tags'\]);  
    if (\!empty($data\['jet\_taxonomies'\])) {  
        foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
            assign\_terms($id, $tax, $terms);  
        }  
    }

    return \['success' \=\> true, 'updated\_id' \=\> $id\];  
}

// Eliminar Producto  
function custom\_api\_delete\_product($request) {  
    if (\!custom\_api\_auth($request)) return new WP\_Error('unauthorized', 'Invalid API Key', \['status' \=\> 403\]);  
    $id \= $request\['id'\];  
    $result \= wp\_delete\_post($id, true);  
    if (\!$result) return new WP\_Error('not\_found', 'Product not found or could not be deleted', \['status' \=\> 404\]);  
    return \['success' \=\> true, 'deleted\_id' \=\> $id\];  
}

// Crear múltiples productos  
add\_action('rest\_api\_init', function () {  
    register\_rest\_route('custom-api/v1', '/product/batch', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> 'custom\_api\_create\_products\_batch',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);  
});

function custom\_api\_create\_products\_batch($request) {  
    if (\!custom\_api\_auth($request)) {  
        return new WP\_Error('unauthorized', 'Invalid API Key', \['status' \=\> 403\]);  
    }

    $data \= $request-\>get\_json\_params();  
    $products \= $data\['products'\] ?? \[\];

    if (\!is\_array($products) || empty($products)) {  
        return new WP\_Error('invalid\_data', 'Debes enviar un array de productos.', \['status' \=\> 400\]);  
    }

    $results \= \[\];

    foreach ($products as $index \=\> $product\_data) {  
        $sub\_request \= new WP\_REST\_Request('POST', '/custom-api/v1/product');  
        $sub\_request-\>set\_body\_params($product\_data);  
        $sub\_request-\>set\_header('X-API-KEY', $request-\>get\_header('X-API-KEY'));

        $result \= custom\_api\_create\_product($sub\_request);

        if (is\_wp\_error($result)) {  
            $results\[\] \= \[  
                'index' \=\> $index,  
                'success' \=\> false,  
                'error' \=\> $result-\>get\_error\_message(),  
            \];  
        } else {  
            $results\[\] \= \[  
                'index' \=\> $index,  
                'success' \=\> true,  
                'product\_id' \=\> $result\['product\_id'\] ?? null,  
            \];  
        }  
    }

    return \[  
        'success' \=\> true,  
        'results' \=\> $results  
    \];  
}

// CRUD para tablas   
add\_action('rest\_api\_init', function () {  
    $tables \= \[  
        'cliente-descuento-item' \=\> 'wp\_cliente\_descuento\_item',  
        'convenio' \=\> 'wp\_convenio',  
        'costo-tipo' \=\> 'wp\_costo\_tipo',  
        'descuento-call' \=\> 'wp\_descuento\_call',  
        'laboratorio' \=\> 'wp\_laboratorio',  
        'precio-distrib' \=\> 'wp\_precio\_distrib',  
    \];

    foreach ($tables as $endpoint \=\> $table\_name) {  
        // LISTAR TODOS  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods' \=\> 'GET',  
            'callback' \=\> function($request) use ($table\_name) {  
                global $wpdb;  
                return $wpdb-\>get\_results("SELECT \* FROM {$table\_name}", ARRAY\_A);  
            },  
            'permission\_callback' \=\> '\_\_return\_true'  
        \]);

        // OBTENER UNO  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\\\d+)', \[  
            'methods' \=\> 'GET',  
            'callback' \=\> function($request) use ($table\_name) {  
                global $wpdb;  
                $id \= intval($request\['id'\]);  
                $primary \= get\_custom\_table\_primary\_key($table\_name);  
                return $wpdb-\>get\_row("SELECT \* FROM {$table\_name} WHERE {$primary} \= {$id}", ARRAY\_A);  
            },  
            'permission\_callback' \=\> '\_\_return\_true'  
        \]);

        // CREAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods' \=\> 'POST',  
            'callback' \=\> function($request) use ($table\_name) {  
                global $wpdb;  
                $data \= $request-\>get\_json\_params();  
                $wpdb-\>insert($table\_name, $data);  
                return \['success' \=\> true, 'insert\_id' \=\> $wpdb-\>insert\_id\];  
            },  
            'permission\_callback' \=\> '\_\_return\_true'  
        \]);

        // ACTUALIZAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\\\d+)', \[  
            'methods' \=\> 'PUT',  
            'callback' \=\> function($request) use ($table\_name) {  
                global $wpdb;  
                $id \= intval($request\['id'\]);  
                $data \= $request-\>get\_json\_params();  
                $primary \= get\_custom\_table\_primary\_key($table\_name);  
                $wpdb-\>update($table\_name, $data, \[$primary \=\> $id\]);  
                return \['success' \=\> true\];  
            },  
            'permission\_callback' \=\> '\_\_return\_true'  
        \]);

        // ELIMINAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\\\d+)', \[  
            'methods' \=\> 'DELETE',  
            'callback' \=\> function($request) use ($table\_name) {  
                global $wpdb;  
                $id \= intval($request\['id'\]);  
                $primary \= get\_custom\_table\_primary\_key($table\_name);  
                $wpdb-\>delete($table\_name, \[$primary \=\> $id\]);  
                return \['success' \=\> true\];  
            },  
            'permission\_callback' \=\> '\_\_return\_true'  
        \]);  
    }  
});

// Función que retorna la llave primaria de cada tabla personalizada  
function get\_custom\_table\_primary\_key($table\_name) {  
    $map \= \[  
        'wp\_cliente\_descuento\_item' \=\> 'CLIENTE\_DESCUENTO\_ITEM\_ID',  
        'wp\_convenio' \=\> 'CONVENIO\_ID',  
        'wp\_costo\_tipo' \=\> 'COSTO\_TIPO\_ID',  
        'wp\_descuento\_call' \=\> 'DESCUENTO\_ID',  
        'wp\_laboratorio' \=\> 'LABORATORIO\_ID',  
        'wp\_precio\_distrib' \=\> 'PRECIO\_DISTRIB\_ID',  
    \];  
    return $map\[$table\_name\] ?? 'id';  
}

add\_action('rest\_api\_init', function () {

    // CREAR TAXONOMÍA EN JETENGINE  
    register\_rest\_route('custom-api/v1', '/jetengine/taxonomies', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> function($request) {  
            $data \= $request-\>get\_json\_params();  
            $slug \= sanitize\_title($data\['slug'\] ?? '');  
            $label \= sanitize\_text\_field($data\['label'\] ?? $slug);  
            $hierarchical \= \!empty($data\['hierarchical'\]);

            if (\!$slug || \!$label) {  
                return new WP\_Error('missing\_fields', 'slug y label son obligatorios', \['status' \=\> 400\]);  
            }

            if (taxonomy\_exists($slug)) {  
                return new WP\_Error('exists', 'La taxonomía ya existe.', \['status' \=\> 409\]);  
            }

            $args \= \[  
                'public' \=\> true,  
                'hierarchical' \=\> $hierarchical,  
                'labels' \=\> \[  
                    'name' \=\> $label,  
                    'singular\_name' \=\> $label,  
                \],  
                'rewrite' \=\> \['slug' \=\> $slug\],  
                'object\_type' \=\> \['product'\], // puedes cambiarlo  
            \];

            // Registra en JetEngine  
            $meta \= \[  
                'name' \=\> $slug,  
                'slug' \=\> $slug,  
                'post\_types' \=\> \['product'\],  
                'hierarchical' \=\> $hierarchical,  
                'rest\_support' \=\> true,  
                'public' \=\> true,  
            \];

            $post\_id \= wp\_insert\_post(\[  
                'post\_title' \=\> $label,  
                'post\_type' \=\> 'jet-engine-taxonomy',  
                'post\_status' \=\> 'publish',  
                'meta\_input' \=\> \['jet\_engine\_meta' \=\> $meta\]  
            \]);

            // También registrar como taxonomía real para uso inmediato  
            register\_taxonomy($slug, 'product', \[  
                'label' \=\> $label,  
                'hierarchical' \=\> $hierarchical,  
                'public' \=\> true,  
                'show\_ui' \=\> true,  
                'rewrite' \=\> \['slug' \=\> $slug\]  
            \]);

            return \['success' \=\> true, 'slug' \=\> $slug, 'post\_id' \=\> $post\_id\];  
        },  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // CREAR TÉRMINO  
    register\_rest\_route('custom-api/v1', '/jetengine/taxonomies/(?P\<taxonomy\>\[a-zA-Z0-9\_-\]+)/terms', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> function($request) {  
            $taxonomy \= $request\['taxonomy'\];  
            $data \= $request-\>get\_json\_params();  
            $term\_name \= sanitize\_text\_field($data\['name'\] ?? '');

            if (\!taxonomy\_exists($taxonomy)) {  
                return new WP\_Error('invalid\_taxonomy', 'La taxonomía no existe.', \['status' \=\> 404\]);  
            }

            if (\!$term\_name) {  
                return new WP\_Error('invalid\_term', 'El campo "name" es obligatorio.', \['status' \=\> 400\]);  
            }

            $term \= term\_exists($term\_name, $taxonomy) ?: wp\_insert\_term($term\_name, $taxonomy);

            if (is\_wp\_error($term)) return $term;

            return \['success' \=\> true, 'term\_id' \=\> $term\['term\_id'\]\];  
        },  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // LISTAR TÉRMINOS  
    register\_rest\_route('custom-api/v1', '/jetengine/taxonomies/(?P\<taxonomy\>\[a-zA-Z0-9\_-\]+)/terms', \[  
        'methods' \=\> 'GET',  
        'callback' \=\> function($request) {  
            $taxonomy \= $request\['taxonomy'\];  
            if (\!taxonomy\_exists($taxonomy)) {  
                return new WP\_Error('invalid\_taxonomy', 'Taxonomía no existe.', \['status' \=\> 404\]);  
            }

            $terms \= get\_terms(\[  
                'taxonomy' \=\> $taxonomy,  
                'hide\_empty' \=\> false  
            \]);

            return array\_map(function($term) {  
                return \[  
                    'term\_id' \=\> $term-\>term\_id,  
                    'name' \=\> $term-\>name,  
                    'slug' \=\> $term-\>slug,  
                    'count' \=\> $term-\>count  
                \];  
            }, $terms);  
        },  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // ELIMINAR TÉRMINO  
    register\_rest\_route('custom-api/v1', '/jetengine/taxonomies/(?P\<taxonomy\>\[a-zA-Z0-9\_-\]+)/terms/(?P\<term\_id\>\\\\d+)', \[  
        'methods' \=\> 'DELETE',  
        'callback' \=\> function($request) {  
            $taxonomy \= $request\['taxonomy'\];  
            $term\_id \= intval($request\['term\_id'\]);

            if (\!taxonomy\_exists($taxonomy)) return new WP\_Error('invalid\_taxonomy', 'Taxonomía no existe.', \['status' \=\> 404\]);

            $deleted \= wp\_delete\_term($term\_id, $taxonomy);

            if (is\_wp\_error($deleted)) return $deleted;  
            if (\!$deleted) return new WP\_Error('delete\_failed', 'No se pudo eliminar el término.', \['status' \=\> 500\]);

            return \['success' \=\> true, 'deleted\_term\_id' \=\> $term\_id\];  
        },  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // OPCIONAL: ELIMINAR TAXONOMÍA JETENGINE  
    register\_rest\_route('custom-api/v1', '/jetengine/taxonomies/(?P\<slug\>\[a-zA-Z0-9\_-\]+)', \[  
        'methods' \=\> 'DELETE',  
        'callback' \=\> function($request) {  
            $slug \= $request\['slug'\];

            // Buscar el post de JetEngine  
            $posts \= get\_posts(\[  
                'post\_type' \=\> 'jet-engine-taxonomy',  
                'meta\_query' \=\> \[  
                    \[  
                        'key' \=\> 'jet\_engine\_meta',  
                        'value' \=\> $slug,  
                        'compare' \=\> 'LIKE'  
                    \]  
                \]  
            \]);

            if (empty($posts)) return new WP\_Error('not\_found', 'Taxonomía no encontrada en JetEngine.', \['status' \=\> 404\]);

            wp\_delete\_post($posts\[0\]-\>ID, true);

            return \['success' \=\> true, 'deleted\_slug' \=\> $slug\];  
        },  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);  
	  
	// OPCIONAL: ACTUALIZAR TAXONOMÍA JETENGINE  
	register\_rest\_route('custom-api/v1', '/jetengine/taxonomies/(?P\<slug\>\[a-zA-Z0-9\_-\]+)', \[  
		'methods' \=\> 'PUT',  
		'callback' \=\> function($request) {  
			$slug \= $request\['slug'\];  
			$data \= $request-\>get\_json\_params();

			$posts \= get\_posts(\[  
				'post\_type' \=\> 'jet-engine-taxonomy',  
				'posts\_per\_page' \=\> 1,  
				'meta\_query' \=\> \[  
					\[  
						'key' \=\> 'jet\_engine\_meta',  
						'value' \=\> $slug,  
						'compare' \=\> 'LIKE'  
					\]  
				\]  
			\]);

			if (empty($posts)) {  
				return new WP\_Error('not\_found', 'Taxonomía no encontrada en JetEngine.', \['status' \=\> 404\]);  
			}

			$post\_id \= $posts\[0\]-\>ID;  
			$meta \= get\_post\_meta($post\_id, 'jet\_engine\_meta', true);

			if (\!is\_array($meta)) return new WP\_Error('meta\_error', 'Meta JetEngine inválida.');

			// Actualizar campos  
			if (\!empty($data\['label'\])) {  
				wp\_update\_post(\[  
					'ID' \=\> $post\_id,  
					'post\_title' \=\> sanitize\_text\_field($data\['label'\])  
				\]);  
			}

			if (isset($data\['hierarchical'\])) {  
				$meta\['hierarchical'\] \= (bool)$data\['hierarchical'\];  
			}

			update\_post\_meta($post\_id, 'jet\_engine\_meta', $meta);

			return \['success' \=\> true, 'slug' \=\> $slug\];  
		},  
		'permission\_callback' \=\> '\_\_return\_true'  
	\]);  
	  
	// LISTAR TODAS LAS TAXONOMÍAS REGISTRADAS (WooCommerce \+ JetEngine)  
	register\_rest\_route('custom-api/v1', '/jetengine/taxonomies', \[  
		'methods' \=\> 'GET',  
		'callback' \=\> function () {  
			$all\_taxonomies \= get\_taxonomies(\[\], 'objects');

			$result \= \[\];

			foreach ($all\_taxonomies as $taxonomy) {  
				$result\[\] \= \[  
					'name' \=\> $taxonomy-\>name,  
					'label' \=\> $taxonomy-\>label,  
					'hierarchical' \=\> $taxonomy-\>hierarchical,  
					'public' \=\> $taxonomy-\>public,  
					'object\_type' \=\> $taxonomy-\>object\_type,  
					'show\_in\_rest' \=\> $taxonomy-\>show\_in\_rest,  
				\];  
			}

			return $result;  
		},  
		'permission\_callback' \=\> '\_\_return\_true'  
	\]);  
	  
	// OPCIONAL: ACTUALIZAR TERMINO TAXONOMÍA JETENGINE  
	register\_rest\_route('custom-api/v1', '/jetengine/taxonomies/(?P\<taxonomy\>\[a-zA-Z0-9\_-\]+)/terms/(?P\<term\_id\>\\\\d+)', \[  
		'methods' \=\> 'PUT',  
		'callback' \=\> function($request) {  
			$taxonomy \= $request\['taxonomy'\];  
			$term\_id \= intval($request\['term\_id'\]);  
			$data \= $request-\>get\_json\_params();

			if (\!taxonomy\_exists($taxonomy)) {  
				return new WP\_Error('invalid\_taxonomy', 'La taxonomía no existe.', \['status' \=\> 404\]);  
			}

			if (empty($data\['name'\])) {  
				return new WP\_Error('missing\_name', 'El campo "name" es obligatorio.', \['status' \=\> 400\]);  
			}

			$updated \= wp\_update\_term($term\_id, $taxonomy, \[  
				'name' \=\> sanitize\_text\_field($data\['name'\])  
			\]);

			if (is\_wp\_error($updated)) return $updated;

			return \['success' \=\> true, 'updated\_term\_id' \=\> $term\_id\];  
		},  
		'permission\_callback' \=\> '\_\_return\_true'  
	\]);

});

add\_action('rest\_api\_init', function () {

    // Crear usuario  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods' \=\> 'POST',  
        'callback' \=\> 'custom\_api\_create\_customer',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // Listar usuarios  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods' \=\> 'GET',  
        'callback' \=\> 'custom\_api\_get\_customers',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // Obtener usuario  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\\\d+)', \[  
        'methods' \=\> 'GET',  
        'callback' \=\> 'custom\_api\_get\_customer',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // Actualizar usuario  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\\\d+)', \[  
        'methods' \=\> 'PUT',  
        'callback' \=\> 'custom\_api\_update\_customer',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);

    // Eliminar usuario  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\\\d+)', \[  
        'methods' \=\> 'DELETE',  
        'callback' \=\> 'custom\_api\_delete\_customer',  
        'permission\_callback' \=\> '\_\_return\_true'  
    \]);  
});

// Crear nuevo usuario  
function custom\_api\_create\_customer($request) {  
    $data \= $request-\>get\_json\_params();

    $username \= sanitize\_user($data\['username'\] ?? '');  
    $email \= sanitize\_email($data\['email'\] ?? '');  
    $password \= $data\['password'\] ?? '';  
    $role \= sanitize\_text\_field($data\['role'\] ?? 'customer');

    if (\!$username || \!$email || \!$password) {  
        return new WP\_Error('missing\_fields', 'username, email y password son obligatorios.', \['status' \=\> 400\]);  
    }

    if (username\_exists($username) || email\_exists($email)) {  
        return new WP\_Error('exists', 'Usuario o correo ya existen.', \['status' \=\> 409\]);  
    }

    $user\_id \= wp\_create\_user($username, $password, $email);  
    if (is\_wp\_error($user\_id)) return $user\_id;

    wp\_update\_user(\['ID' \=\> $user\_id, 'role' \=\> $role\]);

    return \['success' \=\> true, 'user\_id' \=\> $user\_id\];  
}

// Listar usuarios (opcional: ?role=empresa)  
function custom\_api\_get\_customers($request) {  
    $role \= sanitize\_text\_field($request-\>get\_param('role'));  
    $args \= \[  
        'role' \=\> $role ?: '',  
        'orderby' \=\> 'ID',  
        'order' \=\> 'DESC',  
        'number' \=\> 50  
    \];

    $users \= get\_users($args);  
    $results \= \[\];

    foreach ($users as $user) {  
        $results\[\] \= \[  
            'id' \=\> $user-\>ID,  
            'username' \=\> $user-\>user\_login,  
            'email' \=\> $user-\>user\_email,  
            'role' \=\> $user-\>roles\[0\] ?? null  
        \];  
    }

    return $results;  
}

// Obtener un usuario  
function custom\_api\_get\_customer($request) {  
    $user \= get\_userdata($request\['id'\]);  
    if (\!$user) return new WP\_Error('not\_found', 'Usuario no encontrado.', \['status' \=\> 404\]);

    return \[  
        'id' \=\> $user-\>ID,  
        'username' \=\> $user-\>user\_login,  
        'email' \=\> $user-\>user\_email,  
        'role' \=\> $user-\>roles\[0\] ?? null  
    \];  
}

// Actualizar un usuario  
function custom\_api\_update\_customer($request) {  
    $user\_id \= $request\['id'\];  
    $data \= $request-\>get\_json\_params();

    $userdata \= \['ID' \=\> $user\_id\];

    if (\!empty($data\['email'\])) $userdata\['user\_email'\] \= sanitize\_email($data\['email'\]);  
    if (\!empty($data\['password'\])) $userdata\['user\_pass'\] \= $data\['password'\];  
    if (\!empty($data\['username'\])) $userdata\['user\_login'\] \= sanitize\_user($data\['username'\]);

    $updated\_id \= wp\_update\_user($userdata);  
    if (is\_wp\_error($updated\_id)) return $updated\_id;

    if (\!empty($data\['role'\])) {  
        $user \= new WP\_User($user\_id);  
        $user-\>set\_role(sanitize\_text\_field($data\['role'\]));  
    }

    return \['success' \=\> true, 'user\_id' \=\> $user\_id\];  
}

// Eliminar un usuario  
function custom\_api\_delete\_customer($request) {  
    $user\_id \= $request\['id'\];  
    $deleted \= wp\_delete\_user($user\_id);  
    if (\!$deleted) return new WP\_Error('delete\_failed', 'No se pudo eliminar el usuario.', \['status' \=\> 500\]);

    return \['success' \=\> true, 'deleted\_id' \=\> $user\_id\];  
}

# 25 \- CUSTOM\_API\_V2

**25 \- CUSTOM\_API\_V2**

/\* \=== Custom API Unificada (para pegar en Code Snippets o functions.php) \=== \*/  
if (\!defined('ABSPATH')) { exit; }

/\*\* CONFIG \*\*/  
if (\!defined('CUSTOM\_API\_KEY')) {  
    define('CUSTOM\_API\_KEY', 'rwYK B0nN kHbq ujB3 XRbZ slCt');  
}

/\*\* AUTH \*\*/  
if (\!function\_exists('cmu\_auth')) {  
function cmu\_auth(WP\_REST\_Request $request) {  
    $key \= $request-\>get\_header('X-API-KEY');  
    return $key && hash\_equals(CUSTOM\_API\_KEY, $key);  
}}  
if (\!function\_exists('cmu\_permission')) {  
function cmu\_permission(WP\_REST\_Request $request) {  
    if (\!cmu\_auth($request)) return new WP\_Error('unauthorized', 'Invalid API Key', \['status'=\>403\]);  
    return true;  
}}

/\*\* HELPERS: imágenes con caché por URL \*\*/  
if (\!function\_exists('cmu\_set\_image\_from\_url\_cached')) {  
function cmu\_set\_image\_from\_url\_cached($url) {  
    if (\!$url) return 0;

    // ¿Adjunto ya creado desde esta URL?  
    $existing \= get\_posts(\[  
        'post\_type'   \=\> 'attachment',  
        'meta\_key'    \=\> '\_source\_url',  
        'meta\_value'  \=\> $url,  
        'numberposts' \=\> 1,  
        'fields'      \=\> 'ids',  
    \]);  
    if (\!empty($existing)) return (int)$existing\[0\];

    require\_once ABSPATH.'wp-admin/includes/image.php';  
    require\_once ABSPATH.'wp-admin/includes/file.php';  
    require\_once ABSPATH.'wp-admin/includes/media.php';

    $tmp \= download\_url($url);  
    if (is\_wp\_error($tmp)) return 0;

    $file \= \[  
        'name'     \=\> wp\_basename(parse\_url($url, PHP\_URL\_PATH)),  
        'type'     \=\> mime\_content\_type($tmp),  
        'tmp\_name' \=\> $tmp,  
        'error'    \=\> 0,  
        'size'     \=\> filesize($tmp),  
    \];

    $id \= media\_handle\_sideload($file, 0);  
    if (is\_wp\_error($id)) return 0;

    update\_post\_meta($id, '\_source\_url', esc\_url\_raw($url));  
    return (int)$id;  
}}

/\*\* HELPERS: términos seguros (Woo/Jet) \*\*/  
if (\!function\_exists('cmu\_valid\_term\_ids')) {  
function cmu\_valid\_term\_ids($names, $taxonomy) {  
    if (\!is\_array($names)) return \[\];  
    return array\_filter(array\_map(function($name) use ($taxonomy){  
        $name \= trim(wp\_strip\_all\_tags($name));  
        if ($name \=== '') return null;  
        $slug \= sanitize\_title($name);  
        $term \= get\_term\_by('slug', $slug, $taxonomy);  
        if ($term) return (int)$term-\>term\_id;  
        $created \= wp\_insert\_term($name, $taxonomy);  
        return is\_wp\_error($created) ? null : (int)$created\['term\_id'\];  
    }, $names));  
}}

/\*\* HELPERS: resolver IDs de productos desde SKUs o IDs \*/  
if (\!function\_exists('cmu\_resolve\_product\_ids')) {  
function cmu\_resolve\_product\_ids($list) {  
    // Acepta: array de SKUs o IDs (o mixto). Devuelve array de IDs válidos.  
    if (\!is\_array($list)) return \[\];  
    $out \= \[\];  
    foreach ($list as $val) {  
        if (is\_numeric($val)) {  
            $pid \= (int)$val;  
            if ($pid \> 0 && wc\_get\_product($pid)) $out\[\] \= $pid;  
        } else {  
            $sku \= trim((string)$val);  
            if ($sku \!== '') {  
                $pid \= wc\_get\_product\_id\_by\_sku($sku);  
                if ($pid) $out\[\] \= (int)$pid;  
            }  
        }  
    }  
    return array\_values(array\_unique($out));  
}}

/\*\* CORE: upsert de producto simple por SKU \*\*/  
if (\!function\_exists('cmu\_upsert\_simple\_product')) {  
function cmu\_upsert\_simple\_product(array $data) {  
    if (\!class\_exists('WC\_Product\_Simple')) return new WP\_Error('woocommerce\_missing','WooCommerce requerido', \['status'=\>500\]);

    $existing\_id \= 0;  
    if (\!empty($data\['sku'\])) {  
        $existing\_id \= wc\_get\_product\_id\_by\_sku($data\['sku'\]);  
    }

    $product \= $existing\_id ? wc\_get\_product($existing\_id) : new WC\_Product\_Simple();  
    if (\!$product) $product \= new WC\_Product\_Simple();

    if (\!$existing\_id && \!empty($data\['sku'\])) $product-\>set\_sku($data\['sku'\]);  
    if (\!empty($data\['title'\])) $product-\>set\_name($data\['title'\]);  
    if (array\_key\_exists('description', $data)) $product-\>set\_description($data\['description'\] ?? '');  
    if (array\_key\_exists('short\_description', $data)) $product-\>set\_short\_description($data\['short\_description'\] ?? '');  
    // Precios: acepta regular\_price o price \+ sale\_price  
	if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
		$product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
	}  
	if (isset($data\['sale\_price'\])) {  
		$product-\>set\_sale\_price((string)$data\['sale\_price'\]);  
	}  
    if (isset($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
    if (\!empty($data\['stock\_status'\])) $product-\>set\_stock\_status($data\['stock\_status'\]);  
    if (\!empty($data\['status'\])) $product-\>set\_status($data\['status'\]);  
    if (\!$existing\_id && empty($data\['status'\])) $product-\>set\_status('publish');

    $product-\>save();  
    $id \= (int)$product-\>get\_id();

    // Imagen destacada  
    if (\!empty($data\['image'\])) {  
        $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
        if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
    }

    // Galería  
    if (\!empty($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
        $gallery\_ids \= \[\];  
        foreach ($data\['gallery'\] as $u) {  
            $mid \= cmu\_set\_image\_from\_url\_cached($u);  
            if ($mid) $gallery\_ids\[\] \= $mid;  
        }  
        if ($gallery\_ids) {  
            update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
        } else {  
            delete\_post\_meta($id, '\_product\_image\_gallery');  
        }  
    }

    // Taxonomías Woo  
    if (\!empty($data\['categories'\])) {  
        $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
        if ($cat\_ids) wp\_set\_object\_terms($id, $cat\_ids, 'product\_cat', false);  
    }  
    if (\!empty($data\['tags'\])) {  
        $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
        if ($tag\_ids) wp\_set\_object\_terms($id, $tag\_ids, 'product\_tag', false);  
    }

    // Taxonomías JetEngine/custom  
    if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
        foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
            if (\!taxonomy\_exists($tax)) continue;  
            $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
            if ($term\_ids) wp\_set\_object\_terms($id, $term\_ids, $tax, false);  
        }  
    }  
	  
	// \--- Up-sells / Cross-sells SOLO por SKUs (sobrescribe relaciones) \---  
	$touch\_rel \= false;

	if (array\_key\_exists('upsell\_skus', $data)) {  
		$upsell\_skus \= is\_array($data\['upsell\_skus'\]) ? $data\['upsell\_skus'\] : \[\];  
		$upsell\_ids  \= cmu\_resolve\_product\_ids($upsell\_skus);  
		$product-\>set\_upsell\_ids($upsell\_ids); // si mandas \[\], limpia upsells  
		$touch\_rel \= true;  
	}

	if (array\_key\_exists('crosssell\_skus', $data)) {  
		$cross\_skus \= is\_array($data\['crosssell\_skus'\]) ? $data\['crosssell\_skus'\] : \[\];  
		$cross\_ids  \= cmu\_resolve\_product\_ids($cross\_skus);  
		$product-\>set\_cross\_sell\_ids($cross\_ids); // si mandas \[\], limpia cross-sells  
		$touch\_rel \= true;  
	}

	if ($touch\_rel) {  
		$product-\>save();  
	}

    return \[  
        'product\_id' \=\> $id,  
        'sku'        \=\> $product-\>get\_sku(),  
        'mode'       \=\> $existing\_id ? 'updated' : 'created'  
    \];  
}}

/\*\* ENDPOINTS \*\*/  
add\_action('rest\_api\_init', function () {

    // Crear/Actualizar (upsert) individual  
    register\_rest\_route('custom-api/v1', '/product', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $data \= $request-\>get\_json\_params() ?: \[\];  
            $r \= cmu\_upsert\_simple\_product($data);  
            if (is\_wp\_error($r)) return $r;  
            return \['success'=\>true\] \+ $r;  
        }  
    \]);

    // Obtener uno  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $product \= wc\_get\_product($id);  
            if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

            $image \= wp\_get\_attachment\_url(get\_post\_thumbnail\_id($id));  
            $gallery\_ids \= explode(',', (string)get\_post\_meta($id, '\_product\_image\_gallery', true));  
            $gallery\_urls \= array\_values(array\_filter(array\_map('wp\_get\_attachment\_url', array\_filter($gallery\_ids))));

            $get\_terms\_names \= function ($pid, $taxonomy) {  
                $terms \= wp\_get\_post\_terms($pid, $taxonomy);  
                return array\_map(fn($t) \=\> $t-\>name, $terms);  
            };

            $jet \= \[\];  
            foreach (get\_object\_taxonomies('product') as $tax) {  
                if (in\_array($tax, \['product\_cat','product\_tag'\])) continue;  
                $names \= $get\_terms\_names($id, $tax);  
                if ($names) $jet\[$tax\] \= $names;  
            }

            return \[  
                'id' \=\> $id,  
                'title' \=\> $product-\>get\_name(),  
                'description' \=\> $product-\>get\_description(),  
                'short\_description' \=\> $product-\>get\_short\_description(),  
                'price' \=\> $product-\>get\_price(),  
                'sku' \=\> $product-\>get\_sku(),  
                'stock\_quantity' \=\> $product-\>get\_stock\_quantity(),  
                'stock\_status' \=\> $product-\>get\_stock\_status(),  
                'image' \=\> $image,  
                'gallery' \=\> $gallery\_urls,  
                'categories' \=\> $get\_terms\_names($id, 'product\_cat'),  
                'tags' \=\> $get\_terms\_names($id, 'product\_tag'),  
                'jet\_taxonomies' \=\> $jet  
            \];  
        }  
    \]);

    // Eliminar uno  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    // \=== Batch masivo (create/update por SKU) \===  
    register\_rest\_route('custom-api/v1', '/products/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params();  
            $items   \= $payload\['products'\] ?? \[\];  
            $mode    \= $payload\['mode'\] ?? 'auto'; // auto | create\_only | update\_only

            if (\!is\_array($items) || \!$items) {  
                return new WP\_Error('invalid\_data','Envía products como array',\['status'=\>400\]);  
            }

            // Optimizar conteos/caché durante el lote  
            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($items as $i=\>$data) {  
                try {  
                    $sku \= $data\['sku'\] ?? null;  
                    $exists\_id \= $sku ? wc\_get\_product\_id\_by\_sku($sku) : 0;

                    if ($mode \=== 'create\_only' && $exists\_id) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU ya existe'\];  
                        continue;  
                    }  
                    if ($mode \=== 'update\_only' && (\!$sku || \!$exists\_id)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU no existe para actualizar'\];  
                        continue;  
                    }

                    $r \= cmu\_upsert\_simple\_product($data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $results\[\] \= \['index'=\>$i,'success'=\>true\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    // \=== Borrado masivo por IDs o SKUs \===  
    register\_rest\_route('custom-api/v1', '/products/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params();  
            $ids  \= array\_map('intval', $p\['ids'\]  ?? \[\]);  
            $skus \= $p\['skus'\] ?? \[\];

            if (\!$ids && \!$skus) return new WP\_Error('invalid','Envía ids o skus',\['status'=\>400\]);

            $targets \= $ids;  
            foreach ($skus as $s) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($s));  
                if ($pid) $targets\[\] \= (int)$pid;  
            }  
            $targets \= array\_values(array\_unique(array\_filter($targets)));

            $out \= \[\];  
            foreach ($targets as $id) {  
                $ok \= wp\_delete\_post($id, true);  
                $out\[\] \= \['id'=\>$id,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$out\];  
        }  
    \]);

});

/\* \=== CRUD de Tablas Personalizadas \+ Masivos \=== \*/

// 1\) Mapa de endpoints \-\> tablas  
add\_action('rest\_api\_init', function () {

    $cmu\_tables \= \[  
        'cliente-descuento-item' \=\> $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item',  
        'convenio'               \=\> $GLOBALS\['wpdb'\]-\>prefix . 'convenio',  
        'costo-tipo'             \=\> $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo',  
        'descuento-call'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call',  
        'laboratorio'            \=\> $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio',  
        'precio-distrib'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib',  
    \];

    foreach ($cmu\_tables as $endpoint \=\> $table\_name) {

        // \=== Helpers por tabla \===  
        $get\_primary \= function($table) {  
            $map \= \[  
                $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item' \=\> 'CLIENTE\_DESCUENTO\_ITEM\_ID',  
                $GLOBALS\['wpdb'\]-\>prefix . 'convenio'               \=\> 'CONVENIO\_ID',  
                $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo'             \=\> 'COSTO\_TIPO\_ID',  
                $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call'         \=\> 'DESCUENTO\_ID',  
                $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio'            \=\> 'LABORATORIO\_ID',  
                $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib'         \=\> 'PRECIO\_DISTRIB\_ID',  
            \];  
            return $map\[$table\] ?? 'id';  
        };

        $table\_columns \= function($table) {  
            global $wpdb;  
            $cols \= $wpdb-\>get\_results("DESCRIBE \`$table\`", ARRAY\_A);  
            return $cols ? array\_map(fn($r) \=\> $r\['Field'\], $cols) : \[\];  
        };

        $sanitize\_row \= function(array $row, array $allowed\_cols) {  
            // Mantener solo columnas válidas  
            $clean \= \[\];  
            foreach ($row as $k \=\> $v) {  
                if (in\_array($k, $allowed\_cols, true)) {  
                    // limpieza básica  
                    if (is\_string($v)) {  
                        $clean\[$k\] \= wp\_unslash(wp\_kses\_post(trim($v)));  
                    } else {  
                        $clean\[$k\] \= $v;  
                    }  
                }  
            }  
            return $clean;  
        };

        // \=== LISTAR (GET /{endpoint}) con paginación y filtros \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary, $table\_columns) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                // Query params  
                $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
                $per\_page \= min(500, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
                $orderby  \= $request-\>get\_param('orderby') ?: $primary;  
                $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
                $search   \= $request-\>get\_param('search');  
                $filters  \= (array) ($request-\>get\_param('filters') ?: \[\]);

                if (\!in\_array($orderby, $cols, true)) $orderby \= $primary;  
                if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

                // WHERE (filtros exactos \+ search en todas las columnas texto)  
                $where \= "WHERE 1=1";  
                $params \= \[\];  
                foreach ($filters as $col \=\> $val) {  
                    if (in\_array($col, $cols, true)) {  
                        $where .= " AND \`$col\` \= %s";  
                        $params\[\] \= (string)$val;  
                    }  
                }  
                if ($search) {  
                    $search\_like \= '%' . $wpdb-\>esc\_like($search) . '%';  
                    $parts \= \[\];  
                    foreach ($cols as $c) $parts\[\] \= "\`$c\` LIKE %s";  
                    $where .= " AND (" . implode(' OR ', $parts) . ")";  
                    foreach ($cols as $\_) $params\[\] \= $search\_like;  
                }

                $offset \= ($page \- 1\) \* $per\_page;

                // Total  
                $sql\_count \= "SELECT COUNT(\*) FROM \`$table\_name\` $where";  
                $total \= $params ? (int) $wpdb-\>get\_var($wpdb-\>prepare($sql\_count, $params)) : (int) $wpdb-\>get\_var($sql\_count);

                // Data  
                $sql \= "SELECT \* FROM \`$table\_name\` $where ORDER BY \`$orderby\` $order LIMIT %d OFFSET %d";  
                $params\_data \= $params;  
                $params\_data\[\] \= $per\_page;  
                $params\_data\[\] \= $offset;  
                $rows \= $params\_data ? $wpdb-\>get\_results($wpdb-\>prepare($sql, $params\_data), ARRAY\_A) : $wpdb-\>get\_results($sql, ARRAY\_A);

                return \[  
                    'success'   \=\> true,  
                    'page'      \=\> $page,  
                    'per\_page'  \=\> $per\_page,  
                    'total'     \=\> $total,  
                    'rows'      \=\> $rows,  
                    'primary'   \=\> $primary,  
                \];  
            }  
        \]);

        // \=== OBTENER UNO (GET /{endpoint}/{id}) \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $row \= $wpdb-\>get\_row($wpdb-\>prepare("SELECT \* FROM \`$table\_name\` WHERE \`$primary\` \= %d", $id), ARRAY\_A);  
                if (\!$row) return new WP\_Error('not\_found','Registro no encontrado',\['status'=\>404\]);  
                return \['success'=\>true,'row'=\>$row\];  
            }  
        \]);

        // \=== CREAR (POST /{endpoint}) \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                // si el primary es autoincrement, mejor quitarlo del insert si viene vacío  
                if (array\_key\_exists($primary, $row) && ($row\[$primary\] \=== '' || $row\[$primary\] \=== null)) {  
                    unset($row\[$primary\]);  
                }

                $ok \= $wpdb-\>insert($table\_name, $row);  
                if ($ok \=== false) return new WP\_Error('insert\_failed','No se pudo insertar',\['status'=\>500\]);

                return \['success'=\>true,'insert\_id'=\>$wpdb-\>insert\_id\];  
            }  
        \]);

        // \=== ACTUALIZAR (PUT /{endpoint}/{id}) \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'PUT',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                unset($row\[$primary\]); // evitar cambiar primary

                if (\!$row) return new WP\_Error('invalid','No hay campos válidos para actualizar',\['status'=\>400\]);

                $ok \= $wpdb-\>update($table\_name, $row, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('update\_failed','No se pudo actualizar',\['status'=\>500\]);

                return \['success'=\>true,'updated\_id'=\>$id\];  
            }  
        \]);

        // \=== ELIMINAR (DELETE /{endpoint}/{id}) \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'DELETE',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
                return \['success'=\>true,'deleted\_id'=\>$id\];  
            }  
        \]);

        // \=== MASIVO: create|update|upsert (POST /{endpoint}/batch) \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $payload \= $request-\>get\_json\_params() ?: \[\];  
                $rows    \= $payload\['rows'\] ?? \[\];  
                $mode    \= strtolower($payload\['mode'\] ?? 'upsert'); // create|update|upsert  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                if (\!is\_array($rows) || empty($rows)) {  
                    return new WP\_Error('invalid\_data','Envía rows como array con registros.',\['status'=\>400\]);  
                }  
                if (\!in\_array($mode, \['create','update','upsert'\], true)) {  
                    return new WP\_Error('invalid\_mode','mode debe ser create|update|upsert',\['status'=\>400\]);  
                }

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');

                try {  
                    foreach ($rows as $i \=\> $input) {  
                        $clean \= $sanitize\_row((array)$input, $cols);

                        if ($mode \=== 'create') {  
                            // quitar PK si viene vacío  
                            if (array\_key\_exists($primary, $clean) && ($clean\[$primary\] \=== '' || $clean\[$primary\] \=== null)) {  
                                unset($clean\[$primary\]);  
                            }  
                            $ok \= $wpdb-\>insert($table\_name, $clean);  
                            if ($ok \=== false) {  
                                throw new Exception("Fila $i: fallo insert");  
                            }  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];

                        } elseif ($mode \=== 'update') {  
                            if (empty($clean\[$primary\])) {  
                                throw new Exception("Fila $i: falta $primary para update");  
                            }  
                            $pk \= $clean\[$primary\];  
                            unset($clean\[$primary\]);  
                            if (\!$clean) {  
                                throw new Exception("Fila $i: sin campos a actualizar");  
                            }  
                            $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                            if ($ok \=== false) {  
                                throw new Exception("Fila $i: fallo update");  
                            }  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];

                        } else { // upsert  
                            $has\_pk \= \!empty($clean\[$primary\]);  
                            if ($has\_pk) {  
                                $pk \= $clean\[$primary\];  
                                unset($clean\[$primary\]);  
                                // ¿existe?  
                                $exists \= (int) $wpdb-\>get\_var($wpdb-\>prepare("SELECT COUNT(\*) FROM \`$table\_name\` WHERE \`$primary\`=%d", $pk));  
                                if ($exists) {  
                                    if (\!$clean) {  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'noop','id'=\>$pk\];  
                                    } else {  
                                        $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                                        if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];  
                                    }  
                                } else {  
                                    // insertar con PK si viene  
                                    $clean\[$primary\] \= $pk;  
                                    $ok \= $wpdb-\>insert($table\_name, $clean);  
                                    if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                    $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                                }  
                            } else {  
                                // create sin PK  
                                $ok \= $wpdb-\>insert($table\_name, $clean);  
                                if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                            }  
                        }  
                    }

                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
            }  
        \]);

        // \=== MASIVO: delete por ids (POST /{endpoint}/batch/delete) \===  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch/delete', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $p   \= $request-\>get\_json\_params() ?: \[\];  
                $ids \= array\_map('intval', $p\['ids'\] ?? \[\]);  
                if (\!$ids) return new WP\_Error('invalid','Envía ids (array)',\['status'=\>400\]);

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');  
                try {  
                    foreach ($ids as $id) {  
                        $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> (int)$id\]);  
                        $results\[\] \= \['id'=\>$id,'deleted'=\> $ok \!== false && $ok \> 0\];  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_delete\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'results'=\>$results\];  
            }  
        \]);  
    }  
});

/\* \=== CRUD de Usuarios (individual \+ masivo) \=== \*/  
add\_action('rest\_api\_init', function () {

    // Helpers  
    $cmu\_find\_user \= function($match\_by, $value) {  
        if (\!$value) return false;  
        switch ($match\_by) {  
            case 'id':       return get\_userdata((int)$value);  
            case 'email':    return get\_user\_by('email', sanitize\_email($value));  
            case 'username': return get\_user\_by('login', sanitize\_user($value, true));  
            default:         return false;  
        }  
    };  
    $cmu\_apply\_meta \= function($user\_id, $meta){  
        if (\!is\_array($meta)) return;  
        foreach ($meta as $k=\>$v) {  
            update\_user\_meta($user\_id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    };

    // \========== LISTAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $role     \= sanitize\_text\_field($request-\>get\_param('role') ?: '');  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'ID'); // ID|user\_login|user\_email|user\_registered  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
            if (\!in\_array($orderby, \['ID','user\_login','user\_email','user\_registered'\], true)) $orderby \= 'ID';  
            if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

            $args \= \[  
                'number'   \=\> $per\_page,  
                'paged'    \=\> $page,  
                'orderby'  \=\> $orderby,  
                'order'    \=\> $order,  
                'fields'   \=\> 'all\_with\_meta',  
            \];  
            if ($role)   $args\['role'\] \= $role;  
            if ($search) $args\['search'\] \= '\*' . esc\_attr($search) . '\*';

            $q \= new WP\_User\_Query($args);  
            $users \= array\_map(function($u){  
                return \[  
                    'id'       \=\> $u-\>ID,  
                    'username' \=\> $u-\>user\_login,  
                    'email'    \=\> $u-\>user\_email,  
                    'role'     \=\> $u-\>roles\[0\] ?? null,  
                    'registered' \=\> $u-\>user\_registered,  
                \];  
            }, $q-\>get\_results());

            return \[  
                'success'  \=\> true,  
                'page'     \=\> $page,  
                'per\_page' \=\> $per\_page,  
                'total'    \=\> (int) $q-\>get\_total(),  
                'rows'     \=\> $users  
            \];  
        }  
    \]);

    // \========== OBTENER UNO \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $user \= get\_userdata((int)$request\['id'\]);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);  
            return \[  
                'success'   \=\> true,  
                'id'        \=\> $user-\>ID,  
                'username'  \=\> $user-\>user\_login,  
                'email'     \=\> $user-\>user\_email,  
                'role'      \=\> $user-\>roles\[0\] ?? null,  
                'registered'=\> $user-\>user\_registered  
            \];  
        }  
    \]);

    // \========== CREAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $d \= $request-\>get\_json\_params() ?: \[\];  
            $email \= sanitize\_email($d\['email'\] ?? '');  
            $username \= sanitize\_user($d\['username'\] ?? ( $email ? current(explode('@',$email)) : '' ), true);  
            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
            $role \= sanitize\_text\_field($d\['role'\] ?? 'customer');

            if (\!$email) return new WP\_Error('missing','email es obligatorio',\['status'=\>400\]);  
            if (email\_exists($email)) return new WP\_Error('exists','email ya existe',\['status'=\>409\]);  
            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

            $uid \= wp\_create\_user($username ?: 'user\_'.wp\_generate\_password(6,false,false), $password, $email);  
            if (is\_wp\_error($uid)) return $uid;  
            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);

            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$uid,'mode'=\>'created'\];  
        }  
    \]);

    // \========== ACTUALIZAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $id \= (int)$request\['id'\];  
            $user \= get\_userdata($id);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];  
            $upd \= \['ID'=\>$id\];

            if (\!empty($d\['email'\])) {  
                $email \= sanitize\_email($d\['email'\]);  
                $other \= get\_user\_by('email', $email);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','email ya en uso',\['status'=\>409\]);  
                $upd\['user\_email'\] \= $email;  
            }  
            if (\!empty($d\['username'\])) {  
                $username \= sanitize\_user($d\['username'\], true);  
                $other \= get\_user\_by('login', $username);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','username ya en uso',\['status'=\>409\]);  
                $upd\['user\_login'\] \= $username;  
            }  
            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];

            $res \= wp\_update\_user($upd);  
            if (is\_wp\_error($res)) return $res;

            if (\!empty($d\['role'\])) {  
                $role \= sanitize\_text\_field($d\['role'\]);  
                (new WP\_User($id))-\>set\_role($role);  
            }  
            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($id, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$id,'mode'=\>'updated'\];  
        }  
    \]);

    // \========== ELIMINAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_user($id);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    // \========== MASIVO: create|update|upsert \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_find\_user, $cmu\_apply\_meta){  
            $p \= $request-\>get\_json\_params() ?: \[\];  
            $rows    \= $p\['customers'\] ?? $p\['rows'\] ?? \[\];  
            $mode    \= strtolower($p\['mode'\] ?? 'upsert');        // create|update|upsert  
            $match\_by= strtolower($p\['match\_by'\] ?? 'email');     // id|email|username  
            if (\!in\_array($mode, \['create','update','upsert'\], true)) return new WP\_Error('invalid\_mode','mode inválido',\['status'=\>400\]);  
            if (\!in\_array($match\_by, \['id','email','username'\], true)) return new WP\_Error('invalid\_match','match\_by inválido',\['status'=\>400\]);  
            if (\!is\_array($rows) || \!$rows) return new WP\_Error('invalid','customers/rows vacío',\['status'=\>400\]);

            $out \= \[\];  
            foreach ($rows as $i=\>$d) {  
                try {  
                    $d \= (array)$d;  
                    $email \= sanitize\_email($d\['email'\] ?? '');  
                    $username \= sanitize\_user($d\['username'\] ?? '', true);

                    // resolver usuario según match\_by  
                    $lookup\_value \= $match\_by==='id' ? ($d\['id'\] ?? null) : ($match\_by==='email' ? $email : $username);  
                    $user \= $cmu\_find\_user($match\_by, $lookup\_value);

                    if ($mode \=== 'create') {  
                        if ($user) throw new Exception("Fila $i: ya existe usuario con $match\_by");  
                        if (\!$email) throw new Exception("Fila $i: email requerido");  
                        if (email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                        if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);  
                        $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                        $role \= sanitize\_text\_field($d\['role'\] ?? 'customer');  
                        $uid \= wp\_create\_user($username ?: current(explode('@',$email)), $password, $email);  
                        if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                        if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);  
                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];

                    } elseif ($mode \=== 'update') {  
                        if (\!$user) throw new Exception("Fila $i: no existe usuario por $match\_by");

                        $upd \= \['ID'=\>$user-\>ID\];  
                        if (\!empty($d\['email'\])) {  
                            $new\_email \= sanitize\_email($d\['email'\]);  
                            $other \= get\_user\_by('email',$new\_email);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                            $upd\['user\_email'\] \= $new\_email;  
                        }  
                        if (\!empty($d\['username'\])) {  
                            $new\_user \= sanitize\_user($d\['username'\], true);  
                            $other \= get\_user\_by('login',$new\_user);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                            $upd\['user\_login'\] \= $new\_user;  
                        }  
                        if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                        $res \= wp\_update\_user($upd);  
                        if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                        if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                    } else { // upsert  
                        if ($user) {  
                            // update branch  
                            $upd \= \['ID'=\>$user-\>ID\];  
                            if (\!empty($d\['email'\])) {  
                                $new\_email \= sanitize\_email($d\['email'\]);  
                                $other \= get\_user\_by('email',$new\_email);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                                $upd\['user\_email'\] \= $new\_email;  
                            }  
                            if (\!empty($d\['username'\])) {  
                                $new\_user \= sanitize\_user($d\['username'\], true);  
                                $other \= get\_user\_by('login',$new\_user);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                                $upd\['user\_login'\] \= $new\_user;  
                            }  
                            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                            $res \= wp\_update\_user($upd);  
                            if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                            if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                        } else {  
                            // create branch  
                            if (\!$email && \!$username) throw new Exception("Fila $i: requiere email o username");  
                            if ($email && email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);  
                            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                            $role \= sanitize\_text\_field($d\['role'\] ?? 'customer');

                            $base\_user \= $username ?: ($email ? current(explode('@',$email)) : 'user\_'.wp\_generate\_password(6,false,false));  
                            $uid \= wp\_create\_user($base\_user, $password, $email ?: '');  
                            if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];  
                        }  
                    }

                } catch (Throwable $e) {  
                    $out\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            return \['success'=\>true,'count'=\>count($out),'results'=\>$out\];  
        }  
    \]);

    // \========== MASIVO: delete por ids | emails | usernames \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params() ?: \[\];  
            $ids       \= array\_map('intval', $p\['ids'\] ?? \[\]);  
            $emails    \= array\_map('sanitize\_email', $p\['emails'\] ?? \[\]);  
            $usernames \= array\_map(function($u){return sanitize\_user($u, true);}, $p\['usernames'\] ?? \[\]);

            if (\!$ids && \!$emails && \!$usernames) {  
                return new WP\_Error('invalid','Envía ids o emails o usernames',\['status'=\>400\]);  
            }

            $targets \= $ids;

            foreach ($emails as $e) {  
                $u \= get\_user\_by('email',$e);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }  
            foreach ($usernames as $un) {  
                $u \= get\_user\_by('login',$un);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }

            $targets \= array\_values(array\_unique(array\_filter($targets)));  
            $results \= \[\];  
            foreach ($targets as $uid) {  
                $ok \= wp\_delete\_user($uid);  
                $results\[\] \= \['user\_id'=\>$uid,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$results\];  
        }  
    \]);

});

/\* \=== Productos por SKU (GET / PUT / DELETE) \=== \*/

/\*\* Helper: payload de producto (reusa en GET por id/sku) \*/  
if (\!function\_exists('cmu\_product\_payload')) {  
function cmu\_product\_payload($id) {  
    $product \= wc\_get\_product($id);  
    if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

    $image \= wp\_get\_attachment\_url(get\_post\_thumbnail\_id($id));  
    $gallery\_ids  \= explode(',', (string)get\_post\_meta($id,'\_product\_image\_gallery',true));  
    $gallery\_urls \= array\_values(array\_filter(array\_map('wp\_get\_attachment\_url', array\_filter($gallery\_ids))));

    $get\_terms\_names \= function ($pid, $taxonomy) {  
        $terms \= wp\_get\_post\_terms($pid, $taxonomy);  
        return array\_map(fn($t)=\>$t-\>name, $terms);  
    };

    $jet \= \[\];  
    foreach (get\_object\_taxonomies('product') as $tax) {  
        if (in\_array($tax, \['product\_cat','product\_tag'\])) continue;  
        $names \= $get\_terms\_names($id, $tax);  
        if ($names) $jet\[$tax\] \= $names;  
    }

    return \[  
        'id'                 \=\> (int)$id,  
        'title'              \=\> $product-\>get\_name(),  
        'description'        \=\> $product-\>get\_description(),  
        'short\_description'  \=\> $product-\>get\_short\_description(),  
        'price'              \=\> $product-\>get\_price(),  
        'sku'                \=\> $product-\>get\_sku(),  
        'stock\_quantity'     \=\> $product-\>get\_stock\_quantity(),  
        'stock\_status'       \=\> $product-\>get\_stock\_status(),  
        'image'              \=\> $image,  
        'gallery'            \=\> $gallery\_urls,  
        'categories'         \=\> $get\_terms\_names($id, 'product\_cat'),  
        'tags'               \=\> $get\_terms\_names($id, 'product\_tag'),  
        'jet\_taxonomies'     \=\> $jet,  
		'upsell\_ids'        \=\> array\_map('intval', (array) $product-\>get\_upsell\_ids()),  
        'crosssell\_ids'     \=\> array\_map('intval', (array) $product-\>get\_cross\_sell\_ids()),  
        'upsell\_skus'       \=\> array\_values(array\_filter(array\_map(function($pid){  
                                    $p \= wc\_get\_product($pid); return $p ? $p-\>get\_sku() : null;  
                                }, (array)$product-\>get\_upsell\_ids()))),  
        'crosssell\_skus'    \=\> array\_values(array\_filter(array\_map(function($pid){  
                                    $p \= wc\_get\_product($pid); return $p ? $p-\>get\_sku() : null;  
                                }, (array)$product-\>get\_cross\_sell\_ids())))

    \];  
}}

/\*\* Helper: obtener ID por SKU o 404 \*/  
if (\!function\_exists('cmu\_get\_id\_by\_sku\_or\_404')) {  
function cmu\_get\_id\_by\_sku\_or\_404($sku) {  
    $sku \= is\_string($sku) ? trim($sku) : '';  
    if ($sku \=== '') return new WP\_Error('invalid','SKU vacío',\['status'=\>400\]);  
    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
    if (\!$pid) return new WP\_Error('not\_found','Product with that SKU not found',\['status'=\>404\]);  
    return (int)$pid;  
}}

/\*\* Rutas por SKU \*/  
add\_action('rest\_api\_init', function () {

    // GET por SKU  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            return cmu\_product\_payload($pid);  
        }  
    \]);

    // PUT por SKU (upsert de tus campos existentes)  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;

            $product \= wc\_get\_product($pid);  
            if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

            $data \= $request-\>get\_json\_params() ?: \[\];

            if (\!empty($data\['title'\]))             $product-\>set\_name($data\['title'\]);  
            if (array\_key\_exists('description',$data))        $product-\>set\_description($data\['description'\] ?? '');  
            if (array\_key\_exists('short\_description',$data))  $product-\>set\_short\_description($data\['short\_description'\] ?? '');  
            // Precios: acepta regular\_price o price \+ sale\_price  
			if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
				$product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
			}  
			if (isset($data\['sale\_price'\])) {  
				$product-\>set\_sale\_price((string)$data\['sale\_price'\]);  
			}

            if (isset($data\['stock\_quantity'\]))     $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
            if (\!empty($data\['stock\_status'\]))      $product-\>set\_stock\_status($data\['stock\_status'\]);  
            if (\!empty($data\['status'\]))            $product-\>set\_status($data\['status'\]);  
            $product-\>save();

            // Imagen destacada  
            if (\!empty($data\['image'\])) {  
                $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
                if ($img\_id) set\_post\_thumbnail($pid, $img\_id);  
            }

            // Galería  
            if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
                $gallery\_ids \= \[\];  
                foreach ($data\['gallery'\] as $u) {  
                    $mid \= cmu\_set\_image\_from\_url\_cached($u);  
                    if ($mid) $gallery\_ids\[\] \= $mid;  
                }  
                if ($gallery\_ids) {  
                    update\_post\_meta($pid, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
                } else {  
                    delete\_post\_meta($pid, '\_product\_image\_gallery');  
                }  
            }

            // Taxonomías Woo  
            if (\!empty($data\['categories'\])) {  
                $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
                if ($cat\_ids) wp\_set\_object\_terms($pid, $cat\_ids, 'product\_cat', false);  
            }  
            if (\!empty($data\['tags'\])) {  
                $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
                if ($tag\_ids) wp\_set\_object\_terms($pid, $tag\_ids, 'product\_tag', false);  
            }

            // Taxonomías Jet/custom  
            if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
                foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
                    if (\!taxonomy\_exists($tax)) continue;  
                    $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
                    if ($term\_ids) wp\_set\_object\_terms($pid, $term\_ids, $tax, false);  
                }  
            }  
			  
			// Up-sells / Cross-sells por SKUs (sobrescribe)  
			$touch\_rel \= false;

			if ($request-\>has\_param('upsell\_skus') || array\_key\_exists('upsell\_skus', $data)) {  
				$upsell\_skus \= is\_array($data\['upsell\_skus'\] ?? \[\]) ? $data\['upsell\_skus'\] : \[\];  
				$product-\>set\_upsell\_ids(cmu\_resolve\_product\_ids($upsell\_skus));  
				$touch\_rel \= true;  
			}  
			if ($request-\>has\_param('crosssell\_skus') || array\_key\_exists('crosssell\_skus', $data)) {  
				$cross\_skus \= is\_array($data\['crosssell\_skus'\] ?? \[\]) ? $data\['crosssell\_skus'\] : \[\];  
				$product-\>set\_cross\_sell\_ids(cmu\_resolve\_product\_ids($cross\_skus));  
				$touch\_rel \= true;  
			}

			if ($touch\_rel) $product-\>save();

            return \['success'=\>true,'user\_update'=\>'ok','product\_id'=\>$pid,'sku'=\>$request\['sku'\],'mode'=\>'updated'\];  
        }  
    \]);

    // DELETE por SKU  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $ok \= wp\_delete\_post($pid, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_sku'=\>$request\['sku'\],'deleted\_id'=\>$pid\];  
        }  
    \]);

});

/\* \=== 1\) PUT MASIVO POR SKU (update-only) \=== \*/  
add\_action('rest\_api\_init', function () {  
    register\_rest\_route('custom-api/v1', '/products/sku/batch', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params() ?: \[\];  
            $updates \= $payload\['updates'\] ?? $payload\['products'\] ?? \[\];  
            if (\!is\_array($updates) || \!$updates) {  
                return new WP\_Error('invalid\_data','Envía "updates" (array de objetos con "sku").',\['status'=\>400\]);  
            }

            // rendimiento  
            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($updates as $i \=\> $data) {  
                try {  
                    $data \= (array)$data;  
                    $sku  \= isset($data\['sku'\]) ? trim((string)$data\['sku'\]) : '';  
                    if ($sku \=== '') throw new Exception("Fila $i: falta sku");

                    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
                    if (\!$pid) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>'SKU no encontrado (solo update)'\];  
                        continue;  
                    }

                    // Reutiliza el updater existente (acepta mismos campos que /product)  
                    // Forzamos 'update' pasando el SKU existente  
                    $data\['sku'\] \= $sku;  
                    $r \= cmu\_upsert\_simple\_product($data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        // Si por alguna razón reporta created, lo normalizamos a updated  
                        $r\['mode'\] \= 'updated';  
                        $results\[\] \= \['index'=\>$i,'success'=\>true,'sku'=\>$sku\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);  
});

/\* \=== 2\) GET /products (listar todos con filtros/paginación) \=== \*/  
if (\!function\_exists('cmu\_product\_payload')) {  
    // usa el helper que ya te pasé antes; si no lo tienes, dímelo y lo incluyo aquí  
}

add\_action('rest\_api\_init', function () {  
    register\_rest\_route('custom-api/v1', '/products', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){

            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'date'); // date|title|ID  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');           // ASC|DESC  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $status   \= sanitize\_text\_field($request-\>get\_param('status') ?: 'any');  // any|publish|draft|private  
            $category \= sanitize\_title($request-\>get\_param('category') ?: '');        // slug  
            $tag      \= sanitize\_title($request-\>get\_param('tag') ?: '');             // slug  
            $skus\_qs  \= trim((string)($request-\>get\_param('skus') ?: ''));            // "SKU1,SKU2"  
            $fields   \= strtolower($request-\>get\_param('fields') ?: 'basic');         // basic|full

            $args \= \[  
                'post\_type'      \=\> 'product',  
                'post\_status'    \=\> ($status \=== 'any') ? \['publish','draft','private'\] : $status,  
                'orderby'        \=\> in\_array($orderby, \['date','title','ID'\], true) ? $orderby : 'date',  
                'order'          \=\> in\_array($order, \['ASC','DESC'\], true) ? $order : 'DESC',  
                'posts\_per\_page' \=\> $per\_page,  
                'paged'          \=\> $page,  
                's'              \=\> $search ?: '',  
            \];

            // tax\_query para categoría/tag por slug  
            $tax\_query \= \[\];  
            if ($category) {  
                $tax\_query\[\] \= \[  
                    'taxonomy' \=\> 'product\_cat',  
                    'field'    \=\> 'slug',  
                    'terms'    \=\> \[$category\]  
                \];  
            }  
            if ($tag) {  
                $tax\_query\[\] \= \[  
                    'taxonomy' \=\> 'product\_tag',  
                    'field'    \=\> 'slug',  
                    'terms'    \=\> \[$tag\]  
                \];  
            }  
            if ($tax\_query) $args\['tax\_query'\] \= $tax\_query;

            // filtrar por SKUs  
            $sku\_list \= \[\];  
            if ($skus\_qs \!== '') {  
                $sku\_list \= array\_values(array\_filter(array\_map('trim', explode(',', $skus\_qs))));  
            }

            // Si hay SKUs, armamos meta\_query IN  
            if ($sku\_list) {  
                $args\['meta\_query'\] \= \[  
                    \[  
                        'key'     \=\> '\_sku',  
                        'value'   \=\> $sku\_list,  
                        'compare' \=\> 'IN'  
                    \]  
                \];  
                // Con meta\_query no funciona la búsqueda 's' sobre meta; mantenemos 's' sobre título  
            }

            $q \= new WP\_Query($args);  
            $posts \= $q-\>posts ?: \[\];

            $rows \= \[\];  
            foreach ($posts as $p) {  
                $prod \= wc\_get\_product($p-\>ID);  
                if (\!$prod) continue;

                if ($fields \=== 'full' && function\_exists('cmu\_product\_payload')) {  
                    $rows\[\] \= cmu\_product\_payload($p-\>ID);  
                } else {  
                    // básico y rápido  
                    $rows\[\] \= \[  
                        'id'             \=\> (int)$p-\>ID,  
                        'sku'            \=\> $prod-\>get\_sku(),  
                        'title'          \=\> $prod-\>get\_name(),  
                        'price'          \=\> $prod-\>get\_price(),  
                        'stock\_quantity' \=\> $prod-\>get\_stock\_quantity(),  
                        'stock\_status'   \=\> $prod-\>get\_stock\_status(),  
                        'status'         \=\> get\_post\_status($p-\>ID),  
                        'date'           \=\> get\_post\_time('c', true, $p-\>ID),  
                    \];  
                }  
            }

            return \[  
                'success'   \=\> true,  
                'page'      \=\> $page,  
                'per\_page'  \=\> $per\_page,  
                'total'     \=\> (int)$q-\>found\_posts,  
                'pages'     \=\> (int)$q-\>max\_num\_pages,  
                'rows'      \=\> array\_values($rows)  
            \];  
        }  
    \]);  
});

/\* \=== PUT por ID: /custom-api/v1/product/id/{id} \=== \*/  
add\_action('rest\_api\_init', function () {  
    register\_rest\_route('custom-api/v1', '/product/id/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int) $request\['id'\];  
            $product \= wc\_get\_product($id);  
            if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

            $data \= $request-\>get\_json\_params() ?: \[\];

            // Campos básicos  
            if (\!empty($data\['title'\]) || \!empty($data\['name'\])) {  
                $product-\>set\_name($data\['title'\] ?? $data\['name'\]);  
            }  
            if (array\_key\_exists('description', $data))        $product-\>set\_description($data\['description'\] ?? '');  
            if (array\_key\_exists('short\_description', $data))  $product-\>set\_short\_description($data\['short\_description'\] ?? '');  
            if (\!empty($data\['price'\]) || \!empty($data\['regular\_price'\])) {  
                $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
            }  
            if (\!empty($data\['sale\_price'\]))        $product-\>set\_sale\_price((string)$data\['sale\_price'\]);  
            if (isset($data\['stock\_quantity'\]))     $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
            if (isset($data\['manage\_stock'\]))       $product-\>set\_manage\_stock((bool)$data\['manage\_stock'\]);  
            if (\!empty($data\['stock\_status'\]))      $product-\>set\_stock\_status($data\['stock\_status'\]); // instock|outofstock|onbackorder  
            if (\!empty($data\['status'\]))            $product-\>set\_status($data\['status'\]);             // publish|draft|private

            // Permitir actualizar SKU si lo mandan (opcional)  
            if (\!empty($data\['sku'\]))               $product-\>set\_sku(sanitize\_text\_field($data\['sku'\]));

            $product-\>save();

            // Imagen destacada  
            if (\!empty($data\['image'\])) {  
                $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
                if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
            }

            // Galería  
            if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
                $gallery\_ids \= \[\];  
                foreach ($data\['gallery'\] as $u) {  
                    $mid \= cmu\_set\_image\_from\_url\_cached($u);  
                    if ($mid) $gallery\_ids\[\] \= $mid;  
                }  
                if ($gallery\_ids) {  
                    update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
                } else {  
                    delete\_post\_meta($id, '\_product\_image\_gallery');  
                }  
            }

            // Taxonomías Woo  
            if (\!empty($data\['categories'\])) {  
                $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
                if ($cat\_ids) wp\_set\_object\_terms($id, $cat\_ids, 'product\_cat', false);  
            }  
            if (\!empty($data\['tags'\])) {  
                $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
                if ($tag\_ids) wp\_set\_object\_terms($id, $tag\_ids, 'product\_tag', false);  
            }

            // Taxonomías JetEngine / custom  
            if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
                foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
                    if (\!taxonomy\_exists($tax)) continue;  
                    $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
                    if ($term\_ids) wp\_set\_object\_terms($id, $term\_ids, $tax, false);  
                }  
            }  
			  
			// Up-sells / Cross-sells por SKUs (sobrescribe)  
			$touch\_rel \= false;

			if ($request-\>has\_param('upsell\_skus') || array\_key\_exists('upsell\_skus', $data)) {  
				$upsell\_skus \= is\_array($data\['upsell\_skus'\] ?? \[\]) ? $data\['upsell\_skus'\] : \[\];  
				$product-\>set\_upsell\_ids(cmu\_resolve\_product\_ids($upsell\_skus));  
				$touch\_rel \= true;  
			}  
			if ($request-\>has\_param('crosssell\_skus') || array\_key\_exists('crosssell\_skus', $data)) {  
				$cross\_skus \= is\_array($data\['crosssell\_skus'\] ?? \[\]) ? $data\['crosssell\_skus'\] : \[\];  
				$product-\>set\_cross\_sell\_ids(cmu\_resolve\_product\_ids($cross\_skus));  
				$touch\_rel \= true;  
			}

			if ($touch\_rel) $product-\>save();

            // Respuesta  
            if (function\_exists('cmu\_product\_payload')) {  
                $payload \= cmu\_product\_payload($id);  
                if (\!is\_wp\_error($payload)) return \['success'=\>true,'mode'=\>'updated','product'=\>$payload\];  
            }  
            return \['success'=\>true,'mode'=\>'updated','product\_id'=\>$id\];  
        }  
    \]);  
});

# 26 \- CUSTOM\_API\_V3.2

**26 \- CUSTOM\_API\_V3.2**

/\*\*  
 \* Plugin Name: Custom API for Woo (Luis)  
 \* Description: API REST personalizada para WooCommerce con seguridad reforzada, relaciones por SKU, featured toggle y JetEngine meta tipado.  
 \* Version:     1.1.0  
 \* Author:      ClickLab  
 \*/

if (\!defined('ABSPATH')) exit;

/\* \============================================================================  
 \* 0\) Utilidades de seguridad (CORS, Rate Limit, Auth+Permisos)  
 \* \==========================================================================\*/

// CORS (sólo para rutas de este plugin)  
add\_action('rest\_api\_init', function () {  
    add\_filter('rest\_pre\_serve\_request', function($served, $result, $request, $server){  
        $route \= $request-\>get\_route();  
        if (strpos($route, '/custom-api/v1/') \=== 0\) {  
            $origin  \= get\_option('home');  
            $allowed \= defined('CUSTOM\_API\_CORS\_ORIGIN') ? CUSTOM\_API\_CORS\_ORIGIN : $origin;  
            header('Access-Control-Allow-Origin: ' . esc\_url\_raw($allowed));  
            header('Access-Control-Allow-Headers: Content-Type, X-API-KEY');  
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');  
        }  
        return $served;  
    }, 10, 4);  
});

// Rate limit simple por key/IP  
function cmu\_rate\_limited($bucket='default', $limit=300, $window=60){  
    $ip    \= $\_SERVER\['REMOTE\_ADDR'\] ?? '0.0.0.0';  
    $key   \= isset($\_SERVER\['HTTP\_X\_API\_KEY'\]) ? substr(hash('sha256', $\_SERVER\['HTTP\_X\_API\_KEY'\]),0,12) : 'anon';  
    $k     \= "cmu\_rl\_{$bucket}\_{$key}\_{$ip}";  
    $c     \= (int) get\_transient($k);  
    if ($c \>= $limit) return true;  
    set\_transient($k, $c+1, $window);  
    return false;  
}

// Validación de URL de media  
function cmu\_validate\_media\_url($url){  
    if (\!is\_string($url)) return false;  
    $url \= trim($url);  
    if ($url \=== '') return true;  
    $ok \= filter\_var($url, FILTER\_VALIDATE\_URL);  
    if (\!$ok) return false;  
    $scheme \= wp\_parse\_url($url, PHP\_URL\_SCHEME);  
    return in\_array($scheme, \['https','http'\], true);  
}

// AUTH reforzada \+ capability opcional  
function cmu\_auth(WP\_REST\_Request $request){  
    if (\!defined('CUSTOM\_API\_KEY')) return false;  
    $key \= $request-\>get\_header('X-API-KEY');  
    if (\!$key || \!hash\_equals(CUSTOM\_API\_KEY, $key)) return false;  
    $bucket \= substr(md5($request-\>get\_route()),0,8);  
    if (cmu\_rate\_limited($bucket, 300, 60)) {  
        return new WP\_Error('rate\_limited', 'Too Many Requests', \['status'=\>429\]);  
    }  
    return true;  
}  
function cmu\_permission(WP\_REST\_Request $request){  
    $auth \= cmu\_auth($request);  
    if ($auth \!== true) return $auth;  
    // Defensa adicional si hay sesión (no requerido para API key)  
    if (is\_user\_logged\_in() && \!current\_user\_can('manage\_woocommerce')) {  
        return new WP\_Error('forbidden', 'Insufficient permissions', \['status'=\>403\]);  
    }  
    return true;  
}

/\* \============================================================================  
 \* 1\) Helpers de imágenes con límites (HEAD, tamaño, mime) \+ cache por URL  
 \* \==========================================================================\*/  
function cmu\_set\_image\_from\_url\_cached($url){  
    if (\!$url || \!cmu\_validate\_media\_url($url)) return 0;

    // ¿Adjunto ya creado desde esta URL?  
    $existing \= get\_posts(\[  
        'post\_type'   \=\> 'attachment',  
        'meta\_key'    \=\> '\_source\_url',  
        'meta\_value'  \=\> $url,  
        'numberposts' \=\> 1,  
        'fields'      \=\> 'ids',  
    \]);  
    if (\!empty($existing)) return (int)$existing\[0\];

    // HEAD (10s) para validar tamaño y tipo si el server lo permite  
    add\_filter('http\_request\_timeout', fn() \=\> 10);  
    $head \= wp\_remote\_head($url, \['timeout'=\>10,'redirection'=\>2,'sslverify'=\>true\]);  
    if (\!is\_wp\_error($head)) {  
        $len  \= (int) wp\_remote\_retrieve\_header($head, 'content-length');  
        $type \= wp\_remote\_retrieve\_header($head, 'content-type');  
        if ($len && $len \> 5\*1024\*1024) return 0; // \>5MB  
        if ($type && strpos($type, 'image/') \!== 0\) return 0;  
    }

    require\_once ABSPATH.'wp-admin/includes/image.php';  
    require\_once ABSPATH.'wp-admin/includes/file.php';  
    require\_once ABSPATH.'wp-admin/includes/media.php';

    $tmp \= download\_url($url, 10);  
    if (is\_wp\_error($tmp)) return 0;

    $mime \= function\_exists('mime\_content\_type') ? mime\_content\_type($tmp) : 'image/jpeg';  
    if (strpos((string)$mime, 'image/') \!== 0\) { @unlink($tmp); return 0; }

    $file \= \[  
        'name'     \=\> wp\_basename(parse\_url($url, PHP\_URL\_PATH)),  
        'type'     \=\> $mime,  
        'tmp\_name' \=\> $tmp,  
        'error'    \=\> 0,  
        'size'     \=\> filesize($tmp),  
    \];

    $id \= media\_handle\_sideload($file, 0);  
    if (is\_wp\_error($id)) { @unlink($tmp); return 0; }

    update\_post\_meta($id, '\_source\_url', esc\_url\_raw($url));  
    return (int)$id;  
}

/\* \============================================================================  
 \* 2\) Helpers de términos (Woo/Jet) \+ resolver IDs desde SKUs  
 \* \==========================================================================\*/  
function cmu\_valid\_term\_ids($names, $taxonomy){  
    if (\!is\_array($names)) return \[\];  
    return array\_filter(array\_map(function($name) use ($taxonomy){  
        $name \= trim(wp\_strip\_all\_tags($name));  
        if ($name \=== '') return null;  
        $slug \= sanitize\_title($name);  
        $term \= get\_term\_by('slug', $slug, $taxonomy);  
        if ($term) return (int)$term-\>term\_id;  
        $created \= wp\_insert\_term($name, $taxonomy);  
        return is\_wp\_error($created) ? null : (int)$created\['term\_id'\];  
    }, $names));  
}

function cmu\_resolve\_product\_ids($list, $prefer \= 'sku'){  
    if (\!is\_array($list)) return \[\];  
    $out \= \[\];  
    foreach ($list as $val) {  
        if (is\_int($val)) {  
            $pid \= (int)$val;  
            if ($pid \> 0 && wc\_get\_product($pid)) { $out\[\] \= $pid; }  
            continue;  
        }  
        $s \= trim((string)$val);  
        if ($s \=== '') continue;

        $pid \= 0;  
        if ($prefer \=== 'sku') {  
            $pid \= wc\_get\_product\_id\_by\_sku($s);  
            if (\!$pid && ctype\_digit($s)) {  
                $as\_id \= (int)$s;  
                if ($as\_id \> 0 && wc\_get\_product($as\_id)) $pid \= $as\_id;  
            }  
        } else {  
            if (ctype\_digit($s)) {  
                $as\_id \= (int)$s;  
                if ($as\_id \> 0 && wc\_get\_product($as\_id)) $pid \= $as\_id;  
                if (\!$pid) $pid \= wc\_get\_product\_id\_by\_sku($s);  
            } else {  
                $pid \= wc\_get\_product\_id\_by\_sku($s);  
            }  
        }  
        if ($pid) $out\[\] \= (int)$pid;  
    }  
    return array\_values(array\_unique($out));  
}

/\* \============================================================================  
 \* 3\) JetEngine metacampos: whitelist \+ tipado  
 \* \==========================================================================\*/  
function cmu\_jet\_whitelist(){  
  return \[  
    // Ejemplos: ajusta a tus metacampos reales  
    'jet\_rating'        \=\> 'number',  
    'jet\_is\_new'        \=\> 'bool',  
    'jet\_supplier\_code' \=\> 'text',  
    'jet\_specs'         \=\> 'array', // se guarda como JSON  
  \];  
}  
function cmu\_apply\_meta\_whitelist($post\_id, $meta\_arr){  
  if (\!is\_array($meta\_arr)) return;  
  $map \= cmu\_jet\_whitelist();  
  foreach ($meta\_arr as $k=\>$v){  
    if (\!isset($map\[$k\])) continue;  
    switch ($map\[$k\]){  
      case 'number': $v \= is\_numeric($v) ? 0 \+ $v : null; break;  
      case 'bool':   $v \= (bool)$v ? 1 : 0; break;  
      case 'array':  $v \= wp\_json\_encode($v, JSON\_UNESCAPED\_UNICODE); break;  
      default:       $v \= is\_scalar($v) ? wp\_unslash($v) : wp\_json\_encode($v);  
    }  
    if ($v \=== null) { delete\_post\_meta($post\_id, $k); }  
    else { update\_post\_meta($post\_id, $k, $v); }  
  }  
}

/\* \============================================================================  
 \* 4\) CORE: Upsert de producto simple por SKU (incluye featured, meta, jet\_meta,  
 \*          upsell/crosssell por SKU, related\_skus manuales, imágenes seguras)  
 \* \==========================================================================\*/  
function cmu\_upsert\_simple\_product(array $data){  
    if (\!class\_exists('WC\_Product\_Simple')) {  
        return new WP\_Error('woocommerce\_missing','WooCommerce requerido', \['status'=\>500\]);  
    }

    $existing\_id \= 0;  
    if (\!empty($data\['sku'\])) $existing\_id \= wc\_get\_product\_id\_by\_sku($data\['sku'\]);

    $product \= $existing\_id ? wc\_get\_product($existing\_id) : new WC\_Product\_Simple();  
    if (\!$product) $product \= new WC\_Product\_Simple();

    if (\!$existing\_id && \!empty($data\['sku'\])) $product-\>set\_sku(sanitize\_text\_field($data\['sku'\]));  
    if (\!empty($data\['title'\])) $product-\>set\_name($data\['title'\]);  
    if (array\_key\_exists('description',$data))       $product-\>set\_description($data\['description'\] ?? '');  
    if (array\_key\_exists('short\_description',$data)) $product-\>set\_short\_description($data\['short\_description'\] ?? '');

    // Precios  
    if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
        $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
    }  
    if (array\_key\_exists('sale\_price', $data)) {  
        $sp \= $data\['sale\_price'\];  
        $product-\>set\_sale\_price($sp \=== '' || $sp \=== null ? '' : (string)$sp); // permite limpiar  
    }

    if (isset($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
    if (\!empty($data\['stock\_status'\]))  $product-\>set\_stock\_status($data\['stock\_status'\]); // instock|outofstock|onbackorder  
    if (\!empty($data\['status'\]))        $product-\>set\_status($data\['status'\]);  
    if (\!$existing\_id && empty($data\['status'\])) $product-\>set\_status('publish');

    $product-\>save();  
    $id \= (int)$product-\>get\_id();

    // Imagen destacada  
    if (\!empty($data\['image'\]) && cmu\_validate\_media\_url($data\['image'\])) {  
        $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
        if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
    }

    // Galería  
    if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
        $gallery\_ids \= \[\];  
        foreach ($data\['gallery'\] as $u) {  
            if (\!cmu\_validate\_media\_url($u)) continue;  
            $mid \= cmu\_set\_image\_from\_url\_cached($u);  
            if ($mid) $gallery\_ids\[\] \= $mid;  
        }  
        if ($gallery\_ids) {  
            update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
        } else {  
            delete\_post\_meta($id, '\_product\_image\_gallery');  
        }  
    }

    // Destacado (featured)  
    if (array\_key\_exists('featured', $data)) {  
        $product-\>set\_featured( (bool) $data\['featured'\] );  
        $product-\>save();  
    }

    // Meta libres (legacy)  
    if (\!empty($data\['meta'\]) && is\_array($data\['meta'\])) {  
        foreach ($data\['meta'\] as $k \=\> $v) {  
            update\_post\_meta($id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    }  
    // Jet meta tipado (whitelist)  
    if (\!empty($data\['jet\_meta'\]) && is\_array($data\['jet\_meta'\])) {  
        cmu\_apply\_meta\_whitelist($id, $data\['jet\_meta'\]);  
    }

    // Taxonomías Woo  
    if (\!empty($data\['categories'\])) {  
        $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
        if ($cat\_ids) wp\_set\_object\_terms($id, $cat\_ids, 'product\_cat', false);  
    }  
    if (\!empty($data\['tags'\])) {  
        $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
        if ($tag\_ids) wp\_set\_object\_terms($id, $tag\_ids, 'product\_tag', false);  
    }

    // Taxonomías Jet/custom  
    if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
        foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
            if (\!taxonomy\_exists($tax)) continue;  
            $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
            if ($term\_ids) wp\_set\_object\_terms($id, $term\_ids, $tax, false);  
        }  
    }

    // Up-sells / Cross-sells por SKUs (sobrescribe)  
    $touch\_rel \= false;  
    if (array\_key\_exists('upsell\_skus', $data)) {  
        $product-\>set\_upsell\_ids( cmu\_resolve\_product\_ids((array)$data\['upsell\_skus'\]) );  
        $touch\_rel \= true;  
    }  
    if (array\_key\_exists('crosssell\_skus', $data)) {  
        $product-\>set\_cross\_sell\_ids( cmu\_resolve\_product\_ids((array)$data\['crosssell\_skus'\]) );  
        $touch\_rel \= true;  
    }  
    if ($touch\_rel) $product-\>save();

    // Relacionados manuales propios  
    if (array\_key\_exists('related\_skus', $data)) {  
        $rel\_ids \= cmu\_resolve\_product\_ids((array)$data\['related\_skus'\]);  
        update\_post\_meta($id, '\_manual\_related\_ids', array\_map('intval', $rel\_ids));  
    }

    return \[  
        'product\_id' \=\> $id,  
        'sku'        \=\> $product-\>get\_sku(),  
        'mode'       \=\> $existing\_id ? 'updated' : 'created'  
    \];  
}

/\* \============================================================================  
 \* 5\) Payload y utilidades por SKU/ID  
 \* \==========================================================================\*/  
function cmu\_product\_payload($id){  
    $product \= wc\_get\_product($id);  
    if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

    $image \= wp\_get\_attachment\_url(get\_post\_thumbnail\_id($id));  
    $gallery\_ids  \= explode(',', (string)get\_post\_meta($id,'\_product\_image\_gallery',true));  
    $gallery\_urls \= array\_values(array\_filter(array\_map('wp\_get\_attachment\_url', array\_filter($gallery\_ids))));

    $get\_terms\_names \= function ($pid, $taxonomy) {  
        $terms \= wp\_get\_post\_terms($pid, $taxonomy);  
        return array\_map(fn($t)=\>$t-\>name, $terms);  
    };

    $jet \= \[\];  
    foreach (get\_object\_taxonomies('product') as $tax) {  
        if (in\_array($tax, \['product\_cat','product\_tag'\])) continue;  
        $names \= $get\_terms\_names($id, $tax);  
        if ($names) $jet\[$tax\] \= $names;  
    }

    $manual\_related \= get\_post\_meta($id, '\_manual\_related\_ids', true);  
    $manual\_related \= is\_array($manual\_related) ? array\_map('intval', $manual\_related) : \[\];

    return \[  
        'id'                 \=\> (int)$id,  
        'title'              \=\> $product-\>get\_name(),  
        'description'        \=\> $product-\>get\_description(),  
        'short\_description'  \=\> $product-\>get\_short\_description(),  
        'price'              \=\> $product-\>get\_price(),  
        'sku'                \=\> $product-\>get\_sku(),  
        'stock\_quantity'     \=\> $product-\>get\_stock\_quantity(),  
        'stock\_status'       \=\> $product-\>get\_stock\_status(),  
        'status'             \=\> get\_post\_status($id),  
        'featured'           \=\> (bool) $product-\>get\_featured(),  
        'image'              \=\> $image,  
        'gallery'            \=\> $gallery\_urls,  
        'categories'         \=\> $get\_terms\_names($id, 'product\_cat'),  
        'tags'               \=\> $get\_terms\_names($id, 'product\_tag'),  
        'jet\_taxonomies'     \=\> $jet,  
        'upsell\_ids'         \=\> array\_map('intval', (array) $product-\>get\_upsell\_ids()),  
        'crosssell\_ids'      \=\> array\_map('intval', (array) $product-\>get\_cross\_sell\_ids()),  
        'upsell\_skus'        \=\> array\_values(array\_filter(array\_map(function($pid){ $p=wc\_get\_product($pid); return $p?$p-\>get\_sku():null; }, (array)$product-\>get\_upsell\_ids()))),  
        'crosssell\_skus'     \=\> array\_values(array\_filter(array\_map(function($pid){ $p=wc\_get\_product($pid); return $p?$p-\>get\_sku():null; }, (array)$product-\>get\_cross\_sell\_ids()))),  
        'related\_ids\_manual' \=\> $manual\_related  
    \];  
}

function cmu\_get\_id\_by\_sku\_or\_404($sku){  
    $sku \= is\_string($sku) ? trim($sku) : '';  
    if ($sku \=== '') return new WP\_Error('invalid','SKU vacío',\['status'=\>400\]);  
    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
    if (\!$pid) return new WP\_Error('not\_found','Product with that SKU not found',\['status'=\>404\]);  
    return (int)$pid;  
}

/\* \============================================================================  
 \* 6\) Hook: mostrar relacionados manuales en frontend (sin romper nativo)  
 \* \==========================================================================\*/  
add\_filter('woocommerce\_related\_products', function($related, $product\_id){  
    $manual \= get\_post\_meta($product\_id, '\_manual\_related\_ids', true);  
    if (is\_array($manual) && \!empty($manual)) {  
        $manual \= array\_values(array\_filter(array\_map('intval', $manual)));  
        $wanted \= (int) apply\_filters('woocommerce\_related\_products\_total', 4);  
        if (count($manual) \>= $wanted) return array\_slice($manual, 0, $wanted);  
        $merge \= array\_values(array\_unique(array\_merge($manual, $related)));  
        return array\_slice($merge, 0, $wanted);  
    }  
    return $related;  
}, 10, 2);

/\* \============================================================================  
 \* 7\) ENDPOINTS  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    /\* \---------- POST /product (upsert) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'title' \=\> \['type'=\>'string','sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'sku'   \=\> \['type'=\>'string','required'=\>true,'sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'regular\_price' \=\> \['type'=\>'string','validate\_callback'=\>fn($v)=\>is\_numeric($v)\],  
            'sale\_price'    \=\> \['type'=\>'string'\],  
            'price'         \=\> \['type'=\>'string'\],  
            'description'   \=\> \['type'=\>'string'\],  
            'short\_description'=\>\['type'=\>'string'\],  
            'categories' \=\> \['type'=\>'array'\],  
            'tags'       \=\> \['type'=\>'array'\],  
            'image'      \=\> \['type'=\>'string','validate\_callback'=\>'cmu\_validate\_media\_url'\],  
            'gallery'    \=\> \['type'=\>'array'\],  
            'upsell\_skus'=\> \['type'=\>'array'\],  
            'crosssell\_skus'=\> \['type'=\>'array'\],  
            'related\_skus'=\>\['type'=\>'array'\],  
            'featured'   \=\> \['type'=\>'boolean'\],  
            'meta'       \=\> \['type'=\>'object'\],  
            'jet\_meta'   \=\> \['type'=\>'object'\],  
            'stock\_quantity' \=\> \['type'=\>'integer'\],  
            'stock\_status'   \=\> \['type'=\>'string'\],  
            'status'         \=\> \['type'=\>'string'\],  
            'jet\_taxonomies' \=\> \['type'=\>'object'\],  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $data \= $request-\>get\_json\_params() ?: \[\];  
            $r \= cmu\_upsert\_simple\_product($data);  
            if (is\_wp\_error($r)) return $r;  
            return \['success'=\>true\] \+ $r;  
        }  
    \]);

    /\* \---------- GET /product/{id} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            return cmu\_product\_payload($id);  
        }  
    \]);

    /\* \---------- DELETE /product/{id} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    /\* \---------- POST /products/batch (create|update auto) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params();  
            $items   \= $payload\['products'\] ?? \[\];  
            $mode    \= $payload\['mode'\] ?? 'auto'; // auto|create\_only|update\_only

            if (\!is\_array($items) || \!$items) {  
                return new WP\_Error('invalid\_data','Envía products como array',\['status'=\>400\]);  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($items as $i=\>$data) {  
                try {  
                    $sku \= $data\['sku'\] ?? null;  
                    $exists\_id \= $sku ? wc\_get\_product\_id\_by\_sku($sku) : 0;

                    if ($mode \=== 'create\_only' && $exists\_id) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU ya existe'\];  
                        continue;  
                    }  
                    if ($mode \=== 'update\_only' && (\!$sku || \!$exists\_id)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU no existe para actualizar'\];  
                        continue;  
                    }

                    $r \= cmu\_upsert\_simple\_product((array)$data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $results\[\] \= \['index'=\>$i,'success'=\>true\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    /\* \---------- POST /products/batch/delete \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params();  
            $ids  \= array\_map('intval', $p\['ids'\]  ?? \[\]);  
            $skus \= $p\['skus'\] ?? \[\];

            if (\!$ids && \!$skus) return new WP\_Error('invalid','Envía ids o skus',\['status'=\>400\]);

            $targets \= $ids;  
            foreach ($skus as $s) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($s));  
                if ($pid) $targets\[\] \= (int)$pid;  
            }  
            $targets \= array\_values(array\_unique(array\_filter($targets)));

            $out \= \[\];  
            foreach ($targets as $id) {  
                $ok \= wp\_delete\_post($id, true);  
                $out\[\] \= \['id'=\>$id,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$out\];  
        }  
    \]);

    /\* \---------- PUT /products/sku/batch (update-only) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/sku/batch', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params() ?: \[\];  
            $updates \= $payload\['updates'\] ?? $payload\['products'\] ?? \[\];  
            if (\!is\_array($updates) || \!$updates) {  
                return new WP\_Error('invalid\_data','Envía "updates" (array de objetos con "sku").',\['status'=\>400\]);  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($updates as $i \=\> $data) {  
                try {  
                    $data \= (array)$data;  
                    $sku  \= isset($data\['sku'\]) ? trim((string)$data\['sku'\]) : '';  
                    if ($sku \=== '') throw new Exception("Fila $i: falta sku");

                    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
                    if (\!$pid) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>'SKU no encontrado (solo update)'\];  
                        continue;  
                    }

                    $data\['sku'\] \= $sku; // fuerza update branch  
                    $r \= cmu\_upsert\_simple\_product($data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $r\['mode'\] \= 'updated';  
                        $results\[\] \= \['index'=\>$i,'success'=\>true,'sku'=\>$sku\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    /\* \---------- GET /products (filtros/paginación, featured opcional) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'date'); // date|title|ID  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');           // ASC|DESC  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $status   \= sanitize\_text\_field($request-\>get\_param('status') ?: 'any');  // any|publish|draft|private  
            $category \= sanitize\_title($request-\>get\_param('category') ?: '');  
            $tag      \= sanitize\_title($request-\>get\_param('tag') ?: '');  
            $skus\_qs  \= trim((string)($request-\>get\_param('skus') ?: ''));  
            $fields   \= strtolower($request-\>get\_param('fields') ?: 'basic');         // basic|full  
            $featured \= $request-\>get\_param('featured'); // 1/0 o true/false

            $args \= \[  
                'post\_type'      \=\> 'product',  
                'post\_status'    \=\> ($status \=== 'any') ? \['publish','draft','private'\] : $status,  
                'orderby'        \=\> in\_array($orderby, \['date','title','ID'\], true) ? $orderby : 'date',  
                'order'          \=\> in\_array($order, \['ASC','DESC'\], true) ? $order : 'DESC',  
                'posts\_per\_page' \=\> $per\_page,  
                'paged'          \=\> $page,  
                's'              \=\> $search ?: '',  
            \];

            $tax\_query \= \[\];  
            if ($category) {  
                $tax\_query\[\] \= \['taxonomy'=\>'product\_cat','field'=\>'slug','terms'=\>\[$category\]\];  
            }  
            if ($tag) {  
                $tax\_query\[\] \= \['taxonomy'=\>'product\_tag','field'=\>'slug','terms'=\>\[$tag\]\];  
            }  
            if ($tax\_query) $args\['tax\_query'\] \= $tax\_query;

            $meta\_query \= \[\];  
            $sku\_list \= \[\];  
            if ($skus\_qs \!== '') {  
                $sku\_list \= array\_values(array\_filter(array\_map('trim', explode(',', $skus\_qs))));  
                if ($sku\_list) {  
                    $meta\_query\[\] \= \['key'=\>'\_sku','value'=\>$sku\_list,'compare'=\>'IN'\];  
                }  
            }  
            if ($featured \!== null) {  
                $want \= in\_array($featured, \['1',1,true,'true'\], true) ? 'yes' : 'no';  
                $meta\_query\[\] \= \['key'=\>'\_featured','value'=\>$want,'compare'=\>'='\];  
            }  
            if ($meta\_query) $args\['meta\_query'\] \= $meta\_query;

            $q \= new WP\_Query($args);  
            $posts \= $q-\>posts ?: \[\];

            $rows \= \[\];  
            foreach ($posts as $p) {  
                $prod \= wc\_get\_product($p-\>ID);  
                if (\!$prod) continue;

                if ($fields \=== 'full') {  
                    $rows\[\] \= cmu\_product\_payload($p-\>ID);  
                } else {  
                    $rows\[\] \= \[  
                        'id'             \=\> (int)$p-\>ID,  
                        'sku'            \=\> $prod-\>get\_sku(),  
                        'title'          \=\> $prod-\>get\_name(),  
                        'price'          \=\> $prod-\>get\_price(),  
                        'stock\_quantity' \=\> $prod-\>get\_stock\_quantity(),  
                        'stock\_status'   \=\> $prod-\>get\_stock\_status(),  
                        'status'         \=\> get\_post\_status($p-\>ID),  
                        'featured'       \=\> (bool) $prod-\>get\_featured(),  
                        'date'           \=\> get\_post\_time('c', true, $p-\>ID),  
                    \];  
                }  
            }

            return \[  
                'success'   \=\> true,  
                'page'      \=\> $page,  
                'per\_page'  \=\> $per\_page,  
                'total'     \=\> (int)$q-\>found\_posts,  
                'pages'     \=\> (int)$q-\>max\_num\_pages,  
                'rows'      \=\> array\_values($rows)  
            \];  
        }  
    \]);

    /\* \---------- GET /product/sku/{sku} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            return cmu\_product\_payload($pid);  
        }  
    \]);

    /\* \---------- PUT /product/sku/{sku} (update) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'title' \=\> \['type'=\>'string','sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'regular\_price' \=\> \['type'=\>'string'\],  
            'sale\_price'    \=\> \['type'=\>'string'\],  
            'price'         \=\> \['type'=\>'string'\],  
            'description'   \=\> \['type'=\>'string'\],  
            'short\_description'=\>\['type'=\>'string'\],  
            'categories' \=\> \['type'=\>'array'\],  
            'tags'       \=\> \['type'=\>'array'\],  
            'image'      \=\> \['type'=\>'string','validate\_callback'=\>'cmu\_validate\_media\_url'\],  
            'gallery'    \=\> \['type'=\>'array'\],  
            'upsell\_skus'=\> \['type'=\>'array'\],  
            'crosssell\_skus'=\> \['type'=\>'array'\],  
            'related\_skus'=\>\['type'=\>'array'\],  
            'featured'   \=\> \['type'=\>'boolean'\],  
            'meta'       \=\> \['type'=\>'object'\],  
            'jet\_meta'   \=\> \['type'=\>'object'\],  
            'stock\_quantity' \=\> \['type'=\>'integer'\],  
            'stock\_status'   \=\> \['type'=\>'string'\],  
            'status'         \=\> \['type'=\>'string'\],  
            'jet\_taxonomies' \=\> \['type'=\>'object'\],  
            'sku'            \=\> \['type'=\>'string'\], // opcional para renombrar  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $product \= wc\_get\_product($pid);  
            if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

            $data \= $request-\>get\_json\_params() ?: \[\];

            if (\!empty($data\['title'\]))                     $product-\>set\_name($data\['title'\]);  
            if (array\_key\_exists('description',$data))      $product-\>set\_description($data\['description'\] ?? '');  
            if (array\_key\_exists('short\_description',$data))$product-\>set\_short\_description($data\['short\_description'\] ?? '');

            if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
                $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
            }  
            if (array\_key\_exists('sale\_price', $data)) {  
                $sp \= $data\['sale\_price'\];  
                $product-\>set\_sale\_price($sp \=== '' || $sp \=== null ? '' : (string)$sp);  
            }

            if (isset($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
            if (\!empty($data\['stock\_status'\]))  $product-\>set\_stock\_status($data\['stock\_status'\]);  
            if (\!empty($data\['status'\]))        $product-\>set\_status($data\['status'\]);

            if (\!empty($data\['sku'\]))           $product-\>set\_sku(sanitize\_text\_field($data\['sku'\])); // permitir cambio

            $product-\>save();

            if (array\_key\_exists('featured', $data)) {  
                $product-\>set\_featured( (bool) $data\['featured'\] );  
                $product-\>save();  
            }

            if (\!empty($data\['meta'\]) && is\_array($data\['meta'\])) {  
                foreach ($data\['meta'\] as $k \=\> $v) {  
                    update\_post\_meta($product-\>get\_id(), sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
                }  
            }  
            if (\!empty($data\['jet\_meta'\]) && is\_array($data\['jet\_meta'\])) {  
                cmu\_apply\_meta\_whitelist($product-\>get\_id(), $data\['jet\_meta'\]);  
            }

            if (\!empty($data\['image'\]) && cmu\_validate\_media\_url($data\['image'\])) {  
                $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
                if ($img\_id) set\_post\_thumbnail($pid, $img\_id);  
            }

            if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
                $gallery\_ids \= \[\];  
                foreach ($data\['gallery'\] as $u) {  
                    if (\!cmu\_validate\_media\_url($u)) continue;  
                    $mid \= cmu\_set\_image\_from\_url\_cached($u);  
                    if ($mid) $gallery\_ids\[\] \= $mid;  
                }  
                if ($gallery\_ids) update\_post\_meta($pid, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
                else delete\_post\_meta($pid, '\_product\_image\_gallery');  
            }

            if (\!empty($data\['categories'\])) {  
                $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
                if ($cat\_ids) wp\_set\_object\_terms($pid, $cat\_ids, 'product\_cat', false);  
            }  
            if (\!empty($data\['tags'\])) {  
                $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
                if ($tag\_ids) wp\_set\_object\_terms($pid, $tag\_ids, 'product\_tag', false);  
            }

            if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
                foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
                    if (\!taxonomy\_exists($tax)) continue;  
                    $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
                    if ($term\_ids) wp\_set\_object\_terms($pid, $term\_ids, $tax, false);  
                }  
            }

            $touch\_rel \= false;  
            if ($request-\>has\_param('upsell\_skus') || array\_key\_exists('upsell\_skus', $data)) {  
                $product-\>set\_upsell\_ids(cmu\_resolve\_product\_ids((array)($data\['upsell\_skus'\] ?? \[\])));  
                $touch\_rel \= true;  
            }  
            if ($request-\>has\_param('crosssell\_skus') || array\_key\_exists('crosssell\_skus', $data)) {  
                $product-\>set\_cross\_sell\_ids(cmu\_resolve\_product\_ids((array)($data\['crosssell\_skus'\] ?? \[\])));  
                $touch\_rel \= true;  
            }  
            if ($touch\_rel) $product-\>save();

            if (array\_key\_exists('related\_skus', $data)) {  
                $rel\_ids \= cmu\_resolve\_product\_ids((array)$data\['related\_skus'\]);  
                update\_post\_meta($pid, '\_manual\_related\_ids', array\_map('intval', $rel\_ids));  
            }

            return \['success'=\>true,'product\_id'=\>$product-\>get\_id(),'mode'=\>'updated'\];  
        }  
    \]);

    /\* \---------- DELETE /product/sku/{sku} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $ok \= wp\_delete\_post($pid, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_sku'=\>$request\['sku'\],'deleted\_id'=\>$pid\];  
        }  
    \]);

    /\* \---------- PATCH /product/sku/{sku}/featured \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)/featured', \[  
        'methods'  \=\> 'PATCH',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'featured' \=\> \['type'=\>'boolean','required'=\>true\],  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $p \= wc\_get\_product($pid);  
            $p-\>set\_featured((bool)$request-\>get\_param('featured'));  
            $p-\>save();  
            return \['success'=\>true,'product\_id'=\>$pid,'featured'=\>$p-\>get\_featured()\];  
        }  
    \]);  
});

/\* \============================================================================  
 \* 8\) CRUD Tablas Personalizadas (igual a tu versión, con sanitización básica)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    $cmu\_tables \= \[  
        'cliente-descuento-item' \=\> $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item',  
        'convenio'               \=\> $GLOBALS\['wpdb'\]-\>prefix . 'convenio',  
        'costo-tipo'             \=\> $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo',  
        'descuento-call'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call',  
        'laboratorio'            \=\> $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio',  
        'precio-distrib'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib',  
    \];

    $get\_primary \= function($table) {  
        $map \= \[  
            $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item' \=\> 'CLIENTE\_DESCUENTO\_ITEM\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'convenio'               \=\> 'CONVENIO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo'             \=\> 'COSTO\_TIPO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call'         \=\> 'DESCUENTO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio'            \=\> 'LABORATORIO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib'         \=\> 'PRECIO\_DISTRIB\_ID',  
        \];  
        return $map\[$table\] ?? 'id';  
    };

    $table\_columns \= function($table) {  
        global $wpdb;  
        $cols \= $wpdb-\>get\_results("DESCRIBE \`$table\`", ARRAY\_A);  
        return $cols ? array\_map(fn($r) \=\> $r\['Field'\], $cols) : \[\];  
    };

    $sanitize\_row \= function(array $row, array $allowed\_cols) {  
        $clean \= \[\];  
        foreach ($row as $k \=\> $v) {  
            if (in\_array($k, $allowed\_cols, true)) {  
                if (is\_string($v)) {  
                    $clean\[$k\] \= wp\_unslash(wp\_kses\_post(trim($v)));  
                } else {  
                    $clean\[$k\] \= $v;  
                }  
            }  
        }  
        return $clean;  
    };

    foreach ($cmu\_tables as $endpoint \=\> $table\_name) {

        // LISTAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary, $table\_columns) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
                $per\_page \= min(500, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
                $orderby  \= $request-\>get\_param('orderby') ?: $primary;  
                $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
                $search   \= $request-\>get\_param('search');  
                $filters  \= (array) ($request-\>get\_param('filters') ?: \[\]);

                if (\!in\_array($orderby, $cols, true)) $orderby \= $primary;  
                if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

                $where \= "WHERE 1=1";  
                $params \= \[\];  
                foreach ($filters as $col \=\> $val) {  
                    if (in\_array($col, $cols, true)) {  
                        $where .= " AND \`$col\` \= %s";  
                        $params\[\] \= (string)$val;  
                    }  
                }  
                if ($search) {  
                    $search\_like \= '%' . $wpdb-\>esc\_like($search) . '%';  
                    $parts \= \[\];  
                    foreach ($cols as $c) $parts\[\] \= "\`$c\` LIKE %s";  
                    $where .= " AND (" . implode(' OR ', $parts) . ")";  
                    foreach ($cols as $\_) $params\[\] \= $search\_like;  
                }

                $offset \= ($page \- 1\) \* $per\_page;

                $sql\_count \= "SELECT COUNT(\*) FROM \`$table\_name\` $where";  
                $total \= $params ? (int) $wpdb-\>get\_var($wpdb-\>prepare($sql\_count, $params)) : (int) $wpdb-\>get\_var($sql\_count);

                $sql \= "SELECT \* FROM \`$table\_name\` $where ORDER BY \`$orderby\` $order LIMIT %d OFFSET %d";  
                $params\_data \= $params;  
                $params\_data\[\] \= $per\_page;  
                $params\_data\[\] \= $offset;  
                $rows \= $params\_data ? $wpdb-\>get\_results($wpdb-\>prepare($sql, $params\_data), ARRAY\_A) : $wpdb-\>get\_results($sql, ARRAY\_A);

                return \[  
                    'success'   \=\> true,  
                    'page'      \=\> $page,  
                    'per\_page'  \=\> $per\_page,  
                    'total'     \=\> $total,  
                    'rows'      \=\> $rows,  
                    'primary'   \=\> $primary,  
                \];  
            }  
        \]);

        // OBTENER UNO  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $row \= $wpdb-\>get\_row($wpdb-\>prepare("SELECT \* FROM \`$table\_name\` WHERE \`$primary\` \= %d", $id), ARRAY\_A);  
                if (\!$row) return new WP\_Error('not\_found','Registro no encontrado',\['status'=\>404\]);  
                return \['success'=\>true,'row'=\>$row\];  
            }  
        \]);

        // CREAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                if (array\_key\_exists($primary, $row) && ($row\[$primary\] \=== '' || $row\[$primary\] \=== null)) {  
                    unset($row\[$primary\]);  
                }

                $ok \= $wpdb-\>insert($table\_name, $row);  
                if ($ok \=== false) return new WP\_Error('insert\_failed','No se pudo insertar',\['status'=\>500\]);

                return \['success'=\>true,'insert\_id'=\>$wpdb-\>insert\_id\];  
            }  
        \]);

        // ACTUALIZAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'PUT',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                unset($row\[$primary\]);

                if (\!$row) return new WP\_Error('invalid','No hay campos válidos para actualizar',\['status'=\>400\]);

                $ok \= $wpdb-\>update($table\_name, $row, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('update\_failed','No se pudo actualizar',\['status'=\>500\]);

                return \['success'=\>true,'updated\_id'=\>$id\];  
            }  
        \]);

        // ELIMINAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'DELETE',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
                return \['success'=\>true,'deleted\_id'=\>$id\];  
            }  
        \]);

        // MASIVO: create|update|upsert  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $payload \= $request-\>get\_json\_params() ?: \[\];  
                $rows    \= $payload\['rows'\] ?? \[\];  
                $mode    \= strtolower($payload\['mode'\] ?? 'upsert'); // create|update|upsert  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                if (\!is\_array($rows) || empty($rows)) {  
                    return new WP\_Error('invalid\_data','Envía rows como array',\['status'=\>400\]);  
                }  
                if (\!in\_array($mode, \['create','update','upsert'\], true)) {  
                    return new WP\_Error('invalid\_mode','mode debe ser create|update|upsert',\['status'=\>400\]);  
                }

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');

                try {  
                    foreach ($rows as $i \=\> $input) {  
                        $clean \= $sanitize\_row((array)$input, $cols);

                        if ($mode \=== 'create') {  
                            if (array\_key\_exists($primary, $clean) && ($clean\[$primary\] \=== '' || $clean\[$primary\] \=== null)) {  
                                unset($clean\[$primary\]);  
                            }  
                            $ok \= $wpdb-\>insert($table\_name, $clean);  
                            if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];

                        } elseif ($mode \=== 'update') {  
                            if (empty($clean\[$primary\])) throw new Exception("Fila $i: falta $primary");  
                            $pk \= $clean\[$primary\]; unset($clean\[$primary\]);  
                            if (\!$clean) throw new Exception("Fila $i: sin campos a actualizar");  
                            $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                            if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];

                        } else { // upsert  
                            $has\_pk \= \!empty($clean\[$primary\]);  
                            if ($has\_pk) {  
                                $pk \= $clean\[$primary\]; unset($clean\[$primary\]);  
                                $exists \= (int) $wpdb-\>get\_var($wpdb-\>prepare("SELECT COUNT(\*) FROM \`$table\_name\` WHERE \`$primary\`=%d", $pk));  
                                if ($exists) {  
                                    if (\!$clean) {  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'noop','id'=\>$pk\];  
                                    } else {  
                                        $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                                        if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];  
                                    }  
                                } else {  
                                    $clean\[$primary\] \= $pk;  
                                    $ok \= $wpdb-\>insert($table\_name, $clean);  
                                    if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                    $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                                }  
                            } else {  
                                $ok \= $wpdb-\>insert($table\_name, $clean);  
                                if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                            }  
                        }  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
            }  
        \]);

        // MASIVO: delete por ids  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch/delete', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $p   \= $request-\>get\_json\_params() ?: \[\];  
                $ids \= array\_map('intval', $p\['ids'\] ?? \[\]);  
                if (\!$ids) return new WP\_Error('invalid','Envía ids (array)',\['status'=\>400\]);

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');  
                try {  
                    foreach ($ids as $id) {  
                        $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> (int)$id\]);  
                        $results\[\] \= \['id'=\>$id,'deleted'=\> $ok \!== false && $ok \> 0\];  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_delete\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'results'=\>$results\];  
            }  
        \]);  
    }  
});

/\* \============================================================================  
 \* 9\) CRUD de Usuarios (igual a tu versión con pequeños ajustes de sanitización)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    // Helpers  
    $cmu\_find\_user \= function($match\_by, $value) {  
        if (\!$value) return false;  
        switch ($match\_by) {  
            case 'id':       return get\_userdata((int)$value);  
            case 'email':    return get\_user\_by('email', sanitize\_email($value));  
            case 'username': return get\_user\_by('login', sanitize\_user($value, true));  
            default:         return false;  
        }  
    };

    $cmu\_apply\_meta \= function($user\_id, $meta){  
        if (\!is\_array($meta)) return;  
        foreach ($meta as $k=\>$v) {  
            update\_user\_meta($user\_id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    };

    // \========== LISTAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $role     \= sanitize\_text\_field($request-\>get\_param('role') ?: '');  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'ID'); // ID|user\_login|user\_email|user\_registered  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
            if (\!in\_array($orderby, \['ID','user\_login','user\_email','user\_registered'\], true)) $orderby \= 'ID';  
            if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

            $args \= \[  
                'number'   \=\> $per\_page,  
                'paged'    \=\> $page,  
                'orderby'  \=\> $orderby,  
                'order'    \=\> $order,  
                'fields'   \=\> 'all\_with\_meta',  
            \];  
            if ($role)   $args\['role'\] \= $role;  
            if ($search) $args\['search'\] \= '\*' . esc\_attr($search) . '\*';

            $q \= new WP\_User\_Query($args);  
            $users \= array\_map(function($u){  
                return \[  
                    'id'         \=\> (int) $u-\>ID,  
                    'username'   \=\> $u-\>user\_login,  
                    'email'      \=\> $u-\>user\_email,  
                    'role'       \=\> $u-\>roles\[0\] ?? null,  
                    'registered' \=\> $u-\>user\_registered,  
                \];  
            }, $q-\>get\_results());

            return \[  
                'success'  \=\> true,  
                'page'     \=\> $page,  
                'per\_page' \=\> $per\_page,  
                'total'    \=\> (int) $q-\>get\_total(),  
                'rows'     \=\> $users  
            \];  
        }  
    \]);

    // \========== OBTENER UNO \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $user \= get\_userdata((int)$request\['id'\]);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);  
            return \[  
                'success'    \=\> true,  
                'id'         \=\> (int) $user-\>ID,  
                'username'   \=\> $user-\>user\_login,  
                'email'      \=\> $user-\>user\_email,  
                'role'       \=\> $user-\>roles\[0\] ?? null,  
                'registered' \=\> $user-\>user\_registered  
            \];  
        }  
    \]);

    // \========== CREAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $d \= $request-\>get\_json\_params() ?: \[\];  
            $email    \= sanitize\_email($d\['email'\] ?? '');  
            $username \= sanitize\_user($d\['username'\] ?? ( $email ? current(explode('@',$email)) : '' ), true);  
            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
            $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');

            if (\!$email) return new WP\_Error('missing','email es obligatorio',\['status'=\>400\]);  
            if (email\_exists($email)) return new WP\_Error('exists','email ya existe',\['status'=\>409\]);  
            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

            $uid \= wp\_create\_user($username ?: 'user\_'.wp\_generate\_password(6,false,false), $password, $email);  
            if (is\_wp\_error($uid)) return $uid;  
            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);

            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$uid,'mode'=\>'created'\];  
        }  
    \]);

    // \========== ACTUALIZAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $id \= (int)$request\['id'\];  
            $user \= get\_userdata($id);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];  
            $upd \= \['ID'=\>$id\];

            if (\!empty($d\['email'\])) {  
                $email \= sanitize\_email($d\['email'\]);  
                $other \= get\_user\_by('email', $email);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','email ya en uso',\['status'=\>409\]);  
                $upd\['user\_email'\] \= $email;  
            }  
            if (\!empty($d\['username'\])) {  
                $username \= sanitize\_user($d\['username'\], true);  
                $other \= get\_user\_by('login', $username);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','username ya en uso',\['status'=\>409\]);  
                $upd\['user\_login'\] \= $username;  
            }  
            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];

            $res \= wp\_update\_user($upd);  
            if (is\_wp\_error($res)) return $res;

            if (\!empty($d\['role'\])) {  
                $role \= sanitize\_text\_field($d\['role'\]);  
                (new WP\_User($id))-\>set\_role($role);  
            }  
            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($id, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$id,'mode'=\>'updated'\];  
        }  
    \]);

    // \========== ELIMINAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_user($id);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    // \========== MASIVO: create|update|upsert \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_find\_user, $cmu\_apply\_meta){  
            $p        \= $request-\>get\_json\_params() ?: \[\];  
            $rows     \= $p\['customers'\] ?? $p\['rows'\] ?? \[\];  
            $mode     \= strtolower($p\['mode'\] ?? 'upsert');        // create|update|upsert  
            $match\_by \= strtolower($p\['match\_by'\] ?? 'email');     // id|email|username  
            if (\!in\_array($mode, \['create','update','upsert'\], true)) return new WP\_Error('invalid\_mode','mode inválido',\['status'=\>400\]);  
            if (\!in\_array($match\_by, \['id','email','username'\], true)) return new WP\_Error('invalid\_match','match\_by inválido',\['status'=\>400\]);  
            if (\!is\_array($rows) || \!$rows) return new WP\_Error('invalid','customers/rows vacío',\['status'=\>400\]);

            $out \= \[\];  
            foreach ($rows as $i=\>$d) {  
                try {  
                    $d \= (array)$d;  
                    $email    \= sanitize\_email($d\['email'\] ?? '');  
                    $username \= sanitize\_user($d\['username'\] ?? '', true);

                    // resolver usuario según match\_by  
                    $lookup\_value \= $match\_by==='id' ? ($d\['id'\] ?? null) : ($match\_by==='email' ? $email : $username);  
                    $user \= $cmu\_find\_user($match\_by, $lookup\_value);

                    if ($mode \=== 'create') {  
                        if ($user) throw new Exception("Fila $i: ya existe usuario con $match\_by");  
                        if (\!$email) throw new Exception("Fila $i: email requerido");  
                        if (email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                        if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

                        $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                        $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');  
                        $uid \= wp\_create\_user($username ?: current(explode('@',$email)), $password, $email);  
                        if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                        if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];

                    } elseif ($mode \=== 'update') {  
                        if (\!$user) throw new Exception("Fila $i: no existe usuario por $match\_by");

                        $upd \= \['ID'=\>$user-\>ID\];  
                        if (\!empty($d\['email'\])) {  
                            $new\_email \= sanitize\_email($d\['email'\]);  
                            $other \= get\_user\_by('email',$new\_email);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                            $upd\['user\_email'\] \= $new\_email;  
                        }  
                        if (\!empty($d\['username'\])) {  
                            $new\_user \= sanitize\_user($d\['username'\], true);  
                            $other \= get\_user\_by('login',$new\_user);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                            $upd\['user\_login'\] \= $new\_user;  
                        }  
                        if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                        $res \= wp\_update\_user($upd);  
                        if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                        if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                    } else { // upsert  
                        if ($user) {  
                            // update branch  
                            $upd \= \['ID'=\>$user-\>ID\];  
                            if (\!empty($d\['email'\])) {  
                                $new\_email \= sanitize\_email($d\['email'\]);  
                                $other \= get\_user\_by('email',$new\_email);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                                $upd\['user\_email'\] \= $new\_email;  
                            }  
                            if (\!empty($d\['username'\])) {  
                                $new\_user \= sanitize\_user($d\['username'\], true);  
                                $other \= get\_user\_by('login',$new\_user);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                                $upd\['user\_login'\] \= $new\_user;  
                            }  
                            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                            $res \= wp\_update\_user($upd);  
                            if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                            if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                        } else {  
                            // create branch  
                            if (\!$email && \!$username) throw new Exception("Fila $i: requiere email o username");  
                            if ($email && email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

                            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                            $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');

                            $base\_user \= $username ?: ($email ? current(explode('@',$email)) : 'user\_'.wp\_generate\_password(6,false,false));  
                            $uid \= wp\_create\_user($base\_user, $password, $email ?: '');  
                            if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];  
                        }  
                    }

                } catch (Throwable $e) {  
                    $out\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            return \['success'=\>true,'count'=\>count($out),'results'=\>$out\];  
        }  
    \]);

    // \========== MASIVO: delete por ids | emails | usernames \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params() ?: \[\];  
            $ids       \= array\_map('intval', $p\['ids'\] ?? \[\]);  
            $emails    \= array\_map('sanitize\_email', $p\['emails'\] ?? \[\]);  
            $usernames \= array\_map(function($u){return sanitize\_user($u, true);}, $p\['usernames'\] ?? \[\]);

            if (\!$ids && \!$emails && \!$usernames) {  
                return new WP\_Error('invalid','Envía ids o emails o usernames',\['status'=\>400\]);  
            }

            $targets \= $ids;

            foreach ($emails as $e) {  
                $u \= get\_user\_by('email',$e);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }  
            foreach ($usernames as $un) {  
                $u \= get\_user\_by('login',$un);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }

            $targets \= array\_values(array\_unique(array\_filter($targets)));  
            $results \= \[\];  
            foreach ($targets as $uid) {  
                $ok \= wp\_delete\_user($uid);  
                $results\[\] \= \['user\_id'=\>$uid,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$results\];  
        }  
    \]);  
});

/\* \============================================================================  
 \* 10\) CRUD de Órdenes (WooCommerce)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    if ( \! function\_exists('wc\_get\_order') ) return; // Woo requerido

    // \-------- Helpers \--------

    // Normaliza un array asociativo (recorta strings y desescapa)  
    $cmu\_clean\_assoc \= function($arr){  
        $out \= \[\];  
        foreach ((array)$arr as $k=\>$v){  
            if (is\_string($v)) $out\[$k\] \= wp\_unslash(trim($v));  
            else               $out\[$k\] \= $v;  
        }  
        return $out;  
    };  
	  
    // Construye líneas de items a partir de \['sku'| 'product\_id', 'quantity', 'price'?, 'subtotal'?, 'total'?\]  
    $cmu\_order\_set\_items \= function(WC\_Order $order, array $items) {  
        // Elimina items existentes si vamos a reescribir  
        foreach ($order-\>get\_items() as $item\_id \=\> $item) {  
            $order-\>remove\_item($item\_id);  
        }

        foreach ($items as $i=\>$row) {  
            $row \= (array)$row;  
            $qty \= max(1, (int)($row\['quantity'\] ?? 1));

            $pid \= 0;  
            if (\!empty($row\['product\_id'\])) {  
                $pid \= (int)$row\['product\_id'\];  
            } elseif (\!empty($row\['sku'\])) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($row\['sku'\]));  
            }  
            if (\!$pid) throw new Exception("Item $i: falta product\_id o sku válido");

            $product \= wc\_get\_product($pid);  
            if (\!$product) throw new Exception("Item $i: producto inválido ($pid)");

            $item \= new WC\_Order\_Item\_Product();  
            $item-\>set\_product($product);  
            $item-\>set\_quantity($qty);

            // Permitir override de precios si se envía  
            if (isset($row\['subtotal'\])) $item-\>set\_subtotal( (float)$row\['subtotal'\] );  
            if (isset($row\['total'\]))    $item-\>set\_total( (float)$row\['total'\] );  
            // Compat: price directo  
            if (isset($row\['price'\]) && \!isset($row\['subtotal'\]) && \!isset($row\['total'\])) {  
                $price \= (float)$row\['price'\];  
                $item-\>set\_subtotal($price \* $qty);  
                $item-\>set\_total($price \* $qty);  
            }

            // Meta por item (opcional)  
            if (\!empty($row\['meta'\]) && is\_array($row\['meta'\])) {  
                foreach ($row\['meta'\] as $mk=\>$mv){  
                    $item-\>add\_meta\_data(sanitize\_key($mk), is\_scalar($mv)? wp\_unslash($mv) : wp\_json\_encode($mv));  
                }  
            }

            $order-\>add\_item($item);  
        }  
    };

    // Añade/reescribe líneas de envío: \[{method\_id?, method\_title?, total, meta?}\]  
    $cmu\_order\_set\_shipping \= function(WC\_Order $order, array $ship\_lines){  
        foreach ($order-\>get\_items('shipping') as $sid \=\> $sitem) {  
            $order-\>remove\_item($sid);  
        }  
        foreach ($ship\_lines as $i=\>$row){  
            $row \= (array)$row;  
            $ship \= new WC\_Order\_Item\_Shipping();  
            $ship-\>set\_method\_id( sanitize\_text\_field($row\['method\_id'\] ?? 'custom') );  
            $ship-\>set\_method\_title( sanitize\_text\_field($row\['method\_title'\] ?? 'Shipping') );  
            $ship-\>set\_total( (float)($row\['total'\] ?? 0\) );  
            if (\!empty($row\['meta'\]) && is\_array($row\['meta'\])) {  
                foreach ($row\['meta'\] as $mk=\>$mv){  
                    $ship-\>add\_meta\_data(sanitize\_key($mk), is\_scalar($mv)? wp\_unslash($mv) : wp\_json\_encode($mv));  
                }  
            }  
            $order-\>add\_item($ship);  
        }  
    };

    // Añade/reescribe cupones: \[{code, discount?, discount\_tax?}\]  
    $cmu\_order\_set\_coupons \= function(WC\_Order $order, array $coupons){  
        foreach ($order-\>get\_items('coupon') as $cid \=\> $citem) {  
            $order-\>remove\_item($cid);  
        }  
        foreach ($coupons as $i=\>$row){  
            $row \= (array)$row;  
            if (empty($row\['code'\])) continue;  
            $c \= new WC\_Order\_Item\_Coupon();  
            $c-\>set\_code( sanitize\_text\_field($row\['code'\]) );  
            if (isset($row\['discount'\]))     $c-\>set\_discount( (float)$row\['discount'\] );  
            if (isset($row\['discount\_tax'\])) $c-\>set\_discount\_tax( (float)$row\['discount\_tax'\] );  
            $order-\>add\_item($c);  
        }  
    };  
	  
    // Añade/reescribe fees: \[{name, total, tax\_class?, tax\_status?}\]  
    $cmu\_order\_set\_fees \= function(WC\_Order $order, array $fees){  
        foreach ($order-\>get\_items('fee') as $fid \=\> $fitem) {  
            $order-\>remove\_item($fid);  
        }  
        foreach ($fees as $i=\>$row){  
            $row \= (array)$row;  
            if (empty($row\['name'\])) $row\['name'\] \= 'Fee';  
            $fee \= new WC\_Order\_Item\_Fee();  
            $fee-\>set\_name( sanitize\_text\_field($row\['name'\]) );  
            $fee-\>set\_total( (float)($row\['total'\] ?? 0\) );  
            if (\!empty($row\['tax\_class'\]))  $fee-\>set\_tax\_class( sanitize\_text\_field($row\['tax\_class'\]) );  
            if (\!empty($row\['tax\_status'\])) $fee-\>set\_tax\_status( sanitize\_text\_field($row\['tax\_status'\]) ); // taxable|none  
            $order-\>add\_item($fee);  
        }  
    };

	if (\!function\_exists('cmu\_safe\_order\_meta')) {  
		function cmu\_safe\_order\_meta($post\_id) {  
			$all \= get\_post\_meta($post\_id); // key \=\> array(values)  
			// Lista de exclusión por coincidencia exacta  
			$deny\_exact  \= apply\_filters('cmu\_order\_meta\_deny\_exact', \[  
				'\_shipping\_packages',  
				'\_shipping\_methods',  
				'\_thwcfe\_ship\_to\_billing',  
				'\_thwcfe\_disabled\_fields',  
			\], $post\_id);

			// Lista de exclusión por prefijo  
			$deny\_prefix \= apply\_filters('cmu\_order\_meta\_deny\_prefix', \[  
				'\_thwcfe\_',  
			\], $post\_id);

			$out \= \[\];  
			foreach ($all as $k \=\> $vals) {  
				$skip \= in\_array($k, $deny\_exact, true);  
				if (\!$skip && $deny\_prefix) {  
					foreach ($deny\_prefix as $px) {  
						if ($px \!== '' && strpos($k, $px) \=== 0\) { // empieza por prefijo  
							$skip \= true;  
							break;  
						}  
					}  
				}  
				if ($skip) continue;  
				$out\[$k\] \= $vals; // mantiene el mismo shape que get\_post\_meta  
			}  
			return $out;  
		}  
	}

	  
    // Construye payload JSON de orden  
    function cmu\_order\_payload($order\_id){  
        $order \= wc\_get\_order($order\_id);  
        if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);

        $get\_items \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items() as $it){  
                $p   \= $it-\>get\_product();  
                $pid \= $it-\>get\_product\_id();  
                $sku \= $p ? $p-\>get\_sku() : null;  
                $out\[\] \= \[  
                    'item\_id'   \=\> (int)$it-\>get\_id(),  
                    'product\_id'=\> (int)$pid,  
                    'sku'       \=\> $sku,  
                    'name'      \=\> $it-\>get\_name(),  
                    'quantity'  \=\> (float)$it-\>get\_quantity(),  
                    'subtotal'  \=\> (float)$it-\>get\_subtotal(),  
                    'total'     \=\> (float)$it-\>get\_total(),  
                    'meta'      \=\> $it-\>get\_meta\_data(),  
                \];  
            }  
            return $out;  
        };  
        $get\_shipping \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('shipping') as $s){  
                $out\[\] \= \[  
                    'item\_id'      \=\> (int)$s-\>get\_id(),  
                    'method\_id'    \=\> $s-\>get\_method\_id(),  
                    'method\_title' \=\> $s-\>get\_method\_title(),  
                    'total'        \=\> (float)$s-\>get\_total(),  
                    'meta'         \=\> $s-\>get\_meta\_data(),  
                \];  
            }  
            return $out;  
        };  
        $get\_coupons \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('coupon') as $c){  
                $out\[\] \= \[  
                    'item\_id'      \=\> (int)$c-\>get\_id(),  
                    'code'         \=\> $c-\>get\_code(),  
                    'discount'     \=\> (float)$c-\>get\_discount(),  
                    'discount\_tax' \=\> (float)$c-\>get\_discount\_tax(),  
                \];  
            }  
            return $out;  
        };  
        $get\_fees \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('fee') as $f){  
                $out\[\] \= \[  
                    'item\_id'   \=\> (int)$f-\>get\_id(),  
                    'name'      \=\> $f-\>get\_name(),  
                    'total'     \=\> (float)$f-\>get\_total(),  
                    'tax\_class' \=\> $f-\>get\_tax\_class(),  
                    'tax\_status'=\> $f-\>get\_tax\_status(),  
                \];  
            }  
            return $out;  
        };  
		  
		$descuentos \= cmu\_get\_order\_discounts($order);  
		  
        return \[  
            'id'              \=\> (int)$order-\>get\_id(),  
            'status'          \=\> $order-\>get\_status(),  
            'currency'        \=\> $order-\>get\_currency(),  
            'total'           \=\> (float)$order-\>get\_total(),  
            'subtotal'        \=\> (float)$order-\>get\_subtotal(),  
            'discount\_total'  \=\> (float)$order-\>get\_discount\_total(),  
            'shipping\_total'  \=\> (float)$order-\>get\_shipping\_total(),  
            'total\_tax'       \=\> (float)$order-\>get\_total\_tax(),  
            'payment\_method'  \=\> $order-\>get\_payment\_method(),  
            'payment\_title'   \=\> $order-\>get\_payment\_method\_title(),  
            'transaction\_id'  \=\> $order-\>get\_transaction\_id(),  
            'date\_created'    \=\> $order-\>get\_date\_created() ? $order-\>get\_date\_created()-\>date('c') : null,  
            'date\_paid'       \=\> $order-\>get\_date\_paid() ? $order-\>get\_date\_paid()-\>date('c') : null,  
            'customer\_id'     \=\> (int)$order-\>get\_customer\_id(),  
            'customer\_email'  \=\> $order-\>get\_billing\_email(),  
            'billing'         \=\> \[  
                'first\_name' \=\> $order-\>get\_billing\_first\_name(),  
                'last\_name'  \=\> $order-\>get\_billing\_last\_name(),  
                'company'    \=\> $order-\>get\_billing\_company(),  
                'address\_1'  \=\> $order-\>get\_billing\_address\_1(),  
                'address\_2'  \=\> $order-\>get\_billing\_address\_2(),  
                'city'       \=\> $order-\>get\_billing\_city(),  
                'state'      \=\> $order-\>get\_billing\_state(),  
                'postcode'   \=\> $order-\>get\_billing\_postcode(),  
                'country'    \=\> $order-\>get\_billing\_country(),  
                'email'      \=\> $order-\>get\_billing\_email(),  
                'phone'      \=\> $order-\>get\_billing\_phone(),  
            \],  
            'shipping'        \=\> \[  
                'first\_name' \=\> $order-\>get\_shipping\_first\_name(),  
                'last\_name'  \=\> $order-\>get\_shipping\_last\_name(),  
                'company'    \=\> $order-\>get\_shipping\_company(),  
                'address\_1'  \=\> $order-\>get\_shipping\_address\_1(),  
                'address\_2'  \=\> $order-\>get\_shipping\_address\_2(),  
                'city'       \=\> $order-\>get\_shipping\_city(),  
                'state'      \=\> $order-\>get\_shipping\_state(),  
                'postcode'   \=\> $order-\>get\_shipping\_postcode(),  
                'country'    \=\> $order-\>get\_shipping\_country(),  
                'phone'      \=\> $order-\>get\_meta('\_shipping\_phone'),  
            \],  
            'items'           \=\> $get\_items($order),  
            'shipping\_lines'  \=\> $get\_shipping($order),  
            'coupon\_lines'    \=\> $get\_coupons($order),  
            'fee\_lines'       \=\> $get\_fees($order),  
            'meta'            \=\> cmu\_safe\_order\_meta($order-\>get\_id()),// crudo (todas las metas)  
			'Descuentos'      \=\> $descuentos,  
        \];  
    }

	if (\!function\_exists('cmu\_get\_order\_discounts')) {  
		/\*\*  
		 \* Descuentos por orden:  
		 \* \- Items: lista solo si tienen descuento (catálogo y/o línea)  
		 \*   \- DescuentoCatalogo: (regular\_price \- sale\_price)  
		 \*   \- DescuentoLinea: (line\_subtotal \- line\_total)  \[excluye impuestos\]  
		 \*   \- DescuentoTotalProducto: suma de ambos  
		 \* \- Cupones: códigos y montos aplicados a la orden  
		 \*/  
		function cmu\_get\_order\_discounts( WC\_Order $order ) {  
			$items\_desc \= \[\];

			foreach ( $order-\>get\_items('line\_item') as $item\_id \=\> $item ) {  
				$product \= $item-\>get\_product();  
				if ( \! $product ) continue;

				$name \= $item-\>get\_name();  
				$sku  \= $product-\>get\_sku() ?: '';  
				$qty  \= max(1, (int)$item-\>get\_quantity()); // evitar /0

				// \---------- Descuento de Catálogo (regular vs sale) \----------  
				$regular\_raw \= $product-\>get\_regular\_price();  
				$sale\_raw    \= $product-\>get\_sale\_price();

				$desc\_cat\_unit  \= 0.0;  
				$desc\_cat\_total \= 0.0;  
				if ($regular\_raw \!== '' && $sale\_raw \!== '') {  
					$regular \= (float)$regular\_raw;  
					$sale    \= (float)$sale\_raw;  
					if ($regular \> $sale) {  
						$desc\_cat\_unit  \= $regular \- $sale;  
						$desc\_cat\_total \= $desc\_cat\_unit \* $qty;  
					}  
				}

				// \---------- Descuento de Línea (cupones/reglas sobre el ítem) \----------  
				// Nota: subtotal y total EXCLUYEN impuestos. Si lo quieres con impuestos, suma get\_\*\_tax().  
				$line\_subtotal \= (float)$item-\>get\_subtotal();  
				$line\_total    \= (float)$item-\>get\_total();

				$desc\_line\_total \= max(0, $line\_subtotal \- $line\_total);  
				$desc\_line\_unit  \= $qty ? ($desc\_line\_total / $qty) : 0.0;

				// \---------- Solo incluir si hay algún descuento \----------  
				if ( $desc\_cat\_total \> 0 || $desc\_line\_total \> 0 ) {  
					$items\_desc\[\] \= \[  
						'Item'                        \=\> trim( $name . ( $sku ? " ($sku)" : '' ) ),  
						'Nombre'                      \=\> $name,  
						'Sku'                         \=\> $sku,  
						'Cantidad'                    \=\> $qty,

						// Catálogo  
						'RegularPrice'                \=\> isset($regular) ? round($regular, 2\) : null,  
						'SalePrice'                   \=\> isset($sale) ? round($sale, 2\) : null,  
						'DescuentoCatalogoUnitario'   \=\> round($desc\_cat\_unit, 2),  
						'DescuentoCatalogoTotal'      \=\> round($desc\_cat\_total, 2),

						// Línea (por cupones/reglas sobre el ítem)  
						'PrecioLineaSubtotal'         \=\> round($line\_subtotal, 2), // total del ítem antes de descuentos de línea  
						'PrecioLineaTotal'            \=\> round($line\_total, 2),    // total pagado por el ítem (sin impuestos)  
						'DescuentoLineaUnitario'      \=\> round($desc\_line\_unit, 2),  
						'DescuentoLineaTotal'         \=\> round($desc\_line\_total, 2),

						// Total por producto  
						'DescuentoTotalProducto'      \=\> round($desc\_cat\_total \+ $desc\_line\_total, 2),

						'Moneda'                      \=\> $order-\>get\_currency(),  
					\];  
				}  
			}

			// \---------- Cupones de la orden (al final) \----------  
			$cupones \= \[\];  
			foreach ( $order-\>get\_items('coupon') as $c\_item ) {  
				$code  \= $c\_item-\>get\_code();  
				$monto \= (float)$c\_item-\>get\_discount() \+ (float)$c\_item-\>get\_discount\_tax();  
				$cupones\[\] \= \[  
					'Codigo' \=\> $code,  
					'Monto'  \=\> round($monto, 2),  
					'Moneda' \=\> $order-\>get\_currency(),  
				\];  
			}

			return \[  
				'Items'   \=\> array\_values($items\_desc),  
				'Cupones' \=\> array\_values($cupones),  
			\];  
		}  
	}

    // \--------- CREAR \---------  
    register\_rest\_route('custom-api/v1', '/order', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
            $d \= $request-\>get\_json\_params() ?: \[\];

            // Cliente: por id o email  
            $customer\_id \= 0;  
            if (\!empty($d\['customer\_id'\])) {  
                $customer\_id \= (int)$d\['customer\_id'\];  
            } elseif (\!empty($d\['customer\_email'\])) {  
                $u \= get\_user\_by('email', sanitize\_email($d\['customer\_email'\]));  
                if ($u) $customer\_id \= (int)$u-\>ID;  
            }

            $order \= wc\_create\_order(\['customer\_id'=\>$customer\_id\]);

            // Billing / Shipping  
            if (\!empty($d\['billing'\]))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\]), 'billing');  
            if (\!empty($d\['shipping'\])) $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\]), 'shipping');  
            if (\!empty($d\['shipping'\]\['phone'\])) $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($d\['shipping'\]\['phone'\])));

            // Items (requeridos)  
            $items \= $d\['items'\] ?? \[\];  
            if (\!is\_array($items) || \!$items) return new WP\_Error('invalid','Envía items (array)', \['status'=\>400\]);  
            $cmu\_order\_set\_items($order, $items);

            // Fees / Shipping lines / Coupons (opcionales)  
            if (\!empty($d\['fee\_lines'\]) && is\_array($d\['fee\_lines'\])) $cmu\_order\_set\_fees($order, $d\['fee\_lines'\]);  
            if (\!empty($d\['shipping\_lines'\]) && is\_array($d\['shipping\_lines'\])) $cmu\_order\_set\_shipping($order, $d\['shipping\_lines'\]);  
            if (\!empty($d\['coupon\_lines'\]) && is\_array($d\['coupon\_lines'\])) $cmu\_order\_set\_coupons($order, $d\['coupon\_lines'\]);

            // Método de pago / status  
            if (\!empty($d\['payment\_method'\])) {  
                $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
                if (\!empty($d\['payment\_method\_title'\])) {  
                    $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
                }  
            }  
            if (\!empty($d\['status'\])) {  
                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) ); // e.g. pending|processing|completed  
            }

            // Meta libre en la orden (opcional)  
            if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
                foreach ($d\['meta'\] as $k=\>$v) {  
                    $order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
                }  
            }

            $order-\>calculate\_totals();

            // Marcar como pagada (opcional)  
            if (\!empty($d\['set\_paid'\])) {  
                $order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
            } elseif (\!empty($d\['transaction\_id'\])) {  
                $order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
            }

            $order-\>save();

            return \['success'=\>true,'order\_id'=\>(int)$order-\>get\_id(),'status'=\>$order-\>get\_status()\];  
        }  
    \]);

    // \--------- LEER (uno) \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            return cmu\_order\_payload($id);  
        }  
    \]);

    // \--------- LISTAR (paginado \+ filtros avanzados, conteo real) \---------  
	register\_rest\_route('custom-api/v1', '/orders', \[  
		'methods'  \=\> 'GET',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request){

			// \---------- Helpers locales \----------

			// A: parsea lista (coma|array) a array de enteros  
			$parse\_id\_list \= function($v){  
				if (is\_array($v)) {  
					return array\_values(array\_filter(array\_map('intval', $v)));  
				}  
				if (is\_string($v)) {  
					$arr \= array\_map('trim', explode(',', $v));  
					return array\_values(array\_filter(array\_map('intval', $arr)));  
				}  
				return \[\];  
			};

			// B: normaliza status (sin prefijo wc-), soporta coma o array  
			$parse\_status \= function($v){  
				$to\_arr \= is\_array($v) ? $v : (is\_string($v) && $v \!== '' ? preg\_split('/\\s\*,\\s\*/', $v) : \[\]);  
				$out \= \[\];  
				foreach ($to\_arr as $s) {  
					$s \= sanitize\_text\_field($s);  
					if ($s \=== '' || strtolower($s) \=== 'any') continue;  
					if (stripos($s, 'wc-') \=== 0\) $s \= substr($s, 3);  
					$out\[\] \= $s;  
				}  
				// evita duplicados  
				return array\_values(array\_unique($out));  
			};

			// C: valida y normaliza fechas (Y-m-d o ISO8601) para WC\_Order\_Query (after/before)  
			$parse\_date \= function($v){  
				if (\!$v) return null;  
				$v \= trim((string)$v);  
				// strtotime soporta ISO8601/Y-m-d; si falla, null  
				$ts \= strtotime($v);  
				if ($ts \=== false) return null;  
				// Woo acepta string 'Y-m-d H:i:s' o fecha 'Y-m-d'  
				return gmdate('Y-m-d H:i:s', $ts);  
			};

			// D: detección básica de email / dígitos / texto  
			$looks\_email \= function($s){  
				return (bool)filter\_var($s, FILTER\_VALIDATE\_EMAIL);  
			};  
			$is\_digits \= function($s){  
				return (bool)preg\_match('/^\\d+$/', $s);  
			};

			// E: sanitiza operador de meta\_compare  
			$sanitize\_meta\_compare \= function($cmp){  
				$allowed \= \['=', '\!=', '\>', '\>=', '\<', '\<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'EXISTS', 'NOT EXISTS', 'REGEXP', 'NOT REGEXP', 'RLIKE'\];  
				$cmp \= strtoupper(trim((string)$cmp));  
				return in\_array($cmp, $allowed, true) ? $cmp : null;  
			};

			// \---------- Parámetros básicos \----------  
			$page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
			$per\_page \= max(1, min(200, (int)($request-\>get\_param('per\_page') ?: 50)));

			$orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'date'); // date|modified|id|total  
			$order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
			$order    \= in\_array($order, \['ASC','DESC'\], true) ? $order : 'DESC';

			// \---------- Construcción de args base \----------  
			$args \= \[  
				'type'      \=\> 'shop\_order',  
				'paginate'  \=\> true,        // \<- clave: devuelve objeto con orders, total, max\_num\_pages  
				'limit'     \=\> $per\_page,  
				'page'      \=\> $page,  
				'return'    \=\> 'objects',   // obtendremos objetos WC\_Order y luego sacamos payload  
			\];

			// \---------- status (uno o varios) \----------  
			$status\_param \= $request-\>get\_param('status');  
			$statuses \= $parse\_status($status\_param);  
			if (\!empty($statuses)) {  
				$args\['status'\] \= $statuses; // array de slugs sin 'wc-'  
			}  
			// Si llega 'any' o vacío, NO pasar 'status' para que incluya todos

			// \---------- include / exclude \----------  
			$include \= $parse\_id\_list($request-\>get\_param('include'));  
			if ($include) $args\['include'\] \= $include;

			$exclude \= $parse\_id\_list($request-\>get\_param('exclude'));  
			if ($exclude) $args\['exclude'\] \= $exclude;

			// \---------- customer\_id / customer\_email \----------  
			if ($request-\>get\_param('customer\_id') \!== null) {  
				$args\['customer'\] \= max(0, (int)$request-\>get\_param('customer\_id'));  
			}  
			$customer\_email \= sanitize\_email($request-\>get\_param('customer\_email'));  
			if ($customer\_email) {  
				// Filtro exacto por email de facturación si parece email válido  
				$args\['billing\_email'\] \= $customer\_email;  
			}

			// \---------- transaction\_id \----------  
			$transaction\_id \= sanitize\_text\_field($request-\>get\_param('transaction\_id') ?: '');  
			if ($transaction\_id \!== '') {  
				$args\['transaction\_id'\] \= $transaction\_id;  
			}

			// \---------- Rangos de fecha: created \----------  
			$dc\_from \= $parse\_date($request-\>get\_param('date\_created\_from'));  
			$dc\_to   \= $parse\_date($request-\>get\_param('date\_created\_to'));  
			if ($dc\_from || $dc\_to) {  
				$args\['date\_created'\] \= array\_filter(\[  
					'after'     \=\> $dc\_from,  
					'before'    \=\> $dc\_to,  
					'inclusive' \=\> true,  
				\]);  
			}

			// \---------- Rangos de fecha: modified \----------  
			$dm\_from \= $parse\_date($request-\>get\_param('date\_modified\_from'));  
			$dm\_to   \= $parse\_date($request-\>get\_param('date\_modified\_to'));  
			if ($dm\_from || $dm\_to) {  
				$args\['date\_modified'\] \= array\_filter(\[  
					'after'     \=\> $dm\_from,  
					'before'    \=\> $dm\_to,  
					'inclusive' \=\> true,  
				\]);  
			}

			// \---------- Rango de totales \----------  
			$min\_total \= $request-\>get\_param('min\_total');  
			$max\_total \= $request-\>get\_param('max\_total');  
			$meta\_query \= \[\];

			if ($min\_total \!== null || $max\_total \!== null) {  
				$minv \= is\_numeric($min\_total) ? (float)$min\_total : null;  
				$maxv \= is\_numeric($max\_total) ? (float)$max\_total : null;

				if ($minv \!== null && $maxv \!== null && $minv \> $maxv) {  
					return new WP\_Error('bad\_request', 'min\_total no puede ser mayor que max\_total', \['status'=\>400\]);  
				}

				if ($minv \!== null && $maxv \!== null) {  
					$meta\_query\[\] \= \[  
						'key'     \=\> '\_order\_total',  
						'value'   \=\> \[$minv, $maxv\],  
						'compare' \=\> 'BETWEEN',  
						'type'    \=\> 'NUMERIC',  
					\];  
				} elseif ($minv \!== null) {  
					$meta\_query\[\] \= \[  
						'key'     \=\> '\_order\_total',  
						'value'   \=\> $minv,  
						'compare' \=\> '\>=',  
						'type'    \=\> 'NUMERIC',  
					\];  
				} elseif ($maxv \!== null) {  
					$meta\_query\[\] \= \[  
						'key'     \=\> '\_order\_total',  
						'value'   \=\> $maxv,  
						'compare' \=\> '\<=',  
						'type'    \=\> 'NUMERIC',  
					\];  
				}  
			}

			// \---------- meta\_key/meta\_value/meta\_compare (simple) \----------  
			$meta\_key     \= sanitize\_text\_field($request-\>get\_param('meta\_key') ?: '');  
			$meta\_value   \= $request-\>get\_param('meta\_value'); // puede ser string o array  
			$meta\_compare \= $request-\>get\_param('meta\_compare');

			if ($meta\_key \!== '') {  
				$cmp \= $meta\_compare \!== null ? $meta\_compare : '=';  
				$cmp \= $sanitize\_meta\_compare($cmp);  
				if ($cmp \=== null) {  
					return new WP\_Error('bad\_request', 'meta\_compare inválido', \['status'=\>400\]);  
				}  
				$mq \= \[  
					'key'     \=\> $meta\_key,  
					'compare' \=\> $cmp,  
				\];  
				if ($meta\_value \!== null) {  
					// Permite array para IN/NOT IN/BETWEEN  
					if (is\_array($meta\_value)) {  
						$san \= \[\];  
						foreach ($meta\_value as $v) {  
							$san\[\] \= is\_scalar($v) ? wp\_unslash((string)$v) : wp\_json\_encode($v);  
						}  
						$mq\['value'\] \= $san;  
					} else {  
						$mq\['value'\] \= is\_scalar($meta\_value) ? wp\_unslash((string)$meta\_value) : wp\_json\_encode($meta\_value);  
					}  
				}  
				// Si el valor parece numérico y el operador lo amerita, forzamos NUMERIC para ordenar/filtrar mejor  
				if (isset($mq\['value'\]) && (is\_numeric($mq\['value'\]) || (is\_array($mq\['value'\]) && count(array\_filter($mq\['value'\], 'is\_numeric')) \=== count($mq\['value'\])))) {  
					$mq\['type'\] \= 'NUMERIC';  
				}  
				$meta\_query\[\] \= $mq;  
			}

			// \---------- meta\_query JSON avanzada (opcional) \----------  
			$meta\_query\_json \= $request-\>get\_param('meta\_query');  
			if ($meta\_query\_json) {  
				$decoded \= is\_array($meta\_query\_json) ? $meta\_query\_json : json\_decode((string)$meta\_query\_json, true);  
				if (json\_last\_error() \=== JSON\_ERROR\_NONE && is\_array($decoded)) {  
					// Validación muy básica de estructura  
					// Permitimos recibir directamente un array de cláusulas o un array con 'relation'/'clauses'  
					$mq\_norm \= $decoded;  
					// Sanitizado mínimo  
					$sanitize\_clause \= function($clause) use ($sanitize\_meta\_compare) {  
						if (\!is\_array($clause)) return null;  
						$out \= \[\];  
						foreach ($clause as $k=\>$v){  
							switch($k){  
								case 'key':     $out\['key'\] \= sanitize\_text\_field((string)$v); break;  
								case 'value':   $out\['value'\] \= $v; break; // se deja libre (puede ser array)  
								case 'compare':  
									$cmp \= $sanitize\_meta\_compare($v);  
									if ($cmp \=== null) return null;  
									$out\['compare'\] \= $cmp;  
									break;  
								case 'type':  
									// NUMERIC/CHAR/BINARY/DATE/DATETIME/DECIMAL etc. (dejamos pasar tras sanitize\_text\_field)  
									$out\['type'\] \= sanitize\_text\_field((string)$v);  
									break;  
								case 'relation':  
									$rel \= strtoupper((string)$v);  
									$out\['relation'\] \= in\_array($rel, \['AND','OR'\], true) ? $rel : 'AND';  
									break;  
								default:  
									// ignora claves desconocidas  
									break;  
							}  
						}  
						return $out;  
					};

					if (isset($mq\_norm\['relation'\]) || array\_keys($mq\_norm) \!== range(0, count($mq\_norm)-1)) {  
						// Forma asociativa (posible 'relation' \+ cláusulas con índices)  
						$relation \= isset($mq\_norm\['relation'\]) ? strtoupper((string)$mq\_norm\['relation'\]) : 'AND';  
						$relation \= in\_array($relation, \['AND','OR'\], true) ? $relation : 'AND';  
						$composed \= \['relation' \=\> $relation\];

						foreach ($mq\_norm as $k=\>$v){  
							if ($k \=== 'relation') continue;  
							$cl \= $sanitize\_clause($v);  
							if ($cl) $composed\[\] \= $cl;  
						}  
						if (count($composed) \> 1\) {  
							$meta\_query\[\] \= $composed;  
						}  
					} else {  
						// Lista de cláusulas simples  
						$block \= \[\];  
						foreach ($mq\_norm as $clause){  
							$cl \= $sanitize\_clause($clause);  
							if ($cl) $block\[\] \= $cl;  
						}  
						if ($block) $meta\_query \= array\_merge($meta\_query, $block);  
					}  
				} else {  
					return new WP\_Error('bad\_request','meta\_query JSON inválido', \['status'=\>400\]);  
				}  
			}

			if ($meta\_query) {  
				// Si ya hay varias, añadimos relation AND por defecto  
				if (\!isset($meta\_query\['relation'\])) {  
					$args\['meta\_query'\] \= array\_merge(\['relation'=\>'AND'\], $meta\_query);  
				} else {  
					$args\['meta\_query'\] \= $meta\_query;  
				}  
			}

			// \---------- search flexible \----------  
			$search \= (string)($request-\>get\_param('search') ?? '');  
			$search \= trim(wp\_unslash($search));  
			if ($search \!== '') {  
				if ($is\_digits($search)) {  
					// ID exacto  
					$args\['include'\] \= \[ (int)$search \];  
				} elseif ($looks\_email($search)) {  
					$args\['billing\_email'\] \= sanitize\_email($search);  
				} else {  
					// 1\) Intentar número de pedido estilo "\#1234" o secuencial sin '\#'  
					$maybe\_num \= ltrim($search, "\# \\t\\n\\r\\0\\x0B");  
					if ($is\_digits($maybe\_num)) {  
						// Muchos sitios usan \_order\_number (Sequential Order Numbers)  
						$args\['meta\_query'\]\[\] \= \[  
							'key'     \=\> '\_order\_number',  
							'value'   \=\> $maybe\_num,  
							'compare' \=\> '=',  
						\];  
					} else {  
						// 2\) Búsqueda por nombre/apellido y, opcional, teléfono  
						// Nota: Woo no tiene args nativos para LIKE en first/last phone, vamos por meta\_query  
						$like \= '%' . $GLOBALS\['wpdb'\]-\>esc\_like($search) . '%';  
						$name\_block \= \[  
							'relation' \=\> 'OR',  
							\[  
								'key'     \=\> '\_billing\_first\_name',  
								'value'   \=\> $like,  
								'compare' \=\> 'LIKE',  
							\],  
							\[  
								'key'     \=\> '\_billing\_last\_name',  
								'value'   \=\> $like,  
								'compare' \=\> 'LIKE',  
							\],  
						\];  
						// Si además el texto parece teléfono (contiene dígitos suficientes), incluimos phone  
						if (preg\_match('/\\d{3,}/', $search)) {  
							$name\_block\[\] \= \[  
								'key'     \=\> '\_billing\_phone',  
								'value'   \=\> $like,  
								'compare' \=\> 'LIKE',  
							\];  
						}

						// Empujar bloque OR junto a otros meta\_query  
						if (\!isset($args\['meta\_query'\])) {  
							$args\['meta\_query'\] \= \['relation'=\>'AND', $name\_block\];  
						} else {  
							// Si ya existe meta\_query, enganchar el bloque  
							if (\!isset($args\['meta\_query'\]\['relation'\])) {  
								$args\['meta\_query'\] \= array\_merge(\['relation'=\>'AND'\], $args\['meta\_query'\]);  
							}  
							$args\['meta\_query'\]\[\] \= $name\_block;  
						}  
					}  
				}  
			}

			// \---------- orderby mapping \----------  
			// Woo soporta: 'date', 'modified', 'id', 'include' y meta\_value(\_num)  
			switch ($orderby) {  
				case 'id':  
					$args\['orderby'\] \= 'ID';  
					$args\['order'\]   \= $order;  
					break;  
				case 'modified':  
					$args\['orderby'\] \= 'modified';  
					$args\['order'\]   \= $order;  
					break;  
				case 'total':  
					// Ordenar por total requiere meta\_key=\_order\_total \+ meta\_value\_num  
					$args\['meta\_key'\] \= '\_order\_total';  
					$args\['orderby'\]  \= 'meta\_value\_num';  
					$args\['order'\]    \= $order;  
					break;  
				case 'date':  
				default:  
					$args\['orderby'\] \= 'date';  
					$args\['order'\]   \= $order;  
					break;  
			}

			// \---------- Ejecutar query paginada \----------  
			$q \= wc\_get\_orders($args); // objeto: \-\>orders (array), \-\>total (int), \-\>max\_num\_pages (int)

			// \---------- Armar respuesta \----------  
			$rows \= \[\];  
			foreach ((array)$q-\>orders as $order) {  
				// $order es WC\_Order  
				$rows\[\] \= cmu\_order\_payload($order-\>get\_id());  
			}

			return \[  
				'success'    \=\> true,  
				'page'       \=\> (int)$page,  
				'per\_page'   \=\> (int)$per\_page,  
				'total'      \=\> (int)$q-\>total,           // conteo real de la misma consulta  
				'max\_pages'  \=\> (int)$q-\>max\_num\_pages,   // páginas calculadas por WC  
				'rows'       \=\> $rows,  
			\];  
		}  
	\]);

    // \--------- ACTUALIZAR (replace items si se envían) \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
            $id \= (int)$request\['id'\];  
            $order \= wc\_get\_order($id);  
            if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];

            // Direcciones  
            if (array\_key\_exists('billing', $d))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\] ?: \[\]), 'billing');  
            if (array\_key\_exists('shipping',$d))  $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\] ?: \[\]), 'shipping');  
            if (\!empty($d\['shipping'\]\['phone'\]) || array\_key\_exists('shipping', $d)) {  
                $phone \= $d\['shipping'\]\['phone'\] ?? '';  
                if ($phone \=== '') $order-\>delete\_meta\_data('\_shipping\_phone'); else $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($phone)));  
            }

            // Items: si se envía "items", reemplaza todos  
            if (array\_key\_exists('items', $d)) {  
                $items \= (array)$d\['items'\];  
                if ($items) $cmu\_order\_set\_items($order, $items);  
                else {  
                    // si viene vacío, significa limpiar  
                    foreach ($order-\>get\_items() as $iid=\>$it) $order-\>remove\_item($iid);  
                }  
            }

            // Fees, Shipping lines, Coupons  
            if (array\_key\_exists('fee\_lines',$d)) {  
                $fees \= (array)$d\['fee\_lines'\];  
                if ($fees) $cmu\_order\_set\_fees($order, $fees);  
                else foreach ($order-\>get\_items('fee') as $fid=\>$f) $order-\>remove\_item($fid);  
            }  
            if (array\_key\_exists('shipping\_lines',$d)) {  
                $ship \= (array)$d\['shipping\_lines'\];  
                if ($ship) $cmu\_order\_set\_shipping($order, $ship);  
                else foreach ($order-\>get\_items('shipping') as $sid=\>$s) $order-\>remove\_item($sid);  
            }  
            if (array\_key\_exists('coupon\_lines',$d)) {  
                $cps \= (array)$d\['coupon\_lines'\];  
                if ($cps) $cmu\_order\_set\_coupons($order, $cps);  
                else foreach ($order-\>get\_items('coupon') as $cid=\>$c) $order-\>remove\_item($cid);  
            }

            // Cliente / pago / status  
            if (array\_key\_exists('customer\_id',$d))   $order-\>set\_customer\_id( (int)$d\['customer\_id'\] );  
            if (\!empty($d\['payment\_method'\]))        $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
            if (\!empty($d\['payment\_method\_title'\]))  $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
            if (\!empty($d\['status'\]))                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) );

            // Meta libre  
            if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
                foreach ($d\['meta'\] as $k=\>$v) {  
                    $order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
                }  
            }

            // Totales  
            $order-\>calculate\_totals();

            // Pago/Transacción  
            if (\!empty($d\['set\_paid'\])) {  
                $order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
            } elseif (\!empty($d\['transaction\_id'\])) {  
                $order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
            }

            $order-\>save();

            return \['success'=\>true,'order\_id'=\>$order-\>get\_id(),'status'=\>$order-\>get\_status(),'mode'=\>'updated'\];  
        }  
    \]);

    // \--------- BORRAR \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $order \= wc\_get\_order($id);  
            if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);  
	  
	/\* \---------- POST /orders/batch (create\_only) \---------- \*/  
	register\_rest\_route('custom-api/v1', '/orders/batch', \[  
		'methods'  \=\> 'POST',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
			$p \= $request-\>get\_json\_params() ?: \[\];  
			$rows \= $p\['orders'\] ?? $p\['rows'\] ?? \[\];  
			if (\!is\_array($rows) || \!$rows) {  
				return new WP\_Error('invalid\_data','Envía "orders" (array de objetos).',\['status'=\>400\]);  
			}

			$results \= \[\];  
			foreach ($rows as $i=\>$d) {  
				try {  
					$d \= (array)$d;

					// Validación mínima  
					$items \= $d\['items'\] ?? \[\];  
					if (\!is\_array($items) || \!$items) throw new Exception("Fila $i: falta items (array)");

					// Cliente por id o email  
					$customer\_id \= 0;  
					if (\!empty($d\['customer\_id'\])) {  
						$customer\_id \= (int)$d\['customer\_id'\];  
					} elseif (\!empty($d\['customer\_email'\])) {  
						$u \= get\_user\_by('email', sanitize\_email($d\['customer\_email'\]));  
						if ($u) $customer\_id \= (int)$u-\>ID;  
					}

					$order \= wc\_create\_order(\['customer\_id'=\>$customer\_id\]);

					// Billing / Shipping  
					if (\!empty($d\['billing'\]))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\]), 'billing');  
					if (\!empty($d\['shipping'\])) $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\]), 'shipping');  
					if (\!empty($d\['shipping'\]\['phone'\])) $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($d\['shipping'\]\['phone'\])));

					// Items obligatorios  
					$cmu\_order\_set\_items($order, $items);

					// Fees / Shipping / Coupons (opcionales)  
					if (\!empty($d\['fee\_lines'\]) && is\_array($d\['fee\_lines'\]))         $cmu\_order\_set\_fees($order, $d\['fee\_lines'\]);  
					if (\!empty($d\['shipping\_lines'\]) && is\_array($d\['shipping\_lines'\]))$cmu\_order\_set\_shipping($order, $d\['shipping\_lines'\]);  
					if (\!empty($d\['coupon\_lines'\]) && is\_array($d\['coupon\_lines'\]))    $cmu\_order\_set\_coupons($order, $d\['coupon\_lines'\]);

					// Pago / status  
					if (\!empty($d\['payment\_method'\])) {  
						$order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
						if (\!empty($d\['payment\_method\_title'\])) {  
							$order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
						}  
					}  
					if (\!empty($d\['status'\])) {  
						$order-\>set\_status( sanitize\_text\_field($d\['status'\]) );  
					}

					// Meta libre  
					if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
						foreach ($d\['meta'\] as $k=\>$v) {  
							$order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
						}  
					}

					$order-\>calculate\_totals();

					// Pago/Transacción  
					if (\!empty($d\['set\_paid'\])) {  
						$order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
					} elseif (\!empty($d\['transaction\_id'\])) {  
						$order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
					}

					$order-\>save();

					$results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','order\_id'=\>(int)$order-\>get\_id(),'status'=\>$order-\>get\_status()\];

				} catch (Throwable $e) {  
					$results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
				}  
			}

			return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
		}  
	\]);

	/\* \---------- PUT /orders/batch (update\_only) \---------- \*/  
	register\_rest\_route('custom-api/v1', '/orders/batch', \[  
		'methods'  \=\> 'PUT',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
			$p \= $request-\>get\_json\_params() ?: \[\];  
			$rows \= $p\['orders'\] ?? $p\['updates'\] ?? $p\['rows'\] ?? \[\];  
			if (\!is\_array($rows) || \!$rows) {  
				return new WP\_Error('invalid\_data','Envía "orders" (array con "id").',\['status'=\>400\]);  
			}

			$results \= \[\];  
			foreach ($rows as $i=\>$d) {  
				try {  
					$d \= (array)$d;  
					$id \= isset($d\['id'\]) ? (int)$d\['id'\] : 0;  
					if (\!$id) throw new Exception("Fila $i: falta id");

					$order \= wc\_get\_order($id);  
					if (\!$order) { $results\[\] \= \['index'=\>$i,'success'=\>false,'id'=\>$id,'error'=\>'Orden no encontrada'\]; continue; }

					// Direcciones (replace si se envían)  
					if (array\_key\_exists('billing', $d))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\] ?: \[\]), 'billing');  
					if (array\_key\_exists('shipping',$d))  $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\] ?: \[\]), 'shipping');  
					if (\!empty($d\['shipping'\]\['phone'\]) || array\_key\_exists('shipping', $d)) {  
						$phone \= $d\['shipping'\]\['phone'\] ?? '';  
						if ($phone \=== '') $order-\>delete\_meta\_data('\_shipping\_phone'); else $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($phone)));  
					}

					// Items (si viene, reemplaza todo; si \[\], limpia)  
					if (array\_key\_exists('items',$d)) {  
						$items \= (array)$d\['items'\];  
						if ($items) $cmu\_order\_set\_items($order, $items);  
						else foreach ($order-\>get\_items() as $iid=\>$it) $order-\>remove\_item($iid);  
					}

					// Fees / Shipping / Coupons (replace si se envían)  
					if (array\_key\_exists('fee\_lines',$d)) {  
						$fees \= (array)$d\['fee\_lines'\];  
						if ($fees) $cmu\_order\_set\_fees($order, $fees);  
						else foreach ($order-\>get\_items('fee') as $fid=\>$f) $order-\>remove\_item($fid);  
					}  
					if (array\_key\_exists('shipping\_lines',$d)) {  
						$ship \= (array)$d\['shipping\_lines'\];  
						if ($ship) $cmu\_order\_set\_shipping($order, $ship);  
						else foreach ($order-\>get\_items('shipping') as $sid=\>$s) $order-\>remove\_item($sid);  
					}  
					if (array\_key\_exists('coupon\_lines',$d)) {  
						$cps \= (array)$d\['coupon\_lines'\];  
						if ($cps) $cmu\_order\_set\_coupons($order, $cps);  
						else foreach ($order-\>get\_items('coupon') as $cid=\>$c) $order-\>remove\_item($cid);  
					}

					// Cliente / pago / status  
					if (array\_key\_exists('customer\_id',$d))   $order-\>set\_customer\_id( (int)$d\['customer\_id'\] );  
					if (\!empty($d\['payment\_method'\]))        $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
					if (\!empty($d\['payment\_method\_title'\]))  $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
					if (\!empty($d\['status'\]))                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) );

					// Meta libre  
					if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
						foreach ($d\['meta'\] as $k=\>$v) {  
							$order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
						}  
					}

					// Totales  
					$order-\>calculate\_totals();

					// Pago/Transacción  
					if (\!empty($d\['set\_paid'\])) {  
						$order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
					} elseif (\!empty($d\['transaction\_id'\])) {  
						$order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
					}

					$order-\>save();

					$results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','order\_id'=\>$order-\>get\_id(),'status'=\>$order-\>get\_status()\];

				} catch (Throwable $e) {  
					$results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
				}  
			}

			return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
		}  
	\]);  
});

# 27 \- CUSTOM\_API\_V3\_TEMP2

**27 \- CUSTOM\_API\_V3\_TEMP2**

/\*\*  
 \* Plugin Name: Custom API for Woo (Luis)  
 \* Description: API REST personalizada para WooCommerce con seguridad reforzada, relaciones por SKU, featured toggle y JetEngine meta tipado.  
 \* Version:     1.1.0  
 \* Author:      ClickLab  
 \*/

if (\!defined('ABSPATH')) exit;

/\* \============================================================================  
 \* 0\) Utilidades de seguridad (CORS, Rate Limit, Auth+Permisos)  
 \* \==========================================================================\*/

// CORS (sólo para rutas de este plugin)  
add\_action('rest\_api\_init', function () {  
    add\_filter('rest\_pre\_serve\_request', function($served, $result, $request, $server){  
        $route \= $request-\>get\_route();  
        if (strpos($route, '/custom-api/v1/') \=== 0\) {  
            $origin  \= get\_option('home');  
            $allowed \= defined('CUSTOM\_API\_CORS\_ORIGIN') ? CUSTOM\_API\_CORS\_ORIGIN : $origin;  
            header('Access-Control-Allow-Origin: ' . esc\_url\_raw($allowed));  
            header('Access-Control-Allow-Headers: Content-Type, X-API-KEY');  
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');  
        }  
        return $served;  
    }, 10, 4);  
});

// Rate limit simple por key/IP  
function cmu\_rate\_limited($bucket='default', $limit=300, $window=60){  
    $ip    \= $\_SERVER\['REMOTE\_ADDR'\] ?? '0.0.0.0';  
    $key   \= isset($\_SERVER\['HTTP\_X\_API\_KEY'\]) ? substr(hash('sha256', $\_SERVER\['HTTP\_X\_API\_KEY'\]),0,12) : 'anon';  
    $k     \= "cmu\_rl\_{$bucket}\_{$key}\_{$ip}";  
    $c     \= (int) get\_transient($k);  
    if ($c \>= $limit) return true;  
    set\_transient($k, $c+1, $window);  
    return false;  
}

// Validación de URL de media  
function cmu\_validate\_media\_url($url){  
    if (\!is\_string($url)) return false;  
    $url \= trim($url);  
    if ($url \=== '') return true;  
    $ok \= filter\_var($url, FILTER\_VALIDATE\_URL);  
    if (\!$ok) return false;  
    $scheme \= wp\_parse\_url($url, PHP\_URL\_SCHEME);  
    return in\_array($scheme, \['https','http'\], true);  
}

// AUTH reforzada \+ capability opcional  
function cmu\_auth(WP\_REST\_Request $request){  
    if (\!defined('CUSTOM\_API\_KEY')) return false;  
    $key \= $request-\>get\_header('X-API-KEY');  
    if (\!$key || \!hash\_equals(CUSTOM\_API\_KEY, $key)) return false;  
    $bucket \= substr(md5($request-\>get\_route()),0,8);  
    if (cmu\_rate\_limited($bucket, 300, 60)) {  
        return new WP\_Error('rate\_limited', 'Too Many Requests', \['status'=\>429\]);  
    }  
    return true;  
}  
function cmu\_permission(WP\_REST\_Request $request){  
    $auth \= cmu\_auth($request);  
    if ($auth \!== true) return $auth;  
    // Defensa adicional si hay sesión (no requerido para API key)  
    if (is\_user\_logged\_in() && \!current\_user\_can('manage\_woocommerce')) {  
        return new WP\_Error('forbidden', 'Insufficient permissions', \['status'=\>403\]);  
    }  
    return true;  
}

/\* \============================================================================  
 \* 1\) Helpers de imágenes con límites (HEAD, tamaño, mime) \+ cache por URL  
 \* \==========================================================================\*/  
function cmu\_set\_image\_from\_url\_cached($url){  
    if (\!$url || \!cmu\_validate\_media\_url($url)) return 0;

    // ¿Adjunto ya creado desde esta URL?  
    $existing \= get\_posts(\[  
        'post\_type'   \=\> 'attachment',  
        'meta\_key'    \=\> '\_source\_url',  
        'meta\_value'  \=\> $url,  
        'numberposts' \=\> 1,  
        'fields'      \=\> 'ids',  
    \]);  
    if (\!empty($existing)) return (int)$existing\[0\];

    // HEAD (10s) para validar tamaño y tipo si el server lo permite  
    add\_filter('http\_request\_timeout', fn() \=\> 10);  
    $head \= wp\_remote\_head($url, \['timeout'=\>10,'redirection'=\>2,'sslverify'=\>true\]);  
    if (\!is\_wp\_error($head)) {  
        $len  \= (int) wp\_remote\_retrieve\_header($head, 'content-length');  
        $type \= wp\_remote\_retrieve\_header($head, 'content-type');  
        if ($len && $len \> 5\*1024\*1024) return 0; // \>5MB  
        if ($type && strpos($type, 'image/') \!== 0\) return 0;  
    }

    require\_once ABSPATH.'wp-admin/includes/image.php';  
    require\_once ABSPATH.'wp-admin/includes/file.php';  
    require\_once ABSPATH.'wp-admin/includes/media.php';

    $tmp \= download\_url($url, 10);  
    if (is\_wp\_error($tmp)) return 0;

    $mime \= function\_exists('mime\_content\_type') ? mime\_content\_type($tmp) : 'image/jpeg';  
    if (strpos((string)$mime, 'image/') \!== 0\) { @unlink($tmp); return 0; }

    $file \= \[  
        'name'     \=\> wp\_basename(parse\_url($url, PHP\_URL\_PATH)),  
        'type'     \=\> $mime,  
        'tmp\_name' \=\> $tmp,  
        'error'    \=\> 0,  
        'size'     \=\> filesize($tmp),  
    \];

    $id \= media\_handle\_sideload($file, 0);  
    if (is\_wp\_error($id)) { @unlink($tmp); return 0; }

    update\_post\_meta($id, '\_source\_url', esc\_url\_raw($url));  
    return (int)$id;  
}

/\* \============================================================================  
 \* 2\) Helpers de términos (Woo/Jet) \+ resolver IDs desde SKUs  
 \* \==========================================================================\*/  
function cmu\_valid\_term\_ids($names, $taxonomy){  
    if (\!is\_array($names)) return \[\];  
    return array\_filter(array\_map(function($name) use ($taxonomy){  
        $name \= trim(wp\_strip\_all\_tags($name));  
        if ($name \=== '') return null;  
        $slug \= sanitize\_title($name);  
        $term \= get\_term\_by('slug', $slug, $taxonomy);  
        if ($term) return (int)$term-\>term\_id;  
        $created \= wp\_insert\_term($name, $taxonomy);  
        return is\_wp\_error($created) ? null : (int)$created\['term\_id'\];  
    }, $names));  
}

function cmu\_resolve\_product\_ids($list, $prefer \= 'sku'){  
    if (\!is\_array($list)) return \[\];  
    $out \= \[\];  
    foreach ($list as $val) {  
        if (is\_int($val)) {  
            $pid \= (int)$val;  
            if ($pid \> 0 && wc\_get\_product($pid)) { $out\[\] \= $pid; }  
            continue;  
        }  
        $s \= trim((string)$val);  
        if ($s \=== '') continue;

        $pid \= 0;  
        if ($prefer \=== 'sku') {  
            $pid \= wc\_get\_product\_id\_by\_sku($s);  
            if (\!$pid && ctype\_digit($s)) {  
                $as\_id \= (int)$s;  
                if ($as\_id \> 0 && wc\_get\_product($as\_id)) $pid \= $as\_id;  
            }  
        } else {  
            if (ctype\_digit($s)) {  
                $as\_id \= (int)$s;  
                if ($as\_id \> 0 && wc\_get\_product($as\_id)) $pid \= $as\_id;  
                if (\!$pid) $pid \= wc\_get\_product\_id\_by\_sku($s);  
            } else {  
                $pid \= wc\_get\_product\_id\_by\_sku($s);  
            }  
        }  
        if ($pid) $out\[\] \= (int)$pid;  
    }  
    return array\_values(array\_unique($out));  
}

/\* \============================================================================  
 \* 3\) JetEngine metacampos: whitelist \+ tipado  
 \* \==========================================================================\*/  
function cmu\_jet\_whitelist(){  
  return \[  
    // Ejemplos: ajusta a tus metacampos reales  
    'jet\_rating'        \=\> 'number',  
    'jet\_is\_new'        \=\> 'bool',  
    'jet\_supplier\_code' \=\> 'text',  
    'jet\_specs'         \=\> 'array', // se guarda como JSON  
  \];  
}  
function cmu\_apply\_meta\_whitelist($post\_id, $meta\_arr){  
  if (\!is\_array($meta\_arr)) return;  
  $map \= cmu\_jet\_whitelist();  
  foreach ($meta\_arr as $k=\>$v){  
    if (\!isset($map\[$k\])) continue;  
    switch ($map\[$k\]){  
      case 'number': $v \= is\_numeric($v) ? 0 \+ $v : null; break;  
      case 'bool':   $v \= (bool)$v ? 1 : 0; break;  
      case 'array':  $v \= wp\_json\_encode($v, JSON\_UNESCAPED\_UNICODE); break;  
      default:       $v \= is\_scalar($v) ? wp\_unslash($v) : wp\_json\_encode($v);  
    }  
    if ($v \=== null) { delete\_post\_meta($post\_id, $k); }  
    else { update\_post\_meta($post\_id, $k, $v); }  
  }  
}

/\* \============================================================================  
 \* 4\) CORE: Upsert de producto simple por SKU (incluye featured, meta, jet\_meta,  
 \*          upsell/crosssell por SKU, related\_skus manuales, imágenes seguras)  
 \* \==========================================================================\*/  
function cmu\_upsert\_simple\_product(array $data){  
    if (\!class\_exists('WC\_Product\_Simple')) {  
        return new WP\_Error('woocommerce\_missing','WooCommerce requerido', \['status'=\>500\]);  
    }

    $existing\_id \= 0;  
    if (\!empty($data\['sku'\])) $existing\_id \= wc\_get\_product\_id\_by\_sku($data\['sku'\]);

    $product \= $existing\_id ? wc\_get\_product($existing\_id) : new WC\_Product\_Simple();  
    if (\!$product) $product \= new WC\_Product\_Simple();

    if (\!$existing\_id && \!empty($data\['sku'\])) $product-\>set\_sku(sanitize\_text\_field($data\['sku'\]));  
    if (\!empty($data\['title'\])) $product-\>set\_name($data\['title'\]);  
    if (array\_key\_exists('description',$data))       $product-\>set\_description($data\['description'\] ?? '');  
    if (array\_key\_exists('short\_description',$data)) $product-\>set\_short\_description($data\['short\_description'\] ?? '');

    // Precios  
    if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
        $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
    }  
    if (array\_key\_exists('sale\_price', $data)) {  
        $sp \= $data\['sale\_price'\];  
        $product-\>set\_sale\_price($sp \=== '' || $sp \=== null ? '' : (string)$sp); // permite limpiar  
    }

    if (isset($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
    if (\!empty($data\['stock\_status'\]))  $product-\>set\_stock\_status($data\['stock\_status'\]); // instock|outofstock|onbackorder  
    if (\!empty($data\['status'\]))        $product-\>set\_status($data\['status'\]);  
    if (\!$existing\_id && empty($data\['status'\])) $product-\>set\_status('publish');

    $product-\>save();  
    $id \= (int)$product-\>get\_id();

    // Imagen destacada  
    if (\!empty($data\['image'\]) && cmu\_validate\_media\_url($data\['image'\])) {  
        $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
        if ($img\_id) set\_post\_thumbnail($id, $img\_id);  
    }

    // Galería  
    if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
        $gallery\_ids \= \[\];  
        foreach ($data\['gallery'\] as $u) {  
            if (\!cmu\_validate\_media\_url($u)) continue;  
            $mid \= cmu\_set\_image\_from\_url\_cached($u);  
            if ($mid) $gallery\_ids\[\] \= $mid;  
        }  
        if ($gallery\_ids) {  
            update\_post\_meta($id, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
        } else {  
            delete\_post\_meta($id, '\_product\_image\_gallery');  
        }  
    }

    // Destacado (featured)  
    if (array\_key\_exists('featured', $data)) {  
        $product-\>set\_featured( (bool) $data\['featured'\] );  
        $product-\>save();  
    }

    // Meta libres (legacy)  
    if (\!empty($data\['meta'\]) && is\_array($data\['meta'\])) {  
        foreach ($data\['meta'\] as $k \=\> $v) {  
            update\_post\_meta($id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    }  
    // Jet meta tipado (whitelist)  
    if (\!empty($data\['jet\_meta'\]) && is\_array($data\['jet\_meta'\])) {  
        cmu\_apply\_meta\_whitelist($id, $data\['jet\_meta'\]);  
    }

    // Taxonomías Woo  
    if (\!empty($data\['categories'\])) {  
        $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
        if ($cat\_ids) wp\_set\_object\_terms($id, $cat\_ids, 'product\_cat', false);  
    }  
    if (\!empty($data\['tags'\])) {  
        $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
        if ($tag\_ids) wp\_set\_object\_terms($id, $tag\_ids, 'product\_tag', false);  
    }

    // Taxonomías Jet/custom  
    if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
        foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
            if (\!taxonomy\_exists($tax)) continue;  
            $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
            if ($term\_ids) wp\_set\_object\_terms($id, $term\_ids, $tax, false);  
        }  
    }

    // Up-sells / Cross-sells por SKUs (sobrescribe)  
    $touch\_rel \= false;  
    if (array\_key\_exists('upsell\_skus', $data)) {  
        $product-\>set\_upsell\_ids( cmu\_resolve\_product\_ids((array)$data\['upsell\_skus'\]) );  
        $touch\_rel \= true;  
    }  
    if (array\_key\_exists('crosssell\_skus', $data)) {  
        $product-\>set\_cross\_sell\_ids( cmu\_resolve\_product\_ids((array)$data\['crosssell\_skus'\]) );  
        $touch\_rel \= true;  
    }  
    if ($touch\_rel) $product-\>save();

    // Relacionados manuales propios  
    if (array\_key\_exists('related\_skus', $data)) {  
        $rel\_ids \= cmu\_resolve\_product\_ids((array)$data\['related\_skus'\]);  
        update\_post\_meta($id, '\_manual\_related\_ids', array\_map('intval', $rel\_ids));  
    }

    return \[  
        'product\_id' \=\> $id,  
        'sku'        \=\> $product-\>get\_sku(),  
        'mode'       \=\> $existing\_id ? 'updated' : 'created'  
    \];  
}

/\* \============================================================================  
 \* 5\) Payload y utilidades por SKU/ID  
 \* \==========================================================================\*/  
function cmu\_product\_payload($id){  
    $product \= wc\_get\_product($id);  
    if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

    $image \= wp\_get\_attachment\_url(get\_post\_thumbnail\_id($id));  
    $gallery\_ids  \= explode(',', (string)get\_post\_meta($id,'\_product\_image\_gallery',true));  
    $gallery\_urls \= array\_values(array\_filter(array\_map('wp\_get\_attachment\_url', array\_filter($gallery\_ids))));

    $get\_terms\_names \= function ($pid, $taxonomy) {  
        $terms \= wp\_get\_post\_terms($pid, $taxonomy);  
        return array\_map(fn($t)=\>$t-\>name, $terms);  
    };

    $jet \= \[\];  
    foreach (get\_object\_taxonomies('product') as $tax) {  
        if (in\_array($tax, \['product\_cat','product\_tag'\])) continue;  
        $names \= $get\_terms\_names($id, $tax);  
        if ($names) $jet\[$tax\] \= $names;  
    }

    $manual\_related \= get\_post\_meta($id, '\_manual\_related\_ids', true);  
    $manual\_related \= is\_array($manual\_related) ? array\_map('intval', $manual\_related) : \[\];

    return \[  
        'id'                 \=\> (int)$id,  
        'title'              \=\> $product-\>get\_name(),  
        'description'        \=\> $product-\>get\_description(),  
        'short\_description'  \=\> $product-\>get\_short\_description(),  
        'price'              \=\> $product-\>get\_price(),  
        'sku'                \=\> $product-\>get\_sku(),  
        'stock\_quantity'     \=\> $product-\>get\_stock\_quantity(),  
        'stock\_status'       \=\> $product-\>get\_stock\_status(),  
        'status'             \=\> get\_post\_status($id),  
        'featured'           \=\> (bool) $product-\>get\_featured(),  
        'image'              \=\> $image,  
        'gallery'            \=\> $gallery\_urls,  
        'categories'         \=\> $get\_terms\_names($id, 'product\_cat'),  
        'tags'               \=\> $get\_terms\_names($id, 'product\_tag'),  
        'jet\_taxonomies'     \=\> $jet,  
        'upsell\_ids'         \=\> array\_map('intval', (array) $product-\>get\_upsell\_ids()),  
        'crosssell\_ids'      \=\> array\_map('intval', (array) $product-\>get\_cross\_sell\_ids()),  
        'upsell\_skus'        \=\> array\_values(array\_filter(array\_map(function($pid){ $p=wc\_get\_product($pid); return $p?$p-\>get\_sku():null; }, (array)$product-\>get\_upsell\_ids()))),  
        'crosssell\_skus'     \=\> array\_values(array\_filter(array\_map(function($pid){ $p=wc\_get\_product($pid); return $p?$p-\>get\_sku():null; }, (array)$product-\>get\_cross\_sell\_ids()))),  
        'related\_ids\_manual' \=\> $manual\_related  
    \];  
}

function cmu\_get\_id\_by\_sku\_or\_404($sku){  
    $sku \= is\_string($sku) ? trim($sku) : '';  
    if ($sku \=== '') return new WP\_Error('invalid','SKU vacío',\['status'=\>400\]);  
    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
    if (\!$pid) return new WP\_Error('not\_found','Product with that SKU not found',\['status'=\>404\]);  
    return (int)$pid;  
}

/\* \============================================================================  
 \* 6\) Hook: mostrar relacionados manuales en frontend (sin romper nativo)  
 \* \==========================================================================\*/  
add\_filter('woocommerce\_related\_products', function($related, $product\_id){  
    $manual \= get\_post\_meta($product\_id, '\_manual\_related\_ids', true);  
    if (is\_array($manual) && \!empty($manual)) {  
        $manual \= array\_values(array\_filter(array\_map('intval', $manual)));  
        $wanted \= (int) apply\_filters('woocommerce\_related\_products\_total', 4);  
        if (count($manual) \>= $wanted) return array\_slice($manual, 0, $wanted);  
        $merge \= array\_values(array\_unique(array\_merge($manual, $related)));  
        return array\_slice($merge, 0, $wanted);  
    }  
    return $related;  
}, 10, 2);

/\* \============================================================================  
 \* 7\) ENDPOINTS  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    /\* \---------- POST /product (upsert) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'title' \=\> \['type'=\>'string','sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'sku'   \=\> \['type'=\>'string','required'=\>true,'sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'regular\_price' \=\> \['type'=\>'string','validate\_callback'=\>fn($v)=\>is\_numeric($v)\],  
            'sale\_price'    \=\> \['type'=\>'string'\],  
            'price'         \=\> \['type'=\>'string'\],  
            'description'   \=\> \['type'=\>'string'\],  
            'short\_description'=\>\['type'=\>'string'\],  
            'categories' \=\> \['type'=\>'array'\],  
            'tags'       \=\> \['type'=\>'array'\],  
            'image'      \=\> \['type'=\>'string','validate\_callback'=\>'cmu\_validate\_media\_url'\],  
            'gallery'    \=\> \['type'=\>'array'\],  
            'upsell\_skus'=\> \['type'=\>'array'\],  
            'crosssell\_skus'=\> \['type'=\>'array'\],  
            'related\_skus'=\>\['type'=\>'array'\],  
            'featured'   \=\> \['type'=\>'boolean'\],  
            'meta'       \=\> \['type'=\>'object'\],  
            'jet\_meta'   \=\> \['type'=\>'object'\],  
            'stock\_quantity' \=\> \['type'=\>'integer'\],  
            'stock\_status'   \=\> \['type'=\>'string'\],  
            'status'         \=\> \['type'=\>'string'\],  
            'jet\_taxonomies' \=\> \['type'=\>'object'\],  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $data \= $request-\>get\_json\_params() ?: \[\];  
            $r \= cmu\_upsert\_simple\_product($data);  
            if (is\_wp\_error($r)) return $r;  
            return \['success'=\>true\] \+ $r;  
        }  
    \]);

    /\* \---------- GET /product/{id} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            return cmu\_product\_payload($id);  
        }  
    \]);

    /\* \---------- DELETE /product/{id} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    /\* \---------- POST /products/batch (create|update auto) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params();  
            $items   \= $payload\['products'\] ?? \[\];  
            $mode    \= $payload\['mode'\] ?? 'auto'; // auto|create\_only|update\_only

            if (\!is\_array($items) || \!$items) {  
                return new WP\_Error('invalid\_data','Envía products como array',\['status'=\>400\]);  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($items as $i=\>$data) {  
                try {  
                    $sku \= $data\['sku'\] ?? null;  
                    $exists\_id \= $sku ? wc\_get\_product\_id\_by\_sku($sku) : 0;

                    if ($mode \=== 'create\_only' && $exists\_id) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU ya existe'\];  
                        continue;  
                    }  
                    if ($mode \=== 'update\_only' && (\!$sku || \!$exists\_id)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>'SKU no existe para actualizar'\];  
                        continue;  
                    }

                    $r \= cmu\_upsert\_simple\_product((array)$data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $results\[\] \= \['index'=\>$i,'success'=\>true\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    /\* \---------- POST /products/batch/delete \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params();  
            $ids  \= array\_map('intval', $p\['ids'\]  ?? \[\]);  
            $skus \= $p\['skus'\] ?? \[\];

            if (\!$ids && \!$skus) return new WP\_Error('invalid','Envía ids o skus',\['status'=\>400\]);

            $targets \= $ids;  
            foreach ($skus as $s) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($s));  
                if ($pid) $targets\[\] \= (int)$pid;  
            }  
            $targets \= array\_values(array\_unique(array\_filter($targets)));

            $out \= \[\];  
            foreach ($targets as $id) {  
                $ok \= wp\_delete\_post($id, true);  
                $out\[\] \= \['id'=\>$id,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$out\];  
        }  
    \]);

    /\* \---------- PUT /products/sku/batch (update-only) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products/sku/batch', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $payload \= $request-\>get\_json\_params() ?: \[\];  
            $updates \= $payload\['updates'\] ?? $payload\['products'\] ?? \[\];  
            if (\!is\_array($updates) || \!$updates) {  
                return new WP\_Error('invalid\_data','Envía "updates" (array de objetos con "sku").',\['status'=\>400\]);  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_start')) wc\_deferred\_product\_sync\_start();  
            wp\_suspend\_cache\_invalidation(true);  
            wp\_defer\_term\_counting(true);

            $results \= \[\];  
            foreach ($updates as $i \=\> $data) {  
                try {  
                    $data \= (array)$data;  
                    $sku  \= isset($data\['sku'\]) ? trim((string)$data\['sku'\]) : '';  
                    if ($sku \=== '') throw new Exception("Fila $i: falta sku");

                    $pid \= wc\_get\_product\_id\_by\_sku($sku);  
                    if (\!$pid) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>'SKU no encontrado (solo update)'\];  
                        continue;  
                    }

                    $data\['sku'\] \= $sku; // fuerza update branch  
                    $r \= cmu\_upsert\_simple\_product($data);  
                    if (is\_wp\_error($r)) {  
                        $results\[\] \= \['index'=\>$i,'success'=\>false,'sku'=\>$sku,'error'=\>$r-\>get\_error\_message()\];  
                    } else {  
                        $r\['mode'\] \= 'updated';  
                        $results\[\] \= \['index'=\>$i,'success'=\>true,'sku'=\>$sku\] \+ $r;  
                    }

                } catch (Throwable $e) {  
                    $results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            if (function\_exists('wc\_deferred\_product\_sync\_end')) wc\_deferred\_product\_sync\_end();  
            wp\_defer\_term\_counting(false);  
            wp\_suspend\_cache\_invalidation(false);

            return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
        }  
    \]);

    /\* \---------- GET /products (filtros/paginación, featured opcional) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/products', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'date'); // date|title|ID  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');           // ASC|DESC  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $status   \= sanitize\_text\_field($request-\>get\_param('status') ?: 'any');  // any|publish|draft|private  
            $category \= sanitize\_title($request-\>get\_param('category') ?: '');  
            $tag      \= sanitize\_title($request-\>get\_param('tag') ?: '');  
            $skus\_qs  \= trim((string)($request-\>get\_param('skus') ?: ''));  
            $fields   \= strtolower($request-\>get\_param('fields') ?: 'basic');         // basic|full  
            $featured \= $request-\>get\_param('featured'); // 1/0 o true/false

            $args \= \[  
                'post\_type'      \=\> 'product',  
                'post\_status'    \=\> ($status \=== 'any') ? \['publish','draft','private'\] : $status,  
                'orderby'        \=\> in\_array($orderby, \['date','title','ID'\], true) ? $orderby : 'date',  
                'order'          \=\> in\_array($order, \['ASC','DESC'\], true) ? $order : 'DESC',  
                'posts\_per\_page' \=\> $per\_page,  
                'paged'          \=\> $page,  
                's'              \=\> $search ?: '',  
            \];

            $tax\_query \= \[\];  
            if ($category) {  
                $tax\_query\[\] \= \['taxonomy'=\>'product\_cat','field'=\>'slug','terms'=\>\[$category\]\];  
            }  
            if ($tag) {  
                $tax\_query\[\] \= \['taxonomy'=\>'product\_tag','field'=\>'slug','terms'=\>\[$tag\]\];  
            }  
            if ($tax\_query) $args\['tax\_query'\] \= $tax\_query;

            $meta\_query \= \[\];  
            $sku\_list \= \[\];  
            if ($skus\_qs \!== '') {  
                $sku\_list \= array\_values(array\_filter(array\_map('trim', explode(',', $skus\_qs))));  
                if ($sku\_list) {  
                    $meta\_query\[\] \= \['key'=\>'\_sku','value'=\>$sku\_list,'compare'=\>'IN'\];  
                }  
            }  
            if ($featured \!== null) {  
                $want \= in\_array($featured, \['1',1,true,'true'\], true) ? 'yes' : 'no';  
                $meta\_query\[\] \= \['key'=\>'\_featured','value'=\>$want,'compare'=\>'='\];  
            }  
            if ($meta\_query) $args\['meta\_query'\] \= $meta\_query;

            $q \= new WP\_Query($args);  
            $posts \= $q-\>posts ?: \[\];

            $rows \= \[\];  
            foreach ($posts as $p) {  
                $prod \= wc\_get\_product($p-\>ID);  
                if (\!$prod) continue;

                if ($fields \=== 'full') {  
                    $rows\[\] \= cmu\_product\_payload($p-\>ID);  
                } else {  
                    $rows\[\] \= \[  
                        'id'             \=\> (int)$p-\>ID,  
                        'sku'            \=\> $prod-\>get\_sku(),  
                        'title'          \=\> $prod-\>get\_name(),  
                        'price'          \=\> $prod-\>get\_price(),  
                        'stock\_quantity' \=\> $prod-\>get\_stock\_quantity(),  
                        'stock\_status'   \=\> $prod-\>get\_stock\_status(),  
                        'status'         \=\> get\_post\_status($p-\>ID),  
                        'featured'       \=\> (bool) $prod-\>get\_featured(),  
                        'date'           \=\> get\_post\_time('c', true, $p-\>ID),  
                    \];  
                }  
            }

            return \[  
                'success'   \=\> true,  
                'page'      \=\> $page,  
                'per\_page'  \=\> $per\_page,  
                'total'     \=\> (int)$q-\>found\_posts,  
                'pages'     \=\> (int)$q-\>max\_num\_pages,  
                'rows'      \=\> array\_values($rows)  
            \];  
        }  
    \]);

    /\* \---------- GET /product/sku/{sku} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            return cmu\_product\_payload($pid);  
        }  
    \]);

    /\* \---------- PUT /product/sku/{sku} (update) \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'title' \=\> \['type'=\>'string','sanitize\_callback'=\>'sanitize\_text\_field'\],  
            'regular\_price' \=\> \['type'=\>'string'\],  
            'sale\_price'    \=\> \['type'=\>'string'\],  
            'price'         \=\> \['type'=\>'string'\],  
            'description'   \=\> \['type'=\>'string'\],  
            'short\_description'=\>\['type'=\>'string'\],  
            'categories' \=\> \['type'=\>'array'\],  
            'tags'       \=\> \['type'=\>'array'\],  
            'image'      \=\> \['type'=\>'string','validate\_callback'=\>'cmu\_validate\_media\_url'\],  
            'gallery'    \=\> \['type'=\>'array'\],  
            'upsell\_skus'=\> \['type'=\>'array'\],  
            'crosssell\_skus'=\> \['type'=\>'array'\],  
            'related\_skus'=\>\['type'=\>'array'\],  
            'featured'   \=\> \['type'=\>'boolean'\],  
            'meta'       \=\> \['type'=\>'object'\],  
            'jet\_meta'   \=\> \['type'=\>'object'\],  
            'stock\_quantity' \=\> \['type'=\>'integer'\],  
            'stock\_status'   \=\> \['type'=\>'string'\],  
            'status'         \=\> \['type'=\>'string'\],  
            'jet\_taxonomies' \=\> \['type'=\>'object'\],  
            'sku'            \=\> \['type'=\>'string'\], // opcional para renombrar  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $product \= wc\_get\_product($pid);  
            if (\!$product) return new WP\_Error('not\_found','Product not found',\['status'=\>404\]);

            $data \= $request-\>get\_json\_params() ?: \[\];

            if (\!empty($data\['title'\]))                     $product-\>set\_name($data\['title'\]);  
            if (array\_key\_exists('description',$data))      $product-\>set\_description($data\['description'\] ?? '');  
            if (array\_key\_exists('short\_description',$data))$product-\>set\_short\_description($data\['short\_description'\] ?? '');

            if (isset($data\['regular\_price'\]) || isset($data\['price'\])) {  
                $product-\>set\_regular\_price((string)($data\['regular\_price'\] ?? $data\['price'\]));  
            }  
            if (array\_key\_exists('sale\_price', $data)) {  
                $sp \= $data\['sale\_price'\];  
                $product-\>set\_sale\_price($sp \=== '' || $sp \=== null ? '' : (string)$sp);  
            }

            if (isset($data\['stock\_quantity'\])) $product-\>set\_stock\_quantity((int)$data\['stock\_quantity'\]);  
            if (\!empty($data\['stock\_status'\]))  $product-\>set\_stock\_status($data\['stock\_status'\]);  
            if (\!empty($data\['status'\]))        $product-\>set\_status($data\['status'\]);

            if (\!empty($data\['sku'\]))           $product-\>set\_sku(sanitize\_text\_field($data\['sku'\])); // permitir cambio

            $product-\>save();

            if (array\_key\_exists('featured', $data)) {  
                $product-\>set\_featured( (bool) $data\['featured'\] );  
                $product-\>save();  
            }

            if (\!empty($data\['meta'\]) && is\_array($data\['meta'\])) {  
                foreach ($data\['meta'\] as $k \=\> $v) {  
                    update\_post\_meta($product-\>get\_id(), sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
                }  
            }  
            if (\!empty($data\['jet\_meta'\]) && is\_array($data\['jet\_meta'\])) {  
                cmu\_apply\_meta\_whitelist($product-\>get\_id(), $data\['jet\_meta'\]);  
            }

            if (\!empty($data\['image'\]) && cmu\_validate\_media\_url($data\['image'\])) {  
                $img\_id \= cmu\_set\_image\_from\_url\_cached($data\['image'\]);  
                if ($img\_id) set\_post\_thumbnail($pid, $img\_id);  
            }

            if (isset($data\['gallery'\]) && is\_array($data\['gallery'\])) {  
                $gallery\_ids \= \[\];  
                foreach ($data\['gallery'\] as $u) {  
                    if (\!cmu\_validate\_media\_url($u)) continue;  
                    $mid \= cmu\_set\_image\_from\_url\_cached($u);  
                    if ($mid) $gallery\_ids\[\] \= $mid;  
                }  
                if ($gallery\_ids) update\_post\_meta($pid, '\_product\_image\_gallery', implode(',', $gallery\_ids));  
                else delete\_post\_meta($pid, '\_product\_image\_gallery');  
            }

            if (\!empty($data\['categories'\])) {  
                $cat\_ids \= cmu\_valid\_term\_ids((array)$data\['categories'\], 'product\_cat');  
                if ($cat\_ids) wp\_set\_object\_terms($pid, $cat\_ids, 'product\_cat', false);  
            }  
            if (\!empty($data\['tags'\])) {  
                $tag\_ids \= cmu\_valid\_term\_ids((array)$data\['tags'\], 'product\_tag');  
                if ($tag\_ids) wp\_set\_object\_terms($pid, $tag\_ids, 'product\_tag', false);  
            }

            if (\!empty($data\['jet\_taxonomies'\]) && is\_array($data\['jet\_taxonomies'\])) {  
                foreach ($data\['jet\_taxonomies'\] as $tax \=\> $terms) {  
                    if (\!taxonomy\_exists($tax)) continue;  
                    $term\_ids \= cmu\_valid\_term\_ids((array)$terms, $tax);  
                    if ($term\_ids) wp\_set\_object\_terms($pid, $term\_ids, $tax, false);  
                }  
            }

            $touch\_rel \= false;  
            if ($request-\>has\_param('upsell\_skus') || array\_key\_exists('upsell\_skus', $data)) {  
                $product-\>set\_upsell\_ids(cmu\_resolve\_product\_ids((array)($data\['upsell\_skus'\] ?? \[\])));  
                $touch\_rel \= true;  
            }  
            if ($request-\>has\_param('crosssell\_skus') || array\_key\_exists('crosssell\_skus', $data)) {  
                $product-\>set\_cross\_sell\_ids(cmu\_resolve\_product\_ids((array)($data\['crosssell\_skus'\] ?? \[\])));  
                $touch\_rel \= true;  
            }  
            if ($touch\_rel) $product-\>save();

            if (array\_key\_exists('related\_skus', $data)) {  
                $rel\_ids \= cmu\_resolve\_product\_ids((array)$data\['related\_skus'\]);  
                update\_post\_meta($pid, '\_manual\_related\_ids', array\_map('intval', $rel\_ids));  
            }

            return \['success'=\>true,'product\_id'=\>$product-\>get\_id(),'mode'=\>'updated'\];  
        }  
    \]);

    /\* \---------- DELETE /product/sku/{sku} \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $ok \= wp\_delete\_post($pid, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_sku'=\>$request\['sku'\],'deleted\_id'=\>$pid\];  
        }  
    \]);

    /\* \---------- PATCH /product/sku/{sku}/featured \---------- \*/  
    register\_rest\_route('custom-api/v1', '/product/sku/(?P\<sku\>\[^/\]+)/featured', \[  
        'methods'  \=\> 'PATCH',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'args' \=\> \[  
            'featured' \=\> \['type'=\>'boolean','required'=\>true\],  
        \],  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $pid \= cmu\_get\_id\_by\_sku\_or\_404($request\['sku'\]);  
            if (is\_wp\_error($pid)) return $pid;  
            $p \= wc\_get\_product($pid);  
            $p-\>set\_featured((bool)$request-\>get\_param('featured'));  
            $p-\>save();  
            return \['success'=\>true,'product\_id'=\>$pid,'featured'=\>$p-\>get\_featured()\];  
        }  
    \]);  
});

/\* \============================================================================  
 \* 8\) CRUD Tablas Personalizadas (igual a tu versión, con sanitización básica)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    $cmu\_tables \= \[  
        'cliente-descuento-item' \=\> $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item',  
        'convenio'               \=\> $GLOBALS\['wpdb'\]-\>prefix . 'convenio',  
        'costo-tipo'             \=\> $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo',  
        'descuento-call'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call',  
        'laboratorio'            \=\> $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio',  
        'precio-distrib'         \=\> $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib',  
    \];

    $get\_primary \= function($table) {  
        $map \= \[  
            $GLOBALS\['wpdb'\]-\>prefix . 'cliente\_descuento\_item' \=\> 'CLIENTE\_DESCUENTO\_ITEM\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'convenio'               \=\> 'CONVENIO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'costo\_tipo'             \=\> 'COSTO\_TIPO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'descuento\_call'         \=\> 'DESCUENTO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'laboratorio'            \=\> 'LABORATORIO\_ID',  
            $GLOBALS\['wpdb'\]-\>prefix . 'precio\_distrib'         \=\> 'PRECIO\_DISTRIB\_ID',  
        \];  
        return $map\[$table\] ?? 'id';  
    };

    $table\_columns \= function($table) {  
        global $wpdb;  
        $cols \= $wpdb-\>get\_results("DESCRIBE \`$table\`", ARRAY\_A);  
        return $cols ? array\_map(fn($r) \=\> $r\['Field'\], $cols) : \[\];  
    };

    $sanitize\_row \= function(array $row, array $allowed\_cols) {  
        $clean \= \[\];  
        foreach ($row as $k \=\> $v) {  
            if (in\_array($k, $allowed\_cols, true)) {  
                if (is\_string($v)) {  
                    $clean\[$k\] \= wp\_unslash(wp\_kses\_post(trim($v)));  
                } else {  
                    $clean\[$k\] \= $v;  
                }  
            }  
        }  
        return $clean;  
    };

    foreach ($cmu\_tables as $endpoint \=\> $table\_name) {

        // LISTAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary, $table\_columns) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
                $per\_page \= min(500, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
                $orderby  \= $request-\>get\_param('orderby') ?: $primary;  
                $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
                $search   \= $request-\>get\_param('search');  
                $filters  \= (array) ($request-\>get\_param('filters') ?: \[\]);

                if (\!in\_array($orderby, $cols, true)) $orderby \= $primary;  
                if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

                $where \= "WHERE 1=1";  
                $params \= \[\];  
                foreach ($filters as $col \=\> $val) {  
                    if (in\_array($col, $cols, true)) {  
                        $where .= " AND \`$col\` \= %s";  
                        $params\[\] \= (string)$val;  
                    }  
                }  
                if ($search) {  
                    $search\_like \= '%' . $wpdb-\>esc\_like($search) . '%';  
                    $parts \= \[\];  
                    foreach ($cols as $c) $parts\[\] \= "\`$c\` LIKE %s";  
                    $where .= " AND (" . implode(' OR ', $parts) . ")";  
                    foreach ($cols as $\_) $params\[\] \= $search\_like;  
                }

                $offset \= ($page \- 1\) \* $per\_page;

                $sql\_count \= "SELECT COUNT(\*) FROM \`$table\_name\` $where";  
                $total \= $params ? (int) $wpdb-\>get\_var($wpdb-\>prepare($sql\_count, $params)) : (int) $wpdb-\>get\_var($sql\_count);

                $sql \= "SELECT \* FROM \`$table\_name\` $where ORDER BY \`$orderby\` $order LIMIT %d OFFSET %d";  
                $params\_data \= $params;  
                $params\_data\[\] \= $per\_page;  
                $params\_data\[\] \= $offset;  
                $rows \= $params\_data ? $wpdb-\>get\_results($wpdb-\>prepare($sql, $params\_data), ARRAY\_A) : $wpdb-\>get\_results($sql, ARRAY\_A);

                return \[  
                    'success'   \=\> true,  
                    'page'      \=\> $page,  
                    'per\_page'  \=\> $per\_page,  
                    'total'     \=\> $total,  
                    'rows'      \=\> $rows,  
                    'primary'   \=\> $primary,  
                \];  
            }  
        \]);

        // OBTENER UNO  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'GET',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $row \= $wpdb-\>get\_row($wpdb-\>prepare("SELECT \* FROM \`$table\_name\` WHERE \`$primary\` \= %d", $id), ARRAY\_A);  
                if (\!$row) return new WP\_Error('not\_found','Registro no encontrado',\['status'=\>404\]);  
                return \['success'=\>true,'row'=\>$row\];  
            }  
        \]);

        // CREAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint, \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                if (array\_key\_exists($primary, $row) && ($row\[$primary\] \=== '' || $row\[$primary\] \=== null)) {  
                    unset($row\[$primary\]);  
                }

                $ok \= $wpdb-\>insert($table\_name, $row);  
                if ($ok \=== false) return new WP\_Error('insert\_failed','No se pudo insertar',\['status'=\>500\]);

                return \['success'=\>true,'insert\_id'=\>$wpdb-\>insert\_id\];  
            }  
        \]);

        // ACTUALIZAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'PUT',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $cols \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                $primary \= $get\_primary($table\_name);  
                $data\_in \= $request-\>get\_json\_params() ?: \[\];  
                $row     \= $sanitize\_row($data\_in, $cols);  
                unset($row\[$primary\]);

                if (\!$row) return new WP\_Error('invalid','No hay campos válidos para actualizar',\['status'=\>400\]);

                $ok \= $wpdb-\>update($table\_name, $row, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('update\_failed','No se pudo actualizar',\['status'=\>500\]);

                return \['success'=\>true,'updated\_id'=\>$id\];  
            }  
        \]);

        // ELIMINAR  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/(?P\<id\>\\d+)', \[  
            'methods'  \=\> 'DELETE',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $id \= (int)$request\['id'\];  
                $primary \= $get\_primary($table\_name);  
                $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> $id\]);  
                if ($ok \=== false) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
                return \['success'=\>true,'deleted\_id'=\>$id\];  
            }  
        \]);

        // MASIVO: create|update|upsert  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $table\_columns, $get\_primary, $sanitize\_row) {  
                global $wpdb;  
                $payload \= $request-\>get\_json\_params() ?: \[\];  
                $rows    \= $payload\['rows'\] ?? \[\];  
                $mode    \= strtolower($payload\['mode'\] ?? 'upsert'); // create|update|upsert  
                $primary \= $get\_primary($table\_name);  
                $cols    \= $table\_columns($table\_name);  
                if (\!$cols) return new WP\_Error('table\_error','No se pudieron leer columnas',\['status'=\>500\]);

                if (\!is\_array($rows) || empty($rows)) {  
                    return new WP\_Error('invalid\_data','Envía rows como array',\['status'=\>400\]);  
                }  
                if (\!in\_array($mode, \['create','update','upsert'\], true)) {  
                    return new WP\_Error('invalid\_mode','mode debe ser create|update|upsert',\['status'=\>400\]);  
                }

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');

                try {  
                    foreach ($rows as $i \=\> $input) {  
                        $clean \= $sanitize\_row((array)$input, $cols);

                        if ($mode \=== 'create') {  
                            if (array\_key\_exists($primary, $clean) && ($clean\[$primary\] \=== '' || $clean\[$primary\] \=== null)) {  
                                unset($clean\[$primary\]);  
                            }  
                            $ok \= $wpdb-\>insert($table\_name, $clean);  
                            if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];

                        } elseif ($mode \=== 'update') {  
                            if (empty($clean\[$primary\])) throw new Exception("Fila $i: falta $primary");  
                            $pk \= $clean\[$primary\]; unset($clean\[$primary\]);  
                            if (\!$clean) throw new Exception("Fila $i: sin campos a actualizar");  
                            $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                            if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                            $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];

                        } else { // upsert  
                            $has\_pk \= \!empty($clean\[$primary\]);  
                            if ($has\_pk) {  
                                $pk \= $clean\[$primary\]; unset($clean\[$primary\]);  
                                $exists \= (int) $wpdb-\>get\_var($wpdb-\>prepare("SELECT COUNT(\*) FROM \`$table\_name\` WHERE \`$primary\`=%d", $pk));  
                                if ($exists) {  
                                    if (\!$clean) {  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'noop','id'=\>$pk\];  
                                    } else {  
                                        $ok \= $wpdb-\>update($table\_name, $clean, \[$primary \=\> $pk\]);  
                                        if ($ok \=== false) throw new Exception("Fila $i: fallo update");  
                                        $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','id'=\>$pk\];  
                                    }  
                                } else {  
                                    $clean\[$primary\] \= $pk;  
                                    $ok \= $wpdb-\>insert($table\_name, $clean);  
                                    if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                    $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                                }  
                            } else {  
                                $ok \= $wpdb-\>insert($table\_name, $clean);  
                                if ($ok \=== false) throw new Exception("Fila $i: fallo insert");  
                                $results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','id'=\>$wpdb-\>insert\_id\];  
                            }  
                        }  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
            }  
        \]);

        // MASIVO: delete por ids  
        register\_rest\_route('custom-api/v1', '/' . $endpoint . '/batch/delete', \[  
            'methods'  \=\> 'POST',  
            'permission\_callback' \=\> 'cmu\_permission',  
            'callback' \=\> function(WP\_REST\_Request $request) use ($table\_name, $get\_primary) {  
                global $wpdb;  
                $primary \= $get\_primary($table\_name);  
                $p   \= $request-\>get\_json\_params() ?: \[\];  
                $ids \= array\_map('intval', $p\['ids'\] ?? \[\]);  
                if (\!$ids) return new WP\_Error('invalid','Envía ids (array)',\['status'=\>400\]);

                $results \= \[\];  
                $wpdb-\>query('START TRANSACTION');  
                try {  
                    foreach ($ids as $id) {  
                        $ok \= $wpdb-\>delete($table\_name, \[$primary \=\> (int)$id\]);  
                        $results\[\] \= \['id'=\>$id,'deleted'=\> $ok \!== false && $ok \> 0\];  
                    }  
                    $wpdb-\>query('COMMIT');  
                } catch (Throwable $e) {  
                    $wpdb-\>query('ROLLBACK');  
                    return new WP\_Error('batch\_delete\_failed', $e-\>getMessage(), \['status'=\>500, 'partial'=\>$results\]);  
                }

                return \['success'=\>true,'results'=\>$results\];  
            }  
        \]);  
    }  
});

/\* \============================================================================  
 \* 9\) CRUD de Usuarios (igual a tu versión con pequeños ajustes de sanitización)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    // Helpers  
    $cmu\_find\_user \= function($match\_by, $value) {  
        if (\!$value) return false;  
        switch ($match\_by) {  
            case 'id':       return get\_userdata((int)$value);  
            case 'email':    return get\_user\_by('email', sanitize\_email($value));  
            case 'username': return get\_user\_by('login', sanitize\_user($value, true));  
            default:         return false;  
        }  
    };

    $cmu\_apply\_meta \= function($user\_id, $meta){  
        if (\!is\_array($meta)) return;  
        foreach ($meta as $k=\>$v) {  
            update\_user\_meta($user\_id, sanitize\_key($k), is\_scalar($v) ? wp\_unslash($v) : $v);  
        }  
    };

    // \========== LISTAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $role     \= sanitize\_text\_field($request-\>get\_param('role') ?: '');  
            $search   \= sanitize\_text\_field($request-\>get\_param('search') ?: '');  
            $page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
            $per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));  
            $orderby  \= sanitize\_text\_field($request-\>get\_param('orderby') ?: 'ID'); // ID|user\_login|user\_email|user\_registered  
            $order    \= strtoupper($request-\>get\_param('order') ?: 'DESC');  
            if (\!in\_array($orderby, \['ID','user\_login','user\_email','user\_registered'\], true)) $orderby \= 'ID';  
            if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

            $args \= \[  
                'number'   \=\> $per\_page,  
                'paged'    \=\> $page,  
                'orderby'  \=\> $orderby,  
                'order'    \=\> $order,  
                'fields'   \=\> 'all\_with\_meta',  
            \];  
            if ($role)   $args\['role'\] \= $role;  
            if ($search) $args\['search'\] \= '\*' . esc\_attr($search) . '\*';

            $q \= new WP\_User\_Query($args);  
            $users \= array\_map(function($u){  
                return \[  
                    'id'         \=\> (int) $u-\>ID,  
                    'username'   \=\> $u-\>user\_login,  
                    'email'      \=\> $u-\>user\_email,  
                    'role'       \=\> $u-\>roles\[0\] ?? null,  
                    'registered' \=\> $u-\>user\_registered,  
                \];  
            }, $q-\>get\_results());

            return \[  
                'success'  \=\> true,  
                'page'     \=\> $page,  
                'per\_page' \=\> $per\_page,  
                'total'    \=\> (int) $q-\>get\_total(),  
                'rows'     \=\> $users  
            \];  
        }  
    \]);

    // \========== OBTENER UNO \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $user \= get\_userdata((int)$request\['id'\]);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);  
            return \[  
                'success'    \=\> true,  
                'id'         \=\> (int) $user-\>ID,  
                'username'   \=\> $user-\>user\_login,  
                'email'      \=\> $user-\>user\_email,  
                'role'       \=\> $user-\>roles\[0\] ?? null,  
                'registered' \=\> $user-\>user\_registered  
            \];  
        }  
    \]);

    // \========== CREAR \==========  
    register\_rest\_route('custom-api/v1', '/customers', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $d \= $request-\>get\_json\_params() ?: \[\];  
            $email    \= sanitize\_email($d\['email'\] ?? '');  
            $username \= sanitize\_user($d\['username'\] ?? ( $email ? current(explode('@',$email)) : '' ), true);  
            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
            $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');

            if (\!$email) return new WP\_Error('missing','email es obligatorio',\['status'=\>400\]);  
            if (email\_exists($email)) return new WP\_Error('exists','email ya existe',\['status'=\>409\]);  
            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

            $uid \= wp\_create\_user($username ?: 'user\_'.wp\_generate\_password(6,false,false), $password, $email);  
            if (is\_wp\_error($uid)) return $uid;  
            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);

            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$uid,'mode'=\>'created'\];  
        }  
    \]);

    // \========== ACTUALIZAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_apply\_meta){  
            $id \= (int)$request\['id'\];  
            $user \= get\_userdata($id);  
            if (\!$user) return new WP\_Error('not\_found','Usuario no encontrado',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];  
            $upd \= \['ID'=\>$id\];

            if (\!empty($d\['email'\])) {  
                $email \= sanitize\_email($d\['email'\]);  
                $other \= get\_user\_by('email', $email);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','email ya en uso',\['status'=\>409\]);  
                $upd\['user\_email'\] \= $email;  
            }  
            if (\!empty($d\['username'\])) {  
                $username \= sanitize\_user($d\['username'\], true);  
                $other \= get\_user\_by('login', $username);  
                if ($other && (int)$other-\>ID \!== $id) return new WP\_Error('exists','username ya en uso',\['status'=\>409\]);  
                $upd\['user\_login'\] \= $username;  
            }  
            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];

            $res \= wp\_update\_user($upd);  
            if (is\_wp\_error($res)) return $res;

            if (\!empty($d\['role'\])) {  
                $role \= sanitize\_text\_field($d\['role'\]);  
                (new WP\_User($id))-\>set\_role($role);  
            }  
            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($id, $d\['meta'\]);

            return \['success'=\>true,'user\_id'=\>$id,'mode'=\>'updated'\];  
        }  
    \]);

    // \========== ELIMINAR \==========  
    register\_rest\_route('custom-api/v1', '/customers/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $ok \= wp\_delete\_user($id);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);

    // \========== MASIVO: create|update|upsert \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_find\_user, $cmu\_apply\_meta){  
            $p        \= $request-\>get\_json\_params() ?: \[\];  
            $rows     \= $p\['customers'\] ?? $p\['rows'\] ?? \[\];  
            $mode     \= strtolower($p\['mode'\] ?? 'upsert');        // create|update|upsert  
            $match\_by \= strtolower($p\['match\_by'\] ?? 'email');     // id|email|username  
            if (\!in\_array($mode, \['create','update','upsert'\], true)) return new WP\_Error('invalid\_mode','mode inválido',\['status'=\>400\]);  
            if (\!in\_array($match\_by, \['id','email','username'\], true)) return new WP\_Error('invalid\_match','match\_by inválido',\['status'=\>400\]);  
            if (\!is\_array($rows) || \!$rows) return new WP\_Error('invalid','customers/rows vacío',\['status'=\>400\]);

            $out \= \[\];  
            foreach ($rows as $i=\>$d) {  
                try {  
                    $d \= (array)$d;  
                    $email    \= sanitize\_email($d\['email'\] ?? '');  
                    $username \= sanitize\_user($d\['username'\] ?? '', true);

                    // resolver usuario según match\_by  
                    $lookup\_value \= $match\_by==='id' ? ($d\['id'\] ?? null) : ($match\_by==='email' ? $email : $username);  
                    $user \= $cmu\_find\_user($match\_by, $lookup\_value);

                    if ($mode \=== 'create') {  
                        if ($user) throw new Exception("Fila $i: ya existe usuario con $match\_by");  
                        if (\!$email) throw new Exception("Fila $i: email requerido");  
                        if (email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                        if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

                        $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                        $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');  
                        $uid \= wp\_create\_user($username ?: current(explode('@',$email)), $password, $email);  
                        if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                        if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];

                    } elseif ($mode \=== 'update') {  
                        if (\!$user) throw new Exception("Fila $i: no existe usuario por $match\_by");

                        $upd \= \['ID'=\>$user-\>ID\];  
                        if (\!empty($d\['email'\])) {  
                            $new\_email \= sanitize\_email($d\['email'\]);  
                            $other \= get\_user\_by('email',$new\_email);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                            $upd\['user\_email'\] \= $new\_email;  
                        }  
                        if (\!empty($d\['username'\])) {  
                            $new\_user \= sanitize\_user($d\['username'\], true);  
                            $other \= get\_user\_by('login',$new\_user);  
                            if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                            $upd\['user\_login'\] \= $new\_user;  
                        }  
                        if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                        $res \= wp\_update\_user($upd);  
                        if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                        if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                        if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                        $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                    } else { // upsert  
                        if ($user) {  
                            // update branch  
                            $upd \= \['ID'=\>$user-\>ID\];  
                            if (\!empty($d\['email'\])) {  
                                $new\_email \= sanitize\_email($d\['email'\]);  
                                $other \= get\_user\_by('email',$new\_email);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: email ya en uso");  
                                $upd\['user\_email'\] \= $new\_email;  
                            }  
                            if (\!empty($d\['username'\])) {  
                                $new\_user \= sanitize\_user($d\['username'\], true);  
                                $other \= get\_user\_by('login',$new\_user);  
                                if ($other && (int)$other-\>ID \!== (int)$user-\>ID) throw new Exception("Fila $i: username ya en uso");  
                                $upd\['user\_login'\] \= $new\_user;  
                            }  
                            if (\!empty($d\['password'\])) $upd\['user\_pass'\] \= $d\['password'\];  
                            $res \= wp\_update\_user($upd);  
                            if (is\_wp\_error($res)) throw new Exception($res-\>get\_error\_message());

                            if (\!empty($d\['role'\])) (new WP\_User($user-\>ID))-\>set\_role(sanitize\_text\_field($d\['role'\]));  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($user-\>ID, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','user\_id'=\>$user-\>ID\];

                        } else {  
                            // create branch  
                            if (\!$email && \!$username) throw new Exception("Fila $i: requiere email o username");  
                            if ($email && email\_exists($email)) throw new Exception("Fila $i: email ya existe");  
                            if ($username && username\_exists($username)) $username .= '\_' . wp\_generate\_password(4,false,false);

                            $password \= $d\['password'\] ?? wp\_generate\_password(12);  
                            $role     \= sanitize\_text\_field($d\['role'\] ?? 'customer');

                            $base\_user \= $username ?: ($email ? current(explode('@',$email)) : 'user\_'.wp\_generate\_password(6,false,false));  
                            $uid \= wp\_create\_user($base\_user, $password, $email ?: '');  
                            if (is\_wp\_error($uid)) throw new Exception($uid-\>get\_error\_message());  
                            if ($role) wp\_update\_user(\['ID'=\>$uid,'role'=\>$role\]);  
                            if (\!empty($d\['meta'\])) $cmu\_apply\_meta($uid, $d\['meta'\]);

                            $out\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','user\_id'=\>$uid\];  
                        }  
                    }

                } catch (Throwable $e) {  
                    $out\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
                }  
            }

            return \['success'=\>true,'count'=\>count($out),'results'=\>$out\];  
        }  
    \]);

    // \========== MASIVO: delete por ids | emails | usernames \==========  
    register\_rest\_route('custom-api/v1', '/customers/batch/delete', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $p \= $request-\>get\_json\_params() ?: \[\];  
            $ids       \= array\_map('intval', $p\['ids'\] ?? \[\]);  
            $emails    \= array\_map('sanitize\_email', $p\['emails'\] ?? \[\]);  
            $usernames \= array\_map(function($u){return sanitize\_user($u, true);}, $p\['usernames'\] ?? \[\]);

            if (\!$ids && \!$emails && \!$usernames) {  
                return new WP\_Error('invalid','Envía ids o emails o usernames',\['status'=\>400\]);  
            }

            $targets \= $ids;

            foreach ($emails as $e) {  
                $u \= get\_user\_by('email',$e);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }  
            foreach ($usernames as $un) {  
                $u \= get\_user\_by('login',$un);  
                if ($u) $targets\[\] \= (int)$u-\>ID;  
            }

            $targets \= array\_values(array\_unique(array\_filter($targets)));  
            $results \= \[\];  
            foreach ($targets as $uid) {  
                $ok \= wp\_delete\_user($uid);  
                $results\[\] \= \['user\_id'=\>$uid,'deleted'=\>(bool)$ok\];  
            }  
            return \['success'=\>true,'results'=\>$results\];  
        }  
    \]);  
});

/\* \============================================================================  
 \* 10\) CRUD de Órdenes (WooCommerce)  
 \* \==========================================================================\*/  
add\_action('rest\_api\_init', function () {

    if ( \! function\_exists('wc\_get\_order') ) return; // Woo requerido

    // \-------- Helpers \--------

    // Normaliza un array asociativo (recorta strings y desescapa)  
    $cmu\_clean\_assoc \= function($arr){  
        $out \= \[\];  
        foreach ((array)$arr as $k=\>$v){  
            if (is\_string($v)) $out\[$k\] \= wp\_unslash(trim($v));  
            else               $out\[$k\] \= $v;  
        }  
        return $out;  
    };  
	  
    // Construye líneas de items a partir de \['sku'| 'product\_id', 'quantity', 'price'?, 'subtotal'?, 'total'?\]  
    $cmu\_order\_set\_items \= function(WC\_Order $order, array $items) {  
        // Elimina items existentes si vamos a reescribir  
        foreach ($order-\>get\_items() as $item\_id \=\> $item) {  
            $order-\>remove\_item($item\_id);  
        }

        foreach ($items as $i=\>$row) {  
            $row \= (array)$row;  
            $qty \= max(1, (int)($row\['quantity'\] ?? 1));

            $pid \= 0;  
            if (\!empty($row\['product\_id'\])) {  
                $pid \= (int)$row\['product\_id'\];  
            } elseif (\!empty($row\['sku'\])) {  
                $pid \= wc\_get\_product\_id\_by\_sku(sanitize\_text\_field($row\['sku'\]));  
            }  
            if (\!$pid) throw new Exception("Item $i: falta product\_id o sku válido");

            $product \= wc\_get\_product($pid);  
            if (\!$product) throw new Exception("Item $i: producto inválido ($pid)");

            $item \= new WC\_Order\_Item\_Product();  
            $item-\>set\_product($product);  
            $item-\>set\_quantity($qty);

            // Permitir override de precios si se envía  
            if (isset($row\['subtotal'\])) $item-\>set\_subtotal( (float)$row\['subtotal'\] );  
            if (isset($row\['total'\]))    $item-\>set\_total( (float)$row\['total'\] );  
            // Compat: price directo  
            if (isset($row\['price'\]) && \!isset($row\['subtotal'\]) && \!isset($row\['total'\])) {  
                $price \= (float)$row\['price'\];  
                $item-\>set\_subtotal($price \* $qty);  
                $item-\>set\_total($price \* $qty);  
            }

            // Meta por item (opcional)  
            if (\!empty($row\['meta'\]) && is\_array($row\['meta'\])) {  
                foreach ($row\['meta'\] as $mk=\>$mv){  
                    $item-\>add\_meta\_data(sanitize\_key($mk), is\_scalar($mv)? wp\_unslash($mv) : wp\_json\_encode($mv));  
                }  
            }

            $order-\>add\_item($item);  
        }  
    };

    // Añade/reescribe líneas de envío: \[{method\_id?, method\_title?, total, meta?}\]  
    $cmu\_order\_set\_shipping \= function(WC\_Order $order, array $ship\_lines){  
        foreach ($order-\>get\_items('shipping') as $sid \=\> $sitem) {  
            $order-\>remove\_item($sid);  
        }  
        foreach ($ship\_lines as $i=\>$row){  
            $row \= (array)$row;  
            $ship \= new WC\_Order\_Item\_Shipping();  
            $ship-\>set\_method\_id( sanitize\_text\_field($row\['method\_id'\] ?? 'custom') );  
            $ship-\>set\_method\_title( sanitize\_text\_field($row\['method\_title'\] ?? 'Shipping') );  
            $ship-\>set\_total( (float)($row\['total'\] ?? 0\) );  
            if (\!empty($row\['meta'\]) && is\_array($row\['meta'\])) {  
                foreach ($row\['meta'\] as $mk=\>$mv){  
                    $ship-\>add\_meta\_data(sanitize\_key($mk), is\_scalar($mv)? wp\_unslash($mv) : wp\_json\_encode($mv));  
                }  
            }  
            $order-\>add\_item($ship);  
        }  
    };

    // Añade/reescribe cupones: \[{code, discount?, discount\_tax?}\]  
    $cmu\_order\_set\_coupons \= function(WC\_Order $order, array $coupons){  
        foreach ($order-\>get\_items('coupon') as $cid \=\> $citem) {  
            $order-\>remove\_item($cid);  
        }  
        foreach ($coupons as $i=\>$row){  
            $row \= (array)$row;  
            if (empty($row\['code'\])) continue;  
            $c \= new WC\_Order\_Item\_Coupon();  
            $c-\>set\_code( sanitize\_text\_field($row\['code'\]) );  
            if (isset($row\['discount'\]))     $c-\>set\_discount( (float)$row\['discount'\] );  
            if (isset($row\['discount\_tax'\])) $c-\>set\_discount\_tax( (float)$row\['discount\_tax'\] );  
            $order-\>add\_item($c);  
        }  
    };  
	  
    // Añade/reescribe fees: \[{name, total, tax\_class?, tax\_status?}\]  
    $cmu\_order\_set\_fees \= function(WC\_Order $order, array $fees){  
        foreach ($order-\>get\_items('fee') as $fid \=\> $fitem) {  
            $order-\>remove\_item($fid);  
        }  
        foreach ($fees as $i=\>$row){  
            $row \= (array)$row;  
            if (empty($row\['name'\])) $row\['name'\] \= 'Fee';  
            $fee \= new WC\_Order\_Item\_Fee();  
            $fee-\>set\_name( sanitize\_text\_field($row\['name'\]) );  
            $fee-\>set\_total( (float)($row\['total'\] ?? 0\) );  
            if (\!empty($row\['tax\_class'\]))  $fee-\>set\_tax\_class( sanitize\_text\_field($row\['tax\_class'\]) );  
            if (\!empty($row\['tax\_status'\])) $fee-\>set\_tax\_status( sanitize\_text\_field($row\['tax\_status'\]) ); // taxable|none  
            $order-\>add\_item($fee);  
        }  
    };

	if (\!function\_exists('cmu\_safe\_order\_meta')) {  
		function cmu\_safe\_order\_meta($post\_id) {  
			$all \= get\_post\_meta($post\_id); // key \=\> array(values)  
			// Lista de exclusión por coincidencia exacta  
			$deny\_exact  \= apply\_filters('cmu\_order\_meta\_deny\_exact', \[  
				'\_shipping\_packages',  
				'\_shipping\_methods',  
				'\_thwcfe\_ship\_to\_billing',  
				'\_thwcfe\_disabled\_fields',  
			\], $post\_id);

			// Lista de exclusión por prefijo  
			$deny\_prefix \= apply\_filters('cmu\_order\_meta\_deny\_prefix', \[  
				'\_thwcfe\_',  
			\], $post\_id);

			$out \= \[\];  
			foreach ($all as $k \=\> $vals) {  
				$skip \= in\_array($k, $deny\_exact, true);  
				if (\!$skip && $deny\_prefix) {  
					foreach ($deny\_prefix as $px) {  
						if ($px \!== '' && strpos($k, $px) \=== 0\) { // empieza por prefijo  
							$skip \= true;  
							break;  
						}  
					}  
				}  
				if ($skip) continue;  
				$out\[$k\] \= $vals; // mantiene el mismo shape que get\_post\_meta  
			}  
			return $out;  
		}  
	}

	  
    // Construye payload JSON de orden  
    function cmu\_order\_payload($order\_id){  
        $order \= wc\_get\_order($order\_id);  
        if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);

        $get\_items \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items() as $it){  
                $p   \= $it-\>get\_product();  
                $pid \= $it-\>get\_product\_id();  
                $sku \= $p ? $p-\>get\_sku() : null;  
                $out\[\] \= \[  
                    'item\_id'   \=\> (int)$it-\>get\_id(),  
                    'product\_id'=\> (int)$pid,  
                    'sku'       \=\> $sku,  
                    'name'      \=\> $it-\>get\_name(),  
                    'quantity'  \=\> (float)$it-\>get\_quantity(),  
                    'subtotal'  \=\> (float)$it-\>get\_subtotal(),  
                    'total'     \=\> (float)$it-\>get\_total(),  
                    'meta'      \=\> $it-\>get\_meta\_data(),  
                \];  
            }  
            return $out;  
        };  
        $get\_shipping \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('shipping') as $s){  
                $out\[\] \= \[  
                    'item\_id'      \=\> (int)$s-\>get\_id(),  
                    'method\_id'    \=\> $s-\>get\_method\_id(),  
                    'method\_title' \=\> $s-\>get\_method\_title(),  
                    'total'        \=\> (float)$s-\>get\_total(),  
                    'meta'         \=\> $s-\>get\_meta\_data(),  
                \];  
            }  
            return $out;  
        };  
        $get\_coupons \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('coupon') as $c){  
                $out\[\] \= \[  
                    'item\_id'      \=\> (int)$c-\>get\_id(),  
                    'code'         \=\> $c-\>get\_code(),  
                    'discount'     \=\> (float)$c-\>get\_discount(),  
                    'discount\_tax' \=\> (float)$c-\>get\_discount\_tax(),  
                \];  
            }  
            return $out;  
        };  
        $get\_fees \= function($order){  
            $out \= \[\];  
            foreach ($order-\>get\_items('fee') as $f){  
                $out\[\] \= \[  
                    'item\_id'   \=\> (int)$f-\>get\_id(),  
                    'name'      \=\> $f-\>get\_name(),  
                    'total'     \=\> (float)$f-\>get\_total(),  
                    'tax\_class' \=\> $f-\>get\_tax\_class(),  
                    'tax\_status'=\> $f-\>get\_tax\_status(),  
                \];  
            }  
            return $out;  
        };  
		  
		$descuentos \= cmu\_get\_order\_discounts($order);  
		  
        return \[  
            'id'              \=\> (int)$order-\>get\_id(),  
            'status'          \=\> $order-\>get\_status(),  
            'currency'        \=\> $order-\>get\_currency(),  
            'total'           \=\> (float)$order-\>get\_total(),  
            'subtotal'        \=\> (float)$order-\>get\_subtotal(),  
            'discount\_total'  \=\> (float)$order-\>get\_discount\_total(),  
            'shipping\_total'  \=\> (float)$order-\>get\_shipping\_total(),  
            'total\_tax'       \=\> (float)$order-\>get\_total\_tax(),  
            'payment\_method'  \=\> $order-\>get\_payment\_method(),  
            'payment\_title'   \=\> $order-\>get\_payment\_method\_title(),  
            'transaction\_id'  \=\> $order-\>get\_transaction\_id(),  
            'date\_created'    \=\> $order-\>get\_date\_created() ? $order-\>get\_date\_created()-\>date('c') : null,  
            'date\_paid'       \=\> $order-\>get\_date\_paid() ? $order-\>get\_date\_paid()-\>date('c') : null,  
            'customer\_id'     \=\> (int)$order-\>get\_customer\_id(),  
            'customer\_email'  \=\> $order-\>get\_billing\_email(),  
            'billing'         \=\> \[  
                'first\_name' \=\> $order-\>get\_billing\_first\_name(),  
                'last\_name'  \=\> $order-\>get\_billing\_last\_name(),  
                'company'    \=\> $order-\>get\_billing\_company(),  
                'address\_1'  \=\> $order-\>get\_billing\_address\_1(),  
                'address\_2'  \=\> $order-\>get\_billing\_address\_2(),  
                'city'       \=\> $order-\>get\_billing\_city(),  
                'state'      \=\> $order-\>get\_billing\_state(),  
                'postcode'   \=\> $order-\>get\_billing\_postcode(),  
                'country'    \=\> $order-\>get\_billing\_country(),  
                'email'      \=\> $order-\>get\_billing\_email(),  
                'phone'      \=\> $order-\>get\_billing\_phone(),  
            \],  
            'shipping'        \=\> \[  
                'first\_name' \=\> $order-\>get\_shipping\_first\_name(),  
                'last\_name'  \=\> $order-\>get\_shipping\_last\_name(),  
                'company'    \=\> $order-\>get\_shipping\_company(),  
                'address\_1'  \=\> $order-\>get\_shipping\_address\_1(),  
                'address\_2'  \=\> $order-\>get\_shipping\_address\_2(),  
                'city'       \=\> $order-\>get\_shipping\_city(),  
                'state'      \=\> $order-\>get\_shipping\_state(),  
                'postcode'   \=\> $order-\>get\_shipping\_postcode(),  
                'country'    \=\> $order-\>get\_shipping\_country(),  
                'phone'      \=\> $order-\>get\_meta('\_shipping\_phone'),  
            \],  
            'items'           \=\> $get\_items($order),  
            'shipping\_lines'  \=\> $get\_shipping($order),  
            'coupon\_lines'    \=\> $get\_coupons($order),  
            'fee\_lines'       \=\> $get\_fees($order),  
            'meta'            \=\> cmu\_safe\_order\_meta($order-\>get\_id()),// crudo (todas las metas)  
			'Descuentos'      \=\> $descuentos,  
        \];  
    }

	if (\!function\_exists('cmu\_get\_order\_discounts')) {  
		/\*\*  
		 \* Descuentos por orden:  
		 \* \- Items: lista solo si tienen descuento (catálogo y/o línea)  
		 \*   \- DescuentoCatalogo: (regular\_price \- sale\_price)  
		 \*   \- DescuentoLinea: (line\_subtotal \- line\_total)  \[excluye impuestos\]  
		 \*   \- DescuentoTotalProducto: suma de ambos  
		 \* \- Cupones: códigos y montos aplicados a la orden  
		 \*/  
		function cmu\_get\_order\_discounts( WC\_Order $order ) {  
			$items\_desc \= \[\];

			foreach ( $order-\>get\_items('line\_item') as $item\_id \=\> $item ) {  
				$product \= $item-\>get\_product();  
				if ( \! $product ) continue;

				$name \= $item-\>get\_name();  
				$sku  \= $product-\>get\_sku() ?: '';  
				$qty  \= max(1, (int)$item-\>get\_quantity()); // evitar /0

				// \---------- Descuento de Catálogo (regular vs sale) \----------  
				$regular\_raw \= $product-\>get\_regular\_price();  
				$sale\_raw    \= $product-\>get\_sale\_price();

				$desc\_cat\_unit  \= 0.0;  
				$desc\_cat\_total \= 0.0;  
				if ($regular\_raw \!== '' && $sale\_raw \!== '') {  
					$regular \= (float)$regular\_raw;  
					$sale    \= (float)$sale\_raw;  
					if ($regular \> $sale) {  
						$desc\_cat\_unit  \= $regular \- $sale;  
						$desc\_cat\_total \= $desc\_cat\_unit \* $qty;  
					}  
				}

				// \---------- Descuento de Línea (cupones/reglas sobre el ítem) \----------  
				// Nota: subtotal y total EXCLUYEN impuestos. Si lo quieres con impuestos, suma get\_\*\_tax().  
				$line\_subtotal \= (float)$item-\>get\_subtotal();  
				$line\_total    \= (float)$item-\>get\_total();

				$desc\_line\_total \= max(0, $line\_subtotal \- $line\_total);  
				$desc\_line\_unit  \= $qty ? ($desc\_line\_total / $qty) : 0.0;

				// \---------- Solo incluir si hay algún descuento \----------  
				if ( $desc\_cat\_total \> 0 || $desc\_line\_total \> 0 ) {  
					$items\_desc\[\] \= \[  
						'Item'                        \=\> trim( $name . ( $sku ? " ($sku)" : '' ) ),  
						'Nombre'                      \=\> $name,  
						'Sku'                         \=\> $sku,  
						'Cantidad'                    \=\> $qty,

						// Catálogo  
						'RegularPrice'                \=\> isset($regular) ? round($regular, 2\) : null,  
						'SalePrice'                   \=\> isset($sale) ? round($sale, 2\) : null,  
						'DescuentoCatalogoUnitario'   \=\> round($desc\_cat\_unit, 2),  
						'DescuentoCatalogoTotal'      \=\> round($desc\_cat\_total, 2),

						// Línea (por cupones/reglas sobre el ítem)  
						'PrecioLineaSubtotal'         \=\> round($line\_subtotal, 2), // total del ítem antes de descuentos de línea  
						'PrecioLineaTotal'            \=\> round($line\_total, 2),    // total pagado por el ítem (sin impuestos)  
						'DescuentoLineaUnitario'      \=\> round($desc\_line\_unit, 2),  
						'DescuentoLineaTotal'         \=\> round($desc\_line\_total, 2),

						// Total por producto  
						'DescuentoTotalProducto'      \=\> round($desc\_cat\_total \+ $desc\_line\_total, 2),

						'Moneda'                      \=\> $order-\>get\_currency(),  
					\];  
				}  
			}

			// \---------- Cupones de la orden (al final) \----------  
			$cupones \= \[\];  
			foreach ( $order-\>get\_items('coupon') as $c\_item ) {  
				$code  \= $c\_item-\>get\_code();  
				$monto \= (float)$c\_item-\>get\_discount() \+ (float)$c\_item-\>get\_discount\_tax();  
				$cupones\[\] \= \[  
					'Codigo' \=\> $code,  
					'Monto'  \=\> round($monto, 2),  
					'Moneda' \=\> $order-\>get\_currency(),  
				\];  
			}

			return \[  
				'Items'   \=\> array\_values($items\_desc),  
				'Cupones' \=\> array\_values($cupones),  
			\];  
		}  
	}

    // \--------- CREAR \---------  
    register\_rest\_route('custom-api/v1', '/order', \[  
        'methods'  \=\> 'POST',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
            $d \= $request-\>get\_json\_params() ?: \[\];

            // Cliente: por id o email  
            $customer\_id \= 0;  
            if (\!empty($d\['customer\_id'\])) {  
                $customer\_id \= (int)$d\['customer\_id'\];  
            } elseif (\!empty($d\['customer\_email'\])) {  
                $u \= get\_user\_by('email', sanitize\_email($d\['customer\_email'\]));  
                if ($u) $customer\_id \= (int)$u-\>ID;  
            }

            $order \= wc\_create\_order(\['customer\_id'=\>$customer\_id\]);

            // Billing / Shipping  
            if (\!empty($d\['billing'\]))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\]), 'billing');  
            if (\!empty($d\['shipping'\])) $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\]), 'shipping');  
            if (\!empty($d\['shipping'\]\['phone'\])) $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($d\['shipping'\]\['phone'\])));

            // Items (requeridos)  
            $items \= $d\['items'\] ?? \[\];  
            if (\!is\_array($items) || \!$items) return new WP\_Error('invalid','Envía items (array)', \['status'=\>400\]);  
            $cmu\_order\_set\_items($order, $items);

            // Fees / Shipping lines / Coupons (opcionales)  
            if (\!empty($d\['fee\_lines'\]) && is\_array($d\['fee\_lines'\])) $cmu\_order\_set\_fees($order, $d\['fee\_lines'\]);  
            if (\!empty($d\['shipping\_lines'\]) && is\_array($d\['shipping\_lines'\])) $cmu\_order\_set\_shipping($order, $d\['shipping\_lines'\]);  
            if (\!empty($d\['coupon\_lines'\]) && is\_array($d\['coupon\_lines'\])) $cmu\_order\_set\_coupons($order, $d\['coupon\_lines'\]);

            // Método de pago / status  
            if (\!empty($d\['payment\_method'\])) {  
                $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
                if (\!empty($d\['payment\_method\_title'\])) {  
                    $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
                }  
            }  
            if (\!empty($d\['status'\])) {  
                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) ); // e.g. pending|processing|completed  
            }

            // Meta libre en la orden (opcional)  
            if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
                foreach ($d\['meta'\] as $k=\>$v) {  
                    $order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
                }  
            }

            $order-\>calculate\_totals();

            // Marcar como pagada (opcional)  
            if (\!empty($d\['set\_paid'\])) {  
                $order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
            } elseif (\!empty($d\['transaction\_id'\])) {  
                $order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
            }

            $order-\>save();

            return \['success'=\>true,'order\_id'=\>(int)$order-\>get\_id(),'status'=\>$order-\>get\_status()\];  
        }  
    \]);

    // \--------- LEER (uno) \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'GET',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            return cmu\_order\_payload($id);  
        }  
    \]);

    // \--------- LISTAR (paginado \+ filtros) \---------  
	register\_rest\_route('custom-api/v1', '/orders', \[  
		'methods'  \=\> 'GET',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request){

			$page     \= max(1, (int)($request-\>get\_param('page') ?: 1));  
			$per\_page \= min(200, max(1, (int)($request-\>get\_param('per\_page') ?: 50)));

			// status: admite 'any' o múltiples separados por coma, con o sin 'wc-'  
			$status\_raw \= trim((string)($request-\>get\_param('status') ?? 'any'));  
			$statuses \= \[\];  
			if ($status\_raw \!== '' && $status\_raw \!== 'any') {  
				foreach (explode(',', $status\_raw) as $st) {  
					$st \= strtolower(trim($st));  
					if ($st \=== '') continue;  
					if (strpos($st, 'wc-') \=== 0\) $st \= substr($st, 3); // normaliza  
					$statuses\[\] \= $st; // e.g. processing, completed, pending  
				}  
			}

			$orderby \= strtolower((string)($request-\>get\_param('orderby') ?? 'date'));  
			if (\!in\_array($orderby, \['date','id','modified'\], true)) $orderby \= 'date';

			$order \= strtoupper((string)($request-\>get\_param('order') ?? 'DESC'));  
			if (\!in\_array($order, \['ASC','DESC'\], true)) $order \= 'DESC';

			$search   \= sanitize\_text\_field((string)($request-\>get\_param('search') ?? '')); // id/orden/email  
			$customer \= sanitize\_text\_field((string)($request-\>get\_param('customer') ?? '')); // user id o email

			// Filtros extra opcionales (ISO8601 o Y-m-d)  
			$date\_after  \= sanitize\_text\_field((string)($request-\>get\_param('date\_after')  ?? ''));  
			$date\_before \= sanitize\_text\_field((string)($request-\>get\_param('date\_before') ?? ''));

			$payment\_method \= sanitize\_text\_field((string)($request-\>get\_param('payment\_method') ?? ''));  
			$transaction\_id \= sanitize\_text\_field((string)($request-\>get\_param('transaction\_id') ?? ''));

			// Base de la query  
			$args \= \[  
				'type'      \=\> 'shop\_order',  
				'limit'     \=\> $per\_page,  
				'offset'    \=\> ($page \- 1\) \* $per\_page,  
				'orderby'   \=\> $orderby,  
				'order'     \=\> $order,  
				'return'    \=\> 'ids',  
				'paginate'  \=\> true, // clave: devuelve \['orders'=\>\[\], 'total'=\>N, 'max\_num\_pages'=\>M\]  
			\];  
			if ($statuses) {  
				$args\['status'\] \= $statuses;  
			}

			// \---- SEARCH: ID / número de pedido / email de facturación \----  
			if ($search \!== '') {  
				if (ctype\_digit($search)) {  
					// Si es numérico, inclúyelo directamente (by ID)  
					$args\['include'\] \= \[(int)$search\];  
				} elseif (strpos($search, '@') \!== false) {  
					// email: usar búsqueda en campos de billing  
					$args\['search'\] \= $search;  
					$args\['search\_fields'\] \= \['billing'\]; // incluye email/nombre/apellidos/compañía de billing  
				} else {  
					// texto: busca por número de pedido (y fallback a billing)  
					$args\['search'\] \= $search;  
					$args\['search\_fields'\] \= \['order\_number', 'billing'\];  
				}  
			}

			// \---- CUSTOMER (ID o email) \----  
			if ($customer \!== '') {  
				if (ctype\_digit($customer)) {  
					$args\['customer'\] \= (int)$customer; // user ID  
				} elseif (strpos($customer, '@') \!== false) {  
					$args\['customer'\] \= $customer; // email  
				}  
			}

			// \---- Rango de fechas (date\_created) \----  
			// Acepta 'YYYY-mm-dd' o ISO8601; WooCommerce acepta arrays de after/before con objetos DateTime o strings parseables  
			if ($date\_after || $date\_before) {  
				$range \= \[\];  
				if ($date\_after)  $range\['after'\]  \= $date\_after;  
				if ($date\_before) $range\['before'\] \= $date\_before;  
				$args\['date\_created'\] \= $range;  
			}

			// \---- Filtros por método de pago / transaction\_id \----  
			$meta\_query \= \[\];  
			if ($payment\_method \!== '') {  
				$meta\_query\[\] \= \[  
					'key'   \=\> '\_payment\_method',  
					'value' \=\> $payment\_method,  
				\];  
			}  
			if ($transaction\_id \!== '') {  
				$meta\_query\[\] \= \[  
					'key'   \=\> '\_transaction\_id',  
					'value' \=\> $transaction\_id,  
				\];  
			}  
			if ($meta\_query) {  
				$args\['meta\_query'\] \= \[  
					'relation' \=\> 'AND',  
					...$meta\_query,  
				\];  
			}

			// Ejecutar  
			$result \= wc\_get\_orders($args); // con paginate \=\> true devuelve array asociativo  
			$ids    \= is\_array($result) && isset($result\['orders'\]) ? $result\['orders'\] : (array)$result;

			$total  \= (int)($result\['total'\] ?? 0);  
			$pages  \= (int)($result\['max\_num\_pages'\] ?? $result\['pages'\] ?? ( $per\_page ? ceil($total / $per\_page) : 1 ));

			$rows \= \[\];  
			foreach ($ids as $oid) {  
				$rows\[\] \= cmu\_order\_payload($oid);  
			}

			return \[  
				'success'   \=\> true,  
				'page'      \=\> $page,  
				'per\_page'  \=\> $per\_page,  
				'pages'     \=\> $pages,  
				'total'     \=\> $total,  
				'rows'      \=\> $rows,  
				'args\_used' \=\> $args, // útil en debug; quítalo en prod si quieres  
			\];  
		}  
	\]);

	  
    // \--------- ACTUALIZAR (replace items si se envían) \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'PUT',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
            $id \= (int)$request\['id'\];  
            $order \= wc\_get\_order($id);  
            if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);

            $d \= $request-\>get\_json\_params() ?: \[\];

            // Direcciones  
            if (array\_key\_exists('billing', $d))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\] ?: \[\]), 'billing');  
            if (array\_key\_exists('shipping',$d))  $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\] ?: \[\]), 'shipping');  
            if (\!empty($d\['shipping'\]\['phone'\]) || array\_key\_exists('shipping', $d)) {  
                $phone \= $d\['shipping'\]\['phone'\] ?? '';  
                if ($phone \=== '') $order-\>delete\_meta\_data('\_shipping\_phone'); else $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($phone)));  
            }

            // Items: si se envía "items", reemplaza todos  
            if (array\_key\_exists('items', $d)) {  
                $items \= (array)$d\['items'\];  
                if ($items) $cmu\_order\_set\_items($order, $items);  
                else {  
                    // si viene vacío, significa limpiar  
                    foreach ($order-\>get\_items() as $iid=\>$it) $order-\>remove\_item($iid);  
                }  
            }

            // Fees, Shipping lines, Coupons  
            if (array\_key\_exists('fee\_lines',$d)) {  
                $fees \= (array)$d\['fee\_lines'\];  
                if ($fees) $cmu\_order\_set\_fees($order, $fees);  
                else foreach ($order-\>get\_items('fee') as $fid=\>$f) $order-\>remove\_item($fid);  
            }  
            if (array\_key\_exists('shipping\_lines',$d)) {  
                $ship \= (array)$d\['shipping\_lines'\];  
                if ($ship) $cmu\_order\_set\_shipping($order, $ship);  
                else foreach ($order-\>get\_items('shipping') as $sid=\>$s) $order-\>remove\_item($sid);  
            }  
            if (array\_key\_exists('coupon\_lines',$d)) {  
                $cps \= (array)$d\['coupon\_lines'\];  
                if ($cps) $cmu\_order\_set\_coupons($order, $cps);  
                else foreach ($order-\>get\_items('coupon') as $cid=\>$c) $order-\>remove\_item($cid);  
            }

            // Cliente / pago / status  
            if (array\_key\_exists('customer\_id',$d))   $order-\>set\_customer\_id( (int)$d\['customer\_id'\] );  
            if (\!empty($d\['payment\_method'\]))        $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
            if (\!empty($d\['payment\_method\_title'\]))  $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
            if (\!empty($d\['status'\]))                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) );

            // Meta libre  
            if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
                foreach ($d\['meta'\] as $k=\>$v) {  
                    $order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
                }  
            }

            // Totales  
            $order-\>calculate\_totals();

            // Pago/Transacción  
            if (\!empty($d\['set\_paid'\])) {  
                $order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
            } elseif (\!empty($d\['transaction\_id'\])) {  
                $order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
            }

            $order-\>save();

            return \['success'=\>true,'order\_id'=\>$order-\>get\_id(),'status'=\>$order-\>get\_status(),'mode'=\>'updated'\];  
        }  
    \]);

    // \--------- BORRAR \---------  
    register\_rest\_route('custom-api/v1', '/order/(?P\<id\>\\d+)', \[  
        'methods'  \=\> 'DELETE',  
        'permission\_callback' \=\> 'cmu\_permission',  
        'callback' \=\> function(WP\_REST\_Request $request){  
            $id \= (int)$request\['id'\];  
            $order \= wc\_get\_order($id);  
            if (\!$order) return new WP\_Error('not\_found','Order not found',\['status'=\>404\]);  
            $ok \= wp\_delete\_post($id, true);  
            if (\!$ok) return new WP\_Error('delete\_failed','No se pudo eliminar',\['status'=\>500\]);  
            return \['success'=\>true,'deleted\_id'=\>$id\];  
        }  
    \]);  
	  
	/\* \---------- POST /orders/batch (create\_only) \---------- \*/  
	register\_rest\_route('custom-api/v1', '/orders/batch', \[  
		'methods'  \=\> 'POST',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
			$p \= $request-\>get\_json\_params() ?: \[\];  
			$rows \= $p\['orders'\] ?? $p\['rows'\] ?? \[\];  
			if (\!is\_array($rows) || \!$rows) {  
				return new WP\_Error('invalid\_data','Envía "orders" (array de objetos).',\['status'=\>400\]);  
			}

			$results \= \[\];  
			foreach ($rows as $i=\>$d) {  
				try {  
					$d \= (array)$d;

					// Validación mínima  
					$items \= $d\['items'\] ?? \[\];  
					if (\!is\_array($items) || \!$items) throw new Exception("Fila $i: falta items (array)");

					// Cliente por id o email  
					$customer\_id \= 0;  
					if (\!empty($d\['customer\_id'\])) {  
						$customer\_id \= (int)$d\['customer\_id'\];  
					} elseif (\!empty($d\['customer\_email'\])) {  
						$u \= get\_user\_by('email', sanitize\_email($d\['customer\_email'\]));  
						if ($u) $customer\_id \= (int)$u-\>ID;  
					}

					$order \= wc\_create\_order(\['customer\_id'=\>$customer\_id\]);

					// Billing / Shipping  
					if (\!empty($d\['billing'\]))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\]), 'billing');  
					if (\!empty($d\['shipping'\])) $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\]), 'shipping');  
					if (\!empty($d\['shipping'\]\['phone'\])) $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($d\['shipping'\]\['phone'\])));

					// Items obligatorios  
					$cmu\_order\_set\_items($order, $items);

					// Fees / Shipping / Coupons (opcionales)  
					if (\!empty($d\['fee\_lines'\]) && is\_array($d\['fee\_lines'\]))         $cmu\_order\_set\_fees($order, $d\['fee\_lines'\]);  
					if (\!empty($d\['shipping\_lines'\]) && is\_array($d\['shipping\_lines'\]))$cmu\_order\_set\_shipping($order, $d\['shipping\_lines'\]);  
					if (\!empty($d\['coupon\_lines'\]) && is\_array($d\['coupon\_lines'\]))    $cmu\_order\_set\_coupons($order, $d\['coupon\_lines'\]);

					// Pago / status  
					if (\!empty($d\['payment\_method'\])) {  
						$order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
						if (\!empty($d\['payment\_method\_title'\])) {  
							$order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
						}  
					}  
					if (\!empty($d\['status'\])) {  
						$order-\>set\_status( sanitize\_text\_field($d\['status'\]) );  
					}

					// Meta libre  
					if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
						foreach ($d\['meta'\] as $k=\>$v) {  
							$order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
						}  
					}

					$order-\>calculate\_totals();

					// Pago/Transacción  
					if (\!empty($d\['set\_paid'\])) {  
						$order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
					} elseif (\!empty($d\['transaction\_id'\])) {  
						$order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
					}

					$order-\>save();

					$results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'created','order\_id'=\>(int)$order-\>get\_id(),'status'=\>$order-\>get\_status()\];

				} catch (Throwable $e) {  
					$results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
				}  
			}

			return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
		}  
	\]);

	/\* \---------- PUT /orders/batch (update\_only) \---------- \*/  
	register\_rest\_route('custom-api/v1', '/orders/batch', \[  
		'methods'  \=\> 'PUT',  
		'permission\_callback' \=\> 'cmu\_permission',  
		'callback' \=\> function(WP\_REST\_Request $request) use ($cmu\_clean\_assoc, $cmu\_order\_set\_items, $cmu\_order\_set\_shipping, $cmu\_order\_set\_coupons, $cmu\_order\_set\_fees){  
			$p \= $request-\>get\_json\_params() ?: \[\];  
			$rows \= $p\['orders'\] ?? $p\['updates'\] ?? $p\['rows'\] ?? \[\];  
			if (\!is\_array($rows) || \!$rows) {  
				return new WP\_Error('invalid\_data','Envía "orders" (array con "id").',\['status'=\>400\]);  
			}

			$results \= \[\];  
			foreach ($rows as $i=\>$d) {  
				try {  
					$d \= (array)$d;  
					$id \= isset($d\['id'\]) ? (int)$d\['id'\] : 0;  
					if (\!$id) throw new Exception("Fila $i: falta id");

					$order \= wc\_get\_order($id);  
					if (\!$order) { $results\[\] \= \['index'=\>$i,'success'=\>false,'id'=\>$id,'error'=\>'Orden no encontrada'\]; continue; }

					// Direcciones (replace si se envían)  
					if (array\_key\_exists('billing', $d))  $order-\>set\_address($cmu\_clean\_assoc($d\['billing'\] ?: \[\]), 'billing');  
					if (array\_key\_exists('shipping',$d))  $order-\>set\_address($cmu\_clean\_assoc($d\['shipping'\] ?: \[\]), 'shipping');  
					if (\!empty($d\['shipping'\]\['phone'\]) || array\_key\_exists('shipping', $d)) {  
						$phone \= $d\['shipping'\]\['phone'\] ?? '';  
						if ($phone \=== '') $order-\>delete\_meta\_data('\_shipping\_phone'); else $order-\>update\_meta\_data('\_shipping\_phone', wp\_unslash(trim($phone)));  
					}

					// Items (si viene, reemplaza todo; si \[\], limpia)  
					if (array\_key\_exists('items',$d)) {  
						$items \= (array)$d\['items'\];  
						if ($items) $cmu\_order\_set\_items($order, $items);  
						else foreach ($order-\>get\_items() as $iid=\>$it) $order-\>remove\_item($iid);  
					}

					// Fees / Shipping / Coupons (replace si se envían)  
					if (array\_key\_exists('fee\_lines',$d)) {  
						$fees \= (array)$d\['fee\_lines'\];  
						if ($fees) $cmu\_order\_set\_fees($order, $fees);  
						else foreach ($order-\>get\_items('fee') as $fid=\>$f) $order-\>remove\_item($fid);  
					}  
					if (array\_key\_exists('shipping\_lines',$d)) {  
						$ship \= (array)$d\['shipping\_lines'\];  
						if ($ship) $cmu\_order\_set\_shipping($order, $ship);  
						else foreach ($order-\>get\_items('shipping') as $sid=\>$s) $order-\>remove\_item($sid);  
					}  
					if (array\_key\_exists('coupon\_lines',$d)) {  
						$cps \= (array)$d\['coupon\_lines'\];  
						if ($cps) $cmu\_order\_set\_coupons($order, $cps);  
						else foreach ($order-\>get\_items('coupon') as $cid=\>$c) $order-\>remove\_item($cid);  
					}

					// Cliente / pago / status  
					if (array\_key\_exists('customer\_id',$d))   $order-\>set\_customer\_id( (int)$d\['customer\_id'\] );  
					if (\!empty($d\['payment\_method'\]))        $order-\>set\_payment\_method( sanitize\_text\_field($d\['payment\_method'\]) );  
					if (\!empty($d\['payment\_method\_title'\]))  $order-\>set\_payment\_method\_title( sanitize\_text\_field($d\['payment\_method\_title'\]) );  
					if (\!empty($d\['status'\]))                $order-\>set\_status( sanitize\_text\_field($d\['status'\]) );

					// Meta libre  
					if (\!empty($d\['meta'\]) && is\_array($d\['meta'\])) {  
						foreach ($d\['meta'\] as $k=\>$v) {  
							$order-\>update\_meta\_data(sanitize\_key($k), is\_scalar($v)? wp\_unslash($v) : wp\_json\_encode($v));  
						}  
					}

					// Totales  
					$order-\>calculate\_totals();

					// Pago/Transacción  
					if (\!empty($d\['set\_paid'\])) {  
						$order-\>payment\_complete( \!empty($d\['transaction\_id'\]) ? sanitize\_text\_field($d\['transaction\_id'\]) : '' );  
					} elseif (\!empty($d\['transaction\_id'\])) {  
						$order-\>set\_transaction\_id( sanitize\_text\_field($d\['transaction\_id'\]) );  
					}

					$order-\>save();

					$results\[\] \= \['index'=\>$i,'success'=\>true,'mode'=\>'updated','order\_id'=\>$order-\>get\_id(),'status'=\>$order-\>get\_status()\];

				} catch (Throwable $e) {  
					$results\[\] \= \['index'=\>$i,'success'=\>false,'error'=\>$e-\>getMessage()\];  
				}  
			}

			return \['success'=\>true,'count'=\>count($results),'results'=\>$results\];  
		}  
	\]);  
});

# 28 \- Departamentos/Ciudades V4 With Checkout

**28 \- Departamentos/Ciudades V4 With Checkout**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) y precarga desde el popup.  
 \* Version:     1.3.3  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                // Fallback sin nonce  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    $dept.on('change', function(){ cargarCiudades($(this).val(), null); });  
    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_city\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    if (isset($\_GET\['dc\_ciudad'\])     && is\_numeric($\_GET\['dc\_ciudad'\]))      return (int) $\_GET\['dc\_ciudad'\];  
    return null;  
}  
function dc\_get\_selected\_dept\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    if (isset($\_GET\['dc\_depto'\])        && is\_numeric($\_GET\['dc\_depto'\]))       return (int) $\_GET\['dc\_depto'\];  
    return null;  
}

/\* \============== Cookies seguras (path '/', SameSite=Lax, dominio opcional) \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    // Limpiar  
    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Aplicar (POST)  
    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Compat GET  
    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché cuando hay filtro o en tienda/shortcodes \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $content \= get\_post()-\>post\_content ?? '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    // Registrar handle seguro  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup): ahora también guarda cookies AL CAMBIAR \===  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(\!val) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    // Delegación (sirve aunque el popup se inyecte luego)  
    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);         // \<— guarda cookie al CAMBIAR  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);         // \<— guarda cookie al CAMBIAR  
    });

    // Inicial  
    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    // Elementor Popup: al abrir  
    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    // Guardado extra al ENVIAR (por si acaso)  
    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept) setClientCookie('dc\_dept', dept);  
        if (city) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS (opcional, igual al tuyo)  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.3.3');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades (tolerante a nonce cacheado) \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    // Si falla y el usuario está logueado, sí devolvemos error; para invitados permitimos lectura.  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global: aplica también a REST/Elementor/JetEngine \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
/\* \-------------------------------------------------------------  
 \* Orden base de address fields (forzar orden a nivel global)  
 \* \-----------------------------------------------------------\*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    // Departamento  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    // Ciudad  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    // Dirección 1  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    // Dirección 2 (debajo de address\_1)  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85; // justo debajo  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO'; // ajusta tu país si no es Colombia  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    // Departamento (billing\_state)  
    $deps\_all \= dc\_get\_departamentos\_options();  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
    \]);

    // Ciudad (billing\_city) dependiente del dept preseleccionado  
    $city\_opts \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
    \]);

    // Dirección 1 y 2 ya están ordenadas por el filtro global  
    return $fields;  
});

/\* \================== Checkout: JS para dependencias y cookies \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= dc\_get\_selected\_dept\_id();  
        $sel\_city \= dc\_get\_selected\_city\_id();

        $js\_checkout \= \<\<\<JS  
(function($){  
    var dcLoadingCities \= false;  
    var dcLastDept \= null;

    function setClientCookie(name, val){  
        if(\!val) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function dcLoadCiudadesCheckout(deptId, preselect){  
        if (\!deptId) {  
            $('\#billing\_city').html('\<option value=""\>— Selecciona —\</option\>').prop('disabled', true);  
            dcLastDept \= null;  
            return;  
        }  
        if (dcLoadingCities || dcLastDept \=== String(deptId)) return;

        dcLoadingCities \= true;  
        var $city \= $('\#billing\_city');  
        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        $city.prop('disabled', true);

        function finish(html, enable){  
            $city.html(html);  
            if (enable) $city.prop('disabled', false);  
            dcLoadingCities \= false;  
            dcLastDept \= String(deptId);  
        }

        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Cambios en checkout \-\> set cookie \+ recargar ciudades  
    $(document).on('change', '\#billing\_state', function(){  
        var deptId \= $(this).val() || '';  
        setClientCookie('dc\_dept', deptId);  
        dcLastDept \= null; // forzar recarga si vuelve a elegir el mismo tras un refresh  
        dcLoadCiudadesCheckout(deptId, null);  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var cityId \= $(this).val() || '';  
        setClientCookie('dc\_city', cityId);  
    });

    // Inicial (precarga desde cookies/servidor)  
    $(function(){  
        var preDept \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCity \= $('\#billing\_city').val() || '{$sel\_city}';  
        if (preDept){  
            dcLoadCiudadesCheckout(preDept, preCity || null);  
        }  
    });

    // Si WooCommerce refresca fragmentos del checkout  
    $(document.body).on('updated\_checkout', function(){  
        var deptId \= $('\#billing\_state').val();  
        var curCity \= $('\#billing\_city').val();  
        if (deptId && (dcLastDept \=== null || String(deptId) \!== dcLastDept)) {  
            dcLoadCiudadesCheckout(deptId, curCity);  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

# 29 \- Departamentos/Ciudades V5 With Checkout

**29 \- Departamentos/Ciudades V5 With Checkout**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) y precarga desde el popup.  
 \* Version:     1.4.1  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                // Fallback sin nonce  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    $dept.on('change', function(){ cargarCiudades($(this).val(), null); });  
    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_city\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    if (isset($\_GET\['dc\_ciudad'\])     && is\_numeric($\_GET\['dc\_ciudad'\]))      return (int) $\_GET\['dc\_ciudad'\];  
    return null;  
}  
function dc\_get\_selected\_dept\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    if (isset($\_GET\['dc\_depto'\])        && is\_numeric($\_GET\['dc\_depto'\]))       return (int) $\_GET\['dc\_depto'\];  
    return null;  
}

/\* \============== Cookies seguras (path '/', SameSite=Lax, dominio opcional) \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    // Limpiar  
    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Aplicar (POST)  
    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Compat GET  
    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché cuando hay filtro o en tienda/shortcodes \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $content \= get\_post()-\>post\_content ?? '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    // Registrar handle seguro  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup)  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    // Delegación  
    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);  
    });

    // Inicial  
    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    // Elementor Popup  
    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    // Guardado extra al ENVIAR  
    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept) setClientCookie('dc\_dept', dept);  
        if (city) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.4.1');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades (tolerante a nonce cacheado) \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    // Si falla y el usuario está logueado, sí devolvemos error; para invitados permitimos lectura.  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global: aplica también a REST/Elementor/JetEngine \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    // Departamento  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    // Ciudad  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    // Dirección 1  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    // Dirección 2  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85;  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO'; // ajusta si aplica a otro país  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    // Departamento (billing\_state)  
    $deps\_all \= dc\_get\_departamentos\_options();  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
    \]);

    // Ciudad dependiente (billing\_city) – opciones se cargan por AJAX  
    $city\_opts \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
    \]);

    return $fields;  
});

/\* \================== Checkout: JS dependencias \+ ANTI-LOOP \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= (string) (dc\_get\_selected\_dept\_id() ?: '');  
        $sel\_city \= (string) (dc\_get\_selected\_city\_id() ?: '');

        $js\_checkout \= \<\<\<JS  
(function($){  
    // Flags y helpers anti-loop  
    var dcLoadingCities \= false;

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function needsLoadForDept(\\$city, deptId){  
        if(\!deptId){ return true; }  
        var boundDept \= \\$city.data('dcDept');  
        var hasOptions \= \\$city.find('option').length \> 1; // más que "— Selecciona —"  
        // Cargar solo si el select aún no está ligado a este dept o si no tiene opciones reales  
        return (String(boundDept||'') \!== String(deptId)) || \!hasOptions;  
    }

    function dcLoadCiudadesCheckout(deptId, preselect){  
        var \\$city \= $('\#billing\_city');

        if (\!deptId) {  
            // Sin departamento: limpiar y desligar  
            \\$city.removeData('dcDept')  
                 .prop('disabled', true)  
                 .html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }

        // Si ya está cargado para este dept y tiene opciones, no recargar (anti-loop)  
        if (\!needsLoadForDept(\\$city, deptId)) {  
            // Asegura selección si existe (sin disparar change)  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            return;  
        }

        if (dcLoadingCities) return; // evita carreras  
        dcLoadingCities \= true;

        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        \\$city.prop('disabled', true);

        function finish(html, enable){  
            // No dispares eventos aquí (anti-loop): NO trigger('change')  
            \\$city.html(html);  
            if (enable) \\$city.prop('disabled', false);  
            // Marca el dept para el que quedaron estas opciones  
            \\$city.data('dcDept', String(deptId));  
            // Aplica preselect si existe y es válido (sin change)  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            dcLoadingCities \= false;  
        }

        // Intento con nonce  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                // Fallback sin nonce  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            // Fallback directo  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Eventos de usuario (estos sí pueden disparar update\_checkout luego, y está bien)  
    $(document).on('change', '\#billing\_state', function(){  
        var deptId \= $(this).val() || '';  
        setClientCookie('dc\_dept', deptId);  
        dcLoadCiudadesCheckout(deptId, null); // sin trigger de change al terminar  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var cityId \= $(this).val() || '';  
        setClientCookie('dc\_city', cityId);  
        // No hacemos nada más aquí para no entrar en loop  
    });

    // Inicial (primera carga)  
    $(function(){  
        var preDept \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCity \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (preDept){  
            dcLoadCiudadesCheckout(preDept, preCity || null);  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }  
    });

    // Re-render de WC (updated\_checkout): sólo recargar si hace falta (anti-loop)  
    $(document.body).on('updated\_checkout', function(){  
        var deptId \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var curCity \= $('\#billing\_city').val() || '{$sel\_city}';  
        if (deptId){  
            // Sólo si el select no está ligado al dept actual o no tiene opciones  
            if (needsLoadForDept($('\#billing\_city'), deptId)) {  
                dcLoadCiudadesCheckout(deptId, curCity || null);  
            }  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

/\* \================== VALIDACIÓN DE COMPATIBILIDAD (CIUDAD) \================== \*/

/\*\*  
 \* Helper: obtiene IDs de términos de ciudad (hijos) asignados a un producto/variación.  
 \*/  
function dc\_get\_product\_city\_term\_ids( int $product\_id ): array {  
    $terms \= wp\_get\_post\_terms( $product\_id, DC\_TAX, \['fields' \=\> 'all'\] );  
    if ( is\_wp\_error($terms) || empty($terms) ) return \[\];  
    $ids \= \[\];  
    foreach ($terms as $t) {  
        if ( \! empty($t-\>parent) ) { // sólo hijos (ciudades)  
            $ids\[\] \= (int) $t-\>term\_id;  
        }  
    }  
    return array\_values(array\_unique($ids));  
}

/\*\*  
 \* Helper: obtiene nombres legibles de los IDs de ciudad.  
 \*/  
function dc\_city\_names\_from\_ids( array $ids ): array {  
    $out \= \[\];  
    foreach ($ids as $id) {  
        $term \= get\_term( (int) $id, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $out\[\] \= $term-\>name;  
        }  
    }  
    sort($out, SORT\_NATURAL | SORT\_FLAG\_CASE);  
    return $out;  
}

/\*\*  
 \* Obtiene la ciudad elegida en checkout (term\_id en billing\_city).  
 \* Prioridad: POST (checkout) \> WC()-\>checkout-\>get\_value() \> cookie \> null  
 \*/  
function dc\_get\_checkout\_selected\_city\_from\_request(): ?int {  
    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($val) ) return (int) $val;  
    }  
    $cookie \= dc\_get\_selected\_city\_id();  
    return $cookie ?: null;  
}

/\*\*  
 \* Valida compatibilidad en el carrito con la ciudad seleccionada.  
 \*/  
function dc\_validate\_cart\_city\_compatibility() {  
    if ( \! function\_exists('WC') ) return;  
    $city\_id \= dc\_get\_checkout\_selected\_city\_from\_request();  
    if ( \! $city\_id ) return; // sin ciudad aún: no bloquear

    $conflicts \= \[\];

    foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
        $product\_id   \= isset($cart\_item\['variation\_id'\]) && $cart\_item\['variation\_id'\] ? (int) $cart\_item\['variation\_id'\] : (int) $cart\_item\['product\_id'\];  
        $product\_obj  \= wc\_get\_product( $product\_id );  
        if ( \! $product\_obj ) continue;

        // Variación \-\> si no tiene ciudades, hereda del padre  
        $city\_ids \= dc\_get\_product\_city\_term\_ids( $product\_id );  
        if ( empty($city\_ids) && $product\_obj-\>is\_type('variation') ) {  
            $parent\_id \= $product\_obj-\>get\_parent\_id();  
            if ( $parent\_id ) {  
                $city\_ids \= dc\_get\_product\_city\_term\_ids( (int) $parent\_id );  
            }  
        }

        // Sin ciudades asignadas \-\> incompatible (ajustable según negocio)  
        if ( empty($city\_ids) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> \[\],  
            \];  
            continue;  
        }

        if ( \! in\_array( (int) $city\_id, $city\_ids, true ) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> $city\_ids,  
            \];  
        }  
    }

    if ( \! empty($conflicts) ) {  
        $city\_term \= get\_term( $city\_id, DC\_TAX );  
        $city\_name \= ($city\_term && \! is\_wp\_error($city\_term)) ? $city\_term-\>name : \_\_('la ciudad seleccionada', 'dc');

        $lines \= \[\];  
        foreach ( $conflicts as $c ) {  
            $available \= dc\_city\_names\_from\_ids( $c\['cities'\] );  
            $avail\_txt \= empty($available) ? \_\_('(sin ciudades asignadas)', 'dc') : implode(', ', $available);  
            $lines\[\] \= sprintf(  
                '%s \&rarr; %s',  
                esc\_html($c\['name'\]),  
                sprintf(\_\_('disponible en: %s', 'dc'), esc\_html($avail\_txt))  
            );  
        }

        $msg  \= '\<strong\>' . \_\_('Productos no disponibles para la ciudad seleccionada', 'dc') . "\</strong\>\<br\>";  
        $msg .= '\<ul style="margin-left:1em;list-style:disc;"\>';  
        foreach ($lines as $li) {  
            $msg .= '\<li\>' . $li . '\</li\>';  
        }  
        $msg .= '\</ul\>';  
        $msg .= '\<em\>' . sprintf(\_\_('Selecciona %s en la entrega o elimina estos productos.', 'dc'), esc\_html($city\_name)) . '\</em\>';

        wc\_add\_notice( wp\_kses\_post($msg), 'error' );  
    }  
}  
add\_action('woocommerce\_check\_cart\_items', 'dc\_validate\_cart\_city\_compatibility');  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
    dc\_validate\_cart\_city\_compatibility();  
}, 10, 2);

# 30 \- Departamentos/Ciudades V6 With Checkout

**30 \- Departamentos/Ciudades V6 With Checkout**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) y precarga desde el popup. Compatible con invitados (no logueados), anti-loop en checkout y resistente a caché.  
 \* Version:     1.4.2-g  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                // Fallback sin nonce (para invitados / caché)  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    // Guarda cookies al cambiar (invitados incluidos)  
    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }  
    $dept.on('change', function(){ setClientCookie('dc\_dept', $(this).val()); cargarCiudades($(this).val(), null); });  
    $city.on('change', function(){ setClientCookie('dc\_city', $(this).val()); });

    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_city\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    if (isset($\_GET\['dc\_ciudad'\])     && is\_numeric($\_GET\['dc\_ciudad'\]))      return (int) $\_GET\['dc\_ciudad'\];  
    return null;  
}  
function dc\_get\_selected\_dept\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    if (isset($\_GET\['dc\_depto'\])        && is\_numeric($\_GET\['dc\_depto'\]))       return (int) $\_GET\['dc\_depto'\];  
    return null;  
}

/\* \============== Cookies seguras (path '/', SameSite=Lax, dominio opcional) \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    // Limpiar  
    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Aplicar (POST)  
    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Compat GET  
    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché cuando hay filtro o en tienda/shortcodes \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $p \= get\_post();  
        $content \= $p && isset($p-\>post\_content) ? $p-\>post\_content : '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        // Evitar caché en LS/CF y similares  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    // Registrar handle seguro  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup) — intento con nonce \+ fallback, cookies al cambiar \===  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    // Delegación (sirve para popups que se inyectan luego)  
    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);  
    });

    // Inicial  
    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    // Elementor Popup: al abrir  
    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    // Guardado extra al ENVIAR  
    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept\!==undefined && dept\!==null) setClientCookie('dc\_dept', dept);  
        if (city\!==undefined && city\!==null) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.4.2-g');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades (tolerante a nonce cacheado) \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    // Rechaza sólo a logueados si el nonce falló; invitados siempre pueden leer (caché friendly)  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global: aplica también a REST/Elementor/JetEngine \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    // Departamento  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    // Ciudad  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    // Dirección 1  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    // Dirección 2  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85;  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO'; // ajusta si aplica a otro país  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    // Departamento (billing\_state)  
    $deps\_all \= dc\_get\_departamentos\_options();  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
    \]);

    // Ciudad dependiente (billing\_city) – opciones se cargan por AJAX  
    $city\_opts \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
    \]);

    return $fields;  
});

/\* \================== Checkout: JS dependencias \+ ANTI-LOOP \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= (string) (dc\_get\_selected\_dept\_id() ?: '');  
        $sel\_city \= (string) (dc\_get\_selected\_city\_id() ?: '');

        $js\_checkout \= \<\<\<JS  
(function($){  
    // Flags y helpers anti-loop  
    var dcLoadingCities \= false;

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function needsLoadForDept(\\$city, deptId){  
        if(\!deptId){ return true; }  
        var boundDept \= \\$city.data('dcDept');  
        var hasOptions \= \\$city.find('option').length \> 1; // más que "— Selecciona —"  
        // Cargar solo si el select aún no está ligado a este dept o si no tiene opciones reales  
        return (String(boundDept||'') \!== String(deptId)) || \!hasOptions;  
    }

    function dcLoadCiudadesCheckout(deptId, preselect){  
        var \\$city \= $('\#billing\_city');

        if (\!deptId) {  
            // Sin departamento: limpiar y desligar  
            \\$city.removeData('dcDept')  
                 .prop('disabled', true)  
                 .html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }

        // Si ya está cargado para este dept y tiene opciones, no recargar (anti-loop)  
        if (\!needsLoadForDept(\\$city, deptId)) {  
            // Asegura selección si existe (sin disparar change)  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            return;  
        }

        if (dcLoadingCities) return; // evita carreras  
        dcLoadingCities \= true;

        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        \\$city.prop('disabled', true);

        function finish(html, enable){  
            // No dispares eventos aquí (anti-loop): NO trigger('change')  
            \\$city.html(html);  
            if (enable) \\$city.prop('disabled', false);  
            // Marca el dept para el que quedaron estas opciones  
            \\$city.data('dcDept', String(deptId));  
            // Aplica preselect si existe y es válido (sin change)  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            dcLoadingCities \= false;  
        }

        // Intento con nonce  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                // Fallback sin nonce  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            // Fallback directo  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Eventos de usuario (set cookies al cambiar; no triggers extra para evitar loop)  
    $(document).on('change', '\#billing\_state', function(){  
        var deptId \= $(this).val() || '';  
        setClientCookie('dc\_dept', deptId);  
        dcLoadCiudadesCheckout(deptId, null); // sin trigger de change al terminar  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var cityId \= $(this).val() || '';  
        setClientCookie('dc\_city', cityId);  
        // No hacemos nada más aquí para no entrar en loop  
    });

    // Inicial (primera carga)  
    $(function(){  
        var preDept \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCity \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (preDept){  
            dcLoadCiudadesCheckout(preDept, preCity || null);  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }  
    });

    // Re-render de WC (updated\_checkout): sólo recargar si hace falta (anti-loop)  
    $(document.body).on('updated\_checkout', function(){  
        var deptId \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var curCity \= $('\#billing\_city').val() || '{$sel\_city}';  
        if (deptId){  
            if (needsLoadForDept($('\#billing\_city'), deptId)) {  
                dcLoadCiudadesCheckout(deptId, curCity || null);  
            }  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

/\* \================== VALIDACIÓN DE COMPATIBILIDAD (CIUDAD) \================== \*/

/\*\*  
 \* Helper: obtiene IDs de términos de ciudad (hijos) asignados a un producto/variación.  
 \*/  
function dc\_get\_product\_city\_term\_ids( int $product\_id ): array {  
    $terms \= wp\_get\_post\_terms( $product\_id, DC\_TAX, \['fields' \=\> 'all'\] );  
    if ( is\_wp\_error($terms) || empty($terms) ) return \[\];  
    $ids \= \[\];  
    foreach ($terms as $t) {  
        if ( \! empty($t-\>parent) ) { // sólo hijos (ciudades)  
            $ids\[\] \= (int) $t-\>term\_id;  
        }  
    }  
    return array\_values(array\_unique($ids));  
}

/\*\*  
 \* Helper: obtiene nombres legibles de los IDs de ciudad.  
 \*/  
function dc\_city\_names\_from\_ids( array $ids ): array {  
    $out \= \[\];  
    foreach ($ids as $id) {  
        $term \= get\_term( (int) $id, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $out\[\] \= $term-\>name;  
        }  
    }  
    sort($out, SORT\_NATURAL | SORT\_FLAG\_CASE);  
    return $out;  
}

/\*\*  
 \* Obtiene la ciudad elegida en checkout (term\_id en billing\_city).  
 \* Prioridad: POST (checkout) \> WC()-\>checkout-\>get\_value() \> cookie \> null  
 \*/  
function dc\_get\_checkout\_selected\_city\_from\_request(): ?int {  
    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($val) ) return (int) $val;  
    }  
    $cookie \= dc\_get\_selected\_city\_id();  
    return $cookie ?: null;  
}

/\*\*  
 \* Valida compatibilidad en el carrito con la ciudad seleccionada.  
 \*/  
function dc\_validate\_cart\_city\_compatibility() {  
    if ( \! function\_exists('WC') ) return;  
    $city\_id \= dc\_get\_checkout\_selected\_city\_from\_request();  
    if ( \! $city\_id ) return; // sin ciudad aún: no bloquear

    $conflicts \= \[\];

    foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
        $product\_id   \= isset($cart\_item\['variation\_id'\]) && $cart\_item\['variation\_id'\] ? (int) $cart\_item\['variation\_id'\] : (int) $cart\_item\['product\_id'\];  
        $product\_obj  \= wc\_get\_product( $product\_id );  
        if ( \! $product\_obj ) continue;

        // Variación \-\> si no tiene ciudades, hereda del padre  
        $city\_ids \= dc\_get\_product\_city\_term\_ids( $product\_id );  
        if ( empty($city\_ids) && $product\_obj-\>is\_type('variation') ) {  
            $parent\_id \= $product\_obj-\>get\_parent\_id();  
            if ( $parent\_id ) {  
                $city\_ids \= dc\_get\_product\_city\_term\_ids( (int) $parent\_id );  
            }  
        }

        // Sin ciudades asignadas \-\> incompatible (ajustable según negocio)  
        if ( empty($city\_ids) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> \[\],  
            \];  
            continue;  
        }

        if ( \! in\_array( (int) $city\_id, $city\_ids, true ) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> $city\_ids,  
            \];  
        }  
    }

    if ( \! empty($conflicts) ) {  
        $city\_term \= get\_term( $city\_id, DC\_TAX );  
        $city\_name \= ($city\_term && \! is\_wp\_error($city\_term)) ? $city\_term-\>name : \_\_('la ciudad seleccionada', 'dc');

        $lines \= \[\];  
        foreach ( $conflicts as $c ) {  
            $available \= dc\_city\_names\_from\_ids( $c\['cities'\] );  
            $avail\_txt \= empty($available) ? \_\_('(sin ciudades asignadas)', 'dc') : implode(', ', $available);  
            $lines\[\] \= sprintf(  
                '%s \&rarr; %s',  
                esc\_html($c\['name'\]),  
                sprintf(\_\_('disponible en: %s', 'dc'), esc\_html($avail\_txt))  
            );  
        }

        $msg  \= '\<strong\>' . \_\_('Productos no disponibles para la ciudad seleccionada', 'dc') . "\</strong\>\<br\>";  
        $msg .= '\<ul style="margin-left:1em;list-style:disc;"\>';  
        foreach ($lines as $li) {  
            $msg .= '\<li\>' . $li . '\</li\>';  
        }  
        $msg .= '\</ul\>';  
        $msg .= '\<em\>' . sprintf(\_\_('Selecciona %s en la entrega o elimina estos productos.', 'dc'), esc\_html($city\_name)) . '\</em\>';

        wc\_add\_notice( wp\_kses\_post($msg), 'error' );  
    }  
}  
add\_action('woocommerce\_check\_cart\_items', 'dc\_validate\_cart\_city\_compatibility');  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
    dc\_validate\_cart\_city\_compatibility();  
}, 10, 2);

/\* \================== Forzar que la orden guarde NOMBRE de la ciudad \================== \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // Billing city  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name ); // \<- Guarda el NOMBRE  
        }  
    }

    // Shipping city (si usas envío a otra dirección)  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name ); // \<- Guarda el NOMBRE  
        }  
    }  
}, 20, 2);

/\* \============ Opcional: también guardar NOMBRE en el perfil del cliente \============ \*/  
add\_action('woocommerce\_checkout\_update\_customer', function( $customer, $data ){  
    // Billing city  
    if ( isset($data\['billing\_city'\]) && is\_numeric($data\['billing\_city'\]) ) {  
        $term \= get\_term( (int) $data\['billing\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    // Shipping city  
    if ( isset($data\['shipping\_city'\]) && is\_numeric($data\['shipping\_city'\]) ) {  
        $term \= get\_term( (int) $data\['shipping\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\*\*  
 \* \================== Envío por ciudad (usa meta 'precio\_de\_envio') \==================  
 \*  
 \* Lógica:  
 \*  \- Detecta la ciudad seleccionada (preferencia: shipping\_city \> billing\_city \> cookie).  
 \*  \- Lee el meta 'precio\_de\_envio' del término (ciudad).  
 \*  \- Si es numérico, sobreescribe el costo de los métodos de envío 'flat\_rate'.  
 \*  \- Recalcula impuestos de envío para mantener coherencia con ajustes de WooCommerce.  
 \*/

/\*\*  
 \* Devuelve el term\_id de la ciudad elegida para ENVÍO.  
 \* Prioridad: shipping\_city (POST) \> billing\_city (POST/WC checkout value) \> cookie.  
 \*/  
function dc\_get\_selected\_city\_for\_shipping(): ?int {  
    // Si el usuario envía a otra dirección, respeta shipping\_city como prioridad.  
    $ship\_diff \= isset($\_POST\['ship\_to\_different\_address'\]) ? (int) $\_POST\['ship\_to\_different\_address'\] : 0;

    if ( $ship\_diff ) {  
        if ( isset($\_POST\['shipping\_city'\]) && is\_numeric($\_POST\['shipping\_city'\]) ) {  
            return (int) $\_POST\['shipping\_city'\];  
        }  
    }

    // Si no hay shipping\_city, usa la que ya detectas para billing.  
    if ( function\_exists('dc\_get\_checkout\_selected\_city\_from\_request') ) {  
        $billing\_city\_id \= dc\_get\_checkout\_selected\_city\_from\_request();  
        if ( $billing\_city\_id ) return (int) $billing\_city\_id;  
    }

    // Último recurso: cookie directa  
    $cookie\_city \= dc\_get\_selected\_city\_id();  
    return $cookie\_city ?: null;  
}

/\*\*  
 \* Lee y normaliza el meta 'precio\_de\_envio' del término de ciudad.  
 \* Acepta formatos con coma o punto. Devuelve float o null si no aplica.  
 \*/  
function dc\_get\_city\_shipping\_price( int $city\_term\_id ): ?float {  
    if ( $city\_term\_id \<= 0 ) return null;

    // Intento con meta principal; agrega alias si usas otro nombre por error tipográfico.  
    $raw \= get\_term\_meta( $city\_term\_id, 'precio\_de\_envio', true );  
    if ( $raw \=== '' || $raw \=== null ) {  
        // Fallbacks opcionales:  
        $raw \= get\_term\_meta( $city\_term\_id, 'precio\_envio', true );  
        if ( $raw \=== '' || $raw \=== null ) return null;  
    }

    // Normaliza "12.345,67" \-\> "12345.67"  
    $raw \= is\_string($raw) ? $raw : (string) $raw;  
    $raw \= str\_replace(\[' ', ' '\], '', $raw); // quita espacios o nbsp  
    // Si tiene coma y punto, asume coma como decimal y elimina puntos de miles  
    if ( strpos($raw, ',') \!== false && strpos($raw, '.') \!== false ) {  
        $raw \= str\_replace('.', '', $raw);  
        $raw \= str\_replace(',', '.', $raw);  
    } elseif ( strpos($raw, ',') \!== false ) {  
        // Solo coma \-\> cámbiala por punto  
        $raw \= str\_replace(',', '.', $raw);  
    }

    // Deja solo dígitos y punto  
    $raw \= preg\_replace('/\[^0-9.\]/', '', $raw);  
    if ($raw \=== '' ) return null;

    $val \= (float) $raw;  
    if ( $val \< 0 ) $val \= 0.0;  
    return is\_finite($val) ? $val : null;  
}

/\*\*  
 \* Filtro central: sobreescribe el costo de 'flat\_rate' con el precio de la ciudad.  
 \* Se aplica a todos los paquetes del carrito.  
 \*/  
add\_filter('woocommerce\_package\_rates', function( $rates, $package ){  
    // 1\) Detecta ciudad  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return $rates;

    // 2\) Lee precio desde el meta del término  
    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) return $rates; // no hay precio configurado \-\> no tocar

    // 3\) (Opcional) Para etiqueta bonita en el método  
    $city\_term \= get\_term( (int) $city\_id, DC\_TAX );  
    $city\_name \= ( $city\_term && \! is\_wp\_error($city\_term) ) ? $city\_term-\>name : '';

    // 4\) Recalcular impuestos de envío según la configuración de WooCommerce  
    $taxes \= \[\];  
    if ( wc\_tax\_enabled() ) {  
        // Obtiene las tasas correctas para shipping (respeta "Impuesto de envío" en ajustes).  
        $tax\_rates \= WC\_Tax::get\_shipping\_tax\_rates();  
        $taxes     \= WC\_Tax::calc\_shipping\_tax( $price, $tax\_rates );  
    }

    // 5\) Recorre métodos y actualiza sólo flat\_rate  
    foreach ( $rates as $rate\_id \=\> $rate ) {  
        if ( \! $rate instanceof WC\_Shipping\_Rate ) continue;

        // Aplica únicamente a Flat Rate (evita tocar free\_shipping/local\_pickup)  
        if ( $rate-\>get\_method\_id() \!== 'flat\_rate' ) continue;

        // Sobrescribe costo e impuestos  
        if ( method\_exists($rate, 'set\_cost') ) {  
            $rate-\>set\_cost( $price );  
        } else {  
            // Compatibilidad vieja (normalmente no necesario)  
            $rate-\>cost \= $price;  
        }

        if ( method\_exists($rate, 'set\_taxes') ) {  
            $rate-\>set\_taxes( $taxes );  
        } else {  
            $rate-\>taxes \= $taxes;  
        }

        // (Opcional) Ajusta texto para que el cliente vea la ciudad aplicada  
        if ( $city\_name && method\_exists($rate, 'set\_label') ) {  
            $label \= $rate-\>get\_label();  
            // Evita duplicar  
            if ( stripos($label, $city\_name) \=== false ) {  
                $rate-\>set\_label( sprintf('%s (%s)', $label, $city\_name) );  
            }  
        }  
    }

    return $rates;  
}, 30, 2);

/\*\*  
 \* (Opcional) Validación: si no hay precio configurado para la ciudad elegida, muestra aviso.  
 \* Coméntalo si no quieres bloquear nada.  
 \*/  
add\_action('woocommerce\_check\_cart\_items', function(){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) {  
        $term \= get\_term( (int) $city\_id, DC\_TAX );  
        $name \= ($term && \! is\_wp\_error($term)) ? $term-\>name : \_\_('ciudad seleccionada', 'dc');  
        wc\_add\_notice(  
            sprintf(  
                /\* translators: %s \= city name \*/  
                \_\_('No hay tarifa de envío configurada para %s. Por favor, selecciona otra ciudad o contacta soporte.', 'dc'),  
                esc\_html($name)  
            ),  
            'notice'  
        );  
    }  
});

# 31 \- Departamentos/Ciudades V7 With Checkout

**31 \- Departamentos/Ciudades V7 With Checkout**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) y precarga desde el popup. Compatible con invitados (no logueados), anti-loop en checkout y resistente a caché.  
 \* Version:     1.4.3  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\*\* \================== PREDETERMINADO (por slug) \==================  
 \* Ajusta estos slugs para que, si el usuario no ha elegido nada,  
 \* se apliquen por defecto (solo se usan si NO hay POST/GET/COOKIES).  
 \* \- Si indicas solo la ciudad, el departamento se infiere del padre.  
 \* \- Si indicas ambos, se respeta la relación depto→ciudad si existe.  
 \*/  
define('DC\_DEFAULT\_DEPT\_SLUG', '25');     // \<-- ajusta o deja '' para omitir  
define('DC\_DEFAULT\_CITY\_SLUG', '11001');  // \<-- ajusta o deja '' para omitir

/\*\*  
 \* Busca un término por slug en la taxonomía DC\_TAX.  
 \* Si $parent es null no filtra por padre; si es 0 fuerza raíz; si \>0 limita al padre dado.  
 \*/  
function dc\_find\_term\_id\_by\_slug( string $slug, ?int $parent \= null ): ?int {  
    if ($slug \=== '') return null;  
    $args \= \[  
        'taxonomy'   \=\> DC\_TAX,  
        'slug'       \=\> $slug,  
        'hide\_empty' \=\> false,  
    \];  
    if ($parent \!== null) {  
        $args\['parent'\] \= (int) $parent;  
    }  
    $terms \= get\_terms($args);  
    if (is\_wp\_error($terms) || empty($terms)) return null;  
    return (int) $terms\[0\]-\>term\_id;  
}

/\*\*  
 \* En init tempranísimo: si no hay selección previa (POST/GET/COOKIES),  
 \* fija cookies con los IDs de depto/ciudad por defecto a partir de los slugs.  
 \* No redirige ni rompe PRG; solo define cookies para que el resto del plugin las tome.  
 \*/  
add\_action('init', function () {  
    // No aplicar en admin, AJAX o cron  
    if (is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron())) {  
        return;  
    }

    // Si ya viene algo por POST/GET o ya hay cookies, respetar y NO imponer default  
    $has\_post \= isset($\_POST\['dc\_ciudad'\], $\_POST\['dc\_depto'\], $\_POST\['billing\_city'\], $\_POST\['billing\_state'\], $\_POST\['shipping\_city'\], $\_POST\['shipping\_state'\])  
                && ( \!empty($\_POST\['dc\_ciudad'\]) || \!empty($\_POST\['dc\_depto'\]) || \!empty($\_POST\['billing\_city'\]) || \!empty($\_POST\['billing\_state'\]) || \!empty($\_POST\['shipping\_city'\]) || \!empty($\_POST\['shipping\_state'\]) );  
    $has\_get  \= isset($\_GET\['dc\_ciudad'\]) || isset($\_GET\['dc\_depto'\]);  
    $has\_cookie \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);  
    if ($has\_post || $has\_get || $has\_cookie) return;

    $dept\_id \= null;  
    $city\_id \= null;

    // 1\) Si viene departamento por slug, resolver su term\_id (raíz)  
    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $dept\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
    }

    // 2\) Resolver ciudad por slug (si hay), idealmente bajo el depto encontrado  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $city\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, ($dept\_id \!== null ? $dept\_id : null));

        // Si encontramos ciudad pero no depto, inferir padre del término ciudad  
        if ($city\_id && $dept\_id \=== null) {  
            $term \= get\_term($city\_id, DC\_TAX);  
            if ($term && \!is\_wp\_error($term)) {  
                $dept\_id \= (int) $term-\>parent;  
            }  
        }  
    }

    // 3\) Si tenemos algo válido, fijar cookies (no redirige)  
    if ($dept\_id) {  
        dc\_set\_cookie(DC\_COOKIE\_DEPT, (string) $dept\_id);  
    }  
    if ($city\_id) {  
        dc\_set\_cookie(DC\_COOKIE\_CITY, (string) $city\_id);  
    }  
}, 1); // prioridad muy temprana para que el resto del plugin ya vea las cookies

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                // Fallback sin nonce (para invitados / caché)  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    // Guarda cookies al cambiar (invitados incluidos)  
    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }  
    $dept.on('change', function(){ setClientCookie('dc\_dept', $(this).val()); cargarCiudades($(this).val(), null); });  
    $city.on('change', function(){ setClientCookie('dc\_city', $(this).val()); });

    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_dept\_id() : ?int {  
    // 1\) Cookies  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    }  
    // 2\) GET  
    if (isset($\_GET\['dc\_depto'\]) && is\_numeric($\_GET\['dc\_depto'\])) {  
        return (int) $\_GET\['dc\_depto'\];  
    }  
    // 3\) Fallback por slug de DEPARTAMENTO  
    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0); // raíz  
        if ($id) return $id;  
    }  
    // 4\) Inferir depto a partir del slug de CIUDAD (si existe)  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $cid \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, null);  
        if ($cid) {  
            $term \= get\_term($cid, DC\_TAX);  
            if ($term && \!is\_wp\_error($term) && $term-\>parent) {  
                return (int) $term-\>parent;  
            }  
        }  
    }  
    return null;  
}

function dc\_get\_selected\_city\_id() : ?int {  
    // 1\) Cookies  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    }  
    // 2\) GET  
    if (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) {  
        return (int) $\_GET\['dc\_ciudad'\];  
    }  
    // 3\) Fallback por slug de CIUDAD (ligado al depto si ya está resuelto)  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $dept \= dc\_get\_selected\_dept\_id(); // puede venir del fallback anterior  
        $id   \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, $dept ?: null);  
        if ($id) return $id;  
    }  
    return null;  
}

/\* \============== Cookies seguras (path '/', SameSite=Lax, dominio opcional) \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    // Limpiar  
    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Aplicar (POST)  
    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    // Compat GET  
    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché cuando hay filtro o en tienda/shortcodes \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $p \= get\_post();  
        $content \= $p && isset($p-\>post\_content) ? $p-\>post\_content : '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        // Evitar caché en LS/CF y similares  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    // Registrar handle seguro  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup) — intento con nonce \+ fallback, cookies al cambiar \===  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    // Delegación (sirve para popups que se inyectan luego)  
    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);  
    });

    // Inicial  
    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    // Elementor Popup: al abrir  
    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    // Guardado extra al ENVIAR  
    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept\!==undefined && dept\!==null) setClientCookie('dc\_dept', dept);  
        if (city\!==undefined && city\!==null) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.4.2-g');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades (tolerante a nonce cacheado) \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    // Rechaza sólo a logueados si el nonce falló; invitados siempre pueden leer (caché friendly)  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global: aplica también a REST/Elementor/JetEngine \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    // Departamento  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    // Ciudad  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    // Dirección 1  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    // Dirección 2  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85;  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO'; // ajusta si aplica a otro país  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    // Departamento (billing\_state)  
    $deps\_all \= dc\_get\_departamentos\_options();  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
    \]);

    // Ciudad dependiente (billing\_city) – opciones se cargan por AJAX  
    $city\_opts \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
    \]);

    return $fields;  
});

/\* \================== Checkout: JS dependencias \+ ANTI-LOOP \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= (string) (dc\_get\_selected\_dept\_id() ?: '');  
        $sel\_city \= (string) (dc\_get\_selected\_city\_id() ?: '');

        $js\_checkout \= \<\<\<JS  
(function($){  
    // Flags y helpers anti-loop  
    var dcLoadingCities \= false;

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function needsLoadForDept(\\$city, deptId){  
        if(\!deptId){ return true; }  
        var boundDept \= \\$city.data('dcDept');  
        var hasOptions \= \\$city.find('option').length \> 1; // más que "— Selecciona —"  
        // Cargar solo si el select aún no está ligado a este dept o si no tiene opciones reales  
        return (String(boundDept||'') \!== String(deptId)) || \!hasOptions;  
    }

    function dcLoadCiudadesCheckout(deptId, preselect){  
        var \\$city \= $('\#billing\_city');

        if (\!deptId) {  
            // Sin departamento: limpiar y desligar  
            \\$city.removeData('dcDept')  
                 .prop('disabled', true)  
                 .html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }

        // Si ya está cargado para este dept y tiene opciones, no recargar (anti-loop)  
        if (\!needsLoadForDept(\\$city, deptId)) {  
            // Asegura selección si existe (sin disparar change)  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            return;  
        }

        if (dcLoadingCities) return; // evita carreras  
        dcLoadingCities \= true;

        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        \\$city.prop('disabled', true);

        function finish(html, enable){  
            // No dispares eventos aquí (anti-loop): NO trigger('change')  
            \\$city.html(html);  
            if (enable) \\$city.prop('disabled', false);  
            // Marca el dept para el que quedaron estas opciones  
            \\$city.data('dcDept', String(deptId));  
            // Aplica preselect si existe y es válido (sin change)  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            dcLoadingCities \= false;  
        }

        // Intento con nonce  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                // Fallback sin nonce  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            // Fallback directo  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Eventos de usuario (set cookies al cambiar; no triggers extra para evitar loop)  
    $(document).on('change', '\#billing\_state', function(){  
        var deptId \= $(this).val() || '';  
        setClientCookie('dc\_dept', deptId);  
        dcLoadCiudadesCheckout(deptId, null); // sin trigger de change al terminar  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var cityId \= $(this).val() || '';  
        setClientCookie('dc\_city', cityId);  
        // No hacemos nada más aquí para no entrar en loop  
    });

    // Inicial (primera carga)  
    $(function(){  
        var preDept \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCity \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (preDept){  
            dcLoadCiudadesCheckout(preDept, preCity || null);  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }  
    });

    // Re-render de WC (updated\_checkout): sólo recargar si hace falta (anti-loop)  
    $(document.body).on('updated\_checkout', function(){  
        var deptId \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var curCity \= $('\#billing\_city').val() || '{$sel\_city}';  
        if (deptId){  
            if (needsLoadForDept($('\#billing\_city'), deptId)) {  
                dcLoadCiudadesCheckout(deptId, curCity || null);  
            }  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

/\* \================== VALIDACIÓN DE COMPATIBILIDAD (CIUDAD) \================== \*/

/\*\*  
 \* Helper: obtiene IDs de términos de ciudad (hijos) asignados a un producto/variación.  
 \*/  
function dc\_get\_product\_city\_term\_ids( int $product\_id ): array {  
    $terms \= wp\_get\_post\_terms( $product\_id, DC\_TAX, \['fields' \=\> 'all'\] );  
    if ( is\_wp\_error($terms) || empty($terms) ) return \[\];  
    $ids \= \[\];  
    foreach ($terms as $t) {  
        if ( \! empty($t-\>parent) ) { // sólo hijos (ciudades)  
            $ids\[\] \= (int) $t-\>term\_id;  
        }  
    }  
    return array\_values(array\_unique($ids));  
}

/\*\*  
 \* Helper: obtiene nombres legibles de los IDs de ciudad.  
 \*/  
function dc\_city\_names\_from\_ids( array $ids ): array {  
    $out \= \[\];  
    foreach ($ids as $id) {  
        $term \= get\_term( (int) $id, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $out\[\] \= $term-\>name;  
        }  
    }  
    sort($out, SORT\_NATURAL | SORT\_FLAG\_CASE);  
    return $out;  
}

/\*\*  
 \* Obtiene la ciudad elegida en checkout (term\_id en billing\_city).  
 \* Prioridad: POST (checkout) \> WC()-\>checkout-\>get\_value() \> cookie \> null  
 \*/  
function dc\_get\_checkout\_selected\_city\_from\_request(): ?int {  
    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($val) ) return (int) $val;  
    }  
    $cookie \= dc\_get\_selected\_city\_id();  
    return $cookie ?: null;  
}

/\*\*  
 \* Valida compatibilidad en el carrito con la ciudad seleccionada.  
 \*/  
function dc\_validate\_cart\_city\_compatibility() {  
    if ( \! function\_exists('WC') ) return;  
    $city\_id \= dc\_get\_checkout\_selected\_city\_from\_request();  
    if ( \! $city\_id ) return; // sin ciudad aún: no bloquear

    $conflicts \= \[\];

    foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
        $product\_id   \= isset($cart\_item\['variation\_id'\]) && $cart\_item\['variation\_id'\] ? (int) $cart\_item\['variation\_id'\] : (int) $cart\_item\['product\_id'\];  
        $product\_obj  \= wc\_get\_product( $product\_id );  
        if ( \! $product\_obj ) continue;

        // Variación \-\> si no tiene ciudades, hereda del padre  
        $city\_ids \= dc\_get\_product\_city\_term\_ids( $product\_id );  
        if ( empty($city\_ids) && $product\_obj-\>is\_type('variation') ) {  
            $parent\_id \= $product\_obj-\>get\_parent\_id();  
            if ( $parent\_id ) {  
                $city\_ids \= dc\_get\_product\_city\_term\_ids( (int) $parent\_id );  
            }  
        }

        // Sin ciudades asignadas \-\> incompatible (ajustable según negocio)  
        if ( empty($city\_ids) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> \[\],  
            \];  
            continue;  
        }

        if ( \! in\_array( (int) $city\_id, $city\_ids, true ) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> $city\_ids,  
            \];  
        }  
    }

    if ( \! empty($conflicts) ) {  
        $city\_term \= get\_term( $city\_id, DC\_TAX );  
        $city\_name \= ($city\_term && \! is\_wp\_error($city\_term)) ? $city\_term-\>name : \_\_('la ciudad seleccionada', 'dc');

        $lines \= \[\];  
        foreach ( $conflicts as $c ) {  
            $available \= dc\_city\_names\_from\_ids( $c\['cities'\] );  
            $avail\_txt \= empty($available) ? \_\_('(sin ciudades asignadas)', 'dc') : implode(', ', $available);  
            $lines\[\] \= sprintf(  
                '%s \&rarr; %s',  
                esc\_html($c\['name'\]),  
                sprintf(\_\_('disponible en: %s', 'dc'), esc\_html($avail\_txt))  
            );  
        }

        $msg  \= '\<strong\>' . \_\_('Productos no disponibles para la ciudad seleccionada', 'dc') . "\</strong\>\<br\>";  
        $msg .= '\<ul style="margin-left:1em;list-style:disc;"\>';  
        foreach ($lines as $li) {  
            $msg .= '\<li\>' . $li . '\</li\>';  
        }  
        $msg .= '\</ul\>';  
        $msg .= '\<em\>' . sprintf(\_\_('Selecciona %s en la entrega o elimina estos productos.', 'dc'), esc\_html($city\_name)) . '\</em\>';

        wc\_add\_notice( wp\_kses\_post($msg), 'error' );  
    }  
}  
add\_action('woocommerce\_check\_cart\_items', 'dc\_validate\_cart\_city\_compatibility');  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
    dc\_validate\_cart\_city\_compatibility();  
}, 10, 2);

/\* \================== Forzar que la orden guarde NOMBRE de la ciudad \================== \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // Billing city  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name ); // \<- Guarda el NOMBRE  
        }  
    }

    // Shipping city (si usas envío a otra dirección)  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name ); // \<- Guarda el NOMBRE  
        }  
    }  
}, 20, 2);

/\* \============ Opcional: también guardar NOMBRE en el perfil del cliente \============ \*/  
add\_action('woocommerce\_checkout\_update\_customer', function( $customer, $data ){  
    // Billing city  
    if ( isset($data\['billing\_city'\]) && is\_numeric($data\['billing\_city'\]) ) {  
        $term \= get\_term( (int) $data\['billing\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    // Shipping city  
    if ( isset($data\['shipping\_city'\]) && is\_numeric($data\['shipping\_city'\]) ) {  
        $term \= get\_term( (int) $data\['shipping\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\*\*  
 \* \================== Envío por ciudad (usa meta 'precio\_de\_envio') \==================  
 \*  
 \* Lógica:  
 \*  \- Detecta la ciudad seleccionada (preferencia: shipping\_city \> billing\_city \> cookie).  
 \*  \- Lee el meta 'precio\_de\_envio' del término (ciudad).  
 \*  \- Si es numérico, sobreescribe el costo de los métodos de envío 'flat\_rate'.  
 \*  \- Recalcula impuestos de envío para mantener coherencia con ajustes de WooCommerce.  
 \*/

/\*\*  
 \* Devuelve el term\_id de la ciudad elegida para ENVÍO.  
 \* Prioridad: shipping\_city (POST) \> billing\_city (POST/WC checkout value) \> cookie.  
 \*/  
function dc\_get\_selected\_city\_for\_shipping(): ?int {  
    // Si el usuario envía a otra dirección, respeta shipping\_city como prioridad.  
    $ship\_diff \= isset($\_POST\['ship\_to\_different\_address'\]) ? (int) $\_POST\['ship\_to\_different\_address'\] : 0;

    if ( $ship\_diff ) {  
        if ( isset($\_POST\['shipping\_city'\]) && is\_numeric($\_POST\['shipping\_city'\]) ) {  
            return (int) $\_POST\['shipping\_city'\];  
        }  
    }

    // Si no hay shipping\_city, usa la que ya detectas para billing.  
    if ( function\_exists('dc\_get\_checkout\_selected\_city\_from\_request') ) {  
        $billing\_city\_id \= dc\_get\_checkout\_selected\_city\_from\_request();  
        if ( $billing\_city\_id ) return (int) $billing\_city\_id;  
    }

    // Último recurso: cookie directa  
    $cookie\_city \= dc\_get\_selected\_city\_id();  
    return $cookie\_city ?: null;  
}

/\*\*  
 \* Lee y normaliza el meta 'precio\_de\_envio' del término de ciudad.  
 \* Acepta formatos con coma o punto. Devuelve float o null si no aplica.  
 \*/  
function dc\_get\_city\_shipping\_price( int $city\_term\_id ): ?float {  
    if ( $city\_term\_id \<= 0 ) return null;

    // Intento con meta principal; agrega alias si usas otro nombre por error tipográfico.  
    $raw \= get\_term\_meta( $city\_term\_id, 'precio\_de\_envio', true );  
    if ( $raw \=== '' || $raw \=== null ) {  
        // Fallbacks opcionales:  
        $raw \= get\_term\_meta( $city\_term\_id, 'precio\_envio', true );  
        if ( $raw \=== '' || $raw \=== null ) return null;  
    }

    // Normaliza "12.345,67" \-\> "12345.67"  
    $raw \= is\_string($raw) ? $raw : (string) $raw;  
    $raw \= str\_replace(\[' ', ' '\], '', $raw); // quita espacios o nbsp  
    // Si tiene coma y punto, asume coma como decimal y elimina puntos de miles  
    if ( strpos($raw, ',') \!== false && strpos($raw, '.') \!== false ) {  
        $raw \= str\_replace('.', '', $raw);  
        $raw \= str\_replace(',', '.', $raw);  
    } elseif ( strpos($raw, ',') \!== false ) {  
        // Solo coma \-\> cámbiala por punto  
        $raw \= str\_replace(',', '.', $raw);  
    }

    // Deja solo dígitos y punto  
    $raw \= preg\_replace('/\[^0-9.\]/', '', $raw);  
    if ($raw \=== '' ) return null;

    $val \= (float) $raw;  
    if ( $val \< 0 ) $val \= 0.0;  
    return is\_finite($val) ? $val : null;  
}

/\*\*  
 \* Filtro central: sobreescribe el costo de 'flat\_rate' con el precio de la ciudad.  
 \* Se aplica a todos los paquetes del carrito.  
 \*/  
add\_filter('woocommerce\_package\_rates', function( $rates, $package ){  
    // 1\) Detecta ciudad  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return $rates;

    // 2\) Lee precio desde el meta del término  
    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) return $rates; // no hay precio configurado \-\> no tocar

    // 3\) (Opcional) Para etiqueta bonita en el método  
    $city\_term \= get\_term( (int) $city\_id, DC\_TAX );  
    $city\_name \= ( $city\_term && \! is\_wp\_error($city\_term) ) ? $city\_term-\>name : '';

    // 4\) Recalcular impuestos de envío según la configuración de WooCommerce  
    $taxes \= \[\];  
    if ( wc\_tax\_enabled() ) {  
        // Obtiene las tasas correctas para shipping (respeta "Impuesto de envío" en ajustes).  
        $tax\_rates \= WC\_Tax::get\_shipping\_tax\_rates();  
        $taxes     \= WC\_Tax::calc\_shipping\_tax( $price, $tax\_rates );  
    }

    // 5\) Recorre métodos y actualiza sólo flat\_rate  
    foreach ( $rates as $rate\_id \=\> $rate ) {  
        if ( \! $rate instanceof WC\_Shipping\_Rate ) continue;

        // Aplica únicamente a Flat Rate (evita tocar free\_shipping/local\_pickup)  
        if ( $rate-\>get\_method\_id() \!== 'flat\_rate' ) continue;

        // Sobrescribe costo e impuestos  
        if ( method\_exists($rate, 'set\_cost') ) {  
            $rate-\>set\_cost( $price );  
        } else {  
            // Compatibilidad vieja (normalmente no necesario)  
            $rate-\>cost \= $price;  
        }

        if ( method\_exists($rate, 'set\_taxes') ) {  
            $rate-\>set\_taxes( $taxes );  
        } else {  
            $rate-\>taxes \= $taxes;  
        }

        // (Opcional) Ajusta texto para que el cliente vea la ciudad aplicada  
        if ( $city\_name && method\_exists($rate, 'set\_label') ) {  
            $label \= $rate-\>get\_label();  
            // Evita duplicar  
            if ( stripos($label, $city\_name) \=== false ) {  
                $rate-\>set\_label( sprintf('%s (%s)', $label, $city\_name) );  
            }  
        }  
    }

    return $rates;  
}, 30, 2);

/\*\*  
 \* (Opcional) Validación: si no hay precio configurado para la ciudad elegida, muestra aviso.  
 \* Coméntalo si no quieres bloquear nada.  
 \*/  
add\_action('woocommerce\_check\_cart\_items', function(){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) {  
        $term \= get\_term( (int) $city\_id, DC\_TAX );  
        $name \= ($term && \! is\_wp\_error($term)) ? $term-\>name : \_\_('ciudad seleccionada', 'dc');  
        wc\_add\_notice(  
            sprintf(  
                /\* translators: %s \= city name \*/  
                \_\_('No hay tarifa de envío configurada para %s. Por favor, selecciona otra ciudad o contacta soporte.', 'dc'),  
                esc\_html($name)  
            ),  
            'notice'  
        );  
    }  
});

# 32 \- Departamentos/Ciudades V8 With Checkout

**32 \- Departamentos/Ciudades V8 With Checkout**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) en billing y shipping, y precarga desde el popup. Compatible con invitados, anti-loop y resistente a caché. Recalcula la tarifa de envío por ciudad priorizando shipping cuando se activa "Enviar a otra dirección".  
 \* Version:     1.4.6  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\*\* \================== PREDETERMINADO (por slug) \================== \*/  
define('DC\_DEFAULT\_DEPT\_SLUG', '25');     // \<-- ajusta o deja '' para omitir  
define('DC\_DEFAULT\_CITY\_SLUG', '11001');  // \<-- ajusta o deja '' para omitir

/\*\*  
 \* Busca un término por slug en la taxonomía DC\_TAX.  
 \* Si $parent es null no filtra por padre; si es 0 fuerza raíz; si \>0 limita al padre dado.  
 \*/  
function dc\_find\_term\_id\_by\_slug( string $slug, ?int $parent \= null ): ?int {  
    if ($slug \=== '') return null;  
    $args \= \[  
        'taxonomy'   \=\> DC\_TAX,  
        'slug'       \=\> $slug,  
        'hide\_empty' \=\> false,  
    \];  
    if ($parent \!== null) {  
        $args\['parent'\] \= (int) $parent;  
    }  
    $terms \= get\_terms($args);  
    if (is\_wp\_error($terms) || empty($terms)) return null;  
    return (int) $terms\[0\]-\>term\_id;  
}

/\*\*  
 \* En init tempranísimo: si no hay selección previa (POST/GET/COOKIES),  
 \* fija cookies con los IDs de depto/ciudad por defecto a partir de los slugs.  
 \*/  
add\_action('init', function () {  
    if (is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron())) {  
        return;  
    }

    $has\_post \= isset($\_POST\['dc\_ciudad'\], $\_POST\['dc\_depto'\], $\_POST\['billing\_city'\], $\_POST\['billing\_state'\], $\_POST\['shipping\_city'\], $\_POST\['shipping\_state'\])  
                && ( \!empty($\_POST\['dc\_ciudad'\]) || \!empty($\_POST\['dc\_depto'\]) || \!empty($\_POST\['billing\_city'\]) || \!empty($\_POST\['billing\_state'\]) || \!empty($\_POST\['shipping\_city'\]) || \!empty($\_POST\['shipping\_state'\]) );  
    $has\_get  \= isset($\_GET\['dc\_ciudad'\]) || isset($\_GET\['dc\_depto'\]);  
    $has\_cookie \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);  
    if ($has\_post || $has\_get || $has\_cookie) return;

    $dept\_id \= null;  
    $city\_id \= null;

    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $dept\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
    }

    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $city\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, ($dept\_id \!== null ? $dept\_id : null));  
        if ($city\_id && $dept\_id \=== null) {  
            $term \= get\_term($city\_id, DC\_TAX);  
            if ($term && \!is\_wp\_error($term)) {  
                $dept\_id \= (int) $term-\>parent;  
            }  
        }  
    }

    if ($dept\_id) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string) $dept\_id);  
    if ($city\_id) dc\_set\_cookie(DC\_COOKIE\_CITY, (string) $city\_id);  
}, 1);

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }  
    $dept.on('change', function(){ setClientCookie('dc\_dept', $(this).val()); cargarCiudades($(this).val(), null); });  
    $city.on('change', function(){ setClientCookie('dc\_city', $(this).val()); });

    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_dept\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    }  
    if (isset($\_GET\['dc\_depto'\]) && is\_numeric($\_GET\['dc\_depto'\])) {  
        return (int) $\_GET\['dc\_depto'\];  
    }  
    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
        if ($id) return $id;  
    }  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $cid \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, null);  
        if ($cid) {  
            $term \= get\_term($cid, DC\_TAX);  
            if ($term && \!is\_wp\_error($term) && $term-\>parent) {  
                return (int) $term-\>parent;  
            }  
        }  
    }  
    return null;  
}  
function dc\_get\_selected\_city\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    }  
    if (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) {  
        return (int) $\_GET\['dc\_ciudad'\];  
    }  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $dept \= dc\_get\_selected\_dept\_id();  
        $id   \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, $dept ?: null);  
        if ($id) return $id;  
    }  
    return null;  
}

/\* \============== Cookies seguras \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $p \= get\_post();  
        $content \= $p && isset($p-\>post\_content) ? $p-\>post\_content : '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup) \===  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);  
    });

    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept\!==undefined && dept\!==null) setClientCookie('dc\_dept', dept);  
        if (city\!==undefined && city\!==null) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.4.6');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global productos por ciudad \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85;  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO';  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects (billing \+ shipping) \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $deps\_all \= dc\_get\_departamentos\_options();

    // \---------- Billing \----------  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
        'class'        \=\> array\_merge($fields\['billing'\]\['billing\_state'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    $city\_opts\_bill \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts\_bill \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts\_bill,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
        'class'        \=\> array\_merge($fields\['billing'\]\['billing\_city'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    // \---------- Shipping \----------  
    $fields\['shipping'\]\['shipping\_state'\] \= array\_merge($fields\['shipping'\]\['shipping\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> false, // Woo valida si es necesario al marcar "otra dirección"  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
        'class'        \=\> array\_merge($fields\['shipping'\]\['shipping\_state'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    $city\_opts\_ship \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts\_ship \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['shipping'\]\['shipping\_city'\] \= array\_merge($fields\['shipping'\]\['shipping\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts\_ship,  
        'required'     \=\> false,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
        'class'        \=\> array\_merge($fields\['shipping'\]\['shipping\_city'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    return $fields;  
});

/\* \================== Checkout: JS dependencias (billing \+ shipping) \+ ANTI-LOOP \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= (string) (dc\_get\_selected\_dept\_id() ?: '');  
        $sel\_city \= (string) (dc\_get\_selected\_city\_id() ?: '');

        $js\_checkout \= \<\<\<JS  
(function($){  
    var dcLoadingCities \= { billing:false, shipping:false };

    // Debounce para forzar update\_checkout sin spamear  
    var dcUpdateCheckoutTimer \= null;  
    function dcForceUpdateCheckout(){  
        if (dcUpdateCheckoutTimer) clearTimeout(dcUpdateCheckoutTimer);  
        dcUpdateCheckoutTimer \= setTimeout(function(){  
            $(document.body).trigger('update\_checkout');  
        }, 80);  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function needsLoadForDept(\\$city, deptId){  
        if(\!deptId){ return true; }  
        var boundDept \= \\$city.data('dcDept');  
        var hasOptions \= \\$city.find('option').length \> 1; // más que "— Selecciona —"  
        return (String(boundDept||'') \!== String(deptId)) || \!hasOptions;  
    }

    function dcLoadCiudades(prefix, deptId, preselect){  
        var \\$city \= $('\#' \+ prefix \+ '\_city');  
        if (\!deptId){  
            \\$city.removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        if (\!needsLoadForDept(\\$city, deptId)) {  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            return;  
        }  
        if (dcLoadingCities\[prefix\]) return;  
        dcLoadingCities\[prefix\] \= true;

        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        \\$city.prop('disabled', true);

        function finish(html, enable){  
            \\$city.html(html);  
            if (enable) \\$city.prop('disabled', false);  
            \\$city.data('dcDept', String(deptId));  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            dcLoadingCities\[prefix\] \= false;  
            // al terminar de cargar ciudades, forzamos update para que recalcule envío  
            dcForceUpdateCheckout();  
        }

        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Cambios del usuario \-\> cookies \+ cargar ciudades dependientes \+ forzar recálculo  
    $(document).on('change', '\#billing\_state', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_dept', v);  
        dcLoadCiudades('billing', v, null);  
        dcForceUpdateCheckout();  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_city', v);  
        dcForceUpdateCheckout();  
    });

    $(document).on('change', '\#shipping\_state', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_dept', v);  
        dcLoadCiudades('shipping', v, null);  
        dcForceUpdateCheckout();  
    });  
    $(document).on('change', '\#shipping\_city', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_city', v);  
        dcForceUpdateCheckout();  
    });

    // Toggle "Enviar a otra dirección" \-\> recalcular y preparar selects de shipping  
    $(document).on('change', '\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]', function(){  
        var checked \= $(this).is(':checked');  
        if (checked){  
            var dS \= $('\#shipping\_state').val() || $('\#billing\_state').val() || '{$sel\_dept}';  
            var cS \= $('\#shipping\_city').val()  || '';  
            if (dS){  
                dcLoadCiudades('shipping', dS, cS || null);  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
        dcForceUpdateCheckout();  
    });

    // Inicial  
    $(function(){  
        // Billing  
        var preDeptBill \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCityBill \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (preDeptBill){  
            dcLoadCiudades('billing', preDeptBill, preCityBill || null);  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }

        // Shipping (si está visible desde el inicio)  
        var preDeptShip \= $('\#shipping\_state').val() || preDeptBill || '{$sel\_dept}';  
        var preCityShip \= $('\#shipping\_city').val()  || '';  
        if ($('\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]').is(':checked')){  
            if (preDeptShip){  
                dcLoadCiudades('shipping', preDeptShip, preCityShip || null);  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
    });

    // Cuando Woo re-renderiza el checkout  
    $(document.body).on('updated\_checkout', function(){  
        // Billing  
        var dB \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var cB \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (dB){  
            if (needsLoadForDept($('\#billing\_city'), dB)) {  
                dcLoadCiudades('billing', dB, cB || null);  
            }  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }

        // Shipping (si está activo "Enviar a otra dirección")  
        var shipOn \= $('\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]').is(':checked');  
        var dS \= $('\#shipping\_state').val() || dB;  
        var cS \= $('\#shipping\_city').val()  || '';  
        if (shipOn){  
            if (dS){  
                if (needsLoadForDept($('\#shipping\_city'), dS)) {  
                    dcLoadCiudades('shipping', dS, cS || null);  
                }  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

/\* \================== VALIDACIÓN DE COMPATIBILIDAD (CIUDAD) \================== \*/  
function dc\_get\_product\_city\_term\_ids( int $product\_id ): array {  
    $terms \= wp\_get\_post\_terms( $product\_id, DC\_TAX, \['fields' \=\> 'all'\] );  
    if ( is\_wp\_error($terms) || empty($terms) ) return \[\];  
    $ids \= \[\];  
    foreach ($terms as $t) {  
        if ( \! empty($t-\>parent) ) {  
            $ids\[\] \= (int) $t-\>term\_id;  
        }  
    }  
    return array\_values(array\_unique($ids));  
}  
function dc\_city\_names\_from\_ids( array $ids ): array {  
    $out \= \[\];  
    foreach ($ids as $id) {  
        $term \= get\_term( (int) $id, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $out\[\] \= $term-\>name;  
        }  
    }  
    sort($out, SORT\_NATURAL | SORT\_FLAG\_CASE);  
    return $out;  
}  
function dc\_get\_checkout\_selected\_city\_from\_request(): ?int {  
    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($val) ) return (int) $val;  
    }  
    $cookie \= dc\_get\_selected\_city\_id();  
    return $cookie ?: null;  
}  
function dc\_validate\_cart\_city\_compatibility() {  
    if ( \! function\_exists('WC') ) return;  
    $city\_id \= dc\_get\_checkout\_selected\_city\_from\_request();  
    if ( \! $city\_id ) return;

    $conflicts \= \[\];

    foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
        $product\_id   \= isset($cart\_item\['variation\_id'\]) && $cart\_item\['variation\_id'\] ? (int) $cart\_item\['variation\_id'\] : (int) $cart\_item\['product\_id'\];  
        $product\_obj  \= wc\_get\_product( $product\_id );  
        if ( \! $product\_obj ) continue;

        $city\_ids \= dc\_get\_product\_city\_term\_ids( $product\_id );  
        if ( empty($city\_ids) && $product\_obj-\>is\_type('variation') ) {  
            $parent\_id \= $product\_obj-\>get\_parent\_id();  
            if ( $parent\_id ) {  
                $city\_ids \= dc\_get\_product\_city\_term\_ids( (int) $parent\_id );  
            }  
        }

        if ( empty($city\_ids) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> \[\],  
            \];  
            continue;  
        }

        if ( \! in\_array( (int) $city\_id, $city\_ids, true ) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> $city\_ids,  
            \];  
        }  
    }

    if ( \! empty($conflicts) ) {  
        $city\_term \= get\_term( $city\_id, DC\_TAX );  
        $city\_name \= ($city\_term && \! is\_wp\_error($city\_term)) ? $city\_term-\>name : \_\_('la ciudad seleccionada', 'dc');

        $lines \= \[\];  
        foreach ( $conflicts as $c ) {  
            $available \= dc\_city\_names\_from\_ids( $c\['cities'\] );  
            $avail\_txt \= empty($available) ? \_\_('(sin ciudades asignadas)', 'dc') : implode(', ', $available);  
            $lines\[\] \= sprintf(  
                '%s \&rarr; %s',  
                esc\_html($c\['name'\]),  
                sprintf(\_\_('disponible en: %s', 'dc'), esc\_html($avail\_txt))  
            );  
        }

        $msg  \= '\<strong\>' . \_\_('Productos no disponibles para la ciudad seleccionada', 'dc') . "\</strong\>\<br\>";  
        $msg .= '\<ul style="margin-left:1em;list-style:disc;"\>';  
        foreach ($lines as $li) {  
            $msg .= '\<li\>' . $li . '\</li\>';  
        }  
        $msg .= '\</ul\>';  
        $msg .= '\<em\>' . sprintf(\_\_('Selecciona %s en la entrega o elimina estos productos.', 'dc'), esc\_html($city\_name)) . '\</em\>';

        wc\_add\_notice( wp\_kses\_post($msg), 'error' );  
    }  
}  
add\_action('woocommerce\_check\_cart\_items', 'dc\_validate\_cart\_city\_compatibility');  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
    dc\_validate\_cart\_city\_compatibility();  
}, 10, 2);

/\* \================== Forzar guardar NOMBRE de la ciudad en la orden \================== \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // Billing city  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    // Shipping city  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\* \============ Opcional: también guardar NOMBRE en el perfil del cliente \============ \*/  
add\_action('woocommerce\_checkout\_update\_customer', function( $customer, $data ){  
    if ( isset($data\['billing\_city'\]) && is\_numeric($data\['billing\_city'\]) ) {  
        $term \= get\_term( (int) $data\['billing\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    if ( isset($data\['shipping\_city'\]) && is\_numeric($data\['shipping\_city'\]) ) {  
        $term \= get\_term( (int) $data\['shipping\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\*\*  
 \* \================== Envío por ciudad (usa meta 'precio\_de\_envio') \==================  
 \*/

/\*\* Helpers toggle "Enviar a otra dirección" \*/  
function dc\_is\_truthy($v): bool {  
    if ($v \=== null) return false;  
    $v \= is\_string($v) ? strtolower(trim($v)) : $v;  
    return $v \=== 1 || $v \=== true || $v \=== '1' || $v \=== 'true' || $v \=== 'yes' || $v \=== 'on' || $v \=== 'y';  
}  
function dc\_ship\_to\_different\_enabled(): bool {  
    if ( isset($\_POST\['ship\_to\_different\_address'\]) ) {  
        return dc\_is\_truthy($\_POST\['ship\_to\_different\_address'\]);  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('ship\_to\_different\_address');  
        if ($val \!== null && $val \!== '') {  
            return dc\_is\_truthy($val);  
        }  
    }  
    if ( function\_exists('WC') && WC()-\>customer ) {  
        $has\_shipping \= (bool) WC()-\>customer-\>get\_shipping\_first\_name();  
        return $has\_shipping;  
    }  
    return false;  
}

/\*\* Prioriza siempre shipping\_city si el toggle está activo; si no, usa billing; luego cookie. \*/  
function dc\_get\_selected\_city\_for\_shipping(): ?int {  
    $ship\_diff \= dc\_ship\_to\_different\_enabled();

    if ( $ship\_diff ) {  
        if ( isset($\_POST\['shipping\_city'\]) && is\_numeric($\_POST\['shipping\_city'\]) ) {  
            return (int) $\_POST\['shipping\_city'\];  
        }  
        if ( function\_exists('WC') && WC()-\>checkout ) {  
            $sc \= WC()-\>checkout-\>get\_value('shipping\_city');  
            if ( is\_numeric($sc) ) return (int) $sc;  
        }  
        if ( function\_exists('WC') && WC()-\>checkout ) {  
            $bc \= WC()-\>checkout-\>get\_value('billing\_city');  
            if ( is\_numeric($bc) ) return (int) $bc;  
        }  
        $cookie\_city \= dc\_get\_selected\_city\_id();  
        return $cookie\_city ?: null;  
    }

    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $bc \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($bc) ) return (int) $bc;  
    }  
    $cookie\_city \= dc\_get\_selected\_city\_id();  
    return $cookie\_city ?: null;  
}

/\*\* Lee y normaliza el meta 'precio\_de\_envio' del término de ciudad. \*/  
function dc\_get\_city\_shipping\_price( int $city\_term\_id ): ?float {  
    if ( $city\_term\_id \<= 0 ) return null;

    $raw \= get\_term\_meta( $city\_term\_id, 'precio\_de\_envio', true );  
    if ( $raw \=== '' || $raw \=== null ) {  
        $raw \= get\_term\_meta( $city\_term\_id, 'precio\_envio', true );  
        if ( $raw \=== '' || $raw \=== null ) return null;  
    }

    $raw \= is\_string($raw) ? $raw : (string) $raw;  
    $raw \= str\_replace(\[' ', ' '\], '', $raw); // quita espacios y nbsp

    if ( strpos($raw, ',') \!== false && strpos($raw, '.') \!== false ) {  
        $raw \= str\_replace('.', '', $raw);  
        $raw \= str\_replace(',', '.', $raw);  
    } elseif ( strpos($raw, ',') \!== false ) {  
        $raw \= str\_replace(',', '.', $raw);  
    }

    $raw \= preg\_replace('/\[^0-9.\]/', '', $raw);  
    if ($raw \=== '' ) return null;

    $val \= (float) $raw;  
    if ( $val \< 0 ) $val \= 0.0;  
    return is\_finite($val) ? $val : null;  
}

/\*\* Sobrescribe costo de 'flat\_rate' con el precio de la ciudad. \*/  
add\_filter('woocommerce\_package\_rates', function( $rates, $package ){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return $rates;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) return $rates;

    $taxes \= \[\];  
    if ( wc\_tax\_enabled() ) {  
        $tax\_rates \= WC\_Tax::get\_shipping\_tax\_rates();  
        $taxes     \= WC\_Tax::calc\_shipping\_tax( $price, $tax\_rates );  
    }

    $city\_term \= get\_term( (int) $city\_id, DC\_TAX );  
    $city\_name \= ( $city\_term && \! is\_wp\_error($city\_term) ) ? $city\_term-\>name : '';

    foreach ( $rates as $rate\_id \=\> $rate ) {  
        if ( \! $rate instanceof WC\_Shipping\_Rate ) continue;  
        if ( $rate-\>get\_method\_id() \!== 'flat\_rate' ) continue;

        if ( method\_exists($rate, 'set\_cost') ) { $rate-\>set\_cost( $price ); } else { $rate-\>cost \= $price; }  
        if ( method\_exists($rate, 'set\_taxes') ) { $rate-\>set\_taxes( $taxes ); } else { $rate-\>taxes \= $taxes; }

        if ( $city\_name && method\_exists($rate, 'set\_label') ) {  
            $label \= $rate-\>get\_label();  
            if ( stripos($label, $city\_name) \=== false ) {  
                $rate-\>set\_label( sprintf('%s (%s)', $label, $city\_name) );  
            }  
        }  
    }  
    return $rates;  
}, 30, 2);

/\*\* Aviso si no hay tarifa configurada para la ciudad elegida. \*/  
add\_action('woocommerce\_check\_cart\_items', function(){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) {  
        $term \= get\_term( (int) $city\_id, DC\_TAX );  
        $name \= ($term && \! is\_wp\_error($term)) ? $term-\>name : \_\_('ciudad seleccionada', 'dc');  
        wc\_add\_notice(  
            sprintf(\_\_('No hay tarifa de envío configurada para %s. Por favor, selecciona otra ciudad o contacta soporte.', 'dc'), esc\_html($name)),  
            'notice'  
        );  
    }  
});

# 33 \- Departamentos/Ciudades V8.1 With Checkout

**33 \- Departamentos/Ciudades V8.1 With Checkout**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) en billing y shipping, y precarga desde el popup. Compatible con invitados, anti-loop y resistente a caché. Recalcula la tarifa de envío por ciudad priorizando shipping cuando se activa "Enviar a otra dirección".  
 \* Version:     1.4.7  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\*\* \================== PREDETERMINADO (por slug) \================== \*/  
define('DC\_DEFAULT\_DEPT\_SLUG', '25');     // \<-- ajusta o deja '' para omitir  
define('DC\_DEFAULT\_CITY\_SLUG', '11001');  // \<-- ajusta o deja '' para omitir

/\*\*  
 \* Busca un término por slug en la taxonomía DC\_TAX.  
 \* Si $parent es null no filtra por padre; si es 0 fuerza raíz; si \>0 limita al padre dado.  
 \*/  
function dc\_find\_term\_id\_by\_slug( string $slug, ?int $parent \= null ): ?int {  
    if ($slug \=== '') return null;  
    $args \= \[  
        'taxonomy'   \=\> DC\_TAX,  
        'slug'       \=\> $slug,  
        'hide\_empty' \=\> false,  
    \];  
    if ($parent \!== null) {  
        $args\['parent'\] \= (int) $parent;  
    }  
    $terms \= get\_terms($args);  
    if (is\_wp\_error($terms) || empty($terms)) return null;  
    return (int) $terms\[0\]-\>term\_id;  
}

/\*\*  
 \* En init tempranísimo: si no hay selección previa (POST/GET/COOKIES),  
 \* fija cookies con los IDs de depto/ciudad por defecto a partir de los slugs.  
 \*/  
add\_action('init', function () {  
    if (is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron())) {  
        return;  
    }

    $has\_post \= isset($\_POST\['dc\_ciudad'\], $\_POST\['dc\_depto'\], $\_POST\['billing\_city'\], $\_POST\['billing\_state'\], $\_POST\['shipping\_city'\], $\_POST\['shipping\_state'\])  
                && ( \!empty($\_POST\['dc\_ciudad'\]) || \!empty($\_POST\['dc\_depto'\]) || \!empty($\_POST\['billing\_city'\]) || \!empty($\_POST\['billing\_state'\]) || \!empty($\_POST\['shipping\_city'\]) || \!empty($\_POST\['shipping\_state'\]) );  
    $has\_get  \= isset($\_GET\['dc\_ciudad'\]) || isset($\_GET\['dc\_depto'\]);  
    $has\_cookie \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);  
    if ($has\_post || $has\_get || $has\_cookie) return;

    $dept\_id \= null;  
    $city\_id \= null;

    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $dept\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
    }

    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $city\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, ($dept\_id \!== null ? $dept\_id : null));  
        if ($city\_id && $dept\_id \=== null) {  
            $term \= get\_term($city\_id, DC\_TAX);  
            if ($term && \!is\_wp\_error($term)) {  
                $dept\_id \= (int) $term-\>parent;  
            }  
        }  
    }

    if ($dept\_id) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string) $dept\_id);  
    if ($city\_id) dc\_set\_cookie(DC\_COOKIE\_CITY, (string) $city\_id);  
}, 1);

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }  
    $dept.on('change', function(){ setClientCookie('dc\_dept', $(this).val()); cargarCiudades($(this).val(), null); });  
    $city.on('change', function(){ setClientCookie('dc\_city', $(this).val()); });

    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_dept\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    }  
    if (isset($\_GET\['dc\_depto'\]) && is\_numeric($\_GET\['dc\_depto'\])) {  
        return (int) $\_GET\['dc\_depto'\];  
    }  
    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
        if ($id) return $id;  
    }  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $cid \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, null);  
        if ($cid) {  
            $term \= get\_term($cid, DC\_TAX);  
            if ($term && \!is\_wp\_error($term) && $term-\>parent) {  
                return (int) $term-\>parent;  
            }  
        }  
    }  
    return null;  
}  
function dc\_get\_selected\_city\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    }  
    if (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) {  
        return (int) $\_GET\['dc\_ciudad'\];  
    }  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $dept \= dc\_get\_selected\_dept\_id();  
        $id   \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, $dept ?: null);  
        if ($id) return $id;  
    }  
    return null;  
}

/\* \============== Cookies seguras \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $p \= get\_post();  
        $content \= $p && isset($p-\>post\_content) ? $p-\>post\_content : '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup) \===  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);  
    });

    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept\!==undefined && dept\!==null) setClientCookie('dc\_dept', dept);  
        if (city\!==undefined && city\!==null) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.4.7');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global productos por ciudad \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85;  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO';  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects (billing \+ shipping) \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $deps\_all \= dc\_get\_departamentos\_options();

    // \---------- Billing \----------  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
        'class'        \=\> array\_merge($fields\['billing'\]\['billing\_state'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    $city\_opts\_bill \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts\_bill \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts\_bill,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
        'class'        \=\> array\_merge($fields\['billing'\]\['billing\_city'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    // \---------- Shipping \----------  
    $fields\['shipping'\]\['shipping\_state'\] \= array\_merge($fields\['shipping'\]\['shipping\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> false, // Woo valida si es necesario al marcar "otra dirección"  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
        'class'        \=\> array\_merge($fields\['shipping'\]\['shipping\_state'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    $city\_opts\_ship \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts\_ship \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['shipping'\]\['shipping\_city'\] \= array\_merge($fields\['shipping'\]\['shipping\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts\_ship,  
        'required'     \=\> false,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
        'class'        \=\> array\_merge($fields\['shipping'\]\['shipping\_city'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    return $fields;  
});

/\* \================== Checkout: JS dependencias (billing \+ shipping) \+ ANTI-LOOP \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= (string) (dc\_get\_selected\_dept\_id() ?: '');  
        $sel\_city \= (string) (dc\_get\_selected\_city\_id() ?: '');

        $js\_checkout \= \<\<\<JS  
(function($){  
    var dcLoadingCities \= { billing:false, shipping:false };

    // Debounce para forzar update\_checkout sin spamear  
    var dcUpdateCheckoutTimer \= null;  
    function dcForceUpdateCheckout(){  
        if (dcUpdateCheckoutTimer) clearTimeout(dcUpdateCheckoutTimer);  
        dcUpdateCheckoutTimer \= setTimeout(function(){  
            $(document.body).trigger('update\_checkout');  
        }, 80);  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function needsLoadForDept(\\$city, deptId){  
        if(\!deptId){ return true; }  
        var boundDept \= \\$city.data('dcDept');  
        var hasOptions \= \\$city.find('option').length \> 1; // más que "— Selecciona —"  
        return (String(boundDept||'') \!== String(deptId)) || \!hasOptions;  
    }

    function dcLoadCiudades(prefix, deptId, preselect){  
        var \\$city \= $('\#' \+ prefix \+ '\_city');  
        if (\!deptId){  
            \\$city.removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        if (\!needsLoadForDept(\\$city, deptId)) {  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            return;  
        }  
        if (dcLoadingCities\[prefix\]) return;  
        dcLoadingCities\[prefix\] \= true;

        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        \\$city.prop('disabled', true);

        function finish(html, enable){  
            \\$city.html(html);  
            if (enable) \\$city.prop('disabled', false);  
            \\$city.data('dcDept', String(deptId));  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            dcLoadingCities\[prefix\] \= false;  
            // al terminar de cargar ciudades, forzamos update para que recalcule envío  
            dcForceUpdateCheckout();  
        }

        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Cambios del usuario \-\> cookies \+ cargar ciudades dependientes \+ forzar recálculo  
    $(document).on('change', '\#billing\_state', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_dept', v);  
        dcLoadCiudades('billing', v, null);  
        dcForceUpdateCheckout();  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_city', v);  
        dcForceUpdateCheckout();  
    });

    // SHIPPING: NO tocamos las cookies globales, solo ciudades \+ totals  
    $(document).on('change', '\#shipping\_state', function(){  
        var v \= $(this).val() || '';  
        dcLoadCiudades('shipping', v, null);  
        dcForceUpdateCheckout();  
    });  
    $(document).on('change', '\#shipping\_city', function(){  
        dcForceUpdateCheckout();  
    });

    // Toggle "Enviar a otra dirección" \-\> recalcular y preparar selects de shipping  
    $(document).on('change', '\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]', function(){  
        var checked \= $(this).is(':checked');  
        if (checked){  
            var dS \= $('\#shipping\_state').val() || $('\#billing\_state').val() || '{$sel\_dept}';  
            var cS \= $('\#shipping\_city').val()  || '';  
            if (dS){  
                dcLoadCiudades('shipping', dS, cS || null);  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
        dcForceUpdateCheckout();  
    });

    // Inicial  
    $(function(){  
        // Billing  
        var preDeptBill \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCityBill \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (preDeptBill){  
            dcLoadCiudades('billing', preDeptBill, preCityBill || null);  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }

        // Shipping (si está visible desde el inicio)  
        var preDeptShip \= $('\#shipping\_state').val() || preDeptBill || '{$sel\_dept}';  
        var preCityShip \= $('\#shipping\_city').val()  || '';  
        if ($('\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]').is(':checked')){  
            if (preDeptShip){  
                dcLoadCiudades('shipping', preDeptShip, preCityShip || null);  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
    });

    // Cuando Woo re-renderiza el checkout  
    $(document.body).on('updated\_checkout', function(){  
        // Billing  
        var dB \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var cB \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (dB){  
            if (needsLoadForDept($('\#billing\_city'), dB)) {  
                dcLoadCiudades('billing', dB, cB || null);  
            }  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }

        // Shipping (si está activo "Enviar a otra dirección")  
        var shipOn \= $('\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]').is(':checked');  
        var dS \= $('\#shipping\_state').val() || dB;  
        var cS \= $('\#shipping\_city').val()  || '';  
        if (shipOn){  
            if (dS){  
                if (needsLoadForDept($('\#shipping\_city'), dS)) {  
                    dcLoadCiudades('shipping', dS, cS || null);  
                }  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

/\* \================== VALIDACIÓN DE COMPATIBILIDAD (CIUDAD) \================== \*/  
function dc\_get\_product\_city\_term\_ids( int $product\_id ): array {  
    $terms \= wp\_get\_post\_terms( $product\_id, DC\_TAX, \['fields' \=\> 'all'\] );  
    if ( is\_wp\_error($terms) || empty($terms) ) return \[\];  
    $ids \= \[\];  
    foreach ($terms as $t) {  
        if ( \! empty($t-\>parent) ) {  
            $ids\[\] \= (int) $t-\>term\_id;  
        }  
    }  
    return array\_values(array\_unique($ids));  
}  
function dc\_city\_names\_from\_ids( array $ids ): array {  
    $out \= \[\];  
    foreach ($ids as $id) {  
        $term \= get\_term( (int) $id, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $out\[\] \= $term-\>name;  
        }  
    }  
    sort($out, SORT\_NATURAL | SORT\_FLAG\_CASE);  
    return $out;  
}

/\*\*  
 \* Ahora la compatibilidad usa siempre la ciudad "final" de envío  
 \* (shipping si está activado "Enviar a otra dirección", de lo contrario billing/cookie).  
 \*/  
function dc\_validate\_cart\_city\_compatibility() {  
    if ( \! function\_exists('WC') ) return;

    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $conflicts \= \[\];

    foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
        $product\_id   \= isset($cart\_item\['variation\_id'\]) && $cart\_item\['variation\_id'\] ? (int) $cart\_item\['variation\_id'\] : (int) $cart\_item\['product\_id'\];  
        $product\_obj  \= wc\_get\_product( $product\_id );  
        if ( \! $product\_obj ) continue;

        $city\_ids \= dc\_get\_product\_city\_term\_ids( $product\_id );  
        if ( empty($city\_ids) && $product\_obj-\>is\_type('variation') ) {  
            $parent\_id \= $product\_obj-\>get\_parent\_id();  
            if ( $parent\_id ) {  
                $city\_ids \= dc\_get\_product\_city\_term\_ids( (int) $parent\_id );  
            }  
        }

        if ( empty($city\_ids) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> \[\],  
            \];  
            continue;  
        }

        if ( \! in\_array( (int) $city\_id, $city\_ids, true ) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> $city\_ids,  
            \];  
        }  
    }

    if ( \! empty($conflicts) ) {  
        $city\_term \= get\_term( $city\_id, DC\_TAX );  
        $city\_name \= ($city\_term && \! is\_wp\_error($city\_term)) ? $city\_term-\>name : \_\_('la ciudad seleccionada', 'dc');

        $lines \= \[\];  
        foreach ( $conflicts as $c ) {  
            $available \= dc\_city\_names\_from\_ids( $c\['cities'\] );  
            $avail\_txt \= empty($available) ? \_\_('(sin ciudades asignadas)', 'dc') : implode(', ', $available);  
            $lines\[\] \= sprintf(  
                '%s \&rarr; %s',  
                esc\_html($c\['name'\]),  
                sprintf(\_\_('disponible en: %s', 'dc'), esc\_html($avail\_txt))  
            );  
        }

        $msg  \= '\<strong\>' . \_\_('Productos no disponibles para la ciudad seleccionada', 'dc') . "\</strong\>\<br\>";  
        $msg .= '\<ul style="margin-left:1em;list-style:disc;"\>';  
        foreach ($lines as $li) {  
            $msg .= '\<li\>' . $li . '\</li\>';  
        }  
        $msg .= '\</ul\>';  
        $msg .= '\<em\>' . sprintf(\_\_('Selecciona %s en la entrega o elimina estos productos.', 'dc'), esc\_html($city\_name)) . '\</em\>';

        wc\_add\_notice( wp\_kses\_post($msg), 'error' );  
    }  
}  
add\_action('woocommerce\_check\_cart\_items', 'dc\_validate\_cart\_city\_compatibility');  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
    dc\_validate\_cart\_city\_compatibility();  
}, 10, 2);

/\* \================== Forzar guardar NOMBRE de la ciudad en la orden \================== \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // Billing city  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    // Shipping city  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\* \============ Opcional: también guardar NOMBRE en el perfil del cliente \============ \*/  
add\_action('woocommerce\_checkout\_update\_customer', function( $customer, $data ){  
    if ( isset($data\['billing\_city'\]) && is\_numeric($data\['billing\_city'\]) ) {  
        $term \= get\_term( (int) $data\['billing\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    if ( isset($data\['shipping\_city'\]) && is\_numeric($data\['shipping\_city'\]) ) {  
        $term \= get\_term( (int) $data\['shipping\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\*\*  
 \* \================== Envío por ciudad (usa meta 'precio\_de\_envio') \==================  
 \*/

/\*\* Helpers toggle "Enviar a otra dirección" \*/  
function dc\_is\_truthy($v): bool {  
    if ($v \=== null) return false;  
    $v \= is\_string($v) ? strtolower(trim($v)) : $v;  
    return $v \=== 1 || $v \=== true || $v \=== '1' || $v \=== 'true' || $v \=== 'yes' || $v \=== 'on' || $v \=== 'y';  
}  
function dc\_ship\_to\_different\_enabled(): bool {  
    if ( isset($\_POST\['ship\_to\_different\_address'\]) ) {  
        return dc\_is\_truthy($\_POST\['ship\_to\_different\_address'\]);  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('ship\_to\_different\_address');  
        if ($val \!== null && $val \!== '') {  
            return dc\_is\_truthy($val);  
        }  
    }  
    if ( function\_exists('WC') && WC()-\>customer ) {  
        $has\_shipping \= (bool) WC()-\>customer-\>get\_shipping\_first\_name();  
        return $has\_shipping;  
    }  
    return false;  
}

/\*\* Prioriza siempre shipping\_city si el toggle está activo; si no, usa billing; luego cookie. \*/  
function dc\_get\_selected\_city\_for\_shipping(): ?int {  
    $ship\_diff \= dc\_ship\_to\_different\_enabled();

    if ( $ship\_diff ) {  
        if ( isset($\_POST\['shipping\_city'\]) && is\_numeric($\_POST\['shipping\_city'\]) ) {  
            return (int) $\_POST\['shipping\_city'\];  
        }  
        if ( function\_exists('WC') && WC()-\>checkout ) {  
            $sc \= WC()-\>checkout-\>get\_value('shipping\_city');  
            if ( is\_numeric($sc) ) return (int) $sc;  
        }  
        if ( function\_exists('WC') && WC()-\>checkout ) {  
            $bc \= WC()-\>checkout-\>get\_value('billing\_city');  
            if ( is\_numeric($bc) ) return (int) $bc;  
        }  
        $cookie\_city \= dc\_get\_selected\_city\_id();  
        return $cookie\_city ?: null;  
    }

    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $bc \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($bc) ) return (int) $bc;  
    }  
    $cookie\_city \= dc\_get\_selected\_city\_id();  
    return $cookie\_city ?: null;  
}

/\*\* Lee y normaliza el meta 'precio\_de\_envio' del término de ciudad. \*/  
function dc\_get\_city\_shipping\_price( int $city\_term\_id ): ?float {  
    if ( $city\_term\_id \<= 0 ) return null;

    $raw \= get\_term\_meta( $city\_term\_id, 'precio\_de\_envio', true );  
    if ( $raw \=== '' || $raw \=== null ) {  
        $raw \= get\_term\_meta( $city\_term\_id, 'precio\_envio', true );  
        if ( $raw \=== '' || $raw \=== null ) return null;  
    }

    $raw \= is\_string($raw) ? $raw : (string) $raw;  
    $raw \= str\_replace(\[' ', ' '\], '', $raw); // quita espacios y nbsp

    if ( strpos($raw, ',') \!== false && strpos($raw, '.') \!== false ) {  
        $raw \= str\_replace('.', '', $raw);  
        $raw \= str\_replace(',', '.', $raw);  
    } elseif ( strpos($raw, ',') \!== false ) {  
        $raw \= str\_replace(',', '.', $raw);  
    }

    $raw \= preg\_replace('/\[^0-9.\]/', '', $raw);  
    if ($raw \=== '' ) return null;

    $val \= (float) $raw;  
    if ( $val \< 0 ) $val \= 0.0;  
    return is\_finite($val) ? $val : null;  
}

/\*\* Sobrescribe costo de 'flat\_rate' con el precio de la ciudad. \*/  
add\_filter('woocommerce\_package\_rates', function( $rates, $package ){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return $rates;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) return $rates;

    $taxes \= \[\];  
    if ( wc\_tax\_enabled() ) {  
        $tax\_rates \= WC\_Tax::get\_shipping\_tax\_rates();  
        $taxes     \= WC\_Tax::calc\_shipping\_tax( $price, $tax\_rates );  
    }

    $city\_term \= get\_term( (int) $city\_id, DC\_TAX );  
    $city\_name \= ( $city\_term && \! is\_wp\_error($city\_term) ) ? $city\_term-\>name : '';

    foreach ( $rates as $rate\_id \=\> $rate ) {  
        if ( \! $rate instanceof WC\_Shipping\_Rate ) continue;  
        if ( $rate-\>get\_method\_id() \!== 'flat\_rate' ) continue;

        if ( method\_exists($rate, 'set\_cost') ) { $rate-\>set\_cost( $price ); } else { $rate-\>cost \= $price; }  
        if ( method\_exists($rate, 'set\_taxes') ) { $rate-\>set\_taxes( $taxes ); } else { $rate-\>taxes \= $taxes; }

        if ( $city\_name && method\_exists($rate, 'set\_label') ) {  
            $label \= $rate-\>get\_label();  
            if ( stripos($label, $city\_name) \=== false ) {  
                $rate-\>set\_label( sprintf('%s (%s)', $label, $city\_name) );  
            }  
        }  
    }  
    return $rates;  
}, 30, 2);

/\*\* Aviso si no hay tarifa configurada para la ciudad elegida. \*/  
add\_action('woocommerce\_check\_cart\_items', function(){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) {  
        $term \= get\_term( (int) $city\_id, DC\_TAX );  
        $name \= ($term && \! is\_wp\_error($term)) ? $term-\>name : \_\_('ciudad seleccionada', 'dc');  
        wc\_add\_notice(  
            sprintf(\_\_('No hay tarifa de envío configurada para %s. Por favor, selecciona otra ciudad o contacta soporte.', 'dc'), esc\_html($name)),  
            'notice'  
        );  
    }  
});

# 34 \- Dep/Ciu V8.2 Checkout, (Retiro en tienda)

**34 \- Departamentos/Ciudades V8.2 With Checkout, (Retiro en tienda)**

/\*\*  
 \* Plugin Name: DC Filtro Departamentos/Ciudades (Shortcode \+ Filtro Global \+ Checkout)  
 \* Description: Shortcode con selects dependientes (departamentos \-\> ciudades) para la taxonomía 'departamentosciudades'. Filtro global de productos por ciudad. Integra los mismos selects en el checkout (Departamento=state, Ciudad=city) en billing y shipping, y precarga desde el popup. Compatible con invitados, anti-loop y resistente a caché. Recalcula la tarifa de envío por ciudad priorizando shipping cuando se activa "Enviar a otra dirección".  
 \* Version:     1.4.7  
 \* Author:      Tu Equipo  
 \*/

if ( \! defined('ABSPATH') ) exit;

define('DC\_TAX', 'departamentosciudades');  
define('DC\_COOKIE\_CITY', 'dc\_city');  
define('DC\_COOKIE\_DEPT', 'dc\_dept');

/\*\* \================== PREDETERMINADO (por slug) \================== \*/  
define('DC\_DEFAULT\_DEPT\_SLUG', '25');     // \<-- ajusta o deja '' para omitir  
define('DC\_DEFAULT\_CITY\_SLUG', '11001');  // \<-- ajusta o deja '' para omitir

/\*\*  
 \* Busca un término por slug en la taxonomía DC\_TAX.  
 \* Si $parent es null no filtra por padre; si es 0 fuerza raíz; si \>0 limita al padre dado.  
 \*/  
function dc\_find\_term\_id\_by\_slug( string $slug, ?int $parent \= null ): ?int {  
    if ($slug \=== '') return null;  
    $args \= \[  
        'taxonomy'   \=\> DC\_TAX,  
        'slug'       \=\> $slug,  
        'hide\_empty' \=\> false,  
    \];  
    if ($parent \!== null) {  
        $args\['parent'\] \= (int) $parent;  
    }  
    $terms \= get\_terms($args);  
    if (is\_wp\_error($terms) || empty($terms)) return null;  
    return (int) $terms\[0\]-\>term\_id;  
}

/\*\*  
 \* En init tempranísimo: si no hay selección previa (POST/GET/COOKIES),  
 \* fija cookies con los IDs de depto/ciudad por defecto a partir de los slugs.  
 \*/  
add\_action('init', function () {  
    if (is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron())) {  
        return;  
    }

    $has\_post \= isset($\_POST\['dc\_ciudad'\], $\_POST\['dc\_depto'\], $\_POST\['billing\_city'\], $\_POST\['billing\_state'\], $\_POST\['shipping\_city'\], $\_POST\['shipping\_state'\])  
                && ( \!empty($\_POST\['dc\_ciudad'\]) || \!empty($\_POST\['dc\_depto'\]) || \!empty($\_POST\['billing\_city'\]) || \!empty($\_POST\['billing\_state'\]) || \!empty($\_POST\['shipping\_city'\]) || \!empty($\_POST\['shipping\_state'\]) );  
    $has\_get  \= isset($\_GET\['dc\_ciudad'\]) || isset($\_GET\['dc\_depto'\]);  
    $has\_cookie \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);  
    if ($has\_post || $has\_get || $has\_cookie) return;

    $dept\_id \= null;  
    $city\_id \= null;

    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $dept\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
    }

    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $city\_id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, ($dept\_id \!== null ? $dept\_id : null));  
        if ($city\_id && $dept\_id \=== null) {  
            $term \= get\_term($city\_id, DC\_TAX);  
            if ($term && \!is\_wp\_error($term)) {  
                $dept\_id \= (int) $term-\>parent;  
            }  
        }  
    }

    if ($dept\_id) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string) $dept\_id);  
    if ($city\_id) dc\_set\_cookie(DC\_COOKIE\_CITY, (string) $city\_id);  
}, 1);

/\* \================== Crea/repone el archivo JS base si no existe \================== \*/  
add\_action('init', function () {  
    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( \! file\_exists($js\_file) ) {  
        @file\_put\_contents($js\_file, \<\<\<JS  
jQuery(function($){  
    var $dept \= $('\#dc\_depto');  
    var $city \= $('\#dc\_ciudad');  
    function cargarCiudades(deptId, preselect){  
        if(\!deptId){ $city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>'); return; }  
        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId }, function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                });  
                $city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }, function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+ t.id \+'"'+ sel \+'\>'+ t.name \+'\</option\>';  
                        });  
                        $city.html(o2).prop('disabled', false);  
                    } else {  
                        $city.prop('disabled', true);  
                    }  
                });  
            }  
        });  
    }  
    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }  
    $dept.on('change', function(){ setClientCookie('dc\_dept', $(this).val()); cargarCiudades($(this).val(), null); });  
    $city.on('change', function(){ setClientCookie('dc\_city', $(this).val()); });

    if (window.DCFiltro && DCFiltro.selDept){ cargarCiudades(DCFiltro.selDept, DCFiltro.selCity || null); }  
});  
JS  
        );  
    }  
});

/\* \================= Utils selección (COOKIE \> GET) \================= \*/  
function dc\_get\_selected\_dept\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_DEPT\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_DEPT\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_DEPT\];  
    }  
    if (isset($\_GET\['dc\_depto'\]) && is\_numeric($\_GET\['dc\_depto'\])) {  
        return (int) $\_GET\['dc\_depto'\];  
    }  
    if (defined('DC\_DEFAULT\_DEPT\_SLUG') && DC\_DEFAULT\_DEPT\_SLUG \!== '') {  
        $id \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_DEPT\_SLUG, 0);  
        if ($id) return $id;  
    }  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $cid \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, null);  
        if ($cid) {  
            $term \= get\_term($cid, DC\_TAX);  
            if ($term && \!is\_wp\_error($term) && $term-\>parent) {  
                return (int) $term-\>parent;  
            }  
        }  
    }  
    return null;  
}  
function dc\_get\_selected\_city\_id() : ?int {  
    if (isset($\_COOKIE\[DC\_COOKIE\_CITY\]) && is\_numeric($\_COOKIE\[DC\_COOKIE\_CITY\])) {  
        return (int) $\_COOKIE\[DC\_COOKIE\_CITY\];  
    }  
    if (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) {  
        return (int) $\_GET\['dc\_ciudad'\];  
    }  
    if (defined('DC\_DEFAULT\_CITY\_SLUG') && DC\_DEFAULT\_CITY\_SLUG \!== '') {  
        $dept \= dc\_get\_selected\_dept\_id();  
        $id   \= dc\_find\_term\_id\_by\_slug(DC\_DEFAULT\_CITY\_SLUG, $dept ?: null);  
        if ($id) return $id;  
    }  
    return null;  
}

/\* \============== Cookies seguras \============== \*/  
function dc\_set\_cookie(string $name, string $value, int $ttl\_days \= 7\) {  
    $params \= \[  
        'expires'  \=\> time() \+ DAY\_IN\_SECONDS \* $ttl\_days,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, $value, $params);  
    else setcookie($name, $value, $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}  
function dc\_clear\_cookie(string $name){  
    $params \= \[  
        'expires'  \=\> time() \- 3600,  
        'path'     \=\> '/',  
        'secure'   \=\> is\_ssl(),  
        'httponly' \=\> true,  
        'samesite' \=\> 'Lax',  
    \];  
    if (defined('COOKIE\_DOMAIN') && COOKIE\_DOMAIN) $params\['domain'\] \= COOKIE\_DOMAIN;  
    if (PHP\_VERSION\_ID \>= 70300\) setcookie($name, '', $params);  
    else setcookie($name, '', $params\['expires'\], $params\['path'\], $params\['domain'\] ?? '', $params\['secure'\], $params\['httponly'\]);  
}

/\* \============== Guardar/limpiar selección \+ PRG \============== \*/  
add\_action('init', function () {  
    if ( is\_admin() || (function\_exists('wp\_doing\_ajax') && wp\_doing\_ajax()) || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    if ( isset($\_GET\['dc\_clear'\]) ) {  
        dc\_clear\_cookie(DC\_COOKIE\_CITY);  
        dc\_clear\_cookie(DC\_COOKIE\_DEPT);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    $city\_post \= (isset($\_POST\['dc\_ciudad'\]) && is\_numeric($\_POST\['dc\_ciudad'\])) ? (int) $\_POST\['dc\_ciudad'\] : null;  
    $dept\_post \= (isset($\_POST\['dc\_depto'\])  && is\_numeric($\_POST\['dc\_depto'\]))  ? (int) $\_POST\['dc\_depto'\]  : null;

    if ($city\_post \!== null || $dept\_post \!== null) {  
        if ($city\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_post);  
        if ($dept\_post \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_post);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }

    $city\_get \= (isset($\_GET\['dc\_ciudad'\]) && is\_numeric($\_GET\['dc\_ciudad'\])) ? (int) $\_GET\['dc\_ciudad'\] : null;  
    $dept\_get \= (isset($\_GET\['dc\_depto'\])  && is\_numeric($\_GET\['dc\_depto'\]))  ? (int) $\_GET\['dc\_depto'\]  : null;

    if ($city\_get \!== null || $dept\_get \!== null) {  
        if ($city\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_CITY, (string)$city\_get);  
        if ($dept\_get \!== null) dc\_set\_cookie(DC\_COOKIE\_DEPT, (string)$dept\_get);  
        wp\_safe\_redirect( remove\_query\_arg(\['dc\_depto','dc\_ciudad','dc\_clear'\]) );  
        exit;  
    }  
});

/\* \======= Anti-caché \======= \*/  
add\_action('send\_headers', function () {  
    $has\_selection \= isset($\_COOKIE\[DC\_COOKIE\_CITY\]) || isset($\_COOKIE\[DC\_COOKIE\_DEPT\]);

    $has\_shortcodes \= false;  
    if (is\_singular()) {  
        $p \= get\_post();  
        $content \= $p && isset($p-\>post\_content) ? $p-\>post\_content : '';  
        $has\_shortcodes \= has\_shortcode($content, 'dc\_filtro\_ubicacion') || has\_shortcode($content, 'dc\_ciudad\_actual');  
    }

    $is\_shopish \= function\_exists('is\_shop') && (is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product'));

    if ($has\_selection || $has\_shortcodes || $is\_shopish) {  
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');  
        header('Pragma: no-cache');  
        header('Vary: Cookie, Accept-Encoding');  
        if (\!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);  
        header('X-LiteSpeed-Cache-Control: no-cache');  
    }  
});

/\* \================== Front assets (JS \+ CSS) \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    $local \= \[  
        'ajaxurl' \=\> admin\_url('admin-ajax.php'),  
        'nonce'   \=\> wp\_create\_nonce('dc\_ciudades\_nonce'),  
        'tax'     \=\> DC\_TAX,  
        'selDept' \=\> dc\_get\_selected\_dept\_id(),  
        'selCity' \=\> dc\_get\_selected\_city\_id(),  
    \];

    $js\_file \= plugin\_dir\_path(\_\_FILE\_\_) . 'dc-filtro-ubicacion.js';  
    if ( file\_exists($js\_file) ) {  
        $js\_url \= plugins\_url('dc-filtro-ubicacion.js', \_\_FILE\_\_);  
        wp\_register\_script('dc-filtro-ubicacion', $js\_url, \['jquery'\], filemtime($js\_file), true);  
    } else {  
        wp\_register\_script('dc-filtro-ubicacion', false, \['jquery'\], '1.0.0', true);  
    }

    wp\_localize\_script('dc-filtro-ubicacion', 'DCFiltro', $local);  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    // \=== JS inline (shortcode/popup) \===  
    $js\_inline \= \<\<\<JS  
(function($){  
    function dcCargarCiudades(deptId, preselect, \\$ctx){  
        var \\$scope \= (\\$ctx && \\$ctx.length) ? \\$ctx : $(document);  
        var \\$city  \= $('\#dc\_ciudad', \\$scope);  
        if(\!deptId){  
            \\$city.prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        \\$city.prop('disabled', true);  
        $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId}).done(function(resp){  
            var opts \= '\<option value=""\>— Selecciona —\</option\>';  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                \\$city.html(opts).prop('disabled', false);  
            } else {  
                $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                    var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        \\$city.html(opts2).prop('disabled', false);  
                    } else {  
                        \\$city.html(opts).prop('disabled', true);  
                    }  
                }).fail(function(){ \\$city.prop('disabled', true); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, {action:'dc\_get\_ciudades', dept:deptId}).done(function(r2){  
                var opts2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        opts2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    \\$city.html(opts2).prop('disabled', false);  
                } else {  
                    \\$city.prop('disabled', true);  
                }  
            }).fail(function(){ \\$city.prop('disabled', true); });  
        });  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    $(document).on('change', '\#dc\_depto', function(){  
        var \\$wrap \= $(this).closest('.dc-filtro-form');  
        var deptId \= $(this).val();  
        setClientCookie('dc\_dept', deptId);  
        dcCargarCiudades(deptId, null, \\$wrap);  
    });  
    $(document).on('change', '\#dc\_ciudad', function(){  
        var cityId \= $(this).val();  
        setClientCookie('dc\_city', cityId);  
    });

    $(function(){  
        var \\$doc \= $(document);  
        var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$doc).val();  
        if (selDept){  
            dcCargarCiudades(selDept, DCFiltro.selCity || null, \\$doc);  
        }  
    });

    if (window.elementorFrontend && elementorFrontend.hooks && elementorFrontend.hooks.addAction){  
        elementorFrontend.hooks.addAction('popup:after\_open', function(id, instance){  
            var \\$ctx \= (instance && instance.\\$element) ? instance.\\$element : $(document);  
            var selDept \= DCFiltro.selDept || $('\#dc\_depto', \\$ctx).val();  
            var selCity \= DCFiltro.selCity || $('\#dc\_ciudad', \\$ctx).val();  
            if (selDept){  
                dcCargarCiudades(selDept, selCity || null, \\$ctx);  
            }  
        });  
    }

    $(document).on('submit', '.dc-filtro-form', function(){  
        var dept \= $('\#dc\_depto', this).val();  
        var city \= $('\#dc\_ciudad', this).val();  
        if (dept\!==undefined && dept\!==null) setClientCookie('dc\_dept', dept);  
        if (city\!==undefined && city\!==null) setClientCookie('dc\_city', city);  
    });  
})(jQuery);  
JS;  
    wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_inline);

    // CSS  
    $css \= \<\<\<CSS  
.dc-filtro-form{display:grid;gap:12px;max-width:480px}  
.dc-filtro-form label{display:grid;gap:6px}  
.dc-filtro-form label \> span{font-weight:600;color:\#474748;font-size:14px}  
.dc-filtro-form select{appearance:none;width:100%;padding:12px 14px;border:1px solid \#E3E6EA;border-radius:10px;background:\#fff;font-size:15px;line-height:1.3;box-shadow:0 1px 0 rgba(0,0,0,0.02) inset}  
.dc-filtro-form select:focus{outline:none;border-color:\#1C4595;box-shadow:0 0 0 3px rgba(28,160,78,.12)}  
.dc-filtro-form select:disabled{background:\#f7f7f7;color:\#9aa1a9;cursor:not-allowed}  
.dc-filtro-form .button, .dc-filtro-form button{padding:12px 18px;border-radius:10px;border:1px solid \#1C4595;background:\#1C4595;color:\#fff;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s ease}  
.dc-filtro-form button:hover{ background:\#163a7a; border-color:\#163a7a;}  
.dc-filtro-form .button{ background:\#fff; color:\#1C4595; border:1px solid \#d1d5db;}  
.dc-filtro-form .button:hover{ background:\#f3f4f6; color:\#163a7a; border-color:\#163a7a;}  
CSS;  
    wp\_register\_style('dc-filtro-ubicacion-style', false, \[\], '1.4.7');  
    wp\_enqueue\_style('dc-filtro-ubicacion-style');  
    wp\_add\_inline\_style('dc-filtro-ubicacion-style', $css);  
});

/\* \=================== Shortcode \[dc\_filtro\_ubicacion\] \=================== \*/  
add\_shortcode('dc\_filtro\_ubicacion', function ($atts) {  
    wp\_enqueue\_script('dc-filtro-ubicacion');

    $departamentos \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);

    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $ciudades \= \[\];  
    if ($sel\_dept) {  
        $ciudades \= get\_terms(\[  
            'taxonomy'   \=\> DC\_TAX,  
            'hide\_empty' \=\> false,  
            'parent'     \=\> $sel\_dept,  
            'orderby'    \=\> 'name',  
            'order'      \=\> 'ASC',  
        \]);  
    }

    $action    \= esc\_url( remove\_query\_arg(\['dc\_clear','dc\_depto','dc\_ciudad'\]) );  
    $clear\_url \= esc\_url( add\_query\_arg('dc\_clear','1') );

    ob\_start(); ?\>  
    \<form class="dc-filtro-form" method="post" action="\<?php echo $action; ?\>"\>  
        \<label for="dc\_depto"\>  
            \<span\>Departamento\</span\>  
            \<select name="dc\_depto" id="dc\_depto" required\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($departamentos as $d): ?\>  
                    \<option value="\<?php echo esc\_attr($d-\>term\_id); ?\>" \<?php selected($sel\_dept, $d-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($d-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<label for="dc\_ciudad"\>  
            \<span\>Ciudad\</span\>  
            \<select name="dc\_ciudad" id="dc\_ciudad" required \<?php echo $sel\_dept ? '' : 'disabled'; ?\>\>  
                \<option value=""\>— Selecciona —\</option\>  
                \<?php foreach ($ciudades as $c): ?\>  
                    \<option value="\<?php echo esc\_attr($c-\>term\_id); ?\>" \<?php selected($sel\_city, $c-\>term\_id); ?\>\>  
                        \<?php echo esc\_html($c-\>name); ?\>  
                    \</option\>  
                \<?php endforeach; ?\>  
            \</select\>  
        \</label\>

        \<div style="display:flex; gap:20px;"\>  
            \<a class="button" href="\<?php echo $clear\_url; ?\>"\>Limpiar\</a\>  
            \<button type="submit"\>Aplicar\</button\>  
        \</div\>  
    \</form\>  
    \<?php  
    return ob\_get\_clean();  
});

/\* \=================== AJAX ciudades \=================== \*/  
add\_action('wp\_ajax\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
add\_action('wp\_ajax\_nopriv\_dc\_get\_ciudades', 'dc\_ajax\_get\_ciudades');  
function dc\_ajax\_get\_ciudades() {  
    $nonce\_ok \= true;  
    if (isset($\_POST\['nonce'\])) {  
        $nonce\_ok \= (bool) wp\_verify\_nonce($\_POST\['nonce'\], 'dc\_ciudades\_nonce');  
    }  
    if ( \! $nonce\_ok && is\_user\_logged\_in() ) {  
        wp\_send\_json\_error(\['message' \=\> 'Nonce inválido'\]);  
    }

    $dept \= isset($\_POST\['dept'\]) ? (int) $\_POST\['dept'\] : 0;  
    if (\!$dept) wp\_send\_json\_error(\['message' \=\> 'Departamento inválido'\]);

    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> $dept,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    $out \= \[\];  
    foreach ($terms as $t) $out\[\] \= \['id'=\>$t-\>term\_id,'name'=\>$t-\>name,'slug'=\>$t-\>slug\];

    wp\_send\_json\_success(\['terms' \=\> $out\]);  
}

/\* \=========== Filtro global productos por ciudad \=========== \*/  
add\_action('pre\_get\_posts', function ($q) {  
    if ( is\_admin() || (function\_exists('wp\_doing\_cron') && wp\_doing\_cron()) ) return;

    $post\_type \= $q-\>get('post\_type');  
    $is\_products\_query \= false;

    if ($post\_type \=== 'product') $is\_products\_query \= true;  
    if (is\_array($post\_type) && in\_array('product', $post\_type, true)) $is\_products\_query \= true;

    if ( \!$is\_products\_query && ( function\_exists('is\_shop') && ( is\_shop() || is\_product\_taxonomy() || is\_post\_type\_archive('product') ) ) ) {  
        $is\_products\_query \= true;  
        if (\!$q-\>get('post\_type')) $q-\>set('post\_type', 'product');  
    }

    if ( \! $is\_products\_query ) return;

    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return;

    $tax\_query   \= (array) $q-\>get('tax\_query');  
    $tax\_query\[\] \= \[  
        'taxonomy'         \=\> DC\_TAX,  
        'field'            \=\> 'term\_id',  
        'terms'            \=\> \[$city\_id\],  
        'include\_children' \=\> false,  
        'operator'         \=\> 'IN',  
    \];  
    $q-\>set('tax\_query', $tax\_query);  
}, 20);

/\* \================== Shortcode ciudad actual \================== \*/  
add\_shortcode('dc\_ciudad\_actual', function($atts){  
    $atts \= shortcode\_atts(\['default' \=\> ''\], $atts, 'dc\_ciudad\_actual');  
    $city\_id \= dc\_get\_selected\_city\_id();  
    if ( \! $city\_id ) return esc\_html($atts\['default'\]);  
    $term \= get\_term($city\_id, DC\_TAX);  
    if ($term && \!is\_wp\_error($term)) return esc\_html($term-\>name);  
    return esc\_html($atts\['default'\]);  
});

/\* \================== Helpers de términos \================== \*/  
function dc\_get\_departamentos\_options(): array {  
    $out \= \[\];  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> 0,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}  
function dc\_get\_ciudades\_options($dept\_id): array {  
    $out \= \[\];  
    if (\!$dept\_id) return $out;  
    $terms \= get\_terms(\[  
        'taxonomy'   \=\> DC\_TAX,  
        'hide\_empty' \=\> false,  
        'parent'     \=\> (int) $dept\_id,  
        'orderby'    \=\> 'name',  
        'order'      \=\> 'ASC',  
    \]);  
    foreach ($terms as $t) $out\[(string)$t-\>term\_id\] \= $t-\>name;  
    return $out;  
}

/\* \================== Checkout: orden de campos \================== \*/  
add\_filter('woocommerce\_default\_address\_fields', function($fields){  
    if (isset($fields\['state'\])) {  
        $fields\['state'\]\['label'\]    \= \_\_('Departamento', 'dc');  
        $fields\['state'\]\['priority'\] \= 60;  
    }  
    if (isset($fields\['city'\])) {  
        $fields\['city'\]\['label'\]     \= \_\_('Ciudad', 'dc');  
        $fields\['city'\]\['priority'\]  \= 70;  
    }  
    if (isset($fields\['address\_1'\])) {  
        $fields\['address\_1'\]\['label'\]    \= \_\_('Dirección', 'dc');  
        $fields\['address\_1'\]\['priority'\] \= 80;  
    }  
    if (isset($fields\['address\_2'\])) {  
        $fields\['address\_2'\]\['label'\]    \= isset($fields\['address\_2'\]\['label'\]) ? $fields\['address\_2'\]\['label'\] : \_\_('Apartamento, torre, etc.', 'dc');  
        $fields\['address\_2'\]\['priority'\] \= 85;  
    }  
    return $fields;  
});

/\* \================== Checkout: estados CO \= departamentos \================== \*/  
add\_filter('woocommerce\_states', function($states){  
    $country \= 'CO';  
    $deps \= dc\_get\_departamentos\_options();  
    $states\[$country\] \= $deps; // keys \= term\_id, values \= nombre  
    return $states;  
});

/\* \================== Checkout: convertir state/city en selects (billing \+ shipping) \================== \*/  
add\_filter('woocommerce\_checkout\_fields', function($fields){  
    $sel\_dept \= dc\_get\_selected\_dept\_id();  
    $sel\_city \= dc\_get\_selected\_city\_id();

    $deps\_all \= dc\_get\_departamentos\_options();

    // \---------- Billing \----------  
    $fields\['billing'\]\['billing\_state'\] \= array\_merge($fields\['billing'\]\['billing\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
        'class'        \=\> array\_merge($fields\['billing'\]\['billing\_state'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    $city\_opts\_bill \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts\_bill \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['billing'\]\['billing\_city'\] \= array\_merge($fields\['billing'\]\['billing\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts\_bill,  
        'required'     \=\> true,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
        'class'        \=\> array\_merge($fields\['billing'\]\['billing\_city'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    // \---------- Shipping \----------  
    $fields\['shipping'\]\['shipping\_state'\] \= array\_merge($fields\['shipping'\]\['shipping\_state'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Departamento', 'dc'),  
        'options'      \=\> \['' \=\> '— Selecciona —'\] \+ $deps\_all,  
        'required'     \=\> false, // Woo valida si es necesario al marcar "otra dirección"  
        'default'      \=\> $sel\_dept ? (string)$sel\_dept : '',  
        'autocomplete' \=\> 'address-level1',  
        'priority'     \=\> 60,  
        'class'        \=\> array\_merge($fields\['shipping'\]\['shipping\_state'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    $city\_opts\_ship \= \['' \=\> '— Selecciona —'\];  
    if ($sel\_dept) $city\_opts\_ship \+= dc\_get\_ciudades\_options($sel\_dept);

    $fields\['shipping'\]\['shipping\_city'\] \= array\_merge($fields\['shipping'\]\['shipping\_city'\] ?? \[\], \[  
        'type'         \=\> 'select',  
        'label'        \=\> \_\_('Ciudad', 'dc'),  
        'options'      \=\> $city\_opts\_ship,  
        'required'     \=\> false,  
        'default'      \=\> $sel\_city ? (string)$sel\_city : '',  
        'autocomplete' \=\> 'address-level2',  
        'priority'     \=\> 70,  
        'class'        \=\> array\_merge($fields\['shipping'\]\['shipping\_city'\]\['class'\] ?? \[\], \['update\_totals\_on\_change'\]),  
    \]);

    return $fields;  
});

/\* \================== Checkout: JS dependencias (billing \+ shipping) \+ ANTI-LOOP \================== \*/  
add\_action('wp\_enqueue\_scripts', function () {  
    if (function\_exists('is\_checkout') && is\_checkout()) {  
        wp\_enqueue\_script('dc-filtro-ubicacion');

        $sel\_dept \= (string) (dc\_get\_selected\_dept\_id() ?: '');  
        $sel\_city \= (string) (dc\_get\_selected\_city\_id() ?: '');

        $js\_checkout \= \<\<\<JS  
(function($){  
    var dcLoadingCities \= { billing:false, shipping:false };

    // Debounce para forzar update\_checkout sin spamear  
    var dcUpdateCheckoutTimer \= null;  
    function dcForceUpdateCheckout(){  
        if (dcUpdateCheckoutTimer) clearTimeout(dcUpdateCheckoutTimer);  
        dcUpdateCheckoutTimer \= setTimeout(function(){  
            $(document.body).trigger('update\_checkout');  
        }, 80);  
    }

    function setClientCookie(name, val){  
        if(val===undefined || val===null) return;  
        document.cookie \= name \+ '=' \+ encodeURIComponent(val) \+ '; path=/';  
    }

    function needsLoadForDept(\\$city, deptId){  
        if(\!deptId){ return true; }  
        var boundDept \= \\$city.data('dcDept');  
        var hasOptions \= \\$city.find('option').length \> 1; // más que "— Selecciona —"  
        return (String(boundDept||'') \!== String(deptId)) || \!hasOptions;  
    }

    function dcLoadCiudades(prefix, deptId, preselect){  
        var \\$city \= $('\#' \+ prefix \+ '\_city');  
        if (\!deptId){  
            \\$city.removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            return;  
        }  
        if (\!needsLoadForDept(\\$city, deptId)) {  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            return;  
        }  
        if (dcLoadingCities\[prefix\]) return;  
        dcLoadingCities\[prefix\] \= true;

        var opts \= '\<option value=""\>— Selecciona —\</option\>';  
        \\$city.prop('disabled', true);

        function finish(html, enable){  
            \\$city.html(html);  
            if (enable) \\$city.prop('disabled', false);  
            \\$city.data('dcDept', String(deptId));  
            if (preselect && \\$city.find('option\[value="'+ preselect \+'"\]').length){  
                \\$city.val(String(preselect));  
            }  
            dcLoadingCities\[prefix\] \= false;  
            // al terminar de cargar ciudades, forzamos update para que recalcule envío  
            dcForceUpdateCheckout();  
        }

        $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', nonce:DCFiltro.nonce, dept:deptId })  
        .done(function(resp){  
            if(resp && resp.success && resp.data && resp.data.terms){  
                resp.data.terms.forEach(function(t){  
                    var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                    opts \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                });  
                finish(opts, true);  
            } else {  
                $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                    var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                    if(r2 && r2.success && r2.data && r2.data.terms){  
                        r2.data.terms.forEach(function(t){  
                            var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                            o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                        });  
                        finish(o2, true);  
                    } else {  
                        finish(opts, false);  
                    }  
                }).fail(function(){ finish(opts, false); });  
            }  
        }).fail(function(){  
            $.post(DCFiltro.ajaxurl, { action:'dc\_get\_ciudades', dept:deptId }).done(function(r2){  
                var o2 \= '\<option value=""\>— Selecciona —\</option\>';  
                if(r2 && r2.success && r2.data && r2.data.terms){  
                    r2.data.terms.forEach(function(t){  
                        var sel \= (preselect && String(preselect)===String(t.id)) ? ' selected' : '';  
                        o2 \+= '\<option value="'+t.id+'"'+sel+'\>'+t.name+'\</option\>';  
                    });  
                    finish(o2, true);  
                } else {  
                    finish(opts, false);  
                }  
            }).fail(function(){ finish(opts, false); });  
        });  
    }

    // Cambios del usuario \-\> cookies \+ cargar ciudades dependientes \+ forzar recálculo  
    $(document).on('change', '\#billing\_state', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_dept', v);  
        dcLoadCiudades('billing', v, null);  
        dcForceUpdateCheckout();  
    });  
    $(document).on('change', '\#billing\_city', function(){  
        var v \= $(this).val() || '';  
        setClientCookie('dc\_city', v);  
        dcForceUpdateCheckout();  
    });

    // SHIPPING: NO tocamos las cookies globales, solo ciudades \+ totals  
    $(document).on('change', '\#shipping\_state', function(){  
        var v \= $(this).val() || '';  
        dcLoadCiudades('shipping', v, null);  
        dcForceUpdateCheckout();  
    });  
    $(document).on('change', '\#shipping\_city', function(){  
        dcForceUpdateCheckout();  
    });

    // Toggle "Enviar a otra dirección" \-\> recalcular y preparar selects de shipping  
    $(document).on('change', '\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]', function(){  
        var checked \= $(this).is(':checked');  
        if (checked){  
            var dS \= $('\#shipping\_state').val() || $('\#billing\_state').val() || '{$sel\_dept}';  
            var cS \= $('\#shipping\_city').val()  || '';  
            if (dS){  
                dcLoadCiudades('shipping', dS, cS || null);  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
        dcForceUpdateCheckout();  
    });

    // Inicial  
    $(function(){  
        // Billing  
        var preDeptBill \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var preCityBill \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (preDeptBill){  
            dcLoadCiudades('billing', preDeptBill, preCityBill || null);  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }

        // Shipping (si está visible desde el inicio)  
        var preDeptShip \= $('\#shipping\_state').val() || preDeptBill || '{$sel\_dept}';  
        var preCityShip \= $('\#shipping\_city').val()  || '';  
        if ($('\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]').is(':checked')){  
            if (preDeptShip){  
                dcLoadCiudades('shipping', preDeptShip, preCityShip || null);  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
    });

    // Cuando Woo re-renderiza el checkout  
    $(document.body).on('updated\_checkout', function(){  
        // Billing  
        var dB \= $('\#billing\_state').val() || '{$sel\_dept}';  
        var cB \= $('\#billing\_city').val()  || '{$sel\_city}';  
        if (dB){  
            if (needsLoadForDept($('\#billing\_city'), dB)) {  
                dcLoadCiudades('billing', dB, cB || null);  
            }  
        } else {  
            $('\#billing\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
        }

        // Shipping (si está activo "Enviar a otra dirección")  
        var shipOn \= $('\#ship-to-different-address input, input\[name="ship\_to\_different\_address"\]').is(':checked');  
        var dS \= $('\#shipping\_state').val() || dB;  
        var cS \= $('\#shipping\_city').val()  || '';  
        if (shipOn){  
            if (dS){  
                if (needsLoadForDept($('\#shipping\_city'), dS)) {  
                    dcLoadCiudades('shipping', dS, cS || null);  
                }  
            } else {  
                $('\#shipping\_city').removeData('dcDept').prop('disabled', true).html('\<option value=""\>— Selecciona —\</option\>');  
            }  
        }  
    });  
})(jQuery);  
JS;  
        wp\_add\_inline\_script('dc-filtro-ubicacion', $js\_checkout);  
    }  
});

/\* \================== VALIDACIÓN DE COMPATIBILIDAD (CIUDAD) \================== \*/  
function dc\_get\_product\_city\_term\_ids( int $product\_id ): array {  
    $terms \= wp\_get\_post\_terms( $product\_id, DC\_TAX, \['fields' \=\> 'all'\] );  
    if ( is\_wp\_error($terms) || empty($terms) ) return \[\];  
    $ids \= \[\];  
    foreach ($terms as $t) {  
        if ( \! empty($t-\>parent) ) {  
            $ids\[\] \= (int) $t-\>term\_id;  
        }  
    }  
    return array\_values(array\_unique($ids));  
}  
function dc\_city\_names\_from\_ids( array $ids ): array {  
    $out \= \[\];  
    foreach ($ids as $id) {  
        $term \= get\_term( (int) $id, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $out\[\] \= $term-\>name;  
        }  
    }  
    sort($out, SORT\_NATURAL | SORT\_FLAG\_CASE);  
    return $out;  
}

/\*\*  
 \* Ahora la compatibilidad usa siempre la ciudad "final" de envío  
 \* (shipping si está activado "Enviar a otra dirección", de lo contrario billing/cookie).  
 \*/  
function dc\_validate\_cart\_city\_compatibility() {  
    if ( \! function\_exists('WC') ) return;

    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $conflicts \= \[\];

    foreach ( WC()-\>cart-\>get\_cart() as $cart\_item ) {  
        $product\_id   \= isset($cart\_item\['variation\_id'\]) && $cart\_item\['variation\_id'\] ? (int) $cart\_item\['variation\_id'\] : (int) $cart\_item\['product\_id'\];  
        $product\_obj  \= wc\_get\_product( $product\_id );  
        if ( \! $product\_obj ) continue;

        $city\_ids \= dc\_get\_product\_city\_term\_ids( $product\_id );  
        if ( empty($city\_ids) && $product\_obj-\>is\_type('variation') ) {  
            $parent\_id \= $product\_obj-\>get\_parent\_id();  
            if ( $parent\_id ) {  
                $city\_ids \= dc\_get\_product\_city\_term\_ids( (int) $parent\_id );  
            }  
        }

        if ( empty($city\_ids) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> \[\],  
            \];  
            continue;  
        }

        if ( \! in\_array( (int) $city\_id, $city\_ids, true ) ) {  
            $conflicts\[\] \= \[  
                'name'   \=\> $product\_obj-\>get\_name(),  
                'cities' \=\> $city\_ids,  
            \];  
        }  
    }

    if ( \! empty($conflicts) ) {  
        $city\_term \= get\_term( $city\_id, DC\_TAX );  
        $city\_name \= ($city\_term && \! is\_wp\_error($city\_term)) ? $city\_term-\>name : \_\_('la ciudad seleccionada', 'dc');

        $lines \= \[\];  
        foreach ( $conflicts as $c ) {  
            $available \= dc\_city\_names\_from\_ids( $c\['cities'\] );  
            $avail\_txt \= empty($available) ? \_\_('(sin ciudades asignadas)', 'dc') : implode(', ', $available);  
            $lines\[\] \= sprintf(  
                '%s \&rarr; %s',  
                esc\_html($c\['name'\]),  
                sprintf(\_\_('disponible en: %s', 'dc'), esc\_html($avail\_txt))  
            );  
        }

        $msg  \= '\<strong\>' . \_\_('Productos no disponibles para la ciudad seleccionada', 'dc') . "\</strong\>\<br\>";  
        $msg .= '\<ul style="margin-left:1em;list-style:disc;"\>';  
        foreach ($lines as $li) {  
            $msg .= '\<li\>' . $li . '\</li\>';  
        }  
        $msg .= '\</ul\>';  
        $msg .= '\<em\>' . sprintf(\_\_('Selecciona %s en la entrega o elimina estos productos.', 'dc'), esc\_html($city\_name)) . '\</em\>';

        wc\_add\_notice( wp\_kses\_post($msg), 'error' );  
    }  
}  
add\_action('woocommerce\_check\_cart\_items', 'dc\_validate\_cart\_city\_compatibility');  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
    dc\_validate\_cart\_city\_compatibility();  
}, 10, 2);

/\* \================== Forzar guardar NOMBRE de la ciudad en la orden \================== \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // Billing city  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    // Shipping city  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\* \============ Opcional: también guardar NOMBRE en el perfil del cliente \============ \*/  
add\_action('woocommerce\_checkout\_update\_customer', function( $customer, $data ){  
    if ( isset($data\['billing\_city'\]) && is\_numeric($data\['billing\_city'\]) ) {  
        $term \= get\_term( (int) $data\['billing\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    if ( isset($data\['shipping\_city'\]) && is\_numeric($data\['shipping\_city'\]) ) {  
        $term \= get\_term( (int) $data\['shipping\_city'\], DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $customer-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

/\*\*  
 \* \================== Envío por ciudad (usa meta 'precio\_de\_envio') \==================  
 \*/

/\*\* Helpers toggle "Enviar a otra dirección" \*/  
function dc\_is\_truthy($v): bool {  
    if ($v \=== null) return false;  
    $v \= is\_string($v) ? strtolower(trim($v)) : $v;  
    return $v \=== 1 || $v \=== true || $v \=== '1' || $v \=== 'true' || $v \=== 'yes' || $v \=== 'on' || $v \=== 'y';  
}  
function dc\_ship\_to\_different\_enabled(): bool {  
    if ( isset($\_POST\['ship\_to\_different\_address'\]) ) {  
        return dc\_is\_truthy($\_POST\['ship\_to\_different\_address'\]);  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $val \= WC()-\>checkout-\>get\_value('ship\_to\_different\_address');  
        if ($val \!== null && $val \!== '') {  
            return dc\_is\_truthy($val);  
        }  
    }  
    if ( function\_exists('WC') && WC()-\>customer ) {  
        $has\_shipping \= (bool) WC()-\>customer-\>get\_shipping\_first\_name();  
        return $has\_shipping;  
    }  
    return false;  
}

/\*\* Prioriza siempre shipping\_city si el toggle está activo; si no, usa billing; luego cookie. \*/  
function dc\_get\_selected\_city\_for\_shipping(): ?int {  
    $ship\_diff \= dc\_ship\_to\_different\_enabled();

    if ( $ship\_diff ) {  
        if ( isset($\_POST\['shipping\_city'\]) && is\_numeric($\_POST\['shipping\_city'\]) ) {  
            return (int) $\_POST\['shipping\_city'\];  
        }  
        if ( function\_exists('WC') && WC()-\>checkout ) {  
            $sc \= WC()-\>checkout-\>get\_value('shipping\_city');  
            if ( is\_numeric($sc) ) return (int) $sc;  
        }  
        if ( function\_exists('WC') && WC()-\>checkout ) {  
            $bc \= WC()-\>checkout-\>get\_value('billing\_city');  
            if ( is\_numeric($bc) ) return (int) $bc;  
        }  
        $cookie\_city \= dc\_get\_selected\_city\_id();  
        return $cookie\_city ?: null;  
    }

    if ( isset($\_POST\['billing\_city'\]) && is\_numeric($\_POST\['billing\_city'\]) ) {  
        return (int) $\_POST\['billing\_city'\];  
    }  
    if ( function\_exists('WC') && WC()-\>checkout ) {  
        $bc \= WC()-\>checkout-\>get\_value('billing\_city');  
        if ( is\_numeric($bc) ) return (int) $bc;  
    }  
    $cookie\_city \= dc\_get\_selected\_city\_id();  
    return $cookie\_city ?: null;  
}

/\*\* Lee y normaliza el meta 'precio\_de\_envio' del término de ciudad. \*/  
function dc\_get\_city\_shipping\_price( int $city\_term\_id ): ?float {  
    if ( $city\_term\_id \<= 0 ) return null;

    $raw \= get\_term\_meta( $city\_term\_id, 'precio\_de\_envio', true );  
    if ( $raw \=== '' || $raw \=== null ) {  
        $raw \= get\_term\_meta( $city\_term\_id, 'precio\_envio', true );  
        if ( $raw \=== '' || $raw \=== null ) return null;  
    }

    $raw \= is\_string($raw) ? $raw : (string) $raw;  
    $raw \= str\_replace(\[' ', ' '\], '', $raw); // quita espacios y nbsp

    if ( strpos($raw, ',') \!== false && strpos($raw, '.') \!== false ) {  
        $raw \= str\_replace('.', '', $raw);  
        $raw \= str\_replace(',', '.', $raw);  
    } elseif ( strpos($raw, ',') \!== false ) {  
        $raw \= str\_replace(',', '.', $raw);  
    }

    $raw \= preg\_replace('/\[^0-9.\]/', '', $raw);  
    if ($raw \=== '' ) return null;

    $val \= (float) $raw;  
    if ( $val \< 0 ) $val \= 0.0;  
    return is\_finite($val) ? $val : null;  
}

/\*\* Sobrescribe costo de 'flat\_rate' con el precio de la ciudad. \*/  
add\_filter('woocommerce\_package\_rates', function( $rates, $package ){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return $rates;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) return $rates;

    $taxes \= \[\];  
    if ( wc\_tax\_enabled() ) {  
        $tax\_rates \= WC\_Tax::get\_shipping\_tax\_rates();  
        $taxes     \= WC\_Tax::calc\_shipping\_tax( $price, $tax\_rates );  
    }

    $city\_term \= get\_term( (int) $city\_id, DC\_TAX );  
    $city\_name \= ( $city\_term && \! is\_wp\_error($city\_term) ) ? $city\_term-\>name : '';

    foreach ( $rates as $rate\_id \=\> $rate ) {  
        if ( \! $rate instanceof WC\_Shipping\_Rate ) continue;  
        if ( $rate-\>get\_method\_id() \!== 'flat\_rate' ) continue;

        if ( method\_exists($rate, 'set\_cost') ) { $rate-\>set\_cost( $price ); } else { $rate-\>cost \= $price; }  
        if ( method\_exists($rate, 'set\_taxes') ) { $rate-\>set\_taxes( $taxes ); } else { $rate-\>taxes \= $taxes; }

        if ( $city\_name && method\_exists($rate, 'set\_label') ) {  
            $label \= $rate-\>get\_label();  
            if ( stripos($label, $city\_name) \=== false ) {  
                $rate-\>set\_label( sprintf('%s (%s)', $label, $city\_name) );  
            }  
        }  
    }  
    return $rates;  
}, 30, 2);

/\*\* Aviso si no hay tarifa configurada para la ciudad elegida. \*/  
add\_action('woocommerce\_check\_cart\_items', function(){  
    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) return;

    $price \= dc\_get\_city\_shipping\_price( (int) $city\_id );  
    if ( $price \=== null ) {  
        $term \= get\_term( (int) $city\_id, DC\_TAX );  
        $name \= ($term && \! is\_wp\_error($term)) ? $term-\>name : \_\_('ciudad seleccionada', 'dc');  
        wc\_add\_notice(  
            sprintf(\_\_('No hay tarifa de envío configurada para %s. Por favor, selecciona otra ciudad o contacta soporte.', 'dc'), esc\_html($name)),  
            'notice'  
        );  
    }  
});

/\*\*  
 \* Verifica si el término de ciudad corresponde a Bogotá (Cundinamarca)  
 \* usando los slugs indicados: depto 25, ciudad 11001\.  
 \*/  
function dc\_is\_bogota\_cundinamarca\_city( int $city\_term\_id ): bool {  
    if ( $city\_term\_id \<= 0 ) return false;

    $city \= get\_term( $city\_term\_id, DC\_TAX );  
    if ( \! $city || is\_wp\_error( $city ) ) return false;

    // Bogotá \-\> slug 11001  
    if ( (string) $city-\>slug \!== '11001' ) return false;

    if ( empty( $city-\>parent ) ) return false;

    $dept \= get\_term( (int) $city-\>parent, DC\_TAX );  
    if ( \! $dept || is\_wp\_error( $dept ) ) return false;

    // Cundinamarca \-\> slug 25  
    return (string) $dept-\>slug \=== '25';  
}

/\*\*  
 \* Añade opción de envío "Retiro en tienda" (gratis) solo para Bogotá (Cundinamarca).  
 \*/  
add\_filter('woocommerce\_package\_rates', function( $rates, $package ) {

    if ( \! function\_exists('WC') ) {  
        return $rates;  
    }

    $city\_id \= dc\_get\_selected\_city\_for\_shipping();  
    if ( \! $city\_id ) {  
        return $rates;  
    }

    // Solo si la ciudad es Bogotá (Cundinamarca)  
    if ( \! dc\_is\_bogota\_cundinamarca\_city( (int) $city\_id ) ) {  
        return $rates;  
    }

    // ID único del método de envío  
    $rate\_id \= 'dc\_retiro\_tienda';

    // Evitar duplicados si algún otro filtro ya lo añadió  
    if ( isset( $rates\[ $rate\_id \] ) ) {  
        return $rates;  
    }

    // Crear el método de envío "Retiro en tienda" con costo 0 y sin impuestos  
    $label      \= \_\_('Retiro en tienda', 'dc');  
    $cost       \= 0;  
    $taxes      \= \[\]; // Sin impuestos  
    $method\_id  \= 'dc\_retiro\_tienda'; // method\_id personalizado

    $pickup\_rate \= new WC\_Shipping\_Rate(  
        $rate\_id,    // rate\_id (clave única)  
        $label,      // etiqueta visible  
        $cost,       // costo  
        $taxes,      // impuestos  
        $method\_id   // method\_id  
    );

    // Lo agregamos al array de rates  
    $rates\[ $rate\_id \] \= $pickup\_rate;

    return $rates;  
}, 50, 2);

/\*\*  
 \* Indica si el usuario ha seleccionado el método "Retiro en tienda".  
 \*/  
function dc\_is\_retiro\_tienda\_selected(): bool {  
    // 1\) Revisar en la sesión de Woo  
    if ( function\_exists('WC') && WC()-\>session ) {  
        $chosen \= WC()-\>session-\>get('chosen\_shipping\_methods');  
        if ( is\_array($chosen) ) {  
            foreach ( $chosen as $m ) {  
                if ( strpos( (string) $m, 'dc\_retiro\_tienda' ) \=== 0 ) {  
                    return true;  
                }  
            }  
        }  
    }

    // 2\) Revisar el POST por si acaso  
    if ( \! empty($\_POST\['shipping\_method'\]) && is\_array($\_POST\['shipping\_method'\]) ) {  
        foreach ( $\_POST\['shipping\_method'\] as $m ) {  
            if ( strpos( (string) $m, 'dc\_retiro\_tienda' ) \=== 0 ) {  
                return true;  
            }  
        }  
    }

    return false;  
}

add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // Billing city  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name );  
        }  
    }  
    // Shipping city  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name );  
        }  
    }  
}, 20, 2);

add\_action('woocommerce\_checkout\_create\_order', function( $order, $data ){  
    // \--- BILLING CITY: guardar nombre de la ciudad \---  
    $billing\_city \= $data\['billing\_city'\] ?? ($\_POST\['billing\_city'\] ?? null);  
    if ( is\_numeric($billing\_city) ) {  
        $term \= get\_term( (int) $billing\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_billing\_city( $term-\>name );  
        }  
    }

    // \--- SHIPPING CITY: guardar nombre de la ciudad por defecto \---  
    $shipping\_city \= $data\['shipping\_city'\] ?? ($\_POST\['shipping\_city'\] ?? null);  
    if ( is\_numeric($shipping\_city) ) {  
        $term \= get\_term( (int) $shipping\_city, DC\_TAX );  
        if ( $term && \! is\_wp\_error($term) ) {  
            $order-\>set\_shipping\_city( $term-\>name );  
        }  
    }

    /\*\*  
     \* Si el cliente seleccionó "Retiro en tienda",  
     \* forzamos la dirección de envío a:  
     \*   CR 28 86-23 POLO, Bogotá  
     \*/  
    if ( dc\_is\_retiro\_tienda\_selected() ) {

        // Intentamos tomar el nombre de la ciudad desde el término  
        $city\_id   \= dc\_get\_selected\_city\_for\_shipping();  
        $city\_term \= $city\_id ? get\_term( (int) $city\_id, DC\_TAX ) : null;  
        $city\_name \= ( $city\_term && \! is\_wp\_error($city\_term) ) ? $city\_term-\>name : 'Bogotá';

        $order-\>set\_shipping\_address\_1( 'CR 28 86-23 POLO' );  
        // Deja address\_2 vacío o ajústalo si quieres algo extra  
        $order-\>set\_shipping\_address\_2( '' );  
        $order-\>set\_shipping\_city( $city\_name );           // normalmente "Bogotá"  
        $order-\>set\_shipping\_state( 'Cundinamarca' );      // puedes usar el nombre o el código según tu setup  
        // Si manejas código postal para esa sede, puedes ponerlo aquí  
        // $order-\>set\_shipping\_postcode( '111111' );  
    }  
}, 20, 2);

# 35 \- Receta médica condicional en checkout

**35 \- Receta médica condicional en checkout**

/\*\*  
 \* Receta médica condicional en checkout (con pre-subida por AJAX)  
 \*/

if ( \! defined('ABSPATH') ) exit;

const CL\_RX\_META\_KEY   \= '\_needs\_rx';  
const CL\_RX\_FIELD\_KEY  \= 'cl\_rx\_upload';  
const CL\_RX\_HIDDEN\_KEY \= 'cl\_rx\_attachment\_id';

/\*\* ¿El carrito requiere receta? \*/  
function cl\_rx\_cart\_requires\_prescription(): bool {  
	if ( is\_admin() && \! defined('DOING\_AJAX') ) return false;  
	if ( \! WC()-\>cart ) return false;

	foreach ( WC()-\>cart-\>get\_cart() as $item ) {  
		$product \= $item\['data'\] ?? null;  
		if ( \! $product ) continue;

		$raw \= get\_post\_meta( $product-\>get\_id(), CL\_RX\_META\_KEY, true );  
		$val \= is\_string($raw) ? strtolower(trim($raw)) : $raw;  
		if ( $val \=== true || $val \=== 'true' || $val \=== 'yes' || $val \=== '1' || $val \=== 'on' || $val \=== 1 ) {  
			return true;  
		}  
	}  
	return false;  
}

/\*\* Pintar el campo file (una sola vez) debajo de "Notas del pedido" \*/  
function cl\_rx\_render\_field\_once(){  
	static $printed \= false;  
	if ( $printed ) return; $printed \= true;

	$requires \= cl\_rx\_cart\_requires\_prescription();  
	?\>  
	\<p class="form-row form-row-wide thwcfe-input-field-wrapper" id="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>\_field"\>  
		\<label for="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>"\>  
			\<?php esc\_html\_e('Fórmula médica (PDF/JPG/PNG)', 'cl'); ?\>  
			\<?php if ( $requires ): ?\>\<abbr class="required" title="obligatorio"\>\*\</abbr\>\<?php endif; ?\>  
		\</label\>  
		\<span class="woocommerce-input-wrapper"\>  
			\<input  
				type="file"  
				class="input-text thwcfe-input-field"  
				name="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>"  
				id="\<?php echo esc\_attr(CL\_RX\_FIELD\_KEY); ?\>"  
				accept="application/pdf,image/jpeg,image/png"  
				\<?php echo $requires ? 'required' : ''; ?\>  
			/\>  
			\<input type="hidden" name="\<?php echo esc\_attr(CL\_RX\_HIDDEN\_KEY); ?\>" id="\<?php echo esc\_attr(CL\_RX\_HIDDEN\_KEY); ?\>" value=""\>  
			\<small id="cl-rx-msg" class="description"\>  
				\<?php echo $requires  
					? esc\_html\_\_('Obligatorio: adjunta la fórmula debido a productos con prescripción.', 'cl')  
					: esc\_html\_\_('Sólo se solicitará si el pedido contiene productos con prescripción.', 'cl'); ?\>  
			\</small\>  
		\</span\>  
	\</p\>  
	\<?php  
}  
add\_action('woocommerce\_after\_order\_notes', 'cl\_rx\_render\_field\_once', 10);  
add\_action('woocommerce\_checkout\_after\_customer\_details', 'cl\_rx\_render\_field\_once', 99);

/\*\* JS: forzar multipart, subir archivo por wc-ajax, mover el campo arriba del checkbox y manejar UI \*/  
add\_action('wp\_footer', function(){  
	if ( \! is\_checkout() ) return;  
	$needs \= cl\_rx\_cart\_requires\_prescription() ? 'true' : 'false';  
	?\>  
	\<script\>  
	(function($){  
		function ensureMultipart(){  
			var f \= document.querySelector('form.checkout');  
			if (f){  
				f.setAttribute('enctype', 'multipart/form-data');  
				f.setAttribute('encoding', 'multipart/form-data');  
			}  
		}  
		function ajaxUrl(endpoint){  
			if (window.wc\_checkout\_params && wc\_checkout\_params.wc\_ajax\_url){  
				return wc\_checkout\_params.wc\_ajax\_url.toString().replace('%%endpoint%%', endpoint);  
			}  
			return (window.location.origin || '') \+ '/?wc-ajax=' \+ endpoint;  
		}  
		function setMsg(text, isError){  
			var el \= document.getElementById('cl-rx-msg');  
			if(\!el) return;  
			el.textContent \= text || '';  
			el.style.color \= isError ? 'red' : '';  
		}

		// \=== NUEVO: reubicar el campo justo arriba del checkbox «¿Enviar a otra dirección?» \===  
		function relocateField(){  
			var field  \= document.getElementById('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>\_field');  
			var target \= document.querySelector('.woocommerce-shipping-fields \#ship-to-different-address');  
			if (field && target && target.parentNode){  
				// Mueve (no clona) el nodo para que quede arriba del H3 (y, por tanto, arriba del checkbox)  
				target.parentNode.insertBefore(field, target);  
			}  
		}

		function toggleUI(){  
			ensureMultipart();  
			var field \= document.getElementById('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>\_field');  
			if(field) field.style.display \= (\<?php echo $needs; ?\>) ? '' : 'none';

			// Deshabilitar "Realizar pedido" si requiere y no hay attachment\_id  
			var must  \= (\<?php echo $needs; ?\>);  
			var hid   \= document.getElementById('\<?php echo esc\_js(CL\_RX\_HIDDEN\_KEY); ?\>');  
			var btn   \= document.getElementById('place\_order');  
			if (btn){  
				if (must && (\!hid || \!hid.value)){  
					btn.setAttribute('disabled','disabled');  
				} else {  
					btn.removeAttribute('disabled');  
				}  
			}  
		}

		function bindUpload(){  
			var input \= document.getElementById('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>');  
			var hidden= document.getElementById('\<?php echo esc\_js(CL\_RX\_HIDDEN\_KEY); ?\>');  
			if(\!input) return;

			input.removeEventListener('change', window.\_\_cl\_rx\_on\_change || function(){});  
			window.\_\_cl\_rx\_on\_change \= function(){  
				setMsg('', false);  
				if (\!input.files || \!input.files\[0\]) { if(hidden) hidden.value=''; toggleUI(); return; }

				var file \= input.files\[0\];  
				var okTypes \= \['application/pdf','image/jpeg','image/png'\];  
				if (okTypes.indexOf(file.type) \=== \-1){  
					setMsg('Formato no permitido. Sube PDF, JPG o PNG.', true);  
					input.value \= '';  
					if(hidden) hidden.value='';  
					toggleUI();  
					return;  
				}  
				if (file.size \> 10 \* 1024 \* 1024){  
					setMsg('El archivo supera 10MB. Reduce el tamaño e inténtalo de nuevo.', true);  
					input.value \= '';  
					if(hidden) hidden.value='';  
					toggleUI();  
					return;  
				}

				var fd \= new FormData();  
				fd.append('\<?php echo esc\_js(CL\_RX\_FIELD\_KEY); ?\>', file);

				setMsg('Cargando archivo...', false);  
				var btn \= document.getElementById('place\_order'); if(btn) btn.setAttribute('disabled','disabled');

				$.ajax({  
					url: ajaxUrl('cl\_rx\_upload'),  
					type: 'POST',  
					data: fd,  
					contentType: false,  
					processData: false,  
					success: function(resp){  
						if (resp && resp.success && resp.data && resp.data.attachment\_id){  
							if(hidden) hidden.value \= resp.data.attachment\_id;  
							setMsg('Archivo cargado correctamente.', false);  
						} else {  
							var msg \= (resp && resp.data && resp.data.message) ? resp.data.message : 'Error al subir el archivo.';  
							setMsg(msg, true);  
							if(hidden) hidden.value='';  
							input.value='';  
						}  
					},  
					error: function(){  
						setMsg('Error de red al subir el archivo.', true);  
						if(hidden) hidden.value='';  
						input.value='';  
					},  
					complete: function(){  
						toggleUI();  
					}  
				});  
			};  
			input.addEventListener('change', window.\_\_cl\_rx\_on\_change);  
		}

		// Orden: reubicar \-\> ajustar UI \-\> enlazar subida  
		function initCycle(){  
			relocateField();  
			toggleUI();  
			bindUpload();  
		}

		document.addEventListener('DOMContentLoaded', initCycle);  
		jQuery(document.body).on('updated\_checkout', initCycle);  
	})(jQuery);  
	\</script\>  
	\<?php  
});

/\*\* VALIDACIÓN servidor: si requiere, debe existir attachment\_id en POST \*/  
add\_action('woocommerce\_after\_checkout\_validation', function( $data, $errors ){  
	if ( \! cl\_rx\_cart\_requires\_prescription() ) return;

	$att\_id \= isset($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) ? absint($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) : 0;  
	if ( \! $att\_id || get\_post\_type($att\_id) \!== 'attachment' ) {  
		$errors-\>add('cl\_rx\_missing', \_\_('Debes adjuntar la fórmula médica para continuar.', 'cl'));  
	}  
}, 10, 2);

/\*\* CREAR PEDIDO: guarda el attachment\_id ya subido \*/  
add\_action('woocommerce\_checkout\_create\_order', function( $order ){  
	if ( \! cl\_rx\_cart\_requires\_prescription() ) return;

	$att\_id \= isset($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) ? absint($\_POST\[ CL\_RX\_HIDDEN\_KEY \]) : 0;  
	if ( \! $att\_id ) return;

	// Actualiza título y parent del attachment  
	wp\_update\_post(array(  
		'ID'          \=\> $att\_id,  
		'post\_title'  \=\> sprintf( 'Fórmula médica – Pedido \#%s', $order-\>get\_order\_number() ),  
		'post\_parent' \=\> $order-\>get\_id(),  
	));

	$url \= wp\_get\_attachment\_url($att\_id);  
	$order-\>update\_meta\_data('\_cl\_rx\_attachment\_id', $att\_id);  
	$order-\>update\_meta\_data('\_cl\_rx\_attachment\_url', esc\_url\_raw($url));  
}, 20);

/\*\* Chip UX en carrito \*/  
add\_filter('woocommerce\_cart\_item\_name', function( $name, $cart\_item ){  
	$product \= $cart\_item\['data'\] ?? null;  
	if ( \! $product ) return $name;  
	$raw \= get\_post\_meta( $product-\>get\_id(), CL\_RX\_META\_KEY, true );  
	$val \= is\_string($raw) ? strtolower(trim($raw)) : $raw;  
	if ( $val \=== true || $val \=== 'true' || $val \=== 'yes' || $val \=== '1' || $val \=== 'on' || $val \=== 1 ) {  
		$name .= '\<br\>\<small style="margin-top:4px;padding:2px 6px;border:1px solid currentColor;border-radius:4px"\>'  
		       . esc\_html\_\_('Requiere fórmula médica', 'cl') . '\</small\>';  
	}  
	return $name;  
}, 10, 2);

/\*\* Enlace en admin \*/  
add\_action('woocommerce\_admin\_order\_data\_after\_billing\_address', function( $order ){  
	$att\_id  \= $order-\>get\_meta('\_cl\_rx\_attachment\_id');  
	$att\_url \= $order-\>get\_meta('\_cl\_rx\_attachment\_url');  
	$url     \= $att\_url ?: ( $att\_id ? wp\_get\_attachment\_url($att\_id) : '' );  
	if ( $url ) {  
		echo '\<p\>\<strong\>' . esc\_html\_\_('Fórmula médica:', 'cl') . '\</strong\> '  
		   . '\<a href="' . esc\_url($url) . '" target="\_blank" rel="noopener"\>' . esc\_html\_\_('Ver archivo', 'cl') . '\</a\>\</p\>';  
	}  
});

/\*\* Enlace en “Mi cuenta \> Pedido” \*/  
add\_action('woocommerce\_order\_details\_after\_order\_table', function( $order ){  
	$att\_id  \= $order-\>get\_meta('\_cl\_rx\_attachment\_id');  
	$att\_url \= $order-\>get\_meta('\_cl\_rx\_attachment\_url');  
	$url     \= $att\_url ?: ( $att\_id ? wp\_get\_attachment\_url($att\_id) : '' );  
	if ( $url ) {  
		echo '\<p\>\<strong\>' . esc\_html\_\_('Fórmula médica enviada:', 'cl') . '\</strong\> '  
		   . '\<a href="' . esc\_url($url) . '" target="\_blank" rel="noopener"\>' . esc\_html\_\_('Descargar', 'cl') . '\</a\>\</p\>';  
	}  
});

/\*\* Enlace en emails \*/  
add\_filter('woocommerce\_email\_order\_meta\_fields', function( $fields, $sent\_to\_admin, $order ){  
	$att\_id  \= $order-\>get\_meta('\_cl\_rx\_attachment\_id');  
	$att\_url \= $order-\>get\_meta('\_cl\_rx\_attachment\_url');  
	$url     \= $att\_url ?: ( $att\_id ? wp\_get\_attachment\_url($att\_id) : '' );  
	if ( $url ) {  
		$fields\['cl\_rx\_link'\] \= array(  
			'label' \=\> \_\_('Fórmula médica', 'cl'),  
			'value' \=\> '\<a href="' . esc\_url($url) . '"\>' . esc\_html\_\_('Ver archivo', 'cl') . '\</a\>',  
		);  
	}  
	return $fields;  
}, 10, 3);

/\*\* \==== WC-AJAX: subir archivo y crear attachment \==== \*/  
add\_action('wc\_ajax\_cl\_rx\_upload', 'cl\_rx\_ajax\_upload');  
add\_action('wc\_ajax\_nopriv\_cl\_rx\_upload', 'cl\_rx\_ajax\_upload');  
function cl\_rx\_ajax\_upload(){  
	// Valida existencia  
	if ( empty($\_FILES\[ CL\_RX\_FIELD\_KEY \]) || empty($\_FILES\[ CL\_RX\_FIELD\_KEY \]\['name'\]) ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('No se recibió archivo.', 'cl') ) );  
	}

	$file \= $\_FILES\[ CL\_RX\_FIELD\_KEY \];

	// Validar tipo y tamaño  
	$allowed\_mimes \= array('application/pdf','image/jpeg','image/png');  
	if ( empty($file\['type'\]) || \! in\_array($file\['type'\], $allowed\_mimes, true) ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('Formato no permitido. Sube PDF, JPG o PNG.', 'cl') ) );  
	}  
	if ( \! empty($file\['size'\]) && $file\['size'\] \> 10 \* 1024 \* 1024 ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('El archivo supera 10MB.', 'cl') ) );  
	}

	require\_once ABSPATH . 'wp-admin/includes/file.php';  
	require\_once ABSPATH . 'wp-admin/includes/media.php';  
	require\_once ABSPATH . 'wp-admin/includes/image.php';

	$upload \= wp\_handle\_upload( $file, array( 'test\_form' \=\> false ) );  
	if ( isset($upload\['error'\]) ) {  
		wp\_send\_json\_error( array( 'message' \=\> $upload\['error'\] ) );  
	}

	$attachment\_id \= wp\_insert\_attachment( array(  
		'post\_mime\_type' \=\> $upload\['type'\],  
		'post\_title'     \=\> 'Fórmula médica (pre-subida)',  
		'post\_content'   \=\> '',  
		'post\_status'    \=\> 'inherit',  
	), $upload\['file'\] );

	if ( is\_wp\_error($attachment\_id) ) {  
		wp\_send\_json\_error( array( 'message' \=\> \_\_('No se pudo crear el adjunto.', 'cl') ) );  
	}

	wp\_update\_attachment\_metadata( $attachment\_id, wp\_generate\_attachment\_metadata( $attachment\_id, $upload\['file'\] ) );  
	wp\_send\_json\_success( array(  
		'attachment\_id' \=\> $attachment\_id,  
		'url'           \=\> $upload\['url'\],  
	) );  
}

# 36 \- Rediret Temp

**36 \- Rediret Temp**

/\*\*  
 \* Redirige TODO el sitio hacia una página específica,  
 \* excepto administradores, usuarios en whitelist y páginas excluidas.  
 \*/  
add\_action('template\_redirect', function () {

    /\* \========= CONFIGURACIÓN \========= \*/

    // ID de la página a la que quieres redirigir  
    $redirect\_page\_id \= 17298; // \<--- CAMBIAR AQUÍ

    // IDs de usuarios que NO deben ser redirigidos  
    $whitelisted\_users \= \[  
        10, 22, 19, 21, 14, 20  
    \];

    // Páginas excluidas (por ID)  
    $excluded\_page\_ids \= \[  
        4337  
    \];

    // Páginas excluidas por slug  
    $excluded\_page\_slugs \= \[  
        'contacto',  
        'gracias',  
        'carrito'  
    \];

    /\* \========= FIN CONFIGURACIÓN \========= \*/

    // Protección básica  
    if (\! $redirect\_page\_id) return;

    // Evitar afectar admin, AJAX, cron, login  
    if (  
        is\_admin() ||  
        wp\_doing\_ajax() ||  
        defined('DOING\_CRON') ||  
        is\_user\_login\_page()  
    ) {  
        return;  
    }

    // Evitar bucle: la página destino NO se redirige  
    if ( is\_page( $redirect\_page\_id ) ) return;

    // EXCLUSIÓN por ID  
    if ( \!empty($excluded\_page\_ids) && is\_page($excluded\_page\_ids) ) {  
        return;  
    }

    // EXCLUSIÓN por slug  
    if ( \!empty($excluded\_page\_slugs) ) {  
        $current\_slug \= basename(get\_permalink());  
        if ( in\_array($current\_slug, $excluded\_page\_slugs, true) ) {  
            return;  
        }  
    }

    // Obtener usuario  
    $user\_id \= get\_current\_user\_id();

    // Whitelist → NO redirigir  
    if ( $user\_id && in\_array($user\_id, $whitelisted\_users, true) ) {  
        return;  
    }

    // Si no está logueado → redirección  
    if ( \! is\_user\_logged\_in() ) {  
        wp\_safe\_redirect( get\_permalink( $redirect\_page\_id ) );  
        exit;  
    }

    // Si está logueado pero NO es admin → redirección  
    if ( \! current\_user\_can('administrator') ) {  
        wp\_safe\_redirect( get\_permalink( $redirect\_page\_id ) );  
        exit;  
    }  
});

/\*\*  
 \* Detectar si se está en wp-login.php  
 \*/  
function is\_user\_login\_page() {  
    return in\_array( $GLOBALS\['pagenow'\], \[ 'wp-login.php', 'wp-register.php' \], true );  
}  
