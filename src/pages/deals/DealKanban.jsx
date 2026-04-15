import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dealAPI } from '../../services/api'
import { Badge, Spinner, PageHeader } from '../../components/ui/index'
import { ListBulletIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const STAGES = [
  { key: 'prospecting',   label: 'Prospecting',   color: 'border-blue-400   bg-blue-50'   },
  { key: 'qualification', label: 'Qualification',  color: 'border-purple-400 bg-purple-50' },
  { key: 'proposal',      label: 'Proposal',       color: 'border-yellow-400 bg-yellow-50' },
  { key: 'negotiation',   label: 'Negotiation',    color: 'border-orange-400 bg-orange-50' },
  { key: 'closed_won',    label: 'Closed Won',     color: 'border-green-400  bg-green-50'  },
  { key: 'closed_lost',   label: 'Closed Lost',    color: 'border-red-400    bg-red-50'    },
]

export default function DealKanban() {
  const [kanban, setKanban]   = useState({})
  const [loading, setLoading] = useState(true)
  const [moving, setMoving]   = useState(null) // deal id being moved

  const fetchKanban = async () => {
    setLoading(true)
    try {
      const res = await dealAPI.getKanban()
      setKanban(res.data.data)
    } catch { toast.error('Failed to load kanban') }
    setLoading(false)
  }

  useEffect(() => { fetchKanban() }, [])

  const moveStage = async (dealId, newStage) => {
    setMoving(dealId)
    try {
      await dealAPI.update(dealId, { stage: newStage })
      toast.success('Stage updated')
      fetchKanban()
    } catch { toast.error('Failed to update stage') }
    setMoving(null)
  }

  if (loading) return <Spinner size="lg" />

  const totalRevenue = (kanban['closed_won'] || []).reduce((sum, d) => sum + Number(d.amount || 0), 0)

  return (
    <div>
      <PageHeader title="Deal Pipeline" subtitle={`Closed Won Revenue: ₹${totalRevenue.toLocaleString()}`}
        actions={
          <Link to="/deals" className="btn-secondary flex items-center gap-2 text-sm">
            <ListBulletIcon className="w-4 h-4" /> List View
          </Link>
        } />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => {
          const cols = kanban[key] || []
          const colRevenue = cols.reduce((s, d) => s + Number(d.amount || 0), 0)
          return (
            <div key={key} className="flex-shrink-0 w-64">
              {/* Column Header */}
              <div className={`rounded-t-xl border-t-4 ${color} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm">{label}</h3>
                  <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border">
                    {cols.length}
                  </span>
                </div>
                {colRevenue > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">₹{colRevenue.toLocaleString()}</p>
                )}
              </div>

              {/* Cards */}
              <div className="bg-gray-100 rounded-b-xl min-h-[200px] p-2 space-y-2">
                {cols.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">No deals</div>
                ) : cols.map(deal => (
                  <div key={deal.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{deal.dealName}</p>
                    {deal.customer && (
                      <p className="text-xs text-gray-500 mt-0.5">{deal.customer.name}</p>
                    )}
                    <p className="text-green-700 font-bold text-sm mt-2">
                      ₹{Number(deal.amount || 0).toLocaleString()}
                    </p>
                    {deal.probability > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Probability</span>
                          <span>{deal.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-primary-500 h-1 rounded-full transition-all" style={{ width: `${deal.probability}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Move Stage Buttons */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {STAGES.filter(s => s.key !== key).slice(0, 3).map(s => (
                        <button key={s.key} disabled={moving === deal.id}
                          onClick={() => moveStage(deal.id, s.key)}
                          className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 text-gray-600 rounded-full transition-colors">
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
