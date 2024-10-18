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

/* **********************************************
* Build vehicle management view
********************************************** */
invCont.buildVehicleManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        description: "Vehicle Management Page (for add new classification and vehicle)",
        title: "Vehicle Management",
        nav,
        classificationSelect
    })
}

/* ***************************************
* Deliver Add Classification View
* ************************************* */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        description: "Add classification form",
        title: "Add Classification",
        nav,
        errors: null,
    })
}


/* **************************************
* Process Add Classification
* ************************************ */
invCont.addClassification = async function (req, res) {
    let nav = await utilities.getNav()
    const { classification_name } = req.body

    const addNewClassificationResult = await invModel.addNewClassification(classification_name)

    if (addNewClassificationResult) {
        req.flash ("notice", `A new classification (${classification_name}) was added successfully`)
        res.status(201).render("inventory/management", {
            description: "Vehicle Management Page (for add new classification and vehicle)",
            title: "Vehicle Management",
            nav,
            errors: null
        })
    } else {
        req.flash ("notice", `Sorry, fail to add new classification (${classification_name}).`)
        res.status(501).render("inventory/add-classification", {
            description: "Add new classification page",
            title: "Add Classification",
            nav,
            errors: null
        })
    }
}


/* ***************************************
* Deliver Add Vehicle View
* ************************************* */
invCont.buildAddVehicle = async function (req, res, next) {
    let nav = await utilities.getNav()
    const date = new Date()
    const currentYear = date.getFullYear()
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-vehicle", {
        description: "Add vehicle form",
        title: "Add Vehicle",
        nav,
        classificationList,
        currentYear,
        errors: null,
    })
}

/* **************************************
* Process Add Vehicle
* ************************************ */
invCont.addVehicle = async function (req, res) {
    let nav = await utilities.getNav()
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body

    const addNewVehicleResult = await invModel.addNewVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)

    if (addNewVehicleResult) {
        req.flash ("notice", `A new vehicle (${inv_make} ${inv_model}) was added successfully`)
        res.status(201).render("inventory/management", {
            description: "Vehicle Management Page (for add new classification and vehicle)",
            title: "Vehicle Management",
            nav,
            errors: null
        })
    } else {
        const date = new Date()
        const currentYear = date.getFullYear()
        let classificationList = await utilities.buildClassificationList(classification_id)
        req.flash ("notice", `Sorry, fail to add new vehicle (${inv_make} ${inv_model}).`)
        res.status(501).render("inventory/add-vehicle", {
            description: "Add vehicle form",
            title: "Add Vehicle",
            nav,
            classificationList,
            currentYear,
            errors: null,

            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
        })
    }
}


/* ********************************************
* Return Inventory by Classification As JSON
* ****************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error('No data returned'))
    }
}


/* **********************************************************
* Deliver Edit (Modification to an inventory) Inventory View
* ******************************************************** */
invCont.buildEditInventory = async function (req, res, next) {
    const date = new Date()
    const currentYear = date.getFullYear()
    const inv_Id = parseInt(req.params.inventory_id)  // get the selected inventory id form link header
    let nav = await utilities.getNav()
    let inventoryData = await invModel.getAnInventory(inv_Id)
    let inventoryName = `${inventoryData.inv_make} ${inventoryData.inv_model}`;
    let classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
    res.render("inventory/edit-inventory", {
        description: `Make modification to an inventory (${inventoryName})`,
        title: "Edit " + inventoryName,
        nav,
        classificationList,
        currentYear,
        errors: null,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_description: inventoryData.inv_description,
        inv_image: inventoryData.inv_image,
        inv_thumbnail: inventoryData.inv_thumbnail,
        inv_price: inventoryData.inv_price,
        inv_miles: inventoryData.inv_miles,
        inv_color: inventoryData.inv_color,
        classification_id: inventoryData.classification_id
    })
}


/* **************************************
* Process Inventory Update
* ************************************ */
invCont.updateInventory = async function (req, res) {
    let nav = await utilities.getNav()
    const { inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body

    const updateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)

    if (updateResult) {
        const inventoryName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash ("notice", `The ${inventoryName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        const date = new Date()
        const currentYear = date.getFullYear()
        let classificationList = await utilities.buildClassificationList(classification_id)
        const inventoryName = `${inv_make} ${inv_model}`
        req.flash ("notice", `Sorry the insert (Vehicle - ${inventoryName}) failed.`)
        res.status(501).render("inventory/edit-inventory", {
            description: `Make modification to an inventory (${inventoryName})`,
            title: "Edit " + inventoryName,
            nav,
            classificationList,
            currentYear,
            errors: null,

            inv_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
        })
    }
}

/* **********************************************************
* Deliver Delete Inventory View
* ******************************************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
    const date = new Date()
    const currentYear = date.getFullYear()
    const inv_Id = parseInt(req.params.inventory_id)  // get the selected inventory id form link header
    let nav = await utilities.getNav()
    let inventoryData = await invModel.getAnInventory(inv_Id)
    let inventoryName = `${inventoryData.inv_make} ${inventoryData.inv_model}`;
    res.render("inventory/delete-confirm", {
        description: `Delete an inventory (${inventoryName})`,
        title: "Delete " + inventoryName,
        nav,
        currentYear,
        errors: null,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_price: inventoryData.inv_price,
    })
}

/* **************************************
* Process Inventory Delete
* ************************************ */
invCont.deleteInventory = async function (req, res) {
    let { inv_id } = req.body
    inv_id = parseInt(inv_id)

    const deleteResult = await invModel.deleteInventory(inv_id)

    if (deleteResult) {
        req.flash ("notice", `The item was successfully deleted.`)
        res.redirect("/inv/")
    } else {
        req.flash ("notice", `Sorry the item delete failed.`)
        res.redirect("/inv/delete:"+inv_id)
    }
}


module.exports = invCont