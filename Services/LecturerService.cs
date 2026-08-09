using AcademicAppoinment.DTOs.Lecturers;
using AcademicAppoinment.DTOs.Slot;
using AcademicAppoinment.Models;
using AcademicAppoinment.Repositories;
using AcademicAppoinment.Services.Interfaces;

namespace AcademicAppoinment.Services
{
    public class LecturerService : ILecturerService
    {
        private readonly IAppRepository _repository;

        public LecturerService(IAppRepository repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<LecturerListItemDto>> GetLecturersAsync()
        {
            var lecturers = await _repository.GetLecturersAsync();
            var now = DateTime.Now;

            return lecturers.Select(l => new LecturerListItemDto
            {
                LecturerId = l.LecturerId,
                LecturerCode = l.LecturerCode,
                FullName = l.User?.FullName ?? "",
                EmailAddress = l.User?.EmailAddress ?? "",
                PhoneNumber = l.User?.PhoneNumber,
                Department = l.Department,
                Specialization = l.Specialization,
                OfficeLocation = l.OfficeLocation,
                ConsultationDescription = l.ConsultationDescription,
                UpcomingSlotCount = l.AvailabilitySlots.Count(s => s.IsAvailable && s.StartTime > now)
            }).ToList();
        }

        public async Task<LecturerDetailDto> GetLecturerByIdAsync(int lecturerId)
        {
            var lecturer = await _repository.GetLecturerByIdWithDetailsAsync(lecturerId);
            if (lecturer == null)
            {
                throw new KeyNotFoundException("Không tìm thấy giảng viên.");
            }

            var upcomingSlots = lecturer.AvailabilitySlots
                .Where(s => s.IsAvailable && s.StartTime > DateTime.Now)
                .OrderBy(s => s.StartTime)
                .Select(ToSlotResponseDto)
                .ToList();

            return new LecturerDetailDto
            {
                LecturerId = lecturer.LecturerId,
                LecturerCode = lecturer.LecturerCode,
                FullName = lecturer.User?.FullName ?? "",
                EmailAddress = lecturer.User?.EmailAddress ?? "",
                PhoneNumber = lecturer.User?.PhoneNumber,
                Department = lecturer.Department,
                Specialization = lecturer.Specialization,
                OfficeLocation = lecturer.OfficeLocation,
                ConsultationDescription = lecturer.ConsultationDescription,
                UpcomingSlots = upcomingSlots
            };
        }

        public async Task<LecturerDetailDto> GetMyProfileAsync(System.Security.Claims.ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không tìm thấy thông tin đăng nhập.");
            }

            var lecturer = await _repository.GetLecturerWithUserByUserIdAsync(userId);
            if (lecturer == null)
            {
                throw new KeyNotFoundException("Không tìm thấy thông tin giảng viên.");
            }

            return await GetLecturerByIdAsync(lecturer.LecturerId);
        }

        public async Task<LecturerDetailDto> UpdateMyProfileAsync(UpdateLecturerProfileDto dto, System.Security.Claims.ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không tìm thấy thông tin đăng nhập.");
            }

            var lecturer = await _repository.GetLecturerWithUserByUserIdAsync(userId);
            if (lecturer == null)
            {
                throw new KeyNotFoundException("Không tìm thấy thông tin giảng viên.");
            }

            if (lecturer.User != null)
            {
                lecturer.User.FullName = dto.FullName;
                lecturer.User.PhoneNumber = dto.PhoneNumber;
            }

            lecturer.Department = dto.Department;
            lecturer.Specialization = dto.Specialization;
            lecturer.OfficeLocation = dto.OfficeLocation;
            lecturer.ConsultationDescription = dto.ConsultationDescription;

            await _repository.SaveChangesAsync();
            return await GetLecturerByIdAsync(lecturer.LecturerId);
        }

        private static SlotResponseDto ToSlotResponseDto(AvailabilitySlot slot)
        {
            return new SlotResponseDto
            {
                AvailabilitySlotId = slot.AvailabilitySlotId,
                LecturerId = slot.LecturerId,
                LecturerName = slot.Lecturer?.User?.FullName ?? "",
                Department = slot.Lecturer?.Department,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                MeetingType = slot.MeetingType,
                LocationOrLink = slot.LocationOrLink,
                IsAvailable = slot.IsAvailable,
                CreatedAt = slot.CreatedAt
            };
        }
    }
}
