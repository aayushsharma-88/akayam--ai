import { notFound } from 'next/navigation'
import { getDeity, getAllDeities } from '@/lib/data/deities'
import { DeityPageContent } from '@/components/devotion/deity-page'

export async function generateStaticParams() {
  const deities = getAllDeities()
  return deities.map((deity) => ({
    deity: deity.id,
  }))
}

export default async function DeityPage({ params }: { params: Promise<{ deity: string }> }) {
  const resolvedParams = await params
  const deityData = getDeity(resolvedParams.deity)

  if (!deityData) {
    notFound()
  }

  return <DeityPageContent deity={deityData} allDeities={getAllDeities()} />
}
