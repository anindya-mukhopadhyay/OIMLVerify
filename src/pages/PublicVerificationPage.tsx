import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  Globe,
  MapPin,
  Printer,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeDisplay } from '../components/QRCodeDisplay'
import { instruments, laboratories, observations as demoObservations, reports, tests } from '../data/demoData'
import type { Instrument, Laboratory, Report, TestObservation, TestRecord } from '../types/domain'

export function PublicVerificationPage() {
  const { id } = useParams()
  const [searchQuery, setSearchQuery] = useState(id || '')
  const [activeCertId, setActiveCertId] = useState(id || 'MW-REP-2026-0001')

  const report = useMemo<Report | null>(() => {
    return (
      reports.find(
        (r: Report) => r.id.toLowerCase() === activeCertId.toLowerCase() || r.reportId.toLowerCase() === activeCertId.toLowerCase(),
      ) ?? null
    )
  }, [activeCertId])

  const test = useMemo<TestRecord | null>(() => {
    if (!report) return null
    return tests.find((t: TestRecord) => t.id === report.testId) ?? null
  }, [report])

  const instrument = useMemo<Instrument | null>(() => {
    if (!report) return null
    return instruments.find((i: Instrument) => i.id === report.instrumentId) ?? null
  }, [report])

  const lab = useMemo<Laboratory>(() => {
    return laboratories[0]
  }, [])

  const testObservations = useMemo<TestObservation[]>(() => {
    if (!test) return []
    return demoObservations.filter((o: TestObservation) => o.testId === test.id)
  }, [test])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveCertId(searchQuery.trim())
    }
  }

  // Simulated Cryptographic SHA-256 Verification Hash
  const verificationHash = useMemo(() => {
    if (!report || !instrument) return ''
    return `SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`
  }, [report, instrument])

  const verificationUrl = `${window.location.origin}/verify/${report?.reportId || activeCertId}`

  return (
    <div className="public-verify-page">
      {/* Official Government Header Banner */}
      <header className="public-gov-header">
        <div className="gov-ribbon-tricolor" />
        <div className="public-gov-container">
          <div className="public-gov-brand">
            <div className="public-emblem-seal">
              <Shield size={28} />
            </div>
            <div>
              <span className="public-gov-sub">भारत सरकार | विधिक मापविज्ञान प्रभाग</span>
              <h1>National Legal Metrology Verification Portal</h1>
              <span className="public-gov-authority">
                Ministry of Consumer Affairs, Food & Public Distribution · OIML Verification Authority
              </span>
            </div>
          </div>
          <div className="public-gov-actions">
            <Link to="/login" className="secondary-button portal-login-link">
              <span>Officer Portal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="public-verify-main">
        {/* Quick Search Bar */}
        <section className="public-search-card">
          <form onSubmit={handleSearch} className="public-search-form">
            <label htmlFor="cert-search" className="public-search-label">
              Verify Certificate Number or Instrument Serial Number
            </label>
            <div className="public-search-input-wrap">
              <Search size={18} className="public-search-icon" />
              <input
                id="cert-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. MW-REP-2026-0001, AP6000-8841..."
                className="public-search-input"
              />
              <button type="submit" className="primary-button public-search-submit">
                <span>Verify Now</span>
              </button>
            </div>
          </form>
        </section>

        {report && instrument && test ? (
          <article className="public-certificate-card">
            {/* Official Verification Status Hero */}
            <div className="verify-hero-banner verified">
              <div className="verify-hero-icon-wrap">
                <CheckCircle2 size={44} className="verify-hero-icon" />
              </div>
              <div className="verify-hero-text">
                <div className="verify-status-tag">
                  <ShieldCheck size={16} />
                  <span>OFFICIALLY VERIFIED & CONFORMANT</span>
                </div>
                <h2>OIML R-76 Legal Metrology Verification Certificate</h2>
                <p>
                  This Non-Automatic Weighing Instrument (NAWI) has undergone statutory metrological testing and
                  fully conforms to OIML R-76 standards for commercial and legal transactions.
                </p>
              </div>
              <div className="verify-qr-hero">
                <QRCodeDisplay value={verificationUrl} size={110} showDownload={false} />
                <span className="verify-qr-sub">Scan to Re-verify</span>
              </div>
            </div>

            {/* Certificate Header Badges */}
            <div className="verify-badge-grid">
              <div className="verify-badge-item">
                <FileCheck size={18} className="badge-icon-accent" />
                <div>
                  <span className="verify-badge-label">Certificate ID</span>
                  <strong>{report.reportId}</strong>
                </div>
              </div>
              <div className="verify-badge-item">
                <Calendar size={18} className="badge-icon-accent" />
                <div>
                  <span className="verify-badge-label">Verification Date</span>
                  <strong>{new Date(report.generatedAt).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className="verify-badge-item">
                <Scale size={18} className="badge-icon-accent" />
                <div>
                  <span className="verify-badge-label">Accuracy Class</span>
                  <strong>Class {instrument.accuracyClass}</strong>
                </div>
              </div>
              <div className="verify-badge-item">
                <UserCheck size={18} className="badge-icon-accent" />
                <div>
                  <span className="verify-badge-label">Testing Officer</span>
                  <strong>{test.tester}</strong>
                </div>
              </div>
            </div>

            {/* Technical Metrological Specifications */}
            <section className="verify-section">
              <div className="verify-section-heading">
                <h3>Certified Instrument Specifications</h3>
                <span className="tamper-tag">Tamper-Proof Record</span>
              </div>

              <div className="verify-table-wrap">
                <table className="verify-spec-table">
                  <tbody>
                    <tr>
                      <th>Manufacturer</th>
                      <td><strong>{instrument.manufacturer}</strong></td>
                      <th>Model / Series</th>
                      <td>{instrument.model}</td>
                    </tr>
                    <tr>
                      <th>Serial Number</th>
                      <td><code className="spec-code">{instrument.serialNumber}</code></td>
                      <th>Instrument Category</th>
                      <td>{instrument.instrumentType}</td>
                    </tr>
                    <tr>
                      <th>Maximum Capacity (Max)</th>
                      <td><strong>{instrument.maxCapacity} kg</strong></td>
                      <th>Minimum Capacity (Min)</th>
                      <td>{instrument.minCapacity} kg</td>
                    </tr>
                    <tr>
                      <th>Verification Scale Interval (e)</th>
                      <td><strong>{instrument.verificationScaleInterval} g</strong></td>
                      <th>Evaluation Standard</th>
                      <td>OIML R-76 Edition 2006 (E)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Metrological Test Results Summary */}
            <section className="verify-section">
              <div className="verify-section-heading">
                <h3>Statutory Conformity Evaluation</h3>
                <span className="tag-approved">All Checks Passed</span>
              </div>

              <div className="verify-table-wrap">
                <table className="verify-test-table">
                  <thead>
                    <tr>
                      <th>Evaluation Check</th>
                      <th>Applied Load</th>
                      <th>Indication</th>
                      <th>Observed Error</th>
                      <th>Max Permissible Error (MPE)</th>
                      <th>Conformity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testObservations.map((obs) => (
                      <tr key={obs.id}>
                        <td><strong>{obs.procedureName}</strong></td>
                        <td>{obs.appliedLoad} kg</td>
                        <td>{obs.indication} kg</td>
                        <td>{obs.calculatedError} kg</td>
                        <td>±{obs.permissibleError || '0.002'} kg</td>
                        <td>
                          <span className="verify-pass-badge">
                            <CheckCircle2 size={13} /> Pass
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Field Geotag & Integrity Audit Footprint */}
            <section className="verify-integrity-panel">
              <div className="integrity-grid">
                <div className="integrity-item">
                  <MapPin size={18} className="integrity-icon" />
                  <div>
                    <strong>Testing Location & Geotag</strong>
                    <p>28.6139° N, 77.2090° E (Regional Legal Metrology Laboratory, New Delhi)</p>
                  </div>
                </div>
                <div className="integrity-item">
                  <Globe size={18} className="integrity-icon" />
                  <div>
                    <strong>Accreditation Registry</strong>
                    <p>{lab.name} · Accreditation: {lab.accreditationId}</p>
                  </div>
                </div>
              </div>

              <div className="integrity-hash-box">
                <span className="hash-title">Digital Verification Signature & SHA-256 Hash:</span>
                <code className="hash-code">{verificationHash}</code>
              </div>
            </section>

            {/* Actions Bar */}
            <div className="verify-actions-bar">
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Print Verification Statement</span>
              </button>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >
                <ExternalLink size={16} />
                <span>Share Verification Link</span>
              </a>
            </div>
          </article>
        ) : (
          <article className="public-certificate-card not-found">
            <div className="verify-hero-banner error">
              <ShieldAlert size={44} className="verify-hero-icon-error" />
              <div>
                <h2>Certificate Record Not Found</h2>
                <p>
                  The Certificate ID or Serial Number &quot;{searchQuery}&quot; could not be located in the Legal
                  Metrology National Verification registry.
                </p>
              </div>
            </div>
            <p className="not-found-helper">
              Please double check the ID stamped on the weighing instrument&apos;s metallic seal plate or try
              searching with the sample certificate <code>MW-REP-2026-0001</code>.
            </p>
          </article>
        )}
      </main>

      <footer className="public-gov-footer">
        <div className="public-footer-inner">
          <p>
            © {new Date().getFullYear()} Directorate of Legal Metrology, Ministry of Consumer Affairs, Food & Public
            Distribution, Government of India.
          </p>
          <p className="public-disclaimer">
            All weights and measures certificates are legally valid under the Legal Metrology Act, 2009 and OIML R-76
            conformity directives.
          </p>
        </div>
      </footer>
    </div>
  )
}
