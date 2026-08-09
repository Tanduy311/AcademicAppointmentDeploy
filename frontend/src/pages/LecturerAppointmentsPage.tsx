import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { AppointmentResponseDto } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  IconFileText,
  IconBookmark,
  IconUser,
  IconCalendar,
  IconMapPin,
  IconChat,
  IconCheck,
  IconClose,
} from '../components/Icons';

export function LecturerAppointmentsPage() {
  const [items, setItems] = useState<AppointmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<AppointmentResponseDto | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [responseMsg, setResponseMsg] = useState('Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.lecturerAppointments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDecisionModal = (item: AppointmentResponseDto, status: 'Approved' | 'Rejected') => {
    setActiveItem(item);
    setActionType(status);
    setResponseMsg(status === 'Approved' ? 'Thầy đồng ý phê duyệt lịch hẹn, em đến đúng giờ nhé.' : 'Thầy bận lịch họp đột xuất, em đăng ký lại khung giờ khác giúp thầy nhé.');
  };

  const handleDecisionSubmit = async () => {
    if (!activeItem) return;
    setBusyId(activeItem.appointmentId);
    try {
      await api.updateAppointmentStatus(activeItem.appointmentId, {
        status: actionType,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFileText size={24} style={{ color: 'var(--accent)' }} />
          <span>Hàng Đợi Duyệt Lịch Hẹn</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Quản lý các yêu cầu tư vấn học thuật do sinh viên gửi đến cho bạn.
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

            {item.status === 'Pending' ? (
              <div style={{ paddingTop: 8, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => openDecisionModal(item, 'Rejected')}
                  disabled={busyId === item.appointmentId}
                >
                  <IconClose size={15} />
                  <span>Từ Chối</span>
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ fontSize: '0.82rem', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => openDecisionModal(item, 'Approved')}
                  disabled={busyId === item.appointmentId}
                >
                  <IconCheck size={15} />
                  <span>Phê Duyệt Lịch Hẹn</span>
                </button>
              </div>
            ) : null}
          </div>
        ))}

        {items.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Hiện tại không có lịch hẹn nào đang chờ xử lý.
          </div>
        )}
      </div>

      {/* Decision Response Modal Overlay */}
      {activeItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              {actionType === 'Approved' ? (
                <>
                  <IconCheck size={20} style={{ color: 'var(--success)' }} />
                  <span>Phê Duyệt Lịch Hẹn</span>
                </>
              ) : (
                <>
                  <IconClose size={20} style={{ color: 'var(--danger)' }} />
                  <span>Từ Chối Lịch Hẹn</span>
                </>
              )}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Yêu cầu tư vấn: <strong>"{activeItem.topic}"</strong> của SV {activeItem.studentName}.
            </p>

            <label className="field" style={{ marginBottom: 20 }}>
              <span>Lời nhắn phản hồi gửi tới Sinh viên:</span>
              <textarea
                rows={3}
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                placeholder="Nhập ghi chú phản hồi..."
              />
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveItem(null)}>
                Hủy Bỏ
              </button>
              <button
                type="button"
                className={actionType === 'Approved' ? 'btn btn-success' : 'btn btn-danger'}
                onClick={handleDecisionSubmit}
                disabled={busyId === activeItem.appointmentId}
              >
                {busyId === activeItem.appointmentId ? 'Đang lưu...' : actionType === 'Approved' ? 'Xác Nhận Duyệt' : 'Xác Nhận Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
