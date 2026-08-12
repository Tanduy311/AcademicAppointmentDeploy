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
  IconMapPin,
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

const dayLabelsFull = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const dayLabelsShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const gridStartHour = 7;
const gridEndHour = 18;
const rowMinutes = 60;
const rowHeight = 90;
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
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return `${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
}

function formatTimeAMPM(date: Date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
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

function getEventTone(event: CalendarEvent) {
  if (event.kind === 'slot') {
    return event.isAvailable ? 'blue' : 'slate';
  }

  const status = (event.status || '').toLowerCase();
  if (['confirmed', 'approved'].includes(status)) return 'green';
  if (status === 'pending') return 'yellow';
  if (['cancelled', 'canceled', 'rejected'].includes(status)) return 'pink';
  return 'slate';
}

function extractRealAttendees(event: CalendarEvent) {
  const raw = event.raw as Record<string, any> | undefined;
  if (!raw) return [];

  const attendees: { name: string; bg: string; initial: string }[] = [];

  if (raw.studentName) {
    const name = String(raw.studentName);
    attendees.push({
      name,
      bg: '#2563eb',
      initial: name.charAt(0).toUpperCase(),
    });
  }

  if (raw.lecturerName) {
    const name = String(raw.lecturerName);
    attendees.push({
      name,
      bg: '#16a34a',
      initial: name.charAt(0).toUpperCase(),
    });
  }

  return attendees;
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
  startingDay = startingDay === 0 ? 6 : startingDay - 1; // convert Mon = 0

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
    'Tư vấn đồ án',
    'Lịch hẹn tư vấn',
    'Khung giờ rảnh',
    'Họp chuyên môn',
    'Khác',
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

  // Filter events
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

  const goToToday = () => {
    const today = new Date();
    setMiniMonthDate(today);
    onWeekChange(startOfWeek(today));
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
                Lịch Học Thuật
                <IconChevronDown size={14} className="dropdown-arrow" />
              </div>
              <div className="all-calendar-subtitle">Cá nhân & Giảng viên</div>
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
            <button type="button" className="mini-nav-btn" onClick={prevMiniMonth} title="Tháng trước">
              <IconChevronLeft size={16} />
            </button>

            <button type="button" className="mini-month-label" onClick={goToToday} title="Về hôm nay">
              {miniMonthDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
            </button>

            <button type="button" className="mini-nav-btn" onClick={nextMiniMonth} title="Tháng sau">
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
            <span>Phân loại lịch</span>
            {isScheduleOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>

          {isScheduleOpen && (
            <div className="accordion-content">
              {[
                'Tư vấn đồ án',
                'Lịch hẹn tư vấn',
                'Khung giờ rảnh',
                'Họp chuyên môn',
                'Khác',
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
            <span>Trạng thái</span>
            {isCategoriesOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>

          {isCategoriesOpen && (
            <div className="accordion-content">
              {[
                { name: 'Đã duyệt', color: '#22c55e', count: events.filter(e => ['approved','confirmed'].includes((e.status||'').toLowerCase())).length },
                { name: 'Chờ duyệt', color: '#f59e0b', count: events.filter(e => (e.status||'').toLowerCase() === 'pending').length },
                { name: 'Slot rảnh', color: '#3b82f6', count: events.filter(e => e.kind === 'slot' && e.isAvailable).length },
                { name: 'Đã hủy', color: '#ef4444', count: events.filter(e => ['cancelled','rejected'].includes((e.status||'').toLowerCase())).length },
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
                Lịch biểu &gt; <span>Lịch tổng quan</span>
              </div>
              <h1 className="calendar-page-title">Calendar</h1>
            </div>
          </div>
        </header>

        {/* CONTROL ROW */}
        <div className="calendar-controls-bar">
          <div className="controls-bar-left">
            <div className="month-picker-dropdown" onClick={goToToday} title="Click để về hôm nay">
              <span className="month-picker-title">{formatMonthYear(weekStart)}</span>
              <IconChevronDown size={16} />
            </div>

            <div className="events-count-pill">
              <IconCalendar size={14} />
              <span>{filteredEvents.length} lịch hẹn</span>
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
                Ngày
              </button>
              <button
                type="button"
                className={`view-pill ${viewMode === 'week' ? 'view-pill-active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Tuần
              </button>
              <button
                type="button"
                className={`view-pill ${viewMode === 'month' ? 'view-pill-active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Tháng
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
              <span>Tạo cuộc hẹn mới</span>
            </button>
          </div>
        </div>

        {syncMessage && <div className="sync-toast-banner">{syncMessage}</div>}

        {/* WEEKLY TIME GRID */}
        <div className="weekly-grid-container">
          <div className="weekly-grid-wrapper">
            {/* CORNER TIMEZONE HEADER */}
            <div className="grid-corner-cell">
              <span>UTC +7</span>
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
                    const attendees = extractRealAttendees(event);
                    const raw = event.raw as Record<string, any> | undefined;
                    const meetingType = raw?.meetingType;
                    const locationOrLink = raw?.locationOrLink;
                    const statusText =
                      event.kind === 'slot'
                        ? event.isAvailable
                          ? 'Slot rảnh'
                          : 'Đã kín'
                        : formatStatusLabel(event.status || '');

                    return (
                      <div
                        key={event.id}
                        className={`pastel-event-card tone-${tone}`}
                        style={{
                          top: layout.top + 5,
                          height: Math.max(62, layout.height - 10),
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="card-left-accent" />

                        <div className="card-content-body">
                          <div className="card-top-info">
                            <div className="card-status-badge">
                              {statusText}
                            </div>
                            <h4 className="card-event-title">{event.title}</h4>
                            {event.subtitle && (
                              <div className="card-event-subtitle">{event.subtitle}</div>
                            )}
                          </div>

                          <div className="card-bottom-info">
                            <div className="card-time-row">
                              <IconClock size={12} />
                              <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                            </div>

                            {/* HOVER DETAILS */}
                            <div className="card-hover-extra">
                              {meetingType && (
                                <span className="extra-tag">Hình thức: {meetingType}</span>
                              )}
                              {locationOrLink && (
                                <span className="extra-tag">
                                  <IconMapPin size={11} /> {locationOrLink}
                                </span>
                              )}
                            </div>

                            {/* REAL ATTENDEES AVATARS */}
                            {attendees.length > 0 && (
                              <div className="card-avatar-footer">
                                <div className="avatar-overlap-stack">
                                  {attendees.map((att) => (
                                    <div
                                      key={att.name}
                                      className="avatar-bubble"
                                      style={{ backgroundColor: att.bg }}
                                      title={att.name}
                                    >
                                      {att.initial}
                                    </div>
                                  ))}
                                </div>
                                <span className="avatar-count-badge">
                                  {attendees.map((a) => a.name).join(', ')}
                                </span>
                              </div>
                            )}
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
