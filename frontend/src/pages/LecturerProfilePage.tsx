import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { LecturerDetailDto, UpdateLecturerProfileDto, ChangePasswordDto } from '../types/api';
import { IconUser, IconBuilding, IconFileText, IconEdit, IconLock } from '../components/Icons';

export function LecturerProfilePage() {
  const [profile, setProfile] = useState<LecturerDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateLecturerProfileDto>({
    fullName: '',
    phoneNumber: '',
    department: '',
    specialization: '',
    officeLocation: '',
    consultationDescription: '',
  });
  const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Change Password modal state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passForm, setPassForm] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittingPass, setSubmittingPass] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    setLoading(true);
    api
      .myLecturerProfile()
      .then((data) => {
        setProfile(data);
        setEditForm({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          department: data.department || '',
          specialization: data.specialization || '',
          officeLocation: data.officeLocation || '',
          consultationDescription: data.consultationDescription || '',
        });
      })
      .finally(() => setLoading(false));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEdit(true);
    setEditMessage(null);
    try {
      const updated = await api.updateLecturerProfile(editForm);
      setProfile(updated);
      setEditMessage({ type: 'success', text: 'Cập nhật thông tin giảng viên thành công!' });
      setTimeout(() => {
        setIsEditing(false);
        setEditMessage(null);
      }, 1200);
    } catch (err: any) {
      setEditMessage({ type: 'error', text: err.message || 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMessage({ type: 'error', text: 'Xác nhận mật khẩu mới không khớp.' });
      return;
    }
    setSubmittingPass(true);
    setPassMessage(null);
    try {
      await api.changePassword(passForm);
      setPassMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPass(false);
        setPassMessage(null);
      }, 1200);
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại.' });
    } finally {
      setSubmittingPass(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel" style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
            {profile.fullName.charAt(0)}
          </div>

          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.fullName}</h1>
              <span className="badge badge-success">Giảng viên</span>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>Mã GV: <strong style={{ color: 'var(--text-primary)' }}>{profile.lecturerCode}</strong></span>
              {profile.emailAddress && <span>• Email: <strong>{profile.emailAddress}</strong></span>}
              {profile.phoneNumber && <span>• SĐT: <strong>{profile.phoneNumber}</strong></span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconEdit size={16} />
            <span>Chỉnh sửa hồ sơ</span>
          </button>

          <button className="btn btn-secondary" onClick={() => setIsChangingPass(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconLock size={16} />
            <span>Đổi mật khẩu</span>
          </button>
        </div>
      </div>

      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFileText size={20} style={{ color: 'var(--accent)' }} />
          <span>Thông Tin Công Tác & Tư Vấn</span>
        </h2>

        <div className="grid-2">
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBuilding size={15} />
              <span>Khoa / Viện (Department)</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {profile.department || 'Chưa cập nhật'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconUser size={15} />
              <span>Chuyên Môn Nghiên Cứu</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {profile.specialization || 'Chưa cập nhật'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Vị trí Phòng làm việc (Office Location)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {profile.officeLocation || 'Chưa cập nhật'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Số điện thoại liên hệ
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {profile.phoneNumber || 'Chưa cập nhật'}
            </div>
          </div>
        </div>

        {profile.consultationDescription && (
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: 8 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Mô tả tư vấn / Lĩnh vực giải đáp cho Sinh viên
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {profile.consultationDescription}
            </div>
          </div>
        )}
      </div>

      {/* Modal Chỉnh Sửa Hồ Sơ */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550, width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Chỉnh Sửa Hồ Sơ Giảng Viên</h3>

            {editMessage && (
              <div className={`alert alert-${editMessage.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 16 }}>
                {editMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Họ và Tên</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.phoneNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Khoa / Bộ môn (Department)</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.department || ''}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Chuyên môn (Specialization)</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.specialization || ''}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Vị trí phòng làm việc (Office Location)</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.officeLocation || ''}
                  onChange={(e) => setEditForm({ ...editForm, officeLocation: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Mô tả hướng dẫn / Lĩnh vực tư vấn</label>
                <textarea
                  className="input"
                  rows={3}
                  value={editForm.consultationDescription || ''}
                  onChange={(e) => setEditForm({ ...editForm, consultationDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submittingEdit}>
                  {submittingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi Mật Khẩu */}
      {isChangingPass && (
        <div className="modal-overlay" onClick={() => setIsChangingPass(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450, width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Đổi Mật Khẩu</h3>

            {passMessage && (
              <div className={`alert alert-${passMessage.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 16 }}>
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsChangingPass(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submittingPass}>
                  {submittingPass ? 'Đang thực hiện...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
