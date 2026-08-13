import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { StudentDetailDto } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { cleanStringValue, formatDisplayValue } from '../utils/format';

export function StudentProfilePage() {
  const { refreshMe } = useAuth();
  const [profile, setProfile] = useState<StudentDetailDto | null>(null);
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
    major: '',
    className: '',
    academicYear: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.myStudentProfile();
      setProfile(data);
      setForm({
        fullName: cleanStringValue(data.fullName),
        emailAddress: cleanStringValue(data.emailAddress),
        phoneNumber: cleanStringValue(data.phoneNumber),
        major: cleanStringValue(data.major),
        className: cleanStringValue(data.className),
        academicYear: cleanStringValue(data.academicYear),
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
      const updatedUser = await api.updateMyAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatarUrl: updatedUser.avatarUrl } : prev);
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
      const updated = await api.updateStudentProfile(form);
      setProfile(updated);
      setEditing(false);
      setSubmitted(false);
      setMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ sinh viên thành công!' });
    } catch (err) {
      setMsg({ type: 'danger', text: err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin hồ sơ...</div>
      </div>
    );
  }

  if (!profile) {
    return <div className="panel">Không tìm thấy thông tin sinh viên.</div>;
  }

  const cleanMajor = cleanStringValue(profile.major);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info Panel */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: '1.75rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: profile.avatarUrl ? '#fff' : undefined }}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
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
              <span className="badge badge-success">Sinh viên chính quy</span>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>Mã SV: <strong style={{ color: 'var(--text-primary)' }}>{profile.studentCode}</strong></span>
              {cleanMajor ? <span>• Ngành: <strong>{cleanMajor}</strong></span> : null}
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
            <span>Cập nhật thông tin cá nhân</span>
          </h2>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar-circle" style={{ width: 72, height: 72, fontSize: '1.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: profile.avatarUrl ? '#fff' : undefined }}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
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
                placeholder="Nhập SĐT..."
              />
            </label>

            <label className="field">
              <span>Chuyên ngành (Major)</span>
              <input
                type="text"
                value={form.major}
                onChange={(e) => setForm((prev) => ({ ...prev, major: e.target.value }))}
                placeholder="Ví dụ: Công nghệ thông tin"
              />
            </label>

            <label className="field">
              <span>Lớp học phần (Class)</span>
              <input
                type="text"
                value={form.className}
                onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
                placeholder="Ví dụ: K65-CNTT1"
              />
            </label>

            <label className="field">
              <span>Khóa học (Academic Year)</span>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm((prev) => ({ ...prev, academicYear: e.target.value }))}
                placeholder="Ví dụ: 2023 - 2027"
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
          <span>Thông tin học tập chi tiết</span>
        </h2>

        <div className="grid-2">
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Chuyên ngành (Major)</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.major)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Lớp học phần (Class)</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.className)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Email sinh viên</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.emailAddress)}
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

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Khóa học (Academic Year)</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDisplayValue(profile.academicYear)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
