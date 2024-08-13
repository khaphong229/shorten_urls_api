
const { pool } = require('../../config/db')

class UserController{
    createUser(req, res){
        
    }
    getUsers(req, res){
        pool.query('SELECT * FROM users', (error, results) => {
            if (error){
                throw error
            }
            res.status(200).json(results.rows)
        })
    }
    getUserById(req, res){

    }
    updateUser(req, res){

    }
    deleteUser(req, res){

    }
}

module.exports = new UserController()