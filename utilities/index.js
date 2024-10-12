// Modules to work with files (Node module)
const fs = require('fs')
const path = require('path')
// Need Modules (created by me)
const invModel = require("../models/inventory-model")
const Util = {}

/* ****************************************
******** GLOBAL VARIABLES STORE ***********
******************************************/
const lightColors = ['white', 'yellow', 'silver', 'rust', 'red']

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
            row.classification_id + '" ' + 
            'title="See our inventory of ' + 
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
            let backgroundColor = 'white'
            // using global lightColors variable
            lightColors.forEach(color => {
                if (vehicleColor.toLowerCase() == color) {
                    backgroundColor = 'black';
                }
            })
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
            + ' Details"><img src="' + vehicle.inv_thumbnail 
            +'" alt=" Vehicle' + vehicle.inv_make + ' ' + vehicle.inv_model
            +' on CSE Motors"></a>'
            grid += '<div class="namePrice">'
            grid += '<hr>'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title = "View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>'
            grid += '<span class="price">$'
            + new Intl.NumberFormat('en-Us').format(vehicle.inv_price) + '</span>'
            grid += '<span class="car-color-text" style="color:' + vehicle.inv_color + '; background-color:' + backgroundColor + ';' + 'border-color:' + vehicle.inv_color + ';' + '">'
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

/* ***************************************
* Build an inventory detail view HTML
*************************************** */
Util.buildDetailGrid = async function (data) {
    // get vehicle color
    let vehicleColor = data.inv_color
    let backgroundColor = 'white'
    // using global lightColors variable
    lightColors.forEach(color => {
        if (vehicleColor.toLowerCase() == color) {
            backgroundColor = 'black';
        }
    })
    let grid = '<div id="inv-detail-container">'
                    +'<div id="image-section">'
                        +'<img src="'+data.inv_image+'" alt="Vehicle '+data.inv_make + ' ' +data.inv_model +'">'
                    +'</div>'
                    +'<div id="content-section">' 
                        +'<h2>'+data.inv_make+' '+data.inv_model+' Details </h2>'
                        +'<span><b>Price:</b> $'+ new Intl.NumberFormat('en-Us').format(data.inv_price) + '</span>'
                        +'<span><b>Description</b>: '+data.inv_description +'</span>'
                        +'<span><b>Color:</b> <span class="car-color-text" style="color:' + data.inv_color + '; background-color:' + backgroundColor + ';' + 'border-color:' + data.inv_color + ';' + '">'+ data.inv_color + '</span>' +'</span>'
                        +'<span><b>Miles:</b> '+new Intl.NumberFormat('en-Us').format(data.inv_miles) + '</span>'
                    +'</div>'
                +'</div>'
    return grid
}

/* *********************************************
* Build an error humor view for display
********************************************* */
Util.getErrorDisplayHumor = async function (req, res, next) {
    // choose directory path randomly from the list of directory path, to get file
    let filePaths = ['images', 'videos']
    let file1stPath = this.choice(filePaths)
    
    // create opening and closing element name from choice
    let openingElement;
    let closingElement;
    if (file1stPath == 'images') {
        openingElement = '<img alt="awesome error humor" '
        closingElement = ''
    } else {
        openingElement = '<video muted loop autoplay '
        closingElement = '</video>'
    }

    // get directory path to be used
    const dirPath = './public/'+file1stPath+'/page-error/'
    // stores the name of the chosen file
    let fileName
    
    // get the list of files in the directory and select a random file from the list
    // update the fileName with the selected filename
    try {
        const files = fs.readdirSync(dirPath)
        if (files) {
            fileName = this.choice(files)
            console.log('Chosen Filename: ' + fileName)  // for testing purpose
        } else {
            console.log('empty file in directory: ' + dirPath)
        }
    } catch (err) {
        console.error('Fail to read directory: ', err)
    }

    let humor = openingElement+'src="/'+file1stPath+'/page-error/'+fileName+'" class="error-humor" width="500">'+closingElement
    return humor
}

/* *******************************************
* Build classification list
******************************************* */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = 
    '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}


/* *********************************************
* ********** SYNCHRONOUS FUNCTIONS *************
********************************************* */

/* *********************************************
* Make Choice From a List
* Get and return a random choice from a list
********************************************* */
Util.choice = function (list) {
    let choose = Math.floor(Math.random() * list.length);
    return list[choose];
}

/* ****************************************************
* Middleware For Handling Errors
* Wrap other function in this for 
* General Error Handling
**************************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util