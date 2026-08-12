---
marp: true
theme: default
paginate: true
header: "Academic Appointment System"
footer: "ASP.NET Core Web API - React TypeScript - SQL Server"
style: |
  :root {
    font-family: "Segoe UI", "Inter", system-ui, sans-serif;
    color: #edf6ff;
    background: #08111f;
  }
  section {
    background:
      linear-gradient(135deg, rgba(20, 184, 166, 0.12), transparent 34%),
      linear-gradient(315deg, rgba(59, 130, 246, 0.14), transparent 38%),
      #08111f;
    color: #edf6ff;
    padding: 46px 56px;
    font-size: 27px;
  }
  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    background:
      linear-gradient(135deg, rgba(34, 211, 238, 0.22), transparent 32%),
      linear-gradient(315deg, rgba(245, 158, 11, 0.18), transparent 36%),
      #07101d;
  }
  h1 {
    color: #7dd3fc;
    font-size: 2.2em;
    letter-spacing: 0;
    margin-bottom: 0.35em;
    text-shadow: 0 2px 18px rgba(14, 165, 233, 0.28);
  }
  h2 {
    color: #dbeafe;
    font-size: 1.45em;
    margin-bottom: 0.55em;
    border-bottom: 2px solid rgba(125, 211, 252, 0.32);
    padding-bottom: 0.25em;
  }
  h3 {
    color: #5eead4;
    margin-bottom: 0.3em;
  }
  strong {
    color: #fbbf24;
  }
  em {
    color: #86efac;
    font-style: normal;
  }
  a {
    color: #38bdf8;
  }
  ul, ol {
    line-height: 1.38;
  }
  li {
    margin: 0.22em 0;
  }
  li::marker {
    color: #2dd4bf;
  }
  code {
    background: rgba(15, 23, 42, 0.86);
    color: #bae6fd;
    border: 1px solid rgba(56, 189, 248, 0.22);
    border-radius: 5px;
    padding: 2px 6px;
    font-size: 0.86em;
  }
  pre {
    background: rgba(7, 16, 29, 0.9);
    border: 1px solid rgba(45, 212, 191, 0.24);
    border-radius: 8px;
    padding: 18px;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.7);
  }
  table {
    width: 100%;
    font-size: 0.72em;
    border-collapse: collapse;
    background: rgba(8, 17, 31, 0.72);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }
  th {
    background: linear-gradient(90deg, #0f766e, #2563eb);
    color: #f8fafc;
  }
  th, td {
    border: 1px solid rgba(148, 163, 184, 0.22);
    padding: 8px 10px;
  }
  tr:nth-child(even) td {
    background: rgba(15, 23, 42, 0.48);
  }
  blockquote {
    margin: 0.8em 0;
    padding: 0.55em 0.9em;
    background: rgba(15, 23, 42, 0.82);
    border-left: 5px solid #f59e0b;
    color: #e0f2fe;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  .cols2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .card {
    background:
      linear-gradient(180deg, rgba(20, 184, 166, 0.1), transparent),
      rgba(15, 23, 42, 0.78);
    border: 1px solid rgba(125, 211, 252, 0.2);
    border-radius: 8px;
    padding: 16px 18px;
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22);
  }
  .small {
    font-size: 0.78em;
  }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# Academic Appointment System

## Hệ thống đặt lịch tư vấn học thuật giữa sinh viên và giảng viên

**Sinh viên thực hiện:** Nguyễn Văn Sinh  
**MSSV:** 2331200098  
**Lớp:** CNTT-K65

---

# Nội Dung Trình Bày

1. Bài toán và mục tiêu
2. Chức năng theo vai trò người dùng
3. Luồng đặt lịch học thuật
4. Kiến trúc hệ thống
5. Thiết kế cơ sở dữ liệu
6. Backend, frontend và bảo mật
7. Deployment, khó khăn và hướng phát triển

---

# 1. Bài Toán

Trong môi trường học thuật, việc đặt lịch gặp giảng viên thường diễn ra qua tin nhắn, email hoặc trao đổi trực tiếp.

**Các vấn đề chính:**

- Sinh viên không biết chính xác khung giờ rảnh của giảng viên.
- Giảng viên khó kiểm soát nhiều yêu cầu đặt lịch cùng lúc.
- Dễ trùng lịch, quên phản hồi hoặc mất lịch sử xử lý.
- Không có hệ thống tập trung để admin quản lý tài khoản và vai trò.

