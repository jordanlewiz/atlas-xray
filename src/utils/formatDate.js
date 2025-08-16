export default function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleString();
}
