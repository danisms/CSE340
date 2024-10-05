// Need Resources
const express = require("express")
const router = new express.Router()
const testErrorController = require("../controllers/testErrorController")
const utilities = require('../utilities/')

// Route to test induced intensional 500 error
router.get("/500", utilities.handleErrors(testErrorController.buildIntentional500Error));

module.exports = router;