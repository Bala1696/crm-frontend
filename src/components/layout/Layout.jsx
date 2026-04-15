import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../ui/NotificationBell'
import {
  HomeIcon, UsersIcon, UserGroupIcon, TrophyIcon,
  ClipboardDocumentListIcon, ChartBarIcon, Cog6ToothIcon,
  ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon,
  BriefcaseIcon, UserCircleIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',  icon: HomeIcon },
  { to: '/customers',    label: 'Customers',  icon: UserGroupIcon },
  { to: '/leads',        label: 'Leads',      icon: UsersIcon },
  { to: '/deals',        label: 'Deals',      icon: TrophyIcon },
  { to: '/tasks',        label: 'Tasks',      icon: ClipboardDocumentListIcon },
  { to: '/reports',      label: 'Reports',    icon: ChartBarIcon, roles: ['admin','manager'] },
  { to: '/users',        label: 'Users',      icon: BriefcaseIcon, roles: ['admin'] },
]

export default function Layout() {
  const { user, logout, isManager } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleNav = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-700">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
          <span className="text-primary-600 font-bold text-lg">C</span>
        </div>
        <span className="text-white font-bold text-xl">CRM System</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ` +
              (isActive ? 'bg-white/20 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white')
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-indigo-700">
        <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-all text-sm">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            : <UserCircleIcon className="w-7 h-7" />}
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{user?.name}</p>
            <p className="text-indigo-300 text-xs capitalize">{user?.role}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-200 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gradient-to-b from-primary-700 to-primary-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-gradient-to-b from-primary-700 to-primary-900">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <NavLink to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
              }
              <span className="hidden sm:block font-medium">{user?.name}</span>
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
