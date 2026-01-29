/**
 * Script de verificación del mapeo ISO_TO_DANE_MAP
 * Verifica que todos los códigos ISO tengan su correspondiente código DANE en el CSV
 */

import { ISO_TO_DANE_MAP } from '../lib/colombia-data';
import { getAllStates, getCitiesByState } from '../lib/shipping-rates';

console.log('🔍 Verificando mapeo ISO_TO_DANE_MAP...\n');

// Obtener todos los departamentos del CSV
const csvStates = getAllStates();
console.log(`📊 Departamentos en CSV: ${csvStates.length}`);

// Verificar cada código ISO
const isoStates = Object.keys(ISO_TO_DANE_MAP);
console.log(`📊 Códigos ISO en mapeo: ${isoStates.length}\n`);

let errorsFound = 0;
let successCount = 0;

for (const isoCode of isoStates) {
    const daneCode = ISO_TO_DANE_MAP[isoCode];
    const cities = getCitiesByState(daneCode);

    if (cities.length === 0) {
        console.log(`❌ ${isoCode} -> ${daneCode}: No se encontraron ciudades`);
        errorsFound++;
    } else {
        console.log(`✅ ${isoCode} -> ${daneCode}: ${cities.length} ciudades encontradas`);
        successCount++;
    }
}

console.log(`\n📈 Resultados:`);
console.log(`   ✅ Exitosos: ${successCount}`);
console.log(`   ❌ Errores: ${errorsFound}`);

if (errorsFound === 0) {
    console.log('\n🎉 ¡Todos los códigos están correctamente mapeados!');
} else {
    console.log('\n⚠️  Se encontraron errores en el mapeo');
    process.exit(1);
}
