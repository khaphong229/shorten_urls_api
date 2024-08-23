const express = require('express');
const morgan = require('morgan');
const route = require('./routes/v1/index.route');
const db = require('./configs/db.config');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//config body-parser
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

//config morgan
app.use(morgan('combined'));

/// connect to database
db.connect();

//config mvc
route(app);

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
