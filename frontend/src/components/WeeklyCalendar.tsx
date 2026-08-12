import { IconCalendar, IconClock } from './Icons';
import { formatStatusLabel, parseDate } from '../utils/format';

export type CalendarEventKind = 'appointment' | 'slot';

export interface CalendarEvent<T = unknown> {
  id: string;
  kind: CalendarEventKind;
  title: string;
  subtitle?: string;
  startTime: string;
  endTime: string;
  status?: string;
  isAvailable?: boolean;
  raw: T;
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  weekStart: Date;
  onWeekChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEmptySlotClick?: (date: Date) => void;
  emptySlotLabel?: string;
}

const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const gridStartHour = 7;
const gridStartMinute = 30;
const gridEndHour = 17;
const gridEndMinute = 30;
const rowMinutes = 60;
const rowHeight = 84;
const totalGridMinutes = (gridEndHour * 60 + gridEndMinute) - (gridStartHour * 60 + gridStartMinute);
const gridStartMinutes = gridStartHour * 60 + gridStartMinute;

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatShortDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getRows() {
  const rows: { label: string; minutes: number }[] = [];
  for (let minutes = gridStartMinutes; minutes < gridEndHour * 60 + gridEndMinute; minutes += rowMinutes) {
    rows.push({
      label: `${formatMinutes(minutes)} - ${formatMinutes(minutes + rowMinutes)}`,
      minutes,
    });
  }
  return rows;
}

function eventTone(event: CalendarEvent) {
  if (event.kind === 'slot') {
    return event.isAvailable ? 'slot-open' : 'slot-booked';
  }

  const status = (event.status || '').toLowerCase();
  if (['confirmed', 'approved'].includes(status)) return 'confirmed';
  if (status === 'pending') return 'pending';
  if (['cancelled', 'canceled', 'rejected'].includes(status)) return 'muted';
  return 'neutral';
}

function getEventLayout(event: CalendarEvent) {
  const start = parseDate(event.startTime);
  const end = parseDate(event.endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const clampedStart = Math.max(startMinutes, gridStartMinutes);
  const clampedEnd = Math.min(endMinutes, gridEndHour * 60 + gridEndMinute);
  const visibleMinutes = Math.max(30, clampedEnd - clampedStart);

  return {
    top: ((clampedStart - gridStartMinutes) / totalGridMinutes) * (totalGridMinutes / rowMinutes) * rowHeight,
    height: (visibleMinutes / rowMinutes) * rowHeight,
  };
}

function makeEmptySlotDate(day: Date, rowMinutesValue: number) {
  const result = new Date(day);
  result.setHours(Math.floor(rowMinutesValue / 60), rowMinutesValue % 60, 0, 0);
  return result;
}

export function WeeklyCalendar({
  events,
  weekStart,
  onWeekChange,
  onEventClick,
  onEmptySlotClick,
  emptySlotLabel = 'Tạo tại đây',
}: WeeklyCalendarProps) {
  const normalizedWeekStart = startOfWeek(weekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(normalizedWeekStart, index));
  const weekEnd = addDays(normalizedWeekStart, 6);
  const rows = getRows();
  const gridHeight = rows.length * rowHeight;

  const goToPreviousWeek = () => onWeekChange(addDays(normalizedWeekStart, -7));
  const goToThisWeek = () => onWeekChange(startOfWeek(new Date()));
  const goToNextWeek = () => onWeekChange(addDays(normalizedWeekStart, 7));

  return (
    <div className="weekly-calendar">
      <div className="weekly-calendar-toolbar">
        <div>
          <div className="weekly-calendar-title">
            <IconCalendar size={18} />
            <span>Lịch tuần</span>
          </div>
          <div className="weekly-calendar-range">
            {formatShortDate(normalizedWeekStart)} - {formatShortDate(weekEnd)}
          </div>
        </div>

        <div className="weekly-calendar-actions">
          <button type="button" className="btn btn-secondary" onClick={goToPreviousWeek}>
            Tuần trước
          </button>
          <button type="button" className="btn btn-secondary" onClick={goToThisWeek}>
            Tuần này
          </button>
          <button type="button" className="btn btn-secondary" onClick={goToNextWeek}>
            Tuần sau
          </button>
        </div>
      </div>

      <div className="weekly-calendar-scroll">
        <div className="weekly-calendar-grid">
          <div className="weekly-calendar-corner">
            <span>Thời gian</span>
          </div>
          {days.map((day, index) => (
            <div key={day.toISOString()} className="weekly-calendar-day-header">
              <span>{dayLabels[index]}</span>
              <strong>{formatShortDate(day)}</strong>
            </div>
          ))}

          <div className="weekly-calendar-time-column" style={{ height: gridHeight }}>
            {rows.map((row) => (
              <div key={row.label} className="weekly-calendar-time" style={{ height: rowHeight }}>
                {row.label}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = events.filter((event) => sameDay(parseDate(event.startTime), day));
            return (
              <div key={`column-${day.toISOString()}`} className="weekly-calendar-day-column" style={{ height: gridHeight }}>
                {rows.map((row) => (
                  <button
                    key={`${day.toISOString()}-${row.minutes}`}
                    type="button"
                    className="weekly-calendar-cell"
                    style={{ height: rowHeight }}
                    onClick={() => onEmptySlotClick?.(makeEmptySlotDate(day, row.minutes))}
                  >
                    <span className="weekly-calendar-empty-label">{emptySlotLabel}</span>
                  </button>
                ))}

                {dayEvents.map((event) => {
                  const layout = getEventLayout(event);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={`weekly-calendar-event weekly-calendar-event-${eventTone(event)}`}
                      style={{ top: layout.top + 5, height: Math.max(48, layout.height - 10) }}
                      title={event.title}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="weekly-calendar-event-code">
                        {event.kind === 'slot' ? (event.isAvailable ? 'AVAILABLE' : 'BOOKED') : formatStatusLabel(event.status || '')}
                      </div>
                      <div className="weekly-calendar-event-title">{event.title}</div>
                      {event.subtitle ? <div className="weekly-calendar-event-subtitle">{event.subtitle}</div> : null}
                      <div className="weekly-calendar-event-meta">
                        <IconClock size={13} />
                        <span>
                          {formatTime(parseDate(event.startTime))} - {formatTime(parseDate(event.endTime))}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
