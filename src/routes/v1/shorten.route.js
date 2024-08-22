
const express = require('express')
const router = express.Router()
const shortenController = require('../../controllers/shorten.controller')
const checkAuth = require('../../middlewares/checkAuth.middleware')
const checkAdmin = require('../../middlewares/checkIsAdmin.middleware')

router.get('/shortenurls/filter', checkAuth, shortenController.filterAndPaginateShorten)
router.delete('/shortenurls/:id', checkAuth, checkAdmin, shortenController.deleteShorten)
router.put('/shortenurls/:id', checkAuth, shortenController.updateShorten)
router.get('/shortenurls/:id', shortenController.getShortenById)
router.post('/shortenurls', checkAuth, shortenController.createShorten)
router.get('/shortenurls', checkAuth, shortenController.getAllShortens)

module.exports = router