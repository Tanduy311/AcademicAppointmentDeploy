# 🎓 Academic Appointment Portal (Hệ Thống Đặt Lịch Hẹn Tư Vấn Học Thuật)

> Hệ thống quản lý và đặt lịch hẹn tư vấn học thuật trực tuyến giữa **Sinh viên (Students)**, **Giảng viên (Lecturers)** và **Quản trị viên (Administrators)**. Dự án được xây dựng theo kiến trúc Client-Server hiện đại, hiệu năng cao, bảo mật và chuẩn hoá quy trình nghiệp vụ đào tạo.

---

## 🌐 Liên Kết Trực Tuyến & Repository (Live Links)

- 🔗 **GitHub Repository (Main Source):** [https://github.com/Tanduy311/AcademicAppointment](https://github.com/Tanduy311/AcademicAppointment)
- 📦 **GitHub Repository (Deployment & CI/CD):** [https://github.com/Tanduy311/AcademicAppointmentDeploy](https://github.com/Tanduy311/AcademicAppointmentDeploy)
- 🚀 **Live Frontend Web Application (Vercel):** [https://academic-appointment-deploy.vercel.app](https://academic-appointment-deploy.vercel.app)
- ⚙️ **Production Backend API & Swagger UI (MonsterASP):** [http://academic-api.runasp.net/swagger](http://academic-api.runasp.net/swagger)

---

## 📌 Mục Lục

- [1. Giới Thiệu Chung](#1-giới-thiệu-chung)
- [2. Tính Năng Nổi Bật](#2-tính-năng-nổi-bật)
- [3. Kiến Trúc & Công Nghệ Sử Dụng](#3-kiến-trúc--công-nghệ-sử-dụng)
- [4. Cấu Trúc Thư Mục](#4-cấu-trúc-thư-mục)
- [5. Quy Tắc Nghiệp Vụ Chính (Business Rules)](#5-quy-tắc-nghiệp-vụ-chính-business-rules)
- [6. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)](#6-hướng-dẫn-cài-đặt--chạy-cục-bộ-local-setup)
- [7. Kiểm Thử Tự Động (Automated Testing)](#7-kiểm-thử-tự-động-automated-testing)
- [8. Triển Khai (Deployment)](#8-triển-khai-deployment)
- [9. Tài Khoản Demo & Trải Nghiệm](#9-tài-khoản-demo--trải-nghiệm)
- [10. Đóng Góp & Tài Liệu Tham Khảo](#10-đóng-góp--tài-liệu-tham-khảo)

---

## 1. Giới Thiệu Chung

Trong môi trường đại học hiện đại, nhu cầu trao đổi chuyên môn, giải đáp thắc mắc đồ án, hướng dẫn nghiên cứu khoa học giữa sinh viên và giảng viên là vô cùng lớn. Tuy nhiên, việc liên hệ thủ công qua email hay tin nhắn cá nhân thường dẫn đến tình trạng:
- Trùng lịch hẹn (double-booking).
- Khó theo dõi trạng thái cuộc hẹn và lịch rảnh của giảng viên.
- Thiếu kênh trao đổi tài liệu học thuật trước buổi gặp mặt.
- Quản trị viên khó thống kê và kiểm soát chất lượng hoạt động tư vấn.

**Academic Appointment Portal** ra đời nhằm số hóa toàn diện quy trình đặt lịch hẹn, cung cấp giao diện trực quan theo tuần/tháng, thông báo tức thời, phân quyền chặt chẽ và lưu trữ tài liệu an toàn trên đám mây.

---

## 2. Tính Năng Nổi Bật

### 👨‍🎓 Phân Hệ Sinh Viên (Student)
- **Tra cứu & Tìm kiếm Giảng viên:** Xem danh sách giảng viên theo khoa/bộ môn, học hàm/học vị, lĩnh vực chuyên môn và lịch rảnh.
- **Đặt lịch hẹn thông minh:** Chọn slot rảnh, nhập lý do hẹn và đính kèm tài liệu học thuật (PDF, Word, zip,...).
- **Lịch biểu cá nhân (Calendar View):** Theo dõi lịch hẹn theo tuần trực quan với màu sắc trạng thái rõ ràng.
- **Quản lý cuộc hẹn:** Xem lịch sử, hủy lịch (kèm cảnh báo hủy sát giờ), theo dõi trạng thái (`Pending`, `Confirmed`, `Rejected`, `Completed`, `No-Show`).
- **Hồ sơ cá nhân & Đổi mật khẩu:** Cập nhật thông tin sinh viên, đổi ảnh đại diện (upload Cloud/Supabase) và đổi mật khẩu bảo mật.

### 👨‍🏫 Phân Hệ Giảng Viên (Lecturer)
- **Quản lý khung giờ rảnh (Availability Slots):** Tạo slot linh hoạt (Online/Offline, Link Google Meet/Zoom, phòng làm việc), sửa thông tin slot và tự động thông báo cho sinh viên liên quan.
- **Duyệt / Từ chối lịch hẹn:** Xem chi tiết lý do, tải tài liệu đính kèm của sinh viên trước khi quyết định phê duyệt.
- **Cập nhật kết quả buổi hẹn:** Đánh dấu `Completed` (Đã hoàn thành) hoặc `No-Show` (Sinh viên vắng mặt).
- **Lịch biểu & Thống kê:** Giao diện lịch tuần trực quan giúp giảng viên dễ dàng quản lý khối lượng công việc.

### 🛡️ Phân Hệ Quản Trị Viên (Admin)
- **Bảng điều khiển (Dashboard Analytics):** Thống kê tổng số người dùng, giảng viên, sinh viên, lịch hẹn và tỷ lệ hoàn thành.
- **Quản lý người dùng (User Management):** Kích hoạt/Khóa tài khoản, cấp quyền linh hoạt theo mô hình **RBAC (Role-Based Access Control)**.
- **Giám sát cuộc hẹn toàn hệ thống:** Theo dõi toàn bộ lịch hẹn trong trường học, lọc theo trạng thái và phân trang linh hoạt.
- **Bảo vệ Super Admin:** Chống thao tác khóa hoặc gỡ quyền tài khoản Admin duy nhất trong hệ thống.

### 🔔 Tiện Ích Chung
- **Hệ thống thông báo thời gian thực/nội bộ:** Tự động gửi thông báo khi có lịch hẹn mới, duyệt lịch, hủy lịch hoặc đổi thông tin slot; hỗ trợ tính năng "Đánh dấu tất cả đã đọc".
- **Hỗ trợ phân trang nâng cao (Pagination):** Hỗ trợ chuyển trang, chọn kích thước trang (Page Size) và nhảy nhanh đến trang bất kỳ (Jump To Page).

---

## 3. Kiến Trúc & Công Nghệ Sử Dụng

Dự án áp dụng mô hình phân lớp rõ ràng (**Layered Architecture**) kết hợp kiến trúc **RESTful API**:

```
+-------------------------------------------------------------+
|                      React Frontend                         |
|  (TypeScript + Vite + React Router + Context API + CSS)     |
+------------------------------+------------------------------+
                               |  HTTPS / RESTful APIs / JWT
                               v
+-------------------------------------------------------------+
|                   ASP.NET Core 8 Web API                    |
|  - Controllers, Services, Repositories, Middlewares         |
|  - BCrypt Hashing, JWT Authentication, EF Core ORM          |
+-------------------+--------------------+--------------------+
                    |                    |
                    v                    v
         +--------------------+  +--------------------+
         |   MS SQL Server    |  |  Supabase Storage  |
         | (Relational DB)    |  | (Avatar/Attachments|
         +--------------------+  +--------------------+
```

### 🛠️ Backend Stack
- **Framework:** .NET 8 (C#) / ASP.NET Core Web API
- **ORM / Data Access:** Entity Framework Core 8 (Code-First & Migrations)
- **Database:** Microsoft SQL Server
- **Bảo mật & Xác thực:** JWT (JSON Web Tokens), BCrypt.Net-Next (mã hóa mật khẩu)
- **Lưu trữ đám mây:** Supabase Storage (Bucket lưu ảnh đại diện & file tài liệu đính kèm)
- **Kiểm thử tự động:** xUnit, Moq, FluentAssertions, Microsoft.EntityFrameworkCore.InMemory
- **Tài liệu API:** Swagger / OpenAPI

### 🎨 Frontend Stack
- **Framework / Core:** React 18, TypeScript, Vite
- **Routing & State:** React Router DOM v6, Context API (`AuthContext`)
- **Styling:** Modern Pure CSS (Responsive Grid/Flexbox, CSS Variables, Theme Dark/Light UI)
- **Icons:** Custom SVG Icon Components (Lucide-inspired)

---

## 4. Cấu Trúc Thư Mục

```text
AcademicAppointment/
├── backend/
│   ├── AcademicAppoinment/             # Dự án chính ASP.NET Core Web API
│   │   ├── Controllers/               # API Controllers (Auth, Appointments, Slots, Admin,...)
│   │   ├── Models/                    # Entity Models (User, Role, UserRole, Student, Lecture,...)
│   │   ├── DTOs/                      # Data Transfer Objects cho Request/Response
│   │   ├── Services/                  # Business Logic Layer (Appointment, Auth, Slot, Admin,...)
│   │   ├── Repositories/              # Data Access Layer & Generic Repository
│   │   ├── Migrations/                # EF Core Database Migrations
│   │   ├── Helpers/ & Middlewares/    # JWT Token Helper, Role Resolver, Exception Handler
│   │   ├── appsettings.json           # Cấu hình kết nối DB, JWT, Supabase
│   │   └── Program.cs                 # Cấu hình DI, Middleware Pipeline & Swagger
│   └── tests/
│       └── AcademicAppoinment.Tests/  # Bộ kiểm thử Unit Tests tự động với xUnit
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable UI (AppShell, Pagination, WeeklyCalendar,...)
│   │   ├── context/                   # Global AuthContext & User state
│   │   ├── pages/                     # Màn hình theo Role (Student, Lecturer, Admin)
│   │   ├── services/                  # API Client, Axios/Fetch Interceptors & Endpoints
│   │   ├── styles/                    # Global Stylesheet & Responsive design
│   │   ├── types/                     # TypeScript Interfaces & API DTOs
│   │   ├── utils/                     # Format date/time, Badge status helpers
│   │   ├── App.tsx                    # Cấu hình định tuyến & Protected Routes
│   │   └── main.tsx                   # Điểm khởi chạy React App
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── report/                            # Tài liệu báo cáo, sơ đồ ERD, Use Case & Screenshots
├── .gitignore
├── AcademicAppoinment.slnx            # Solution File
├── BUSINESS_RULES_IMPLEMENTATION.md   # Báo cáo chi tiết các quy tắc nghiệp vụ
├── Dockerfile                         # Containerization cho Backend
├── README.md                          # Tài liệu giới thiệu & hướng dẫn dự án
└── USER_ROLES_CHANGELOG.md            # Tài liệu chuyển đổi mô hình UserRoles (RBAC)
```

---

## 5. Quy Tắc Nghiệp Vụ Chính (Business Rules)

Hệ thống đã triển khai và kiểm thử nghiêm ngặt các quy tắc nghiệp vụ sau:

1. **Chống trùng lịch (Anti-Double Booking):** Sinh viên không được phép đặt lịch hẹn trùng giờ với một lịch hẹn khác của chính mình đang chờ duyệt hoặc đã xác nhận.
2. **Thời gian đặt lịch tối thiểu (Lead Time 2 giờ):** Sinh viên chỉ được đặt slot trước giờ bắt đầu tối thiểu 2 tiếng; ngăn chặn đặt slot cận kề hoặc quá khứ.
3. **Hạn ngạch chờ duyệt (Quota 3 Pending Appointments):** Mỗi sinh viên tại một thời điểm chỉ có tối đa 3 cuộc hẹn ở trạng thái `Pending` để tránh spam giữ chỗ.
4. **Quy chuẩn khung giờ rảnh:** Thời lượng mỗi slot từ 15 đến 180 phút, mở trong khoảng 06:00 - 22:00, không quá 60 ngày tới và phải diễn ra trong cùng một ngày.
5. **Cảnh báo hủy sát giờ (< 2 giờ):** Tự động gắn nhãn `[Hủy sát giờ]` vào lý do khi sinh viên hủy lịch cận giờ hẹn để giảng viên kịp nắm thông tin.
6. **Bảo toàn dữ liệu (Soft Delete):** Xóa slot rảnh theo cơ chế Soft Delete (`IsDeleted = true`) giúp bảo lưu toàn vẹn lịch sử tư vấn.
7. **Bảo mật tệp đính kèm:** Whitelist nghiêm ngặt các phần mở rộng cho phép (`.pdf`, `.docx`, `.png`, `.zip`,...) và chặn tuyệt đối các tệp thực thi nguy hiểm.
8. **Độ phức tạp mật khẩu:** Tối thiểu 6 ký tự, bắt buộc bao gồm cả chữ cái và chữ số.

*(Xem chi tiết tại [BUSINESS_RULES_IMPLEMENTATION.md](./BUSINESS_RULES_IMPLEMENTATION.md))*

---

## 6. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### Yêu cầu tiên quyết
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (v18+) & npm](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/) (hoặc LocalDB)

---

### Bước 1: Cấu hình & Chạy Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend/AcademicAppoinment
   ```
2. Cập nhật chuỗi kết nối Database tại `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DBConnection": "Server=localhost;Database=AcademicConsultationDB;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
3. Áp dụng Database Migrations:
   ```bash
   dotnet ef database update
   ```
4. Khởi chạy Backend API:
   ```bash
   dotnet run
   ```
   *Backend sẽ chạy tại `https://localhost:7245` hoặc `http://localhost:5000` (Swagger UI: `/swagger`).*

---

### Bước 2: Cài đặt & Chạy Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường (tùy chọn) tại `.env`:
   ```env
   VITE_API_BASE_URL=https://localhost:7245
   ```
4. Khởi chạy máy chủ phát triển Vite:
   ```bash
   npm run dev
   ```
   *Truy cập ứng dụng tại `http://localhost:5173`.*

---

## 7. Kiểm Thử Tự Động (Automated Testing)

Dự án bao gồm bộ Unit Test tự động cho toàn bộ các Service xử lý nghiệp vụ quan trọng.

Để chạy toàn bộ bài test:
```bash
dotnet test backend/tests/AcademicAppoinment.Tests/AcademicAppoinment.Tests.csproj
```

**Kết quả kiểm thử:**
- **22/22 Test Cases Passed (100%)** bao gồm các bài test chống trùng lịch, kiểm tra quota, kiểm tra thời lượng slot, RBAC Admin và bảo mật xác thực.

---

## 8. Triển Khai (Deployment)

- **Backend:** Hỗ trợ đóng gói Dockerfile (`docker build -t academic-appointment-api .`) hoặc xuất bản thông qua lệnh:
  ```bash
  dotnet publish backend/AcademicAppoinment/AcademicAppoinment.csproj -c Release -o ./publish
  ```
  *(Dự án tích hợp sẵn GitHub Actions workflow tự động deploy lên Hosting/Cloud).*
- **Frontend:** Tối ưu hóa build tĩnh để deploy lên Vercel, Netlify hoặc Nginx:
  ```bash
  cd frontend
  npm run build
  ```

---

## 9. Tài Khoản Demo & Trải Nghiệm

Hệ thống có sẵn các tài khoản mẫu với đầy đủ 3 vai trò để trải nghiệm trên môi trường trực tiếp hoặc cục bộ:

| Vai Trò (Role) | Tên Đăng Nhập (Username) | Mật Khẩu Mặc Định | Mô Tả Chức Năng Chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `Password123@` | Quản lý người dùng, phân quyền RBAC, giám sát toàn bộ lịch hẹn hệ thống. |
| **Giảng viên (Lecturer)** | `lecturer_01` | `Password123@` | Quản lý khung giờ rảnh, duyệt/từ chối lịch hẹn, xem file đính kèm, cập nhật Completed/No-Show. |
| **Sinh viên (Student)** | `student_01` | `Password123@` | Tra cứu giảng viên, đặt lịch kèm file đính kèm, xem lịch tuần, quản lý lịch hẹn. |

---

## 10. Đóng Góp & Tài Liệu Tham Khảo

- **Báo cáo nghiệp vụ:** `BUSINESS_RULES_IMPLEMENTATION.md`
- **Lịch sử cập nhật RBAC:** `USER_ROLES_CHANGELOG.md`
- **Thư mục báo cáo & ERD:** `report/`

---
*Phát triển và duy trì bởi Đội ngũ Phát triển Hệ Thống Academic Appointment Portal.*
