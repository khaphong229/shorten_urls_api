
const { pool } = require('../configs/db.config')
const { signUpValidator, signInValidator } = require('../validations/user.validation')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

class AuthController {
    async signUp(req, res) {
        try {
            // Validate the request body
            const { error } = signUpValidator.validate(req.body, { abortEarly: false })
            if (error) {
                const errors = error.details.map(err => err.message)
                return res.status(400).json({
                    success: false,
                    messages: errors
                })
            }
    
            // Check if the email already exists
            const emailResult = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email])
            if (emailResult.rowCount != 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email này đã được đăng ký rồi! Bạn đăng ký email khác nhé"
                })
            }
    
            // Encode the password
            const hashedPassword = await bcryptjs.hash(req.body.password, 10)
    
            // Create a new user
            const { username, email } = req.body
            const result = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword])
    
            res.status(201).json({
                success: true,
                message: `Tạo tài khoản thành công.`,
                data: {
                    username: result.rows[0].username,
                    email: result.rows[0].email,
                }
            })
            
        } catch (err) {
            // Handle errors
            console.error(err)
            res.status(500).json({
                success: false,
                message: `Tạo tài khoản thất bại.`,
                error: err.message
            })
        }
    }
    

    async signIn(req, res) {
        const { error } = signInValidator.validate(req.body, { abortEarly: false })
        if (error) {
            const errors = error.details.map(err => err.message)
            return res.status(400).json({
                success: false,
                messages: errors
            })
        }
    
        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email])
            if (result.rowCount == 0) {
                return res.status(404).json({
                    success: false,
                    message: "Email chưa được đăng ký! Bạn đăng ký email đi nhé!"
                })
            }
            
            const user = result.rows[0]
            
            const isMatch = await bcryptjs.compare(req.body.password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu không đúng'
                })
            }
    
            const accessToken = jwt.sign({ user_id: user.user_id }, process.env.SECRET_CODE)
            const { user_id, username, email } = user
    
            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công!",
                data: { user_id, username, email },
                accessToken
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi xử lý yêu cầu."
            })
        }
    }
    
}

module.exports = new AuthController()