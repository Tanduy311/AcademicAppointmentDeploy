import { Fragment } from 'react';
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
const startHour = 7;
const endHour = 18;
const slotMinutes = 30;

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

function addMinutes(date: Date, minutes: number) {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
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

function getSlotRows() {
  const rows: Date[] = [];
  const base = new Date();
  base.setHours(startHour, 0, 0, 0);
  for (let minutes = 0; minutes < (endHour - startHour) * 60; minutes += slotMinutes) {
    rows.push(addMinutes(base, minutes));
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

function eventIntersectsSlot(event: CalendarEvent, day: Date, slot: Date) {
  const start = parseDate(event.startTime);
  const end = parseDate(event.endTime);
  const slotStart = new Date(day);
  slotStart.setHours(slot.getHours(), slot.getMinutes(), 0, 0);
  const slotEnd = addMinutes(slotStart, slotMinutes);

  return sameDay(start, day) && start < slotEnd && end > slotStart;
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
  const rows = getSlotRows();
  const weekEnd = addDays(normalizedWeekStart, 6);

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
          <div className="weekly-calendar-corner" />
          {days.map((day, index) => (
            <div key={day.toISOString()} className="weekly-calendar-day-header">
              <span>{dayLabels[index]}</span>
              <strong>{formatShortDate(day)}</strong>
            </div>
          ))}

          {rows.map((row) => (
            <Fragment key={`row-${formatTime(row)}`}>
              <div key={`time-${formatTime(row)}`} className="weekly-calendar-time">
                {formatTime(row)}
              </div>
              {days.map((day) => {
                const slotDate = new Date(day);
                slotDate.setHours(row.getHours(), row.getMinutes(), 0, 0);
                const slotEvents = events.filter((event) => eventIntersectsSlot(event, day, row));

                return (
                  <button
                    key={`${day.toISOString()}-${formatTime(row)}`}
                    type="button"
                    className={`weekly-calendar-cell ${slotEvents.length ? 'has-events' : ''}`}
                    onClick={() => {
                      if (slotEvents.length > 0) {
                        onEventClick(slotEvents[0]);
                      } else {
                        onEmptySlotClick?.(slotDate);
                      }
                    }}
                  >
                    {slotEvents.length > 0 ? (
                      <div className="weekly-calendar-event-stack">
                        {slotEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`weekly-calendar-event weekly-calendar-event-${eventTone(event)}`}
                            title={event.title}
                          >
                            <div className="weekly-calendar-event-title">{event.title}</div>
                            <div className="weekly-calendar-event-meta">
                              <IconClock size={12} />
                              <span>
                                {formatTime(parseDate(event.startTime))} - {formatTime(parseDate(event.endTime))}
                              </span>
                            </div>
                            {event.status ? (
                              <div className="weekly-calendar-event-status">{formatStatusLabel(event.status)}</div>
                            ) : event.subtitle ? (
                              <div className="weekly-calendar-event-status">{event.subtitle}</div>
                            ) : null}
                          </div>
                        ))}
                        {slotEvents.length > 2 ? (
                          <div className="weekly-calendar-more">+{slotEvents.length - 2} mục khác</div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="weekly-calendar-empty-label">{emptySlotLabel}</span>
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
