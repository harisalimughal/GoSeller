import DealerHierarchy from '@/pages/DealerHierarchy'

export default function DealerHierarchyPage({
  params,
}: {
  params: { dealerId: string }
}) {
  return <DealerHierarchy dealerId={params.dealerId} />
}
