# 📋 GIAI ĐOẠN 2: CẤU HÌNH KẾT NỐI DATABASE

> **Mục tiêu:** Tạo kết nối MySQL với connection pooling, quản lý tập trung

---

## 📊 Tổng Quan

| Thành phần | Nội dung |
|-----------|---------|
| **Mục đích** | Thiết lập kết nối database reusable, quản lý hiệu quả |
| **File mới** | `config/database.js` |
| **File cập nhật** | `app.js` |
| **Thư viện sử dụng** | mysql2/promise (promise-based) |
| **Kiến thức chính** | Connection Pool, async/await, Environment Variables |

---

## ✅ Hoàn Thành Trong Giai Đoạn 2

### ✔️ File `config/database.js` (Tạo mới)

**Mục đích:** Quản lý kết nối MySQL database với connection pooling

**Tính năng chính:**
1. ✅ **Connection Pool**: Tạo nhiều connections được tái sử dụng
   - Pool size: tối đa 10 connections
   - Tự động reuse connections cũ
   - Giảm overhead, tăng performance

2. ✅ **Promise-based**: Sử dụng mysql2/promise
   - Hỗ trợ async/await
   - Code sạch, dễ đọc
   - Error handling dễ dàng

3. ✅ **Environment Variables**: Load từ .env
   ```javascript
   host: process.env.DB_HOST || 'localhost'
   user: process.env.DB_USER || 'root'
   password: process.env.DB_PASSWORD || ''
   database: process.env.DB_NAME || 'doan_nodejs_nhom5'
   ```

4. ✅ **Test Connection**: Kiểm tra database tự động khi server start
   - Gọi `testConnection()` khi module load
   - Phát hiện lỗi sớm (connection failed, database không tồn tại, v.v.)
   - Gợi ý fix lỗi cụ thể

5. ✅ **Comprehensive Comments**: Giải thích chi tiết (Tiếng Việt)
   - Connection Pool concept
   - Pool options (connectionLimit, waitForConnections, queueLimit)
   - Cách sử dụng pool.query()
   - Debug tips cho lỗi phổ biến

**Cách sử dụng:**
```javascript
// model/Article.js
const pool = require('../config/database');

async function getArticles() {
  try {
    const [rows] = await pool.query('SELECT * FROM articles');
    return rows;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Key Points:**
- ✅ `pool.query()` trả về `[rows, fields]` (destructuring)
- ✅ Connections được quản lý tự động (không cần close)
- ✅ Pool sẽ reuse connections từ requests trước
- ✅ Nếu hết connections, sẽ chờ (waitForConnections: true)

---

### ✔️ File `app.js` (Cập nhật)

**Thay đổi chính:**

1. ✅ **Import Database Connection**
   ```javascript
   const pool = require('./config/database');
   ```
   - Pool này sẽ được sử dụng ở các route
   - Tự động test kết nối khi app.js được load

2. ✅ **Cải thiện Server Startup Log**
   - Hiển thị chi tiết hơn khi server khởi động
   - Hiển thị port, environment (development/production)
   - Gợi ý URL truy cập

3. ✅ **Comments Structure**: Cập nhật theo comments JavaScript đúng cách
   - Thay HTML comments (`<!--`) bằng JS comments (`//`)
   - Block comments (`/** ... */`) cho phần descriptions

---

## 🔧 Chi Tiết Cấu Hình

### Connection Pool Options

```javascript
const pool = mysql.createPool({
  // Thông tin kết nối
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'doan_nodejs_nhom5',
  
  // Pool options
  connectionLimit: 10,      // Max connections
  waitForConnections: true, // Chờ nếu hết connections
  queueLimit: 0,           // Unlimited queue
  enableKeepAlive: true,   // Giữ connection sống
  keepAliveInitialDelayMs: 0
});
```

**Giải thích Pool Options:**

| Option | Giá trị | Ý nghĩa |
|--------|--------|--------|
| `connectionLimit` | 10 | Tối đa 10 users cùng lúc có 1 connection riêng |
| `waitForConnections` | true | Nếu hết connections, chờ (không lỗi) |
| `queueLimit` | 0 | Không giới hạn số requests chờ |
| `enableKeepAlive` | true | Giữ connection sống, tránh server timeout |
| `keepAliveInitialDelayMs` | 0 | Gửi keep-alive ngay lập tức |

---

## 🧪 Test Kết Nối

Khi chạy `npm start` hoặc `npm run dev`, output sẽ hiển thị:

```
============================================================
📊 DATABASE CONNECTION INFO
============================================================
Host:     localhost
Port:     3306
User:     root
Database: doan_nodejs_nhom5
============================================================

✅ Database connection successful!
✅ Ready to use pool.query() for database operations
```

### Nếu có lỗi kết nối:

**❌ Lỗi: `PROTOCOL_CONNECTION_LOST`**
```
💡 Gợi ý: MySQL server không đang chạy
   - Hãy khởi động MySQL service
```
**Fix:** Khởi động MySQL (XAMPP, Homebrew, v.v.)

**❌ Lỗi: `ER_ACCESS_DENIED_FOR_USER`**
```
💡 Gợi ý: Sai username/password
   - Kiểm tra lại .env file
```
**Fix:** Kiểm tra `.env` có đúng credentials không

