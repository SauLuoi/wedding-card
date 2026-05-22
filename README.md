# Luxurious Cinematic Wedding Invitation Website

Trang thiệp cưới online phong cách cinematic/luxury cao cấp tích hợp trang quản trị Admin đầy đủ tính năng. Dự án được phát triển bằng Next.js App Router (NodeJS backend + React frontend), cơ sở dữ liệu SQLite (mặc định cho local) hoặc MySQL, và hiệu ứng chuyển động mượt mà bằng Framer Motion.

---

## Tính Năng Nổi Bật

### 1. Trang Thiệp Cưới Public (`/thiep/hoang-minh-thao-vy`)
- **Cinematic Opening Screen**: Màn hình mở thiệp sang trọng, tự động phát nhạc nền khi nhấn nút "Mở Thiệp".
- **Hero Banner**: Parallax cover toàn màn hình với tên cô dâu, chú rể và đồng hồ đếm ngược (Countdown) thời gian thực.
- **Love Story Timeline**: Trục thời gian kể lại hành trình yêu thương với hiệu ứng cuộn mượt mà.
- **Wedding Ceremony Info**: Chi tiết ngày giờ, địa điểm cưới tích hợp bản đồ Google Maps và nút chỉ đường thông minh.
- **Interactive Album Grid**: Bộ sưu tập hình ảnh dạng Masonry đẹp mắt hỗ trợ chế độ phóng to Lightbox vuốt chuyển tiếp.
- **RSVP & Wishes Wall**: Form xác nhận tham dự cưới bắn pháo hoa confetti ăn mừng và hiển thị lời chúc động của khách mời.
- **Music Floating Controller**: Nút đĩa nhạc quay góc màn hình để điều khiển bật/tắt nhạc.

### 2. Trang Quản Trị Admin (`/admin`)
- **Dashboard Thống Kê**: Thống kê số lượt xem thiệp, tổng số RSVP đăng ký, tổng số người tham gia thực tế, số lời chúc.
- **Cấu hình Thông tin & Giao diện**: Cập nhật thông tin cô dâu chú rể, tiểu sử, ngày cưới, nhạc nền, mã đường dẫn (slug), mã nhúng Google Map, mã màu chủ đạo thiệp cưới và cài đặt SEO.
- **Quản lý Album & Câu chuyện**: CRUD các cột mốc tình yêu và tải ảnh lên Album bằng công cụ upload cục bộ (local storage), sắp xếp thứ tự hiển thị nhanh chóng.
- **Moderator RSVP & Lời chúc**: Danh sách khách tham dự, lời chúc gửi kèm, duyệt/ẩn lời chúc công khai, xuất file báo cáo Excel/CSV hỗ trợ hiển thị tiếng Việt hoàn hảo.

---

## Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Cài đặt môi trường
Đảm bảo bạn đã cài đặt NodeJS (phiên bản v18 trở lên).

Yêu cầu người dùng đặt thư mục này làm không gian làm việc hoạt động (active workspace) trong IDE:
`/Users/sotatek/.gemini/antigravity-ide/scratch/wedding-invitation`

Cài đặt các thư viện liên quan:
```bash
npm install
```

### 2. Chạy cơ sở dữ liệu và seed dữ liệu mẫu
Hệ thống đã được cấu hình mặc định chạy **SQLite** (file `dev.db` tự động tạo ở thư mục `prisma`). 

Chạy lệnh để đồng bộ cấu hình bảng và nạp tài khoản Admin cùng nội dung demo:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Khởi chạy Server Phát Triển
Chạy dự án ở chế độ local:
```bash
npm run dev
```
Truy cập các địa chỉ sau trên trình duyệt:
- **Thiệp cưới mẫu**: [http://localhost:3000/thiep/hoang-minh-thao-vy](http://localhost:3000/thiep/hoang-minh-thao-vy)
- **Hệ thống Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

#### Tài khoản Admin đăng nhập mặc định:
- **Tên đăng nhập**: `admin`
- **Mật khẩu**: `admin123`

---

## Cấu Hình Chuyển Sang Sử Dụng MySQL

Nếu bạn muốn chuyển sang dùng cơ sở dữ liệu **MySQL**, làm theo các bước sau:

1. Mở file `prisma/schema.prisma`, chỉnh sửa `provider` của `datasource db` thành `"mysql"`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

2. Mở file cấu hình biến môi trường `.env` và thay đổi đường dẫn kết nối `DATABASE_URL` theo cú pháp MySQL:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/wedding_invitation"
   ```

3. Tiến hành tạo lại bảng và chạy seed dữ liệu trên MySQL:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

---

## Cấu Trúc Mã Nguồn

```text
wedding-invitation/
├── prisma/
│   ├── schema.prisma   # Định nghĩa cấu trúc các bảng DB (SQLite/MySQL)
│   ├── seed.ts         # Script tạo tài khoản admin và nội dung mẫu
│   └── dev.db          # File SQLite local database
├── src/
│   ├── app/
│   │   ├── admin/      # Giao diện Trang Quản trị Admin (Layout, Config, Story, Gallery, RSVP)
│   │   ├── api/        # RESTful API Backend (Auth, Config, Gallery, RSVP, Wishes, Views)
│   │   ├── thiep/      # Giao diện Thiệp cưới Online (Cinematic, Cover, Story, RSVP, Wishes)
│   │   ├── layout.tsx  # Cấu hình Font chữ sang trọng (Playfair Display & Inter)
│   │   └── globals.css # CSS Custom, Glassmorphism, Marquee, Sparkle animations
│   └── lib/
│       ├── prisma.ts   # Database client singleton helper
│       ├── auth.ts     # Utilities ký & kiểm tra mã JWT token
│       └── api-auth.ts # Helper kiểm tra quyền truy cập API
```
