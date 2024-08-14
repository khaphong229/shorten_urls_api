
const userRouter = require('./user')
const siteRouter = require('./site')

function route(app){
    app.use('/api/v1', userRouter),
    app.use('/', siteRouter)
}

module.exports = route