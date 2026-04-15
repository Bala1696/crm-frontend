import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.data.user, res.data.data.token)
      toast.success(`Welcome back, ${res.data.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-primary-600 font-black text-3xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white">CRM System</h1>
          <p className="text-indigo-200 mt-1">Manage your business, customers & deals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <div />
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
