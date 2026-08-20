import { request } from './apiClient';
import type {
  AdminUserDetailDto,
  AdminUserListItemDto,
  AppointmentQueryParams,
  AppointmentResponseDto,
  AuthResponseDto,
  CancelAppointmentDto,
  ChangePasswordDto,
  CreateAppointmentDto,
  CreateSlotDto,
  CurrentUserResponseDto,
  FileUploadResponseDto,
  LecturerDetailDto,
  LecturerListItemDto,
  LoginDto,
  NotificationQueryParams,
  NotificationResponseDto,
  PagedResult,
  RegisterLecturerDto,
  RegisterStudentDto,
  RoleDto,
  SlotResponseDto,
  StudentDetailDto,
  StudentListItemDto,
  UpdateAppointmentStatusDto,
  UpdateLecturerProfileDto,
  UpdateSlotDto,
  UpdateStudentProfileDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from '../types/api';

function buildQueryString(params?: object): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const api = {
  login: (dto: LoginDto) =>
    request<AuthResponseDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  registerStudent: (dto: RegisterStudentDto) =>
    request<AuthResponseDto>('/api/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  registerLecturer: (dto: RegisterLecturerDto) =>
    request<AuthResponseDto>('/api/auth/register-lecturer', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  me: () => request<CurrentUserResponseDto>('/api/auth/me'),
  currentUser: () => request<CurrentUserResponseDto>('/api/auth/me'),
  changePassword: (dto: ChangePasswordDto) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  updateMyAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request<CurrentUserResponseDto>('/api/auth/me/avatar', {
      method: 'PUT',
      body: formData,
    });
  },

  lecturers: () => request<LecturerListItemDto[]>('/api/lecturers'),
  lecturerById: (lecturerId: number) =>
    request<LecturerDetailDto>(`/api/lecturers/${lecturerId}`),

  appointmentsById: (id: number) => request<AppointmentResponseDto>(`/api/appointments/${id}`),
  myAppointments: (params?: AppointmentQueryParams) =>
    request<PagedResult<AppointmentResponseDto>>(`/api/appointments/my-appointments${buildQueryString(params)}`),
  allMyAppointments: () =>
    request<AppointmentResponseDto[]>('/api/appointments/my-appointments/all'),
  lecturerAppointments: (params?: AppointmentQueryParams) =>
    request<PagedResult<AppointmentResponseDto>>(`/api/appointments/lecturer-appointments${buildQueryString(params)}`),
  allLecturerAppointments: () =>
    request<AppointmentResponseDto[]>('/api/appointments/lecturer-appointments/all'),
  createAppointment: (dto: CreateAppointmentDto) =>
    request<AppointmentResponseDto>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  updateAppointmentStatus: (id: number, dto: UpdateAppointmentStatusDto) =>
    request<AppointmentResponseDto>(`/api/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  cancelAppointment: (id: number, dto: CancelAppointmentDto) =>
    request<AppointmentResponseDto>(`/api/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  slotsByLecturer: (lecturerId: number) =>
    request<SlotResponseDto[]>(`/api/availabilityslots/lecturer/${lecturerId}`),
  mySlots: () => request<SlotResponseDto[]>('/api/availabilityslots/my-slots'),
  createSlot: (dto: CreateSlotDto) =>
    request<SlotResponseDto>('/api/availabilityslots', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  updateSlot: (id: number, dto: UpdateSlotDto) =>
    request<SlotResponseDto>(`/api/availabilityslots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  deleteSlot: (id: number) =>
    request<{ message: string }>(`/api/availabilityslots/${id}`, {
      method: 'DELETE',
    }),

  students: () => request<StudentListItemDto[]>('/api/students'),
  studentById: (studentId: number) =>
    request<StudentDetailDto>(`/api/students/${studentId}`),
  myStudentProfile: () => request<StudentDetailDto>('/api/students/me'),
  updateStudentProfile: (dto: UpdateStudentProfileDto) =>
    request<StudentDetailDto>('/api/students/me', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  myLecturerProfile: () => request<LecturerDetailDto>('/api/lecturers/me'),
  updateLecturerProfile: (dto: UpdateLecturerProfileDto) =>
    request<LecturerDetailDto>('/api/lecturers/me', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    return request<FileUploadResponseDto>(`/api/fileupload/upload${query}`, {
      method: 'POST',
      body: formData,
    });
  },

  users: () => request<AdminUserListItemDto[]>('/api/admin/users'),
  userById: (userId: number) => request<AdminUserDetailDto>(`/api/admin/users/${userId}`),
  adminAppointments: (params?: AppointmentQueryParams) =>
    request<PagedResult<AppointmentResponseDto>>(`/api/admin/appointments${buildQueryString(params)}`),
  allAdminAppointments: () => request<AppointmentResponseDto[]>('/api/admin/appointments/all'),
  roles: () => request<RoleDto[]>('/api/admin/roles'),
  updateUserStatus: (userId: number, dto: UpdateUserStatusDto) =>
    request<{ message: string }>(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  updateUserRole: (userId: number, dto: UpdateUserRoleDto) =>
    request<{ message: string }>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  addUserRole: (userId: number, dto: UpdateUserRoleDto) =>
    request<{ message: string }>(`/api/admin/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  removeUserRole: (userId: number, roleId: number) =>
    request<{ message: string }>(`/api/admin/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    }),

  notifications: (params?: NotificationQueryParams) =>
    request<PagedResult<NotificationResponseDto>>(`/api/notifications${buildQueryString(params)}`),
  allNotifications: () => request<NotificationResponseDto[]>('/api/notifications/all'),
  unreadCount: () => request<{ unreadCount: number }>('/api/notifications/unread-count'),
  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ message: string }>('/api/notifications/mark-all-read', {
      method: 'PUT',
    }),
};
