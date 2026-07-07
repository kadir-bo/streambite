import { AuthGuard, UnifiedSidebar, MobileContentPane } from "@/components";

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <div className="h-full flex overflow-hidden bg-surface-app">
        <UnifiedSidebar />
        <MobileContentPane>{children}</MobileContentPane>
      </div>
    </AuthGuard>
  );
}
