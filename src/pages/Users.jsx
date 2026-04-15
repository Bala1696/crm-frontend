import { useEffect, useState } from 'react'
import { userAPI } from '../services/api'
import { Badge, Spinner, PageHeader, SearchInput, Modal, ConfirmDialog } from '../components/ui/index'
import toast from 'react-hot-toast'
import { PencilIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

export default function Users() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleF, setRoleF]     = useState('')
  const [modal, setModal]     = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm]       = useState({ name: '', role: 'employee', status: 'active', phone: '' })
  const [saving, setSaving]   = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await userAPI.getAll({ search, role: roleF })
      setUsers(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [search, roleF])

  const openEdit = (u) => {
    setEditUser(u)
    setForm({ name: u.name, role: u.role, status: u.status, phone: u.phone || '' })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await userAPI.update(editUser.id, form)
      toast.success('User updated!'); setModal(false); fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const handleToggle = async (u) => {
    try {
      await userAPI.toggleStatus(u.id)
      toast.success(`User ${u.status === 'active' ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage system users and permissions" />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
        <select value={roleF} onChange={e => setRoleF(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['User','Role','Status','Last Login','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge value={u.role} /></td>
                    <td className="px-4 py-3"><Badge value={u.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.lastLogin ? format(new Date(u.lastLogin), 'dd MMM yyyy') : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggle(u)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Edit User">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Update User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
