using AcademicAppoinment.DTOs.Admin;
using AcademicAppoinment.DTOs.Appointments;
using AcademicAppoinment.DTOs.Common;
using AcademicAppoinment.Helpers;
using AcademicAppoinment.Helpers.Exceptions;
using AcademicAppoinment.Models;
using AcademicAppoinment.Repositories;
using AcademicAppoinment.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AcademicAppoinment.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAppRepository _repository;
        private readonly AppDbContext _context;

        public AdminService(IAppRepository repository, AppDbContext context)
        {
            _repository = repository;
            _context = context;
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

        public async Task<PagedResultDto<AppointmentResponseDto>> GetAppointmentsPagedAsync(AppointmentFilterDto filter)
        {
            var query = _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s!.User)
                .Include(a => a.Lecturer)
                    .ThenInclude(l => l!.User)
                .Include(a => a.AvailabilitySlot)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(a => a.Status == filter.Status);
            }
            else if (string.Equals(filter.Tab, "active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(a => a.Status == "Pending" || a.Status == "Confirmed");
            }
            else if (string.Equals(filter.Tab, "history", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(a => a.Status == "Completed" || a.Status == "No-Show" || a.Status == "Cancelled" || a.Status == "Rejected");
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(a => a.Topic.ToLower().Contains(term) ||
                                         (a.Student != null && a.Student.User != null && a.Student.User.FullName.ToLower().Contains(term)) ||
                                         (a.Student != null && a.Student.StudentCode.ToLower().Contains(term)) ||
                                         (a.Lecturer != null && a.Lecturer.User != null && a.Lecturer.User.FullName.ToLower().Contains(term)));
            }

            var totalItems = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResultDto<AppointmentResponseDto>(
                items.Select(ToAppointmentResponseDto).ToList(),
                totalItems,
                filter.PageNumber,
                filter.PageSize);
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

            // Quy tắc bảo vệ Super Admin: Không thể khóa Admin duy nhất còn lại
            if (!isActive && user.UserRoles.Any(ur => ur.RoleId == 1))
            {
                var activeAdminCount = await _context.UserRoles
                    .Include(ur => ur.User)
                    .CountAsync(ur => ur.RoleId == 1 && ur.User != null && ur.User.IsActive);
                if (activeAdminCount <= 1)
                {
                    throw new ArgumentException("Không thể khóa tài khoản Admin duy nhất còn hoạt động trong hệ thống.");
                }
            }

            user.IsActive = isActive;
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser)
        {
            var user = await GetTargetUserForRoleChangeAsync(userId, currentUser, "Bạn không thể tự đổi role của chính mình.");
            var role = await GetValidRoleForUserAsync(user, roleId);

            if (user.UserRoles.Count == 1 && user.UserRoles.Any(ur => ur.RoleId == roleId))
            {
                return true;
            }

            // Nếu người dùng đang là Admin và đổi sang role khác, kiểm tra xem có phải là Admin duy nhất không
            if (user.UserRoles.Any(ur => ur.RoleId == 1) && roleId != 1)
            {
                var activeAdminCount = await _context.UserRoles
                    .Include(ur => ur.User)
                    .CountAsync(ur => ur.RoleId == 1 && ur.User != null && ur.User.IsActive);
                if (activeAdminCount <= 1)
                {
                    throw new ArgumentException("Không thể gỡ quyền Admin của tài khoản Admin duy nhất còn lại trong hệ thống.");
                }
            }

            user.UserRoles.Clear();
            user.UserRoles.Add(new UserRole
            {
                UserId = user.UserId,
                RoleId = roleId
            });

            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser)
        {
            var user = await GetTargetUserForRoleChangeAsync(userId, currentUser, "Bạn không thể tự thêm role cho chính mình.");
            var role = await GetValidRoleForUserAsync(user, roleId);

            if (user.UserRoles.Any(ur => ur.RoleId == role.RoleId))
            {
                return true;
            }

            user.UserRoles.Add(new UserRole
            {
                UserId = user.UserId,
                RoleId = role.RoleId
            });

            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser)
        {
            var user = await GetTargetUserForRoleChangeAsync(userId, currentUser, "Bạn không thể tự gỡ role của chính mình.");
            var userRole = user.UserRoles.FirstOrDefault(ur => ur.RoleId == roleId);
            if (userRole == null)
            {
                return true;
            }

            if (user.UserRoles.Count <= 1)
            {
                throw new ArgumentException("Người dùng phải có ít nhất một role.");
            }

            // Quy tắc bảo vệ Super Admin: Không thể gỡ quyền Admin nếu là Admin duy nhất
            if (roleId == 1)
            {
                var activeAdminCount = await _context.UserRoles
                    .Include(ur => ur.User)
                    .CountAsync(ur => ur.RoleId == 1 && ur.User != null && ur.User.IsActive);
                if (activeAdminCount <= 1)
                {
                    throw new ArgumentException("Không thể gỡ quyền Admin của tài khoản Admin duy nhất còn lại trong hệ thống.");
                }
            }

            user.UserRoles.Remove(userRole);
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
                RoleName = RoleNameResolver.ResolvePrimaryRole(user),
                RoleNames = RoleNameResolver.GetRoleNames(user),
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
                RoleName = RoleNameResolver.ResolvePrimaryRole(user),
                RoleNames = RoleNameResolver.GetRoleNames(user),
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

        private async Task<User> GetTargetUserForRoleChangeAsync(int userId, ClaimsPrincipal currentUser, string selfEditMessage)
        {
            var currentUserId = GetCurrentUserId(currentUser);
            if (currentUserId == userId)
            {
                throw new ForbiddenAccessException(selfEditMessage);
            }

            var user = await _repository.GetUserByIdWithDetailsAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            return user;
        }

        private async Task<Role> GetValidRoleForUserAsync(User user, int roleId)
        {
            var role = await _repository.GetRoleByIdAsync(roleId);
            if (role == null)
            {
                throw new ArgumentException("Role không hợp lệ.");
            }

            if (string.Equals(role.RoleName, "Student", StringComparison.OrdinalIgnoreCase) && user.Student == null)
            {
                throw new ArgumentException("Không thể gán role Student vì người dùng chưa có hồ sơ sinh viên.");
            }

            if (string.Equals(role.RoleName, "Lecturer", StringComparison.OrdinalIgnoreCase) && user.Lecturer == null)
            {
                throw new ArgumentException("Không thể gán role Lecturer vì người dùng chưa có hồ sơ giảng viên.");
            }

            return role;
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
