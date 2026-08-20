using AcademicAppoinment.DTOs.Auth;
using AcademicAppoinment.Helpers;
using AcademicAppoinment.Models;
using AcademicAppoinment.Repositories;
using AcademicAppoinment.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AcademicAppoinment.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAppRepository _repository;
        private readonly JwtTokenHelper _jwtTokenHelper;
        private readonly AppDbContext _context;
        private readonly IAvatarStorageService? _avatarStorageService;

        public AuthService(
            IAppRepository repository,
            JwtTokenHelper jwtTokenHelper,
            AppDbContext context,
            IAvatarStorageService? avatarStorageService = null)
        {
            _repository = repository;
            _jwtTokenHelper = jwtTokenHelper;
            _context = context;
            _avatarStorageService = avatarStorageService;
        }

        public async Task<AuthResponseDto> RegisterStudentAsync(RegisterStudentDto dto)
        {
            ValidatePasswordComplexity(dto.Password);

            if (await _repository.UserAccountExistsAsync(dto.AccountName))
                throw new ArgumentException("Tên tài khoản đã tồn tại.");

            if (await _repository.UserEmailExistsAsync(dto.EmailAddress))
                throw new ArgumentException("Email đã được sử dụng.");

            if (await _repository.StudentCodeExistsAsync(dto.StudentCode))
                throw new ArgumentException("Mã sinh viên đã tồn tại.");

            await using var transaction = _context.Database.IsRelational()
                ? await _context.Database.BeginTransactionAsync()
                : null;

            var user = new User
            {
                AccountName = dto.AccountName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                EmailAddress = dto.EmailAddress,
                PhoneNumber = dto.PhoneNumber,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _repository.AddUser(user);
            await _repository.SaveChangesAsync();

            _repository.AddUserRole(new UserRole
            {
                UserId = user.UserId,
                RoleId = 2
            });

            var student = new Student
            {
                UserId = user.UserId,
                StudentCode = dto.StudentCode,
                Major = dto.Major,
                ClassName = dto.ClassName,
                AcademicYear = dto.AcademicYear
            };

            _repository.AddStudent(student);
            await _repository.SaveChangesAsync();

            if (transaction != null)
            {
                await transaction.CommitAsync();
            }

            var token = _jwtTokenHelper.GenerateToken(user, ["Student"], studentId: student.StudentId);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                AccountName = user.AccountName,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                AvatarUrl = user.AvatarUrl,
                RoleName = "Student",
                StudentId = student.StudentId
            };
        }

        public async Task<AuthResponseDto> RegisterLecturerAsync(RegisterLecturerDto dto)
        {
            ValidatePasswordComplexity(dto.Password);

            if (await _repository.UserAccountExistsAsync(dto.AccountName))
                throw new ArgumentException("Tên tài khoản đã tồn tại.");

            if (await _repository.UserEmailExistsAsync(dto.EmailAddress))
                throw new ArgumentException("Email đã được sử dụng.");

            if (await _repository.LecturerCodeExistsAsync(dto.LecturerCode))
                throw new ArgumentException("Mã giảng viên đã tồn tại.");

            await using var transaction = _context.Database.IsRelational()
                ? await _context.Database.BeginTransactionAsync()
                : null;

            var user = new User
            {
                AccountName = dto.AccountName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                EmailAddress = dto.EmailAddress,
                PhoneNumber = dto.PhoneNumber,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _repository.AddUser(user);
            await _repository.SaveChangesAsync();

            _repository.AddUserRole(new UserRole
            {
                UserId = user.UserId,
                RoleId = 3
            });

            var lecturer = new Lecturer
            {
                UserId = user.UserId,
                LecturerCode = dto.LecturerCode,
                Department = dto.Department,
                Specialization = dto.Specialization,
                OfficeLocation = dto.OfficeLocation,
                ConsultationDescription = dto.ConsultationDescription
            };

            _repository.AddLecturer(lecturer);
            await _repository.SaveChangesAsync();

            if (transaction != null)
            {
                await transaction.CommitAsync();
            }

            var token = _jwtTokenHelper.GenerateToken(user, ["Lecturer"], lecturerId: lecturer.LecturerId);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                AccountName = user.AccountName,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                AvatarUrl = user.AvatarUrl,
                RoleName = "Lecturer",
                LecturerId = lecturer.LecturerId
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _repository.GetUserByAccountNameAsync(dto.AccountName);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Tên tài khoản hoặc mật khẩu không chính xác.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa.");
            }

            var roleName = RoleNameResolver.ResolvePrimaryRole(user);
            var roleNames = RoleNameResolver.GetRoleNames(user);
            int? studentId = user.Student?.StudentId;
            int? lecturerId = user.Lecturer?.LecturerId;

            var token = _jwtTokenHelper.GenerateToken(user, roleNames, studentId, lecturerId);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                AccountName = user.AccountName,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                AvatarUrl = user.AvatarUrl,
                RoleName = roleName,
                StudentId = studentId,
                LecturerId = lecturerId
            };
        }

        public async Task<CurrentUserResponseDto> GetCurrentUserAsync(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException();
            }

            var currentUser = await _repository.GetUserWithDetailsByIdAsync(userId);
            if (currentUser == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            return new CurrentUserResponseDto
            {
                UserId = currentUser.UserId,
                AccountName = currentUser.AccountName,
                FullName = currentUser.FullName,
                EmailAddress = currentUser.EmailAddress,
                PhoneNumber = currentUser.PhoneNumber,
                AvatarUrl = currentUser.AvatarUrl,
                RoleName = RoleNameResolver.ResolvePrimaryRole(currentUser),
                StudentInfo = currentUser.Student,
                LecturerInfo = currentUser.Lecturer
            };
        }

        public async Task<bool> ChangePasswordAsync(ChangePasswordDto dto, ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không tìm thấy thông tin tài khoản.");
            }

            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (currentUser == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, currentUser.PasswordHash))
            {
                throw new ArgumentException("Mật khẩu hiện tại không chính xác.");
            }

            if (dto.CurrentPassword == dto.NewPassword)
            {
                throw new ArgumentException("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            }

            ValidatePasswordComplexity(dto.NewPassword);

            currentUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<CurrentUserResponseDto> UpdateMyAvatarAsync(IFormFile avatar, ClaimsPrincipal user)
        {
            if (_avatarStorageService == null)
            {
                throw new InvalidOperationException("Avatar storage service is not configured.");
            }

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException();
            }

            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (currentUser == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            var oldBlobName = currentUser.AvatarBlobName;
            var upload = await _avatarStorageService.UploadAvatarAsync(avatar);

            currentUser.AvatarUrl = upload.AvatarUrl;
            currentUser.AvatarBlobName = upload.AvatarBlobName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch
            {
                await SafeDeleteAvatarAsync(upload.AvatarBlobName);
                throw;
            }

            if (!string.IsNullOrWhiteSpace(oldBlobName) && !string.Equals(oldBlobName, upload.AvatarBlobName, StringComparison.OrdinalIgnoreCase))
            {
                await SafeDeleteAvatarAsync(oldBlobName);
            }

            var refreshed = await _repository.GetUserWithDetailsByIdAsync(userId);
            if (refreshed == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            return new CurrentUserResponseDto
            {
                UserId = refreshed.UserId,
                AccountName = refreshed.AccountName,
                FullName = refreshed.FullName,
                EmailAddress = refreshed.EmailAddress,
                PhoneNumber = refreshed.PhoneNumber,
                AvatarUrl = refreshed.AvatarUrl,
                RoleName = RoleNameResolver.ResolvePrimaryRole(refreshed),
                StudentInfo = refreshed.Student,
                LecturerInfo = refreshed.Lecturer
            };
        }

        private static void ValidatePasswordComplexity(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
            {
                throw new ArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");
            }

            if (!password.Any(char.IsLetter) || !password.Any(char.IsDigit))
            {
                throw new ArgumentException("Mật khẩu phải chứa ít nhất một chữ cái và một chữ số.");
            }
        }

        private async Task SafeDeleteAvatarAsync(string? blobName)
        {
            if (_avatarStorageService == null || string.IsNullOrWhiteSpace(blobName))
            {
                return;
            }

            try
            {
                await _avatarStorageService.DeleteAvatarAsync(blobName);
            }
            catch
            {
                // Best effort cleanup.
            }
        }
    }
}
