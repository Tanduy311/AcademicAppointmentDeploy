import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { LecturerDetailDto } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { cleanStringValue, formatDisplayValue } from '../utils/format';

export function LecturerProfilePage() {
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState<LecturerDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    department: '',
    specialization: '',
    officeLocation: '',
    consultationDescription: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.myLecturerProfile();
      setProfile(data);
      setForm({
        fullName: cleanStringValue(data.fullName),
        emailAddress: cleanStringValue(data.emailAddress),
        phoneNumber: cleanStringValue(data.phoneNumber),
        department: cleanStringValue(data.department),
        specialization: cleanStringValue(data.specialization),
        officeLocation: cleanStringValue(data.officeLocation),
        consultationDescription: cleanStringValue(data.consultationDescription),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMsg(null);
    try {
      await api.updateMyAvatar(file);
      await refreshMe();
      setMsg({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
    } catch (err) {
      setMsg({ type: 'danger', text: err instanceof Error ? err.message : 'Không thể cập nhật ảnh đại diện.' });
    } finally {
      setUploadingAvatar(false);
      e.currentTarget.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMsg(null);

    const missing: string[] = [];
    if (!form.fullName.trim()) missing.push('Họ và tên');
    if (!form.emailAddress.trim()) missing.push('Email liên hệ');

    if (missing.length > 0) {
      setMsg({ type: 'danger', text: `Vui lòng nhập đầy đủ các trường bắt buộc (*): ${missing.join(', ')}.` });
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateLecturerProfile(form);
      setProfile(updated);
      await refreshMe();
      setEditing(false);
      setSubmitted(false);
      setMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ giảng viên thành công!' });
    } catch (err) {
      setMsg({ type: 'danger', text: err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin hồ sơ giảng viên...</div>
      </div>
    );
  }

  if (!profile) {
    return <div className="panel">Không tìm thấy thông tin giảng viên.</div>;
  }

  const avatarUrl = user?.avatarUrl;
  const cleanDept = cleanStringValue(profile.department);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info Panel */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: '1.75rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: avatarUrl ? '#fff' : undefined }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              profile.fullName.charAt(0)
            )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.fullName}</h1>
              <span className="badge badge-success">Giảng viên chính thức</span>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>Mã GV: <strong style={{ color: 'var(--text-primary)' }}>{profile.lecturerCode}</strong></span>
              {cleanDept ? <span>• Khoa: <strong>{cleanDept}</strong></span> : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(!editing);
            setSubmitted(false);
            setMsg(null);
          }}
        >
          <span>{editing ? 'Đóng form' : 'Chỉnh sửa hồ sơ'}</span>
        </button>
      </div>

      {msg && (
        <div className={`badge badge-${msg.type}`} style={{ padding: 14, borderRadius: 'var(--radius-md)', width: '100%', textTransform: 'none' }}>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Edit Form Panel */}
      {editing ? (
        <form className="panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            <span>Cập nhật thông tin giảng viên</span>
          </h2>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar-circle" style={{ width: 72, height: 72, fontSize: '1.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: avatarUrl ? '#fff' : undefined }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  profile.fullName.charAt(0)
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Ảnh đại diện</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Hỗ trợ JPG, PNG hoặc WEBP, tối đa 2MB.
                </div>
              </div>
            </div>

            <label className="btn btn-secondary" style={{ cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}>
              <span>{uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                hidden
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Họ và tên *</span>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Ví dụ: TS. Nguyễn Văn A"
                style={{ borderColor: submitted && !form.fullName.trim() ? 'var(--danger)' : undefined }}
              />
              {submitted && !form.fullName.trim() && (
                <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập họ và tên</span>
              )}
            </label>

            <label className="field">
              <span>Email liên hệ *</span>
              <input
                type="email"
                value={form.emailAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, emailAddress: e.target.value }))}
                placeholder="lecturer@university.edu.vn"
                style={{ borderColor: submitted && !form.emailAddress.trim() ? 'var(--danger)' : undefined }}
              />
              {submitted && !form.emailAddress.trim() && (
                <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập email</span>
              )}
            </label>

            <label className="field">
              <span>Số điện thoại</span>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Ví dụ: 0912345678"
              />
            </label>

            <label className="field">
              <span>Khoa hoặc viện công tác</span>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="Ví dụ: Khoa Công nghệ thông tin"
              />
            </label>

            <label className="field">
              <span>Chuyên môn chính</span>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                placeholder="Ví dụ: Trí tuệ nhân tạo và AI"
              />
            </label>

            <label className="field">
              <span>Văn phòng làm việc</span>
              <input
                type="text"
                value={form.officeLocation}
                onChange={(e) => setForm((prev) => ({ ...prev, officeLocation: e.target.value }))}
                placeholder="Ví dụ: Phòng 302-A1"
              />
            </label>

            <label className="field" style={{ gridColumn: 'span 2' }}>
              <span>Mô tả tư vấn và định hướng tiếp nhận sinh viên</span>
              <textarea
                rows={3}
                value={form.consultationDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, consultationDescription: e.target.value }))}
                placeholder="Mô tả các lĩnh vực tư vấn..."
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setSubmitted(false); }}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Read-Only Details Panel */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <span>Thông tin công tác chi tiết</span>
        </h2>

        <div className="grid-2">
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Khoa công tác</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.department)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Chuyên môn chính</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.specialization)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Văn phòng làm việc</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.officeLocation)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Số điện thoại</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.phoneNumber)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Mô tả tư vấn và định hướng</span>
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {formatDisplayValue(profile.consultationDescription, 'Chưa cập nhật mô tả')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
