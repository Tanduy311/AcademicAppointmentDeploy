import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { AppointmentResponseDto } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  IconBookmark,
  IconTeacher,
  IconCalendar,
  IconMapPin,
  IconChat,
  IconClose,
  IconAlert,
  IconFileText,
} from '../components/Icons';

export function StudentAppointmentsPage() {
  const [items, setItems] = useState<AppointmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cancellingItem, setCancellingItem] = useState<AppointmentResponseDto | null>(null);
  const [reason, setReason] = useState('Em bận đột xuất lịch học trên lớp.');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.myAppointments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancelSubmit = async () => {
    if (!cancellingItem) return;
    setBusyId(cancellingItem.appointmentId);
    try {
      await api.cancelAppointment(cancellingItem.appointmentId, { cancellationReason: reason });
      setCancellingItem(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể hủy lịch hẹn.');
    } finally {
      setBusyId(null);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFileText size={24} style={{ color: 'var(--accent)' }} />
          <span>Lịch Hẹn Của Tôi</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Theo dõi danh sách các buổi tư vấn bạn đã đăng ký với giảng viên.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item) => (
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
                <span><strong>Thời gian:</strong> {formatDateTime(item.startTime)} - {formatDateTime(item.endTime)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconMapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Hình thức:</strong> <span className="badge badge-neutral">{item.meetingType}</span> ({item.locationOrLink || 'Chưa cập nhật'})</span>
              </div>
            </div>

            {item.description ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <IconChat size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span><strong>Ghi chú sinh viên:</strong> {item.description}</span>
              </div>
            ) : null}

            {item.lecturerResponse ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <IconChat size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span><strong>Phản hồi từ Giảng viên:</strong> {item.lecturerResponse}</span>
              </div>
            ) : null}

            {item.status === 'Pending' ? (
              <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setCancellingItem(item)}
                  disabled={busyId === item.appointmentId}
                >
                  <IconClose size={15} />
                  <span>Hủy Lịch Hẹn Này</span>
                </button>
              </div>
            ) : null}
          </div>
        ))}

        {items.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Bạn chưa đăng ký lịch hẹn tư vấn nào.
          </div>
        )}
      </div>

      {/* Cancel Appointment Modal Overlay */}
      {cancellingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconAlert size={20} style={{ color: 'var(--danger)' }} />
              <span>Hủy Lịch Hẹn Tư Vấn</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Bạn đang yêu cầu hủy lịch hẹn <strong>"{cancellingItem.topic}"</strong> với {cancellingItem.lecturerName}.
            </p>

            <label className="field" style={{ marginBottom: 20 }}>
              <span>Lý do hủy lịch:</span>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do hủy lịch..."
              />
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCancellingItem(null)}>
                Quay Lại
              </button>
              <button type="button" className="btn btn-danger" onClick={handleCancelSubmit} disabled={busyId === cancellingItem.appointmentId}>
                {busyId === cancellingItem.appointmentId ? 'Đang Hủy...' : 'Xác Nhận Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
