import { PageHeader } from '../components/PageHeader'
import { useLabData } from '../context/labDataState'

export function AuditTrailPage() {
  const { auditLogs } = useLabData()

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Traceability" title="Audit Trail" />
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>
                  <strong>{log.entity}</strong>
                  <span>{log.entityId}</span>
                </td>
                <td>{JSON.stringify(log.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
