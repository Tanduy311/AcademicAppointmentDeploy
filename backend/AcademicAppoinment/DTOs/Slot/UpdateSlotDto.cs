using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Slot
{
    public class UpdateSlotDto
    {
        [Required(ErrorMessage = "Hình thức gặp không được để trống.")]
        [MaxLength(50)]
        public string MeetingType { get; set; } = null!;

        [Required(ErrorMessage = "Vui lòng nhập địa điểm hoặc link gặp.")]
        [MaxLength(500)]
        public string LocationOrLink { get; set; } = null!;
    }
}
