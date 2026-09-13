import { useMemo, useState, type ReactNode } from 'react'
import {
  attachments as seededAttachments,
  auditLogs as seededAuditLogs,
  instruments as seededInstruments,
  laboratories,
  observations as seededObservations,
  referenceEquipment,
  reports as seededReports,
  tests as seededTests,
} from '../data/demoData'
import { evaluateObservation } from '../services/calculationEngine'
import type { Attachment, AuditLog, Instrument, Report, TestObservation, TestRecord } from '../types/domain'
import { LabDataContext, type LabDataContextValue } from './labDataState'

const now = () => new Date().toISOString()

const makeAudit = (
  user: string,
  action: AuditLog['action'],
  entity: string,
  entityId: string,
  metadata: AuditLog['metadata'] = {},
): AuditLog => ({
  id: crypto.randomUUID(),
  user,
  action,
  entity,
  entityId,
  timestamp: now(),
  metadata,
})

export function LabDataProvider({ children }: { children: ReactNode }) {
  const [instruments, setInstruments] = useState(seededInstruments)
  const [tests, setTests] = useState(seededTests)
  const [observations, setObservations] = useState(seededObservations)
  const [reports, setReports] = useState(seededReports)
  const [attachments, setAttachments] = useState(seededAttachments)
  const [auditLogs, setAuditLogs] = useState(seededAuditLogs)

  const appendAudit = (entry: AuditLog) => setAuditLogs((current) => [entry, ...current])

  const value = useMemo<LabDataContextValue>(
    () => ({
      instruments,
      tests,
      observations,
      reports,
      attachments,
      auditLogs,
      laboratories,
      referenceEquipment,
      createInstrument: (input, user) => {
        const timestamp = now()
        const instrument: Instrument = {
          id: crypto.randomUUID(),
          ...input,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        setInstruments((current) => [instrument, ...current])
        appendAudit(makeAudit(user, 'Created', 'Instrument', instrument.id, { serialNumber: input.serialNumber }))

        return instrument
      },
      updateInstrument: (id, input, user) => {
        setInstruments((current) =>
          current.map((instrument) =>
            instrument.id === id ? { ...instrument, ...input, updatedAt: now() } : instrument,
          ),
        )
        appendAudit(makeAudit(user, 'Updated', 'Instrument', id, { serialNumber: input.serialNumber }))
      },
      deleteInstrument: (id, user) => {
        setInstruments((current) => current.filter((instrument) => instrument.id !== id))
        appendAudit(makeAudit(user, 'Updated', 'Instrument', id, { archived: true }))
      },
      createTest: (input, user) => {
        const timestamp = now()
        const test: TestRecord = {
          id: crypto.randomUUID(),
          ...input,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        setTests((current) => [test, ...current])
        appendAudit(makeAudit(user, 'Created', 'Test', test.id, { testId: input.testId, status: input.status }))

        return test
      },
      updateTestStatus: (id, status, user) => {
        setTests((current) =>
          current.map((test) => (test.id === id ? { ...test, status, updatedAt: now() } : test)),
        )
        appendAudit(
          makeAudit(user, status === 'Approved' ? 'Approved' : status === 'Failed' ? 'Failed' : 'Updated', 'Test', id, {
            status,
          }),
        )
      },
      addObservation: (testId, input, user) => {
        const test = tests.find((item) => item.id === testId)
        const instrument = instruments.find((item) => item.id === test?.instrumentId)
        const calculation = evaluateObservation(input, instrument?.accuracyClass ?? 'Unverified')
        const observation: TestObservation = {
          id: crypto.randomUUID(),
          testId,
          procedureName: input.procedureName,
          testConditions: input.testConditions,
          appliedLoad: input.appliedLoad,
          indication: input.indication,
          calculatedError: calculation.calculatedError,
          permissibleError: calculation.permissibleError,
          result: calculation.result,
          notes: `${input.notes ?? ''}${input.notes ? ' ' : ''}${calculation.explanation}`,
          attachmentIds: [],
          createdAt: now(),
        }
        setObservations((current) => [observation, ...current])
        appendAudit(makeAudit(user, 'Created', 'TestObservation', observation.id, { result: observation.result }))

        return observation
      },
      generateReport: (testId, user) => {
        const test = tests.find((item) => item.id === testId)
        const report: Report = {
          id: crypto.randomUUID(),
          reportId: `MW-RPT-${new Date().getFullYear()}-${String(reports.length + 1).padStart(4, '0')}`,
          testId,
          instrumentId: test?.instrumentId ?? '',
          status: 'Generated',
          generatedAt: now(),
          generatedBy: user,
          notes: 'Generated from current test data. PDF and DOCX exporters are intentionally deferred.',
        }
        setReports((current) => [report, ...current])
        appendAudit(makeAudit(user, 'Report generated', 'Report', report.id, { reportId: report.reportId }))

        return report
      },
      registerAttachment: (input) => {
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          ...input,
          uploadedAt: now(),
        }
        setAttachments((current) => [attachment, ...current])
        appendAudit(
          makeAudit(input.uploadedBy, 'Created', 'Attachment', attachment.id, {
            kind: attachment.kind,
            fileName: attachment.fileName,
          }),
        )

        return attachment
      },
    }),
    [attachments, auditLogs, instruments, observations, reports, tests],
  )

  return <LabDataContext.Provider value={value}>{children}</LabDataContext.Provider>
}
