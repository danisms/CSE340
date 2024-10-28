const utilities = require(".")
const {body, validationResult} = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

const formidable = require('formidable')  // for validating multipart form data


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

validate.getCurrentAccountInfo = async (req, res, next) => {
    const { account_id } = req.body
    const userId = parseInt(account_id)
    const accountData = await accountModel.getAnAccount(userId)

    req.currentAccountInfo = accountData  // add current account information to the request object
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

        // validate Email (valid email is required and cannot already exit in the DB)
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()  // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
            const currentUserEmail = req.currentAccountInfo.account_email

            if (account_email == currentUserEmail) {
                return true
            }

            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) {
                throw new Error("Email already exists. Please use a different email")
            }
        })
    ]
}


/* *************************************
* Update User Photo Validation Rules
* *********************************** */
validate.uploadPhotoRule = () => {
    return [
       // validate photo file
        body("account_photo")
        .custom((value, { req }) => {
            if (!req.headers["content-type"].includes("multipart/form-data")) {
                // console.error('Form is not a multipart/form-data');  // for debugging purpose
                throw new Error('Form is not a multipart/form-data.');
            }
            // console.log('I just pass the first validation')  // for debugging purpose
            return true;
        }),
    ]
}

/* ******************************************************
* Check Data for errors and continue if none is found
* **************************************************** */
validate.checkFileData = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/", {
            description: "Profile Dashboard",
            title: "Dashboard",
            nav,
            errors
        })
    }

    // Build Account Update View
    async function buildAccUpdateView(req, res, account_id, errors=null) {
        let nav = await utilities.getNav()
        let data = await accountModel.getAnAccount(account_id)
        const profileName = `${data.account_firstname} ${data.account_lastname}`;
        res.render("account/update-account", {
            errors,
            description: `Update user account)`,
            title: "Edit Account (" + profileName + ")",
            nav,
            account_id,

            account_firstname: data.account_firstname,
            account_lastname: data.account_lastname,
            account_email: data.account_email
        })
        // console.log('I am here at log!')  // for testing purpose
        // return
    }

    // Using formidable to pares incoming form data
    const form = new formidable.IncomingForm({
            allowEmptyFiles: true,  // allow incoming empty form to be parsed
            minFileSize: 0  // allow file size of 0 byte
        });

    // Parse the request
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(`Form parsing error: ${err}`)  // for debugging purpose
            req.flash("notice", 'Sorry, there was an error parsing form')
            return res.redirect('/account/')
        }

        const account_id = fields.account_id[0]

        // VALIDATE DATA
        // get account_photo file
        const photoFile = files.account_photo[0];

        // Check if file has been uploaded
        if (!photoFile || photoFile.size == 0) {
            req.flash("notice", 'No file was upload. Please upload a valid file.');
            return buildAccUpdateView(req, res, account_id)
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(photoFile.mimetype)) {
            req.flash("notice", `Only image files are allowed (jpg, png, gif, webp). \nFile Type: ${photoFile.mimetype.split('/')[0]} (${photoFile.mimetype.split('/')[1]})`);
            return buildAccUpdateView(req, res, account_id)
        }

        // Check file size
        const photoMaxSize = 3 * 1024 * 1024  // 3MB max photo size
        if (photoFile.size > photoMaxSize) {
            req.flash("notice", `File size is more than the max limit of ${Math.floor(photoMaxSize/1000000)} Mb`);
            return buildAccUpdateView(req, res, account_id)
        }

        // console.log("I found no error about to move to next()");  // for testing purpose

        // send data to body
        req.form = form;
        req.body = fields;
        req.files = files;
        next()
    })
}



/* **********************************************************
* Check data and return error or continue to update
* ******************************************************** */
validate.checkUpdateInfoData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const currentAccountInfo = req.currentAccountInfo

    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const profileName = `${currentAccountInfo.account_firstname} ${currentAccountInfo.account_lastname}`;
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