using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Students
{
    public class UpdateStudentProfileDto
    {
        [MaxLength(50)]
        public string? FullName { get; set; }

        [EmailAddress]
        public string? EmailAddress { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(150)]
        public string? Major { get; set; }

        [MaxLength(50)]
        public string? ClassName { get; set; }

        [MaxLength(20)]
        public string? AcademicYear { get; set; }
    }
}
