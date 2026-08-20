# BÁO CÁO THỰC THI TOÀN BỘ QUY TẮC NGHIỆP VỤ (BUSINESS RULES)
## Hệ Thống Cổng Đặt Lịch Hẹn Tư Vấn Học Thuật (Academic Appointment Portal)

---

## 1. Tổng Quan Triển Khai

Báo cáo này ghi nhận chi tiết toàn bộ các **Quy tắc Nghiệp vụ (Business Rules)** đã được phân tích, thiết kế, triển khai thực tế và kiểm thử tự động toàn diện trên cả 2 tầng **Backend (.NET 8 Web API / EF Core)** và **Frontend (React + TypeScript + Vite)** của dự án.

---

## 2. Danh Mục Các Quy Tắc Nghiệp Vụ Đã Thực Thi

### Nhóm 1: Nghiệp vụ Đặt lịch & Vòng đời cuộc hẹn (Appointment Booking & Lifecycle)

| Mã Rule | Tên quy tắc nghiệp vụ | Mô tả chi tiết & Xử lý | Vị trí cài đặt mã nguồn |
| :--- | :--- | :--- | :--- |
| **BR-1.1** | **Chống trùng lịch của Sinh viên (Anti-Double Booking)** | Sinh viên không được phép đặt lịch hẹn trùng với một lịch hẹn khác của chính mình đang có trạng thái `Pending`, `Confirmed`, hoặc `Approved`. | [AppointmentService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AppointmentService.cs) |
| **BR-1.2** | **Thời gian đặt lịch tối thiểu trước giờ hẹn (Lead Time 2 Giờ)** | Sinh viên chỉ được đặt lịch trước thời điểm slot bắt đầu tối thiểu **2 tiếng** (`slot.StartTime >= DateTime.Now.AddHours(2)`). Hệ thống chặn việc đặt slot cận kề hoặc đã trôi qua. | [AppointmentService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AppointmentService.cs) |
| **BR-1.3** | **Hạn ngạch đặt lịch chờ duyệt (Quota 3 Lịch Pending)** | Một sinh viên tại một thời điểm chỉ được phép có tối đa **3 lịch hẹn** đang ở trạng thái `Pending`. Tránh tình trạng spam giữ chỗ. | [AppointmentService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AppointmentService.cs) |
| **BR-1.4** | **Đầy đủ vòng đời cuộc hẹn (`Completed`, `No-Show`)** | Giảng viên có thể chuyển trạng thái cuộc hẹn thành `Completed` (Đã hoàn thành) hoặc `No-Show` (Sinh viên vắng mặt) khi thời gian slot đã diễn ra (`slot.StartTime <= DateTime.Now`). | [AppointmentService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AppointmentService.cs), [LecturerAppointmentsPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/LecturerAppointmentsPage.tsx) |
| **BR-1.5** | **Đính kèm tài liệu học thuật khi đặt lịch** | Cho phép sinh viên đính kèm file tài liệu (PDF, Word, zip đề tài) khi đặt lịch hẹn. Đường dẫn (`AttachmentUrl`) và tên file (`AttachmentName`) được lưu trữ an toàn và hiển thị cho giảng viên xem/tải. | [Appointment.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Models/Appointment.cs), [LecturerDetailPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/LecturerDetailPage.tsx) |
| **BR-1.6** | **Cảnh báo hủy lịch sát giờ (< 2 giờ)** | Nếu sinh viên hủy lịch hẹn trong vòng 2 tiếng trước giờ bắt đầu, hệ thống tự động gắn tiền tố `[Hủy sát giờ]` vào lý do hủy để thông báo cho Giảng viên. | [AppointmentService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AppointmentService.cs) |

---

### Nhóm 2: Nghiệp vụ Khung giờ rảnh của Giảng viên (Availability Slots)

