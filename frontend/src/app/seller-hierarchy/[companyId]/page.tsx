import SellerHierarchy from '@/pages/SellerHierarchy'

export default function SellerHierarchyPage({
  params,
}: {
  params: { companyId: string }
}) {
  return <SellerHierarchy companyId={params.companyId} />
}
