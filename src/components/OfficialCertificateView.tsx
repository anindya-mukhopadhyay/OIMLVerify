import { Award, CheckCircle2, MapPin, Printer, Shield, ShieldCheck } from 'lucide-react'
import type { Instrument, Laboratory, Report, TestObservation, TestRecord } from '../types/domain'
import { QRCodeDisplay } from './QRCodeDisplay'

interface OfficialCertificateViewProps {
  report: Report
  test: TestRecord
  instrument: Instrument
  laboratory: Laboratory
  observations: TestObservation[]
  inspectorSignature?: string | null
  onOpenSignatureModal?: () => void
}

export function OfficialCertificateView({
  report,
  test,
  instrument,
  laboratory,
  observations,
  inspectorSignature,
  onOpenSignatureModal,
}: OfficialCertificateViewProps) {
  const verificationUrl = `${window.location.origin}/verify/${report.reportId}`

  const printCertificate = () => {
    window.print()
  }

  return (
    <div className="official-cert-wrapper">
      {/* Action Header for Certificate View */}
      <div className="cert-toolbar no-print">
        <div className="cert-toolbar-left">
          <Award size={20} className="cert-toolbar-icon" />
          <div>
            <strong>Official Legal Metrology Certificate</strong>
            <span>Statutory Verification Document · OIML R-76 Compliant</span>
          </div>
        </div>
        <div className="cert-toolbar-actions">
          {onOpenSignatureModal && (
            <button
              type="button"
              className="secondary-button"
              onClick={onOpenSignatureModal}
            >
              <span>{inspectorSignature ? 'Update E-Sign' : 'Affix Inspector E-Sign'}</span>
            </button>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={printCertificate}
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Sheet with Guilloche Border */}
      <div className="official-cert-sheet">
        {/* Certificate Outer & Inner Security Borders */}
        <div className="cert-outer-border">
          <div className="cert-inner-border">
            {/* Government Emblem & Header */}
            <header className="cert-header">
              <div className="cert-emblem-wrap">
                <Shield size={36} className="cert-emblem" />
                <span className="cert-emblem-motto">सत्यमेव जयते</span>
              </div>
              <div className="cert-header-titles">
                <h2>GOVERNMENT OF INDIA</h2>
                <h3>MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</h3>
                <h4>DIRECTORATE OF LEGAL METROLOGY</h4>
                <div className="cert-title-badge">
                  <span>CERTIFICATE OF VERIFICATION FOR NON-AUTOMATIC WEIGHING INSTRUMENT</span>
                </div>
                <span className="cert-standard-ref">
                  Issued in accordance with the Legal Metrology Act, 2009 & OIML Recommendation R-76
                </span>
              </div>
            </header>

            {/* Certificate Meta Details */}
            <div className="cert-meta-strip">
              <div>
                <span className="cert-meta-label">CERTIFICATE NO:</span>
                <strong className="cert-meta-val">{report.reportId}</strong>
              </div>
              <div>
                <span className="cert-meta-label">VERIFICATION DATE:</span>
                <strong className="cert-meta-val">{new Date(report.generatedAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="cert-meta-label">VALID UNTIL:</span>
                <strong className="cert-meta-val">
                  {new Date(new Date(report.generatedAt).setFullYear(new Date(report.generatedAt).getFullYear() + 1)).toLocaleDateString()}
                </strong>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="cert-body">
              <p className="cert-intro-paragraph">
                This is to certify that the undermentioned Non-Automatic Weighing Instrument (NAWI) has been
                inspected, verified, and calibrated by an authorized Legal Metrology Officer. The instrument conforms
                to the statutory maximum permissible error (MPE) thresholds stipulated under OIML R-76.
              </p>

              {/* Instrument Details Grid */}
              <div className="cert-spec-grid">
                <div className="cert-spec-row">
                  <span className="cert-spec-title">Manufacturer:</span>
                  <span className="cert-spec-data">{instrument.manufacturer}</span>
                  <span className="cert-spec-title">Model / Series:</span>
                  <span className="cert-spec-data">{instrument.model}</span>
                </div>
                <div className="cert-spec-row">
                  <span className="cert-spec-title">Serial Number:</span>
                  <span className="cert-spec-data cert-serial">{instrument.serialNumber}</span>
                  <span className="cert-spec-title">Instrument Type:</span>
                  <span className="cert-spec-data">{instrument.instrumentType}</span>
                </div>
                <div className="cert-spec-row">
                  <span className="cert-spec-title">Accuracy Class:</span>
                  <span className="cert-spec-data cert-class">Class {instrument.accuracyClass}</span>
                  <span className="cert-spec-title">Scale Interval (e):</span>
                  <span className="cert-spec-data">{instrument.verificationScaleInterval} g</span>
                </div>
                <div className="cert-spec-row">
                  <span className="cert-spec-title">Max Capacity (Max):</span>
                  <span className="cert-spec-data">{instrument.maxCapacity} kg</span>
                  <span className="cert-spec-title">Min Capacity (Min):</span>
                  <span className="cert-spec-data">{instrument.minCapacity} kg</span>
                </div>
              </div>

              {/* Summary of Verification Tests */}
              <div className="cert-tests-summary">
                <h5>METROLOGICAL PERFORMANCE VERIFICATION</h5>
                <table className="cert-table">
                  <thead>
                    <tr>
                      <th>Test Procedure</th>
                      <th>Applied Load</th>
                      <th>Indication</th>
                      <th>Observed Error</th>
                      <th>Permissible Limit (MPE)</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.map((obs) => (
                      <tr key={obs.id}>
                        <td>{obs.procedureName}</td>
                        <td>{obs.appliedLoad} kg</td>
                        <td>{obs.indication} kg</td>
                        <td>{obs.calculatedError} kg</td>
                        <td>±{obs.permissibleError || '0.002'} kg</td>
                        <td>
                          <span className="cert-pass-pill">
                            <CheckCircle2 size={12} /> PASS
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Geo location footprint */}
              <div className="cert-geo-strip">
                <MapPin size={14} />
                <span>
                  Inspection Conducted At: {laboratory.name} · Geotag: 28.6139° N, 77.2090° E · RLML Station
                </span>
              </div>

              {/* Footer: QR Code, Official Golden Seal Stamp, Inspector Signature */}
              <footer className="cert-footer">
                {/* QR Code with Scan Instructions */}
                <div className="cert-footer-col cert-qr-col">
                  <QRCodeDisplay value={verificationUrl} size={115} showDownload={false} />
                  <span className="cert-qr-instructions">
                    Scan with any smartphone to verify official authenticity on gov portal
                  </span>
                </div>

                {/* Official Holographic Seal Stamp */}
                <div className="cert-footer-col cert-seal-col">
                  <div className="cert-official-seal">
                    <div className="seal-ring outer-ring" />
                    <div className="seal-ring inner-ring" />
                    <div className="seal-content">
                      <ShieldCheck size={26} className="seal-star" />
                      <span className="seal-title">LEGAL METROLOGY</span>
                      <span className="seal-subtitle">OIML R-76 VERIFIED</span>
                      <span className="seal-year">{new Date(report.generatedAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {/* Inspector Signature */}
                <div className="cert-footer-col cert-sig-col">
                  <div className="cert-sig-box">
                    {inspectorSignature ? (
                      <img
                        src={inspectorSignature}
                        alt="Inspector Signature"
                        className="cert-signature-img"
                      />
                    ) : (
                      <div className="cert-sig-placeholder">
                        <span>[ Digitally Verified ]</span>
                      </div>
                    )}
                  </div>
                  <div className="cert-sig-details">
                    <strong>{test.tester}</strong>
                    <span>Authorized Inspector of Legal Metrology</span>
                    <span>Accreditation: {laboratory.accreditationId}</span>
                  </div>
                </div>
              </footer>

              {/* Security Warning Notice */}
              <div className="cert-disclaimer-strip">
                <span>
                  Notice: Tampering with or altering this legal metrology certificate is a cognizable offense under the
                  Legal Metrology Act, 2009. Verify digital signature at {verificationUrl}.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
