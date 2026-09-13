export function PriorityBadge({ priority }) {
  const p = (priority || "").toUpperCase();
  const className =
    p === "HIGH"
      ? "badge-high"
      : p === "LOW"
      ? "badge-low"
      : "badge-medium";

  return <span className={`badge ${className}`}>{p || "MEDIUM"}</span>;
}
