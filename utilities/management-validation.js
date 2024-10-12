const utilities = require(".")
const {body, validationResult} = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}


/* *******************************************
* Add Classification Data Validation Rules
* ***************************************** */
validate.addClassificationRule = () => {
    return [
        // classification_name is required and must be string
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        // .isAlpha()
        .withMessage("Please provide a valid classification name.") // on error this message is sent.
        .custom(async (classification_name) => {
            const classificationExists = await invModel.checkExistingClassification(classification_name)
            if (classificationExists) {
                throw new Error(`Classification (${classification_name})  already exists. Please enter a different classification`)
            }
        }),
    ]
}


/* ******************************************************************
* Check data and return error or continue to add new classification
* **************************************************************** */
validate.checkNewClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            description: "Add new classification page",
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}


/* *******************************************
* Add Vehicle Data Validation Rules
* ***************************************** */
validate.addVehicleRule = () => {
    const date = new Date()
    return [
        // classification_id is required and must be an integer
        body("classification_id")
        .trim()
        .notEmpty()
        .escape()
        .isLength({ min: 1 })
        .isInt()
        .withMessage("Please select from the classification list"), // on error this message is sent.
        
        // vehicle make is required and must be a string
        body("inv_make")
        .trim()
        .notEmpty()
        .escape()
        .isLength({ min: 1})
        .withMessage("Please provide a make"),

        // vehicle model is required and must be a string
        body("inv_model")
        .trim()
        .notEmpty()
        .escape()
        .isLength({ min: 1})
        .withMessage("Please provide a model"),

        // vehicle description is required and must be a string
        body("inv_description")
        .trim()
        .notEmpty()
        // .escape()
        .isLength({ min: 1})
        .withMessage("Please provide a description"),

        // vehicle image is required and must be a string
        body("inv_image")
        .trim()
        .notEmpty()
        // .escape()
        .isLength({ min: 1})
        .withMessage("Please enter a valid image path"),

        // vehicle thumbnail is required and must be a string
        body("inv_thumbnail")
        .trim()
        .notEmpty()
        // .escape()
        .isLength({ min: 1})
        .withMessage("Please enter a valid image thumbnail path"),

        // vehicle price is required and must be an integer
        body("inv_price")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isInt()
        .withMessage("Please provide a valid price"),

        // vehicle year is required and must be a number
        body("inv_year")
        .trim()
        .notEmpty()
        .isInt({ min: 1000, max: date.getFullYear()})
        .withMessage("Please enter a valid year"),

        // vehicle miles is required and must be an integer
        body("inv_miles")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isInt()
        .withMessage("Please provide a valid miles (numbers only)"),

        // vehicle color is required and must be a string
        body("inv_color")
        .trim()
        .notEmpty()
        .escape()
        .isLength({ min: 1})
        .isAlpha()
        .withMessage("Please provide a valid color"),
    ]
}


/* ******************************************************************
* Check data and return error or continue to add new classification
* **************************************************************** */
validate.checkNewVehicleData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const date = new Date()
        const currentYear = date.getFullYear()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-vehicle", {
            errors,
            description: "Add new classification page",
            title: "Add Classification",
            nav,
            classificationList,
            currentYear,

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
        return
    }
    next()
}

module.exports = validate