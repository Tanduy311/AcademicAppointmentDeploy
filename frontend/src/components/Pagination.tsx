import React, { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from './Icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 10, 20, 50],
  itemName = 'kết quả',
  disabled = false,
}) => {
  const [jumpPageInput, setJumpPageInput] = useState('');

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

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpPageInput('');
    } else {
      alert(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalPages}`);
    }
  };

  return (
    <div className="pagination-container">
      {/* Thông tin số lượng bản ghi & chọn pageSize */}
      <div className="pagination-info">
        <span>
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số{' '}
          <strong>{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
            <span>Số dòng:</span>
            <select
              className="pagination-size-select custom-select"
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Điều khiển phân trang & Nhảy trang */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {totalPages > 1 && (
          <div className="pagination-controls">
            {/* Nút Trước */}
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1 || disabled}
              onClick={() => onPageChange(currentPage - 1)}
              title="Trang trước"
            >
              <IconChevronLeft size={16} style={{ marginRight: 2 }} />
              <span>Trước</span>
            </button>

            {/* Danh sách trang */}
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
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
                  className={`pagination-btn ${isActive ? 'active' : ''}`}
                  disabled={disabled}
                  onClick={() => onPageChange(pageNum)}
                  title={`Trang ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Nút Sau */}
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages || disabled}
              onClick={() => onPageChange(currentPage + 1)}
              title="Trang sau"
            >
              <span>Sau</span>
              <IconChevronRight size={16} style={{ marginLeft: 2 }} />
            </button>
          </div>
        )}

        {/* Nút nhảy đến số trang mong muốn */}
        {totalPages > 1 && (
          <form onSubmit={handleJumpSubmit} className="pagination-jump">
            <span>Đến trang:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              placeholder={String(currentPage)}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              disabled={disabled}
              className="pagination-jump-input"
            />
            <button
              type="submit"
              disabled={disabled || !jumpPageInput.trim()}
              className="pagination-jump-btn"
            >
              Nhảy
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
