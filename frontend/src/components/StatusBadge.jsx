export function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const className =
    s === "RESOLVED"
      ? "badge-resolved"
      : s === "PENDING"
      ? "badge-pending"
      : "badge-open";

  return <span className={`badge ${className}`}>{s || "OPEN"}</span>;
}
