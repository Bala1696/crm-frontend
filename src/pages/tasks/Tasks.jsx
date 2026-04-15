import { useEffect, useState } from 'react'
import { taskAPI, userAPI, customerAPI } from '../../services/api'
import { Modal, ConfirmDialog, Badge, Spinner, SearchInput, PageHeader, EmptyState, Pagination } from '../../components/ui/index'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { format, isPast } from 'date-fns'

const EMPTY = { taskName: '', type: 'call', status: 'pending', priority: 'medium', dueDate: '', description: '', assignedTo: '', customerId: '' }
const TYPES     = ['call','meeting','email','follow_up','demo','other']
const STATUSES  = ['pending','in_progress','completed','cancelled']
const PRIORITIES= ['low','medium','high','urgent']

export default function Tasks() {
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('')
  const [typeF, setTypeF]         = useState('')
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

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await taskAPI.getAll({ status: statusF, type: typeF, page, limit: 10 })
      setTasks(res.data.data); setPagination(res.data.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [statusF, typeF, page])

  const openAdd  = () => { setEditData(null); setForm(EMPTY); setModal(true) }
  const openEdit = (t) => { setEditData(t); setForm({ ...EMPTY, ...t, assignedTo: t.assignedTo || '', customerId: t.customerId || '', dueDate: t.dueDate ? t.dueDate.substring(0,16) : '' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, customerId: form.customerId || null }
      if (editData) { await taskAPI.update(editData.id, payload); toast.success('Task updated!') }
      else          { await taskAPI.create(payload); toast.success('Task created!') }
      setModal(false); fetchTasks()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await taskAPI.remove(confirmId); toast.success('Task deleted'); setConfirmId(null); fetchTasks() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setDeleting(false)
  }

  const quickComplete = async (id) => {
    try { await taskAPI.update(id, { status: 'completed' }); toast.success('Task completed!'); fetchTasks() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Manage your team's tasks and activities"
        actions={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Add Task</button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={typeF} onChange={e => setTypeF(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Spinner /> : tasks.length === 0 ? (
          <EmptyState title="No tasks found" description="Create your first task."
            action={<button onClick={openAdd} className="btn-primary">Add Task</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Task','Type','Status','Priority','Due Date','Assigned To','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(t => {
                  const isOverdue = t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'completed'
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <p className={`font-medium ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.taskName}</p>
                        {isOverdue && <span className="text-xs text-red-500 font-medium">⚠ Overdue</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{t.type.replace('_',' ')}</td>
                      <td className="px-4 py-3"><Badge value={t.status} /></td>
                      <td className="px-4 py-3"><Badge value={t.priority} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy, HH:mm') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {t.assignee
                          ? <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                                {t.assignee.name[0]}
                              </div>
                              <span className="text-xs">{t.assignee.name}</span>
                            </div>
                          : <span className="text-gray-400 text-xs">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {t.status !== 'completed' && (
                            <button onClick={() => quickComplete(t.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark Complete">
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmId(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && tasks.length > 0 && (
          <div className="px-4 py-3 border-t">
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Edit Task' : 'New Task'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
              <input required value={form.taskName} onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))} className="input-field" placeholder="Task description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date & Time</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input-field">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className="input-field">
                <option value="">No customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" placeholder="Task details..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editData ? 'Update' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Task" message="Are you sure you want to delete this task?" />
    </div>
  )
}
