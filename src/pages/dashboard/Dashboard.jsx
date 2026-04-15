import { useEffect, useState } from 'react'
import { reportAPI } from '../../services/api'
import { StatCard, Spinner, Badge } from '../../components/ui/index'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js'
import { UsersIcon, UserGroupIcon, TrophyIcon, ClipboardDocumentListIcon, CurrencyRupeeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size="lg" />
  if (!data)   return <p className="text-gray-500">Failed to load dashboard.</p>

  const { summary, recentCustomers, charts } = data

  // Build monthly revenue chart
  const monthlyLabels   = charts.monthlyDeals.map(d => `${MONTHS[d.month - 1]} ${d.year}`)
  const monthlyRevenue  = charts.monthlyDeals.map(d => parseFloat(d.revenue) || 0)
  const monthlyCount    = charts.monthlyDeals.map(d => parseInt(d.count)    || 0)

  const stageLabels  = charts.dealsByStage.map(d => d.stage?.replace('_', ' '))
  const stageCounts  = charts.dealsByStage.map(d => parseInt(d.count))
  const stageAmounts = charts.dealsByStage.map(d => parseFloat(d.totalAmount) || 0)

  const leadStatusLabels = charts.leadsByStatus.map(d => d.status)
  const leadStatusCounts = charts.leadsByStatus.map(d => parseInt(d.count))

  const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#14b8a6']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={summary.totalCustomers} icon={UserGroupIcon} color="blue" />
        <StatCard title="Total Leads" value={summary.totalLeads} icon={UsersIcon} color="purple"
          subtitle={`${summary.newLeads} new • ${summary.convertedLeads} converted`} />
        <StatCard title="Won Deals" value={summary.wonDeals} icon={TrophyIcon} color="green"
          subtitle={`₹${Number(summary.wonRevenue).toLocaleString()}`} />
        <StatCard title="Pending Tasks" value={summary.pendingTasks} icon={ClipboardDocumentListIcon}
          color={summary.overdueTasks > 0 ? 'red' : 'yellow'}
          subtitle={summary.overdueTasks > 0 ? `${summary.overdueTasks} overdue` : 'All on track'} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue & Deals</h3>
          {monthlyLabels.length > 0 ? (
            <Bar
              data={{
                labels: monthlyLabels,
                datasets: [
                  { label: 'Revenue (₹)', data: monthlyRevenue, backgroundColor: '#6366f1', borderRadius: 6, yAxisID: 'y' },
                  { label: 'Deals', data: monthlyCount, backgroundColor: '#22c55e', borderRadius: 6, yAxisID: 'y1' },
                ],
              }}
              options={{
                responsive: true, plugins: { legend: { position: 'top' } },
                scales: {
                  y:  { type: 'linear', position: 'left',  ticks: { callback: v => `₹${(v/1000).toFixed(0)}k` } },
                  y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } },
                },
              }}
            />
          ) : <p className="text-gray-400 text-sm text-center py-10">No deal data yet</p>}
        </div>

        {/* Lead Status Doughnut */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by Status</h3>
          {leadStatusLabels.length > 0 ? (
            <Doughnut
              data={{
                labels: leadStatusLabels,
                datasets: [{ data: leadStatusCounts, backgroundColor: COLORS, borderWidth: 0 }],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          ) : <p className="text-gray-400 text-sm text-center py-10">No lead data yet</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deals by Stage */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Deals Pipeline</h3>
          {stageLabels.length > 0 ? (
            <Bar
              data={{
                labels: stageLabels,
                datasets: [
                  { label: 'Count', data: stageCounts, backgroundColor: COLORS.slice(0, stageLabels.length), borderRadius: 6 },
                ],
              }}
              options={{ indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }}
            />
          ) : <p className="text-gray-400 text-sm text-center py-10">No deal data yet</p>}
        </div>

        {/* Recent Customers */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Customers</h3>
          <div className="space-y-3">
            {recentCustomers.length === 0
              ? <p className="text-gray-400 text-sm text-center py-4">No customers yet</p>
              : recentCustomers.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.company || c.email}</p>
                  </div>
                  <Badge value={c.status} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
