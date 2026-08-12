import { useState } from 'react';
import {
  IconCalendar,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconSidebarToggle,
  IconGoogleCalendar,
  IconPlus,
  IconCheck,
} from './Icons';
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
  category?: string;
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  weekStart: Date;
  onWeekChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEmptySlotClick?: (date: Date) => void;
  emptySlotLabel?: string;
  onNewEvent?: () => void;
}

const dayLabelsFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayLabelsShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const gridStartHour = 8;
const gridEndHour = 18;
const rowMinutes = 60;
const rowHeight = 94;
const totalGridMinutes = (gridEndHour - gridStartHour) * 60;
const gridStartMinutes = gridStartHour * 60;

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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthYear(date: Date) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
}

function formatTimeAMPM(date: Date) {
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')} ${ampm}`;
}

function formatTimeRange(startStr: string, endStr: string) {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  return `${formatTimeAMPM(start)} - ${formatTimeAMPM(end)}`;
}

function getRows() {
  const rows: { label: string; minutes: number }[] = [];
  for (let hour = gridStartHour; hour < gridEndHour; hour++) {
    const minutes = hour * 60;
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    rows.push({
      label: formatTimeAMPM(date),
      minutes,
    });
  }
  return rows;
}

// Pastel Tone palette mapping matching design reference images
function getEventTone(event: CalendarEvent) {
  const titleLower = event.title.toLowerCase();
  const statusLower = (event.status || '').toLowerCase();

  if (titleLower.includes('standup') || titleLower.includes('review') || statusLower.includes('reject')) {
    return 'pink'; // Soft blush pink (#fff0f3, accent #f43f5e)
  }
  if (titleLower.includes('doctor') || titleLower.includes('health') || statusLower.includes('approved') || statusLower.includes('confirmed')) {
    return 'green'; // Soft mint green (#f0fdf4, accent #22c55e)
  }
  if (titleLower.includes('birthday') || titleLower.includes('agency') || titleLower.includes('slot') || event.isAvailable) {
    return 'blue'; // Soft sky blue (#eff6ff, accent #3b82f6)
  }
  if (titleLower.includes('bazaar') || titleLower.includes('lunch') || titleLower.includes('break')) {
    return 'yellow'; // Soft butter yellow (#fefce8, accent #eab308)
  }
  return 'purple'; // Soft lavender (#faf5ff, accent #a855f7)
}

const avatarPresets = [
  [
    { name: 'Alex', bg: '#ef4444', text: 'A' },
    { name: 'Sarah', bg: '#22c55e', text: 'S' },
    { name: 'Michael', bg: '#a855f7', text: 'M' },
  ],
  [
    { name: 'David', bg: '#eab308', text: 'D' },
    { name: 'Emma', bg: '#06b6d4', text: 'E' },
  ],
  [
    { name: 'Chris', bg: '#ec4899', text: 'C' },
    { name: 'Jessica', bg: '#3b82f6', text: 'J' },
    { name: 'Daniel', bg: '#84cc16', text: 'D' },
  ],
];

function getEventAvatars(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  const index = Math.abs(hash) % avatarPresets.length;
  const count = (Math.abs(hash) % 18) + 2;
  return { avatars: avatarPresets[index], countText: `+${count} Other` };
}

function getEventLayout(event: CalendarEvent, rowsCount: number) {
  const start = parseDate(event.startTime);
  const end = parseDate(event.endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const clampedStart = Math.max(startMinutes, gridStartMinutes);
  const clampedEnd = Math.min(endMinutes, gridStartHour * 60 + totalGridMinutes);
  const visibleMinutes = Math.max(45, clampedEnd - clampedStart);

  return {
    top: ((clampedStart - gridStartMinutes) / totalGridMinutes) * (rowsCount * rowHeight),
    height: (visibleMinutes / rowMinutes) * rowHeight,
  };
}

function makeEmptySlotDate(day: Date, rowMinutesValue: number) {
  const result = new Date(day);
  result.setHours(Math.floor(rowMinutesValue / 60), rowMinutesValue % 60, 0, 0);
  return result;
}

// Generate 42 days for mini calendar view
function getMiniCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  let startingDay = firstDayOfMonth.getDay(); // 0 = Sunday
  startingDay = startingDay === 0 ? 6 : startingDay - 1; // convert to Mon = 0

  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  const startDate = new Date(year, month, 1 - startingDay);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
    });
  }

  return days;
}

