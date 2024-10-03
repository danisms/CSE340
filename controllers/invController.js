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

module.exports = invCont