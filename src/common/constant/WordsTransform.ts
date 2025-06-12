export function LowwerWords(value: string): string {
  if (!value || typeof value !== 'string') return value;

  return value.toLowerCase();
}

export function CapitalizeWords(value: string): string {
  if (!value || typeof value !== 'string') return value;

  return value
    .toLowerCase()
    .split(' ')
    .map((word) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '',
    )
    .join(' ');
}
