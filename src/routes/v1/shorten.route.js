
const express = require('express')
const router = express.Router()
const shortenController = require('../../controllers/shorten.controller')
const checkAuth = require('../../middlewares/checkAuth.middleware')

router.delete('/shortenurls/:id', checkAuth, shortenController.deleteShorten)
router.put('/shortenurls/:id', checkAuth, shortenController.updateShorten)
router.get('/shortenurls/:id', checkAuth, shortenController.getShortenById)
router.post('/shortenurls', checkAuth, shortenController.createShorten)
router.get('/shortenurls', checkAuth, shortenController.getAllShortens)

module.exports = router