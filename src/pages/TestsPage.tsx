import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Plus, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/authState'
import { useLabData } from '../context/labDataState'
import { testSchema, type TestForm, type TestInput } from '../validation/schemas'

export function TestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createTest, instruments, observations, referenceEquipment, tests } = useLabData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestInput, unknown, TestForm>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testId: `MW-NAWI-${new Date().getFullYear()}-${String(tests.length + 1).padStart(4, '0')}`,
      instrumentId: instruments[0]?.id ?? '',
      testDate: new Date().toISOString().slice(0, 10),
      tester: user?.displayName ?? '',
      laboratory: 'Regional Legal Metrology Laboratory',
      environmentalConditions: '',
      temperature: 25,
      humidity: 50,
      referenceEquipment: referenceEquipment[0]?.name ?? '',
      notes: '',
      status: 'Draft',
    },
  })

  const filtered = useMemo(() => {
    const query = search.toLowerCase()

    return tests.filter((test) => {
      const instrument = instruments.find((item) => item.id === test.instrumentId)
      const matchesQuery = `${test.testId} ${test.tester} ${instrument?.manufacturer ?? ''} ${instrument?.model ?? ''}`
        .toLowerCase()
        .includes(query)
      const matchesStatus = status === 'All' || test.status === status

      return matchesQuery && matchesStatus
    })
  }, [instruments, search, status, tests])

  const onSubmit = (values: TestForm) => {
    const record = createTest(values, user?.displayName ?? 'Unknown user')
    reset()
    setFormOpen(false)
    navigate(`/tests/${record.id}`)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Test register" title="Test Management">
        <button type="button" className="primary-button" onClick={() => setFormOpen(true)}>
          <Plus size={18} />
          <span>Create test</span>
        </button>
      </PageHeader>
      <section className="toolbar">
        <label>
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Test ID, tester, instrument" />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {['All', 'Draft', 'In Progress', 'Review', 'Approved', 'Failed'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>
      {formOpen ? (
        <section className="panel">
          <div className="panel-heading">
            <h3>Create Test</h3>
            <button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X size={18} />
            </button>
          </div>
          <form className="form-grid two-column" onSubmit={handleSubmit(onSubmit)}>
            <label>
              Test ID
              <input {...register('testId')} />
              {errors.testId ? <small>{errors.testId.message}</small> : null}
            </label>
            <label>
              Instrument
              <select {...register('instrumentId')}>
                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.manufacturer} {instrument.model} · {instrument.serialNumber}
                  </option>
                ))}
              </select>
              {errors.instrumentId ? <small>{errors.instrumentId.message}</small> : null}
            </label>
            <label>
              Test date
              <input type="date" {...register('testDate')} />
              {errors.testDate ? <small>{errors.testDate.message}</small> : null}
            </label>
            <label>
              Tester
              <input {...register('tester')} />
              {errors.tester ? <small>{errors.tester.message}</small> : null}
            </label>
            <label>
              Laboratory
              <input {...register('laboratory')} />
              {errors.laboratory ? <small>{errors.laboratory.message}</small> : null}
            </label>
            <label>
              Reference equipment
              <input {...register('referenceEquipment')} />
              {errors.referenceEquipment ? <small>{errors.referenceEquipment.message}</small> : null}
            </label>
            <label>
              Temperature
              <input type="number" step="0.1" {...register('temperature')} />
              {errors.temperature ? <small>{errors.temperature.message}</small> : null}
            </label>
            <label>
              Humidity
              <input type="number" step="0.1" {...register('humidity')} />
              {errors.humidity ? <small>{errors.humidity.message}</small> : null}
            </label>
            <label>
              Status
              <select {...register('status')}>
                {['Draft', 'In Progress', 'Review', 'Approved', 'Failed'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="full-span">
              Environmental conditions
              <textarea rows={3} {...register('environmentalConditions')} />
              {errors.environmentalConditions ? <small>{errors.environmentalConditions.message}</small> : null}
            </label>
            <label className="full-span">
              Notes
              <textarea rows={3} {...register('notes')} />
            </label>
            <button type="submit" className="primary-button">
              <Save size={18} />
              <span>Create test</span>
            </button>
          </form>
        </section>
      ) : null}
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Instrument</th>
              <th>Date</th>
              <th>Tester</th>
              <th>Observations</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((test) => {
              const instrument = instruments.find((item) => item.id === test.instrumentId)
              return (
                <tr key={test.id}>
                  <td>
                    <strong>{test.testId}</strong>
                    <span>{test.laboratory}</span>
                  </td>
                  <td>{instrument ? `${instrument.manufacturer} ${instrument.model}` : 'Unknown instrument'}</td>
                  <td>{test.testDate}</td>
                  <td>{test.tester}</td>
                  <td>{observations.filter((observation) => observation.testId === test.id).length}</td>
                  <td><StatusBadge status={test.status} /></td>
                  <td>
                    <Link className="icon-button" to={`/tests/${test.id}`} aria-label="View test">
                      <Eye size={17} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
