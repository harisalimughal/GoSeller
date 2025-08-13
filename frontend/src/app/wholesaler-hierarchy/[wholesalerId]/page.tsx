import WholesalerHierarchy from '@/pages/WholesalerHierarchy'

export default function WholesalerHierarchyPage({
  params,
}: {
  params: { wholesalerId: string }
}) {
  return <WholesalerHierarchy wholesalerId={params.wholesalerId} />
}
