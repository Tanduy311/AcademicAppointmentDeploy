import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { AppointmentResponseDto, LecturerListItemDto, SlotResponseDto } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import { WeeklyCalendar, type CalendarEvent } from '../components/WeeklyCalendar';
import { Pagination } from '../components/Pagination';
import {
  IconBookmark,
  IconTeacher,
  IconCalendar,
  IconMapPin,
  IconChat,
  IconFileText,
  IconAlert,
  IconCheck,
  IconHistory,
} from '../components/Icons';

export function StudentAppointmentsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppointmentResponseDto[]>([]);
  const [lecturers, setLecturers] = useState<LecturerListItemDto[]>([]);
  const [availableSlots, setAvailableSlots] = useState<SlotResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'available'>('current');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [weekStart, setWeekStart] = useState(() => new Date());
  const [calendarKindFilter, setCalendarKindFilter] = useState<'all' | 'appointments' | 'slots'>('all');
  const [lecturerFilter, setLecturerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState('all');
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);

  // Pagination for list view
  const [listPage, setListPage] = useState(1);
  const [listPageSize, setListPageSize] = useState(10);
  
  // Separate Modal States: 'view' | 'cancel' | null
  const [activeModal, setActiveModal] = useState<{
    item: AppointmentResponseDto;
    mode: 'view' | 'cancel';
  } | null>(null);

  const [cancelBusyId, setCancelBusyId] = useState<number | null>(null);
  const [reason, setReason] = useState('Em bận đột xuất lịch học trên lớp.');

  const load = async () => {
    setLoading(true);
    try {
      const [appointmentResult, lecturerResult] = await Promise.all([
        api.allMyAppointments(),
        api.lecturers(),
      ]);
      setItems(appointmentResult);
      setLecturers(lecturerResult);

      const lecturerDetails = await Promise.allSettled(
        lecturerResult
          .filter((lecturer) => lecturer.upcomingSlotCount > 0)
          .map((lecturer) => api.lecturerById(lecturer.lecturerId))
      );
      setAvailableSlots(
        lecturerDetails
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => (result as PromiseFulfilledResult<any>).value.upcomingSlots)
          .filter((slot) => slot.isAvailable)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canCancel = (status: string) => ['Pending', 'Confirmed', 'Approved'].includes(status);

  // Categorize appointments into Current vs History
  const currentItems = items.filter((item) => {
    const isPast = new Date(item.endTime).getTime() < Date.now();
    return (item.status === 'Pending' || item.status === 'Confirmed' || item.status === 'Approved') && !isPast;
  });

  const historyItems = items.filter((item) => {
    const isPast = new Date(item.endTime).getTime() < Date.now();
    return item.status === 'Cancelled' || item.status === 'Rejected' || item.status === 'Completed' || item.status === 'No-Show' || isPast;
  });

  const displayItems = activeTab === 'current' ? currentItems : activeTab === 'history' ? historyItems : [];
  const totalListPages = Math.ceil(displayItems.length / listPageSize) || 1;
  const paginatedItems = displayItems.slice((listPage - 1) * listPageSize, listPage * listPageSize);
  const calendarEvents: CalendarEvent<AppointmentResponseDto | SlotResponseDto>[] = useMemo(() => {
    const appointmentEvents: CalendarEvent<AppointmentResponseDto>[] = items.map((item) => ({
      id: `appointment-${item.appointmentId}`,
      kind: 'appointment',
      title: item.topic,
      subtitle: item.lecturerName,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      raw: item,
    }));

    const slotEvents: CalendarEvent<SlotResponseDto>[] = availableSlots.map((slot) => ({
      id: `slot-${slot.availabilitySlotId}`,
      kind: 'slot',
      title: 'Slot rảnh',
      subtitle: `${slot.lecturerName}${slot.department ? ` - ${slot.department}` : ''}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      raw: slot,
    }));

    return [...appointmentEvents, ...slotEvents].filter((event) => {
      if (calendarKindFilter === 'appointments' && event.kind !== 'appointment') return false;
      if (calendarKindFilter === 'slots' && event.kind !== 'slot') return false;

      const lecturerId = String((event.raw as AppointmentResponseDto | SlotResponseDto).lecturerId);
      if (lecturerFilter !== 'all' && lecturerId !== lecturerFilter) return false;

      const meetingType = (event.raw as AppointmentResponseDto | SlotResponseDto).meetingType;
      if (meetingTypeFilter !== 'all' && meetingType !== meetingTypeFilter) return false;

      if (statusFilter !== 'all') {
        if (event.kind === 'slot') return statusFilter === 'Available';
        return (event.raw as AppointmentResponseDto).status === statusFilter;
      }

      return true;
    });
  }, [availableSlots, calendarKindFilter, items, lecturerFilter, meetingTypeFilter, statusFilter]);

  const openViewModal = async (item: AppointmentResponseDto) => {
    setDetailLoadingId(item.appointmentId);
    try {
      const detail = await api.appointmentsById(item.appointmentId);
      setActiveModal({ item: detail, mode: 'view' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tải chi tiết lịch hẹn.');
    } finally {
      setDetailLoadingId(null);
    }
  };

  const openCancelModal = (item: AppointmentResponseDto) => {
    setReason('Em bận đột xuất lịch học trên lớp.');
    setActiveModal({ item, mode: 'cancel' });
  };

  const handleCalendarEventClick = (event: CalendarEvent) => {
    if (event.kind === 'slot') {
      navigate(`/app/lecturers/${(event.raw as SlotResponseDto).lecturerId}`);
      return;
    }

    openViewModal(event.raw as AppointmentResponseDto);
  };

  const handleCancelSubmit = async () => {
    if (!activeModal?.item) return;
    setCancelBusyId(activeModal.item.appointmentId);
    try {
      await api.cancelAppointment(activeModal.item.appointmentId, { cancellationReason: reason });
      setActiveModal(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể hủy lịch hẹn.');
    } finally {
      setCancelBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách lịch hẹn...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Tabs */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconFileText size={24} style={{ color: 'var(--accent)' }} />
            <span>Lịch hẹn của tôi</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Theo dõi và quản lý các buổi tư vấn học thuật bạn đã đăng ký với giảng viên.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 4, borderRadius: 'var(--radius-md)', gap: 4 }}>
            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.88rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'calendar' ? '#fff' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: viewMode === 'calendar' ? 700 : 500,
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setViewMode('calendar')}
            >
              <IconCalendar size={16} />
              <span>Lịch</span>
            </button>

            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.88rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'list' ? '#fff' : 'transparent',
                color: viewMode === 'list' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: viewMode === 'list' ? 700 : 500,
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setViewMode('list')}
            >
              <IconFileText size={16} />
              <span>Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCalendar size={18} style={{ color: 'var(--accent)' }} />
              <span>Bộ lọc lịch tuần</span>
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {calendarEvents.length} mục đang hiển thị
            </div>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Loại lịch</span>
              <select value={calendarKindFilter} onChange={(event) => setCalendarKindFilter(event.target.value as 'all' | 'appointments' | 'slots')}>
                <option value="all">Tất cả</option>
                <option value="appointments">Lịch hẹn của tôi</option>
                <option value="slots">Slot rảnh của giảng viên</option>
              </select>
            </label>

            <label className="field">
              <span>Giảng viên</span>
              <select value={lecturerFilter} onChange={(event) => setLecturerFilter(event.target.value)}>
                <option value="all">Tất cả giảng viên</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                    {lecturer.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Trạng thái</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="Available">Slot rảnh</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Confirmed">Đã duyệt</option>
                <option value="Approved">Đã phê duyệt</option>
                <option value="Completed">Hoàn thành</option>
                <option value="No-Show">Vắng mặt</option>
                <option value="Cancelled">Đã hủy</option>
                <option value="Rejected">Từ chối</option>
              </select>
            </label>

            <label className="field">
              <span>Hình thức</span>
              <select value={meetingTypeFilter} onChange={(event) => setMeetingTypeFilter(event.target.value)}>
                <option value="all">Tất cả hình thức</option>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
            </label>
          </div>
        </div>
      ) : (
        <div className="panel" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 4, borderRadius: 'var(--radius-md)', gap: 4 }}>
            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.88rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'current' ? '#fff' : 'transparent',
                color: activeTab === 'current' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'current' ? 700 : 500,
                boxShadow: activeTab === 'current' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => setActiveTab('current')}
            >
              <IconCalendar size={16} style={{ color: activeTab === 'current' ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span>Cuộc hẹn hiện tại</span>
              <span
                style={{
                  background: activeTab === 'current' ? 'var(--accent)' : '#cbd5e1',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {currentItems.length}
              </span>
            </button>

            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.88rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'history' ? '#fff' : 'transparent',
                color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'history' ? 700 : 500,
                boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => setActiveTab('history')}
            >
              <IconHistory size={16} style={{ color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-muted)' }} />
              <span>Lịch sử cuộc hẹn</span>
              <span
                style={{
                  background: activeTab === 'history' ? '#64748b' : '#cbd5e1',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {historyItems.length}
              </span>
            </button>

            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.88rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'available' ? '#fff' : 'transparent',
                color: activeTab === 'available' ? 'var(--success)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'available' ? 700 : 500,
                boxShadow: activeTab === 'available' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => setActiveTab('available')}
            >
              <IconCalendar size={16} style={{ color: activeTab === 'available' ? 'var(--success)' : 'var(--text-muted)' }} />
              <span>Lịch trống</span>
              <span
                style={{
                  background: activeTab === 'available' ? 'var(--success)' : '#cbd5e1',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {availableSlots.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <WeeklyCalendar
          events={calendarEvents}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onEventClick={handleCalendarEventClick}
          onEmptySlotClick={() => navigate('/app/lecturers')}
          emptySlotLabel="Tìm giảng viên"
        />
      ) : null}

      {viewMode === 'list' && activeTab !== 'available' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paginatedItems.map((item) => (
            <div key={item.appointmentId} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconBookmark size={18} style={{ color: 'var(--accent)' }} />
                    <span>{item.topic}</span>
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <IconTeacher size={16} />
                    <span>Giảng viên: <strong>{item.lecturerName}</strong> ({item.department || 'Khoa CNTT'})</span>
                  </div>
                </div>

                <StatusBadge value={item.status} />
              </div>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', background: '#f8fafc', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconCalendar size={16} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Thời gian tư vấn:</strong> {formatDateTime(item.startTime)} - {formatDateTime(item.endTime)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconMapPin size={16} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Hình thức:</strong> <span className="badge badge-neutral">{item.meetingType}</span> {item.locationOrLink ? `(${item.locationOrLink})` : ''}</span>
                </div>
              </div>

              {item.description ? (
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <IconChat size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span><strong>Ghi chú:</strong> {item.description}</span>
                </div>
              ) : null}

              {item.lecturerResponse ? (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 10, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#1d4ed8' }}>
                  <strong>Lời nhắn từ giảng viên:</strong> {item.lecturerResponse}
                </div>
              ) : null}

              {item.cancellationReason ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 10, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#dc2626' }}>
                  <strong>Lý do đã hủy lịch:</strong> {item.cancellationReason}
                </div>
              ) : null}

              <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {canCancel(item.status) && activeTab === 'current' ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ color: '#dc2626', fontSize: '0.82rem' }}
                    onClick={() => openCancelModal(item)}
                  >
                    Hủy lịch hẹn
                  </button>
                ) : <div />}

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => openViewModal(item)}
                  disabled={detailLoadingId === item.appointmentId}
                >
                  <span>{detailLoadingId === item.appointmentId ? 'Đang tải...' : 'Xem chi tiết'}</span>
                </button>
              </div>
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              {activeTab === 'current' ? (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Bạn chưa có lịch hẹn tư vấn nào sắp tới</div>
                  <div style={{ fontSize: '0.85rem' }}>Hãy chọn danh sách giảng viên để tìm slot phù hợp và đăng ký.</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Chưa có lịch sử cuộc hẹn cũ</div>
                  <div style={{ fontSize: '0.85rem' }}>Các buổi tư vấn đã kết thúc hoặc bị hủy sẽ xuất hiện tại đây.</div>
                </div>
              )}
            </div>
          )}

          <Pagination
            currentPage={listPage}
            totalPages={totalListPages}
            totalItems={displayItems.length}
            pageSize={listPageSize}
            itemName="lịch hẹn"
            onPageChange={(p) => setListPage(p)}
            onPageSizeChange={(s) => {
              setListPageSize(s);
              setListPage(1);
            }}
          />
        </div>
      ) : null}

      {viewMode === 'list' && activeTab === 'available' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {availableSlots.map((slot) => (
            <div key={slot.availabilitySlotId} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconCalendar size={17} style={{ color: 'var(--success)' }} />
                  <span>Slot rảnh với {slot.lecturerName}</span>
                </h3>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  <span><strong>Thời gian:</strong> {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}</span>
                  <span><strong>Khoa:</strong> {slot.department || 'Chưa cập nhật'}</span>
                  <span><strong>Hình thức:</strong> <span className="badge badge-neutral">{slot.meetingType}</span></span>
                  <span><strong>Địa điểm/link:</strong> {slot.locationOrLink || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-success"
                onClick={() => navigate(`/app/lecturers/${slot.lecturerId}`)}
              >
                Đặt lịch
              </button>
            </div>
          ))}

          {availableSlots.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              Hiện chưa có slot rảnh nào từ giảng viên.
            </div>
          ) : null}
        </div>
      ) : null}

      {/* MODAL 1: VIEW DETAILS ONLY */}
      {activeModal && activeModal.mode === 'view' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                <IconFileText size={22} style={{ color: 'var(--accent)' }} />
                <span>Chi tiết buổi tư vấn</span>
              </h2>
              <StatusBadge value={activeModal.item.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {activeModal.item.topic}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconTeacher size={16} />
                  <span>Giảng viên: <strong style={{ color: 'var(--text-primary)' }}>{activeModal.item.lecturerName}</strong> ({activeModal.item.department || 'Khoa CNTT'})</span>
                </div>
              </div>

              {/* Grid Information Card */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconCalendar size={16} style={{ color: 'var(--accent)' }} />
                  <span><strong>Thời gian:</strong> {formatDateTime(activeModal.item.startTime)} - {formatDateTime(activeModal.item.endTime)}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconMapPin size={16} style={{ color: 'var(--accent)' }} />
                  <span><strong>Hình thức:</strong> <span className="badge badge-neutral">{activeModal.item.meetingType}</span> {activeModal.item.locationOrLink ? `(${activeModal.item.locationOrLink})` : ''}</span>
                </div>
              </div>

              {/* Notes */}
              {activeModal.item.description && (
                <div style={{ background: '#fff', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconChat size={14} />
                    <span>Ghi chú yêu cầu của sinh viên</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{activeModal.item.description}</div>
                </div>
              )}

              {/* Lecturer Response */}
              {activeModal.item.lecturerResponse && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#1d4ed8' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconCheck size={16} />
                    <span>Lời nhắn phản hồi từ giảng viên:</span>
                  </div>
                  <div>{activeModal.item.lecturerResponse}</div>
                </div>
              )}

              {/* Cancellation Reason */}
              {activeModal.item.cancellationReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#dc2626' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconAlert size={16} />
                    <span>Lý do đã hủy lịch:</span>
                  </div>
                  <div>{activeModal.item.cancellationReason}</div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                {canCancel(activeModal.item.status) && activeTab === 'current' ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ color: '#dc2626', fontSize: '0.82rem' }}
                    onClick={() => openCancelModal(activeModal.item)}
                  >
                    Hủy lịch hẹn
                  </button>
                ) : <div />}

                <button type="button" className="btn btn-primary" onClick={() => setActiveModal(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL APPOINTMENT ONLY */}
      {activeModal && activeModal.mode === 'cancel' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
              <IconAlert size={22} />
              <span>Hủy lịch hẹn tư vấn</span>
            </h2>

            <div style={{ background: '#fef2f2', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', marginBottom: 16, fontSize: '0.85rem', color: '#991b1b' }}>
              Bạn đang yêu cầu hủy lịch hẹn <strong>"{activeModal.item.topic}"</strong> với Giảng viên <strong>{activeModal.item.lecturerName}</strong>.
            </div>

            {/* Quick Reasons Selection */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Chọn nhanh lý do:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  'Em bận đột xuất lịch học trên lớp.',
                  'Trùng lịch thi đột xuất.',
                  'Đã tự giải quyết được thắc mắc.',
                ].map((qReason) => (
                  <button
                    key={qReason}
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => setReason(qReason)}
                  >
                    {qReason}
                  </button>
                ))}
              </div>
            </div>

            <label className="field" style={{ marginBottom: 20 }}>
              <span>Chi tiết lý do hủy lịch:</span>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do gửi tới giảng viên..."
                required
              />
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                Quay lại
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelSubmit}
                disabled={cancelBusyId === activeModal.item.appointmentId}
              >
                {cancelBusyId === activeModal.item.appointmentId ? 'Đang hủy...' : 'Xác nhận hủy lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
