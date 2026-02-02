import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/woocommerce";
import ProductDetails from "@/components/product/ProductDetails";
import { mapWooProduct } from "@/lib/mappers";
import { MappedProduct } from "@/types/product";

// Force revalidation
export const revalidate = 60;

interface ProductPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata(props: ProductPageProps) {
    const params = await props.params;
    const product = await getProductBySlug(params.slug);

    if (!product) {
        return {
            title: "Producto no encontrado - PharmaPlus",
        };
    }

    return {
        title: `${product.name} - PharmaPlus`,
        description: product.short_description?.replace(/<[^>]*>?/gm, '') || `Compra ${product.name} al mejor precio en PharmaPlus. Envíos a todo el país.`,
        openGraph: {
            title: product.name,
            description: product.short_description?.replace(/<[^>]*>?/gm, '') || `Disfruta de ${product.name} con la confianza de PharmaPlus.`,
            images: product.images?.length > 0 ? [{ url: product.images[0].src }] : [],
            type: 'website',
        },
    };
}

export default async function ProductPage(props: ProductPageProps) {
    const params = await props.params;
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    const mappedProduct = mapWooProduct(product as unknown as any);

    // Fetch related products (same category)
    let relatedProducts: any[] = [];
    if (product.categories && product.categories.length > 0) {
        const { getProducts } = await import("@/lib/woocommerce");
        const categoryId = product.categories[0].id;
        const { products } = await getProducts({
            category: String(categoryId),
            perPage: 10
        });
        // Filter out current product
        relatedProducts = products.filter(p => p.id !== product.id);
    }

    // Mock "Otras personas también vieron" (random products or from another category/tag if available)
    // For now, we reuse related products logic but maybe limit or shuffle if we had a better shuffling mechanism without extra API calls.
    // In a real scenario, this would come from analytics or a specific "cross-sell" API.
    // We will just fetch a general list to populate the UI structure as requested.
    let alsoViewedProducts: any[] = [];
    {
        const { getProducts } = await import("@/lib/woocommerce");
        // Fetching generally popular/recent products
        const { products } = await getProducts({ perPage: 8, orderby: 'popularity' });
        alsoViewedProducts = products.filter(p => p.id !== product.id).slice(0, 10);
    }

    return (
        <ProductDetails
            product={mappedProduct}
            relatedProducts={relatedProducts}
            alsoViewedProducts={alsoViewedProducts}
        />
    );
}
