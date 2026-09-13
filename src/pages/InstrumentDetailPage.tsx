import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useLabData } from '../context/labDataState'

export function InstrumentDetailPage() {
  const { id } = useParams()
  const { instruments, observations, tests } = useLabData()
  const instrument = instruments.find((item) => item.id === id)

  if (!instrument) {
    return <Navigate to="/instruments" replace />
  }

  const history = tests.filter((test) => test.instrumentId === instrument.id)

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Instrument detail" title={`${instrument.manufacturer} ${instrument.model}`}>
        <Link className="secondary-button" to="/instruments">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
      </PageHeader>
      <section className="detail-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Technical Register</h3>
            <span>{instrument.serialNumber}</span>
          </div>
          <dl className="definition-grid">
            <dt>Instrument type</dt>
            <dd>{instrument.instrumentType}</dd>
            <dt>Accuracy class</dt>
            <dd>{instrument.accuracyClass}</dd>
            <dt>Maximum capacity</dt>
            <dd>{instrument.maxCapacity}</dd>
            <dt>Minimum capacity</dt>
            <dd>{instrument.minCapacity}</dd>
            <dt>Scale interval (e)</dt>
            <dd>{instrument.verificationScaleInterval}</dd>
            <dt>Created</dt>
            <dd>{new Date(instrument.createdAt).toLocaleString()}</dd>
            <dt>Updated</dt>
            <dd>{new Date(instrument.updatedAt).toLocaleString()}</dd>
          </dl>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Specifications</h3>
          </div>
          <p>{instrument.technicalSpecifications}</p>
          <p className="muted-block">{instrument.notes}</p>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h3>Instrument Test History</h3>
          <span>{history.length} tests</span>
        </div>
        <div className="list">
          {history.map((test) => (
            <div className="list-row" key={test.id}>
              <div>
                <strong>{test.testId}</strong>
                <span>
                  {test.testDate} · {observations.filter((observation) => observation.testId === test.id).length} observations
                </span>
              </div>
              <StatusBadge status={test.status} />
            </div>
          ))}
          {history.length === 0 ? <p className="empty-state">No tests have been recorded for this instrument yet.</p> : null}
        </div>
      </section>
    </div>
  )
}
