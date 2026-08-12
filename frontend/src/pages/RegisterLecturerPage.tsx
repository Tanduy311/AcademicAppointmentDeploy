import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type LecturerForm = {
  accountName: string;
  password: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  lecturerCode: string;
  department: string;
  specialization: string;
  officeLocation: string;
  consultationDescription: string;
};

export function RegisterLecturerPage() {
  const { registerLecturer } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<LecturerForm>({
    accountName: '',
    password: '',
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    lecturerCode: '',
    department: 'Khoa Công nghệ thông tin',
    specialization: 'Khoa học dữ liệu và AI',
    officeLocation: 'Phòng 302-A1',
    consultationDescription: 'Tư vấn đồ án tốt nghiệp và định hướng nghiên cứu sinh.',
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setError('');

    const missingFields: string[] = [];
    if (!form.accountName.trim()) missingFields.push('Tên tài khoản');
    if (!form.password.trim()) missingFields.push('Mật khẩu');
    if (!form.fullName.trim()) missingFields.push('Họ và tên');
    if (!form.lecturerCode.trim()) missingFields.push('Mã giảng viên');

    if (missingFields.length > 0) {
      setError(`Vui lòng nhập đầy đủ các trường bắt buộc (*): ${missingFields.join(', ')}.`);
      return;
    }

    setBusy(true);
    try {
      await registerLecturer(form);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký tài khoản không thành công.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 style={{ fontSize: '1.4rem' }}>Đăng ký tài khoản giảng viên</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Cổng thông tin tư vấn và đặt lịch học thuật Academic Appointment
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error ? (
            <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', textTransform: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{error}</span>
            </div>
          ) : null}

          {/* Section 1: Account Login Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              Thông tin đăng nhập
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Tên tài khoản *</span>
                <input
                  value={form.accountName}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Nhập tên tài khoản..."
                  style={{ borderColor: submitted && !form.accountName.trim() ? 'var(--danger)' : undefined }}
                />
                {submitted && !form.accountName.trim() && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập tên tài khoản</span>
                )}
              </label>

              <label className="field">
                <span>Mật khẩu *</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Nhập mật khẩu..."
                  style={{ borderColor: submitted && !form.password.trim() ? 'var(--danger)' : undefined }}
                />
                {submitted && !form.password.trim() && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập mật khẩu</span>
                )}
              </label>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              Thông tin giảng viên và liên hệ
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Họ và tên *</span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ví dụ: PGS.TS. Nguyễn Văn B"
                  style={{ borderColor: submitted && !form.fullName.trim() ? 'var(--danger)' : undefined }}
                />
                {submitted && !form.fullName.trim() && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập họ và tên</span>
                )}
              </label>

              <label className="field">
                <span>Địa chỉ email</span>
                <input
                  type="email"
                  value={form.emailAddress}
                  onChange={(e) => setForm((prev) => ({ ...prev, emailAddress: e.target.value }))}
                  placeholder="lecturer@vnu.edu.vn"
                />
              </label>

              <label className="field">
                <span>Mã giảng viên *</span>
                <input
                  value={form.lecturerCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, lecturerCode: e.target.value }))}
                  placeholder="Ví dụ: GV004"
                  style={{ borderColor: submitted && !form.lecturerCode.trim() ? 'var(--danger)' : undefined }}
                />
                {submitted && !form.lecturerCode.trim() && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập mã giảng viên</span>
                )}
              </label>

              <label className="field">
                <span>Số điện thoại liên hệ</span>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Nhập SĐT..."
                />
              </label>
            </div>
          </div>

          {/* Section 3: Academic Work & Consultation Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              Khoa công tác và chuyên môn
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Khoa hoặc viện công tác</span>
                <input
                  value={form.department}
                  onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Ví dụ: Khoa Công nghệ thông tin"
                />
              </label>

              <label className="field">
                <span>Chuyên môn chính</span>
                <input
                  value={form.specialization}
                  onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Ví dụ: Trí tuệ nhân tạo và AI"
                />
              </label>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Văn phòng làm việc</span>
                <input
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
          </div>

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
            <span>{busy ? 'Đang khởi tạo tài khoản...' : 'Tạo tài khoản giảng viên'}</span>
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.88rem' }}>
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
