
const { pool } = require('../configs/db.config')
const { signUpValidator, signInValidator } = require('../validations/user.validation')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

class AuthController {
    signUp(req, res){
        // validate
        const { error } = signUpValidator.validate(req.body, { abortEarly: false })
        if (error) {
            const errors = error.details.map(err => err.message)
            return res.status(400).json({
                success: false,
                message: errors
            })
        }
        // check email exist
        pool.query('SELECT * FROM users WHERE email = $1', [req.body.email], (error, result) => {
            if (result.rowCount != 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email này đã được đăng ký rồi! Bạn đăng ký email khác nhé"
                })
            }
        })
        //encode the password
        const hashedPassword = bcryptjs.hash(req.body.password, 10)
        //create user
        const { username, email }= req.body
        pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword], (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: `Tạo tài khoản thất bại.`,
                        error: error.message
                    })
                }
                res.status(201).json({
                    success: true,
                    message: `Tạo tài khoản thành công.`,
                    data: {
                        username,
                        email,
                    }
                })
            }
        )
    }
    signIn(req, res){

        const { error } = signInValidator.validate(req.body, { abortEarly: false })
        if (error) {
            const errors = error.details.map(err => err.message)
            return res.status(400).json({
                success: false,
                message: errors
            })
        }

        var user = {}
        pool.query('SELECT * FROM users WHERE email = $1', [req.body.email], (error, result) => {
            if (result.rowCount == 0) {
                return res.status(404).json({
                    success: false,
                    message: "Email chưa được đăng ký! Bạn đăng ký email đi nhé!"
                })
            }
            user = result.rows[0]
        })
        
        console.log(user);
        

        const isMatch = bcryptjs.compare(req.body.password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu không đúng'
            })
        }

        const accessToken = jwt.sign({user_id: user.user_id}, process.env.SECRET_CODE)

        const { user_id, username, email } = user
        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: [
                user_id,
                username,
                email,
            ],
            accessToken
        })
    }
}

module.exports = new AuthController()