
const express = require('express')
const router = express.Router()
const shortenController = require('../../controllers/shorten.controller')

router.delete('/shortenurls/:id', shortenController.deleteShorten)
router.put('/shortenurls/:id', shortenController.updateShorten)
router.get('/shortenurls/:id', shortenController.getShortenById)
router.post('/shortenurls', shortenController.createShorten)
router.get('/shortenurls', shortenController.getAllShortens)

module.exports = router