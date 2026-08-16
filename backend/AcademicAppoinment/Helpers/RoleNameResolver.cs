using AcademicAppoinment.Models;

namespace AcademicAppoinment.Helpers
{
    public static class RoleNameResolver
    {
        private static readonly string[] Priority = ["Admin", "Lecturer", "Student"];

        public static string ResolvePrimaryRole(User user)
        {
            var roleNames = GetRoleNames(user);
            return Priority.FirstOrDefault(priority =>
                    roleNames.Any(role => string.Equals(role, priority, StringComparison.OrdinalIgnoreCase)))
                ?? roleNames.FirstOrDefault()
                ?? "User";
        }

        public static IReadOnlyList<string> GetRoleNames(User user)
        {
            return user.UserRoles
                .Select(ur => ur.Role?.RoleName)
                .Where(roleName => !string.IsNullOrWhiteSpace(roleName))
                .Select(roleName => roleName!)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}
