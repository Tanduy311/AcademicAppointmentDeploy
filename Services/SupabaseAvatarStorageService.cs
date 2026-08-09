using AcademicAppoinment.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace AcademicAppoinment.Services
{
    public class SupabaseAvatarStorageService : IAvatarStorageService
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        private const long MaxAvatarSizeBytes = 2 * 1024 * 1024;

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public SupabaseAvatarStorageService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<AvatarUploadResult> UploadAvatarAsync(IFormFile file, CancellationToken cancellationToken = default)
        {
            ValidateFile(file);

            var projectUrl = GetRequiredSetting("Supabase:ProjectUrl").TrimEnd('/');
            var bucket = GetRequiredSetting("Supabase:AvatarBucket");
            var blobName = $"avatars/avatar-{Guid.NewGuid():N}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
            var uploadUrl = $"{projectUrl}/storage/v1/object/{Uri.EscapeDataString(bucket)}/{EncodeObjectPath(blobName)}";

            using var stream = file.OpenReadStream();
            using var request = CreateRequest(HttpMethod.Post, uploadUrl);
            request.Headers.TryAddWithoutValidation("x-upsert", "false");
            request.Content = new StreamContent(stream);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType);

            var client = _httpClientFactory.CreateClient();
            using var response = await client.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var publicUrl = $"{projectUrl}/storage/v1/object/public/{Uri.EscapeDataString(bucket)}/{EncodeObjectPath(blobName)}";
            return new AvatarUploadResult(publicUrl, blobName);
        }

        public async Task DeleteAvatarAsync(string? blobName, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(blobName))
            {
                return;
            }

            var projectUrl = GetRequiredSetting("Supabase:ProjectUrl").TrimEnd('/');
            var bucket = GetRequiredSetting("Supabase:AvatarBucket");
            var deleteUrl = $"{projectUrl}/storage/v1/object/{Uri.EscapeDataString(bucket)}";
            var payload = JsonSerializer.Serialize(new { prefixes = new[] { blobName } });

            using var request = CreateRequest(HttpMethod.Delete, deleteUrl);
            request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            using var response = await client.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
        }

        private HttpRequestMessage CreateRequest(HttpMethod method, string url)
        {
            var serviceRoleKey = GetRequiredSetting("Supabase:ServiceRoleKey");
            var request = new HttpRequestMessage(method, url);
            request.Headers.TryAddWithoutValidation("apikey", serviceRoleKey);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
            return request;
        }

        private static void ValidateFile(IFormFile file)
        {
            if (file == null || file.Length <= 0)
            {
                throw new ArgumentException("Vui lòng chọn file ảnh.");
            }

            if (file.Length > MaxAvatarSizeBytes)
            {
                throw new ArgumentException("Ảnh đại diện không được vượt quá 2MB.");
            }

            var ext = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(ext))
            {
                throw new ArgumentException("Chỉ hỗ trợ file JPG, JPEG, PNG hoặc WEBP.");
            }

            var contentType = file.ContentType?.ToLowerInvariant() ?? "";
            if (contentType is not ("image/jpeg" or "image/png" or "image/webp"))
            {
                throw new ArgumentException("File upload phải là ảnh hợp lệ.");
            }
        }

        private string GetRequiredSetting(string key)
        {
            var value = _configuration[key];
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException($"{key} is not configured.");
            }

            return value;
        }

        private static string EncodeObjectPath(string objectPath)
        {
            return string.Join('/', objectPath.Split('/', StringSplitOptions.RemoveEmptyEntries).Select(Uri.EscapeDataString));
        }
    }
}
