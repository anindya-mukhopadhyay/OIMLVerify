import { UploadCloud } from 'lucide-react'
import { useState } from 'react'
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
  const relevantObservations = observations.filter((observation) => observation.testId === testId)

  const onUpload = async () => {
    if (!file || !testId) {
      setMessage('Choose a test and file before registering evidence.')
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
      setMessage(firebaseEnabled ? 'Evidence uploaded to Firebase Storage.' : 'Evidence registered in demo mode.')
      setFile(null)
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Evidence upload failed.')
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Firebase Storage ready" title="Evidence Management" />
      <section className="panel">
        <div className="panel-heading">
          <h3>Register Evidence</h3>
          <span>{firebaseEnabled ? 'Uploads to Firebase Storage' : 'Demo storage path only'}</span>
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
          <label>
            File
            <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
          <button type="button" className="primary-button" onClick={onUpload}>
            <UploadCloud size={18} />
            <span>Register evidence</span>
          </button>
          {message ? <p className="form-message">{message}</p> : null}
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
    </div>
  )
}
