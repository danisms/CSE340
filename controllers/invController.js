const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************************
* Build inventory by classification view
*************************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    let description = `A page containing all vehicle of ${className} model`
    res.render("./inventory/classification", {
        description,
        title: className + "Vehicles",
        nav,
        grid
    })
}

/* **********************************************
* Build an inventory detail page by inventory_id
********************************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.inventoryId
    const data = await invModel.getAnInventory(inv_id)
    const grid = await utilities.buildDetailGrid(data)
    let nav = await utilities.getNav()
    const vehicleHeading = data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model
    let description = `An inventory page of the ${vehicleHeading} vehicle`
    res.render("./inventory/detail", {
        description,
        title: vehicleHeading,
        nav,
        grid
    })
}

module.exports = invCont