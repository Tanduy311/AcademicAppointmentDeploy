import { useEffect, useMemo, useState } from 'react';
import { IconCalendar, IconSearch, IconTeacher, IconUser } from '../components/Icons';
import { api } from '../services/api';
import type { AppointmentResponseDto } from '../types/api';
import { formatDateTime, formatStatusLabel, getStatusTone, parseDate } from '../utils/format';

function StatusBadge({ value }: { value: string }) {
  const tone = getStatusTone(value);
  return <span className={`badge badge-${tone}`}>{formatStatusLabel(value)}</span>;
}

function isCurrentAppointment(item: AppointmentResponseDto) {
  const end = parseDate(item.endTime);
  const normalizedStatus = item.status.toLowerCase();
  return !['cancelled', 'canceled', 'rejected'].includes(normalizedStatus) && end >= new Date();
}

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState<'current' | 'history' | 'all'>('current');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState('ALL');

  useEffect(() => {
    api
      .adminAppointments()
      .then(setAppointments)
      .catch((err) => alert(err instanceof Error ? err.message : 'Không thể tải danh sách cuộc hẹn.'))
      .finally(() => setLoading(false));
  }, []);

  const meetingTypes = useMemo(
    () => Array.from(new Set(appointments.map((item) => item.meetingType).filter(Boolean))).sort(),
    [appointments]
  );

  const currentCount = appointments.filter(isCurrentAppointment).length;
  const pendingCount = appointments.filter((item) => item.status.toLowerCase() === 'pending').length;
  const confirmedCount = appointments.filter((item) => ['confirmed', 'approved'].includes(item.status.toLowerCase())).length;

  const filteredAppointments = appointments.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.topic.toLowerCase().includes(query) ||
      item.studentName.toLowerCase().includes(query) ||
      item.lecturerName.toLowerCase().includes(query) ||
      (item.studentCode && item.studentCode.toLowerCase().includes(query)) ||
      (item.department && item.department.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesMeetingType = meetingTypeFilter === 'ALL' || item.meetingType === meetingTypeFilter;
    const isCurrent = isCurrentAppointment(item);
    const matchesTime = timeFilter === 'all' || (timeFilter === 'current' ? isCurrent : !isCurrent);

    return matchesSearch && matchesStatus && matchesMeetingType && matchesTime;
  });

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách cuộc hẹn...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCalendar size={24} style={{ color: 'var(--accent)' }} />
              <span>Quản lý cuộc hẹn hiện tại</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Theo dõi toàn bộ lịch hẹn giữa sinh viên và giảng viên trên hệ thống.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-neutral">Tổng: {appointments.length}</span>
            <span className="badge badge-success">Đang hiệu lực: {currentCount}</span>
            <span className="badge badge-warning">Chờ duyệt: {pendingCount}</span>
            <span className="badge badge-approved">Đã duyệt: {confirmedCount}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) repeat(3, minmax(160px, 220px))', gap: 14, alignItems: 'end' }}>
          <label className="field">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSearch size={15} />
              <span>Tìm kiếm</span>
            </span>
            <input
              placeholder="Tên sinh viên, giảng viên, mã SV, chủ đề..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Khoảng lịch</span>
            <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value as 'current' | 'history' | 'all')}>
              <option value="current">Cuộc hẹn hiện tại</option>
              <option value="history">Lịch sử</option>
              <option value="all">Tất cả</option>
            </select>
          </label>

          <label className="field">
            <span>Trạng thái</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Pending">Chờ duyệt</option>
              <option value="Confirmed">Đã duyệt</option>
              <option value="Rejected">Từ chối</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </label>

          <label className="field">
            <span>Hình thức</span>
            <select value={meetingTypeFilter} onChange={(event) => setMeetingTypeFilter(event.target.value)}>
              <option value="ALL">Tất cả hình thức</option>
              {meetingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredAppointments.map((item) => (
          <div key={item.appointmentId} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {item.topic}
                </h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <IconUser size={15} />
                    {item.studentName}{item.studentCode ? ` (${item.studentCode})` : ''}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <IconTeacher size={15} />
                    {item.lecturerName}
                  </span>
                </div>
              </div>
              <StatusBadge value={item.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span><strong>Thời gian:</strong> {formatDateTime(item.startTime)} - {formatDateTime(item.endTime)}</span>
              <span><strong>Hình thức:</strong> {item.meetingType || 'Chưa cập nhật'}</span>
              <span><strong>Địa điểm/link:</strong> {item.locationOrLink || 'Chưa cập nhật'}</span>
              <span><strong>Khoa/Bộ môn:</strong> {item.department || 'Chưa cập nhật'}</span>
            </div>

            {(item.description || item.lecturerResponse || item.cancellationReason) && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'grid', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {item.description && <span><strong>Mô tả:</strong> {item.description}</span>}
                {item.lecturerResponse && <span><strong>Phản hồi giảng viên:</strong> {item.lecturerResponse}</span>}
                {item.cancellationReason && <span><strong>Lý do hủy:</strong> {item.cancellationReason}</span>}
              </div>
            )}
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Không tìm thấy cuộc hẹn nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}
