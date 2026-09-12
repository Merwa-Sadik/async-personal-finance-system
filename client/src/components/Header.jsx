import { useState } from 'react'
import { Menu, Search, Bell, LogOut, User } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick }) => {
  const { user } = useFinance()
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-10">
      <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-[#1e3a5f]">
        <Menu size={22} />
      </button>

      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions, categories..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium text-[#1e3a5f] hidden sm:block">{user.name}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { setProfileOpen(false); navigate('/profile') }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={14} /> Profile
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => { setProfileOpen(false); navigate('/login') }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
