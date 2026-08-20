using AcademicAppoinment.DTOs.Admin;
using AcademicAppoinment.DTOs.Appointments;
using AcademicAppoinment.DTOs.Common;
using System.Security.Claims;

namespace AcademicAppoinment.Services.Interfaces
{
    public interface IAdminService
    {
        Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync();
        Task<AdminUserDetailDto> GetUserByIdAsync(int userId);
        Task<IReadOnlyList<AppointmentResponseDto>> GetAppointmentsAsync();
        Task<PagedResultDto<AppointmentResponseDto>> GetAppointmentsPagedAsync(AppointmentFilterDto filter);
        Task<IReadOnlyList<RoleDto>> GetRolesAsync();
        Task<bool> SetUserActiveAsync(int userId, bool isActive, ClaimsPrincipal currentUser);
        Task<bool> SetUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser);
        Task<bool> AddUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser);
        Task<bool> RemoveUserRoleAsync(int userId, int roleId, ClaimsPrincipal currentUser);
    }
}

