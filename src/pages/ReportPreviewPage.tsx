import { ArrowLeft, Award, ExternalLink, FileText, PenTool } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { OfficialCertificateView } from '../components/OfficialCertificateView'
import { PageHeader } from '../components/PageHeader'
import { QRCodeDisplay } from '../components/QRCodeDisplay'
import { SignaturePadModal } from '../components/SignaturePadModal'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/authState'
import { useLabData } from '../context/labDataState'

export function ReportPreviewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { attachments, instruments, laboratories, observations, reports, tests } = useLabData()
  const [viewMode, setViewMode] = useState<'certificate' | 'technical'>('certificate')
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null)

  const report = reports.find((item) => item.id === id || item.reportId === id)

  if (!report) {
    return <Navigate to="/reports" replace />
  }

  const test = tests.find((item) => item.id === report.testId)
  const instrument = instruments.find((item) => item.id === report.instrumentId)
  const lab = laboratories.find((item) => item.name === test?.laboratory) ?? laboratories[0]
  const testObservations = observations.filter((observation) => observation.testId === report.testId)
  const testAttachments = attachments.filter((attachment) => attachment.testId === report.testId)

  if (!test || !instrument) {
    return <Navigate to="/reports" replace />
  }

  const verificationUrl = `${window.location.origin}/verify/${report.reportId}`

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Report & Certification" title={report.reportId}>
        <div className="report-header-controls">
          <Link className="secondary-button" to="/reports">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <div className="report-mode-toggle">
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'certificate' ? 'active' : ''}`}
              onClick={() => setViewMode('certificate')}
            >
              <Award size={16} />
              <span>Official Certificate</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'technical' ? 'active' : ''}`}
              onClick={() => setViewMode('technical')}
            >
              <FileText size={16} />
              <span>Technical Data</span>
            </button>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setIsSignModalOpen(true)}
          >
            <PenTool size={16} />
            <span>{inspectorSignature ? 'Update E-Sign' : 'E-Sign'}</span>
          </button>
          <a
            href={verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="secondary-button"
            title="Open Public QR Verification Portal"
          >
            <ExternalLink size={16} />
            <span>Public Verify</span>
          </a>
        </div>
      </PageHeader>

      {viewMode === 'certificate' ? (
        <OfficialCertificateView
          report={report}
          test={test}
          instrument={instrument}
          laboratory={lab}
          observations={testObservations}
          inspectorSignature={inspectorSignature}
          onOpenSignatureModal={() => setIsSignModalOpen(true)}
        />
      ) : (
        <article className="report-preview">
          <header className="report-header">
            <div>
              <span className="eyebrow">Non-Automatic Weighing Instrument</span>
              <h2>Test Report Preview</h2>
              <p>Prepared for OIML R-76 evaluation workflow. Regulatory calculations require verified rule modules.</p>
            </div>
            <div className="report-header-right">
              <div className="report-id">
                <FileText size={24} />
                <strong>{report.reportId}</strong>
                <StatusBadge status={report.status} />
              </div>
              <div className="report-qr-mini">
                <QRCodeDisplay value={verificationUrl} size={90} />
                <span className="qr-mini-sub">Scan to verify</span>
              </div>
            </div>
          </header>

          <section className="report-section">
            <h3>Instrument Information</h3>
            <dl className="definition-grid three-column">
              <dt>Manufacturer</dt>
              <dd>{instrument?.manufacturer}</dd>
              <dt>Model</dt>
              <dd>{instrument?.model}</dd>
              <dt>Serial number</dt>
              <dd>{instrument?.serialNumber}</dd>
              <dt>Instrument type</dt>
              <dd>{instrument?.instrumentType}</dd>
              <dt>Accuracy class</dt>
              <dd>{instrument?.accuracyClass}</dd>
              <dt>Capacity</dt>
              <dd>{instrument?.minCapacity} - {instrument?.maxCapacity}</dd>
            </dl>
          </section>

          <section className="report-section">
            <h3>Laboratory and Test Information</h3>
            <dl className="definition-grid three-column">
              <dt>Laboratory</dt>
              <dd>{lab?.name}</dd>
              <dt>Accreditation</dt>
              <dd>{lab?.accreditationId}</dd>
              <dt>Tester</dt>
              <dd>{test?.tester}</dd>
              <dt>Test date</dt>
              <dd>{test?.testDate}</dd>
              <dt>Temperature</dt>
              <dd>{test?.temperature} C</dd>
              <dt>Humidity</dt>
              <dd>{test?.humidity}%</dd>
            </dl>
            <p className="muted-block">{test?.environmentalConditions}</p>
          </section>

          <section className="report-section">
            <h3>Test Observations and Calculations</h3>
            <div className="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Procedure</th>
                    <th>Load</th>
                    <th>Indication</th>
                    <th>Error</th>
                    <th>Permissible Error</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {testObservations.map((observation) => (
                    <tr key={observation.id}>
                      <td>
                        <strong>{observation.procedureName}</strong>
                        <span>{observation.notes}</span>
                      </td>
                      <td>{observation.appliedLoad}</td>
                      <td>{observation.indication}</td>
                      <td>{observation.calculatedError}</td>
                      <td>{observation.permissibleError ?? 'Reviewer required'}</td>
                      <td><StatusBadge status={observation.result} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-section">
            <h3>Evidence and Attachments</h3>
            <div className="list">
              {testAttachments.map((attachment) => (
                <div className="list-row" key={attachment.id}>
                  <div>
                    <strong>{attachment.fileName}</strong>
                    <span>{attachment.kind} · {attachment.storagePath}</span>
                  </div>
                </div>
              ))}
              {testAttachments.length === 0 ? <p className="empty-state">No evidence has been linked to this report.</p> : null}
            </div>
          </section>

          <section className="report-section">
            <h3>Notes</h3>
            <p>{report.notes}</p>
          </section>
        </article>
      )}

      {/* Digital Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(dataUrl) => setInspectorSignature(dataUrl)}
        officerName={user?.displayName ?? test.tester}
        officerRole={user?.role ?? 'Authorized Metrological Officer'}
      />
    </div>
  )
}
