/**
 * ============================================================
 * FILE: config/database.js
 * MỤC ĐÍCH: Quản lý kết nối MySQL database
 * CÁCH SỬ DỤNG: 
 *   const db = require('./config/database');
 *   const result = await db.query('SELECT * FROM articles');
 * ============================================================
 * 
 * Kiến thức:
 * 1. Connection Pool: Tạo nhiều connections được tái sử dụng
 *    - Thay vì tạo mới connection mỗi lần, pool sẽ reuse connections cũ
 *    - Giúp tăng performance, giảm overhead
 * 
 * 2. Promise-based MySQL2: Sử dụng async/await thay vì callbacks
 *    - Code sạch hơn, dễ đọc
 *    - Error handling dễ dàng hơn
 * 
 * 3. Environment Variables: Bảo mật thông tin connection
 *    - Host, user, password được load từ .env file
 *    - Tránh hardcode passwords trong code
 * 
 * Lợi ích của cách này:
 * - Tái sử dụng: Mỗi module khác chỉ cần require file này
 * - Quản lý tập trung: Tất cả config ở một chỗ
 * - Dễ bảo trì: Nếu cần đổi connection info, chỉ sửa .env
 * - Performance tốt: Sử dụng connection pool thay vì tạo mới mỗi lần
 */

// ============================================================
// BƯỚC 1: IMPORT DEPENDENCIES
// ============================================================

// mysql2/promise: Thư viện MySQL hỗ trợ Promise và async/await
// Hàm createPool() sẽ tạo connection pool
// Pool: Nhóm connections được reuse để tăng hiệu suất
const mysql = require('mysql2/promise');

// dotenv: Load biến môi trường từ file .env
// Đã gọi ở app.js nhưng gọi lại ở đây để chắc chắn
require('dotenv').config();

// ============================================================
// BƯỚC 2: TẠO CONNECTION POOL
// ============================================================

/**
 * Pool: Nhóm kết nối được quản lý tự động
 * 
 * Thông tin kết nối từ environment variables:
 * - process.env.DB_HOST: Địa chỉ MySQL server (từ .env)
 * - process.env.DB_USER: Username (từ .env)
 * - process.env.DB_PASSWORD: Password (từ .env)
 * - process.env.DB_NAME: Tên database (từ .env)
 * 
 * Pool options:
 * - connectionLimit: Số lượng connections tối đa trong pool (mặc định: 10)
 *   Ví dụ: 10 users cùng lúc = tối đa 10 connections
 * - waitForConnections: Nếu hết connections, chờ (true) hay lỗi (false)
 * - queueLimit: Số lượng requests chờ (0 = unlimited)
 * - enableKeepAlive: Giữ connection sống lâu hơn
 * - keepAliveInitialDelayMs: Delay trước khi gửi keep-alive
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',        // MySQL server address
  port: process.env.DB_PORT || 3306,               // MySQL port
  user: process.env.DB_USER || 'root',             // MySQL username
  password: process.env.DB_PASSWORD || '',         // MySQL password
  database: process.env.DB_NAME || 'doan_nodejs_nhom5', // Database name
  
  // Pool configuration
  connectionLimit: 10,              // Tối đa 10 connections cùng lúc
  waitForConnections: true,         // Chờ nếu hết connections
  queueLimit: 0,                    // Không giới hạn số requests chờ
  enableKeepAlive: true,            // Giữ connection sống
  keepAliveInitialDelayMs: 0        // Gửi keep-alive ngay
});

// ============================================================
// BƯỚC 3: LOG THÔNG TIN KẾT NỐI (Debug)
// ============================================================

console.log('\n============================================================');
console.log('📊 DATABASE CONNECTION INFO');
console.log('============================================================');
console.log(`Host:     ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port:     ${process.env.DB_PORT || 3306}`);
console.log(`User:     ${process.env.DB_USER || 'root'}`);
console.log(`Database: ${process.env.DB_NAME || 'doan_nodejs_nhom5'}`);
console.log('============================================================\n');

// ============================================================
// BƯỚC 4: TEST KẾT NỐI (Optional - để phát hiện lỗi sớm)
// ============================================================

/**
 * Hàm testConnection(): Kiểm tra xem database có kết nối được không
 * 
 * Cách hoạt động:
 * 1. Lấy một connection từ pool
 * 2. Thực thi query đơn giản: SELECT 1
 * 3. Nếu thành công, log "✅ Connected"
 * 4. Nếu lỗi, log "❌ Error" + chi tiết lỗi
 * 5. Giải phóng connection về pool
 */
async function testConnection() {
  try {
    // getConnection(): Lấy một connection từ pool
    // Pool sẽ tự động quản lý connection này
    const connection = await pool.getConnection();
    
    // Thực thi query đơn giản để kiểm tra kết nối
    // SELECT 1 là query nhanh nhất, không access dữ liệu
    await connection.query('SELECT 1');
    
    // Giải phóng connection về pool (để có thể tái sử dụng)
    connection.release();
    
    console.log('✅ Database connection successful!');
    console.log('✅ Ready to use pool.query() for database operations\n');
    
  } catch (error) {
    // Xử lý lỗi kết nối
    console.error('❌ Database connection error:');
    console.error(error.message);
    
    // Gợi ý debug
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n💡 Gợi ý: MySQL server không đang chạy');
      console.error('   - Hãy khởi động MySQL service');
    } else if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('\n💡 Gợi ý: Sai username/password');
      console.error('   - Kiểm tra lại .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Gợi ý: Database không tồn tại');
      console.error('   - Chạy: npm run seed');
    }
    
    // Không dừng server, để có cơ hội fix lỗi
  }
}

// Gọi test connection khi module được load
// Điều này giúp phát hiện lỗi kết nối sớm
testConnection();

// ============================================================
// BƯỚC 5: EXPORT POOL - Để các module khác sử dụng
// ============================================================

/**
 * Module exports: Cho phép các file khác import pool này
 * 
 * Cách sử dụng ở các file khác:
 * 
 * // model/Article.js
 * const pool = require('../config/database');
 * 
 * async function getArticles() {
 *   try {
 *     const [rows] = await pool.query('SELECT * FROM articles');
 *     return rows;
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * }
 * 
 * Lưu ý:
 * - pool.query() trả về [rows, fields]
 * - rows: Mảng các bản ghi kết quả
 * - fields: Thông tin về columns
 * - Dùng destructuring [rows] = ... để lấy rows
 */
module.exports = pool;

// ============================================================
// THAM KHẢO: Các loại errors phổ biến khi kết nối MySQL
// ============================================================
/*
1. PROTOCOL_CONNECTION_LOST
   - MySQL server không đang chạy
   - Solution: Khởi động MySQL

2. ER_ACCESS_DENIED_FOR_USER
   - Username hoặc password sai
   - Solution: Kiểm tra .env file

3. ER_BAD_DB_ERROR
   - Database không tồn tại
   - Solution: Chạy npm run seed

4. ECONNREFUSED
   - Không thể kết nối đến host:port
   - Solution: Kiểm tra DB_HOST, DB_PORT trong .env

5. ER_TOO_MANY_CONNECTIONS
   - Quá nhiều connections
   - Solution: Tăng connectionLimit hoặc đóng connections không dùng

6. PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR
   - Pool bị hỏng do quá nhiều lỗi
   - Solution: Restart server
*/
