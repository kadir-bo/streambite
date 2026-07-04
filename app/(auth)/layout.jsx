export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-zinc-950 overflow-hidden">
      {/* Subtile Glow-Atmosphäre wie auf der Landing Page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-[600px] bg-(--accent) opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-indigo-500 opacity-[0.02] rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}
