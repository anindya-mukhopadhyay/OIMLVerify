import type {
  Attachment,
  AuditLog,
  Instrument,
  Laboratory,
  ReferenceEquipment,
  Report,
  TestObservation,
  TestRecord,
  UserProfile,
} from '../types/domain'

export const demoUser: UserProfile = {
  uid: 'demo-admin',
  email: 'admin@metriweigh.local',
  displayName: 'MetriWeigh Demo Admin',
  role: 'Admin',
  laboratoryId: 'lab-kolkata',
}

export const laboratories: Laboratory[] = [
  {
    id: 'lab-kolkata',
    name: 'Regional Legal Metrology Laboratory',
    location: 'Kolkata',
    accreditationId: 'RLM-NAWI-2026',
  },
]

export const referenceEquipment: ReferenceEquipment[] = [
  {
    id: 'ref-weights-01',
    name: 'Class F1 Reference Mass Set',
    certificateNumber: 'CAL-2026-1187',
    calibrationDue: '2027-04-20',
  },
]

export const instruments: Instrument[] = [
  {
    id: 'inst-001',
    manufacturer: 'Avery Precision',
    model: 'AP-6000',
    serialNumber: 'NAWI-76-24019',
    instrumentType: 'Electronic platform scale',
    accuracyClass: 'Class III',
    maxCapacity: 6000,
    minCapacity: 40,
    verificationScaleInterval: 2,
    technicalSpecifications: 'Dual range platform with sealed load cell assembly.',
    notes: 'Submitted for initial verification.',
    createdAt: '2026-09-01T09:30:00.000Z',
    updatedAt: '2026-09-08T12:15:00.000Z',
  },
  {
    id: 'inst-002',
    manufacturer: 'Bharat Weighing Systems',
    model: 'BW-30K',
    serialNumber: 'BWS-30K-901',
    instrumentType: 'Retail counter scale',
    accuracyClass: 'Class III',
    maxCapacity: 30000,
    minCapacity: 100,
    verificationScaleInterval: 10,
    technicalSpecifications: 'Price computing scale with customer display.',
    notes: 'Requires certificate evidence before approval.',
    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-09-09T11:10:00.000Z',
  },
]

export const tests: TestRecord[] = [
  {
    id: 'test-001',
    testId: 'MW-NAWI-2026-0001',
    instrumentId: 'inst-001',
    testDate: '2026-09-09',
    tester: 'Anindya Mukhopadhyay',
    laboratory: 'Regional Legal Metrology Laboratory',
    environmentalConditions: 'Stable indoor laboratory conditions',
    temperature: 24.2,
    humidity: 52,
    referenceEquipment: 'Class F1 Reference Mass Set',
    notes: 'Observations ready for reviewer sampling.',
    status: 'Review',
    createdAt: '2026-09-09T09:00:00.000Z',
    updatedAt: '2026-09-09T14:25:00.000Z',
  },
  {
    id: 'test-002',
    testId: 'MW-NAWI-2026-0002',
    instrumentId: 'inst-002',
    testDate: '2026-09-10',
    tester: 'R. Sen',
    laboratory: 'Regional Legal Metrology Laboratory',
    environmentalConditions: 'Awaiting reference equipment setup',
    temperature: 25.1,
    humidity: 58,
    referenceEquipment: 'Class F1 Reference Mass Set',
    notes: 'Draft test plan.',
    status: 'Draft',
    createdAt: '2026-09-10T07:30:00.000Z',
    updatedAt: '2026-09-10T07:30:00.000Z',
  },
]

export const observations: TestObservation[] = [
  {
    id: 'obs-001',
    testId: 'test-001',
    procedureName: 'Eccentric loading',
    testConditions: 'Center and quadrant placements under stable indication',
    appliedLoad: 2000,
    indication: 2001,
    calculatedError: 1,
    permissibleError: 2,
    result: 'PASS',
    notes: 'Demo result using manual permissible error.',
    attachmentIds: ['att-001'],
    createdAt: '2026-09-09T11:00:00.000Z',
  },
  {
    id: 'obs-002',
    testId: 'test-001',
    procedureName: 'Repeatability',
    testConditions: 'Three repeated applications at same load',
    appliedLoad: 4000,
    indication: 3996.5,
    calculatedError: -3.5,
    permissibleError: null,
    result: 'REVIEW',
    notes: 'Permissible error intentionally unset until verified rule is applied.',
    attachmentIds: [],
    createdAt: '2026-09-09T12:20:00.000Z',
  },
]

export const reports: Report[] = [
  {
    id: 'report-001',
    reportId: 'MW-RPT-2026-0001',
    testId: 'test-001',
    instrumentId: 'inst-001',
    status: 'Under Review',
    generatedAt: '2026-09-09T15:00:00.000Z',
    generatedBy: 'Anindya Mukhopadhyay',
    notes: 'Report preview generated from demo observations. PDF/DOCX export pending.',
  },
]

export const attachments: Attachment[] = [
  {
    id: 'att-001',
    testId: 'test-001',
    observationId: 'obs-001',
    fileName: 'eccentric-loading-photo.jpg',
    kind: 'Test Photograph',
    storagePath: 'tests/test-001/observations/obs-001/Test Photograph/eccentric-loading-photo.jpg',
    uploadedBy: 'Anindya Mukhopadhyay',
    uploadedAt: '2026-09-09T11:05:00.000Z',
  },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    user: 'Anindya Mukhopadhyay',
    action: 'Created',
    entity: 'Instrument',
    entityId: 'inst-001',
    timestamp: '2026-09-01T09:30:00.000Z',
    metadata: { serialNumber: 'NAWI-76-24019' },
  },
  {
    id: 'audit-002',
    user: 'Anindya Mukhopadhyay',
    action: 'Submitted',
    entity: 'Test',
    entityId: 'test-001',
    timestamp: '2026-09-09T14:25:00.000Z',
    metadata: { status: 'Review' },
  },
  {
    id: 'audit-003',
    user: 'System',
    action: 'Report generated',
    entity: 'Report',
    entityId: 'report-001',
    timestamp: '2026-09-09T15:00:00.000Z',
    metadata: { reportId: 'MW-RPT-2026-0001' },
  },
]
