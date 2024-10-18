// Need Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require('../utilities/')
const regValidate = require("../utilities/account-validation")

// Route to build login view
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Route to logout user
router.get('/logout', utilities.handleErrors(accountController.accountLogout))

// Route to build register view
router.get('/register', utilities.handleErrors(accountController.buildRegister))

// Account Dashboard
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildDashboard))

// Update User Account
router.get('/update-account/:accountId', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdateView))


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
    utilities.handleErrors(accountController.accountLogin)
)

// Route to process account-info update
router.post(
    '/process-account-info-update',
    regValidate.updateInfoRules(),
    regValidate.checkUpdateInfoData,
    utilities.handleErrors(accountController.updateAccountInfo)
)


// Route to process change password update
router.post(
    '/process-account-password-update',
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountController.updatePassword)
)


module.exports = router;