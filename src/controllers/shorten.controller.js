
const { pool } = require('../configs/db.config')
const shorten = require('../utils/shorten.util')

class ShortenController {
    async createShorten(req, res) {
        try {
            const { original_url, api_key_id } = req.body
            
            const result1 = await pool.query('SELECT * FROM apikeys WHERE api_key_id = $1', [api_key_id])
            if (result1.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'API Key không hợp lệ'
                });
            }

            const existingLink = await pool.query('SELECT * FROM shortenurls WHERE original_url = $1', [original_url]);
            if (existingLink.rows.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Link đã được rút gọn trước đó.',
                    data: existingLink.rows[0]
                });
            }

            const api_key_url = result1.rows[0].api_key
            const short_url = await shorten(original_url, api_key_url)
            
            const result_save = await pool.query('INSERT INTO shortenurls (original_url, short_url, api_key_id) VALUES ($1, $2, $3)', [original_url, short_url, api_key_id])
            res.status(200).json({
                success: true,
                message: 'Rút gọn link thành công.',
                data: result_save.rows[0]
            })
        } catch(error) {
            res.status(500).json({
                success: false,
                message: 'Rút gọn link thất bại',
                error: error.message
            });
        }
    }
    async getAllShortens(req, res) {
        try {
            const result = await pool.query('SELECT * FROM shortenurls ORDER BY created_at DESC');
    
            res.status(200).json({
                success: true,
                message: 'Lấy tất cả các link rút gọn thành công.',
                data: result.rows
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lấy tất cả các link rút gọn thất bại.',
                error: error.message
            });
        }
    }
    async getShortenById(req, res) {
        try {
            const id = req.params.id;
    
            const result = await pool.query('SELECT * FROM shortenurls WHERE id = $1', [id]);
    
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy link rút gọn với ID này.'
                });
            }
    
            res.status(200).json({
                success: true,
                message: 'Lấy link rút gọn thành công.',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lấy link rút gọn thất bại.',
                error: error.message
            });
        }
    }
    
    async updateShorten(req, res) {
        try {
            const id = req.params.id;
            const { original_url, short_url } = req.body;
    
            const result = await pool.query('SELECT * FROM shortenurls WHERE id = $1', [id]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy link rút gọn với ID này.'
                });
            }
    
            const updated = await pool.query(
                'UPDATE shortenurls SET original_url = $1, short_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
                [original_url || result.rows[0].original_url, short_url || result.rows[0].short_url, id]
            );
    
            res.status(200).json({
                success: true,
                message: 'Cập nhật link rút gọn thành công.',
                data: updated.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Cập nhật link rút gọn thất bại.',
                error: error.message
            });
        }
    }
    async deleteShorten(req, res) {
        try {
            const { id } = req.params;
    
            const result = await pool.query('SELECT * FROM shortenurls WHERE id = $1', [id]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy link rút gọn với ID này.'
                });
            }
    
            await pool.query('DELETE FROM shortenurls WHERE id = $1', [id]);
    
            res.status(200).json({
                success: true,
                message: 'Xóa link rút gọn thành công.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Xóa link rút gọn thất bại.',
                error: error.message
            });
        }
    }
}

module.exports = new ShortenController()