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
