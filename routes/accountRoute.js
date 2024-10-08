// Need Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require('../utilities/')
const regValidate = require("../utilities/account-validation")

// Route to build login view
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Route to build register view
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Route to process registration
router.post(
    '/process-registration',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post (
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    (req, res) => {
        res.status(200).send('login process')
    }
)

module.exports = router;