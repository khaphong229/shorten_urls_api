
const { pool } = require('../configs/db.config')
const shorten = require('../utils/shorten.util')

class ShortenController {
    async createShorten(req, res) {
        try {
            const user_id = req.user.rows[0].user_id
            const apiKeyResult = await pool.query('SELECT * FROM apikeys WHERE is_used = true and user_id = $1', [user_id])
            const api_key_id = apiKeyResult.rows[0].api_key_id
            
            const { original_url } = req.body
            
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
            
            const alias = Math.random().toString(36).substring(2, 12)

            const result_save = await pool.query(
                'INSERT INTO shortenurls (original_url, short_url, api_key_id, alias) VALUES ($1, $2, $3, $4)',
                [original_url, short_url, api_key_id, alias])
            res.status(200).json({
                success: true,
                message: 'Rút gọn link thành công.',
                data: {
                    alias,
                    original_url,
                    short_url,
                    api_key_id
                }
            })
        } catch(error) {
            res.status(500).json({
                success: false,
                message: 'Rút gọn link thất bại',
                error: error.message
            })
        }
    }
    async getAllShortens(req, res) {
        try {
            let results
            if (req.user.rows[0].is_superuser) {
                results = await pool.query('SELECT * FROM shortenurls');
            } else {
                results = await pool.query('SELECT * FROM shortenurls WHERE api_key_id IN (SELECT api_key_id FROM apikeys WHERE user_id = $1)', [req.user.rows[0].user_id])
            }
            
            res.status(200).json({
                success: true,
                message: 'Lấy tất cả các link rút gọn thành công.',
                data: results.rows
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lấy tất cả các link rút gọn thất bại.',
                error: error.message
            })
        }
    }
    async getShortenById(req, res) {
        try {
            const id = req.params.id;

            const result = await pool.query('SELECT * FROM shortenurls WHERE id = $1', [id])                                
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy link rút gọn với ID này.'
                })
            }

            const resultUserId = await pool.query(`SELECT users.user_id
                FROM shortenurls
                JOIN apikeys ON shortenurls.api_key_id = apikeys.api_key_id
                JOIN users ON apikeys.user_id = users.user_id
                WHERE shortenurls.id = $1;
                `, [id])
                
            const user_id = resultUserId.rows[0].user_id
            const currentShorten = result.rows[0]
            
            await pool.query('UPDATE shortenurls SET click_count = click_count + 1 WHERE id = $1', [id])

            const apiKeyResult = await pool.query(
                'SELECT * FROM apikeys WHERE is_used = true AND user_id = $1',
                [user_id]
            )
    
            if (apiKeyResult.rowCount === 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Người dùng không có api key nào đang bật.'
                })
            }
    
            const activeApiKey = apiKeyResult.rows[0]
    
            if (currentShorten.api_key_id !== activeApiKey.api_key_id) {
                const newShortUrl = await shorten(currentShorten.original_url, activeApiKey.api_key)
    
                const updated = await pool.query(
                    'UPDATE shortenurls SET short_url = $1, api_key_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
                    [newShortUrl, activeApiKey.api_key_id, id]
                )
    
                return res.status(200).json({
                    success: true,
                    message: 'API key của link đã thay đổi, link đã được cập nhật.',
                    data: updated.rows[0]
                })
            }
            
            res.status(200).json({
                success: true,
                message: 'Lấy link rút gọn thành công.',
                data: currentShorten
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lấy link rút gọn thất bại.',
                error: error.message
            })
        }
    }    
    async updateShorten(req, res) {
        try {
            const id = req.params.id;

            const result = await pool.query('SELECT * FROM shortenurls WHERE id = $1', [id]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy link rút gọn với ID này.'
                });
            }
    
            const currentShorten = result.rows[0]

            const user_id = req.user.rows[0].user_id
            const apiKeyResult = await pool.query('SELECT * FROM apikeys WHERE is_used = true AND user_id = $1', [user_id])

            if(apiKeyResult.rowCount === 0){
                return res.status(500).json({
                    success: false,
                    message: 'Người dùng không có api key nào đang bật.'
                })
            }
            
            const activeApiKey = apiKeyResult.rows[0]

            if (currentShorten.api_key_id !== activeApiKey.api_key_id) {
                const newShortUrl = await shorten(currentShorten.original_url, activeApiKey.api_key)
                
                const updated = await pool.query(
                    'UPDATE shortenurls SET short_url = $1, api_key_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
                    [newShortUrl, activeApiKey.api_key_id, id]
                );
        
                return res.status(200).json({
                    success: true,
                    message: 'Cập nhật link rút gọn thành công với API key mới.',
                    data: updated.rows[0]
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Không có bất cứ thay đổi gì trên link rút gọn.',
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
            const id = req.params.id;
            const result = await pool.query('SELECT * FROM shortenurls WHERE id = $1', [id]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy link rút gọn với ID này.'
                });
            }
    
            const resultQuery = await pool.query('SELECT * FROM apikeys WHERE api_key_id IN (SELECT api_key_id FROM shortenurls WHERE id = $1)', [id])

            const userIsAuthorized = req.user.rows[0].is_superuser || apiKeyResult.rows[0].user_id === req.user.rows[0].user_id;
            if (!userIsAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa Api Key này.',
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
    async filterAndPaginateShorten(req, res) {
        try {
            const user_id = req.user.rows[0].user_id
            const { alias = '', page = 1, limit = 10 } = req.query
            const offset = (page - 1) * limit
            
            let query = `SELECT * FROM shortenurls WHERE api_key_id in (SELECT api_key_id FROM apikeys WHERE user_id = $1)`
            let countQuery = `SELECT COUNT(*) FROM shortenurls WHERE api_key_id in (SELECT api_key_id FROM apikeys WHERE user_id = $1)`
            const queryParams = [user_id]
            const countParams = [user_id]
    
            if (alias) {
                queryParams.push(`%${alias}%`)
                countParams.push(`%${alias}%`)
                query += ` AND alias ILIKE $${queryParams.length}`
                countQuery += ` AND alias ILIKE $${countParams.length}`
            }
    
            queryParams.push(limit, offset)
            query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`

            const result = await pool.query(query, queryParams)
    
            const countResult = await pool.query(countQuery, countParams)
    
            const totalItems = parseInt(countResult.rows[0].count, 10)
            const totalPages = Math.ceil(totalItems / limit)
    
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách Short Links thành công.',
                data: result.rows,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: parseInt(page, 10),
                    limit: parseInt(limit, 10)
                }
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lấy danh sách Short links thất bại.',
                error: error.message
            })
        }
    }
}

module.exports = new ShortenController()