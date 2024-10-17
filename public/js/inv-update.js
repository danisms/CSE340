const form = document.querySelector('#updateForm')
form.addEventListener('change', ()=> {
    const updateBtn = document.querySelector('input[type="submit"]')
    updateBtn.removeAttribute("disabled")
    // console.log("I suppose to have removed the disabled attribute in the submit input button")  // for testing purpose
})

// console.log('inv-update.js loaded successfully')  // for testing purpose