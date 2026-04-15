import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger text-sm">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const badgeMap = {
  // Lead statuses
  new: 'badge-blue', contacted: 'badge-yellow', qualified: 'badge-purple',
  converted: 'badge-green', rejected: 'badge-red',
  // Deal stages
  prospecting: 'badge-blue', qualification: 'badge-purple', proposal: 'badge-yellow',
  negotiation: 'badge-yellow', closed_won: 'badge-green', closed_lost: 'badge-red',
  // Task statuses
  pending: 'badge-yellow', in_progress: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red',
  // Customer statuses
  active: 'badge-green', inactive: 'badge-red', prospect: 'badge-blue',
  // Priority
  low: 'badge-gray', medium: 'badge-yellow', high: 'badge-red', urgent: 'badge-red',
  // Roles
  admin: 'badge-purple', manager: 'badge-blue', employee: 'badge-gray',
}

export function Badge({ value }) {
  const cls = badgeMap[value] || 'badge-gray'
  return <span className={cls}>{value?.replace('_', ' ')}</span>
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-gray-500 mt-1 text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`} />
    </div>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-full min-w-[220px]"
      />
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <p>{total} total records</p>
      <div className="flex gap-1">
        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
