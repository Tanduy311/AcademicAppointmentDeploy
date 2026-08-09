import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';
import type { SlotResponseDto, UpdateSlotDto } from '../types/api';
import { IconClock, IconPlus, IconMapPin, IconTrash, IconFileText, IconAlert, IconEdit } from '../components/Icons';

export function LecturerSlotsPage() {
  const [items, setItems] = useState<SlotResponseDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    meetingType: 'Offline',
    locationOrLink: 'Phòng 302-A1',
  });

  // Edit Slot Modal state
  const [editingSlot, setEditingSlot] = useState<SlotResponseDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateSlotDto>({
    startTime: '',
    endTime: '',
    meetingType: 'Offline',
    locationOrLink: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.mySlots());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khung giờ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.startTime || !form.endTime) {
      alert('Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.createSlot(form);
      await load();
      setForm({
        startTime: '',
        endTime: '',
        meetingType: 'Offline',
        locationOrLink: 'Phòng 302-A1',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo khung giờ rảnh.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khung giờ rảnh này?')) return;
    try {
      await api.deleteSlot(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa khung giờ.');
    }
  };

  const openEditModal = (slot: SlotResponseDto) => {
    setEditingSlot(slot);
    // Format ISO string for datetime-local input (YYYY-MM-DDTHH:mm)
    const startStr = slot.startTime ? new Date(slot.startTime).toISOString().slice(0, 16) : '';
    const endStr = slot.endTime ? new Date(slot.endTime).toISOString().slice(0, 16) : '';
    setEditForm({
      startTime: startStr,
      endTime: endStr,
      meetingType: slot.meetingType || 'Offline',
      locationOrLink: slot.locationOrLink || '',
    });
  };

  const handleUpdateSlotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    setSubmittingEdit(true);
    try {
      await api.updateSlot(editingSlot.availabilitySlotId, editForm);
      setEditingSlot(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật khung giờ.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconClock size={24} style={{ color: 'var(--accent)' }} />
          <span>Quản Lý Khung Giờ Rảnh Tư Vấn</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Tạo mới và quản lý các khung giờ bạn sẵn sàng tư vấn cho sinh viên.
        </p>
      </div>

      {/* Create Slot Form Panel */}
      <form className="panel" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPlus size={20} style={{ color: 'var(--accent)' }} />
          <span>Tạo Khung Giờ Rảnh Mới</span>
        </h2>

        {error ? (
          <div className="badge badge-danger" style={{ padding: 12, width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconAlert size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid-2">
          <label className="field">
            <span>Thời gian bắt đầu (Start Time)</span>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Thời gian kết thúc (End Time)</span>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Hình thức gặp (Meeting Type)</span>
            <select
              value={form.meetingType}
              onChange={(e) => setForm((prev) => ({ ...prev, meetingType: e.target.value }))}
            >
              <option value="Offline">Offline (Tại trường)</option>
              <option value="Online">Online (Google Meet / Zoom)</option>
            </select>
          </label>

          <label className="field">
            <span>Địa điểm hoặc Đường link gặp</span>
            <input
              placeholder="Ví dụ: Phòng 302-A1 hoặc https://meet.google.com/abc..."
              value={form.locationOrLink}
              onChange={(e) => setForm((prev) => ({ ...prev, locationOrLink: e.target.value }))}
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={16} />
            <span>{busy ? 'Đang Lưu Khung Giờ...' : 'Thêm Slot Rảnh Này'}</span>
          </button>
        </div>
      </form>

      {/* Existing Slots List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFileText size={18} />
          <span>Các Khung Giờ Đã Tạo</span>
        </h3>

        {loading ? (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-secondary)' }}>
            Đang tải danh sách slot...
          </div>
        ) : (
          items.map((slot) => (
            <div key={slot.availabilitySlotId} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconClock size={16} style={{ color: 'var(--accent)' }} />
                  <span>{formatDateTime(slot.startTime)} ➔ {formatDateTime(slot.endTime)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral">{slot.meetingType}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconMapPin size={14} />
                    <span>{slot.locationOrLink || 'Chưa nhập địa điểm'}</span>
                  </span>
                  <span className={`badge ${slot.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                    {slot.isAvailable ? 'Còn trống' : 'Đã có sinh viên đặt'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {slot.isAvailable && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    type="button"
                    onClick={() => openEditModal(slot)}
                  >
                    <IconEdit size={14} />
                    <span>Sửa</span>
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  type="button"
                  onClick={() => remove(slot.availabilitySlotId)}
                >
                  <IconTrash size={14} />
                  <span>Xóa Slot</span>
                </button>
              </div>
            </div>
          ))
        )}

        {!loading && items.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
            Bạn chưa tạo khung giờ rảnh nào.
          </div>
        )}
      </div>

      {/* Edit Slot Modal Overlay */}
      {editingSlot && (
        <div className="modal-overlay" onClick={() => setEditingSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Chỉnh Sửa Khung Giờ Rảnh</h3>
            <form onSubmit={handleUpdateSlotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  className="input"
                  required
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  className="input"
                  required
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Hình thức gặp</label>
                <select
                  className="input"
                  value={editForm.meetingType}
                  onChange={(e) => setEditForm({ ...editForm, meetingType: e.target.value })}
                >
                  <option value="Offline">Offline (Tại trường)</option>
                  <option value="Online">Online (Google Meet / Zoom)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Địa điểm hoặc Link cuộc họp</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.locationOrLink || ''}
                  onChange={(e) => setEditForm({ ...editForm, locationOrLink: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSlot(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submittingEdit}>
                  {submittingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
