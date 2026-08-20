using AcademicAppoinment.DTOs.Common;

namespace AcademicAppoinment.DTOs.Notification
{
    public class NotificationFilterDto : PaginationParamsDto
    {
        public bool? IsRead { get; set; }
    }
}
