import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dealAPI, userAPI, customerAPI } from '../../services/api'
import { Modal, ConfirmDialog, Badge, Spinner, SearchInput, PageHeader, EmptyState, Pagination } from '../../components/ui/index'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, ViewColumnsIcon } from '@heroicons/react/24/outline'

const EMPTY = { dealName: '', amount: '', stage: 'prospecting', probability: 0, expectedClose: '', customerId: '', assignedTo: '', notes: '', currency: 'INR' }
const STAGES = ['prospecting','qualification','proposal','negotiation','closed_won','closed_lost']

export default function Deals() {
  const [deals, setDeals]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [stageF, setStageF]       = useState('')
  const [page, setPage]           = useState(1)
  const [pagination, setPagination] = useState({})
  const [users, setUsers]         = useState([])
  const [customers, setCustomers] = useState([])
  const [modal, setModal]         = useState(false)
  const [editData, setEditData]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    userAPI.getAll().then(r => setUsers(r.data.data)).catch(() => {})
    customerAPI.getAll({ limit: 100 }).then(r => setCustomers(r.data.data)).catch(() => {})
  }, [])

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const res = await dealAPI.getAll({ search, stage: stageF, page, limit: 10 })
      setDeals(res.data.data); setPagination(res.data.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchDeals() }, [search, stageF, page])

  const openAdd  = () => { setEditData(null); setForm(EMPTY); setModal(true) }
  const openEdit = (d) => { setEditData(d); setForm({ ...EMPTY, ...d, customerId: d.customerId || '', assignedTo: d.assignedTo || '' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, customerId: form.customerId || null, assignedTo: form.assignedTo || null }
      if (editData) { await dealAPI.update(editData.id, payload); toast.success('Deal updated!') }
      else          { await dealAPI.create(payload); toast.success('Deal created!') }
      setModal(false); fetchDeals()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await dealAPI.remove(confirmId); toast.success('Deal deleted'); setConfirmId(null); fetchDeals() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setDeleting(false)
  }

  return (
    <div>
      <PageHeader title="Deals" subtitle="Track your sales pipeline"
        actions={
          <div className="flex gap-2">
            <Link to="/deals/kanban" className="btn-secondary flex items-center gap-2 text-sm">
              <ViewColumnsIcon className="w-4 h-4" /> Kanban
            </Link>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Add Deal
            </button>
          </div>
        } />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search deals..." />
        <select value={stageF} onChange={e => setStageF(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : deals.length === 0 ? (
          <EmptyState title="No deals found" description="Add your first deal to track your pipeline."
            action={<button onClick={openAdd} className="btn-primary">Add Deal</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Deal Name','Customer','Amount','Stage','Probability','Close Date','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.dealName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.customer?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">₹{Number(d.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge value={d.stage} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
                          <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${d.probability}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{d.probability}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.expectedClose || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmId(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        {!loading && deals.length > 0 && (
          <div className="px-4 py-3 border-t">
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Edit Deal' : 'New Deal'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
              <input required value={form.dealName} onChange={e => setForm(f => ({ ...f, dealName: e.target.value }))} className="input-field" placeholder="Deal name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="input-field">
                {STAGES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
              <input type="date" value={form.expectedClose} onChange={e => setForm(f => ({ ...f, expectedClose: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className="input-field">
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input-field">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editData ? 'Update' : 'Create Deal'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Deal" message="Are you sure you want to delete this deal?" />
    </div>
  )
}
