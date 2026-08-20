import React from 'react';
import { IconChevronLeft, IconChevronRight } from './Icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
}) => {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Tạo danh sách các số trang cần hiển thị (kèm ellipsis)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        padding: '16px 8px',
        marginTop: 16,
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      {/* Thông tin số lượng bản ghi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        <span>
          Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> -{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> trên tổng số{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> kết quả
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span>Số dòng:</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Các nút bấm chuyển trang */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Nút Trước */}
          <button
            type="button"
            className="btn"
            disabled={currentPage <= 1 || disabled}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: currentPage <= 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
              fontSize: 13,
              cursor: currentPage <= 1 || disabled ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            <IconChevronLeft size={16} style={{ marginRight: 4 }} />
            Trước
          </button>

          {/* Danh sách trang */}
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: 13 }}
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                className="btn"
                disabled={disabled}
                onClick={() => onPageChange(pageNum)}
                style={{
                  minWidth: 34,
                  height: 34,
                  padding: '0 8px',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--primary)' : 'var(--bg-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Nút Sau */}
          <button
            type="button"
            className="btn"
            disabled={currentPage >= totalPages || disabled}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: currentPage >= totalPages ? 'var(--text-disabled)' : 'var(--text-primary)',
              fontSize: 13,
              cursor: currentPage >= totalPages || disabled ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
            }}
          >
            Sau
            <IconChevronRight size={16} style={{ marginLeft: 4 }} />
          </button>
        </div>
      )}
    </div>
  );
};
