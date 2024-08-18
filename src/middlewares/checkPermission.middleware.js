
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { pool } = require('../configs/db.config')

async function checkPermission(req, res, next) {
    try {
        //B1: Người dùng đăng nhập hay chưa?
        const token = req.headers.authorization?.split(" ")[1]
        
        //b2: kiểm tra token 
        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chưa đăng nhập rồi.'
            })
        }
        //kiểm tra quyền người dùng 
        const decoded = jwt.verify(token, process.env.SECRET_CODE)
        const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id])
        if (!user.rows[0]) {
            return res.status(403).json({
                success: false,
                message: 'Token lỗi rồi'
            })
        }

        if(user.rows[0].is_superuser !== true) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không có quyền làm việc này'
            })
        }

        next()

    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = checkPermission