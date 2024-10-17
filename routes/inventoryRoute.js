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

// Route to get inventory by classification_id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to modify and inventory by inventory_id
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory));


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

// Route to process vehicle (inventory) update
router.post(
    '/process-update-vehicle',
    managementValidation.addVehicleRule(),
    managementValidation.checkUpdateInventoryData,
    utilities.handleErrors(invController.updateInventory)
)

module.exports = router;