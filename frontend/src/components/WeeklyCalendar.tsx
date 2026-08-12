import { useState, useEffect } from 'react';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconSidebarToggle,
  IconCheck,
} from './Icons';
import { parseDate } from '../utils/format';

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

const dayLabelsFull = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const dayLabelsShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// 1-hour time slots from 07:30 to 17:30
const timeSlotRanges = [
  { label: '07:30 - 08:30', startHour: 7.5, endHour: 8.5 },
  { label: '08:30 - 09:30', startHour: 8.5, endHour: 9.5 },
  { label: '09:30 - 10:30', startHour: 9.5, endHour: 10.5 },
  { label: '10:30 - 11:30', startHour: 10.5, endHour: 11.5 },
  { label: '11:30 - 12:30', startHour: 11.5, endHour: 12.5 },
  { label: '12:30 - 13:30', startHour: 12.5, endHour: 13.5 },
  { label: '13:30 - 14:30', startHour: 13.5, endHour: 14.5 },
  { label: '14:30 - 15:30', startHour: 14.5, endHour: 15.5 },
  { label: '15:30 - 16:30', startHour: 15.5, endHour: 16.5 },
  { label: '16:30 - 17:30', startHour: 16.5, endHour: 17.5 },
];

const rowHeight = 90;
const gridStartMinutes = 7.5 * 60;
const totalGridMinutes = (17.5 - 7.5) * 60;

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

function formatDateHeader(date: Date) {
  const dayStr = String(date.getDate()).padStart(2, '0');
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  return `(${dayStr}/${monthStr})`;
}

