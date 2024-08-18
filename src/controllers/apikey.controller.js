
const { pool } = require('../configs/db.config')

class ApiKeyController {
    async createApiKey(req, res) {
        const { api_key, user_id } = req.body;
    
        try {
            const resultCheckExist = await pool.query('SELECT * FROM apikeys WHERE api_key = $1', [req.body.api_key])
            if (resultCheckExist.rowCount!=0) {
                return res.status(400).json({
                    success: false,
                    message: 'Api Key này đã tồn tại! Vui lòng lựa chọn Api Key khác.'
                })
            }

            const name_api = api_key.split('/')[2].split('.')[0]
            const result = await pool.query(
                'INSERT INTO apikeys (api_key, user_id, name_api) VALUES ($1, $2, $3) RETURNING *',
                [api_key, user_id, name_api]
            );
    
            res.status(201).json({
                success: true,
                message: 'Tạo Api Key thành công.',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Tạo Api Key thất bại.',
                error: error.message
            });
        }
    }
    async getApiKeys(req, res) {
        try {
            const results = await pool.query('SELECT * FROM apikeys')

            if (results.rowCount==0) {
                return res.status(500).json({
                    success: false,
                    message: 'Không tồn tại api key nào.'
                })
            }

            res.status(200).json({
                success: true,
                message: 'Truy vấn api key thành công.',
                data: results.rows
            })

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Truy vấn api key thất bại.',
                error: error.message
            })
        }
    }
    async getApiKeysById(req, res) {
        const api_key_id = parseInt(req.params.id);
        
        try {
            const result = await pool.query('SELECT * FROM apikeys WHERE api_key_id = $1', [api_key_id]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Api Key id=${api_key_id} không tồn tại.`,
                });
            }
    
            res.status(200).json({
                success: true,
                message: `Truy vấn Api Key id=${api_key_id} thành công.`,
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Truy vấn Api Key id=${api_key_id} thất bại.`,
                error: error.message
            });
        }

    }
    async updateApiKey(req, res) {
        const api_key_id = parseInt(req.params.id);
        const { api_key } = req.body;
    
        try {
            const result = await pool.query(
                'UPDATE apikeys SET api_key = $1 WHERE api_key_id = $2',
                [api_key, api_key_id]
            );
    
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Api Key id=${api_key_id} không tồn tại.`,
                });
            }
    
            res.status(200).json({
                success: true,
                message: `Cập nhật Api Key id=${api_key_id} thành công.`,
                data: {
                    api_key_id,
                    api_key
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Cập nhật Api Key id=${api_key_id} thất bại.`,
                error: error.message
            });
        }
    }
    async deleteApiKey(req, res) {
        const api_key_id = parseInt(req.params.id);
    
        try {
            const result = await pool.query('DELETE FROM apikeys WHERE api_key_id = $1', [api_key_id]);
    
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Api Key id=${api_key_id} không tồn tại.`,
                });
            }
    
            res.status(200).json({
                success: true,
                message: `Xóa Api Key id=${api_key_id} thành công.`,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Xóa Api Key id=${api_key_id} thất bại.`,
                error: error.message
            });
        }
    }
}

module.exports = new ApiKeyController()