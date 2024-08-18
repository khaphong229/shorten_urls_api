
const express = require('express')
const router = express.Router()
const apikeyController = require('../../controllers/apikey.controller')
const checkAuth = require('../../middlewares/checkAuth.middleware')
const checkIsMember = require('../../middlewares/checkIsMember.middleware')


router.delete('/apikeys/:id', apikeyController.deleteApiKey)
router.put('/apikeys/:id', apikeyController.updateApiKey)
router.get('/apikeys/:id', apikeyController.getApiKeysById)
router.post('/apikeys', apikeyController.createApiKey)
router.get('/apikeys', apikeyController.getApiKeys)

module.exports = router