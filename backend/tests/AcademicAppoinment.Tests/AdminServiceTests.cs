using AcademicAppoinment.Helpers.Exceptions;
using AcademicAppoinment.Models;
using AcademicAppoinment.Repositories;
using AcademicAppoinment.Services;
using AcademicAppoinment.Tests.TestHelpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Security.Claims;

namespace AcademicAppoinment.Tests
{
    [TestClass]
    public class AdminServiceTests
    {
        [TestMethod]
        public async Task SetUserActiveAsync_Throws_WhenAdminTargetsSelf()
        {
            using var context = TestDbFactory.CreateContext(nameof(SetUserActiveAsync_Throws_WhenAdminTargetsSelf));
            SeedRoles(context);
            SeedAdminUser(context);

            var service = new AdminService(new AppRepository(context), context);
            var principal = TestDbFactory.CreatePrincipal(new Claim(ClaimTypes.NameIdentifier, "1"));

            await Assert.ThrowsExceptionAsync<ForbiddenAccessException>(() =>
                service.SetUserActiveAsync(1, false, principal));
        }

        [TestMethod]
        public async Task SetUserActiveAsync_Throws_WhenDeactivatingOnlyActiveAdmin()
        {
            using var context = TestDbFactory.CreateContext(nameof(SetUserActiveAsync_Throws_WhenDeactivatingOnlyActiveAdmin));
            SeedRoles(context);
            SeedAdminUser(context);
            // Admin user 2 is the one performing the action, targeting Admin user 1
            context.Users.Add(new User
            {
                UserId = 3,
                AccountName = "admin_caller",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "Admin Caller",
                EmailAddress = "caller@test.local",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UserRoles = [new UserRole { RoleId = 2 }] // not an admin
            });
            context.SaveChanges();

            var service = new AdminService(new AppRepository(context), context);
            var principal = TestDbFactory.CreatePrincipal(new Claim(ClaimTypes.NameIdentifier, "3"));

            // User 1 is the only admin
            await Assert.ThrowsExceptionAsync<ArgumentException>(() =>
                service.SetUserActiveAsync(1, false, principal));
        }

        [TestMethod]
        public async Task SetUserRoleAsync_Throws_WhenTargetHasNoLecturerProfile()
        {
            using var context = TestDbFactory.CreateContext(nameof(SetUserRoleAsync_Throws_WhenTargetHasNoLecturerProfile));
            SeedRoles(context);
            SeedAdminUser(context);
            context.Users.Add(new User
            {
                UserId = 2,
                AccountName = "plain_user",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                FullName = "Plain User",
                EmailAddress = "plain@test.local",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UserRoles = [new UserRole { RoleId = 1 }]
            });
            context.SaveChanges();

            var service = new AdminService(new AppRepository(context), context);
            var principal = TestDbFactory.CreatePrincipal(new Claim(ClaimTypes.NameIdentifier, "1"));

            await Assert.ThrowsExceptionAsync<ArgumentException>(() =>
                service.SetUserRoleAsync(2, 3, principal));
        }

        [TestMethod]
        public async Task AddUserRoleAsync_AddsRole_WhenRoleIsValid()
        {
            using var context = TestDbFactory.CreateContext(nameof(AddUserRoleAsync_AddsRole_WhenRoleIsValid));
            SeedRoles(context);
            SeedAdminUser(context);
            SeedStudentUser(context);

            var service = new AdminService(new AppRepository(context), context);
            var principal = TestDbFactory.CreatePrincipal(new Claim(ClaimTypes.NameIdentifier, "1"));

            await service.AddUserRoleAsync(2, 1, principal);

            Assert.IsTrue(context.UserRoles.Any(ur => ur.UserId == 2 && ur.RoleId == 1));
            Assert.IsTrue(context.UserRoles.Any(ur => ur.UserId == 2 && ur.RoleId == 2));
        }

        [TestMethod]
        public async Task RemoveUserRoleAsync_RemovesRole_WhenUserHasMultipleRoles()
        {
            using var context = TestDbFactory.CreateContext(nameof(RemoveUserRoleAsync_RemovesRole_WhenUserHasMultipleRoles));
            SeedRoles(context);
            SeedAdminUser(context);
            // Add another admin so user 1 is not the only admin if role 1 removed
            context.Users.Add(new User
            {
                UserId = 3,
                AccountName = "second_admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "Second Admin",
                EmailAddress = "admin2@test.local",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UserRoles = [new UserRole { RoleId = 1 }]
            });
            SeedStudentUser(context);
            context.UserRoles.Add(new UserRole { UserId = 2, RoleId = 1 });
            context.SaveChanges();

            var service = new AdminService(new AppRepository(context), context);
            var principal = TestDbFactory.CreatePrincipal(new Claim(ClaimTypes.NameIdentifier, "1"));

            await service.RemoveUserRoleAsync(2, 1, principal);

            Assert.IsFalse(context.UserRoles.Any(ur => ur.UserId == 2 && ur.RoleId == 1));
            Assert.IsTrue(context.UserRoles.Any(ur => ur.UserId == 2 && ur.RoleId == 2));
        }

        private static void SeedRoles(AppDbContext context)
        {
            context.Roles.AddRange(
                new Role { RoleId = 1, RoleName = "Admin" },
                new Role { RoleId = 2, RoleName = "Student" },
                new Role { RoleId = 3, RoleName = "Lecturer" });
            context.SaveChanges();
        }

        private static void SeedAdminUser(AppDbContext context)
        {
            context.Users.Add(new User
            {
                UserId = 1,
                AccountName = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "System Admin",
                EmailAddress = "admin@test.local",
                PhoneNumber = "0900000000",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UserRoles = [new UserRole { RoleId = 1 }]
            });
            context.SaveChanges();
        }

        private static void SeedStudentUser(AppDbContext context)
        {
            context.Users.Add(new User
            {
                UserId = 2,
                AccountName = "student",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                FullName = "Student User",
                EmailAddress = "student@test.local",
                PhoneNumber = "0900000002",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UserRoles = [new UserRole { RoleId = 2 }]
            });

            context.Students.Add(new Student
            {
                StudentId = 2,
                UserId = 2,
                StudentCode = "SV002",
                Major = "IT"
            });

            context.SaveChanges();
        }
    }
}
