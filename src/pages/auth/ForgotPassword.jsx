import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep]       = useState(1) // 1=email, 2=otp+newpass
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [newPass, setNewPass] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const sendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const resetPass = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetPassword({ email, otp, newPassword: newPass })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-600 font-black text-3xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email to receive an OTP.</p>
              <form onSubmit={sendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-500 text-sm mb-6">Check your email for the 6-digit OTP.</p>
              <form onSubmit={resetPass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                  <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
                    className="input-field tracking-widest text-center text-xl font-bold" placeholder="000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" required minLength={6} value={newPass} onChange={e => setNewPass(e.target.value)}
                    className="input-field" placeholder="Min 6 characters" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
