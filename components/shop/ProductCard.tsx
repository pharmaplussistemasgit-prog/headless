import BaseProductCard from "@/components/product/ProductCard";

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  price: string;
  sale_price?: string | null;
  image_url: string;
  is_new?: boolean;
  type?: string;
  images?: string[];
};

// Re-export con props adaptadas al `ProductCard` existente
export function ProductCard({ product }: { product: ProductSummary }) {
  const price = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
  const regularPrice = parseFloat(product.price);
  const isOnSale = !!product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);

  const mappedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: null,
    price: isNaN(price) ? 0 : price,
    regularPrice: isNaN(regularPrice) ? 0 : regularPrice,
    isOnSale: isOnSale,
    stock: null,
    isInStock: true,
    showExactStock: false,
    images: product.images && product.images.length > 0 ? product.images : [product.image_url],
    categories: [],
    shortDescription: '',
    brand: null,
    invima: null,
    productType: product.type || null,
    requiresRx: false,
    isRefrigerated: false,
    discountPercentage: isOnSale ? Math.round(((regularPrice - price) / regularPrice) * 100) : null,
  };

  return (
    <BaseProductCard product={mappedProduct} />
  );
}