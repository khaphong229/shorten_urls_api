
const express = require('express')
const router = express.Router()
const apikeyController = require('../../controllers/apikey.controller')
const checkAuth = require('../../middlewares/checkAuth.middleware')
const checkIsMember = require('../../middlewares/checkIsMember.middleware')


router.delete('/apikeys/:id', checkAuth, apikeyController.deleteApiKey)
router.put('/apikeys/:id', checkAuth, apikeyController.updateApiKey)
router.get('/apikeys/:id', checkAuth, apikeyController.getApiKeysById)
router.post('/apikeys', checkAuth, apikeyController.createApiKey)
router.get('/apikeys', checkAuth, apikeyController.getApiKeys)

module.exports = router