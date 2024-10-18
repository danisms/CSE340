const utilities = require(".")
const {body, validationResult} = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}


/* *************************************
* Registration Data Validation Rules
* *********************************** */
validate.registrationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be a string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1})
        .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exit in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()  // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) {
                throw new Error("Email exists. Please log in or use different email")
            }
        }),

        // password is required and must be strong password
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}


/* **********************************************************
* Check data and return error or continue to registration
* ******************************************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            description: "Registration Page",
            title: "Sign-up",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}


/* *************************************
* Login Data Validation Rules
* *********************************** */
validate.loginRules = () => {
    return [
        // valid email is required and cannot already exit in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()  // refer to validator.js docs
        .withMessage("A valid email is required."),

        // password is required and must be strong password
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}


/* **********************************************************
* Check data and return error or continue to registration
* ******************************************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            description: "Login Page",
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/* *************************************
* Update User Info Data Validation Rules
* *********************************** */
validate.updateInfoRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be a string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1})
        .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exit in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()  // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) {
                throw new Error("Email already exists. Please use a different email")
            }
        }),
    ]
}

/* **********************************************************
* Check data and return error or continue to update
* ******************************************************** */
validate.checkUpdateInfoData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const profileName = `${account_firstname} ${account_lastname}`;
        res.render("account/update-account", {
            errors,
            description: `Update user account)`,
            title: "Edit Account (" + profileName + ")",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id,

            account_password: null
        })
        return
    }
    next()
}

/* *************************************
* Update Password Data Validation Rules
* *********************************** */
validate.updatePasswordRules = () => {
    return [
      // password is required and must be strong password
      body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
    ]
}

/* **********************************************************
* Check data and return error or continue to update
* ******************************************************** */
validate.checkUpdatePasswordData = async (req, res, next) => {
    const { account_password, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let data = await accountModel.getAnAccount(account_id)
        const profileName = `${data.account_firstname} ${data.account_lastname}`;
        res.render("account/update-account", {
            errors,
            description: `Update user account)`,
            title: "Edit Account (" + profileName + ")",
            nav,
            account_password,
            account_id,

            account_firstname: data.account_firstname,
            account_lastname: data.account_lastname,
            account_email: data.account_email
        })
        return
    }
    next()
}

module.exports = validate