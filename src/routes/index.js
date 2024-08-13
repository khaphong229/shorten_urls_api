
const userRouter = require('./user')

function route(app){
    app.use('/v1/api/users', userRouter)
}

module.exports = route