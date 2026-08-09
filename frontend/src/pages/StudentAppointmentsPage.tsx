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
  IconArrowRight,
} from '../components/Icons';

export function StudentAppointmentsPage() {
  const [items, setItems] = useState<AppointmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<AppointmentResponseDto | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<number | null>(null);
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

  const canCancel = (status: string) => ['Pending', 'Confirmed'].includes(status);

  const openDetail = async (item: AppointmentResponseDto) => {
    setDetailLoadingId(item.appointmentId);
    try {
      const detail = await api.appointmentsById(item.appointmentId);
      setSelectedItem(detail);
      setReason('Em bận đột xuất lịch học trên lớp.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tải chi tiết lịch hẹn.');
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleCancelSubmit = async () => {
    if (!selectedItem) return;
    setCancelBusyId(selectedItem.appointmentId);
    try {
      await api.cancelAppointment(selectedItem.appointmentId, { cancellationReason: reason });
      setSelectedItem(null);
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

            <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => void openDetail(item)}
                disabled={detailLoadingId === item.appointmentId}
              >
                <IconArrowRight size={15} />
                <span>{detailLoadingId === item.appointmentId ? 'Đang mở...' : 'Xem Chi Tiết'}</span>
              </button>
              {canCancel(item.status) ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setSelectedItem(item)}
                  disabled={cancelBusyId === item.appointmentId}
                >
                  <IconClose size={15} />
                  <span>Hủy Lịch Hẹn</span>
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Bạn chưa đăng ký lịch hẹn tư vấn nào.
          </div>
        )}
      </div>

      {/* Detail / Cancel Modal Overlay */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconFileText size={20} style={{ color: 'var(--accent)' }} />
              <span>Chi Tiết Lịch Hẹn</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem.topic}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Giảng viên: <strong>{selectedItem.lecturerName}</strong> ({selectedItem.department || 'Khoa CNTT'})
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gap: 10 }}>
                <div><strong>Thời gian:</strong> {formatDateTime(selectedItem.startTime)} - {formatDateTime(selectedItem.endTime)}</div>
                <div><strong>Hình thức:</strong> {selectedItem.meetingType} {selectedItem.locationOrLink ? `(${selectedItem.locationOrLink})` : ''}</div>
                <div><strong>Trạng thái:</strong> <StatusBadge value={selectedItem.status} /></div>
                {selectedItem.description ? <div><strong>Ghi chú:</strong> {selectedItem.description}</div> : null}
                {selectedItem.lecturerResponse ? <div><strong>Phản hồi giảng viên:</strong> {selectedItem.lecturerResponse}</div> : null}
                {selectedItem.cancellationReason ? <div><strong>Lý do hủy:</strong> {selectedItem.cancellationReason}</div> : null}
              </div>

              {canCancel(selectedItem.status) ? (
                <>
                  <div style={{ height: 1, background: 'var(--border-subtle)' }} />
                  <label className="field">
                    <span>Lý do hủy lịch:</span>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập lý do hủy lịch..."
                    />
                  </label>
                </>
              ) : null}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
                  Đóng
                </button>
                {canCancel(selectedItem.status) ? (
                  <button type="button" className="btn btn-danger" onClick={handleCancelSubmit} disabled={cancelBusyId === selectedItem.appointmentId}>
                    {cancelBusyId === selectedItem.appointmentId ? 'Đang Hủy...' : 'Xác Nhận Hủy'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