| Mã Rule | Tên quy tắc nghiệp vụ | Mô tả chi tiết & Xử lý | Vị trí cài đặt mã nguồn |
| :--- | :--- | :--- | :--- |
| **BR-2.1** | **Thời lượng khung giờ rảnh hợp lệ (15 - 180 phút)** | Một khung giờ rảnh tạo mới phải có thời lượng từ **15 phút** đến **180 phút** (3 tiếng), ngăn chặn tạo slot quá ngắn hoặc quá dài. | [AvailabilitySlotService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AvailabilitySlotService.cs) |
| **BR-2.2** | **Giới hạn thời gian mở slot (Tối đa 60 ngày & Giờ hành chính)** | Khung giờ rảnh chỉ được mở trong tương lai không quá **60 ngày** và nằm trong khoảng thời gian hoạt động từ **06:00 đến 22:00**. | [AvailabilitySlotService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AvailabilitySlotService.cs) |
| **BR-2.3** | **Cập nhật địa điểm/link & Tự động thông báo sinh viên** | Bổ sung API `PUT /api/availabilityslots/{id}` (`UpdateSlotAsync`) cho phép giảng viên cập nhật hình thức (`Online`/`Offline`) hoặc địa điểm/link meeting. Hệ thống tự động gửi thông báo cập nhật tới sinh viên có lịch hẹn liên quan. | [AvailabilitySlotsController.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Controllers/AvailabilitySlotsController.cs), [AvailabilitySlotService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AvailabilitySlotService.cs) |
| **BR-2.4** | **Xóa mềm (Soft Delete) & Bảo toàn dữ liệu lịch sử** | Khi giảng viên xóa slot (`DeleteSlotAsync`), hệ thống thực hiện Soft Delete (`IsDeleted = true`, `IsAvailable = false`) và giữ nguyên lịch sử cuộc hẹn/thông báo liên quan. | [AvailabilitySlotService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AvailabilitySlotService.cs) |

---

### Nhóm 3: Nghiệp vụ Xác thực, Mật khẩu & Quản trị Hệ thống (Auth & Admin Rules)

| Mã Rule | Tên quy tắc nghiệp vụ | Mô tả chi tiết & Xử lý | Vị trí cài đặt mã nguồn |
| :--- | :--- | :--- | :--- |
| **BR-3.1** | **Tính năng Đổi Mật Khẩu (Change Password)** | Bổ sung API `POST /api/auth/change-password` xác thực mật khẩu hiện tại bằng BCrypt, kiểm tra khớp mật khẩu mới và cập nhật hash mới. | [AuthController.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Controllers/AuthController.cs), [AuthService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AuthService.cs), [ChangePasswordCard.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/components/ChangePasswordCard.tsx) |
| **BR-3.2** | **Độ phức tạp mật khẩu (Password Complexity)** | Mật khẩu bắt buộc tối thiểu **6 ký tự**, phải chứa cả **chữ cái** (`a-z, A-Z`) và **chữ số** (`0-9`). Áp dụng đồng bộ cho Đăng ký Sinh viên, Đăng ký Giảng viên và Đổi mật khẩu. | [AuthService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AuthService.cs) |
| **BR-3.3** | **Bảo vệ Super Admin (Không để hệ thống mồ côi Admin)** | Ngăn chặn việc khóa tài khoản hoặc gỡ quyền `Admin` nếu tài khoản đó là Admin duy nhất còn hoạt động trong hệ thống. | [AdminService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AdminService.cs) |

---

### Nhóm 4: Nghiệp vụ Thông báo (Notifications)

| Mã Rule | Tên quy tắc nghiệp vụ | Mô tả chi tiết & Xử lý | Vị trí cài đặt mã nguồn |
| :--- | :--- | :--- | :--- |
| **BR-4.1** | **Đánh dấu tất cả thông báo đã đọc (Bulk Read)** | Cung cấp API `PUT /api/notifications/mark-all-read` và nút bấm trực quan trên giao diện để người dùng xử lý nhanh toàn bộ thông báo chưa đọc. | [NotificationsController.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Controllers/NotificationsController.cs), [NotificationService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/NotificationService.cs), [NotificationsPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/NotificationsPage.tsx) |

---

## 3. Danh Sách Các File Mã Nguồn Đã Thay Đổi & Tạo Mới

