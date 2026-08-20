using AcademicAppoinment.Configurations;
using AcademicAppoinment.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddAcademicAppointmentServices(builder.Configuration);

var app = builder.Build();

app.UseCors("Frontend");
app.UseMiddleware<AcademicAppoinment.Middlewares.GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

try
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var adminExists = context.Users.Any(u => u.AccountName == "admin");
    if (!adminExists)
    {
        context.Users.Add(new User
        {
            AccountName = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FullName = "System Admin",
            EmailAddress = "admin@test.local",
            PhoneNumber = "0000000000",
            IsActive = true,
            CreatedAt = DateTime.Now,
            UserRoles =
            [
                new UserRole
                {
                    RoleId = 1
                }
            ]
        });

        context.SaveChanges();
    }
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Không thể tự động khởi tạo tài khoản admin lúc khởi động.");
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
