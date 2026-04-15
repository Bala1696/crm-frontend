import { useState, useEffect, useRef } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { notificationAPI } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const typeColors = {
  lead_assigned: 'bg-blue-100 text-blue-600',
  task_reminder: 'bg-yellow-100 text-yellow-600',
  deal_update:   'bg-green-100 text-green-600',
  system:        'bg-gray-100 text-gray-600',
  email_sent:    'bg-purple-100 text-purple-600',
}

export default function NotificationBell() {
  const [open, setOpen]                 = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]   = useState(0)
  const ref = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll()
      setNotifications(res.data.data)
      setUnreadCount(res.data.unreadCount)
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAll = async () => {
    await notificationAPI.markAllRead()
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAll} className="text-xs text-primary-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No notifications</p>
            ) : notifications.map(n => (
              <div key={n.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full text-xs flex-shrink-0 ${typeColors[n.type] || typeColors.system}`}>
                    <BellIcon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
