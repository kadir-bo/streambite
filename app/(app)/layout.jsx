import { AuthGuard, UnifiedSidebar, MobileContentPane } from '@/components'

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <div className="h-full flex overflow-hidden bg-zinc-900">
        <UnifiedSidebar />
        <MobileContentPane>{children}</MobileContentPane>
      </div>
    </AuthGuard>
  )
}
