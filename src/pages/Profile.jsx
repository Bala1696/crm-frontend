import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI, userAPI, fileAPI } from '../services/api'
import { PageHeader } from '../components/ui/index'
import toast from 'react-hot-toast'
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passForm, setPassForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass]       = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSavingProfile(true)
    try {
      await userAPI.updateProfile(profileForm)
      updateUser(profileForm)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSavingProfile(false)
  }

  const handlePassChange = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    setSavingPass(true)
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSavingPass(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fileAPI.uploadSingle(formData)
      await userAPI.updateProfile({ avatar: res.data.data.url })
      updateUser({ avatar: res.data.data.url })
      toast.success('Avatar updated!')
    } catch { toast.error('Upload failed') }
    setUploadingAvatar(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your account settings" />

      {/* Avatar + Basic Info */}
      <div className="card">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
              : <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-3xl">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-md">
              <CameraIcon className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-t pt-4">Update Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91..." />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <form onSubmit={handlePassChange} className="space-y-4">
          <h3 className="font-semibold text-gray-900">Change Password</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" required value={passForm.currentPassword}
              onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
              className="input-field" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required minLength={6} value={passForm.newPassword}
                onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                className="input-field" placeholder="Min 6 chars" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" required minLength={6} value={passForm.confirmPassword}
                onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="input-field" placeholder="Repeat password" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPass} className="btn-primary">
              {savingPass ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-gray-500">Account Status</p>
            <span className="badge-green">Active</span>
          </div>
          <div>
            <p className="text-gray-500">User ID</p>
            <p className="font-medium text-gray-400">#{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
