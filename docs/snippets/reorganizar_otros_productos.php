<?php
/**
 * Uncategorized Products Fixer
 * 
 * Instrucciones:
 * 1. Instala el plugin "Code Snippets" en tu WordPress o agrega esto al functions.php de tu tema hijo.
 * 2. Ejecuta la función visitando tu sitio web con el parámetro: ?run_fix_cats=true
 *    Ejemplo: https://tienda.pharmaplus.com.co/?run_fix_cats=true
 * 3. Una vez veas el mensaje de éxito, borra este código para seguridad.
 */

add_action('init', 'antigravity_reorganize_products');

function antigravity_reorganize_products() {
    if (!isset($_GET['run_fix_cats']) || $_GET['run_fix_cats'] !== 'true') {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('No tienes permisos para ejecutar esto.');
    }

    // --- CONFIGURATION ---
    $source_cat_id = 3391; // OTROS PRODUCTOS
    $parent_meds_id = 289; // SALUD Y MEDICAMENTOS
    
    // Destinations
    $dest_solar_id = 306; // PROTECCION SOLAR
    $dest_exfoliantes_id = 319; // EXFOLIANTES (Facial)
    $dest_capilar_id = 3410; // ANTICAIDA (Capilar)
    
    // 1. Ensure "Medicamentos Especializados" exists
    $new_cat_name = 'Medicamentos Especializados';
    $new_cat_slug = 'medicamentos-especializados';
    
    $term = term_exists($new_cat_slug, 'product_cat');
    if ($term !== 0 && $term !== null) {
        $dest_special_meds_id = $term['term_id'];
    } else {
        $new_term = wp_insert_term($new_cat_name, 'product_cat', array(
            'parent' => $parent_meds_id,
            'slug' => $new_cat_slug
        ));
        if (is_wp_error($new_term)) {
            wp_die('Error creando categoría: ' . $new_term->get_error_message());
        }
        $dest_special_meds_id = $new_term['term_id'];
    }

    // 2. Fetch Products from "OTROS PRODUCTOS"
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => -1, // All of them
        'tax_query' => array(
            array(
                'taxonomy' => 'product_cat',
                'field' => 'term_id',
                'terms' => $source_cat_id,
            ),
        ),
    );

    $products = get_posts($args);
    $log = [];
    $count = 0;

    foreach ($products as $post) {
        $name_upper = strtoupper($post->post_title);
        $new_cat = null;

        // --- CLASSIFICATION LOGIC ---
        
        // A. Dermo / Belleza
        if (strpos($name_upper, 'SUNLAT') !== false) {
            $new_cat = $dest_solar_id;
        } elseif (strpos($name_upper, 'ALSACE') !== false) {
            if (strpos($name_upper, 'EXFOLIANTE') !== false || strpos($name_upper, 'SCRUB') !== false) {
                $new_cat = $dest_exfoliantes_id;
            } else {
                $new_cat = 299; // Cuidado Facial General (Fallback for Alsace)
            }
        } elseif (strpos($name_upper, 'TRICOVIT') !== false) {
            $new_cat = $dest_capilar_id;
        }
        
        // B. Medicamentos Alto Costo / Especializados
        // Lista basada en la muestra: Emgality, Nuvaring, Implanon, Trodelvy, Vemlidy, Epclusa, Truvada, Descovy, Complera, Odefsey, Stribild
        elseif (
            strpos($name_upper, 'EMGALITY') !== false ||
            strpos($name_upper, 'NUVARING') !== false ||
            strpos($name_upper, 'IMPLANON') !== false ||
            strpos($name_upper, 'TRODELVY') !== false ||
            strpos($name_upper, 'VEMLIDY') !== false ||
            strpos($name_upper, 'EPCLUSA') !== false ||
            strpos($name_upper, 'TRUVADA') !== false ||
            strpos($name_upper, 'DESCOVY') !== false ||
            strpos($name_upper, 'COMPLERA') !== false ||
            strpos($name_upper, 'ODEFSEY') !== false ||
            strpos($name_upper, 'STRIBILD') !== false
        ) {
            $new_cat = $dest_special_meds_id;
        }

        // --- EXECUTE MOVE ---
        if ($new_cat) {
            // Replace categories (append = false)
            wp_set_object_terms($post->ID, [(int)$new_cat], 'product_cat');
            $log[] = "Movido: {$post->post_title} -> ID {$new_cat}";
            $count++;
        } else {
            // Optional: Move remaining to "Medicamentos" generic if they don't match rules?
            // For safety, we skip them so you can review manually.
            $log[] = "Saltado (Sin coincidencia): {$post->post_title}";
        }
    }

    echo "<h1>Reporte de Reorganización</h1>";
    echo "<p>Total procesados: " . count($products) . "</p>";
    echo "<p>Total movidos: " . $count . "</p>";
    echo "<ul>";
    foreach ($log as $entry) {
        echo "<li>{$entry}</li>";
    }
    echo "</ul>";
    die(); // Stop remaining loading
}
