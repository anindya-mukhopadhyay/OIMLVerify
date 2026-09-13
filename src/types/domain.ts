export type UserRole = 'Admin' | 'Tester' | 'Reviewer' | 'Viewer'

export type TestStatus = 'Draft' | 'In Progress' | 'Review' | 'Approved' | 'Failed'

export type ObservationResult = 'PASS' | 'FAIL' | 'REVIEW'

export type ReportStatus = 'Draft' | 'Generated' | 'Under Review' | 'Approved' | 'Archived'

export type AttachmentKind =
  | 'Test Photograph'
  | 'Supporting Document'
  | 'Calibration Certificate'
  | 'Other Evidence'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  laboratoryId?: string
}

export interface Instrument {
  id: string
  manufacturer: string
  model: string
  serialNumber: string
  instrumentType: string
  accuracyClass: string
  maxCapacity: number
  minCapacity: number
  verificationScaleInterval: number
  technicalSpecifications: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Laboratory {
  id: string
  name: string
  location: string
  accreditationId: string
}

export interface ReferenceEquipment {
  id: string
  name: string
  certificateNumber: string
  calibrationDue: string
}

export interface TestRecord {
  id: string
  testId: string
  instrumentId: string
  testDate: string
  tester: string
  laboratory: string
  environmentalConditions: string
  temperature: number
  humidity: number
  referenceEquipment: string
  notes: string
  status: TestStatus
  createdAt: string
  updatedAt: string
}

export interface TestObservation {
  id: string
  testId: string
  procedureName: string
  testConditions: string
  appliedLoad: number
  indication: number
  calculatedError: number
  permissibleError: number | null
  result: ObservationResult
  notes: string
  attachmentIds: string[]
  createdAt: string
}

export interface Report {
  id: string
  reportId: string
  testId: string
  instrumentId: string
  status: ReportStatus
  generatedAt: string
  generatedBy: string
  reviewedBy?: string
  notes: string
}

export interface Attachment {
  id: string
  testId: string
  observationId?: string
  fileName: string
  kind: AttachmentKind
  storagePath: string
  downloadUrl?: string
  uploadedBy: string
  uploadedAt: string
}

export interface AuditLog {
  id: string
  user: string
  action:
    | 'Created'
    | 'Updated'
    | 'Submitted'
    | 'Reviewed'
    | 'Approved'
    | 'Failed'
    | 'Report generated'
  entity: string
  entityId: string
  timestamp: string
  metadata: Record<string, string | number | boolean>
}

export interface DashboardMetric {
  label: string
  value: number
  tone: 'neutral' | 'active' | 'success' | 'danger' | 'warning'
}
