
const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user.controller')
const checkPermission = require('../../middlewares/checkPermission.middleware')
const checkAuth = require('../../middlewares/checkAuth.middleware')
const checkIsAdmin = require('../../middlewares/checkIsAdmin.middleware')


router.use(checkAuth, checkIsAdmin)
router.delete('/users/:id', userController.deleteUser)
router.put('/users/:id', userController.updateUser)
router.get('/users/:id', userController.getUserById)
router.post('/users', userController.createUser)
router.get('/users', userController.getUsers)

module.exports = router