import { requireAuth } from '@/lib/auth/auth-utils'
import { AppSidebar } from '@/components/sidebar/sidebar'
import { ToastProvider } from '@/components/ui/toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  
  return (
    <ToastProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#080A0F] text-[#E0E2E8]">
        <AppSidebar user={user} />
        <main className="flex-1 overflow-hidden flex flex-col h-full w-full">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
