const invModel = require("../models/inventory-model")
const Util = {}

/* ****************************************
* Constructs the nav HTML unordered list
**************************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)  // for testing purpose
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list += 
            '<a href="/inv/type/' + 
            row.classification_id + 
            '"title="See our inventory of ' + 
            row.classification_name + 
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "<li>"
    })
    list += "</ul>"
    return list
}

/* ***************************************
* Build the classification view HTML
*************************************** */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            // get vehicle color
            let vehicleColor = vehicle.inv_color
            let backgroundColor
            let lightColors = ['white', 'yellow', 'silver', 'rust']
            lightColors.forEach(color => {
                if (vehicleColor.toLowerCase() == color) {
                    backgroundColor = 'black';
                }
            })
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title = "View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>'
            grid += '<span class="price">$'
            + new Intl.NumberFormat('en-Us').format(vehicle.inv_price) + '</span>'
            grid += '<span class="color" style="color:' + vehicle.inv_color + '; background-color:' + backgroundColor + ';' + '">'
            + vehicle.inv_color + '</span>'
            + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.get404PageNotFoundDisplay = async function (req, res, next) {
    let notFoundContainer = '<div id="page-not-found-container>'
    notFoundContainer += '<video src="videos/page-error/flamingos-404-error-pa.mp4" autoplay></video>'
    notFoundContainer += '<p>👀</p>'
    notFoundContainer += '</div>'
    return notFoundContainer
}

/* ****************************************************
* Middleware For Handling Errors
* Wrap other function in this for 
* General Error Handling
**************************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util