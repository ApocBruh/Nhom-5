/**
 * ============================================================
 * FILE: app.js
 * MỤC ĐÍCH: File chính của ứng dụng Node.js/Express
 * MÔ TẢ: File này chứa:
 * 1. Cấu hình Express server
 * 2. Thiết lập EJS templating engine
 * 3. Cấu hình serving static files (CSS, JS, images)
 * 4. Import kết nối database
 * 5. Định nghĩa routes của ứng dụng
 * 6. Start server trên port được chỉ định
 * ============================================================
 */

// PHẦN 1: IMPORT DEPENDENCIES (Nhập các thư viện cần thiết)
// ============================================================

// express: Framework web Node.js cho routing, middleware, HTTP utilities
const express = require('express');

// path: Module Node.js tích hợp để làm việc với đường dẫn file/folder
// path.join(__dirname, 'views') = ghép đúng đường dẫn cho các hệ điều hành
const path = require('path');

// dotenv: Thư viện để tải biến môi trường từ file .env
// Giúp bảo mật thông tin nhạy cảm (API keys, passwords, v.v.)
require('dotenv').config();

// ============================================================
// PHẦN 2: IMPORT DATABASE CONNECTION
// ============================================================

// pool: Connection pool từ config/database.js
// Pool này sẽ được sử dụng ở các routes để query database
// Lợi ích: Tái sử dụng connections, quản lý tập trung, performance tốt
// Ghi chú: File này sẽ tự động test kết nối khi app.js được load
const pool = require('./config/database');

// PHẦN 3: KHỞI TẠO ỨNG DỤNG EXPRESS
// ============================================================

// Tạo instance Express app - đây là object chính để cấu hình server
const app = express();

// Đặt port từ biến môi trường PORT (nếu có), nếu không thì dùng port 3000
// Ví dụ: process.env.PORT = 5000 (từ .env hoặc environment variable)
// Nếu không có, port mặc định = 3000
const port = process.env.PORT || 3000;

// PHẦN 4: CẤU HÌNH EJS TEMPLATING ENGINE
// ============================================================

// app.set('view engine', 'ejs')
// Báo cho Express rằng chúng ta sử dụng EJS làm template engine
// EJS cho phép nhúng JavaScript vào HTML (ví dụ: <%= variable %>)
app.set('view engine', 'ejs');

// app.set('views', path.join(__dirname, 'views'))
// Chỉ định thư mục chứa tất cả view files (template HTML)
// __dirname = đường dẫn tuyệt đối của thư mục hiện tại (nơi có app.js)
// path.join(...) = ghép đường dẫn đúng cho mọi hệ điều hành
// Ví dụ: C:\nhom-5\views hoặc /home/user/nhom-5/views
app.set('views', path.join(__dirname, 'views'));

// PHẦN 5: CẤU HÌNH STATIC FILE SERVING
// ============================================================

// app.use(express.static(...))
// Middleware để phục vụ các file tĩnh (CSS, JS, images, v.v.)
// Mọi file trong thư mục public sẽ được phục vụ trực tiếp từ URL root
// Ví dụ:
//   - /public/css/style.css → truy cập bằng GET /css/style.css
//   - /public/js/main.js → truy cập bằng GET /js/main.js
//   - /public/img/logo.png → truy cập bằng GET /img/logo.png
// Kiến thức: File tĩnh không cần route middleware, được phục vụ tự động
app.use(express.static(path.join(__dirname, 'public')));

// PHẦN 6: ĐỊNH NGHĨA ROUTES
// ============================================================

// Route cho trang chủ (GET /)
// Khi client truy cập http://localhost:3000/ hoặc http://localhost:3000
// Express sẽ chạy callback function này
// req: Object chứa thông tin request từ client (query params, headers, v.v.)
// res: Object để gửi response về client (render view, send JSON, redirect, v.v.)
app.get('/', (req, res) => {
    // BƯỚC 1: Giả lập dữ liệu Website Config
    // ============================================================
    // Trong production (khi có database):
    // const siteInfo = await db.getSiteInfo();
    // hoặc: const siteInfo = await db.query("SELECT * FROM website_config");
    // 
    // Hiện tại dùng mockSiteInfo (mock data) để test
    // Tất cả giá trị đều có tiền tố "Nhom 5" vì đây là Do An của Nhom 5
    const mockSiteInfo = {
        // Địa chỉ trang web
        address: "123 Đường Công Nghệ, Quận 1, TP.HCM",
        // Email liên hệ chính
        email: "contact@newsfeed.com",
        // URL Facebook page
        facebook: "https://facebook.com/nhom5newsfeed",
        // URL YouTube channel
        youtube: "https://youtube.com/nhom5newsfeed",
        // Text bản quyền hiển thị ở footer
        copyright: "© 2023 Nhom 5 - Do An Node.js. All rights reserved."
    };

    // BƯỚC 2: Render view (index.ejs) và truyền dữ liệu
    // ============================================================
    // res.render('index', {...})
    // Tìm file views/index.ejs, thay thế EJS variables bằng giá trị dưới,
    // rồi gửi HTML hoàn chỉnh về client
    //
    // Object chứa dữ liệu truyền vào:
    // - title: Tên trang (sẽ hiển thị ở <title> tag)
    // - siteInfo: Object chứa toàn bộ thông tin website (lấy được ở footer, header)
    res.render('index', { 
        title: 'Trang chủ - Newsfeed',  // Page title cho <title> tag
        siteInfo: mockSiteInfo          // Website config data
    });
});

// PHẦN 7: START SERVER
// ============================================================

// app.listen(port, callback)
// Khởi động Express server, lắng nghe requests trên port được chỉ định
// Khi server khởi động thành công, chạy callback function (in thông báo)
// 
// Kiến thức:
// - Server sẽ chạy cho đến khi bạn dừng nó (Ctrl+C trong terminal)
// - Browser truy cập bằng cách gõ URL: http://localhost:3000
app.listen(port, () => {
    console.log('\n============================================================');
    console.log('🚀 SERVER STARTED');
    console.log('============================================================');
    console.log(`Server đang chạy tại: http://localhost:${port}`);
    console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
    console.log('============================================================\n');
    console.log('💡 Mở trình duyệt và truy cập: http://localhost:3000');
    console.log('💡 Bấm Ctrl+C để dừng server\n');
});
