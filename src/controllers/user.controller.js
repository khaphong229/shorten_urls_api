
const { pool } = require('../configs/db.config')

class UserController{
    createUser(req, res){
        const { username, email, password }= req.body
        pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, password], (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: `Tạo người dùng thất bại.`,
                        error: error.message
                    })
                }
                res.status(201).json({
                    success: true,
                    message: `Tạo người dùng thành công.`,
                    data: {
                        username,
                        email,
                        password
                    }
                })
            }
        )
    }
    getUsers(req, res){
        pool.query('SELECT * FROM users', (error, results) => {
            if (error){
                return res.status(500).json({
                    success: false,
                    message: 'Truy vấn tất cả người dùng thất bại.',
                    error: error.message
                })
            }
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
        })
    }
    getUserById(req, res){
        const id = parseInt(req.params.id)
        pool.query('SELECT * FROM users WHERE user_id=$1', [id], (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: `Truy vấn người dùng id=${id} thất bại.`,
                    error: error.message
                })
            }
            if (result.rows.length==0){
                return res.status(500).json({
                    success: false,
                    message: `Người dùng id=${id} không tồn tại.`,
                })
            }
            res.status(200).json({
                success: true,
                message: `Truy vấn người dùng id=${id} thành công.`,
                data: result.rows
            })
        })
    }
    updateUser(req, res){
        const id = parseInt(req.params.id)
        const { username, email, password } = req.body
        pool.query('UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4', [ username, email, password, id ], (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: `Cập nhật người dùng id=${id} thất bại.`,
                    error: error.message
                })
            }
            if (result.rowCount==0) {
                return res.status(500).json({
                    success: false,
                    message: `Người dùng id=${id} không tồn tại.`,
                })
            }
            res.status(201).json({
                success: true,
                message: `Cập nhật người dùng id=${id} thành công.`,
                data: {
                    username,
                    email,
                    password
                }
            })
        })
    }
    deleteUser(req, res){
        const id = parseInt(req.params.id)
        pool.query('DELETE FROM users WHERE user_id = $1', [id], (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: `Xóa người dùng id=${id} thất bại.`,
                    error: error.message
                })
            }
            if (result.rowCount==0) {
                return res.status(500).json({
                    success: false,
                    message: `Người dùng id=${id} không tồn tại.`,
                })
            }
            res.status(200).json({
                success: true,
                message: `Xóa người dùng id=${id} thành công.`,
            })
        })
    }
}

module.exports = new UserController()