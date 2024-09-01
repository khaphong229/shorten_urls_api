const { link } = require("joi");
const { pool } = require("../configs/db.config");
const getNameApiKey = require("../utils/getNameApiKey.util");
const apiKeyValidate = require("../validations/apiKey.validation");

class ApiKeyController {
  async createApiKey(req, res) {
    const { api_key, priority, maximum_view, description, is_active } =
      req.body;

    try {
      if (!apiKeyValidate(api_key)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng Api Key không đúng với yêu cầu.",
        });
      }

      const user_id = req.user.rows[0].user_id;
      const resultCheckExist = await pool.query(
        "SELECT * FROM apiKeys WHERE api_key = $1 and user_id = $2",
        [api_key, user_id]
      );

      if (resultCheckExist.rowCount != 0) {
        return res.status(400).json({
          success: false,
          message: "Api Key này đã tồn tại! Vui lòng lựa chọn Api Key khác.",
        });
      }

      const name_api = getNameApiKey(api_key);

      const result = await pool.query(
        `INSERT INTO apiKeys (api_key, user_id, name_api, priority, maximum_view, description, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          api_key,
          user_id,
          name_api,
          priority,
          maximum_view,
          description,
          is_active,
        ]
      );

      const createdApiKey = result.rows[0];

      res.status(201).json({
        success: true,
        message: "Tạo Api Key thành công.",
        data: createdApiKey,
        links: {
          self: `/apikeys/${createdApiKey.api_key_id}`,
          update: `/apikeys/${createdApiKey.api_key_id}`,
          delete: `/apikeys/${createdApiKey.api_key_id}`,
          filter: `/apikeys/filter?name_api=${name_api}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Tạo Api Key thất bại.",
        error: error.message,
      });
    }
  }

  async getApiKeys(req, res) {
    try {
      let results;
      if (req.user.rows[0].is_superuser) {
        results = await pool.query(
          "SELECT * FROM apiKeys ORDER BY priority ASC"
        );
      } else {
        results = await pool.query(
          "SELECT * FROM apiKeys WHERE user_id = $1 ORDER BY priority ASC",
          [req.user.rows[0].user_id]
        );
      }

      if (results.rowCount == 0) {
        return res.status(500).json({
          success: false,
          message: "Không tồn tại api key nào.",
        });
      }

      const apiKeysWithLinks = results.rows.map((apiKey) => ({
        ...apiKey,
        links: {
          self: `/apikeys/${apiKey.api_key_id}`,
          update: `/apikeys/${apiKey.api_key_id}`,
          delete: `/apikeys/${apiKey.api_key_id}`,
        },
      }));

      res.status(200).json({
        success: true,
        message: "Truy vấn api key thành công.",
        data: apiKeysWithLinks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Truy vấn api key thất bại.",
        error: error.message,
      });
    }
  }

  async getApiKeysById(req, res) {
    const api_key_id = parseInt(req.params.id);

    try {
      const result = await pool.query(
        "SELECT * FROM apiKeys WHERE api_key_id = $1",
        [api_key_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Api Key id=${api_key_id} không tồn tại.`,
        });
      }

      if (
        !req.user.rows[0].is_superuser &&
        result.rows[0].user_id !== req.user.rows[0].user_id
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập Api Key này.",
        });
      }

      res.status(200).json({
        success: true,
        message: `Truy vấn Api Key id=${api_key_id} thành công.`,
        data: result.rows[0],
        links: {
          self: `/apikeys/${api_key_id}`,
          update: `/apikeys/${api_key_id}`,
          delete: `/apikeys/${api_key_id}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Truy vấn Api Key id=${api_key_id} thất bại.`,
        error: error.message,
      });
    }
  }

  async updateApiKey(req, res) {
    const api_key_id = parseInt(req.params.id);
    const { api_key, priority, maximum_view, description, is_active } =
      req.body;

    try {
      const result = await pool.query(
        "SELECT * FROM apiKeys WHERE api_key_id = $1",
        [api_key_id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: `Api Key id=${api_key_id} không tồn tại.`,
        });
      }

      if (
        !req.user.rows[0].is_superuser &&
        result.rows[0].user_id !== req.user.rows[0].user_id
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật Api Key này.",
        });
      }

      let updateQuery = "UPDATE apiKeys SET ";
      let queryValues = [];
      let queryIndex = 1;

      if (api_key) {
        if (!apiKeyValidate(api_key)) {
          return res.status(400).json({
            success: false,
            message: "Định dạng Api Key không đúng với yêu cầu.",
          });
        }

        const name_api = getNameApiKey(api_key);
        updateQuery += `api_key = $${queryIndex++}, name_api = $${queryIndex++}, `;
        queryValues.push(api_key, name_api);
      }

      if (typeof priority !== "undefined") {
        updateQuery += `priority = $${queryIndex++}, `;
        queryValues.push(priority);
      }

      if (typeof maximum_view !== "undefined") {
        updateQuery += `maximum_view = $${queryIndex++}, `;
        queryValues.push(maximum_view);
      }

      if (typeof description !== "undefined") {
        updateQuery += `description = $${queryIndex++}, `;
        queryValues.push(description);
      }

      if (typeof is_active !== "undefined") {
        updateQuery += `is_active = $${queryIndex++}, `;
        queryValues.push(is_active);
      }

      updateQuery += "updated_at = NOW() WHERE api_key_id = $" + queryIndex;
      queryValues.push(api_key_id);

      await pool.query(updateQuery, queryValues);

      res.status(200).json({
        success: true,
        message: `Cập nhật Api Key id=${api_key_id} thành công.`,
        links: {
          self: `/apikeys/${api_key_id}`,
          update: `/apikeys/${api_key_id}`,
          delete: `/apikeys/${api_key_id}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Cập nhật Api Key id=${api_key_id} thất bại.`,
        error: error.message,
      });
    }
  }

  async deleteApiKey(req, res) {
    const api_key_id = parseInt(req.params.id);

    try {
      const result = await pool.query(
        "SELECT * FROM apikeys WHERE api_key_id = $1",
        [api_key_id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: `Api Key id=${api_key_id} không tồn tại.`,
        });
      }

      if (
        !req.user.rows[0].is_superuser &&
        result.rows[0].user_id !== req.user.rows[0].user_id
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa Api Key này.",
        });
      }

      const deleteResult = await pool.query(
        "DELETE FROM apikeys WHERE api_key_id = $1",
        [api_key_id]
      );

      res.status(200).json({
        success: true,
        message: `Xóa Api Key id=${api_key_id} thành công.`,
        links: {
          allApiKeys: "/apikeys",
          createNewApiKey: "/apikeys",
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Xóa Api Key id=${api_key_id} thất bại.`,
        error: error.message,
      });
    }
  }

  async filterAndPaginateApiKeys(req, res) {
    const {
      name_api,
      priority,
      maximum_view,
      is_active,
      page = 1,
      limit = 10,
    } = req.query;
    const offset = (page - 1) * limit;
    const user_id = req.user.rows[0].user_id;

    try {
      let query = "SELECT * FROM apiKeys WHERE user_id = $1";
      let countQuery = "SELECT COUNT(*) FROM apiKeys WHERE user_id = $1";
      let queryParams = [user_id];
      let countParams = [user_id];
      let index = 2; // To keep track of parameter index for query building

      if (name_api) {
        query += ` AND name_api ILIKE $${index}`;
        countQuery += ` AND name_api ILIKE $${index}`;
        queryParams.push(`%${name_api}%`);
        countParams.push(`%${name_api}%`);
        index++;
      }

      if (priority) {
        query += ` AND priority = $${index}`;
        countQuery += ` AND priority = $${index}`;
        queryParams.push(priority);
        countParams.push(priority);
        index++;
      }

      if (maximum_view) {
        query += ` AND maximum_view >= $${index}`;
        countQuery += ` AND maximum_view >= $${index}`;
        queryParams.push(maximum_view);
        countParams.push(maximum_view);
        index++;
      }

      if (typeof is_active !== "undefined") {
        query += ` AND is_active = $${index}`;
        countQuery += ` AND is_active = $${index}`;
        queryParams.push(is_active);
        countParams.push(is_active);
        index++;
      }

      query += ` ORDER BY api_key_id ASC LIMIT $${index} OFFSET $${index + 1}`;
      queryParams.push(limit, offset);

      const results = await pool.query(query, queryParams);
      const countResult = await pool.query(countQuery, countParams);

      const totalItems = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);

      if (results.rowCount == 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy api key nào thỏa mãn điều kiện lọc.",
        });
      }

      const apiKeysWithLinks = results.rows.map((apiKey) => ({
        ...apiKey,
        links: {
          self: `/apikeys/${apiKey.api_key_id}`,
          update: `/apikeys/${apiKey.api_key_id}`,
          delete: `/apikeys/${apiKey.api_key_id}`,
        },
      }));

      res.status(200).json({
        success: true,
        message: "Lọc và phân trang api key thành công.",
        data: apiKeysWithLinks,
        pagination: {
          totalItems,
          totalPages,
          currentPage: parseInt(page, 10),
          pageSize: parseInt(limit, 10),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lọc và phân trang api key thất bại.",
        error: error.message,
      });
    }
  }
}

module.exports = new ApiKeyController();
