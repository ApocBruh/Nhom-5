# 📋 GIAI ĐOẠN 3: TẠO DATABASE MODELS

> **Mục tiêu:** Tạo Model classes để quản lý database queries, tách biệt logic khỏi routes

---

## 📊 Tổng Quan

| Thành phần | Nội dung |
|-----------|---------|
| **Mục đích** | Bao bọc database queries, tái sử dụng code, dễ bảo trì |
| **Files mới** | `models/Article.js`, `models/Category.js` |
| **Kiến thức chính** | Static Methods, Async/Await, SQL Queries, Object-Oriented |
| **Pattern** | Model Pattern (từ MVC architecture) |

---

## ✅ Hoàn Thành Trong Giai Đoạn 3

### ✔️ File `models/Article.js` (Tạo mới)

**Mục đích:** Quản lý toàn bộ logic liên quan đến bài viết

**Methods (Static):**

| Method | Tham số | Trả về | Mô tả |
|--------|--------|--------|-------|
| `getAll()` | - | `Array<Article>` | Lấy tất cả bài viết |
| `getById(id)` | `id: number` | `Article\|null` | Lấy bài viết theo ID |
| `getByCategory(catId, limit)` | `categoryId, limit=10` | `Array<Article>` | Lấy bài viết theo danh mục |
| `getMostViewed(limit)` | `limit=5` | `Array<Article>` | Lấy top xem nhiều nhất |
| `getLatest(limit)` | `limit=5` | `Array<Article>` | Lấy bài viết mới nhất |
| `getAllWithCategory()` | - | `Array<ArticleWithCat>` | Lấy bài viết + category info (JOIN) |
| `getByCategoryWithInfo(catId, limit)` | `categoryId, limit=10` | `Array<ArticleWithCat>` | Bài viết theo danh mục + category info |
| `search(keyword)` | `keyword: string` | `Array<Article>` | Tìm kiếm theo từ khóa |
| `incrementViews(id)` | `id: number` | `boolean` | Tăng lượt xem |

**Cách sử dụng:**

```javascript
// routes/articles.js
const Article = require('../models/Article');

// Lấy 10 bài viết mới nhất
const latestArticles = await Article.getLatest(10);

// Lấy top 5 xem nhiều nhất
const topArticles = await Article.getMostViewed(5);

// Lấy bài viết theo danh mục (ID=1) kèm category info
const articles = await Article.getByCategoryWithInfo(1, 8);

// Tìm kiếm
const results = await Article.search('technology');

// Tăng lượt xem khi người dùng xem bài viết
await Article.incrementViews(articleId);
```

**Tính năng chính:**
- ✅ Static methods - không cần `new Article()`
- ✅ Async/Await - dùng `await` để lấy dữ liệu
- ✅ Parameterized queries - tránh SQL injection
- ✅ JOIN queries - kết hợp với categories
- ✅ Error handling - try/catch cho mỗi method
- ✅ Comprehensive comments - giải thích chi tiết

---

### ✔️ File `models/Category.js` (Tạo mới)

**Mục đích:** Quản lý toàn bộ logic liên quan đến danh mục

**Methods (Static):**

| Method | Tham số | Trả về | Mô tả |
|--------|--------|--------|-------|
| `getAll()` | - | `Array<Category>` | Lấy tất cả danh mục |
| `getById(id)` | `id: number` | `Category\|null` | Lấy danh mục theo ID |
| `getBySlug(slug)` | `slug: string` | `Category\|null` | Lấy danh mục theo slug |
| `getAllWithCount()` | - | `Array<CategoryWithCount>` | Lấy danh mục + số bài viết |
| `getWithArticles(catId, limit)` | `categoryId, limit=10` | `CategoryWithArticles` | Danh mục + bài viết |
| `getBySlugWithArticles(slug, limit)` | `slug, limit=10` | `CategoryWithArticles\|null` | Danh mục (slug) + bài viết |
| `getPopular(limit)` | `limit=6` | `Array<Category>` | Danh mục phổ biến nhất |
| `getArticleCount(catId)` | `categoryId: number` | `number` | Tổng số bài viết |

