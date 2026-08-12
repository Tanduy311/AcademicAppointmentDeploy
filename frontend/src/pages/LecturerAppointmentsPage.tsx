import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { AppointmentResponseDto, SlotResponseDto } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import { WeeklyCalendar, type CalendarEvent } from '../components/WeeklyCalendar';
import {
  IconFileText,
  IconBookmark,
  IconUser,
  IconCalendar,
  IconMapPin,
  IconChat,
  IconCheck,
  IconClose,
  IconHistory,
  IconPlus,
  IconAlert,
} from '../components/Icons';

export function LecturerAppointmentsPage() {
  const [items, setItems] = useState<AppointmentResponseDto[]>([]);
  const [slots, setSlots] = useState<SlotResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [weekStart, setWeekStart] = useState(() => new Date());
  
  // Filters
  const [calendarKindFilter, setCalendarKindFilter] = useState<'all' | 'appointments' | 'slots'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState('all');

  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<AppointmentResponseDto | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | 'Cancelled'>('Approved');
  const [responseMsg, setResponseMsg] = useState('Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.');
  const [slotModal, setSlotModal] = useState<{
    startTime: string;
    endTime: string;
    meetingType: string;
    locationOrLink: string;
  } | null>(null);
  const [slotError, setSlotError] = useState('');
  const [slotBusy, setSlotBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [appointmentResult, slotResult] = await Promise.all([
        api.lecturerAppointments(),
        api.mySlots(),
      ]);
      setItems(appointmentResult);
      setSlots(slotResult);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Categorize into Current vs History
  const currentItems = items.filter((item) => {
    const isPast = new Date(item.endTime).getTime() < Date.now();
    return (item.status === 'Pending' || item.status === 'Confirmed' || item.status === 'Approved') && !isPast;
  });

  const historyItems = items.filter((item) => {
    const isPast = new Date(item.endTime).getTime() < Date.now();
    return item.status === 'Cancelled' || item.status === 'Rejected' || isPast;
  });

  const displayItems = activeTab === 'current' ? currentItems : historyItems;

  const rawCalendarEvents: CalendarEvent<AppointmentResponseDto | SlotResponseDto>[] = useMemo(() => [
    ...slots.map((slot) => ({
      id: `slot-${slot.availabilitySlotId}`,
      kind: 'slot' as const,
      title: slot.isAvailable ? 'Slot rảnh' : 'Slot đã được đặt',
      subtitle: slot.meetingType,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      raw: slot,
    })),
    ...items.map((item) => ({
      id: `appointment-${item.appointmentId}`,
      kind: 'appointment' as const,
      title: item.topic,
      subtitle: item.studentName,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      raw: item,
    })),
  ], [slots, items]);

  const filteredCalendarEvents = useMemo(() => {
    return rawCalendarEvents.filter((event) => {
      if (calendarKindFilter === 'appointments' && event.kind !== 'appointment') return false;
      if (calendarKindFilter === 'slots' && event.kind !== 'slot') return false;

      if (statusFilter !== 'all') {
        if (event.kind === 'slot') {
          if (statusFilter !== 'Available' || !event.isAvailable) return false;
        } else {
          if (event.status !== statusFilter) return false;
        }
      }

      if (meetingTypeFilter !== 'all') {
        const rawObj = event.raw as any;
        const mt = rawObj?.meetingType;
        if (mt && mt !== meetingTypeFilter) return false;
      }

      return true;
    });
  }, [rawCalendarEvents, calendarKindFilter, statusFilter, meetingTypeFilter]);

  const openDecisionModal = (item: AppointmentResponseDto, status: 'Approved' | 'Rejected') => {
    setActiveItem(item);
    setActionType(status);
    setResponseMsg(status === 'Approved' ? 'Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.' : 'Thầy bận lịch họp đột xuất, em đăng ký lại khung giờ khác giúp thầy nhé.');
  };

  const openCancelModal = (item: AppointmentResponseDto) => {
    setActiveItem(item);
    setActionType('Cancelled');
    setResponseMsg('Thầy bận lịch đột xuất nên xin phép hủy lịch hẹn này, em thông cảm nhé.');
  };

  const toDateTimeLocalValue = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const openCreateSlotModal = (start: Date) => {
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    setSlotError('');
    setSlotModal({
      startTime: toDateTimeLocalValue(start),
      endTime: toDateTimeLocalValue(end),
      meetingType: 'Offline',
      locationOrLink: 'Phòng 302-A1',
    });
  };

  const handleCalendarEventClick = (event: CalendarEvent) => {
    if (event.kind === 'appointment') {
      setActiveItem(event.raw as AppointmentResponseDto);
      setActionType('Approved');
      setResponseMsg('Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.');
      return;
    }

    const slot = event.raw as SlotResponseDto;
    alert(`${slot.isAvailable ? 'Slot còn trống' : 'Slot đã có sinh viên đặt'}\n${formatDateTime(slot.startTime)} - ${formatDateTime(slot.endTime)}\n${slot.meetingType}${slot.locationOrLink ? ` (${slot.locationOrLink})` : ''}`);
  };

  const handleCreateSlotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slotModal) return;
    setSlotBusy(true);
    setSlotError('');
    try {
      await api.createSlot(slotModal);
      setSlotModal(null);
      await load();
    } catch (err) {
      setSlotError(err instanceof Error ? err.message : 'Không thể tạo khung giờ rảnh.');
    } finally {
      setSlotBusy(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!activeItem) return;
    setBusyId(activeItem.appointmentId);
    try {
      await api.updateAppointmentStatus(activeItem.appointmentId, {
        status: actionType === 'Approved' ? 'Confirmed' : actionType === 'Cancelled' ? 'Cancelled' : 'Rejected',
        lecturerResponse: responseMsg,
      });
      setActiveItem(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái lịch hẹn.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải hàng đợi lịch hẹn...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & View Mode Switcher Matching Student View */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconFileText size={24} style={{ color: 'var(--accent)' }} />
            <span>Hàng đợi duyệt lịch hẹn</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Quản lý và phê duyệt các yêu cầu tư vấn học thuật do sinh viên gửi đến cho bạn.
          </p>
        </div>

        {/* View Mode Switcher [ Lịch | Danh sách ] */}
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
          {/* Bộ lọc lịch tuần */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCalendar size={18} style={{ color: 'var(--accent)' }} />
              <span>Bộ lọc lịch tuần</span>
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {filteredCalendarEvents.length} mục đang hiển thị
            </div>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Loại lịch</span>
              <select value={calendarKindFilter} onChange={(e) => setCalendarKindFilter(e.target.value as 'all' | 'appointments' | 'slots')}>
                <option value="all">Tất cả</option>
                <option value="appointments">Lịch hẹn sinh viên</option>
                <option value="slots">Slot rảnh của tôi</option>
              </select>
            </label>

            <label className="field">
              <span>Trạng thái</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="Available">Slot rảnh</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Confirmed">Đã duyệt</option>
                <option value="Approved">Đã phê duyệt</option>
                <option value="Cancelled">Đã hủy</option>
                <option value="Rejected">Từ chối</option>
              </select>
            </label>

            <label className="field">
              <span>Hình thức</span>
              <select value={meetingTypeFilter} onChange={(e) => setMeetingTypeFilter(e.target.value)}>
                <option value="all">Tất cả hình thức</option>
                <option value="Offline">Gặp trực tiếp (Offline)</option>
                <option value="Online">Trực tuyến (Online)</option>
              </select>
            </label>
          </div>

          <WeeklyCalendar
            events={filteredCalendarEvents}
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            onEventClick={handleCalendarEventClick}
            onEmptySlotClick={openCreateSlotModal}
            emptySlotLabel="Tạo slot"
          />
        </div>
      ) : (
        /* List Mode with Tabs */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
              <span>Yêu cầu cần duyệt và hiện tại</span>
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
              <span>Lịch sử và đã hủy</span>
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayItems.map((item) => (
              <div key={item.appointmentId} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconBookmark size={18} style={{ color: 'var(--accent)' }} />
                      <span>{item.topic}</span>
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <IconUser size={16} />
                      <span>Sinh viên đăng ký: <strong>{item.studentName}</strong> (Mã SV: {item.studentCode || 'SV001'})</span>
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
                    <span><strong>Hình thức:</strong> <span className="badge badge-neutral">{item.meetingType}</span> ({item.locationOrLink || 'Chưa cập nhật'})</span>
                  </div>
                </div>

                {item.description ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <IconChat size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span><strong>Nội dung câu hỏi sinh viên:</strong> {item.description}</span>
                  </div>
                ) : null}

                {item.lecturerResponse ? (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <IconChat size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span><strong>Lời nhắn của bạn:</strong> {item.lecturerResponse}</span>
                  </div>
                ) : null}

                {item.cancellationReason ? (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#dc2626', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <IconChat size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span><strong>Lý do sinh viên hủy lịch:</strong> {item.cancellationReason}</span>
                  </div>
                ) : null}

                {item.status === 'Pending' ? (
                  <div style={{ paddingTop: 8, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ fontSize: '0.85rem', fontWeight: 500, padding: '6px 16px', borderRadius: 'var(--radius-md)' }}
                      onClick={() => openDecisionModal(item, 'Rejected')}
                      disabled={busyId === item.appointmentId}
                    >
                      <span>Từ chối</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      style={{ fontSize: '0.85rem', fontWeight: 500, padding: '6px 16px', borderRadius: 'var(--radius-md)' }}
                      onClick={() => openDecisionModal(item, 'Approved')}
                      disabled={busyId === item.appointmentId}
                    >
                      <span>Phê duyệt</span>
                    </button>
                  </div>
                ) : (item.status === 'Confirmed' || item.status === 'Approved') && activeTab === 'current' ? (
                  <div style={{ paddingTop: 8, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => openCancelModal(item)}
                      disabled={busyId === item.appointmentId}
                    >
                      <IconClose size={15} />
                      <span>Hủy Lịch Hẹn Này</span>
                    </button>
                  </div>
                ) : null}
              </div>
            ))}

            {displayItems.length === 0 && (
              <div className="panel" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                {activeTab === 'current' ? (
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Không có yêu cầu tư vấn nào mới</div>
                    <div style={{ fontSize: '0.85rem' }}>Hiện tại không có lịch hẹn mới nào cần bạn xử lý phê duyệt.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Chưa có lịch sử yêu cầu cũ</div>
                    <div style={{ fontSize: '0.85rem' }}>Các cuộc hẹn đã hoàn thành hoặc bị từ chối/hủy sẽ lưu tại đây.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Response Modal Overlay */}
      {activeItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              {actionType === 'Approved' ? (
                <>
                  <IconCheck size={20} style={{ color: 'var(--success)' }} />
                  <span>Phê duyệt lịch hẹn</span>
                </>
              ) : actionType === 'Cancelled' ? (
                <>
                  <IconClose size={20} style={{ color: '#dc2626' }} />
                  <span>Hủy lịch hẹn đã duyệt</span>
                </>
              ) : (
                <>
                  <IconClose size={20} style={{ color: 'var(--danger)' }} />
                  <span>Từ chối lịch hẹn</span>
                </>
              )}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Lịch tư vấn: <strong>"{activeItem.topic}"</strong> của SV {activeItem.studentName}.
            </p>

            <label className="field" style={{ marginBottom: 20 }}>
              <span>{actionType === 'Cancelled' ? 'Lý do hủy lịch gửi tới sinh viên:' : 'Lời nhắn phản hồi gửi tới sinh viên:'}</span>
              <textarea
                rows={3}
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                placeholder="Nhập ghi chú phản hồi..."
              />
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveItem(null)}>
                Hủy bỏ
              </button>
              <button
                type="button"
                className={actionType === 'Approved' ? 'btn btn-success' : 'btn btn-danger'}
                onClick={handleDecisionSubmit}
                disabled={busyId === activeItem.appointmentId}
              >
                {busyId === activeItem.appointmentId ? 'Đang lưu...' : actionType === 'Approved' ? 'Xác nhận duyệt' : actionType === 'Cancelled' ? 'Xác nhận hủy' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {slotModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateSlotSubmit}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconPlus size={20} style={{ color: 'var(--accent)' }} />
              <span>Tạo slot rảnh từ lịch tuần</span>
            </h2>

            {slotError ? (
              <div className="badge badge-danger" style={{ padding: 12, width: '100%', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconAlert size={16} />
                <span>{slotError}</span>
              </div>
            ) : null}

            <div className="grid-2" style={{ gap: 14, marginBottom: 16 }}>
              <label className="field">
                <span>Bắt đầu</span>
                <input
                  type="datetime-local"
                  value={slotModal.startTime}
                  onChange={(e) => setSlotModal((prev) => prev ? { ...prev, startTime: e.target.value } : prev)}
                  required
                />
              </label>

              <label className="field">
                <span>Kết thúc</span>
                <input
                  type="datetime-local"
                  value={slotModal.endTime}
                  onChange={(e) => setSlotModal((prev) => prev ? { ...prev, endTime: e.target.value } : prev)}
                  required
                />
              </label>

              <label className="field">
                <span>Hình thức</span>
                <select
                  value={slotModal.meetingType}
                  onChange={(e) => setSlotModal((prev) => prev ? { ...prev, meetingType: e.target.value } : prev)}
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </label>

              <label className="field">
                <span>Địa điểm hoặc link</span>
                <input
                  value={slotModal.locationOrLink}
                  onChange={(e) => setSlotModal((prev) => prev ? { ...prev, locationOrLink: e.target.value } : prev)}
                  placeholder="Phòng 302-A1 hoặc link Meet"
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSlotModal(null)}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary" disabled={slotBusy}>
                {slotBusy ? 'Đang lưu...' : 'Tạo slot'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
