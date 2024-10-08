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

module.exports = {getClassifications, getInventoryByClassificationId, getAnInventory}