using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Students
{
    public class UpdateStudentProfileDto
    {
        [Required(ErrorMessage = "Họ và tên không được để trống.")]
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Major { get; set; }

        public string? ClassName { get; set; }

        public string? AcademicYear { get; set; }
    }
}
