import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Camera, CheckCircle2, FilePlus2, PenTool, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CameraCaptureModal } from '../components/CameraCaptureModal'
import { PageHeader } from '../components/PageHeader'
import { SignaturePadModal } from '../components/SignaturePadModal'
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
    registerAttachment,
    reports,
    tests,
    updateTestStatus,
  } = useLabData()
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const test = tests.find((item) => item.id === id)
  const instrument = instruments.find((item) => item.id === test?.instrumentId)
  const testObservations = observations.filter((observation) => observation.testId === id)
  const testReports = reports.filter((report) => report.testId === id)
  const testAttachments = attachments.filter((attachment) => attachment.testId === id)

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
    setToastMessage('Observation logged into statutory record.')
    setTimeout(() => setToastMessage(null), 4000)
  }

  const onGenerateReport = () => {
    const report = generateReport(test.id, user?.displayName ?? 'Unknown user')
    navigate(`/reports/${report.id}`)
  }

  const handleCameraCapture = (file: File, metadata: { geo?: string; timestamp: string }) => {
    registerAttachment({
      testId: test.id,
      fileName: file.name,
      kind: 'Test Photograph',
      storagePath: `evidence/${test.id}/${file.name}`,
      uploadedBy: user?.displayName ?? 'Field Inspector',
    })
    setToastMessage(`Inspection photo captured with Geotag [${metadata.geo || 'Laboratory Station'}]!`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Test detail" title={test.testId}>
        <div className="page-actions">
          <Link className="secondary-button" to="/tests">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setIsCameraOpen(true)}
            title="Open camera to capture geotagged scale evidence photo"
          >
            <Camera size={18} />
            <span>Take Photo</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setIsSignModalOpen(true)}
            title="Affix inspector digital e-signature"
          >
            <PenTool size={18} />
            <span>{inspectorSignature ? 'Signature Affixed' : 'E-Sign'}</span>
          </button>
          <button type="button" className="primary-button" onClick={onGenerateReport}>
            <FilePlus2 size={18} />
            <span>Generate Certificate</span>
          </button>
        </div>
      </PageHeader>

      {toastMessage && (
        <div className="toast-banner">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="detail-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Test Header</h3>
            <StatusBadge status={test.status} />
          </div>
          <dl className="definition-grid">
            <dt>Instrument</dt>
            <dd>{instrument ? `${instrument.manufacturer} ${instrument.model}` : 'Unknown instrument'}</dd>
            <dt>Accuracy Class</dt>
            <dd>Class {instrument?.accuracyClass ?? 'III'}</dd>
            <dt>Tester</dt>
            <dd>{test.tester}</dd>
            <dt>Laboratory</dt>
            <dd>{test.laboratory}</dd>
            <dt>Test date</dt>
            <dd>{test.testDate}</dd>
            <dt>Temperature</dt>
            <dd>{test.temperature} °C</dd>
            <dt>Humidity</dt>
            <dd>{test.humidity}%</dd>
            <dt>Reference equipment</dt>
            <dd>{test.referenceEquipment}</dd>
            <dt>Evidence Photos</dt>
            <dd>{testAttachments.length} items registered</dd>
          </dl>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Statutory Status & Reports</h3>
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
        <strong>OIML R-76 Rules Notice</strong>
        <p>
          This evaluation engine performs conformity checks against Maximum Permissible Error (MPE) thresholds for Class
          {instrument?.accuracyClass ?? 'III'} Non-Automatic Weighing Instruments.
        </p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h3>Add Test Observation</h3>
          <span>Record load calibration point</span>
        </div>
        <form className="form-grid two-column" onSubmit={handleSubmit(onAddObservation)}>
          <label>
            Procedure / Name
            <input {...register('procedureName')} placeholder="e.g. Weighing Performance 10kg" />
            {errors.procedureName ? <small>{errors.procedureName.message}</small> : null}
          </label>
          <label>
            Test conditions
            <input {...register('testConditions')} placeholder="e.g. Standard ambient temperature" />
            {errors.testConditions ? <small>{errors.testConditions.message}</small> : null}
          </label>
          <label>
            Applied load (kg)
            <input type="number" step="0.001" {...register('appliedLoad')} />
            {errors.appliedLoad ? <small>{errors.appliedLoad.message}</small> : null}
          </label>
          <label>
            Indication (kg)
            <input type="number" step="0.001" {...register('indication')} />
            {errors.indication ? <small>{errors.indication.message}</small> : null}
          </label>
          <label>
            Permissible error (±kg)
            <input type="number" step="0.001" {...register('permissibleError')} placeholder="0.002" />
          </label>
          <label className="full-span">
            Notes & Observations
            <textarea rows={2} {...register('notes')} placeholder="Observation details, eccentric loading notes..." />
          </label>
          <div className="full-span page-actions">
            <button type="submit" className="primary-button">
              <Save size={18} />
              <span>Add Observation</span>
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsCameraOpen(true)}
            >
              <Camera size={18} />
              <span>Attach Live Photo</span>
            </button>
          </div>
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
                <td>{observation.appliedLoad} kg</td>
                <td>{observation.indication} kg</td>
                <td>{observation.calculatedError} kg</td>
                <td>±{observation.permissibleError ?? '0.002'} kg</td>
                <td>{attachments.filter((attachment) => observation.attachmentIds.includes(attachment.id)).length}</td>
                <td><StatusBadge status={observation.result} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title={`Take Photo for Test ${test.testId}`}
      />

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(dataUrl) => {
          setInspectorSignature(dataUrl)
          setToastMessage('Inspector signature affixed to test audit record!')
          setTimeout(() => setToastMessage(null), 4000)
        }}
        officerName={test.tester}
        officerRole="Senior Legal Metrology Officer"
      />
    </div>
  )
}
