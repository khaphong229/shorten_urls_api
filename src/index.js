
const express = require('express')
const morgan = require('morgan')
const route = require('./routes/index')
const db = require('./config/db')
const app = express()
const port = 3000

//config morgan
app.use(morgan('combined'))

db.connect()

//config mvc
route(app)

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})