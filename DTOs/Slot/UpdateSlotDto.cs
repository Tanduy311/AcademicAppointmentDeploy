using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Slot
{
    public class UpdateSlotDto
    {
        [Required(ErrorMessage = "Thời gian bắt đầu không được để trống.")]
        public DateTime StartTime { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc không được để trống.")]
        public DateTime EndTime { get; set; }

        [Required(ErrorMessage = "Hình thức tư vấn không được để trống.")]
        public string MeetingType { get; set; } = string.Empty;

        public string? LocationOrLink { get; set; }
    }
}
