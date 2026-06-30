export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-(--surface-deepest)">
      {children}
    </div>
  )
}