**❌ Lỗi: `ER_BAD_DB_ERROR`**
```
💡 Gợi ý: Database không tồn tại
   - Chạy: npm run seed
```
**Fix:** Khởi tạo database bằng `npm run seed`

---

## 📝 Quy trình Cấu hình

### Bước 1: Kiểm tra .env file
```bash
cat .env
```

**Kết quả mong đợi:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=doan_nodejs_nhom5
PORT=3000
NODE_ENV=development
```

### Bước 2: Khởi tạo database (nếu chưa)
```bash
npm run seed
```

**Output:**
```
✅ SQL commands executed successfully!
✅ Database initialized!
```

### Bước 3: Khởi động server
```bash
npm start
# hoặc với auto-reload
npm run dev
```

**Output:**
```
============================================================
📊 DATABASE CONNECTION INFO
============================================================
Host:     localhost
Port:     3306
User:     root
Database: doan_nodejs_nhom5
============================================================

✅ Database connection successful!
✅ Ready to use pool.query() for database operations

============================================================
🚀 SERVER STARTED
============================================================
Server đang chạy tại: http://localhost:3000
Môi trường: development
============================================================

💡 Mở trình duyệt và truy cập: http://localhost:3000
💡 Bấm Ctrl+C để dừng server
```

### Bước 4: Truy cập website
- Mở browser
- Gõ: `http://localhost:3000`
- Kết nối database đã thành công! ✅

---

## 🏗️ Kiến Trúc Kết Nối

```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                      │
│                    (app.js)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ require('./config/database')
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Connection Pool                           │
│              (config/database.js)                       │
│  - connectionLimit: 10 connections                     │
│  - waitForConnections: true                           │
│  - Auto-reuse connections                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ mysql.createPool()
                     ↓
┌─────────────────────────────────────────────────────────┐
│              MySQL Database Server                      │
│              (doan_nodejs_nhom5)                       │
│  - categories (6 mục)                                 │
│  - articles (12 bài viết)                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Cách sử dụng Pool ở các Routes/Models

### Ví dụ 1: Query đơn giản (SELECT)
```javascript
// routes/articles.js
const pool = require('../config/database');

router.get('/articles', async (req, res) => {
  try {
    // Destructure [rows] = [...] để lấy mảng kết quả
    const [rows] = await pool.query('SELECT * FROM articles LIMIT 10');
    
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});
```

### Ví dụ 2: Query với parameters (Tránh SQL Injection)
```javascript
router.get('/article/:id', async (req, res) => {
  try {
    // Sử dụng ? placeholder cho parameters
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});
```

### Ví dụ 3: Query JOIN
```javascript
router.get('/articles/with-category', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as category_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      ORDER BY a.published_date DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});
```

---

## ⚠️ Common Mistakes & Solutions

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| `Cannot read property 'query' of undefined` | Chưa import pool | `const pool = require('../config/database')` |
| `SELECT * FROM articles` returns empty | Database chưa seed data | `npm run seed` |
| `Too many connections` | Pool size quá nhỏ | Tăng `connectionLimit` |
| `Connection timeout` | Server MySQL down | Khởi động MySQL server |
| `ER_BAD_DB_ERROR` | Database không tồn tại | `npm run seed` |
| `PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR` | Pool bị hỏng | Restart server |

---

## 📌 Lưu ý Quan Trọng

### ✅ Best Practices:
1. ✅ **Luôn import pool từ config/database.js** - Tái sử dụng connections
2. ✅ **Sử dụng parameterized queries** - Tránh SQL injection
3. ✅ **Destructure [rows] = ...** - Pattern của mysql2/promise
4. ✅ **Wrap trong try/catch** - Xử lý lỗi database
5. ✅ **Load .env trước khi start server** - Credentials chính xác

### ❌ Tránh:
1. ❌ **Tạo new connection mỗi lần query** - Sẽ bị out of connections
2. ❌ **Hardcode database credentials** - Security risk
3. ❌ **Quên await pool.query()** - Sẽ nhận Promise chứ không phải data
4. ❌ **Không xử lý error** - Ứng dụng sẽ crash
5. ❌ **Sử dụng string concatenation cho queries** - SQL injection vulnerability

---

## 🎯 Giai Đoạn Tiếp Theo

**Giai Đoạn 3: Tạo Database Models**

Sẽ tạo các model classes để:
- ✅ Bao bọc database queries
- ✅ Tái sử dụng code (DRY principle)
- ✅ Tách biệt logic từ routes

**Preview Model:**
```javascript
// models/Article.js
class Article {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM articles');
    return rows;
  }
  
  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Article;
```

---

## 📚 Tài Liệu Tham Khảo

- [mysql2/promise docs](https://github.com/sidorares/node-mysql2#promise-wrapper)
- [Node.js dotenv docs](https://github.com/motdotla/dotenv)
- [Connection Pooling concept](https://en.wikipedia.org/wiki/Connection_pool)
- [SQL Injection prevention](https://owasp.org/www-community/attacks/SQL_Injection)

---

**✅ Giai Đoạn 2 hoàn thành!** 

Tiếp tục sang Giai Đoạn 3: Tạo Database Models
