using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Appointments
{
    public class UpdateAppointmentDto
    {
        [Required(ErrorMessage = "Chủ đề tư vấn không được để trống.")]
        public string Topic { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}
