import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, FilePlus2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/authState'
import { useLabData } from '../context/labDataState'
import type { TestStatus } from '../types/domain'
import { observationSchema, type ObservationForm, type ObservationInput } from '../validation/schemas'

export function TestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    addObservation,
    attachments,
    generateReport,
    instruments,
    observations,
    reports,
    tests,
    updateTestStatus,
  } = useLabData()
  const test = tests.find((item) => item.id === id)
  const instrument = instruments.find((item) => item.id === test?.instrumentId)
  const testObservations = observations.filter((observation) => observation.testId === id)
  const testReports = reports.filter((report) => report.testId === id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ObservationInput, unknown, ObservationForm>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      procedureName: '',
      testConditions: '',
      appliedLoad: 0,
      indication: 0,
      permissibleError: '',
      notes: '',
    },
  })

  if (!test) {
    return <Navigate to="/tests" replace />
  }

  const onAddObservation = (values: ObservationForm) => {
    addObservation(test.id, values, user?.displayName ?? 'Unknown user')
    reset()
  }

  const onGenerateReport = () => {
    const report = generateReport(test.id, user?.displayName ?? 'Unknown user')
    navigate(`/reports/${report.id}`)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Test detail" title={test.testId}>
        <Link className="secondary-button" to="/tests">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
        <button type="button" className="primary-button" onClick={onGenerateReport}>
          <FilePlus2 size={18} />
          <span>Generate report</span>
        </button>
      </PageHeader>
      <section className="detail-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Test Header</h3>
            <StatusBadge status={test.status} />
          </div>
          <dl className="definition-grid">
            <dt>Instrument</dt>
            <dd>{instrument ? `${instrument.manufacturer} ${instrument.model}` : 'Unknown instrument'}</dd>
            <dt>Tester</dt>
            <dd>{test.tester}</dd>
            <dt>Laboratory</dt>
            <dd>{test.laboratory}</dd>
            <dt>Test date</dt>
            <dd>{test.testDate}</dd>
            <dt>Temperature</dt>
            <dd>{test.temperature} C</dd>
            <dt>Humidity</dt>
            <dd>{test.humidity}%</dd>
            <dt>Reference equipment</dt>
            <dd>{test.referenceEquipment}</dd>
          </dl>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Workflow</h3>
            <span>{testReports.length} reports</span>
          </div>
          <label>
            Status
            <select
              value={test.status}
              onChange={(event) =>
                updateTestStatus(test.id, event.target.value as TestStatus, user?.displayName ?? 'Unknown user')
              }
            >
              {['Draft', 'In Progress', 'Review', 'Approved', 'Failed'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <p className="muted-block">{test.environmentalConditions}</p>
          <p>{test.notes}</p>
        </div>
      </section>
      <section className="panel warning-panel">
        <strong>Rules notice</strong>
        <p>
          The current engine uses a demo manual permissible error rule only. It does not encode official OIML R-76
          limits, formulas, or conformity requirements.
        </p>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h3>Add Observation</h3>
          <span>Reusable observation structure</span>
        </div>
        <form className="form-grid two-column" onSubmit={handleSubmit(onAddObservation)}>
          <label>
            Procedure/name
            <input {...register('procedureName')} />
            {errors.procedureName ? <small>{errors.procedureName.message}</small> : null}
          </label>
          <label>
            Test conditions
            <input {...register('testConditions')} />
            {errors.testConditions ? <small>{errors.testConditions.message}</small> : null}
          </label>
          <label>
            Applied load
            <input type="number" step="0.001" {...register('appliedLoad')} />
            {errors.appliedLoad ? <small>{errors.appliedLoad.message}</small> : null}
          </label>
          <label>
            Indication
            <input type="number" step="0.001" {...register('indication')} />
            {errors.indication ? <small>{errors.indication.message}</small> : null}
          </label>
          <label>
            Permissible error
            <input type="number" step="0.001" {...register('permissibleError')} />
          </label>
          <label className="full-span">
            Notes
            <textarea rows={3} {...register('notes')} />
          </label>
          <button type="submit" className="primary-button">
            <Save size={18} />
            <span>Add observation</span>
          </button>
        </form>
      </section>
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Procedure</th>
              <th>Applied Load</th>
              <th>Indication</th>
              <th>Error</th>
              <th>Permissible Error</th>
              <th>Evidence</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {testObservations.map((observation) => (
              <tr key={observation.id}>
                <td>
                  <strong>{observation.procedureName}</strong>
                  <span>{observation.testConditions}</span>
                </td>
                <td>{observation.appliedLoad}</td>
                <td>{observation.indication}</td>
                <td>{observation.calculatedError}</td>
                <td>{observation.permissibleError ?? 'Reviewer required'}</td>
                <td>{attachments.filter((attachment) => observation.attachmentIds.includes(attachment.id)).length}</td>
                <td><StatusBadge status={observation.result} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
