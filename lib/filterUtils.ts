import { FILTER_TAG_MAPPING } from "@/config/filterTagMapping";
import { MappedProduct } from "@/types/product";

export interface FilterState {
    brands: { name: string; count: number; active: boolean }[];
    usage: { id: string; label: string; count: number; active: boolean }[];
    conditions: { id: string; label: string; count: number; active: boolean }[];
    tags: { id: string; name: string; slug: string; count: number; active: boolean }[]; // New: All tags
    priceRange: { min: number; max: number };
    activePriceRange: { min: number; max: number };
}

/**
 * Analyzes a list of products to generate available filters (facets)
 */
export function analyzeProductsForFilters(products: any[]): FilterState {
    const mappedProducts = products as MappedProduct[];

    const brandCounts: Record<string, number> = {};
    const usageCounts: Record<string, number> = {};
    const conditionCounts: Record<string, number> = {};

    // New: Track all tags
    const tagCounts: Record<string, { name: string; slug: string; count: number }> = {};

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
        const productTags = product.tags || [];
        const productTagSlugs = productTags.map((t) => t.slug);

        // Usage Groups
        FILTER_TAG_MAPPING.usage.groups.forEach(group => {
            if (group.tags.some(tag => productTagSlugs.includes(tag))) {
                usageCounts[group.id] = (usageCounts[group.id] || 0) + 1;
            }
        });

        // Condition Groups
        FILTER_TAG_MAPPING.condition.groups.forEach(group => {
            if (group.tags.some(tag => productTagSlugs.includes(tag))) {
                conditionCounts[group.id] = (conditionCounts[group.id] || 0) + 1;
            }
        });

        // All Tags Collection
        productTags.forEach(t => {
            const key = t.id.toString();
            if (!tagCounts[key]) {
                tagCounts[key] = { name: t.name, slug: t.slug, count: 0 };
            }
            tagCounts[key].count++;
        });

        // 3. Price
        const price = product.price;
        if (price > 0) {
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;
        }
    });

    // Convert to Arrays
    const brands = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count, active: false }))
        .sort((a, b) => b.count - a.count);

    const usage = FILTER_TAG_MAPPING.usage.groups
        .map(group => ({
            id: group.id,
            label: group.label,
            count: usageCounts[group.id] || 0,
            active: false
        }))
        .filter(u => u.count > 0);

    const conditions = FILTER_TAG_MAPPING.condition.groups
        .map(group => ({
            id: group.id,
            label: group.label,
            count: conditionCounts[group.id] || 0,
            active: false
        }))
        .filter(c => c.count > 0);

    const tags = Object.entries(tagCounts)
        .map(([id, data]) => ({
            id,
            name: data.name,
            slug: data.slug,
            count: data.count,
            active: false
        }))
        .sort((a, b) => b.count - a.count);

    return {
        brands,
        usage,
        conditions,
        tags,
        priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
        activePriceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice }
    };
}

/**
 * Filters the product list based on active filters
 */
export function applyFilters(products: any[], filters: FilterState): any[] {
    const mappedProducts = products as MappedProduct[];

    const activeBrands = filters.brands.filter(b => b.active).map(b => b.name);
    const activeUsage = filters.usage.filter(u => u.active).map(u => u.id);
    const activeConditions = filters.conditions.filter(c => c.active).map(c => c.id);
    const activeTags = filters.tags.filter(t => t.active).map(t => t.slug); // Using slug for matching
    const { min, max } = filters.activePriceRange;

    // Short circuit
    if (activeBrands.length === 0 && activeUsage.length === 0 && activeConditions.length === 0 && activeTags.length === 0 && min === filters.priceRange.min && max === filters.priceRange.max) {
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

        const productTagSlugs = product.tags?.map((t) => t.slug) || [];

        // Usage Filter
        if (activeUsage.length > 0) {
            const matchesUsage = activeUsage.some(groupId => {
                const group = FILTER_TAG_MAPPING.usage.groups.find(g => g.id === groupId);
                return group?.tags.some(tag => productTagSlugs.includes(tag));
            });
            if (!matchesUsage) return false;
        }

        // Condition Filter
        if (activeConditions.length > 0) {
            const matchesCondition = activeConditions.some(groupId => {
                const group = FILTER_TAG_MAPPING.condition.groups.find(g => g.id === groupId);
                return group?.tags.some(tag => productTagSlugs.includes(tag));
            });
            if (!matchesCondition) return false;
        }

        // Generic Tag Filter (New)
        if (activeTags.length > 0) {
            // Must have AT LEAST ONE of the selected tags? Or ALL? 
            // Usually standard ecommerce is OR within group.
            const matchesTag = activeTags.some(slug => productTagSlugs.includes(slug));
            if (!matchesTag) return false;
        }

        return true;
    });
}
