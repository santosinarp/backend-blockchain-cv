const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const config = require('./config/config')
const routes = require('./routes/routes')
const cors = require('cors')
const validator = require('express-validator')

require('dotenv').config()

const app = express();

app.use(bodyParser.json())
app.use(morgan("combined"))
app.use(cors())
app.use(validator())

// make it in last line of app.use()
app.use('/api/v0',routes)


// PORT
const port = config.port
app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})
