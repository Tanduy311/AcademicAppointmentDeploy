using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AcademicAppoinment.Models
{
    public class Role
    {
        public int RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; } = null!;

        // Một role có thể được gán cho nhiều user qua bảng nối UserRoles.
        [JsonIgnore]
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
