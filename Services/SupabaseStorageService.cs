using AcademicAppoinment.Services.Interfaces;
using System.Net.Http.Headers;

namespace AcademicAppoinment.Services
{
    public class SupabaseStorageService : ISupabaseStorageService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public SupabaseStorageService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string? folder = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File upload không hợp lệ.");
            }

            var projectUrl = _configuration["Supabase:ProjectUrl"]?.TrimEnd('/');
            var serviceKey = _configuration["Supabase:ServiceRoleKey"];
            var bucketName = _configuration["Supabase:AvatarBucket"] ?? _configuration["Supabase:Bucket"] ?? "store-academic-appointment";

            if (string.IsNullOrEmpty(projectUrl) || string.IsNullOrEmpty(serviceKey))
            {
                throw new InvalidOperationException("Chưa cấu hình Supabase:ProjectUrl hoặc Supabase:ServiceRoleKey trong appsettings.json.");
            }

            var fileExtension = Path.GetExtension(file.FileName);
            var safeFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = string.IsNullOrWhiteSpace(folder) ? safeFileName : $"{folder.Trim('/')}/{safeFileName}";

            var uploadUrl = $"{projectUrl}/storage/v1/object/{bucketName}/{filePath}";

            using var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceKey);
            request.Headers.Add("apiKey", serviceKey);
            request.Headers.Add("x-upsert", "true");

            using var stream = file.OpenReadStream();
            using var content = new StreamContent(stream);
            content.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrEmpty(file.ContentType) ? "application/octet-stream" : file.ContentType);
            request.Content = content;

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Lỗi khi tải file lên Supabase Storage: {response.StatusCode} - {errorMsg}");
            }

            // Trả về public URL của file trên Supabase Storage
            return $"{projectUrl}/storage/v1/object/public/{bucketName}/{filePath}";
        }
    }
}
