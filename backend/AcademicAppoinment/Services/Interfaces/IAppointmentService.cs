using AcademicAppoinment.DTOs.Appointments;
using AcademicAppoinment.DTOs.Common;
using System.Security.Claims;

namespace AcademicAppoinment.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentResponseDto> CreateAppointmentAsync(CreateAppointmentDto dto, ClaimsPrincipal user);
        Task<AppointmentResponseDto> GetAppointmentByIdAsync(int id, ClaimsPrincipal user);
        Task<IReadOnlyList<AppointmentResponseDto>> GetMyAppointmentsAsync(ClaimsPrincipal user);
        Task<PagedResultDto<AppointmentResponseDto>> GetMyAppointmentsPagedAsync(AppointmentFilterDto filter, ClaimsPrincipal user);
        Task<IReadOnlyList<AppointmentResponseDto>> GetLecturerAppointmentsAsync(ClaimsPrincipal user);
        Task<PagedResultDto<AppointmentResponseDto>> GetLecturerAppointmentsPagedAsync(AppointmentFilterDto filter, ClaimsPrincipal user);
        Task<AppointmentResponseDto> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto, ClaimsPrincipal user);
        Task<AppointmentResponseDto> CancelAppointmentAsync(int id, CancelAppointmentDto dto, ClaimsPrincipal user);
    }
}

