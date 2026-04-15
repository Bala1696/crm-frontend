import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

// Auth Pages
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Main Pages
import Dashboard    from './pages/dashboard/Dashboard'
import Customers    from './pages/customers/Customers'
import CustomerDetail from './pages/customers/CustomerDetail'
import Leads        from './pages/leads/Leads'
import Deals        from './pages/deals/Deals'
import DealKanban   from './pages/deals/DealKanban'
import Tasks        from './pages/tasks/Tasks'
import Reports      from './pages/reports/Reports'
import Users        from './pages/Users'
import Profile      from './pages/Profile'

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index                  element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"       element={<Dashboard />} />
            <Route path="customers"       element={<Customers />} />
            <Route path="customers/:id"   element={<CustomerDetail />} />
            <Route path="leads"           element={<Leads />} />
            <Route path="deals"           element={<Deals />} />
            <Route path="deals/kanban"    element={<DealKanban />} />
            <Route path="tasks"           element={<Tasks />} />
            <Route path="reports"         element={<PrivateRoute roles={['admin','manager']}><Reports /></PrivateRoute>} />
            <Route path="users"           element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
            <Route path="profile"         element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
