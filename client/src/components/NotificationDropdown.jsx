import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, XCircle, Info, Bell, BookOpen, CheckCheck, Trash2, X } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const TYPE_CONFIG = {
  exceeded: { icon: XCircle, iconCls: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' },
  warning:  { icon: AlertTriangle, iconCls: 'text-yellow-500', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  info:     { icon: Info, iconCls: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  summary:  { icon: BookOpen, iconCls: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  reminder: { icon: Bell, iconCls: 'text-purple-500', bg: 'bg-purple-50', dot: 'bg-purple-500' },
}

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications()
  const navigate = useNavigate()
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const recent = notifications.slice(0, 5)

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1e3a5f]">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-1">
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {recent.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No notifications</div>
        ) : recent.map((n) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
          const Icon = cfg.icon
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={14} className={cfg.iconCls} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-semibold text-[#1e3a5f] truncate ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                  {!n.read && <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                className="text-gray-300 hover:text-red-400 shrink-0 mt-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={() => { onClose(); navigate('/notifications') }}
          className="w-full text-center text-xs font-semibold text-[#1e3a5f] hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationDropdown
