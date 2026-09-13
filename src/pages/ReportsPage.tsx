import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useLabData } from '../context/labDataState'

export function ReportsPage() {
  const { instruments, reports, tests } = useLabData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const filtered = useMemo(() => {
    const query = search.toLowerCase()

    return reports.filter((report) => {
      const test = tests.find((item) => item.id === report.testId)
      const instrument = instruments.find((item) => item.id === report.instrumentId)
      const haystack = `${report.reportId} ${test?.testId ?? ''} ${instrument?.manufacturer ?? ''} ${instrument?.model ?? ''}`
      const matchesQuery = haystack.toLowerCase().includes(query)
      const matchesStatus = status === 'All' || report.status === status

      return matchesQuery && matchesStatus
    })
  }, [instruments, reports, search, status, tests])

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Report repository" title="Reports" />
      <section className="toolbar">
        <label>
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Report, test, instrument" />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {['All', 'Draft', 'Generated', 'Under Review', 'Approved', 'Archived'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Report</th>
              <th>Test</th>
              <th>Instrument</th>
              <th>Generated</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => {
              const test = tests.find((item) => item.id === report.testId)
              const instrument = instruments.find((item) => item.id === report.instrumentId)
              return (
                <tr key={report.id}>
                  <td>
                    <strong>{report.reportId}</strong>
                    <span>{report.generatedBy}</span>
                  </td>
                  <td>{test?.testId ?? 'Unknown test'}</td>
                  <td>{instrument ? `${instrument.manufacturer} ${instrument.model}` : 'Unknown instrument'}</td>
                  <td>{new Date(report.generatedAt).toLocaleString()}</td>
                  <td><StatusBadge status={report.status} /></td>
                  <td>
                    <Link className="icon-button" to={`/reports/${report.id}`} aria-label="View report">
                      <Eye size={17} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
