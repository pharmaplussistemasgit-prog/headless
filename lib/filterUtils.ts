import { FILTER_TAG_MAPPING } from "@/config/filterTagMapping";
import { MappedProduct } from "@/types/product";

export interface FilterState {
    brands: { name: string; count: number; active: boolean }[];
    usage: { id: string; label: string; count: number; active: boolean }[];
    conditions: { id: string; label: string; count: number; active: boolean }[];
    priceRange: { min: number; max: number };
    activePriceRange: { min: number; max: number };
}

/**
 * Analyzes a list of products to generate available filters (facets)
 */
export function analyzeProductsForFilters(products: any[]): FilterState {
    // Explicitly cast to MappedProduct[] if possible, or trust duck typing
    const mappedProducts = products as MappedProduct[];

    const brandCounts: Record<string, number> = {};
    const usageCounts: Record<string, number> = {};
    const conditionCounts: Record<string, number> = {};
    let minPrice = Infinity;
    let maxPrice = 0;

    mappedProducts.forEach((product) => {
        // 1. Brands
        const brand = product.brand;
        if (brand) {
            const normalizedBrand = brand.toUpperCase();
            brandCounts[normalizedBrand] = (brandCounts[normalizedBrand] || 0) + 1;
        }

        // 2. Tags Processing
        const productTags = product.tags?.map((t) => t.slug) || [];

        // Check Usage Groups
        FILTER_TAG_MAPPING.usage.groups.forEach(group => {
            // If product has ANY tag from this group
            if (group.tags.some(tag => productTags.includes(tag))) {
                usageCounts[group.id] = (usageCounts[group.id] || 0) + 1;
            }
        });

        // Check Condition Groups
        FILTER_TAG_MAPPING.condition.groups.forEach(group => {
            if (group.tags.some(tag => productTags.includes(tag))) {
                conditionCounts[group.id] = (conditionCounts[group.id] || 0) + 1;
            }
        });

        // 3. Price
        // Handle various price formats if necessary, but MappedProduct has 'price' as number
        const price = product.price; // MappedProduct guarantees this is number
        if (price > 0) {
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;
        }
    });

    // Convert to Arrays
    const brands = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count, active: false }))
        .sort((a, b) => b.count - a.count); // Top brands first

    const usage = FILTER_TAG_MAPPING.usage.groups
        .map(group => ({
            id: group.id,
            label: group.label,
            count: usageCounts[group.id] || 0,
            active: false
        }))
        .filter(u => u.count > 0); // Only show relevant

    const conditions = FILTER_TAG_MAPPING.condition.groups
        .map(group => ({
            id: group.id,
            label: group.label,
            count: conditionCounts[group.id] || 0,
            active: false
        }))
        .filter(c => c.count > 0);

    return {
        brands,
        usage,
        conditions,
        priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
        activePriceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice }
    };
}

/**
 * Filters the product list based on active filters
 */
export function applyFilters(products: any[], filters: FilterState): any[] {
    const mappedProducts = products as MappedProduct[];

    // Get active values
    const activeBrands = filters.brands.filter(b => b.active).map(b => b.name);
    const activeUsage = filters.usage.filter(u => u.active).map(u => u.id);
    const activeConditions = filters.conditions.filter(c => c.active).map(c => c.id);
    const { min, max } = filters.activePriceRange;

    // Short circuit if no filters
    if (activeBrands.length === 0 && activeUsage.length === 0 && activeConditions.length === 0 && min === filters.priceRange.min && max === filters.priceRange.max) {
        return products;
    }

    return mappedProducts.filter(product => {
        // Brand Filter
        if (activeBrands.length > 0) {
            const brand = product.brand;
            if (!brand || !activeBrands.includes(brand.toUpperCase())) {
                return false;
            }
        }

        // Price Filter
        const price = product.price;
        if (price < min || price > max) {
            return false;
        }

        const productTags = product.tags?.map((t) => t.slug) || [];

        // Usage Filter
        if (activeUsage.length > 0) {
            // Must match AT LEAST ONE selected usage group
            const matchesUsage = activeUsage.some(groupId => {
                const group = FILTER_TAG_MAPPING.usage.groups.find(g => g.id === groupId);
                return group?.tags.some(tag => productTags.includes(tag));
            });
            if (!matchesUsage) return false;
        }

        // Condition Filter
        if (activeConditions.length > 0) {
            const matchesCondition = activeConditions.some(groupId => {
                const group = FILTER_TAG_MAPPING.condition.groups.find(g => g.id === groupId);
                return group?.tags.some(tag => productTags.includes(tag));
            });
            if (!matchesCondition) return false;
        }

        return true;
    });
}
