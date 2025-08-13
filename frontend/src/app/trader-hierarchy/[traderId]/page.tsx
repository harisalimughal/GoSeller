import TraderHierarchy from '@/pages/TraderHierarchy'

export default function TraderHierarchyPage({
  params,
}: {
  params: { traderId: string }
}) {
  return <TraderHierarchy traderId={params.traderId} />
}
