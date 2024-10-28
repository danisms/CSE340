const utilities = require('../utilities/')
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const formidable = require('formidable')
const fs = require('fs');
const path = require('path');
require("dotenv").config()

/* ***************************************
* Deliver Login View
* ************************************* */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    // req.flash("notice", "This is a flash message.")  // for testing
    res.render("account/login", {
        description: "Login Page",
        title: "Login",
        nav,
        errors: null,
    })
}

/* **************************************
* Process login request
* ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash('notice', 'Please check your email and try again.')
        res.status(400).render("account/login", {
            description: "login page",
            title: 'Login',
            nav,
            errors: null,
            account_email,
            account_password: null
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        } else {
            req.flash('notice', 'Please check your password and try again.')
            res.status(400).render("account/login", {
                description: "login page",
                title: 'Login',
                nav,
                errors: null,
                account_email,
                account_password: account_password
            })
        }
    } catch (error) {
        return new Error('Access Forbidden')
    }
}


/* ***************************************
* Deliver Registration View
* ************************************* */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        description: "Registration page",
        title: "Sign-up",
        nav,
        errors: null,
    })
}

/* **************************************
* Process Registration
* ************************************ */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            description: "Registration Page",
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount (
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash ("notice", `Congratulations, you are registered ${account_firstname}. Please log in.`)
        res.status(201).render("account/login", {
            description: "login page",
            title: "Login",
            nav,
            errors: null
        })
    } else {
        req.flash ("notice", "Sorry, the registration failed.")
        res.status(501).render("account/registration", {
            description: "registration page",
            title: "Registration",
            nav,
            errors: null
        })
    }
}


/* *************************************
* Process logout request
* *********************************** */
async function accountLogout(req, res) {
    try {
        if (process.env.NODE_ENV === 'development') {
            res.clearCookie("jwt", {
                httpOnly: true,  // To prevent client-side javascript access
                sameSite: true,  // For Protecting against CSRF attacks
            })
        } else {
            res.clearCookie("jwt", {
                httpOnly: true,  // To prevent client-side javascript access
                secure: true,  // Make Sure Cookie is only sent through HTTPS
                sameSite: true,  // For Protecting against CSRF attacks
            })
        }
        
        req.flash('notice', "You've successfully logged-out")
        return res.redirect("/")  // redirect to homepage
    } catch (error) {
        console.error('Logout Error: '+ error)
    }
}


/* ***************************************
* Deliver Login View
* ************************************* */
async function buildDashboard(req, res, next) {
    let nav = await utilities.getNav()
    // req.flash("notice", "This is a flash message.")  // for testing
    res.render("account/", {
        description: "Profile Dashboard",
        title: "Dashboard",
        nav,
        errors: null,
    })
}

/* **********************************************************
* Deliver Edit (Modification to account data) Account View
* ******************************************************** */
async function buildAccountUpdateView(req, res, next) {
    const account_Id = parseInt(req.params.accountId)  // get the selected account id form link header
    let nav = await utilities.getNav()
    let accountData = await accountModel.getAnAccount(account_Id)
    const profileName = `${accountData.account_firstname} ${accountData.account_lastname}`;

    res.render("account/update-account", {
        description: `Update user account)`,
        title: "Edit Account (" + profileName + ")",
        nav,
        errors: null,
        
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id,
        account_password: null
    })
}

/* **************************************
* Process Inventory Update
* ************************************ */
async function updateAccountInfo (req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    const updateResult = await accountModel.updateAccountInfo(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        req.flash ("notice", `Account-Info update was successful.`)
        res.redirect("/account/")
    } else {
        const profileName = `${account_firstname} ${account_lastname}`;
        req.flash ("notice", `Sorry ${profileName.slice(0, 1).toUpperCase()}${profileName.slice(1)}, your profile update failed.`)
        res.status(501).render("account/update-account", {
            description: `Update user account)`,
            title: "Edit Account (" + profileName + ")",
            nav,
            errors: null
        })
    }
}