> Mục tiêu của project là chuẩn hóa quy trình đặt lịch thành một workflow rõ trạng thái, rõ quyền hạn và có thể triển khai thực tế.

---

# 2. Giải Pháp Đề Xuất

**Academic Appointment System** là web application hỗ trợ:

- Giảng viên tạo các khung giờ tư vấn khả dụng.
- Sinh viên tìm giảng viên và đặt lịch theo slot có sẵn.
- Giảng viên xác nhận, từ chối hoặc hủy lịch hẹn.
- Sinh viên theo dõi trạng thái lịch hẹn và nhận thông báo.
- Admin quản lý người dùng, vai trò và trạng thái tài khoản.

**Thông điệp chính:**  
Hệ thống biến quy trình đặt lịch thủ công thành một quy trình có kiểm soát bằng phần mềm.

---

# 3. Vai Trò Người Dùng

<div class="cols">
<div class="card">

### Student

- Đăng ký, đăng nhập
- Xem danh sách giảng viên
- Xem slot còn trống
- Tạo lịch hẹn
- Hủy lịch hẹn
- Nhận thông báo

</div>
<div class="card">

### Lecturer

- Đăng ký, đăng nhập
- Quản lý hồ sơ
- Tạo slot tư vấn
- Xem yêu cầu đặt lịch
- Confirm / Reject / Cancel
- Phản hồi cho sinh viên

</div>
<div class="card">

### Admin

- Xem danh sách user
- Xem chi tiết user
- Quản lý role
- Khóa / mở tài khoản
- Điều phối quyền truy cập

</div>
</div>

---

# 4. Chức Năng Chính

| Nhóm chức năng | Mô tả |
|---|---|
| Authentication | Đăng ký, đăng nhập, lấy thông tin user hiện tại |
| Authorization | Phân quyền theo `Admin`, `Student`, `Lecturer` |
| Appointment | Tạo, xem, cập nhật trạng thái, hủy lịch hẹn |
| Availability Slot | Giảng viên tạo slot, sinh viên xem slot khả dụng |
| Notification | Tạo thông báo khi lịch hẹn thay đổi |
| Profile & Avatar | Cập nhật hồ sơ và upload avatar qua Supabase |
| Admin | Quản lý user, role và trạng thái hoạt động |

---

# 5. Luồng Đặt Lịch

```text
Lecturer tạo slot rảnh
        ↓
Student xem lecturer detail
        ↓
Student chọn slot và gửi yêu cầu
        ↓
Appointment = Pending
        ↓
Lecturer Confirmed / Rejected / Cancelled
        ↓
Student nhận notification và theo dõi trạng thái
```

**Các trạng thái chính:**

- `Pending`: lịch mới tạo, chờ giảng viên xử lý.
- `Confirmed`: giảng viên đã xác nhận.
- `Rejected`: giảng viên từ chối.
- `Cancelled`: lịch bị hủy bởi sinh viên hoặc giảng viên.

---

# 6. Kiểm Soát Trùng Lịch

Project xử lý trùng slot ở cả **business logic** và **database constraint**.

**Trong service layer:**

- Kiểm tra slot tồn tại và chưa bị xóa mềm.
- Kiểm tra `IsAvailable == true`.
- Kiểm tra slot chưa có appointment `Pending` hoặc `Confirmed`.
- Khi đặt lịch thành công, set `IsAvailable = false`.

**Trong database:**

```csharp
HasIndex(a => a.AvailabilitySlotId)
  .IsUnique()
  .HasFilter("[Status] IN ('Pending', 'Confirmed')");
```

> Một slot không thể có nhiều lịch đang chờ hoặc đã xác nhận.

---

# 7. Kiến Trúc Tổng Thể

```text
+-------------------------------+
| React 18 + TypeScript + Vite  |
| Frontend                      |
+---------------+---------------+
                |
                | HTTP / JSON / JWT Bearer
                v
+-------------------------------+
| ASP.NET Core 8 Web API        |
| Controllers • Services • DTOs |
+-----------+-------------------+
            |
            | EF Core 8
            v
+-------------------------------+
| SQL Server on MonsterASP      |
+-------------------------------+

Additional service:
Supabase Storage for avatar/file upload
```

---

# 8. Công Nghệ Sử Dụng

<div class="cols2">
<div class="card">

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- CSS custom

