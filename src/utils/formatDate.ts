export default function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
}
