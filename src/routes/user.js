
const express = require('express')
const router = express.Router()
const userController = require('../app/controllers/UserController')

router.delete('/:id', userController.deleteUser)
router.put('/:id', userController.updateUser)
router.get('/:id', userController.getUserById)
router.post('/', userController.createUser)
router.get('/', userController.getUsers)

module.exports = router