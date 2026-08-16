using System.Text.Json.Serialization;

namespace AcademicAppoinment.Models
{
    public class UserRole
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }

        [JsonIgnore]
        public User? User { get; set; }

        [JsonIgnore]
        public Role? Role { get; set; }
    }
}
