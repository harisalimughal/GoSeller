import ProductDetail from '@/pages/ProductDetail'

export default function ProductDetailPage({
  params,
}: {
  params: { productId: string }
}) {
  return <ProductDetail productId={params.productId} />
}
