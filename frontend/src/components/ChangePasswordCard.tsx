import { FormEvent, useState } from 'react';
import { api } from '../services/api';
import { IconLock, IconCheck, IconAlert } from './Icons';

export function ChangePasswordCard() {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword.length < 6) {
      setMsg({ type: 'danger', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setMsg({ type: 'danger', text: 'Mật khẩu mới phải bao gồm cả chữ cái và chữ số.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ type: 'danger', text: 'Xác nhận mật khẩu mới không khớp.' });
      return;
    }

    setSaving(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setMsg({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowForm(false), 2000);
    } catch (err) {
      setMsg({ type: 'danger', text: err instanceof Error ? err.message : 'Không thể đổi mật khẩu.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconLock size={18} style={{ color: 'var(--accent)' }} />
            <span>Bảo mật tài khoản & Đổi mật khẩu</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 2 }}>
            Quản lý mật khẩu đăng nhập để bảo vệ an toàn cho tài khoản của bạn.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
            onClick={() => { setShowForm(true); setMsg(null); }}
          >
            Đổi mật khẩu
          </button>
        )}
      </div>

      {msg && (
        <div
          className={`badge badge-${msg.type}`}
          style={{ padding: 12, width: '100%', textTransform: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {msg.type === 'success' ? <IconCheck size={16} /> : <IconAlert size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <div className="grid-3" style={{ gap: 14 }}>
            <label className="field">
              <span>Mật khẩu hiện tại *</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ..."
                required
              />
            </label>

            <label className="field">
              <span>Mật khẩu mới *</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự (chữ và số)..."
                required
              />
            </label>

            <label className="field">
              <span>Xác nhận mật khẩu mới *</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                required
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setShowForm(false); setMsg(null); }}
              disabled={saving}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
