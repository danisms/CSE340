/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")
const env = require("dotenv").config()
const bodyParser = require("body-parser")
const app = express()

const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const testErrorRoute = require("./routes/testErrorRoute")

const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
// add session modules
const session = require("express-session")
const pool = require('./database/')


/* ***********************
* Middleware
* ***********************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Message Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))  // for parsing application/x-www-form-urlencoded

// CookieParser MiddleWare
app.use(cookieParser())

// check for jwt token and verify token if exist
app.use(utilities.checkJWTToken)


/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")  // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute)
// Account routes
app.use("/account", accountRoute)
// Test error routes
app.use("/test-error", testErrorRoute)
// File Not Found Route - must be last route in the route list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  let description = 'Error Page'
  let errorHumor = await utilities.getErrorDisplayHumor()
  if (err.status == 404) {
    message = err.message
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }
  // log error to terminal
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  // respond to page with error message
  res.render("errors/error", {
    description,
    title: err.status || 'Server Error',
    message,
    nav,
    errorHumor
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