/* **************************************
* Process Password Update
* ************************************ */
async function updatePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    const data = await accountModel.getAnAccount(account_id)
    const profileName = `${data.account_firstname} ${data.account_lastname}`;

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error changing your password.')
        res.status(500).render("account/update-account", {
            description: `Update user account)`,
            title: "Edit Account (" + profileName + ")",
            nav,
            errors: null,
        })
    }

    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

    if (updateResult) {
        req.flash ("notice", `Your account password was changed successfully.`)
        res.redirect("/account/")
    } else {
        req.flash ("notice", `Sorry ${profileName.slice(0, 1).toUpperCase()}${profileName.slice(1)}, your password update failed.`)
        res.status(501).render("account/update-account", {
            description: `Update user account)`,
            title: "Edit Account (" + profileName + ")",
            nav,
            errors: null,
        })
    }
}



/* **************************************
* Process Account Photo Update
* ************************************ */
async function updateAccountPhoto(req, res, next) {
    let nav = await utilities.getNav();
    console.log('I just get nav in account controller');  // for testing purpose

    const form = req.form;
    const account_id = req.body.account_id[0];
    const photoFile = req.files.account_photo[0];

    const data = await accountModel.getAnAccount(account_id);
    const profileName = `${data.account_firstname} ${data.account_lastname}`;

    form.uploadDir = `public/images/account/user-${account_id}`;  // set directory path for upload
    form.dbUploadDir = `/images/account/user-${account_id}`;
    form.keepExtensions = true;  // keep form file extensions

    // create directory if it doesn't exist
    if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, { recursive: true });
    } else {
        // REMOVE ALL FILES IN DIRECTORY
        // read directory
        const allFiles = fs.readdirSync(form.uploadDir);

        // loop through each file and delete the file in directory
        allFiles.forEach(file => {
            const filePath = path.join(form.uploadDir, file);

            try {
                fs.unlinkSync(filePath);  // delete file synchronously
                // console.log(`File: ${filePath} Deleted Successfully`);  // for testing purpose
            } catch (err) {
                console.error(`Error Deleting File (${filePath}) : ${err}`);
            }
        });
    }

    // Rename and move file to uploads directory
    let fileNewName;
    try {
        const incomingFileNameAndExtension = photoFile.originalFilename.split('.');
        const incomingFileName = incomingFileNameAndExtension[0].length > 10 ? incomingFileNameAndExtension[0].slice(0, 10) : incomingFileNameAndExtension[0];
        const incomingFileExtension = incomingFileNameAndExtension[incomingFileNameAndExtension.length - 1];
        fileNewName = `${Date.now()}-${incomingFileName}.${incomingFileExtension}`;
    } catch (err) {
        res.status(400).send(err);
    }

    const newPath = path.join(form.uploadDir, fileNewName);
    const newDBPath = path.join(form.dbUploadDir, fileNewName);


    // move uploaded file form temporal directory (file.filepath) to upload permanent directory (newPath)
    fs.rename(photoFile.filepath, newPath, async (err) => {
        if (err) {
            req.flash('notice', 'Error saving file. Please try again.');
            return res.redirect(`/account/update-account/${account_id}`);
        } else {
            // If Success
            // update the account_photo in db with the new file path to the database
            const updateResult = await accountModel.updateAccountPhoto(newDBPath, account_id)

            if (updateResult) {
                req.flash ("notice", `Your account photo was updated successfully.`)
                next()
            } else {
                req.flash ("notice", `Sorry ${profileName.slice(0, 1).toUpperCase()}${profileName.slice(1)}, your account photo update failed.`)
                res.status(501).render("account/update-account", {
                    description: `Update user account)`,
                    title: "Edit Account (" + profileName + ")",
                    nav,
                    errors: null,
                })
            }
        }
    })
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildDashboard, buildAccountUpdateView, updateAccountInfo, updateAccountPhoto, updatePassword, accountLogout }