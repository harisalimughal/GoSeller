import CategoryPage from '@/pages/CategoryPage'

export default function CategoryPageRoute({
  params,
}: {
  params: { slug: string }
}) {
  return <CategoryPage slug={params.slug} />
}
