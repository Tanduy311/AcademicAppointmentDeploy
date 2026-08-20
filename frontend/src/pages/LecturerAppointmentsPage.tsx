import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { AppointmentResponseDto, SlotResponseDto } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import { WeeklyCalendar, type CalendarEvent } from '../components/WeeklyCalendar';
import { Pagination } from '../components/Pagination';
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

  // Pagination for list view
  const [listPage, setListPage] = useState(1);
  const [listPageSize, setListPageSize] = useState(10);

  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<AppointmentResponseDto | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'No-Show'>('Approved');
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
        api.allLecturerAppointments(),
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
    return item.status === 'Cancelled' || item.status === 'Rejected' || item.status === 'Completed' || item.status === 'No-Show' || isPast;
  });

  const displayItems = activeTab === 'current' ? currentItems : historyItems;
  const totalListPages = Math.ceil(displayItems.length / listPageSize) || 1;
  const paginatedDisplayItems = displayItems.slice((listPage - 1) * listPageSize, listPage * listPageSize);

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

  const openDecisionModal = (item: AppointmentResponseDto, status: 'Approved' | 'Rejected' | 'Completed' | 'No-Show') => {
    setActiveItem(item);
    setActionType(status);
    if (status === 'Approved') {
      setResponseMsg('Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.');
    } else if (status === 'Rejected') {
      setResponseMsg('Thầy bận lịch họp đột xuất, em đăng ký lại khung giờ khác giúp thầy nhé.');
    } else if (status === 'Completed') {
      setResponseMsg('Buổi tư vấn học thuật đã hoàn thành tốt đẹp.');
    } else if (status === 'No-Show') {
      setResponseMsg('Sinh viên không có mặt theo giờ hẹn.');
    }
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
      const appt = event.raw as AppointmentResponseDto;
      setActiveItem(appt);
      if (appt.status === 'Pending') {
        setActionType('Approved');
        setResponseMsg('Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.');
      } else {
        setActionType('Completed');
        setResponseMsg('Buổi tư vấn học thuật đã hoàn thành tốt đẹp.');
      }
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
      let targetStatus = 'Confirmed';
      if (actionType === 'Approved') targetStatus = 'Confirmed';
      else if (actionType === 'Cancelled') targetStatus = 'Cancelled';
      else if (actionType === 'Rejected') targetStatus = 'Rejected';
      else if (actionType === 'Completed') targetStatus = 'Completed';
      else if (actionType === 'No-Show') targetStatus = 'No-Show';

      await api.updateAppointmentStatus(activeItem.appointmentId, {
        status: targetStatus,
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
      {/* Header & View Mode Switcher */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconFileText size={24} style={{ color: 'var(--accent)' }} />
            <span>Hàng đợi duyệt lịch hẹn</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Quản lý, phê duyệt và đánh giá kết quả các buổi tư vấn học thuật của sinh viên.
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
              <span>Lịch tuần</span>
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
              {filteredCalendarEvents.length} mục đang hiển thị
            </div>
          </div>

          <div className="grid-3">
            <label className="field">
              <span>Hiển thị theo loại</span>
              <select
                value={calendarKindFilter}
                onChange={(e) => setCalendarKindFilter(e.target.value as any)}
              >
                <option value="all">Tất cả (Lịch hẹn & Slot rảnh)</option>
                <option value="appointments">Chỉ lịch hẹn</option>
                <option value="slots">Chỉ khung giờ rảnh (Slot)</option>
              </select>
            </label>

            <label className="field">
              <span>Trạng thái</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt (Pending)</option>
                <option value="Confirmed">Đã duyệt (Confirmed)</option>
                <option value="Completed">Hoàn thành (Completed)</option>
                <option value="No-Show">Vắng mặt (No-Show)</option>
                <option value="Available">Slot còn trống</option>
              </select>
            </label>

            <label className="field">
              <span>Hình thức</span>
              <select
                value={meetingTypeFilter}
                onChange={(e) => setMeetingTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả hình thức</option>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
            </label>
          </div>

          <WeeklyCalendar
            events={filteredCalendarEvents}
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            onEventClick={handleCalendarEventClick}
            onEmptySlotClick={openCreateSlotModal}
            emptySlotLabel="Mở slot rảnh"
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Sub Tabs: Chờ & Sắp tới vs Lịch sử */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            <button
              type="button"
              className="btn"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: activeTab === 'current' ? 700 : 500,
                background: activeTab === 'current' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'current' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => setActiveTab('current')}
            >
              <IconFileText size={16} />
              <span>Chờ duyệt & Sắp tới</span>
              <span
                style={{
                  background: activeTab === 'current' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: activeTab === 'current' ? '#fff' : '#475569',
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
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: activeTab === 'history' ? 700 : 500,
                background: activeTab === 'history' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => setActiveTab('history')}
            >
              <IconHistory size={16} />
              <span>Lịch sử các buổi tư vấn</span>
              <span
                style={{
                  background: activeTab === 'history' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: activeTab === 'history' ? '#fff' : '#475569',
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
            {paginatedDisplayItems.map((item) => {
              const isStartedOrPast = new Date(item.startTime).getTime() <= Date.now();

              return (
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

                  {item.attachmentUrl ? (
                    <div style={{ background: '#f8fafc', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconFileText size={16} style={{ color: 'var(--accent)' }} />
                        <span><strong>Tài liệu đính kèm:</strong> {item.attachmentName || 'Tệp đính kèm'}</span>
                      </div>
                      <a
                        href={item.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        Tải / Xem file
                      </a>
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
                  ) : (item.status === 'Confirmed' || item.status === 'Approved') ? (
                    <div style={{ paddingTop: 8, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {isStartedOrPast ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '0.82rem', padding: '6px 14px', color: '#64748b' }}
                            onClick={() => openDecisionModal(item, 'No-Show')}
                            disabled={busyId === item.appointmentId}
                          >
                            <span>Đánh dấu Vắng mặt (No-Show)</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-success"
                            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                            onClick={() => openDecisionModal(item, 'Completed')}
                            disabled={busyId === item.appointmentId}
                          >
                            <IconCheck size={15} />
                            <span>Đánh dấu Hoàn thành</span>
                          </button>
                        </>
                      ) : (
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
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}

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

            <Pagination
              currentPage={listPage}
              totalPages={totalListPages}
              totalItems={displayItems.length}
              pageSize={listPageSize}
              onPageChange={(p) => setListPage(p)}
              onPageSizeChange={(s) => {
                setListPageSize(s);
                setListPage(1);
              }}
            />
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
              ) : actionType === 'Completed' ? (
                <>
                  <IconCheck size={20} style={{ color: 'var(--success)' }} />
                  <span>Đánh dấu buổi tư vấn đã Hoàn thành</span>
                </>
              ) : actionType === 'No-Show' ? (
                <>
                  <IconAlert size={20} style={{ color: '#eab308' }} />
                  <span>Đánh dấu Sinh viên Vắng mặt (No-Show)</span>
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
              <span>
                {actionType === 'Cancelled'
                  ? 'Lý do hủy lịch gửi tới sinh viên:'
                  : actionType === 'Completed'
                  ? 'Ghi chú tóm tắt sau buổi tư vấn:'
                  : actionType === 'No-Show'
                  ? 'Ghi chú lý do vắng mặt:'
                  : 'Lời nhắn phản hồi gửi tới sinh viên:'}
              </span>
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
                className={actionType === 'Approved' || actionType === 'Completed' ? 'btn btn-success' : 'btn btn-danger'}
                onClick={handleDecisionSubmit}
                disabled={busyId === activeItem.appointmentId}
              >
                {busyId === activeItem.appointmentId
                  ? 'Đang lưu...'
                  : actionType === 'Approved'
                  ? 'Xác nhận duyệt'
                  : actionType === 'Completed'
                  ? 'Xác nhận hoàn thành'
                  : actionType === 'No-Show'
                  ? 'Xác nhận vắng mặt'
                  : actionType === 'Cancelled'
                  ? 'Xác nhận hủy'
                  : 'Xác nhận từ chối'}
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
