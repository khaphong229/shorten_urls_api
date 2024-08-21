
const { pool } = require('../configs/db.config')
const getNameApiKey = require('../utils/getNameApiKey.util')
const apiKeyValidate = require('../validations/apiKey.validation')

class ApiKeyController {
    async createApiKey(req, res) {
        const { api_key } = req.body;
    
        try {

            if (!apiKeyValidate(api_key)) {
                res.status(400).json({
                    success: false,
                    message: 'Định dạng Api Key không đúng với yêu cầu.'
                })
            }

            const user_id = req.user.rows[0].user_id
            const resultCheckExist = await pool.query('SELECT * FROM apikeys WHERE api_key = $1', [req.body.api_key])
            if (resultCheckExist.rowCount!=0) {
                return res.status(400).json({
                    success: false,
                    message: 'Api Key này đã tồn tại! Vui lòng lựa chọn Api Key khác.'
                })
            }

            // const name_api = api_key.split('/')[2].split('.')[0]
            const name_api = getNameApiKey(api_key)

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
            let results
            if (req.user.rows[0].is_superuser) {
                results = await pool.query('SELECT * FROM apikeys ORDER BY api_key_id ASC')
            } else {
                results = await pool.query('SELECT * FROM apikeys WHERE user_id = $1 ORDER BY api_key_id ASC', [req.user.rows[0].user_id])
            }

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
            
            if (!req.user.rows[0].is_superuser && result.rows[0].user_id !== req.user.rows[0].user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập Api Key này.',
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
        const { api_key, is_used } = req.body;
        
        try {
            const result = await pool.query('SELECT * FROM apikeys WHERE api_key_id = $1', [api_key_id])
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Api Key id=${api_key_id} không tồn tại.`,
                })
            }

            if(!req.user.rows[0].is_superuser && result.rows[0].user_id !== req.user.rows[0].user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền cập nhật Api Key này.',
                })
            }

            let updateQuery = 'UPDATE apikeys SET '
            let queryValues = [] 
            let queryIndex = 1

            if (api_key) {
                if (!apiKeyValidate(api_key)) {
                    res.status(400).json({
                        success: false,
                        message: 'Định dạng Api Key không đúng với yêu cầu.'
                    })
                }

                const name_api = getNameApiKey(api_key)
                updateQuery += `api_key = $${queryIndex++}, name_api = $${queryIndex++},`
                queryValues.push(api_key, name_api)
            }

            if (typeof is_used !== undefined) {
                const checkResult = await pool.query('SELECT * FROM apikeys WHERE user_id = $1 and is_used = true', [req.user.rows[0].user_id])
                if (checkResult.rowCount >= 1 && checkResult.rows[0].api_key_id !== api_key_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Không thể bật 2 chế độ Api Key cùng 1 lúc. Chỉ để được 1 cái thôi nhé!'
                    })
                }
                updateQuery += ` is_used = $${queryIndex++},`
                queryValues.push(is_used)
            }
            updateQuery += ' updated_at = NOW(),'
            updateQuery = updateQuery.slice(0, -1)
            updateQuery += ` WHERE api_key_id = $${queryIndex++}`
            queryValues.push(api_key_id)
            
            const updateResult = await pool.query(updateQuery, queryValues)

            res.status(200).json({
            success: true,
            message: `Cập nhật Api Key id=${api_key_id} thành công.`,
            data: {
                api_key_id,
                api_key: api_key || result.rows[0].api_key,
                name_api: api_key ? getNameApiKey(api_key) : result.rows[0].name_api,
                is_used: typeof is_used !== 'undefined' ? is_used : result.rows[0].is_used
            }
            })
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
            const result = await pool.query('SELECT * FROM apikeys WHERE api_key_id = $1', [api_key_id]);
    
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Api Key id=${api_key_id} không tồn tại.`,
                });
            }
    
    
            if (!req.user.rows[0].is_superuser && result.rows[0].user_id !== req.user.rows[0].user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa Api Key này.',
                });
            }
    
            const deleteResult = await pool.query('DELETE FROM apikeys WHERE api_key_id = $1', [api_key_id]);
    
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