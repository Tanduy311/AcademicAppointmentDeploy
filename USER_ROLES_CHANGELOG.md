# Thay Doi: Them Bang UserRoles

Ngay thuc hien: 2026-08-16

## Muc Tieu

Chuyen mo hinh phan quyen tu quan he truc tiep:

```text
Roles 1 - N Users
Users.RoleId
```

sang mo hinh RBAC co bang trung gian:

```text
Users 1 - N UserRoles N - 1 Roles
```

Thay doi nay giup ERD dung hon voi yeu cau co bang noi giua `Users` va `Roles`, dong thoi mo duong cho viec mot user co the co nhieu role trong tuong lai.

## Thay Doi Database

Da them entity moi:

```text
UserRoles
- UserId
- RoleId
```

Khoa chinh:

```text
PK(UserId, RoleId)
```

Khoa ngoai:

```text
UserRoles.UserId -> Users.UserId
UserRoles.RoleId -> Roles.RoleId
```

Da tao migration:

```text
20260816065130_AddUserRoles
```

Migration nay:

1. Tao bang `UserRoles`.
2. Copy du lieu role hien co tu `Users.RoleId` sang `UserRoles`.
3. Xoa foreign key cu `FK_Users_Roles_RoleId`.
4. Xoa index cu `IX_Users_RoleId`.
5. Xoa cot `RoleId` khoi bang `Users`.

## Thay Doi Backend

Da them file:

```text
backend/AcademicAppoinment/Models/UserRole.cs
backend/AcademicAppoinment/Helpers/RoleNameResolver.cs
```

Da cap nhat cac file chinh:

```text
backend/AcademicAppoinment/Models/User.cs
backend/AcademicAppoinment/Models/Role.cs
backend/AcademicAppoinment/Models/AppDbContext.cs
backend/AcademicAppoinment/Repositories/IAppRepository.cs
backend/AcademicAppoinment/Repositories/AppRepository.cs
backend/AcademicAppoinment/Services/AuthService.cs
backend/AcademicAppoinment/Services/AdminService.cs
backend/AcademicAppoinment/Helpers/JwtTokenHelper.cs
backend/AcademicAppoinment/Program.cs
```

Noi dung chinh:

- `User` khong con `RoleId` va `Role`.
- `User` co collection `UserRoles`.
- `Role` co collection `UserRoles`.
- `AppDbContext` khai bao `DbSet<UserRole>`.
- Repository load role bang `.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)`.
- Register Student/Lecturer tao record trong `UserRoles`.
- Login doc role tu `UserRoles`.
- JWT add role claim tu danh sach role.
- API response van giu `roleName` de frontend hien tai khong bi vo.
- AdminService cap nhat role thong qua bang `UserRoles`.

## Giu Tuong Thich Frontend

Frontend hien van dung:

```text
roleName
```

Vi vay backend van tra ve `roleName` nhu cu. Trong truong hop user co nhieu role, `RoleNameResolver` chon role chinh theo thu tu uu tien:

```text
Admin > Lecturer > Student
```

Dieu nay giup dashboard va protected route hien tai tiep tuc hoat dong.

## Cap Nhat Admin Role Management

Da bo sung kha nang quan ly role cho user o trang admin:

- Hien thi tat ca role hien co cua moi user.
- Doi vai tro cua user bang endpoint `PUT /api/admin/users/{userId}/role`.
- Them role moi cho user bang endpoint `POST /api/admin/users/{userId}/roles`.
- Go role khoi user bang endpoint `DELETE /api/admin/users/{userId}/roles/{roleId}`.
- Khong cho go role cuoi cung cua user.
- Khong cho admin tu sua role cua chinh minh.

Frontend da cap nhat:

```text
frontend/src/pages/AdminUsersPage.tsx
frontend/src/services/api.ts
frontend/src/types/api.ts
```

Backend da cap nhat them:

```text
backend/AcademicAppoinment/Controllers/AdminController.cs
backend/AcademicAppoinment/Services/AdminService.cs
backend/AcademicAppoinment/Services/Interfaces/IAdminService.cs
backend/AcademicAppoinment/DTOs/Admin/AdminUserListItemDto.cs
backend/AcademicAppoinment/DTOs/Admin/AdminUserDetailDto.cs
```

## Luu Y Nghiep Vu

`Student` va `Lecturer` van la ho so nghiep vu rieng, khong chi la role.

Vi vay:

- User co role `Student` nen co record trong bang `Students`.
- User co role `Lecturer` nen co record trong bang `Lecturers`.
- Neu gan role `Lecturer` cho user chua co ho so giang vien, backend van chan de tranh du lieu sai.

## Kiem Tra Da Thuc Hien

Da chay backend tests:

```powershell
dotnet test backend\tests\AcademicAppoinment.Tests\AcademicAppoinment.Tests.csproj
```

Ket qua:

```text
Passed: 13
Failed: 0
Skipped: 0
```

Da thu generate SQL migration bang EF Core:

```powershell
dotnet ef migrations script --project backend\AcademicAppoinment\AcademicAppoinment.csproj --startup-project backend\AcademicAppoinment\AcademicAppoinment.csproj --idempotent
```

Ket qua: build thanh cong va script co cac buoc tao `UserRoles`, copy data, drop `Users.RoleId`.

## Ghi Chu Deploy

Khi deploy len production, GitHub Actions se chay EF migration. Sau migration, database production se co bang `UserRoles` va cot `Users.RoleId` se bi xoa.

Can dam bao production database da backup truoc khi apply migration neu du lieu quan trong.
