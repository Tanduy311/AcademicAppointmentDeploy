using AcademicAppoinment.DTOs.Notification;
using AcademicAppoinment.Helpers.Exceptions;
using AcademicAppoinment.Models;
using AcademicAppoinment.Repositories;
using AcademicAppoinment.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AcademicAppoinment.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IAppRepository _repository;
        private readonly AppDbContext _context;

        public NotificationService(IAppRepository repository, AppDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<IReadOnlyList<NotificationResponseDto>> GetMyNotificationsAsync(ClaimsPrincipal user)
        {
            var userId = GetUserIdFromClaims(user);
            var notifications = await _repository.GetNotificationsByUserIdAsync(userId);
            return notifications.Select(ToNotificationResponseDto).ToList();
        }

        public async Task<int> GetUnreadCountAsync(ClaimsPrincipal user)
        {
            var userId = GetUserIdFromClaims(user);
            return await _repository.GetUnreadNotificationCountByUserIdAsync(userId);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, ClaimsPrincipal user)
        {
            var userId = GetUserIdFromClaims(user);
            var notification = await _repository.GetNotificationByIdAsync(notificationId);

            if (notification == null)
            {
                throw new KeyNotFoundException("Không tìm thấy thông báo.");
            }

            if (notification.UserId != userId)
            {
                throw new ForbiddenAccessException("Bạn không có quyền thao tác trên thông báo này.");
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _repository.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(ClaimsPrincipal user)
        {
            var userId = GetUserIdFromClaims(user);
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (unreadNotifications.Count > 0)
            {
                foreach (var n in unreadNotifications)
                {
                    n.IsRead = true;
                }
                await _repository.SaveChangesAsync();
            }

            return true;
        }

        private static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không tìm thấy thông tin tài khoản đăng nhập.");
            }
            return userId;
        }

        private static NotificationResponseDto ToNotificationResponseDto(Notification n)
        {
            return new NotificationResponseDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                StudentId = n.StudentId,
                LecturerId = n.LecturerId,
                AppointmentId = n.AppointmentId,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            };
        }
    }
}
