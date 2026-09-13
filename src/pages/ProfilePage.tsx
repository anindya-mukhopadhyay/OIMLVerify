import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/authState'
import { useLabData } from '../context/labDataState'
import { listRules } from '../services/ruleRegistry'

export function ProfilePage() {
  const { firebaseEnabled, user } = useAuth()
  const { laboratories } = useLabData()
  const activeLab = laboratories.find((lab) => lab.id === user?.laboratoryId)

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Account" title="User Profile" />
      <section className="detail-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Profile</h3>
            <ShieldCheck size={20} />
          </div>
          <dl className="definition-grid">
            <dt>Name</dt>
            <dd>{user?.displayName}</dd>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
            <dt>Authentication</dt>
            <dd>{firebaseEnabled ? 'Firebase Authentication' : 'Demo local session'}</dd>
          </dl>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Laboratory</h3>
          </div>
          <dl className="definition-grid">
            <dt>Name</dt>
            <dd>{activeLab?.name ?? laboratories[0]?.name}</dd>
            <dt>Location</dt>
            <dd>{activeLab?.location ?? laboratories[0]?.location}</dd>
            <dt>Accreditation</dt>
            <dd>{activeLab?.accreditationId ?? laboratories[0]?.accreditationId}</dd>
          </dl>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h3>Rule Versions</h3>
          <span>Compliance engine registry</span>
        </div>
        <div className="list">
          {listRules().map((rule) => (
            <div className="list-row" key={rule.id}>
              <div>
                <strong>{rule.label}</strong>
                <span>{rule.regulatoryBasis}</span>
              </div>
              <span className="status-badge status-review">{rule.version}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
