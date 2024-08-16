
const { pool } = require('../configs/db.config')

class UserController{
    async createUser(req, res) {
        const { username, email, password } = req.body;
    
        try {
            const result = await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
                [username, email, password]
            );
    
            res.status(201).json({
                success: true,
                message: 'Tạo người dùng thành công.',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Tạo người dùng thất bại.',
                error: error.message
            });
        }
    }    
    async getUsers(req, res){
        try {     
            const results = await pool.query('SELECT * FROM users')
            // console.log(results);
            
            if (results.rowCount==0) {
                return res.status(500).json({
                    success: false,
                    message: 'Không tồn tại người dùng nào.',
                })
            }
            
            res.status(200).json({
                success: true,
                message: 'Truy vấn tất cả người dùng thành công.',
                data: results.rows
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Truy vấn tất cả người dùng thất bại.',
                error: error.message
            })
        }
    }
    async getUserById(req, res) {
        const id = parseInt(req.params.id);
        
        try {
            const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Người dùng id=${id} không tồn tại.`,
                });
            }
    
            res.status(200).json({
                success: true,
                message: `Truy vấn người dùng id=${id} thành công.`,
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Truy vấn người dùng id=${id} thất bại.`,
                error: error.message
            });
        }
    }
    async updateUser(req, res) {
        const id = parseInt(req.params.id);
        const { username, email, password } = req.body;
    
        try {
            const result = await pool.query(
                'UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4',
                [username, email, password, id]
            );
    
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Người dùng id=${id} không tồn tại.`,
                });
            }
    
            res.status(200).json({
                success: true,
                message: `Cập nhật người dùng id=${id} thành công.`,
                data: {
                    username,
                    email,
                    password
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Cập nhật người dùng id=${id} thất bại.`,
                error: error.message
            });
        }
    }
    async deleteUser(req, res) {
        const id = parseInt(req.params.id);
    
        try {
            const result = await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    
            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Người dùng id=${id} không tồn tại.`,
                });
            }
    
            res.status(200).json({
                success: true,
                message: `Xóa người dùng id=${id} thành công.`,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Xóa người dùng id=${id} thất bại.`,
                error: error.message
            });
        }
    }    
}

module.exports = new UserController()