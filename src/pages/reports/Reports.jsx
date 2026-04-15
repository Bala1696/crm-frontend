import { useEffect, useState } from 'react'
import { reportAPI } from '../../services/api'
import { Spinner, PageHeader, StatCard } from '../../components/ui/index'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { TrophyIcon, UsersIcon, CurrencyRupeeIcon, ChartBarIcon } from '@heroicons/react/24/outline'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function Reports() {
  const [dashboard, setDashboard]     = useState(null)
  const [salesReport, setSalesReport] = useState(null)
  const [employees, setEmployees]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [d, s, e] = await Promise.all([
        reportAPI.getDashboard(),
        reportAPI.getSalesReport({ startDate, endDate }),
        reportAPI.getEmployeePerformance(),
      ])
      setDashboard(d.data.data)
      setSalesReport(s.data.data)
      setEmployees(e.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  if (loading) return <Spinner size="lg" />

  const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#14b8a6']

  const dealStageData = {
    labels: (salesReport?.deals || []).map(d => d.stage?.replace('_', ' ')),
    datasets: [{
      label: 'Revenue (₹)',
      data: (salesReport?.deals || []).map(d => parseFloat(d.total) || 0),
      backgroundColor: COLORS,
      borderRadius: 6,
    }],
  }

  const leadConversionData = {
    labels: (salesReport?.leadConversion || []).map(d => d.status),
    datasets: [{
      data: (salesReport?.leadConversion || []).map(d => parseInt(d.count)),
      backgroundColor: COLORS,
      borderWidth: 0,
    }],
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Business performance insights" />

      {/* Summary Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Won Deals"      value={dashboard.summary.wonDeals}      icon={TrophyIcon}        color="green" />
          <StatCard title="Total Leads"    value={dashboard.summary.totalLeads}    icon={UsersIcon}         color="blue" />
          <StatCard title="Won Revenue"    value={`₹${Number(dashboard.summary.wonRevenue||0).toLocaleString()}`} icon={CurrencyRupeeIcon} color="indigo" />
          <StatCard title="Converted"      value={dashboard.summary.convertedLeads} icon={ChartBarIcon}     color="purple" />
        </div>
      )}

      {/* Date Filter for Sales */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Sales Report Filter</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field w-40" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field w-40" />
          </div>
          <button onClick={fetchAll} className="btn-primary text-sm">Apply Filter</button>
          <button onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchAll, 100) }} className="btn-secondary text-sm">Reset</button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Deal Stage</h3>
          {dealStageData.labels.length > 0
            ? <Bar data={dealStageData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            : <p className="text-gray-400 text-sm text-center py-10">No data available</p>}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Conversion Funnel</h3>
          {leadConversionData.labels.length > 0
            ? <Doughnut data={leadConversionData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            : <p className="text-gray-400 text-sm text-center py-10">No data available</p>}
        </div>
      </div>

      {/* Top Performers */}
      {salesReport?.topEmployees?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#','Employee','Deals Won','Revenue'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salesReport.topEmployees.map((emp, i) => (
                  <tr key={emp.assignedTo} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-400">#{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                          {emp.assignee?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{emp.assignee?.name}</p>
                          <p className="text-xs text-gray-500">{emp.assignee?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-600">{emp.dealsWon}</td>
                    <td className="px-4 py-3 font-bold text-green-700">₹{Number(emp.revenue||0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Performance Table */}
      {employees.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Employee Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Employee','Total Leads','Deals Won','Tasks Completed'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {emp.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{emp.leads}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{emp.dealsWon}</td>
                    <td className="px-4 py-3 text-purple-600 font-semibold">{emp.tasksCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
