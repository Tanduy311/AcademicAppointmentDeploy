import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type StudentForm = {
  accountName: string;
  password: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  studentCode: string;
  major: string;
  className: string;
  academicYear: string;
};

export function RegisterStudentPage() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<StudentForm>({
    accountName: '',
    password: '',
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    studentCode: '',
    major: 'Công nghệ thông tin',
    className: 'CNTT-K65',
    academicYear: '2023 - 2027',
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setError('');

    const missingFields: string[] = [];
    if (!form.accountName.trim()) missingFields.push('Tên tài khoản');
    if (!form.password.trim()) missingFields.push('Mật khẩu');
    if (!form.fullName.trim()) missingFields.push('Họ và tên');
    if (!form.studentCode.trim()) missingFields.push('Mã số sinh viên');

    if (missingFields.length > 0) {
      setError(`Vui lòng nhập đầy đủ các trường bắt buộc (*): ${missingFields.join(', ')}.`);
      return;
    }

    setBusy(true);
    try {
      await registerStudent(form);
      setSuccessMessage('Đăng ký tài khoản thành công! Tài khoản của bạn đang ở trạng thái chờ Ban quản trị (Admin/Giáo vụ) xét duyệt và kích hoạt. Vui lòng quay lại sau.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký tài khoản không thành công.');
    } finally {
      setBusy(false);
    }
  };

  if (successMessage) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Đăng ký thành công!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 24 }}>
            {successMessage}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center' }}>
            <span>Đến trang đăng nhập</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 style={{ fontSize: '1.4rem' }}>Đăng ký tài khoản sinh viên</h1>
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
              Thông tin cá nhân và liên hệ
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Họ và tên *</span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ví dụ: Nguyễn Văn A"
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
                  placeholder="student@gmail.com"
                />
              </label>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Số điện thoại liên hệ</span>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Nhập SĐT..."
                />
              </label>
            </div>
          </div>

          {/* Section 3: Academic Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              Thông tin sinh viên và học tập
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Mã số sinh viên *</span>
                <input
                  value={form.studentCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, studentCode: e.target.value }))}
                  placeholder="Ví dụ: SV002"
                  style={{ borderColor: submitted && !form.studentCode.trim() ? 'var(--danger)' : undefined }}
                />
                {submitted && !form.studentCode.trim() && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>Vui lòng nhập mã số sinh viên</span>
                )}
              </label>

              <label className="field">
                <span>Chuyên ngành</span>
                <input
                  value={form.major}
                  onChange={(e) => setForm((prev) => ({ ...prev, major: e.target.value }))}
                  placeholder="Ví dụ: Công nghệ thông tin"
                />
              </label>

              <label className="field">
                <span>Lớp học phần</span>
                <input
                  value={form.className}
                  onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
                  placeholder="Ví dụ: CNTT-K65"
                />
              </label>

              <label className="field">
                <span>Khóa học</span>
                <input
                  value={form.academicYear}
                  onChange={(e) => setForm((prev) => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="Ví dụ: 2023 - 2027"
                />
              </label>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
            <span>{busy ? 'Đang khởi tạo tài khoản...' : 'Tạo tài khoản sinh viên'}</span>
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
