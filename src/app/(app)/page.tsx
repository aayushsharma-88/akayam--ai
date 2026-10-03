import { requireAuth } from '@/lib/auth/auth-utils'
import { HomeContent } from '@/components/home/home-content'

export default async function HomePage() {
  const user = await requireAuth()
  return <HomeContent user={user} />
}