**Cách sử dụng:**

```javascript
// routes/categories.js
const Category = require('../models/Category');

// Lấy tất cả danh mục
const categories = await Category.getAll();

// Lấy danh mục kèm số bài viết
const catsWithCount = await Category.getAllWithCount();

// Render trang category/business với bài viết
const category = await Category.getBySlugWithArticles('business', 8);
res.render('category', { category: category });

// Lấy 6 danh mục phổ biến nhất
const popularCats = await Category.getPopular(6);
```

**Tính năng chính:**
- ✅ Static methods - `await Category.getAll()`
- ✅ Slug-based routing - `/category/business`
- ✅ COUNT & GROUP BY - đếm bài viết
- ✅ LEFT JOIN - danh mục không có bài viết
- ✅ Nested objects - danh mục + bài viết
- ✅ Error handling - try/catch cho mỗi method

---

## 🏗️ Kiến Trúc Models

```
┌─────────────────────────────────────┐
│          Routes/Controllers         │
│        (app.js, routes/*.js)        │
└────────────────┬────────────────────┘
                 │ import
                 ↓
┌─────────────────────────────────────┐
│          Models                     │
│  - Article.js (static methods)      │
│  - Category.js (static methods)     │
└────────────────┬────────────────────┘
                 │ use
                 ↓
┌─────────────────────────────────────┐
│      Database Connection (Pool)     │
│      config/database.js             │
└────────────────┬────────────────────┘
                 │ query
                 ↓
┌─────────────────────────────────────┐
│         MySQL Database              │
│   - categories table                │
│   - articles table                  │
└─────────────────────────────────────┘
```

---

## 🧪 Test Models (Ví dụ)

### Test 1: Lấy tất cả bài viết

```javascript
const Article = require('./models/Article');

(async () => {
  try {
    const articles = await Article.getAll();
    console.log('All articles:', articles);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

**Output:**
```javascript
All articles: [
  {
    id: 1,
    category_id: 1,
    title: 'Bài viết về Kinh doanh',
    slug: 'bai-viet-ve-kinh-doanh',
    thumbnail: 'image1.jpg',
    content: 'Nội dung bài viết...',
    summary: 'Tóm tắt bài viết...',
    author: 'John Doe',
    published_date: '2025-04-17',
    views: 2345
  },
  { ... },
  { ... }
]
```

### Test 2: Lấy bài viết theo danh mục

```javascript
const Article = require('./models/Article');

