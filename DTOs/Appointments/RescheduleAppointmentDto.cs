using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Appointments
{
    public class RescheduleAppointmentDto
    {
        [Required(ErrorMessage = "Vui lòng chọn khung giờ rảnh mới.")]
        public int NewAvailabilitySlotId { get; set; }
    }
}
