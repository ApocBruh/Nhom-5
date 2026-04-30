/**
 * ============================================================
 * FILE: models/Category.js
 * MỤC ĐÍCH: Model để quản lý dữ liệu danh mục (Category)
 * 
 * MÔ TẢ:
 * Lớp Category đóng gói tất cả database queries liên quan đến danh mục.
 * Cung cấp các phương thức tĩnh (static methods) để:
 * - Lấy tất cả danh mục
 * - Lấy danh mục theo ID
 * - Lấy danh mục theo slug
 * - Lấy danh mục kèm số bài viết
 * 
 * LỢI ÍCH:
 * - Quản lý tập trung: Tất cả logic ở một chỗ
 * - Tái sử dụng: Các routes khác có thể import
 * - Dễ bảo trì: Thay đổi query ở một chỗ
 * ============================================================
 */

// Import pool từ config/database.js
const pool = require('../config/database');

/**
 * Lớp Category - Quản lý dữ liệu danh mục
 * 
 * Lưu ý:
 * - Tất cả methods đều STATIC - không cần new
 * - Tất cả methods đều ASYNC - cần await
 */
class Category {
  /**
   * Lấy TẤT CẢ danh mục
   * 
   * @returns {Promise<Array>} Mảng tất cả danh mục
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const categories = await Category.getAll();
   * console.log(categories);
   * Output: [
   *   { id: 1, name: 'Business', slug: 'business', description: '...' },
   *   { id: 2, name: 'Sports', slug: 'sports', description: '...' },
   *   ...
   * ]
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM categories');
      return rows;
    } catch (error) {
      console.error('Error in Category.getAll():', error);
      throw error;
    }
  }

  /**
   * Lấy danh mục theo ID
   * 
   * @param {number} id - ID danh mục
   * @returns {Promise<Object|null>} Đối tượng danh mục hoặc null
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const category = await Category.getById(2);
   * console.log(category.name); // "Sports"
   */
  static async getById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Category.getById():', error);
      throw error;
    }
  }

  /**
   * Lấy danh mục theo SLUG
   * 
   * Slug là phiên bản URL-friendly của name
   * Ví dụ: "Business News" → slug: "business-news"
   * 
   * @param {string} slug - Slug của danh mục
   * @returns {Promise<Object|null>} Đối tượng danh mục hoặc null
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const category = await Category.getBySlug('business');
   * console.log(category.name); // "Business"
   */
  static async getBySlug(slug) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE slug = ?',
        [slug]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Category.getBySlug():', error);
      throw error;
    }
  }

  /**
   * Lấy danh mục kèm số bài viết (article count)
   * 
   * Hữu ích để hiển thị "Business (25 articles)"
   * 
   * @returns {Promise<Array>} Mảng danh mục với article_count
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const categories = await Category.getAllWithCount();
   * console.log(categories[0]);
   * Output: {
   *   id: 1,
   *   name: 'Business',
   *   slug: 'business',
   *   description: '...',
   *   article_count: 12  // Số bài viết trong category này
   * }
   */
  static async getAllWithCount() {
    try {
      // JOIN categories với COUNT từ articles table
      // LEFT JOIN: Lấy cả category không có bài viết (count = 0)
      // GROUP BY: Nhóm kết quả theo category
      // COUNT(a.id) as article_count: Đếm số bài viết
      const [rows] = await pool.query(
        `SELECT c.*, COUNT(a.id) as article_count
         FROM categories c
         LEFT JOIN articles a ON c.id = a.category_id
         GROUP BY c.id, c.name, c.slug, c.description
         ORDER BY c.name`
      );
      return rows;
    } catch (error) {
      console.error('Error in Category.getAllWithCount():', error);
      throw error;
    }
  }

  /**
   * Lấy danh mục kèm thông tin bài viết
   * 
   * Trả về danh mục cùng với các bài viết thành danh sách
   * 
   * @param {number} categoryId - ID danh mục
   * @param {number} articleLimit - Số bài viết tối đa (mặc định: 10)
   * @returns {Promise<Object>} Đối tượng danh mục kèm articles array
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const categoryWithArticles = await Category.getWithArticles(1, 5);
   * console.log(categoryWithArticles);
   * Output: {
   *   id: 1,
   *   name: 'Business',
   *   slug: 'business',
   *   description: '...',
   *   articles: [
   *     { id: 1, title: '...', ... },
   *     { id: 2, title: '...', ... },
   *     ...
   *   ]
   * }
   */
  static async getWithArticles(categoryId, articleLimit = 10) {
    try {
      // Lấy thông tin danh mục
      const category = await this.getById(categoryId);
      
      if (!category) {
        return null;
      }

      // Lấy bài viết trong danh mục này
      const [articles] = await pool.query(
        `SELECT * FROM articles 
         WHERE category_id = ? 
         ORDER BY published_date DESC 
         LIMIT ?`,
        [categoryId, articleLimit]
      );

      // Kết hợp danh mục + bài viết
      return {
        ...category,
        articles: articles
      };
    } catch (error) {
      console.error('Error in Category.getWithArticles():', error);
      throw error;
    }
  }

  /**
   * Lấy danh mục theo slug kèm bài viết
   * 
   * Dùng để render trang category (ví dụ: /category/business)
   * 
   * @param {string} slug - Slug của danh mục
   * @param {number} articleLimit - Số bài viết (mặc định: 10)
   * @returns {Promise<Object|null>} Danh mục + articles hoặc null
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const page = await Category.getBySlugWithArticles('business', 8);
   * // Render trang: Business category với 8 bài viết
   */
  static async getBySlugWithArticles(slug, articleLimit = 10) {
    try {
      const category = await this.getBySlug(slug);
      
      if (!category) {
        return null;
      }

      const [articles] = await pool.query(
        `SELECT * FROM articles 
         WHERE category_id = ? 
         ORDER BY published_date DESC 
         LIMIT ?`,
        [category.id, articleLimit]
      );

      return {
        ...category,
        articles: articles
      };
    } catch (error) {
      console.error('Error in Category.getBySlugWithArticles():', error);
      throw error;
    }
  }

  /**
   * Lấy danh mục phổ biến nhất (dựa trên số bài viết)
   * 
   * @param {number} limit - Số danh mục (mặc định: 6)
   * @returns {Promise<Array>} Mảng danh mục phổ biến
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const popularCategories = await Category.getPopular(6);
   * console.log(popularCategories);
   * // Trả về 6 danh mục có nhiều bài viết nhất
   */
  static async getPopular(limit = 6) {
    try {
      const [rows] = await pool.query(
        `SELECT c.*, COUNT(a.id) as article_count
         FROM categories c
         LEFT JOIN articles a ON c.id = a.category_id
         GROUP BY c.id, c.name, c.slug, c.description
         ORDER BY article_count DESC
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Category.getPopular():', error);
      throw error;
    }
  }

  /**
   * Lấy tổng số bài viết trong danh mục
   * 
   * @param {number} categoryId - ID danh mục
   * @returns {Promise<number>} Tổng số bài viết
   * @throws {Error} Nếu có lỗi database
   * 
   * Ví dụ:
   * const count = await Category.getArticleCount(1);
   * console.log(count); // 25
   */
  static async getArticleCount(categoryId) {
    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
        [categoryId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error in Category.getArticleCount():', error);
      throw error;
    }
  }
}

/**
 * EXPORT: Cho phép các file khác import Model này
 * 
 * Cách sử dụng ở routes:
 * 
 * const Category = require('../models/Category');
 * 
 * app.get('/category/:slug', async (req, res) => {
 *   const category = await Category.getBySlugWithArticles(req.params.slug);
 *   res.render('category', { category: category });
 * });
 */
module.exports = Category;
