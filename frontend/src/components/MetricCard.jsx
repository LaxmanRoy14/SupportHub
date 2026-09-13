export function MetricCard({ title, value, subtext }) {
  return (
    <div className="metric-card">
      <span className="metric-title">{title}</span>
      <span className="metric-value">{value}</span>
      {subtext && <span className="metric-sub">{subtext}</span>}
    </div>
  );
}
