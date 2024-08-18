
const userRouter = require('./user.route')
const siteRouter = require('./site.route')
const authRouter = require('./auth.route')
const apiKeyRouter = require('./apikey.route')
const shortenRouter = require('./shorten.route')

function route(app){
    app.use('/api/v1/', shortenRouter),
    app.use('/api/v1/', apiKeyRouter),
    app.use('/api/v1/auth', authRouter),
    app.use('/api/v1', userRouter),
    app.use('/', siteRouter)
}

module.exports = route