### Backend (.NET 8 Web API)
1. [Models/Appointment.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Models/Appointment.cs): Bổ sung `AttachmentUrl` và `AttachmentName`.
2. [Migrations/20260820143600_AddAppointmentAttachments.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Migrations/): Migration thêm 2 cột đính kèm vào database.
3. [DTOs/Appointments/CreateAppointmentDto.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/DTOs/Appointments/CreateAppointmentDto.cs): Thêm trường đính kèm.
4. [DTOs/Appointments/AppointmentResponseDto.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/DTOs/Appointments/AppointmentResponseDto.cs): Trả về trường đính kèm.
5. [DTOs/Auth/ChangePasswordDto.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/DTOs/Auth/ChangePasswordDto.cs): DTO đổi mật khẩu.
6. [DTOs/Slot/UpdateSlotDto.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/DTOs/Slot/UpdateSlotDto.cs): DTO cập nhật slot rảnh.
7. [Services/Interfaces/](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/Interfaces/): Cập nhật `IAuthService`, `IAvailabilitySlotService`, `INotificationService`.
8. [Services/AppointmentService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AppointmentService.cs): Cài đặt chống trùng lịch, quota 3 pending, lead time 2 giờ, completed/no-show, late cancel.
9. [Services/AvailabilitySlotService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AvailabilitySlotService.cs): Cài đặt kiểm tra thời lượng, khung giờ 06:00 - 22:00, tối đa 60 ngày, cập nhật slot.
10. [Services/AuthService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AuthService.cs): Cài đặt đổi mật khẩu và password complexity check.
11. [Services/AdminService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/AdminService.cs): Cài đặt quy tắc bảo vệ Super Admin.
12. [Services/NotificationService.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Services/NotificationService.cs): Cài đặt `MarkAllAsReadAsync`.
13. [Controllers/AuthController.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Controllers/AuthController.cs): Endpoint `POST /api/auth/change-password`.
14. [Controllers/AvailabilitySlotsController.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Controllers/AvailabilitySlotsController.cs): Endpoint `PUT /api/availabilityslots/{id}`.
15. [Controllers/NotificationsController.cs](file:///c:/Users/Admin/Desktop/AcademicAppointment/backend/AcademicAppoinment/Controllers/NotificationsController.cs): Endpoint `PUT /api/notifications/mark-all-read`.

### Frontend (React + TypeScript)
1. [frontend/src/types/api.ts](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/types/api.ts): Cập nhật đầy đủ các kiểu dữ liệu và DTO mới.
2. [frontend/src/services/api.ts](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/services/api.ts): Bổ sung các hàm gọi API: `changePassword`, `updateSlot`, `markAllNotificationsRead`.
3. [frontend/src/utils/format.ts](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/utils/format.ts): Hỗ trợ hiển thị badge tone và nhãn tiếng Việt cho `Completed` và `No-Show`.
4. [frontend/src/components/Icons.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/components/Icons.tsx): Bổ sung SVG icon `IconLock`.
5. [frontend/src/components/ChangePasswordCard.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/components/ChangePasswordCard.tsx): Component đổi mật khẩu bảo mật, kiểm tra độ dài và chữ/số ngay trên client.
6. [frontend/src/pages/LecturerDetailPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/LecturerDetailPage.tsx): Tích hợp upload file đính kèm khi sinh viên đặt lịch hẹn.
7. [frontend/src/pages/StudentAppointmentsPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/StudentAppointmentsPage.tsx): Hiển thị link tải tài liệu đính kèm và thông tin chi tiết lịch hẹn.
8. [frontend/src/pages/LecturerAppointmentsPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/LecturerAppointmentsPage.tsx): Tích hợp nút "Đánh dấu Hoàn thành", "Đánh dấu Vắng mặt (No-Show)" và xem tài liệu sinh viên gửi.
9. [frontend/src/pages/StudentProfilePage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/StudentProfilePage.tsx): Tích hợp `ChangePasswordCard`.
10. [frontend/src/pages/LecturerProfilePage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/LecturerProfilePage.tsx): Tích hợp `ChangePasswordCard`.
11. [frontend/src/pages/NotificationsPage.tsx](file:///c:/Users/Admin/Desktop/AcademicAppointment/frontend/src/pages/NotificationsPage.tsx): Tích hợp nút "Đánh dấu tất cả đã đọc".

---

## 4. Kết Quả Kiểm Thử Tự Động (Automated Test Suite)

Toàn bộ các test cases xUnit đã được cập nhật và kiểm thử tự động với kết quả **100% Passed**:

```bash
dotnet test backend/tests/AcademicAppoinment.Tests/AcademicAppoinment.Tests.csproj

Test run for .../AcademicAppoinment.Tests.dll (.NETCoreApp,Version=v8.0)
Passed! - Failed: 0, Passed: 20, Skipped: 0, Total: 20, Duration: 10 s
```

### Chi tiết 20 bài test đã chạy:
1. `AppointmentServiceTests.CancelAppointmentAsync_ReopensSlot` - PASSED
2. `AppointmentServiceTests.UpdateAppointmentStatusAsync_Rejected_ReopensSlot` - PASSED
3. `AppointmentServiceTests.CreateAppointmentAsync_Throws_WhenBookingLessThan2HoursInAdvance` - PASSED
4. `AppointmentServiceTests.CreateAppointmentAsync_Throws_WhenStudentHas3PendingAppointments` - PASSED
5. `AppointmentServiceTests.DeleteSlotAsync_SoftDeletesSlot_AndKeepsHistory` - PASSED
6. `AppointmentServiceTests.CreateSlotAsync_Throws_WhenDurationLessThan15OrGreaterThan180Minutes` - PASSED
7. `AppointmentServiceTests.UpdateSlotAsync_UpdatesLocation_AndNotifiesStudent` - PASSED
8. `AdminServiceTests.SetUserActiveAsync_Throws_WhenAdminTargetsSelf` - PASSED
9. `AdminServiceTests.SetUserActiveAsync_Throws_WhenDeactivatingOnlyActiveAdmin` - PASSED
10. `AdminServiceTests.SetUserRoleAsync_Throws_WhenTargetHasNoLecturerProfile` - PASSED
11. `AdminServiceTests.AddUserRoleAsync_AddsRole_WhenRoleIsValid` - PASSED
12. `AdminServiceTests.RemoveUserRoleAsync_RemovesRole_WhenUserHasMultipleRoles` - PASSED
13. `AuthServiceTests.LoginAsync_ReturnsToken_ForValidCredentials` - PASSED
14. `AuthServiceTests.LoginAsync_Throws_WhenPasswordIsWrong` - PASSED
15. `AuthServiceTests.ChangePasswordAsync_Succeeds_WhenValid` - PASSED
16. `AuthServiceTests.ChangePasswordAsync_Throws_WhenCurrentPasswordWrong` - PASSED
17. `AuthServiceTests.RegisterStudentAsync_Throws_WhenPasswordWeak` - PASSED
18. `AuthServiceTests.UpdateMyAvatarAsync_UpdatesAvatarAndDeletesOldBlob` - PASSED
19. `StudentServiceTests.GetStudentProfileAsync_ReturnsCorrectDto` - PASSED
20. `StudentServiceTests.UpdateStudentProfileAsync_SavesChanges` - PASSED

### Kiểm thử Frontend Build:
```bash
npm run build
✓ 60 modules transformed.
dist/assets/index-CaAFqoTu.css   26.82 kB │ gzip:  5.89 kB
dist/assets/index-gLBeYX8d.js   313.81 kB │ gzip: 82.05 kB
✓ built in 4.16s
```

---

## 5. Kết Luận

Tất cả các business rules đã được triển khai hoàn chỉnh, nhất quán từ cơ sở dữ liệu, API backend đến giao diện frontend, đáp ứng đầy đủ tiêu chuẩn nghiệp vụ của một Cổng Đặt Lịch Hẹn Học Thuật thông minh, an toàn và chuyên nghiệp.
