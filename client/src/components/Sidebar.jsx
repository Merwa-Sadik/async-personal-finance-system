import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, TrendingDown, ArrowLeftRight, PieChart, BarChart2, UserCircle, X } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/expense', icon: TrendingDown, label: 'Expenses' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: PieChart, label: 'Budgets' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
]

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 z-30 h-full w-60 bg-[#1e3a5f] flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">PF</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">PFMS</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
                ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs">© 2025 PFMS</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
