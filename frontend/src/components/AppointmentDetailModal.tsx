import React from 'react';
import type { AppointmentResponseDto } from '../types/api';
import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '../utils/format';

interface AppointmentDetailModalProps {
  appointment: AppointmentResponseDto | null;
  onClose: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Chi Tiết Lịch Hẹn #{appointment.appointmentId}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color, #f8fafc)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <span style={{ fontWeight: 500 }}>Trạng thái:</span>
            <StatusBadge value={appointment.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Sinh viên</label>
              <div style={{ fontWeight: 600 }}>{appointment.studentName}</div>
              {appointment.studentCode && <div style={{ fontSize: '0.85rem', color: '#475569' }}>Mã SV: {appointment.studentCode}</div>}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Giảng viên</label>
              <div style={{ fontWeight: 600 }}>{appointment.lecturerName}</div>
              {appointment.department && <div style={{ fontSize: '0.85rem', color: '#475569' }}>Khoa: {appointment.department}</div>}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />

          <div>
            <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Thời gian tư vấn</label>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>
              {formatDateTime(appointment.startTime)} - {formatDateTime(appointment.endTime)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Hình thức</label>
              <div>{appointment.meetingType === 'Online' ? '🌐 Trực tuyến (Online)' : '🏫 Trực tiếp (Offline)'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Địa điểm / Link cuộc họp</label>
              <div>
                {appointment.locationOrLink ? (
                  appointment.locationOrLink.startsWith('http') ? (
                    <a href={appointment.locationOrLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      Mở link cuộc họp
                    </a>
                  ) : (
                    appointment.locationOrLink
                  )
                ) : (
                  <span style={{ color: '#94a3b8' }}>Chưa cập nhật</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Chủ đề tư vấn</label>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{appointment.topic}</div>
          </div>

          {appointment.description && (
            <div>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Nội dung chi tiết / Câu hỏi</label>
              <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {appointment.description}
              </div>
            </div>
          )}

          {appointment.lecturerResponse && (
            <div>
              <label style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>Phản hồi từ Giảng viên</label>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', color: '#065f46', marginTop: '0.25rem' }}>
                {appointment.lecturerResponse}
              </div>
            </div>
          )}

          {appointment.cancellationReason && (
            <div>
              <label style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>Lý do hủy lịch</label>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', color: '#991b1b', marginTop: '0.25rem' }}>
                {appointment.cancellationReason}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Tạo ngày: {formatDateTime(appointment.createdAt)}</span>
            {appointment.updatedAt && <span>Cập nhật gần nhất: {formatDateTime(appointment.updatedAt)}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};
