/**
 * ============================================================
 * FILE: models/Article.js
 * MỤC ĐÍCH: Model để quản lý dữ liệu bài viết (Article)
 * 
 * MÔ TẢ:
 * Lớp Article đóng gói tất cả các database queries liên quan đến bài viết.
 * Cung cấp các phương thức tĩnh (static methods) để:
 * - Lấy tất cả bài viết
 * - Lấy bài viết theo ID
 * - Lấy bài viết theo danh mục
 * - Lấy bài viết xem nhiều nhất
 * - Lấy bài viết mới nhất
 * 
 * LỢI ÍCH:
 * - DRY (Don't Repeat Yourself): Reuse queries
 * - Tách biệt DB logic từ routes
 * - Dễ bảo trì: Thay đổi query ở một chỗ
 * - Dễ test: Mock dữ liệu
 * ============================================================
 */

// Import pool từ config/database.js
// Pool này quản lý MySQL connections một cách hiệu quả
const pool = require('../config/database');

/**
 * Lớp Article - Quản lý dữ liệu bài viết
 * 
 * Lưu ý về naming:
 * - Tất cả methods đều là STATIC
 * - Không cần new Article() - gọi trực tiếp Article.methodName()
 * - Tất cả methods đều ASYNC - cần await khi gọi
 * - Trả về Promise<data> thay vì callback
 * 
 * Kiến thức:
 * - pool.query() trả về [rows, fields]
 * - rows: mảng các bản ghi
 * - fields: thông tin về columns
 * - Dùng destructuring: const [rows] = await pool.query(...)
 * 
 * SQL Injection Prevention:
 * - Luôn dùng ? placeholder cho user input
 * - Ví dụ: SELECT * FROM articles WHERE id = ?
 * - Truyền values riêng: pool.query(sql, [id])
 */