(async () => {
  try {
    // Lấy 5 bài viết từ category #1 (Business)
    const articles = await Article.getByCategory(1, 5);
    console.log('Articles in category 1:', articles.length);
    
    articles.forEach(article => {
      console.log(`- ${article.title} (${article.views} views)`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

**Output:**
```
Articles in category 1: 3
- Bài viết 1 (2345 views)
- Bài viết 2 (1023 views)
- Bài viết 3 (890 views)
```

### Test 3: Lấy danh mục kèm bài viết

```javascript
const Category = require('./models/Category');

(async () => {
  try {
    const category = await Category.getBySlugWithArticles('business', 5);
    
    console.log('Category:', category.name);
    console.log('Description:', category.description);
    console.log('Articles count:', category.articles.length);
    
    category.articles.forEach(article => {
      console.log(`  - ${article.title}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

**Output:**
```
Category: Business
Description: Tin tức kinh doanh, tài chính, đầu tư
Articles count: 5
  - Bài viết 1
  - Bài viết 2
  - Bài viết 3
  - Bài viết 4
  - Bài viết 5
```

---

## 💡 Best Practices

### ✅ DO:

1. **Sử dụng Parameterized Queries**
   ```javascript
   // ✅ ĐÚNG
   const [rows] = await pool.query(
     'SELECT * FROM articles WHERE id = ?',
     [id]
   );
   ```

2. **Error Handling**
   ```javascript
   // ✅ ĐÚNG
   try {
     const result = await Article.getById(id);
     return result;
   } catch (error) {
     console.error('Error:', error);
     throw error;
   }
   ```

3. **Reuse Models**
   ```javascript
   // ✅ ĐÚNG - dùng models ở nhiều routes
   const Article = require('../models/Article');
   
   router.get('/latest', async (req, res) => {
     const articles = await Article.getLatest(10);
     res.json(articles);
   });
   
   router.get('/popular', async (req, res) => {
     const articles = await Article.getMostViewed(10);
     res.json(articles);
   });
   ```

### ❌ DON'T:

1. **SQL Injection Risk**
   ```javascript
   // ❌ SAI - String concatenation
   const query = `SELECT * FROM articles WHERE id = ${id}`;
   ```

2. **Hardcode Pool**
   ```javascript
   // ❌ SAI - Database logic ở routes
   app.get('/articles', async (req, res) => {
     const [rows] = await pool.query('SELECT * FROM articles');
     res.json(rows);
   });
   ```

3. **No Error Handling**
   ```javascript
   // ❌ SAI - Không catch lỗi
   const articles = await pool.query('SELECT ...');
   res.json(articles); // Crash nếu có error
   ```

---

## 🔄 Cách sử dụng ở Routes

### Ví dụ Route 1: Homepage

```javascript
// routes/home.js (hoặc app.js)
const Article = require('../models/Article');
const Category = require('../models/Category');

app.get('/', async (req, res) => {
  try {
    // Lấy dữ liệu từ models
    const latestArticles = await Article.getLatest(10);
    const topArticles = await Article.getMostViewed(5);
    const categories = await Category.getAll();
    
    // Render view với dữ liệu từ database
    res.render('index', {
      title: 'Trang chủ',
      latestArticles: latestArticles,
      topArticles: topArticles,
      categories: categories,
      siteInfo: { /* ... */ }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});
```

### Ví dụ Route 2: Category Page

```javascript
// routes/category.js
const Category = require('../models/Category');

router.get('/category/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    // Lấy danh mục + bài viết từ model
    const category = await Category.getBySlugWithArticles(slug, 12);
    
    if (!category) {
      return res.status(404).render('404', { message: 'Category not found' });
    }
    
    res.render('category', {
      title: category.name,
      category: category,
      siteInfo: { /* ... */ }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});
```

### Ví dụ Route 3: Article Detail

```javascript
// routes/article.js
const Article = require('../models/Article');

router.get('/article/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    
    // Lấy bài viết
    const article = await Article.getById(articleId);
    
    if (!article) {
      return res.status(404).render('404', { message: 'Article not found' });
    }
    
    // Tăng lượt xem
    await Article.incrementViews(articleId);
    
    res.render('article', {
      title: article.title,
      article: article,
      siteInfo: { /* ... */ }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});
```

---

## 📝 Lưu ý Quan Trọng

### ⚠️ Important Notes:

1. **Models không có constructor** - Tất cả methods là STATIC
   - Gọi: `Article.getAll()` ❌ không: `new Article().getAll()`

2. **Luôn dùng await** - Tất cả methods trả về Promise
   - Gọi: `const articles = await Article.getAll();`
   - ❌ không: `const articles = Article.getAll();` (sẽ nhận Promise)

3. **Error handling** - Database có thể fail
   - Luôn wrap trong try/catch
   - Luôn throw error để routes handle

4. **Parameterized queries** - Tránh SQL injection
   - Dùng `?` placeholder + values array
   - ❌ không concatenate strings

---

## 🎯 Giai Đoạn Tiếp Theo

**Giai Đoạn 4: Tạo Routes**

Sẽ tạo routes để:
- ✅ Sử dụng Article & Category models
- ✅ Xử lý requests từ client
- ✅ Render views với dữ liệu từ database
- ✅ Handle errors và edge cases

**Preview:**
```javascript
// routes/articles.js
const Article = require('../models/Article');

router.get('/latest', async (req, res) => {
  const articles = await Article.getLatest(10);
  res.json(articles);
});

router.get('/:id', async (req, res) => {
  const article = await Article.getById(req.params.id);
  res.json(article);
});
```

---

✅ **Giai Đoạn 3 hoàn thành!**

Tiếp tục sang Giai Đoạn 4: Tạo Routes
