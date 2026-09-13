import { createContext, useContext } from 'react'
import { laboratories, referenceEquipment } from '../data/demoData'
import type {
  Attachment,
  AttachmentKind,
  AuditLog,
  Instrument,
  Report,
  TestObservation,
  TestRecord,
  TestStatus,
} from '../types/domain'
import type { InstrumentForm, ObservationForm, TestForm } from '../validation/schemas'

export interface LabDataContextValue {
  instruments: Instrument[]
  tests: TestRecord[]
  observations: TestObservation[]
  reports: Report[]
  attachments: Attachment[]
  auditLogs: AuditLog[]
  laboratories: typeof laboratories
  referenceEquipment: typeof referenceEquipment
  createInstrument: (input: InstrumentForm, user: string) => Instrument
  updateInstrument: (id: string, input: InstrumentForm, user: string) => void
  deleteInstrument: (id: string, user: string) => void
  createTest: (input: TestForm, user: string) => TestRecord
  updateTestStatus: (id: string, status: TestStatus, user: string) => void
  addObservation: (testId: string, input: ObservationForm, user: string) => TestObservation
  generateReport: (testId: string, user: string) => Report
  registerAttachment: (input: {
    testId: string
    observationId?: string
    fileName: string
    kind: AttachmentKind
    storagePath: string
    downloadUrl?: string
    uploadedBy: string
  }) => Attachment
}

export const LabDataContext = createContext<LabDataContextValue | null>(null)

export const useLabData = () => {
  const value = useContext(LabDataContext)

  if (!value) {
    throw new Error('useLabData must be used inside LabDataProvider.')
  }

  return value
}
