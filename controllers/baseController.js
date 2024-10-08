const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav()
    const description = 'CSE 340 Backend Development Motor Web Application'
    req.flash("notice", "This is a flash message.")  // for testing
    res.render("index", {title: "Home", nav, description})
}

module.exports = baseController