using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Lecturers
{
    public class UpdateLecturerProfileDto
    {
        [Required(ErrorMessage = "Họ và tên không được để trống.")]
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Department { get; set; }

        public string? Specialization { get; set; }

        public string? OfficeLocation { get; set; }

        public string? ConsultationDescription { get; set; }
    }
}