class Article {
  /**
   * Lấy TẤT CẢ bài viết
   * 
   * @returns {Promise<Array>} Mảng tất cả bài viết
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const articles = await Article.getAll();
   * console.log(articles);
   * Output: [
   *   { id: 1, title: '...', category_id: 1, views: 1250, ... },
   *   { id: 2, title: '...', category_id: 2, views: 945, ... },
   *   ...
   * ]
   */
  static async getAll() {
    try {
      // Query: SELECT tất cả columns từ articles table
      // ORDER BY published_date DESC: Sắp xếp mới nhất trước
      const [rows] = await pool.query(
        'SELECT * FROM articles ORDER BY published_date DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.getAll():', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết theo ID
   * 
   * @param {number} id - ID của bài viết
   * @returns {Promise<Object|null>} Đối tượng bài viết hoặc null nếu không tìm thấy
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const article = await Article.getById(5);
   * if (article) {
   *   console.log(article.title);
   * } else {
   *   console.log('Article not found');
   * }
   */
  static async getById(id) {
    try {
      // Query với parameterized query: WHERE id = ?
      // ? placeholder: tránh SQL injection
      // [id]: mảng values để replace placeholder
      const [rows] = await pool.query(
        'SELECT * FROM articles WHERE id = ?',
        [id]
      );
      // Trả về bài viết đầu tiên (hoặc undefined nếu mảng rỗng)
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Article.getById():', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết theo danh mục (category)
   * 
   * @param {number} categoryId - ID của danh mục
   * @param {number} limit - Số lượng bài viết (mặc định: 10)
   * @returns {Promise<Array>} Mảng bài viết trong danh mục
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const businessArticles = await Article.getByCategory(1, 5);
   * console.log(businessArticles); // 5 bài viết từ Business category
   */
  static async getByCategory(categoryId, limit = 10) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM articles 
         WHERE category_id = ? 
         ORDER BY published_date DESC 
         LIMIT ?`,
        [categoryId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.getByCategory():', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết XEM NHIỀU NHẤT (Most Viewed)
   * 
   * @param {number} limit - Số lượng bài viết (mặc định: 5)
   * @returns {Promise<Array>} Mảng bài viết xem nhiều nhất
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const topArticles = await Article.getMostViewed(5);
   * console.log(topArticles); // Top 5 most viewed articles
   */
  static async getMostViewed(limit = 5) {
    try {
      // ORDER BY views DESC: Sắp xếp từ lượt xem cao nhất
      const [rows] = await pool.query(
        'SELECT * FROM articles ORDER BY views DESC LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.getMostViewed():', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết MỚI NHẤT (Latest)
   * 
   * @param {number} limit - Số lượng bài viết (mặc định: 5)
   * @returns {Promise<Array>} Mảng bài viết mới nhất
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const latestArticles = await Article.getLatest(8);
   * console.log(latestArticles); // 8 bài viết mới nhất
   */
  static async getLatest(limit = 5) {
    try {
      // ORDER BY published_date DESC: Sắp xếp mới nhất trước
      const [rows] = await pool.query(
        'SELECT * FROM articles ORDER BY published_date DESC LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.getLatest():', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết với JOIN category info
   * 
   * @returns {Promise<Array>} Mảng bài viết kèm thông tin danh mục
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const articles = await Article.getAllWithCategory();
   * console.log(articles[0]);
   * Output: {
   *   id: 1,
   *   title: '...',
   *   category_id: 1,
   *   category_name: 'Business', // Từ JOIN
   *   category_slug: 'business', // Từ JOIN
   *   ...
   * }
   */
  static async getAllWithCategory() {
    try {
      // JOIN categories: Kết hợp với bảng categories
      // a.* ... c.name as category_name: Lấy category_name từ categories table
      const [rows] = await pool.query(
        `SELECT a.*, c.name as category_name, c.slug as category_slug
         FROM articles a
         JOIN categories c ON a.category_id = c.id
         ORDER BY a.published_date DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.getAllWithCategory():', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết từ một danh mục với JOIN category info
   * 
   * @param {number} categoryId - ID danh mục
   * @param {number} limit - Số lượng (mặc định: 10)
   * @returns {Promise<Array>} Bài viết + category info
   * @throws {Error} Nếu có lỗi database
   */
  static async getByCategoryWithInfo(categoryId, limit = 10) {
    try {
      const [rows] = await pool.query(
        `SELECT a.*, c.name as category_name, c.slug as category_slug
         FROM articles a
         JOIN categories c ON a.category_id = c.id
         WHERE a.category_id = ?
         ORDER BY a.published_date DESC
         LIMIT ?`,
        [categoryId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.getByCategoryWithInfo():', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm bài viết theo từ khóa
   * 
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Mảng bài viết tìm thấy
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const results = await Article.search('technology');
   * console.log(results); // Bài viết có chứa 'technology'
   */
  static async search(keyword) {
    try {
      // LIKE '%...%': Tìm kiếm chứa từ khóa
      // LOWER(): So sánh không phân biệt hoa thường
      const searchTerm = `%${keyword}%`;
      const [rows] = await pool.query(
        `SELECT * FROM articles 
         WHERE LOWER(title) LIKE LOWER(?) 
            OR LOWER(content) LIKE LOWER(?)
         ORDER BY published_date DESC`,
        [searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      console.error('Error in Article.search():', error);
      throw error;
    }
  }

  /**
   * Cập nhật lượt xem (views) của bài viết
   * 
   * @param {number} id - ID bài viết
   * @returns {Promise<boolean>} true nếu cập nhật thành công
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * await Article.incrementViews(5);
   * // Lượt xem bài viết #5 tăng lên 1
   */
  static async incrementViews(id) {
    try {
      // UPDATE: Tăng views lên 1
      // views = views + 1: Toàn bộ logic ở database
      const result = await pool.query(
        'UPDATE articles SET views = views + 1 WHERE id = ?',
        [id]
      );
      // result[0].affectedRows: số bản ghi được update
      return result[0].affectedRows > 0;
    } catch (error) {
      console.error('Error in Article.incrementViews():', error);
      throw error;
    }
  }
}

/**
 * EXPORT: Cho phép các file khác import Model này
 * 
 * Cách sử dụng ở routes:
 * 
 * const Article = require('../models/Article');
 * 
 * app.get('/articles', async (req, res) => {
 *   const articles = await Article.getLatest(10);
 *   res.render('articles', { articles: articles });
 * });
 */
module.exports = Article;
