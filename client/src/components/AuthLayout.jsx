const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-md px-8 py-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <span className="text-white text-sm font-bold">PF</span>
          </div>
          <span className="text-[#1e3a5f] text-xl font-bold tracking-wide">PFMS</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
