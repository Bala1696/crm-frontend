import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { Modal, ConfirmDialog, Badge, Spinner, SearchInput, PageHeader, EmptyState, Pagination } from '../../components/ui/index'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', address: '', city: '', country: '', status: 'active', source: 'other', notes: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]           = useState(1)
  const [pagination, setPagination] = useState({})
  const [modal, setModal]         = useState(false)
  const [editData, setEditData]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await customerAPI.getAll({ search, status: statusFilter, page, limit: 10 })
      setCustomers(res.data.data)
      setPagination(res.data.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchCustomers() }, [search, statusFilter, page])

  const openAdd = () => { setEditData(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (c) => { setEditData(c); setForm({ ...EMPTY_FORM, ...c }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editData) { await customerAPI.update(editData.id, form); toast.success('Customer updated!') }
      else          { await customerAPI.create(form); toast.success('Customer added!') }
      setModal(false); fetchCustomers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await customerAPI.remove(confirmId)
      toast.success('Customer deleted')
      setConfirmId(null); fetchCustomers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setDeleting(false)
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage all your customers"
        actions={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Add Customer</button>} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : customers.length === 0 ? (
          <EmptyState title="No customers found" description="Add your first customer to get started."
            action={<button onClick={openAdd} className="btn-primary">Add Customer</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Customer', 'Company', 'Phone', 'Status', 'Source', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.company || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3"><Badge value={c.status} /></td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{c.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/customers/${c.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmId(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && customers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Edit Customer' : 'Add Customer'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Full name" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="input-field" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="input-field">
                {['website','referral','social_media','email','phone','other'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" placeholder="Full address" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none" placeholder="Any notes..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editData ? 'Update' : 'Add Customer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Customer" message="This will permanently delete the customer and all related data." />
    </div>
  )
}
