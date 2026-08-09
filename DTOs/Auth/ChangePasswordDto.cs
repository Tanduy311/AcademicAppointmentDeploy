using System.ComponentModel.DataAnnotations;

namespace AcademicAppoinment.DTOs.Auth
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại không được để trống.")]
        public string OldPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống.")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Xác nhận mật khẩu mới không được để trống.")]
        [Compare("NewPassword", ErrorMessage = "Xác nhận mật khẩu mới không khớp.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