</div>
<div class="card">

### Backend

- ASP.NET Core 8 Web API
- Entity Framework Core 8
- SQL Server provider
- JWT Bearer Authentication
- BCrypt password hashing
- Swagger/OpenAPI

</div>
</div>

<div class="card">

### Infrastructure

GitHub Actions, MonsterASP, SQL Server remote access, Supabase Storage, FTP deployment.

</div>

---

# 9. Thiết Kế Database

Hệ thống gồm 7 bảng chính:

| Entity | Vai trò |
|---|---|
| `Users` | Tài khoản, mật khẩu hash, email, avatar, trạng thái hoạt động |
| `Roles` | Vai trò: Admin, Student, Lecturer |
| `Students` | Hồ sơ sinh viên, liên kết 1-1 với user |
| `Lecturers` | Hồ sơ giảng viên, liên kết 1-1 với user |
| `AvailabilitySlots` | Khung giờ rảnh của giảng viên |
| `Appointments` | Lịch hẹn giữa sinh viên, giảng viên và slot |
| `Notifications` | Thông báo nội bộ cho người dùng |

---

# 10. Quan Hệ Dữ Liệu Chính

```text
Role 1 ─── N User

User 1 ─── 1 Student
User 1 ─── 1 Lecturer

Lecturer 1 ─── N AvailabilitySlot
Lecturer 1 ─── N Appointment
Student 1 ─── N Appointment

AvailabilitySlot 1 ─── N Appointment

User 1 ─── N Notification
Appointment 1 ─── N Notification
```

**Các ràng buộc quan trọng:**

- `AccountName`, `EmailAddress` là unique.
- `StudentCode`, `LecturerCode` là unique.
- Slot đang `Pending` hoặc `Confirmed` không được đặt trùng.

---

# 11. Backend Design

Backend được tổ chức theo hướng tách trách nhiệm:

```text
Controllers  → nhận HTTP request, kiểm tra route/role
Services     → xử lý nghiệp vụ và validation
Repositories → truy xuất dữ liệu bằng EF Core
DTOs         → chuẩn hóa request/response model
Models       → entity map với SQL Server
Migrations   → quản lý thay đổi schema database
```

**Lợi ích:**

- Controller không chứa quá nhiều nghiệp vụ.
- Service dễ test unit.
- DTO giúp không expose trực tiếp entity database.
- EF Core Migration giúp deploy schema có kiểm soát.

---

# 12. REST API Tiêu Biểu

| Method | Endpoint | Role | Mục đích |
|---|---|---|---|
| `POST` | `/api/auth/register-student` | Public | Đăng ký sinh viên |
| `POST` | `/api/auth/register-lecturer` | Public | Đăng ký giảng viên |
| `POST` | `/api/auth/login` | Public | Đăng nhập và nhận JWT |
| `GET` | `/api/lecturers` | Public | Xem danh sách giảng viên |
| `POST` | `/api/availabilityslots` | Lecturer | Tạo slot rảnh |
| `POST` | `/api/appointments` | Student | Đặt lịch hẹn |
| `PUT` | `/api/appointments/{id}/status` | Lecturer | Cập nhật trạng thái |
| `GET` | `/api/notifications` | Authorized | Xem thông báo |
| `GET` | `/api/admin/users` | Admin | Quản lý user |

---

# 13. Authentication & Authorization

```text
User login
    ↓
Backend verify password bằng BCrypt
    ↓
Backend tạo JWT token
    ↓
Frontend gửi Authorization: Bearer <token>
    ↓
Backend kiểm tra token và role trước khi xử lý API
```

**Ví dụ phân quyền:**

- `Student` mới được tạo appointment.
- `Lecturer` mới được tạo slot và duyệt lịch.
- `Admin` mới được quản lý user và role.

> Bảo mật không chỉ nằm ở frontend route, mà được enforce tại backend API.

---

# 14. Frontend Design

Frontend được xây dựng bằng React + TypeScript, chia theo các page và component.

**Các nhóm màn hình chính:**

- Auth: Login, Register Student, Register Lecturer
- Student: profile, lecturer list/detail, appointments
- Lecturer: slot management, appointment requests
- Admin: users, roles
- Common: dashboard, notification, protected route, app shell

**Điểm triển khai:**

- API client tách riêng logic gọi backend.
- Protected route bảo vệ màn hình theo trạng thái login.
- TypeScript type giúp giảm lỗi dữ liệu request/response.

