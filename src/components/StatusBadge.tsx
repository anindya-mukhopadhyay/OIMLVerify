import type { ObservationResult, ReportStatus, TestStatus } from '../types/domain'

export function StatusBadge({ status }: { status: TestStatus | ObservationResult | ReportStatus }) {
  const normalized = status.toLowerCase().replaceAll(' ', '-')

  return <span className={`status-badge status-${normalized}`}>{status}</span>
}
