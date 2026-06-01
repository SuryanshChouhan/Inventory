export const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
