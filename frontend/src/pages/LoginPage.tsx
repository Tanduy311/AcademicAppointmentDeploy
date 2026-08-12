import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [accountName, setAccountName] = useState('student_01');
  const [password, setPassword] = useState('Password123@');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (!accountName.trim() || !password.trim()) {
      setError('Vui lòng nhập tên tài khoản và mật khẩu.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await login({ accountName, password });
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công.');
    } finally {
      setBusy(false);
    }
  };

  const fillQuickAccount = (acc: string, pass: string) => {
    setAccountName(acc);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 style={{ fontSize: '1.4rem' }}>Academic Appointment</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Cổng thông tin tư vấn và đặt lịch học thuật
          </p>
        </div>

        {/* Quick Demo Accounts Selection */}
        <div style={{ marginBottom: 24, padding: 12, background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
            Tài khoản thử nghiệm nhanh:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              onClick={() => fillQuickAccount('student_01', 'Password123@')}
            >
              <span>Sinh viên</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              onClick={() => fillQuickAccount('lecturer_a', 'Password123@')}
            >
              <span>Giảng viên</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              onClick={() => fillQuickAccount('admin', 'Admin@123')}
            >
              <span>Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label className="field">
            <span>Tên tài khoản *</span>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Nhập tên tài khoản..."
              style={{ borderColor: submitted && !accountName.trim() ? 'var(--danger)' : undefined }}
            />
            {submitted && !accountName.trim() && (
              <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập tên tài khoản</span>
            )}
          </label>

          <label className="field">
            <span>Mật khẩu *</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              style={{ borderColor: submitted && !password.trim() ? 'var(--danger)' : undefined }}
            />
            {submitted && !password.trim() && (
              <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập mật khẩu</span>
            )}
          </label>

          {error ? (
            <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', textTransform: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{error}</span>
            </div>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
            <span>{busy ? 'Đang xác thực...' : 'Đăng nhập ngay'}</span>
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <Link to="/register/student" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Đăng ký sinh viên
          </Link>
          <Link to="/register/lecturer" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Đăng ký giảng viên
          </Link>
        </div>
      </div>
    </div>
  );
}
