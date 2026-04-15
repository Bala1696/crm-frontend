import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { customerAPI, communicationAPI, fileAPI } from '../../services/api'
import { Badge, Spinner, Modal } from '../../components/ui/index'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, PaperClipIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const TABS = ['Overview', 'Leads', 'Deals', 'Tasks', 'Communications', 'Files']

export default function CustomerDetail() {
  const { id }                    = useParams()
  const [customer, setCustomer]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('Overview')
  const [commModal, setCommModal] = useState(false)
  const [commForm, setCommForm]   = useState({ type: 'call', subject: '', body: '', direction: 'outbound' })
  const [fileModal, setFileModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [savingComm, setSavingComm] = useState(false)

  const fetch = async () => {
    try {
      const res = await customerAPI.getOne(id)
      setCustomer(res.data.data)
    } catch { toast.error('Failed to load customer') }
    setLoading(false)
  }

  useEffect(() => { fetch() }, [id])

  const handleLogComm = async (e) => {
    e.preventDefault(); setSavingComm(true)
    try {
      await communicationAPI.create({ ...commForm, customerId: id })
      toast.success('Communication logged!'); setCommModal(false); fetch()
    } catch { toast.error('Failed') }
    setSavingComm(false)
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('customerId', id)
      await fileAPI.uploadSingle(formData)
      toast.success('File uploaded!'); setFileModal(false); setSelectedFile(null); fetch()
    } catch { toast.error('Upload failed') }
    setUploading(false)
  }

  if (loading) return <Spinner size="lg" />
  if (!customer) return <div className="card"><p className="text-gray-500">Customer not found.</p></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/customers" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-2xl">
            {customer.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {customer.company && <span className="text-gray-500 text-sm">{customer.company}</span>}
              <Badge value={customer.status} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCommModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <ChatBubbleLeftRightIcon className="w-4 h-4" /> Log Communication
          </button>
          <button onClick={() => setFileModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <PaperClipIcon className="w-4 h-4" /> Upload File
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customer.email && (
          <div className="card flex items-center gap-3 p-4">
            <EnvelopeIcon className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium">{customer.email}</p>
            </div>
          </div>
        )}
        {customer.phone && (
          <div className="card flex items-center gap-3 p-4">
            <PhoneIcon className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium">{customer.phone}</p>
            </div>
          </div>
        )}
        {customer.address && (
          <div className="card flex items-center gap-3 p-4">
            <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="text-sm font-medium">{customer.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {tab === 'Overview' && (
            <div className="card">
              <h3 className="font-semibold mb-3">Notes</h3>
              <p className="text-gray-600 text-sm">{customer.notes || 'No notes available.'}</p>
            </div>
          )}
          {tab === 'Leads' && (
            <div className="space-y-3">
              {(customer.leads || []).length === 0
                ? <p className="text-gray-500 text-sm">No leads found.</p>
                : customer.leads.map(l => (
                  <div key={l.id} className="card p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{l.leadName}</p>
                      <p className="text-xs text-gray-500">{l.source}</p>
                    </div>
                    <Badge value={l.status} />
                  </div>
                ))}
            </div>
          )}
          {tab === 'Deals' && (
            <div className="space-y-3">
              {(customer.deals || []).length === 0
                ? <p className="text-gray-500 text-sm">No deals found.</p>
                : customer.deals.map(d => (
                  <div key={d.id} className="card p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{d.dealName}</p>
                      <p className="text-xs text-gray-500">₹{Number(d.amount).toLocaleString()}</p>
                    </div>
                    <Badge value={d.stage} />
                  </div>
                ))}
            </div>
          )}
          {tab === 'Tasks' && (
            <div className="space-y-3">
              {(customer.tasks || []).length === 0
                ? <p className="text-gray-500 text-sm">No tasks found.</p>
                : customer.tasks.map(t => (
                  <div key={t.id} className="card p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{t.taskName}</p>
                      <p className="text-xs text-gray-500">{t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy') : '—'}</p>
                    </div>
                    <Badge value={t.status} />
                  </div>
                ))}
            </div>
          )}
          {tab === 'Communications' && (
            <div className="space-y-3">
              {(customer.communications || []).length === 0
                ? <p className="text-gray-500 text-sm">No communications logged.</p>
                : customer.communications.map(c => (
                  <div key={c.id} className="card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge-blue capitalize">{c.type}</span>
                          <span className="text-xs text-gray-400">{c.direction}</span>
                        </div>
                        {c.subject && <p className="font-medium mt-1">{c.subject}</p>}
                        {c.body && <p className="text-sm text-gray-600 mt-1">{c.body}</p>}
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                        {format(new Date(c.communicatedAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {tab === 'Files' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(customer.files || []).length === 0
                ? <p className="text-gray-500 text-sm">No files uploaded.</p>
                : customer.files.map(f => (
                  <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                    className="card p-4 hover:shadow-md transition-shadow flex items-center gap-3">
                    <PaperClipIcon className="w-8 h-8 text-primary-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.originalName}</p>
                      <p className="text-xs text-gray-400">{(f.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Communication Modal */}
      <Modal open={commModal} onClose={() => setCommModal(false)} title="Log Communication">
        <form onSubmit={handleLogComm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={commForm.type} onChange={e => setCommForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                {['call','email','meeting','note','sms'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select value={commForm.direction} onChange={e => setCommForm(f => ({ ...f, direction: e.target.value }))} className="input-field">
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input value={commForm.subject} onChange={e => setCommForm(f => ({ ...f, subject: e.target.value }))} className="input-field" placeholder="Brief subject" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Body</label>
            <textarea rows={4} value={commForm.body} onChange={e => setCommForm(f => ({ ...f, body: e.target.value }))} className="input-field resize-none" placeholder="Details..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setCommModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={savingComm} className="btn-primary">{savingComm ? 'Saving...' : 'Log'}</button>
          </div>
        </form>
      </Modal>

      {/* File Upload Modal */}
      <Modal open={fileModal} onClose={() => setFileModal(false)} title="Upload File">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <PaperClipIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-3">PDF, Word, Excel, or Image (max 10MB)</p>
            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="hidden" id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" />
            <label htmlFor="file-upload" className="btn-secondary cursor-pointer text-sm">Choose File</label>
            {selectedFile && <p className="mt-2 text-sm text-primary-600 font-medium">{selectedFile.name}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setFileModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!selectedFile || uploading} className="btn-primary">{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
