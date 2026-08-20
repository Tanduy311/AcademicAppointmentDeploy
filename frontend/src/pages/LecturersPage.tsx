import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { LecturerListItemDto } from '../types/api';
import {
  IconTeacher,
  IconSearch,
  IconBuilding,
  IconTarget,
  IconMapPin,
  IconClock,
} from '../components/Icons';
import { Pagination } from '../components/Pagination';
import { cleanStringValue, formatDisplayValue } from '../utils/format';

export function LecturersPage() {
  const [items, setItems] = useState<LecturerListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    api
      .lecturers()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải danh sách giảng viên.'))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(
    () => ['ALL', ...Array.from(new Set(items.map((i) => cleanStringValue(i.department)).filter(Boolean)))],
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cleanSpec = cleanStringValue(item.specialization);
      const cleanDept = cleanStringValue(item.department);
      const matchesSearch =
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lecturerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleanSpec.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || cleanDept === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [items, searchQuery, selectedDept]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleDeptChange = (val: string) => {
    setSelectedDept(val);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Đang tải danh sách giảng viên...</div>
      </div>
    );
  }

  if (error) {
    return <div className="badge badge-danger" style={{ width: '100%', padding: 16 }}>{error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner & Search Filters */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconTeacher size={24} style={{ color: 'var(--accent)' }} />
              <span>Danh sách giảng viên tư vấn</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Tìm kiếm giảng viên theo tên, khoa hoặc chuyên ngành để đăng ký lịch tư vấn học thuật.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-neutral">Tổng cộng: {filteredItems.length} giảng viên</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
          <div className="field" style={{ flex: 1, minWidth: 260 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSearch size={15} />
              <span>Tìm kiếm giảng viên</span>
            </span>
            <input
              placeholder="Nhập tên, mã giảng viên hoặc chuyên ngành..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="field" style={{ width: 240 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBuilding size={15} />
              <span>Lọc theo khoa</span>
            </span>
            <select value={selectedDept} onChange={(e) => handleDeptChange(e.target.value)}>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'Tất cả các khoa' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lecturer Cards Grid */}
      <div className="grid-2">
        {paginatedItems.map((item) => (
          <Link
            key={item.lecturerId}
            to={`/app/lecturers/${item.lecturerId}`}
            className="panel panel-interactive"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16, textDecoration: 'none' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar-circle" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                    {item.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.fullName}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mã GV: {item.lecturerCode}
                    </div>
                  </div>
                </div>

                <span className="badge badge-neutral">{formatDisplayValue(item.department, 'Khoa CNTT')}</span>
              </div>

              {cleanStringValue(item.specialization) ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconTarget size={15} style={{ color: 'var(--accent)' }} />
                  <span><strong>Chuyên môn:</strong> {cleanStringValue(item.specialization)}</span>
                </div>
              ) : null}

              {cleanStringValue(item.officeLocation) ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconMapPin size={15} />
                  <span><strong>Văn phòng:</strong> {cleanStringValue(item.officeLocation)}</span>
                </div>
              ) : null}
            </div>

            <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`badge ${item.upcomingSlotCount > 0 ? 'badge-success' : 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <IconClock size={13} />
                <span>{item.upcomingSlotCount > 0 ? `${item.upcomingSlotCount} slot rảnh sắp tới` : 'Chưa mở slot'}</span>
              </span>

              <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                <span>Xem hồ sơ và đặt lịch</span>
              </span>
            </div>
          </Link>
        ))}

        {filteredItems.length === 0 && (
          <div className="panel bento-col-12" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Không tìm thấy giảng viên nào phù hợp với từ khóa tìm kiếm.
          </div>
        )}
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredItems.length}
        pageSize={pageSize}
        pageSizeOptions={[6, 12, 24, 48]}
        itemName="giảng viên"
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
