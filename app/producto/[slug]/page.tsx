import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/woocommerce"; // Specific import as we don't need options anymore for default clean view
import ProductDetails from "@/components/product/ProductDetails";
import { applyMapping } from "@/lib/mapping";
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
        description: product.short_description || product.description || `Compra ${product.name} en PharmaPlus`,
    };
}

export default async function ProductPage(props: ProductPageProps) {
    const params = await props.params;
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    const mappedProduct = applyMapping(product, [
        { id: "id", label: "id", source: "id", type: "any" },
        { id: "name", label: "name", source: "name", type: "any" },
        { id: "slug", label: "slug", source: "slug", type: "any" },
        { id: "price", label: "price", source: "price", type: "any" },
        { id: "regular_price", label: "regular_price", source: "regular_price", type: "any" },
        { id: "sale_price", label: "sale_price", source: "sale_price", type: "any" },
        { id: "description", label: "description", source: "description", type: "any" },
        { id: "short_description", label: "short_description", source: "short_description", type: "any" },
        { id: "images", label: "images", source: "images", type: "any" },
        { id: "categories", label: "categories", source: "categories", type: "any" },
        { id: "tags", label: "tags", source: "tags", type: "any" },
        { id: "attributes", label: "attributes", source: "attributes", type: "any" },
        { id: "stock_status", label: "stock_status", source: "stock_status", type: "any" },
        { id: "stock_quantity", label: "stock_quantity", source: "stock_quantity", type: "any" },
        { id: "type", label: "type", source: "type", type: "any" },
    ]) as unknown as MappedProduct;

    return (
        <ProductDetails product={mappedProduct} />
    );
}
