// Need Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require('../utilities/')
const managementValidation = require("../utilities/management-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail page view by inv_id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Route to vehicle management
router.get("/", utilities.handleErrors(invController.buildVehicleManagement));

// Route to add new classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to add new vehicle
router.get("/add-vehicle", utilities.handleErrors(invController.buildAddVehicle));

// Route to process add classification
router.post(
    '/process-add-classification',
    managementValidation.addClassificationRule(),
    managementValidation.checkNewClassificationData,
    utilities.handleErrors(invController.addClassification)
);

// Route to process add vehicle
router.post(
    '/process-add-vehicle',
    managementValidation.addVehicleRule(),
    managementValidation.checkNewVehicleData,
    utilities.handleErrors(invController.addVehicle)
);

module.exports = router;