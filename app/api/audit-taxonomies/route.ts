
import { NextResponse } from 'next/server';
import { getAllProductCategories, getAllProductTags, getAllProductAttributesWithTerms } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [categories, tags, attributes] = await Promise.all([
            getAllProductCategories(),
            getAllProductTags(),
            getAllProductAttributesWithTerms(),
        ]);

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalCategories: categories.length,
                totalTags: tags.length,
                totalAttributes: attributes.length,
            },
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                parent: c.parent,
                count: c.count
            })),
            attributes: attributes.map(a => ({
                id: a.attribute.id,
                name: a.attribute.name,
                slug: a.attribute.slug,
                terms: a.terms.map(t => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    count: t.count
                }))
            })),
            tags: tags.map(t => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                count: t.count
            }))
        };

        return NextResponse.json(report, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
