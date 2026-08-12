using AcademicAppoinment.DTOs.Admin;
using AcademicAppoinment.DTOs.Appointments;
using AcademicAppoinment.Helpers.Exceptions;
using AcademicAppoinment.Models;
using AcademicAppoinment.Repositories;
using AcademicAppoinment.Services.Interfaces;
using System.Security.Claims;

namespace AcademicAppoinment.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAppRepository _repository;

        public AdminService(IAppRepository repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync()
        {
            var users = await _repository.GetUsersAsync();
            return users.Select(ToListItemDto).ToList();
        }

        public async Task<AdminUserDetailDto> GetUserByIdAsync(int userId)
        {
            var user = await _repository.GetUserByIdWithDetailsAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            return ToDetailDto(user);
        }

        public async Task<IReadOnlyList<AppointmentResponseDto>> GetAppointmentsAsync()
        {
            var appointments = await _repository.GetAppointmentsAsync();
            return appointments.Select(ToAppointmentResponseDto).ToList();
        }

        public async Task<IReadOnlyList<RoleDto>> GetRolesAsync()
        {
            var roles = await _repository.GetRolesAsync();
            return roles.Select(r => new RoleDto
            {
                RoleId = r.RoleId,
                RoleName = r.RoleName
            }).ToList();
        }

        public async Task<bool> SetUserActiveAsync(int userId, bool isActive, ClaimsPrincipal currentUser)
        {
            var currentUserId = GetCurrentUserId(currentUser);
            if (currentUserId == userId)
            {
                throw new ForbiddenAccessException("Bạn không thể tự khóa hoặc mở chính mình.");
            }

            var user = await _repository.GetUserByIdWithDetailsAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            user.IsActive = isActive;
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser)
        {
            var currentUserId = GetCurrentUserId(currentUser);
            if (currentUserId == userId)
            {
                throw new ForbiddenAccessException("Bạn không thể tự đổi role của chính mình.");
            }

            var user = await _repository.GetUserByIdWithDetailsAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            var role = await _repository.GetRoleByIdAsync(roleId);
            if (role == null)
            {
                throw new ArgumentException("Role không hợp lệ.");
            }

            if (string.Equals(role.RoleName, "Student", StringComparison.OrdinalIgnoreCase) && user.Student == null)
            {
                throw new ArgumentException("Không thể đổi sang role Student vì người dùng chưa có hồ sơ sinh viên.");
            }

            if (string.Equals(role.RoleName, "Lecturer", StringComparison.OrdinalIgnoreCase) && user.Lecturer == null)
            {
                throw new ArgumentException("Không thể đổi sang role Lecturer vì người dùng chưa có hồ sơ giảng viên.");
            }

            user.RoleId = roleId;
            await _repository.SaveChangesAsync();
            return true;
        }

        private static AdminUserListItemDto ToListItemDto(User user)
        {
            return new AdminUserListItemDto
            {
                UserId = user.UserId,
                AccountName = user.AccountName,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                PhoneNumber = user.PhoneNumber,
                RoleName = user.Role?.RoleName ?? "",
                IsActive = user.IsActive,
                StudentId = user.Student?.StudentId,
                LecturerId = user.Lecturer?.LecturerId,
                CreatedAt = user.CreatedAt
            };
        }

        private static AdminUserDetailDto ToDetailDto(User user)
        {
            return new AdminUserDetailDto
            {
                UserId = user.UserId,
                AccountName = user.AccountName,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                PhoneNumber = user.PhoneNumber,
                RoleName = user.Role?.RoleName ?? "",
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                StudentInfo = user.Student == null ? null : new StudentAdminInfoDto
                {
                    StudentId = user.Student.StudentId,
                    StudentCode = user.Student.StudentCode,
                    Major = user.Student.Major,
                    ClassName = user.Student.ClassName,
                    AcademicYear = user.Student.AcademicYear
                },
                LecturerInfo = user.Lecturer == null ? null : new LecturerAdminInfoDto
                {
                    LecturerId = user.Lecturer.LecturerId,
                    LecturerCode = user.Lecturer.LecturerCode,
                    Department = user.Lecturer.Department,
                    Specialization = user.Lecturer.Specialization,
                    OfficeLocation = user.Lecturer.OfficeLocation,
                    ConsultationDescription = user.Lecturer.ConsultationDescription
                }
            };
        }

        private static AppointmentResponseDto ToAppointmentResponseDto(Appointment appointment)
        {
            return new AppointmentResponseDto
            {
                AppointmentId = appointment.AppointmentId,
                StudentId = appointment.StudentId,
                StudentName = appointment.Student?.User?.FullName ?? "",
                StudentCode = appointment.Student?.StudentCode,
                LecturerId = appointment.LecturerId,
                LecturerName = appointment.Lecturer?.User?.FullName ?? "",
                Department = appointment.Lecturer?.Department,
                AvailabilitySlotId = appointment.AvailabilitySlotId,
                StartTime = appointment.AvailabilitySlot?.StartTime ?? default,
                EndTime = appointment.AvailabilitySlot?.EndTime ?? default,
                MeetingType = appointment.AvailabilitySlot?.MeetingType ?? "",
                LocationOrLink = appointment.AvailabilitySlot?.LocationOrLink,
                Topic = appointment.Topic,
                Description = appointment.Description,
                Status = appointment.Status,
                LecturerResponse = appointment.LecturerResponse,
                CancellationReason = appointment.CancellationReason,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };
        }

        private static int GetCurrentUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không tìm thấy thông tin tài khoản đăng nhập.");
            }
            return userId;
        }
    }
}
