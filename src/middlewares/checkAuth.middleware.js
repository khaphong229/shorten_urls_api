
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { pool } = require('../configs/db.config')

async function checkAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chưa đăng nhập rồi.'
            })
        }
        
        const decoded = jwt.verify(token, process.env.SECRET_CODE)
        const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id])
        if (!user.rows[0]) {
            return res.status(403).json({
                success: false,
                message: 'Token lỗi rồi'
            })
        }
        req.user = user
        next()
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Xác thực thất bại.',
            error: error.message
        })
    }
}

module.exports = checkAuth