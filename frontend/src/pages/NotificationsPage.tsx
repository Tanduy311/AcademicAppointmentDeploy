import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { NotificationResponseDto } from '../types/api';
import { IconBell, IconCheck, IconClock } from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isReadParam = filterType === 'unread' ? false : filterType === 'read' ? true : undefined;
      const [pagedResult, unread] = await Promise.all([
        api.notifications({
          pageNumber: currentPage,
          pageSize: pageSize,
          isRead: isReadParam,
        }),
        api.unreadCount(),
      ]);

      setItems(pagedResult.items || []);
      setTotalItems(pagedResult.totalItems || 0);
      setTotalPages(pagedResult.totalPages || 1);
      setUnreadCount(unread.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterType]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (type: 'all' | 'unread' | 'read') => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const markRead = async (id: number) => {
    setBusyId(id);
    try {
      await api.markNotificationRead(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể đánh dấu đã đọc.');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể đánh dấu tất cả đã đọc.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Panel */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBell size={24} style={{ color: 'var(--accent)' }} />
            <span>Trung Tâm Thông Báo</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Cập nhật các thông báo real-time về trạng thái lịch hẹn tư vấn.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-neutral">Tổng: {totalItems}</span>
          <span className={`badge ${unreadCount > 0 ? 'badge-danger' : 'badge-success'}`}>
            {unreadCount > 0 ? `Chưa đọc: ${unreadCount}` : 'Đã đọc tất cả'}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              onClick={markAllRead}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
        <button
          type="button"
          className="btn"
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            background: filterType === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
            color: filterType === 'all' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: filterType === 'all' ? 600 : 400,
            border: '1px solid var(--border-subtle)',
          }}
          onClick={() => handleFilterChange('all')}
        >
          Tất cả
        </button>
        <button
          type="button"
          className="btn"
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            background: filterType === 'unread' ? 'var(--primary)' : 'var(--bg-surface)',
            color: filterType === 'unread' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: filterType === 'unread' ? 600 : 400,
            border: '1px solid var(--border-subtle)',
          }}
          onClick={() => handleFilterChange('unread')}
        >
          Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          type="button"
          className="btn"
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            background: filterType === 'read' ? 'var(--primary)' : 'var(--bg-surface)',
            color: filterType === 'read' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: filterType === 'read' ? 600 : 400,
            border: '1px solid var(--border-subtle)',
          }}
          onClick={() => handleFilterChange('read')}
        >
          Đã đọc
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách thông báo...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item) => (
            <div
              key={item.notificationId}
              className="panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: item.isRead ? 'var(--panel-solid)' : '#eff6ff',
                borderColor: item.isRead ? 'var(--border-subtle)' : '#bfdbfe',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!item.isRead && <span className="unread-indicator-dot" style={{ position: 'static' }} />}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h4>
                </div>

                {!item.isRead ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={() => markRead(item.notificationId)}
                    disabled={busyId === item.notificationId}
                  >
                    <IconCheck size={14} />
                    <span>{busyId === item.notificationId ? 'Đang lưu...' : 'Đánh dấu đã đọc'}</span>
                  </button>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Đã đọc</span>
                )}
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{item.message}</p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconClock size={14} />
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
              Không có thông báo nào thỏa điều kiện lọc.
            </div>
          )}

          {/* Phân trang */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
