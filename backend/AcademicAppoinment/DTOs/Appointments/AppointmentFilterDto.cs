using AcademicAppoinment.DTOs.Common;

namespace AcademicAppoinment.DTOs.Appointments
{
    public class AppointmentFilterDto : PaginationParamsDto
    {
        public string? Status { get; set; }
        public string? Tab { get; set; } // "active" (Pending, Confirmed) | "history" (Completed, No-Show, Cancelled, Rejected)
        public string? Search { get; set; }
    }
}
