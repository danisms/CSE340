const pool = require("../database/")

/* *****************************
* Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *;"
        return await pool.query(sql, [account_firstname.toLowerCase(), account_lastname.toLowerCase(), account_email.toLowerCase(), account_password])
    } catch (error) {
        return error.message
    }
}


/* *****************************
* Check for existing email
* *************************** */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT account_id FROM public.account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email.toLowerCase()])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* ****************************************
* Return account data using email address
* ************************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT * FROM public.account WHERE account_email = $1',
            [account_email]
        )
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}


/* ****************************************************************
* ******* Get account data using account_id **********************
******************************************************************/
async function getAnAccount(account_id) {
    try {
        // using a prepare statement
        const query = {
            name: 'get-an-account',
            text: 'SELECT * FROM public.account WHERE account_id = $1',
            values: [account_id]
        }
        const data = await pool.query(query)
        return data.rows[0]
    } catch (error) {
        console.error("getAnAccount error " + error)
    }
}


/* ******************************************
* Update An Account Info
* **************************************** */
async function updateAccountInfo(account_firstname, account_lastname, account_email, account_id) {
    try {
        // using a prepare statement
        const query = {
            name: 'update-account-info',
            text: "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *;",
            values: [account_firstname.toLowerCase(), account_lastname.toLowerCase(), account_email.toLowerCase(), account_id]
        }
        const data = await pool.query(query)
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}

/* ******************************************
* Update An Account Password
* **************************************** */
async function updatePassword(hashedPassword, account_id) {
    try {
        // using a prepare statement
        const query = {
            name: 'update-account-password',
            text: "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *;",
            values: [hashedPassword, account_id]
        }
        const data = await pool.query(query)
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}

/* ******************************************
* Update An Account Photo
* **************************************** */
async function updateAccountPhoto(photoPath, account_id) {
    try {
        // using a prepare statement
        const query = {
            name: 'update-account-photo',
            text: "UPDATE public.account SET account_photo = $1 WHERE account_id = $2 RETURNING *;",
            values: [photoPath, account_id]
        }
        const data = await pool.query(query)
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}



module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAnAccount, updateAccountInfo, updateAccountPhoto, updatePassword }
