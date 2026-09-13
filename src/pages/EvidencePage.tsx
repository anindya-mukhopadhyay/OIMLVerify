import { Camera, Check, MapPin, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { CameraCaptureModal } from '../components/CameraCaptureModal'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/authState'
import { useLabData } from '../context/labDataState'
import { buildEvidenceStoragePath, uploadEvidence } from '../services/evidenceService'
import type { AttachmentKind } from '../types/domain'

const evidenceKinds: AttachmentKind[] = [
  'Test Photograph',
  'Supporting Document',
  'Calibration Certificate',
  'Other Evidence',
]

export function EvidencePage() {
  const { firebaseEnabled, user } = useAuth()
  const { attachments, observations, registerAttachment, tests } = useLabData()
  const [testId, setTestId] = useState(tests[0]?.id ?? '')
  const [observationId, setObservationId] = useState('')
  const [kind, setKind] = useState<AttachmentKind>('Test Photograph')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [geoStamp, setGeoStamp] = useState<string | null>(null)
  const relevantObservations = observations.filter((observation) => observation.testId === testId)

  const onUpload = async () => {
    if (!file || !testId) {
      setMessage('Choose a test and capture or choose a file before registering evidence.')
      return
    }

    try {
      const uploadInput = { file, testId, observationId: observationId || undefined, kind }
      const storageResult = firebaseEnabled
        ? await uploadEvidence(uploadInput)
        : { storagePath: buildEvidenceStoragePath(uploadInput), downloadUrl: undefined }

      registerAttachment({
        testId,
        observationId: observationId || undefined,
        fileName: file.name,
        kind,
        storagePath: storageResult.storagePath,
        downloadUrl: storageResult.downloadUrl,
        uploadedBy: user?.displayName ?? 'Unknown user',
      })
      setMessage(
        firebaseEnabled
          ? `Evidence uploaded to Firebase Storage${geoStamp ? ` with Geotag [${geoStamp}]` : ''}.`
          : `Evidence registered in demo mode${geoStamp ? ` with Geotag [${geoStamp}]` : ''}.`,
      )
      setFile(null)
      setGeoStamp(null)
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Evidence upload failed.')
    }
  }

  const handleCameraCapture = (capturedFile: File, metadata: { geo?: string; timestamp: string }) => {
    setFile(capturedFile)
    setKind('Test Photograph')
    setGeoStamp(metadata.geo || null)
    setMessage(`Live inspection photo captured (${metadata.geo ? `GPS: ${metadata.geo}` : 'Ready to register'}).`)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Field Verification & Storage" title="Evidence Management">
        <button
          type="button"
          className="primary-button"
          onClick={() => setIsCameraOpen(true)}
        >
          <Camera size={18} />
          <span>Open Live Camera</span>
        </button>
      </PageHeader>

      <section className="panel">
        <div className="panel-heading">
          <h3>Register Evidence & Field Photos</h3>
          <span>{firebaseEnabled ? 'Uploads to Firebase Storage' : 'Demo storage path mode'}</span>
        </div>

        <div className="form-grid two-column">
          <label>
            Test
            <select value={testId} onChange={(event) => setTestId(event.target.value)}>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>{test.testId}</option>
              ))}
            </select>
          </label>
          <label>
            Observation
            <select value={observationId} onChange={(event) => setObservationId(event.target.value)}>
              <option value="">Test-level evidence</option>
              {relevantObservations.map((observation) => (
                <option key={observation.id} value={observation.id}>{observation.procedureName}</option>
              ))}
            </select>
          </label>
          <label>
            Evidence type
            <select value={kind} onChange={(event) => setKind(event.target.value as AttachmentKind)}>
              {evidenceKinds.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="evidence-input-group">
            <label>
              Select Existing File or Capture Photo
              <div className="file-or-camera-row">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null)
                    setGeoStamp(null)
                  }}
                />
                <button
                  type="button"
                  className="secondary-button quick-camera-btn"
                  onClick={() => setIsCameraOpen(true)}
                  title="Click to take instant photo with camera and geotag"
                >
                  <Camera size={16} />
                  <span>Take Photo</span>
                </button>
              </div>
            </label>
          </div>

          {file && (
            <div className="evidence-file-preview full-span">
              <Check size={16} className="preview-check-icon" />
              <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
              {geoStamp && (
                <span className="preview-geo-badge">
                  <MapPin size={12} />
                  {geoStamp}
                </span>
              )}
            </div>
          )}

          <div className="full-span">
            <button type="button" className="primary-button" onClick={onUpload} disabled={!file}>
              <UploadCloud size={18} />
              <span>Register Evidence</span>
            </button>
          </div>

          {message ? <p className="form-message full-span">{message}</p> : null}
        </div>
      </section>

      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Type</th>
              <th>Linked test</th>
              <th>Storage path</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map((attachment) => (
              <tr key={attachment.id}>
                <td>
                  <strong>{attachment.fileName}</strong>
                  <span>{attachment.uploadedBy}</span>
                </td>
                <td>{attachment.kind}</td>
                <td>{tests.find((test) => test.id === attachment.testId)?.testId ?? attachment.testId}</td>
                <td>{attachment.storagePath}</td>
                <td>{new Date(attachment.uploadedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Capture Field Inspection Evidence"
      />
    </div>
  )
}
