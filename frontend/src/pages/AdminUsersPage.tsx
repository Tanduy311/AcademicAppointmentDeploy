import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AdminUserListItemDto } from '../types/api';
import {
  IconShield,
  IconUser,
  IconCheck,
  IconClose,
  IconSearch,
} from '../components/Icons';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const u = await api.users();
      setUsers(u);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (userId: number, current: boolean) => {
    setBusyId(userId);
    try {
      await api.updateUserStatus(userId, { isActive: !current });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể thay đổi trạng thái.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.emailAddress && u.emailAddress.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'ALL' || u.roleName === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách người dùng...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Admin Header Banner */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShield size={24} style={{ color: 'var(--accent)' }} />
              <span>Quản lý người dùng hệ thống</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Xem danh sách tài khoản và quản lý trạng thái hoạt động.
            </p>
          </div>

          <span className="badge badge-neutral" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            Tổng số: {users.length} tài khoản
          </span>
        </div>

        {/* Filters bar */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 1, minWidth: 260 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSearch size={15} />
              <span>Tìm kiếm tài khoản</span>
            </span>
            <input
              placeholder="Nhập họ tên, tên đăng nhập hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field" style={{ width: 220 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconUser size={15} />
              <span>Lọc theo vai trò</span>
            </span>
            <select value={selectedRoleFilter} onChange={(e) => setSelectedRoleFilter(e.target.value)}>
              <option value="ALL">Tất cả vai trò</option>
              <option value="Student">Sinh viên</option>
              <option value="Lecturer">Giảng viên</option>
              <option value="Admin">Quản trị viên (Admin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredUsers.map((user) => (
          <div
            key={user.userId}
            className="panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              opacity: user.isActive ? 1 : 0.75,
            }}
          >
            {/* Top User Info Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar-circle" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.fullName}
                    </h3>
                    <span className="pill-role" style={{ fontSize: '0.75rem', padding: '2px 10px' }}>
                      {user.roleName}
                    </span>
                    {!user.isActive && (
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        Đã bị khóa
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>Tên đăng nhập: <strong style={{ color: 'var(--text-primary)' }}>{user.accountName}</strong></span>
                    {user.emailAddress && <span>• Email: {user.emailAddress}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: 12,
                background: '#f8fafc',
                margin: '-8px -24px -24px -24px',
                padding: '14px 24px',
                borderBottomLeftRadius: 'var(--radius-lg)',
                borderBottomRightRadius: 'var(--radius-lg)',
              }}
            >
              <button
                className="btn btn-secondary"
                type="button"
                style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => toggleActive(user.userId, user.isActive)}
                disabled={busyId === user.userId}
              >
                {user.isActive ? (
                  <>
                    <IconClose size={15} />
                    <span>Khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <IconCheck size={15} />
                    <span>Mở khóa tài khoản</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Không tìm thấy người dùng nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
