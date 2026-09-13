import type { DashboardMetric } from '../types/domain'

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className={`metric-card ${metric.tone}`}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
    </article>
  )
}
