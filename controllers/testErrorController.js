const testErrCont = {}

/* ***************************************
* Build an intentional 500 error 
*************************************** */
testErrCont.buildIntentional500Error = async function (req, res, next) {
    let title = 'Home Page'
    let description = `An intentional 500 error link at the footer`
    res.render("index", {title, description, nav})
}

module.exports = testErrCont