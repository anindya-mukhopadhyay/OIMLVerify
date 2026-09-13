import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useLabData } from '../context/labDataState'
import type { DashboardMetric } from '../types/domain'

export function DashboardPage() {
  const { instruments, observations, reports, tests } = useLabData()
  const completedTests = tests.filter((test) => ['Approved', 'Failed'].includes(test.status))
  const metrics: DashboardMetric[] = [
    { label: 'Total instruments', value: instruments.length, tone: 'neutral' },
    {
      label: 'Active tests',
      value: tests.filter((test) => ['Draft', 'In Progress', 'Review'].includes(test.status)).length,
      tone: 'active',
    },
    { label: 'Completed tests', value: completedTests.length, tone: 'neutral' },
    { label: 'Passed tests', value: tests.filter((test) => test.status === 'Approved').length, tone: 'success' },
    { label: 'Failed tests', value: tests.filter((test) => test.status === 'Failed').length, tone: 'danger' },
    { label: 'Pending review', value: tests.filter((test) => test.status === 'Review').length, tone: 'warning' },
  ]
  const activity = tests.map((test) => ({
    date: new Date(test.testDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    observations: observations.filter((observation) => observation.testId === test.id).length,
    tests: 1,
  }))

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Operational overview" title="Dashboard" />
      <section className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>
      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <h3>Testing Activity</h3>
            <span>{observations.length} observations logged</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="tests" fill="#2f6f73" radius={[4, 4, 0, 0]} />
              <Bar dataKey="observations" fill="#8a6f31" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Recent Tests</h3>
            <span>{tests.length} total</span>
          </div>
          <div className="list">
            {tests.slice(0, 5).map((test) => {
              const instrument = instruments.find((item) => item.id === test.instrumentId)
              return (
                <div className="list-row" key={test.id}>
                  <div>
                    <strong>{test.testId}</strong>
                    <span>{instrument?.manufacturer} {instrument?.model}</span>
                  </div>
                  <StatusBadge status={test.status} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Recent Reports</h3>
            <span>{reports.length} generated</span>
          </div>
          <div className="list">
            {reports.map((report) => (
              <div className="list-row" key={report.id}>
                <div>
                  <strong>{report.reportId}</strong>
                  <span>{new Date(report.generatedAt).toLocaleString()}</span>
                </div>
                <StatusBadge status={report.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
