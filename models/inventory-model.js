const pool = require("../database/")

/* *****************************
* Get all classification data
* *************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***********************************************************************
* Get all inventory items and classification_name by classification_id
*********************************************************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getClassificationsById error " + error)
    }
}

/* ****************************************************************
* ******* Get an inventory item using inventory id (inv_id) *******
******************************************************************/
async function getAnInventory(inv_id) {
    try {
        // using a prepare statement
        const query = {
            name: 'get-an-inventory',
            text: 'SELECT * FROM public.inventory WHERE inv_id = $1',
            values: [inv_id]
        }
        const data = await pool.query(query)
        return data.rows[0]
    } catch (error) {
        console.error("getAnInventory error " + error)
    }
}


/* *************************************
* Check for existing classification
* *********************************** */
async function checkExistingClassification(classification_name) {
    try {
        const sql = "SELECT classification_name FROM public.classification WHERE classification_name LIKE $1"
        const classification = await pool.query(sql, [classification_name.toLowerCase()])
        return classification.rowCount
    } catch (error) {
        return error.message
    }
}


/* *****************************
* Add New Classification
* *************************** */
async function addNewClassification(classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *;"
        return await pool.query(sql, [classification_name.toLowerCase()])
    } catch (error) {
        return error.message
    }
}


/* *****************************
* Add New Vehicle
* *************************** */
async function addNewVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
    try {
        const sql = "INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;"
        return await pool.query(sql, [classification_id, inv_make.toLowerCase(), inv_model.toLowerCase(), inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color.toLowerCase()])
    } catch (error) {
        return error.message
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getAnInventory, checkExistingClassification, addNewClassification, addNewVehicle}