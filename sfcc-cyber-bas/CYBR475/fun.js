function resetDialogForms(diaNd) {
    let forms = diaNd.querySelectorAll('form');
    forms.forEach(fElem => { fElem.reset();  });
}
function formToLclStore(formElem) {
    const inputElements = formElem.querySelectorAll('[name]')
    for (inpEl of inputElements) {
        //console.log(inpEl)
        //if ('text' == inpEl.type || ('date' == inpEl.type)) {
            localStorage.setItem('sfcc::cybr475::intern-data::' + inpEl.name, '' + inpEl.value)
        //}
    }

}
function lclStoreToForm(formElem) {
    const inputElements = formElem.querySelectorAll('[name]')
    for (inpEl of inputElements) {
        const dynVal = localStorage.getItem('sfcc::cybr475::intern-data::' +inpEl.name)
        if (null != dynVal && dynVal.length > 0) {
            inpEl.value = dynVal
        }
    } 
}
function lclStoreToDocument() {
    const dynamicElems = document.querySelectorAll('[data-intern-store]')
    for (dynEl of dynamicElems) {
        const dynVal = localStorage.getItem('sfcc::cybr475::intern-data::' + dynEl.dataset.internStore)
        //console.log(dynEl, dynVal)
        if (null != dynVal && dynVal.length > 0) {
            dynEl.innerText = dynVal
        }
    }
}
function dialogedElementClick_cb(ev) {
    const dialogedEl = ev.target.closest('[data-intern-dialog]')
    //console.log(ev.target, ev.target.dataset, dialogedEl, dialogedEl.dataset)
    const targDialog = document.getElementById(dialogedEl.dataset.internDialog)
    lclStoreToForm(targDialog.querySelectorAll('form')[0])
    targDialog.showModal();
}
function paperFormPrintButt_cb(ev) {
    window.print() 
}
function dalogClose_cb(ev) {
    console.log('close', ev)
    //const formElements = ev.target.querySelectorAll('[name]')
    console.log('close return value', ev.target.returnValue)
    if ( 'done' == ev.target.returnValue) {
        formToLclStore(ev.target.querySelectorAll('form')[0])
        lclStoreToDocument()
    }
    
}