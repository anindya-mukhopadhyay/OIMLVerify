import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Eye, Plus, Save, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/authState'
import { useLabData } from '../context/labDataState'
import type { Instrument } from '../types/domain'
import { instrumentSchema, type InstrumentForm, type InstrumentInput } from '../validation/schemas'

const defaultInstrument: InstrumentInput = {
  manufacturer: '',
  model: '',
  serialNumber: '',
  instrumentType: '',
  accuracyClass: '',
  maxCapacity: 0,
  minCapacity: 0,
  verificationScaleInterval: 0,
  technicalSpecifications: '',
  notes: '',
}

export function InstrumentsPage() {
  const { user } = useAuth()
  const { createInstrument, deleteInstrument, instruments, tests, updateInstrument } = useLabData()
  const [search, setSearch] = useState('')
  const [accuracyClass, setAccuracyClass] = useState('All')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'manufacturer' | 'maxCapacity'>('updatedAt')
  const [editing, setEditing] = useState<Instrument | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstrumentInput, unknown, InstrumentForm>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: defaultInstrument,
  })

  const accuracyClasses = useMemo(
    () => ['All', ...Array.from(new Set(instruments.map((instrument) => instrument.accuracyClass)))],
    [instruments],
  )
  const filtered = useMemo(() => {
    const query = search.toLowerCase()

    return instruments
      .filter((instrument) => {
        const matchesQuery = [
          instrument.manufacturer,
          instrument.model,
          instrument.serialNumber,
          instrument.instrumentType,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
        const matchesClass = accuracyClass === 'All' || instrument.accuracyClass === accuracyClass

        return matchesQuery && matchesClass
      })
      .sort((first, second) => {
        if (sortBy === 'maxCapacity') {
          return second.maxCapacity - first.maxCapacity
        }

        return String(second[sortBy]).localeCompare(String(first[sortBy]))
      })
  }, [accuracyClass, instruments, search, sortBy])

  const startCreate = () => {
    setEditing(null)
    reset(defaultInstrument)
    setFormOpen(true)
  }

  const startEdit = (instrument: Instrument) => {
    setEditing(instrument)
    reset(instrument)
    setFormOpen(true)
  }

  const onSubmit = (values: InstrumentForm) => {
    const actor = user?.displayName ?? 'Unknown user'

    if (editing) {
      updateInstrument(editing.id, values, actor)
    } else {
      createInstrument(values, actor)
    }

    setFormOpen(false)
    setEditing(null)
    reset(defaultInstrument)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Instrument register" title="Instrument Management">
        <button type="button" className="primary-button" onClick={startCreate}>
          <Plus size={18} />
          <span>New instrument</span>
        </button>
      </PageHeader>
      <section className="toolbar">
        <label>
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Model, serial, type" />
        </label>
        <label>
          Accuracy class
          <select value={accuracyClass} onChange={(event) => setAccuracyClass(event.target.value)}>
            {accuracyClasses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="updatedAt">Recently updated</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="maxCapacity">Capacity</option>
          </select>
        </label>
      </section>
      {formOpen ? (
        <section className="panel">
          <div className="panel-heading">
            <h3>{editing ? 'Edit instrument' : 'Create instrument'}</h3>
            <button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X size={18} />
            </button>
          </div>
          <form className="form-grid two-column" onSubmit={handleSubmit(onSubmit)}>
            <label>
              Manufacturer
              <input {...register('manufacturer')} />
              {errors.manufacturer ? <small>{errors.manufacturer.message}</small> : null}
            </label>
            <label>
              Model
              <input {...register('model')} />
              {errors.model ? <small>{errors.model.message}</small> : null}
            </label>
            <label>
              Serial number
              <input {...register('serialNumber')} />
              {errors.serialNumber ? <small>{errors.serialNumber.message}</small> : null}
            </label>
            <label>
              Instrument type
              <input {...register('instrumentType')} />
              {errors.instrumentType ? <small>{errors.instrumentType.message}</small> : null}
            </label>
            <label>
              Accuracy class
              <input {...register('accuracyClass')} />
              {errors.accuracyClass ? <small>{errors.accuracyClass.message}</small> : null}
            </label>
            <label>
              Maximum capacity
              <input type="number" step="0.001" {...register('maxCapacity')} />
              {errors.maxCapacity ? <small>{errors.maxCapacity.message}</small> : null}
            </label>
            <label>
              Minimum capacity
              <input type="number" step="0.001" {...register('minCapacity')} />
              {errors.minCapacity ? <small>{errors.minCapacity.message}</small> : null}
            </label>
            <label>
              Verification scale interval (e)
              <input type="number" step="0.001" {...register('verificationScaleInterval')} />
              {errors.verificationScaleInterval ? <small>{errors.verificationScaleInterval.message}</small> : null}
            </label>
            <label className="full-span">
              Technical specifications
              <textarea rows={3} {...register('technicalSpecifications')} />
              {errors.technicalSpecifications ? <small>{errors.technicalSpecifications.message}</small> : null}
            </label>
            <label className="full-span">
              Notes
              <textarea rows={3} {...register('notes')} />
            </label>
            <button type="submit" className="primary-button">
              <Save size={18} />
              <span>{editing ? 'Save changes' : 'Create instrument'}</span>
            </button>
          </form>
        </section>
      ) : null}
      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Serial</th>
              <th>Class</th>
              <th>Capacity</th>
              <th>Tests</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((instrument) => (
              <tr key={instrument.id}>
                <td>
                  <strong>{instrument.manufacturer} {instrument.model}</strong>
                  <span>{instrument.instrumentType}</span>
                </td>
                <td>{instrument.serialNumber}</td>
                <td>{instrument.accuracyClass}</td>
                <td>{instrument.minCapacity} - {instrument.maxCapacity}</td>
                <td>{tests.filter((test) => test.instrumentId === instrument.id).length}</td>
                <td>{new Date(instrument.updatedAt).toLocaleDateString()}</td>
                <td>
                  <div className="row-actions">
                    <Link className="icon-button" to={`/instruments/${instrument.id}`} aria-label="View instrument">
                      <Eye size={17} />
                    </Link>
                    <button type="button" className="icon-button" onClick={() => startEdit(instrument)} aria-label="Edit instrument">
                      <Edit size={17} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => deleteInstrument(instrument.id, user?.displayName ?? 'Unknown user')}
                      aria-label="Archive instrument"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
