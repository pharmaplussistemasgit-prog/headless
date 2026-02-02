const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'docs', 'Departamentos_Ciudades_Masivo.csv');
const outputPath = path.join(__dirname, '..', 'lib', 'colombia-data.ts');

const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Manual corrections for the "Bogota" chaos in the CSV
const corrections = {
    'Negativa': 'Engativá',
    'Saquen': 'Usaquén',
    'Sume': 'Usme',
    'Osa': 'Bosa',
    'Bonafont': 'Fontibón',
    'Suba': 'Suba', // Keep
    'Bogota': 'Bogotá'
};

// Localities that should belong to BOGOTA D.C. (CO-DC) even if CSV says Cundinamarca
const bogotaLocalities = [
    'Engativá', 'Usaquén', 'Usme', 'Bosa', 'Fontibón', 'Suba', 'Bogotá', 'Chapinero', 'Kennedy', 'Teusaquillo', 'Barrios Unidos'
];

// ISO Mapping
const departmentMap = {
    '05': { iso: 'CO-ANT', name: 'Antioquia' },
    '08': { iso: 'CO-ATL', name: 'Atlántico' },
    '11': { iso: 'CO-DC', name: 'Bogotá D.C.' },
    '13': { iso: 'CO-BOL', name: 'Bolívar' },
    '15': { iso: 'CO-BOY', name: 'Boyacá' },
    '17': { iso: 'CO-CAL', name: 'Caldas' },
    '18': { iso: 'CO-CAQ', name: 'Caquetá' },
    '19': { iso: 'CO-CAU', name: 'Cauca' },
    '20': { iso: 'CO-CES', name: 'Cesar' },
    '23': { iso: 'CO-COR', name: 'Córdoba' },
    '25': { iso: 'CO-CUN', name: 'Cundinamarca' },
    '27': { iso: 'CO-CHO', name: 'Chocó' },
    '41': { iso: 'CO-HUI', name: 'Huila' },
    '44': { iso: 'CO-LAG', name: 'La Guajira' },
    '47': { iso: 'CO-MAG', name: 'Magdalena' },
    '50': { iso: 'CO-MET', name: 'Meta' },
    '52': { iso: 'CO-NAR', name: 'Nariño' },
    '54': { iso: 'CO-NSA', name: 'Norte de Santander' },
    '63': { iso: 'CO-QUI', name: 'Quindío' },
    '66': { iso: 'CO-RIS', name: 'Risaralda' },
    '68': { iso: 'CO-SAN', name: 'Santander' },
    '70': { iso: 'CO-SUC', name: 'Sucre' },
    '73': { iso: 'CO-TOL', name: 'Tolima' },
    '76': { iso: 'CO-VAC', name: 'Valle del Cauca' },
    '81': { iso: 'CO-ARA', name: 'Arauca' },
    '85': { iso: 'CO-CAS', name: 'Casanare' },
    '86': { iso: 'CO-PUT', name: 'Putumayo' },
    '88': { iso: 'CO-SAP', name: 'San Andrés y Providencia' },
    '91': { iso: 'CO-AMA', name: 'Amazonas' },
    '94': { iso: 'CO-GUA', name: 'Guainía' },
    '95': { iso: 'CO-GUV', name: 'Guaviare' },
    '97': { iso: 'CO-VAU', name: 'Vaupés' },
    '99': { iso: 'CO-VID', name: 'Vichada' }
};

const lines = csvContent.split('\n').slice(1); // Skip header

const cities = [];
const statesMap = new Map();
const isoToDane = {};

// Ensure Bogota exists in states even if not in CSV explicitly properly
statesMap.set('CO-DC', { code: 'CO-DC', name: 'Bogotá D.C.', daneCode: '11' });

lines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split(',');

    // CSV: Codigo Ciudad, Name, Dept Name, Dept Code, Value, Days
    const cityCode = parts[0];
    let cityName = parts[1];
    let deptName = parts[2];
    let deptCode = parts[3];

    // 1. Fix Typo Names
    if (corrections[cityName]) {
        cityName = corrections[cityName];
    }

    // 2. Determine Correct ISO/Dept
    let isoCode = '';
    let finalDeptName = '';

    // Special Rule for Bogota Localities -> Move to CO-DC
    if (bogotaLocalities.includes(cityName) || deptCode === '11') {
        isoCode = 'CO-DC';
        finalDeptName = 'Bogotá D.C.';
        deptCode = '11'; // Force DANE 11 for consistency
    } else {
        const mapping = departmentMap[deptCode.padStart(2, '0')];
        if (mapping) {
            isoCode = mapping.iso;
            finalDeptName = mapping.name;
        } else {
            console.warn(`Unknown Dept Code: ${deptCode} for ${cityName}`);
            return;
        }
    }

    if (!isoCode) return;

    // Add State if not exists
    if (!statesMap.has(isoCode)) {
        statesMap.set(isoCode, {
            code: isoCode,
            name: finalDeptName,
            daneCode: deptCode
        });
    }

    // Add City
    cities.push({
        code: cityCode,
        name: cityName,
        stateCode: isoCode,
        daneDeptCode: deptCode
    });

    isoToDane[isoCode] = deptCode;
});

// Sort
const sortedStates = Array.from(statesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
const sortedCities = cities.sort((a, b) => a.name.localeCompare(b.name));

// Generate File Content
const fileContent = `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from rules based on docs/Departamentos_Ciudades_Masivo.csv

export interface ColombiaState {
    code: string; // ISO Code (CO-ANT)
    name: string;
    daneCode: string;
}

export interface ColombiaCity {
    code: string;
    name: string;
    stateCode: string;
    daneDeptCode: string;
}

export const COLOMBIA_STATES: ColombiaState[] = ${JSON.stringify(sortedStates, null, 4)};

export const COLOMBIA_CITIES: ColombiaCity[] = ${JSON.stringify(sortedCities, null, 4)};

export const ISO_TO_DANE_MAP: Record<string, string> = ${JSON.stringify(isoToDane, null, 4)};
`;

fs.writeFileSync(outputPath, fileContent);
console.log('Successfully generated colombia-data.ts');