function formatTimeHHMM(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTimeArrowRange(startStr: string, endStr: string) {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  return `${formatTimeHHMM(start)} -> ${formatTimeHHMM(end)}`;
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

function getEventLayout(event: CalendarEvent) {
  const start = parseDate(event.startTime);
  const end = parseDate(event.endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  const clampedStart = Math.max(startMinutes, gridStartMinutes);
  const clampedEnd = Math.min(endMinutes, 17.5 * 60);
  const durationMinutes = Math.max(50, clampedEnd - clampedStart);

  const topPx = ((clampedStart - gridStartMinutes) / totalGridMinutes) * (timeSlotRanges.length * rowHeight);
  const heightPx = (durationMinutes / 60) * rowHeight;

  return {
    top: topPx,
    height: heightPx,
  };
}

function makeEmptySlotDate(day: Date, startHourVal: number) {
  const result = new Date(day);
  const h = Math.floor(startHourVal);
  const m = Math.round((startHourVal - h) * 60);
  result.setHours(h, m, 0, 0);
  return result;
}

function getMiniCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  let startingDay = firstDayOfMonth.getDay();
  startingDay = startingDay === 0 ? 6 : startingDay - 1;

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

function getCourseCodeTag(event: CalendarEvent) {
  const raw = event.raw as Record<string, any> | undefined;
  if (raw?.courseCode) return raw.courseCode;

  const status = (event.status || '').toLowerCase();
  if (event.kind === 'slot') return event.isAvailable ? 'SLOT RẢNH' : 'ĐÃ KÍN';
  if (['confirmed', 'approved'].includes(status)) return 'ĐÃ DUYỆT';
  if (status === 'pending') return 'CHỜ DUYỆT';
  if (['cancelled', 'canceled', 'rejected'].includes(status)) return 'ĐÃ HỦY';

  return 'HỌC THUẬT';
}

export function WeeklyCalendar({
  events,
  weekStart,
  onWeekChange,
  onEventClick,
  onEmptySlotClick,
  emptySlotLabel = 'Tạo lịch',
}: WeeklyCalendarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [miniMonthDate, setMiniMonthDate] = useState<Date>(new Date(weekStart));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(weekStart));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    'approved',
    'pending',
    'slot-open',
  ]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(true);

  const normalizedWeekStart = startOfWeek(weekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(normalizedWeekStart, index));

  useEffect(() => {
    // Keep selectedDate in sync if weekStart changes from outside
    const selectedWeek = startOfWeek(selectedDate);
    if (!sameDay(selectedWeek, normalizedWeekStart)) {
      setSelectedDate(normalizedWeekStart);
    }
  }, [normalizedWeekStart]);

  const gridHeight = timeSlotRanges.length * rowHeight;

  const filteredEvents = events.filter((event) => {
    let key = 'slate';
    if (event.kind === 'slot') {
      key = event.isAvailable ? 'slot-open' : 'slot-booked';
    } else {
      const s = (event.status || '').toLowerCase();
      if (['approved', 'confirmed'].includes(s)) key = 'approved';
      else if (s === 'pending') key = 'pending';
      else if (['cancelled', 'canceled', 'rejected'].includes(s)) key = 'cancelled';
    }
    return selectedStatuses.includes(key);
  });

  const miniDays = getMiniCalendarDays(miniMonthDate);

  const toggleStatusFilter = (statusKey: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusKey) ? prev.filter((s) => s !== statusKey) : [...prev, statusKey]
    );
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
    setSelectedDate(today);
    onWeekChange(startOfWeek(today));
  };

  const goToPreviousWeek = () => {
    const newWeek = addDays(normalizedWeekStart, -7);
    setSelectedDate(newWeek);
    onWeekChange(newWeek);
  };

  const goToThisWeek = () => {
    const today = new Date();
    setSelectedDate(today);
    onWeekChange(startOfWeek(today));
  };

  const goToNextWeek = () => {
    const newWeek = addDays(normalizedWeekStart, 7);
    setSelectedDate(newWeek);
    onWeekChange(newWeek);
  };

  const handleMiniDayClick = (date: Date) => {
    setSelectedDate(date);
    onWeekChange(startOfWeek(date));
  };

  return (
    <div className={`weekly-calendar-redesign ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* LEFT SIDEBAR PANEL */}
      <aside className="calendar-left-panel">
        <div className="calendar-sidebar-header">
          <div className="calendar-all-dropdown">
            <div className="all-calendar-icon">
              <IconCalendar size={22} />
            </div>
            <div>
              <div className="all-calendar-title">
                Lịch Học Thuật
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

            <button type="button" className="mini-month-label" onClick={goToToday} title="Click để về hôm nay">
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
              const isSelected = sameDay(date, selectedDate);
              const isToday = sameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={`mini-day-cell ${!isCurrentMonth ? 'mini-day-faded' : ''} ${
                    isSelected ? 'mini-day-selected' : ''
                  } ${isToday && !isSelected ? 'mini-day-today' : ''}`}
                  onClick={() => handleMiniDayClick(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* APPOINTMENT STATUS FILTER SECTION */}
        <div className="sidebar-accordion">
          <button
            type="button"
            className="accordion-header"
            onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
          >
            <span>Trạng thái cuộc hẹn</span>
            {isStatusFilterOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>

          {isStatusFilterOpen && (
            <div className="accordion-content">
              {[
                {
                  key: 'approved',
                  name: 'Đã duyệt / Chấp nhận',
                  color: '#22c55e',
                  count: events.filter((e) => ['approved', 'confirmed'].includes((e.status || '').toLowerCase())).length,
                },
                {
                  key: 'pending',
                  name: 'Chờ duyệt',
                  color: '#f59e0b',
                  count: events.filter((e) => (e.status || '').toLowerCase() === 'pending').length,
                },
                {
                  key: 'slot-open',
                  name: 'Slot rảnh',
                  color: '#3b82f6',
                  count: events.filter((e) => e.kind === 'slot' && e.isAvailable).length,
                },
                {
                  key: 'cancelled',
                  name: 'Đã hủy / Từ chối',
                  color: '#ef4444',
                  count: events.filter((e) => ['cancelled', 'canceled', 'rejected'].includes((e.status || '').toLowerCase())).length,
                },
              ].map((st) => {
                const isChecked = selectedStatuses.includes(st.key);
                return (
                  <label key={st.key} className="schedule-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStatusFilter(st.key)}
                    />
                    <span className="checkbox-custom" style={{ borderColor: isChecked ? st.color : undefined, backgroundColor: isChecked ? st.color : undefined }}>
                      {isChecked && <IconCheck size={12} />}
                    </span>
                    <span className="checkbox-label" style={{ flex: 1 }}>{st.name}</span>
                    <span className="category-count">{st.count}</span>
                  </label>
                );
              })}
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
                title="Mở menu bên trái"
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

        {/* CONTROL ROW - Clean month label without chevron 'v' and without count pill */}
        <div className="calendar-controls-bar">
          <div className="controls-bar-left">
            <div className="month-picker-label" onClick={goToToday} title="Click để về hôm nay">
              <span className="month-picker-title">{formatMonthYear(weekStart)}</span>
            </div>

            {/* WEEK NAVIGATION 3-BUTTON GROUP */}
            <div className="week-nav-button-group">
              <button
                type="button"
                className="btn-week-nav"
                onClick={goToPreviousWeek}
                title="Tuần trước"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="btn-week-nav btn-week-nav-center"
                onClick={goToThisWeek}
              >
                Tuần này
              </button>
              <button
                type="button"
                className="btn-week-nav"
                onClick={goToNextWeek}
                title="Tuần sau"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* WEEKLY TIME GRID MATCHING SCREENSHOT 2 & 3 */}
        <div className="weekly-grid-container">
          <div className="weekly-grid-wrapper">
            {/* CORNER TIMEZONE HEADER */}
            <div className="grid-corner-cell">
              <span>UTC +7</span>
            </div>

            {/* DAY COLUMNS HEADERS MATCHING SCREENSHOT 2 (Thứ 2 (05/10)...) */}
            {days.map((day, idx) => {
              const isToday = sameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`grid-day-header ${isToday ? 'grid-day-header-today' : ''}`}
                >
                  <div className="header-day-title">
                    {dayLabelsFull[idx]} <span className="header-day-date">{formatDateHeader(day)}</span>
                  </div>
                </div>
              );
            })}

            {/* WIDE TIME COLUMN FIT ON ONE LINE */}
            <div className="grid-time-column" style={{ height: gridHeight }}>
              {timeSlotRanges.map((slot) => (
                <div key={slot.label} className="time-slot-cell" style={{ height: rowHeight }}>
                  <span>{slot.label}</span>
                </div>
              ))}
            </div>

            {/* DAY EVENT COLUMNS */}
            {days.map((day) => {
              const dayEvents = filteredEvents.filter((event) =>
                sameDay(parseDate(event.startTime), day)
              );

              return (
                <div
                  key={`col-${day.toISOString()}`}
                  className="grid-day-column"
                  style={{ height: gridHeight }}
                >
                  {timeSlotRanges.map((slot) => (
                    <button
                      key={`${day.toISOString()}-${slot.label}`}
                      type="button"
                      className="grid-empty-cell"
                      style={{ height: rowHeight }}
                      onClick={() => onEmptySlotClick?.(makeEmptySlotDate(day, slot.startHour))}
                    >
                      <span className="cell-hover-label">+ {emptySlotLabel}</span>
                    </button>
                  ))}

                  {/* EVENT CARDS */}
                  {dayEvents.map((event) => {
                    const layout = getEventLayout(event);
                    const tone = getEventTone(event);
                    const raw = event.raw as Record<string, any> | undefined;

                    const tagCode = getCourseCodeTag(event);
                    const groupName = raw?.studentGroup || raw?.group || 'Nhóm: 01';
                    const location = raw?.locationOrLink || raw?.room || 'Phòng: Đang cập nhật';
                    const lecturerName = raw?.lecturerName ? `GV: ${raw.lecturerName}` : raw?.studentName ? `SV: ${raw.studentName}` : 'GV: Đang cập nhật';

                    return (
                      <div
                        key={event.id}
                        className={`academic-event-card academic-tone-${tone}`}
                        style={{
                          top: layout.top + 3,
                          height: Math.max(58, layout.height - 6),
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="card-tag-code">{tagCode}</div>
                        <h4 className="card-academic-title">{event.title}</h4>

                        <div className="card-academic-details">
                          <div className="detail-line">{groupName}</div>
                          <div className="detail-line">{location}</div>
                          <div className="detail-line">{lecturerName}</div>
                        </div>

                        <div className="card-time-arrow">
                          {formatTimeArrowRange(event.startTime, event.endTime)}
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
