export function formatDate(value: string | null): string {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function formatShortDate(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function toDateInputValue(value: string | null): string {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}
