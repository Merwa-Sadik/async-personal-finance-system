import { useState } from 'react'
import { AlertTriangle, XCircle, Info, Bell, BookOpen, Trash2, CheckCheck, BellOff } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const TYPE_CONFIG = {
  exceeded: { icon: XCircle,       iconCls: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',    label: 'Exceeded',  dot: 'bg-red-500' },
  warning:  { icon: AlertTriangle, iconCls: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'Warning',   dot: 'bg-yellow-500' },
  info:     { icon: Info,          iconCls: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-100',   label: 'Info',      dot: 'bg-blue-500' },
  summary:  { icon: BookOpen,      iconCls: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100',  label: 'Summary',   dot: 'bg-green-500' },
  reminder: { icon: Bell,          iconCls: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', label: 'Reminder',  dot: 'bg-purple-500' },
}

const FILTERS = ['All', 'Unread', 'exceeded', 'warning', 'info', 'summary', 'reminder']

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

const Notifications = () => {
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useNotifications()
  const [filter, setFilter] = useState('All')

  const filtered = notifications.filter((n) => {
    if (filter === 'All') return true
    if (filter === 'Unread') return !n.read
    return n.type === filter
  })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-[#1e3a5f] border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 size={15} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
              ${filter === f ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'All' ? `All (${notifications.length})` :
             f === 'Unread' ? `Unread (${unreadCount})` :
             TYPE_CONFIG[f]?.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <BellOff size={22} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No notifications found</p>
          </div>
        ) : filtered.map((n) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
          const Icon = cfg.icon
          return (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 transition
                ${!n.read ? `${cfg.border} border-l-4` : 'border-gray-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={18} className={cfg.iconCls} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold text-[#1e3a5f] ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                    {!n.read && <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.time)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-[#1e3a5f] font-medium hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => remove(n.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <Trash2 size={11} /> Dismiss
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Notifications
