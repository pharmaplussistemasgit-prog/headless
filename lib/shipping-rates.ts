import fs from 'fs';
import path from 'path';

/**
 * Interfaz para las tarifas de envío
 */
export interface ShippingRate {
  cityCode: string;        // Código DANE de 5 dígitos (ej: "05001")
  cityName: string;        // Nombre de la ciudad (ej: "Medellin")
  stateName: string;       // Nombre del departamento (ej: "Antioquia")
  stateCode: string;       // Código del departamento (ej: "05")
  shippingCost: number;    // Costo del flete en pesos (ej: 12320)
  deliveryDays: number;    // Días estimados de entrega (ej: 1)
}

/**
 * Caché en memoria para las tarifas de envío
 */
let shippingRatesCache: ShippingRate[] | null = null;
let cityCodeIndex: Map<string, ShippingRate> | null = null;
let cityNameIndex: Map<string, ShippingRate[]> | null = null;

/**
 * Carga y parsea el archivo CSV de costos de fletes
 */
function loadShippingRates(): ShippingRate[] {
  if (shippingRatesCache) {
    return shippingRatesCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'shipping', 'costos-fletes.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Saltar el encabezado
    const dataLines = lines.slice(1);
    
    const rates: ShippingRate[] = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue; // Saltar líneas vacías
      
      // Parsear CSV (considerando que puede haber comas en los nombres)
      const parts = line.split(',');
      
      if (parts.length < 6) continue; // Saltar líneas incompletas
      
      const cityCode = parts[0].trim();
      const cityName = parts[1].trim();
      const stateName = parts[2].trim();
      const stateCode = parts[3].trim();
      const shippingCost = parseInt(parts[4].trim(), 10);
      const deliveryDays = parseInt(parts[5].trim(), 10);
      
      // Validar datos
      if (!cityCode || !cityName || isNaN(shippingCost) || isNaN(deliveryDays)) {
        continue;
      }
      
      rates.push({
        cityCode,
        cityName,
        stateName,
        stateCode,
        shippingCost,
        deliveryDays,
      });
    }
    
    shippingRatesCache = rates;
    
    // Crear índices para búsquedas rápidas
    buildIndexes(rates);
    
    console.log(`✅ [ShippingRates] Loaded ${rates.length} cities from CSV`);
    
    return rates;
  } catch (error) {
    console.error('❌ [ShippingRates] Error loading CSV:', error);
    return [];
  }
}

/**
 * Construye índices para búsquedas optimizadas
 */
function buildIndexes(rates: ShippingRate[]): void {
  // Índice por código de ciudad (búsqueda O(1))
  cityCodeIndex = new Map();
  for (const rate of rates) {
    cityCodeIndex.set(rate.cityCode, rate);
  }
  
  // Índice por nombre de ciudad (puede haber múltiples ciudades con el mismo nombre)
  cityNameIndex = new Map();
  for (const rate of rates) {
    const normalizedName = rate.cityName.toLowerCase().trim();
    const existing = cityNameIndex.get(normalizedName) || [];
    existing.push(rate);
    cityNameIndex.set(normalizedName, existing);
  }
}

/**
 * Obtiene la tarifa de envío por código de ciudad
 * @param cityCode - Código DANE de 5 dígitos
 * @returns ShippingRate o null si no se encuentra
 */
export function getShippingRateByCityCode(cityCode: string): ShippingRate | null {
  if (!cityCodeIndex) {
    loadShippingRates();
  }
  
  return cityCodeIndex?.get(cityCode) || null;
}

/**
 * Obtiene la tarifa de envío por nombre de ciudad
 * @param cityName - Nombre de la ciudad
 * @param stateName - Nombre del departamento (opcional, para desambiguar)
 * @returns ShippingRate o null si no se encuentra
 */
export function getShippingRateByCityName(
  cityName: string,
  stateName?: string
): ShippingRate | null {
  if (!cityNameIndex) {
    loadShippingRates();
  }
  
  const normalizedName = cityName.toLowerCase().trim();
  const matches = cityNameIndex?.get(normalizedName) || [];
  
  if (matches.length === 0) {
    return null;
  }
  
  // Si hay múltiples coincidencias y se proporciona el departamento, filtrar
  if (matches.length > 1 && stateName) {
    const normalizedState = stateName.toLowerCase().trim();
    const stateMatch = matches.find(
      (rate) => rate.stateName.toLowerCase().trim() === normalizedState
    );
    if (stateMatch) {
      return stateMatch;
    }
  }
  
  // Retornar la primera coincidencia
  return matches[0];
}

/**
 * Obtiene todas las ciudades
 * @returns Array de todas las tarifas de envío
 */
export function getAllCities(): ShippingRate[] {
  return loadShippingRates();
}

/**
 * Obtiene las ciudades de un departamento específico
 * @param stateCode - Código del departamento (ej: "05" para Antioquia)
 * @returns Array de tarifas de envío del departamento
 */
export function getCitiesByState(stateCode: string): ShippingRate[] {
  const allRates = loadShippingRates();
  return allRates.filter((rate) => rate.stateCode === stateCode);
}

/**
 * Obtiene todos los departamentos únicos
 * @returns Array de objetos con código y nombre de departamento
 */
export function getAllStates(): Array<{ code: string; name: string }> {
  const allRates = loadShippingRates();
  const statesMap = new Map<string, string>();
  
  for (const rate of allRates) {
    if (!statesMap.has(rate.stateCode)) {
      statesMap.set(rate.stateCode, rate.stateName);
    }
  }
  
  return Array.from(statesMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Formatea el costo de envío en formato colombiano
 * @param cost - Costo en pesos
 * @returns String formateado (ej: "$12.320")
 */
export function formatShippingCost(cost: number): string {
  return `$${cost.toLocaleString('es-CO')}`;
}
