const fs = require('fs');
const path = require('path');

const sourceCsvPath = path.join(__dirname, '..', 'docs', 'Departamentos_Ciudades_Masivo.csv');
const targetCsvPath = path.join(__dirname, '..', 'data', 'shipping', 'costos-fletes.csv');

const csvContent = fs.readFileSync(sourceCsvPath, 'utf-8');

// Rules
const excludedLocalities = [
    'Negativa', 'Engativá', 'Saquen', 'Usaquén',
    'Sume', 'Usme', 'Osa', 'Bosa',
    'Bonafont', 'Fontibón', 'Suba', 'Chapinero',
    'Kennedy', 'Teusaquillo', 'Barrios Unidos'
];

const corrections = {
    'Bogota': 'Bogotá'
};

const lines = csvContent.split('\n');
const header = lines[0]; // Keep header: Codigo Ciudad,Term Name,Parent Name,Parent Slug,VALOR DOMICILIO,Dias de entrega

const newLines = [header];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = line.split(',');
    // 0: Code, 1: Name, 2: DeptName, 3: DeptCode, 4: Cost, 5: Days

    let cityCode = parts[0];
    let cityName = parts[1];
    let deptName = parts[2];
    let deptCode = parts[3];
    let cost = parts[4];
    let days = parts[5];

    // 1. Exclude
    if (excludedLocalities.includes(cityName)) continue;

    // 2. Fix Bogotá
    if (cityName === 'Bogota' || deptCode === '11') {
        cityName = 'Bogotá';
        deptCode = '11';
        deptName = 'Bogota D.C.'; // Normalized for CSV
        // Check if cityCode matches expected? Keep original 11001
        if (cityCode === '11001') {
            // ensure it's kept
        }
    }

    if (corrections[cityName]) {
        cityName = corrections[cityName];
    }

    // Reconstruct
    newLines.push(`${cityCode},${cityName},${deptName},${deptCode},${cost},${days}`);
}

// Ensure target dir exists
const targetDir = path.dirname(targetCsvPath);
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(targetCsvPath, newLines.join('\n'));
console.log(`Updated costos-fletes.csv with ${newLines.length} lines.`);
