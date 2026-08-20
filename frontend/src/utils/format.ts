export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (!value) return new Date();

  let str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/i.test(str) && !/[Z+-]\d{2}/i.test(str) && !str.endsWith('Z')) {
    str += 'Z';
  }
  return new Date(str);
}

export function formatDateTime(value: string | Date): string {
  if (!value) return '';
  const date = parseDate(value);
  if (isNaN(date.getTime())) return String(value);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    if (p.type !== 'literal') map[p.type] = p.value;
  });

  return `${map.hour}:${map.minute}, ${map.day}/${map.month}/${map.year}`;
}

export function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (['approved', 'confirmed', 'completed'].includes(normalized)) return 'success';
  if (['pending', 'waiting'].includes(normalized)) return 'warning';
  if (['rejected', 'cancelled', 'canceled'].includes(normalized)) return 'danger';
  if (['no-show', 'noshow'].includes(normalized)) return 'neutral';
  return 'neutral';
}

export function formatStatusLabel(status: string): string {
  if (!status) return '';
  const norm = status.toLowerCase().trim();
  if (['pending', 'waiting'].includes(norm)) return 'Chờ duyệt';
  if (['approved', 'confirmed'].includes(norm)) return 'Đã duyệt';
  if (['rejected'].includes(norm)) return 'Từ chối';
  if (['cancelled', 'canceled'].includes(norm)) return 'Đã hủy';
  if (['completed'].includes(norm)) return 'Hoàn thành';
  if (['no-show', 'noshow'].includes(norm)) return 'Vắng mặt';
  return titleCase(status);
}

export function cleanStringValue(val?: string | null): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'string' || lower === 'null' || lower === 'n/a' || lower === 'undefined') {
    return '';
  }
  return trimmed;
}

export function formatDisplayValue(val?: string | null, fallback = 'Chưa cập nhật'): string {
  const cleaned = cleanStringValue(val);
  return cleaned || fallback;
}