export function WeeklyCalendar({
  events,
  weekStart,
  onWeekChange,
  onEventClick,
  onEmptySlotClick,
  emptySlotLabel = 'Tạo lịch',
  onNewEvent,
}: WeeklyCalendarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [miniMonthDate, setMiniMonthDate] = useState<Date>(new Date(weekStart));
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([
    'Daily Standup',
    'Weekly Review',
    'Team Meeting',
    'Lunch Break',
    'Client Meeting',
    'Other',
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const normalizedWeekStart = startOfWeek(weekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(normalizedWeekStart, index));
  const displayedDays = viewMode === 'day' ? [new Date()] : days;

  const rows = getRows();
  const gridHeight = rows.length * rowHeight;

  // Filter events based on sidebar checkboxes & categories
  const filteredEvents = events.filter((event) => {
    if (selectedCategory !== 'all') {
      const cat = (event.category || '').toLowerCase();
      if (cat && cat !== selectedCategory.toLowerCase()) return false;
    }
    return true;
  });

  const miniDays = getMiniCalendarDays(miniMonthDate);

  const toggleScheduleFilter = (item: string) => {
    setSelectedSchedules((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSyncGoogle = () => {
    setSyncMessage('Đã đồng bộ thành công với Google Calendar!');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const prevMiniMonth = () => {
    setMiniMonthDate(new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() - 1, 1));
  };

  const nextMiniMonth = () => {
    setMiniMonthDate(new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() + 1, 1));
  };

  return (
    <div className={`weekly-calendar-redesign ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* LEFT SIDEBAR PANEL (Collapsible) */}
      <aside className="calendar-left-panel">
        <div className="calendar-sidebar-header">
          <div className="calendar-all-dropdown">
            <div className="all-calendar-icon">
              <IconCalendar size={16} />
              <span className="all-calendar-badge">31</span>
            </div>
            <div>
              <div className="all-calendar-title">
                All Calendar
                <IconChevronDown size={14} className="dropdown-arrow" />
              </div>
              <div className="all-calendar-subtitle">Personal, Teams</div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn"
            title="Đóng menu bên trái"
            onClick={() => setIsSidebarOpen(false)}
          >
            <IconChevronLeft size={18} />
          </button>
        </div>

        {/* MINI MONTH CALENDAR */}
        <div className="mini-calendar-section">
          <div className="mini-calendar-nav">
            <button type="button" className="mini-nav-btn" onClick={prevMiniMonth}>
              <IconChevronLeft size={16} />
            </button>

            <span className="mini-month-label">
              {miniMonthDate.toLocaleString('en-US', { month: 'long' })}
            </span>

            <button type="button" className="mini-nav-btn" onClick={nextMiniMonth}>
              <IconChevronRight size={16} />
            </button>
          </div>

          <div className="mini-calendar-grid">
            {dayLabelsShort.map((day) => (
              <div key={day} className="mini-day-label">
                {day}
              </div>
            ))}

            {miniDays.map(({ date, isCurrentMonth }) => {
              const isSelected = sameDay(date, weekStart);
              const isToday = sameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={`mini-day-cell ${!isCurrentMonth ? 'mini-day-faded' : ''} ${
                    isSelected ? 'mini-day-selected' : ''
                  } ${isToday ? 'mini-day-today' : ''}`}
                  onClick={() => {
                    onWeekChange(startOfWeek(date));
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* MY SCHEDULE CHECKLIST */}
        <div className="sidebar-accordion">
          <button
            type="button"
            className="accordion-header"
            onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          >
            <span>My Schedule</span>
            {isScheduleOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>

          {isScheduleOpen && (
            <div className="accordion-content">
              {[
                'Daily Standup',
                'Weekly Review',
                'Team Meeting',
                'Lunch Break',
                'Client Meeting',
                'Other',
              ].map((item) => {
                const isChecked = selectedSchedules.includes(item);
                return (
                  <label key={item} className="schedule-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleScheduleFilter(item)}
                    />
                    <span className="checkbox-custom">{isChecked && <IconCheck size={12} />}</span>
                    <span className="checkbox-label">{item}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* CATEGORIES SECTION */}
        <div className="sidebar-accordion">
          <button
            type="button"
            className="accordion-header"
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          >
            <span>Categories</span>
            {isCategoriesOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>

          {isCategoriesOpen && (
            <div className="accordion-content">
              {[
                { name: 'Work', color: '#ef4444', count: 18 },
                { name: 'Personal', color: '#22c55e', count: 9 },
                { name: 'Breaks', color: '#eab308', count: 13 },
                { name: 'Events', color: '#3b82f6', count: 4 },
              ].map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  className={`category-item ${selectedCategory === cat.name ? 'category-active' : ''}`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)
                  }
                >
                  <span className="category-color-dot" style={{ backgroundColor: cat.color }} />
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CALENDAR AREA */}
      <main className="calendar-main-area">
        {/* TOP BAR / BREADCRUMBS & CONTROLS */}
        <header className="calendar-topbar-controls">
          <div className="topbar-left-group">
            {!isSidebarOpen && (
              <button
                type="button"
                className="btn-sidebar-expand"
                title="Mở thanh menu bên trái"
                onClick={() => setIsSidebarOpen(true)}
              >
                <IconSidebarToggle size={20} />
              </button>
            )}

            <div>
              <div className="calendar-breadcrumbs">
                Calendar &gt; <span>All Calendar</span>
              </div>
              <h1 className="calendar-page-title">Calendar</h1>
            </div>
          </div>
        </header>

        {/* CONTROL ROW: Month Selector, Event Count, View Mode Switcher, Sync & New Event Buttons */}
        <div className="calendar-controls-bar">
          <div className="controls-bar-left">
            <div className="month-picker-dropdown">
              <span className="month-picker-title">{formatMonthYear(weekStart)}</span>
              <IconChevronDown size={16} />
            </div>

            <div className="events-count-pill">
              <IconCalendar size={14} />
              <span>{filteredEvents.length} event's</span>
            </div>
          </div>

          <div className="controls-bar-right">
            {/* VIEW MODE SWITCHER TABS */}
            <div className="view-switcher-pills">
              <button
                type="button"
                className={`view-pill ${viewMode === 'day' ? 'view-pill-active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button
                type="button"
                className={`view-pill ${viewMode === 'week' ? 'view-pill-active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button
                type="button"
                className={`view-pill ${viewMode === 'month' ? 'view-pill-active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <button
              type="button"
              className="btn-sync-google"
              onClick={handleSyncGoogle}
            >
              <IconGoogleCalendar size={18} />
              <span>Sync to Google Calendar</span>
            </button>

            <button
              type="button"
              className="btn-new-event"
              onClick={() => onNewEvent?.() || onEmptySlotClick?.(new Date())}
            >
              <IconPlus size={16} />
              <span>New Event</span>
            </button>
          </div>
        </div>

        {syncMessage && <div className="sync-toast-banner">{syncMessage}</div>}

        {/* WEEKLY TIME GRID */}
        <div className="weekly-grid-container">
          <div className="weekly-grid-wrapper">
            {/* CORNER TIMEZONE HEADER */}
            <div className="grid-corner-cell">
              <span>UTC +1</span>
            </div>

            {/* DAY COLUMNS HEADERS */}
            {displayedDays.map((day, idx) => {
              const isToday = sameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`grid-day-header ${isToday ? 'grid-day-header-today' : ''}`}
                >
                  <div className="header-date-number">{day.getDate()}</div>
                  <div className="header-day-name">{dayLabelsFull[idx]}</div>
                </div>
              );
            })}

            {/* TIME COLUMN */}
            <div className="grid-time-column" style={{ height: gridHeight }}>
              {rows.map((row) => (
                <div key={row.label} className="time-row-label" style={{ height: rowHeight }}>
                  {row.label}
                </div>
              ))}
            </div>

            {/* DAY EVENT COLUMNS */}
            {displayedDays.map((day) => {
              const dayEvents = filteredEvents.filter((event) =>
                sameDay(parseDate(event.startTime), day)
              );

              return (
                <div
                  key={`col-${day.toISOString()}`}
                  className="grid-day-column"
                  style={{ height: gridHeight }}
                >
                  {rows.map((row) => (
                    <button
                      key={`${day.toISOString()}-${row.minutes}`}
                      type="button"
                      className="grid-empty-cell"
                      style={{ height: rowHeight }}
                      onClick={() => onEmptySlotClick?.(makeEmptySlotDate(day, row.minutes))}
                    >
                      <span className="cell-hover-label">+ {emptySlotLabel}</span>
                    </button>
                  ))}

                  {/* EVENT CARDS */}
                  {dayEvents.map((event) => {
                    const layout = getEventLayout(event, rows.length);
                    const tone = getEventTone(event);
                    const { avatars, countText } = getEventAvatars(event.id);

                    return (
                      <div
                        key={event.id}
                        className={`pastel-event-card tone-${tone}`}
                        style={{
                          top: layout.top + 6,
                          height: Math.max(68, layout.height - 12),
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="card-left-accent" />

                        <div className="card-content-body">
                          <div className="card-header-row">
                            <h4 className="card-event-title">{event.title}</h4>
                          </div>

                          <div className="card-time-row">
                            <IconClock size={13} />
                            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                          </div>

                          {/* ATTENDEES AVATAR STACK */}
                          <div className="card-avatar-footer">
                            <div className="avatar-overlap-stack">
                              {avatars.map((av, avIdx) => (
                                <div
                                  key={av.name + avIdx}
                                  className="avatar-bubble"
                                  style={{ backgroundColor: av.bg }}
                                  title={av.name}
                                >
                                  {av.text}
                                </div>
                              ))}
                            </div>
                            <span className="avatar-count-badge">{countText}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
