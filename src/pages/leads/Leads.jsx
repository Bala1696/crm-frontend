import { useEffect, useState } from 'react'
import { leadAPI, userAPI, customerAPI } from '../../services/api'
import { Modal, ConfirmDialog, Badge, Spinner, SearchInput, PageHeader, EmptyState, Pagination } from '../../components/ui/index'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const EMPTY = { leadName: '', email: '', phone: '', company: '', status: 'new', source: 'other', priority: 'medium', assignedTo: '', followUpDate: '', notes: '', budget: '' }

export default function Leads() {
  const [leads, setLeads]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('')
  const [page, setPage]           = useState(1)
  const [pagination, setPagination] = useState({})
  const [users, setUsers]         = useState([])
  const [modal, setModal]         = useState(false)
  const [editData, setEditData]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    userAPI.getAll().then(r => setUsers(r.data.data)).catch(() => {})
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await leadAPI.getAll({ search, status: statusF, page, limit: 10 })
      setLeads(res.data.data); setPagination(res.data.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [search, statusF, page])

  const openAdd = () => { setEditData(null); setForm(EMPTY); setModal(true) }
  const openEdit = (l) => { setEditData(l); setForm({ ...EMPTY, ...l, assignedTo: l.assignedTo || '' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null }
      if (editData) { await leadAPI.update(editData.id, payload); toast.success('Lead updated!') }
      else          { await leadAPI.create(payload); toast.success('Lead created!') }
      setModal(false); fetchLeads()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await leadAPI.remove(confirmId); toast.success('Lead deleted'); setConfirmId(null); fetchLeads() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setDeleting(false)
  }

  const statuses = ['new','contacted','qualified','converted','rejected']

  return (
    <div>
      <PageHeader title="Leads" subtitle="Track and manage your sales leads"
        actions={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Add Lead</button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : leads.length === 0 ? (
          <EmptyState title="No leads found" description="Start tracking your leads."
            action={<button onClick={openAdd} className="btn-primary">Add Lead</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Lead Name','Company','Status','Priority','Assigned To','Follow Up','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{l.leadName}</p>
                      <p className="text-xs text-gray-500">{l.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.company || '—'}</td>
                    <td className="px-4 py-3"><Badge value={l.status} /></td>
                    <td className="px-4 py-3"><Badge value={l.priority} /></td>
                    <td className="px-4 py-3">
                      {l.assignee
                        ? <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                              {l.assignee.name[0]}
                            </div>
                            <span className="text-gray-700 text-xs">{l.assignee.name}</span>
                          </div>
                        : <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {l.followUpDate ? format(new Date(l.followUpDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(l)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmId(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        {!loading && leads.length > 0 && (
          <div className="px-4 py-3 border-t">
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Edit Lead' : 'New Lead'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name *</label>
              <input required value={form.leadName} onChange={e => setForm(f => ({ ...f, leadName: e.target.value }))} className="input-field" placeholder="Lead name or contact person" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="input-field" placeholder="Company" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
              <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                {['low','medium','high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="input-field">
                {['website','referral','social_media','email','phone','campaign','other'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input-field">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none" placeholder="Notes..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editData ? 'Update' : 'Create Lead'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Lead" message="Are you sure you want to delete this lead?" />
    </div>
  )
}
