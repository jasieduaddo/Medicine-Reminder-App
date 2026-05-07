export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Logo above card */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">💊</span>
          <span className="text-2xl font-bold text-green-600">MediMind</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