---

# 15. Supabase Storage

Project dùng Supabase Storage cho upload avatar/file qua backend.

```text
Frontend gửi multipart file
        ↓
ASP.NET Core API nhận IFormFile
        ↓
SupabaseStorageService upload qua REST API
        ↓
Backend trả về public URL
        ↓
URL được lưu hoặc dùng trong profile
```

**Điểm kiểm soát:**

- Giới hạn file size 10 MB.
- Sinh tên file bằng `Guid` để tránh trùng tên.
- Service role key được đọc từ configuration.

---

# 16. CI/CD Và Deployment

Backend deploy tự động qua GitHub Actions:

```text
Push vào branch main
        ↓
Setup .NET 8 SDK
        ↓
Restore dependencies
        ↓
Install dotnet-ef
        ↓
Test TCP connection tới SQL Server
        ↓
Apply EF Core migrations
        ↓
Publish ASP.NET Core app
        ↓
Inject production connection string
        ↓
FTP deploy lên MonsterASP
```

**Production config:** connection string được lưu trong GitHub Secret `DB_CONNECTION_STRING`.

---

# 17. Khó Khăn Khi Triển Khai

**1. SQL Server remote access**

- GitHub Actions chạy migration từ runner bên ngoài.
- SQL Server trên MonsterASP cần bật remote access cho port `1433`.
- Connection string production phải dùng host public, không dùng `localhost` hoặc `data source=.`

**2. Secret management**

- Không nên hard-code connection string production.
- GitHub Secret dùng cho CI/CD.
- Hosting config dùng cho runtime backend.

**3. Nested Git repository**

- Thư mục `AcademicAppointmentDeploy` từng bị Git nhận như submodule thiếu `.gitmodules`.
- Điều này gây warning ở post-job cleanup của GitHub Actions.

---

# 18. Kết Quả Đạt Được

- Xây dựng được workflow đặt lịch giữa sinh viên và giảng viên.
- Có đăng ký, đăng nhập, JWT và phân quyền theo role.
- Có quản lý slot, appointment, notification và admin user.
- Database có ràng buộc chống trùng lịch.
- Backend có cấu trúc controller/service/repository rõ ràng.
- Frontend tách page, component và API client.
- Có pipeline deploy backend lên MonsterASP.

---

# 19. Hạn Chế Hiện Tại

- Notification hiện là dạng trong hệ thống, chưa real-time.
- Chưa có email reminder hoặc calendar integration.
- CI/CD chưa chạy toàn bộ unit test trước deploy.
- FTP deployment vẫn phụ thuộc hosting truyền thống.
- Secret trong local config cần được quản lý kỹ khi public repository.

> Những hạn chế này không ảnh hưởng core workflow, nhưng là hướng mở rộng tốt cho phiên bản sau.

---

# 20. Hướng Phát Triển

1. Tích hợp email reminder khi lịch hẹn được xác nhận.
2. Đồng bộ Google Calendar hoặc Outlook Calendar.
3. Real-time notification bằng SignalR.
4. Bộ lọc nâng cao cho lecturer theo khoa, chuyên ngành, slot rảnh.
5. Audit log cho thao tác admin và thay đổi trạng thái appointment.
6. Chạy automated tests trong GitHub Actions trước khi deploy.
7. Docker hóa backend để deployment ổn định hơn.

---

# Demo Flow Đề Xuất

```text
1. Login với Student
2. Xem danh sách giảng viên
3. Chọn giảng viên và slot còn trống
4. Tạo appointment
5. Login với Lecturer
6. Xem request mới
7. Confirm hoặc Reject appointment
8. Login lại Student
9. Kiểm tra status và notification
10. Login Admin để xem quản lý user/role
```

**Trọng tâm demo:** Student đặt lịch → Lecturer xử lý → Student nhận trạng thái.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Kết Luận

Academic Appointment System giải quyết bài toán đặt lịch tư vấn học thuật bằng một hệ thống web có phân quyền, workflow rõ trạng thái, database constraint và deployment thực tế.

**Core value:** giảm thao tác thủ công, tránh trùng lịch và tập trung hóa quá trình quản lý appointment.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Cảm Ơn Thầy Cô Đã Lắng Nghe

## Q&A

**Project:** Academic Appointment System  
**Backend:** ASP.NET Core Web API  
**Frontend:** React + TypeScript
