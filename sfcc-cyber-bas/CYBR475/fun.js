function resetDialogForms(diaNd) {
    let forms = diaNd.querySelectorAll('form');
    forms.forEach(fElem => { fElem.reset();  });
}
function formToLclStore(formElem) {
    const inputElements = formElem.querySelectorAll('[name]')
    for (let inpEl of inputElements) {
        //console.log(inpEl)
        //if ('text' == inpEl.type || ('date' == inpEl.type)) {
            localStorage.setItem('sfcc::cybr475::intern-data::' + inpEl.name, '' + inpEl.value)
        //}
    }

}
function lclStoreToForm(formElem) {
    const inputElements = formElem.querySelectorAll('[name]')
    for (let inpEl of inputElements) {
        const dynVal = localStorage.getItem('sfcc::cybr475::intern-data::' +inpEl.name)
        if (null != dynVal && dynVal.length > 0) {
            inpEl.value = dynVal
        }
    } 
}
function lclStoreToDocument() {
    const dynamicElems = document.querySelectorAll('[data-intern-store]')
    for (let dynEl of dynamicElems) {
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
function nukeButt_cb(evt) {
    let keys = []; 
    evt.stopPropagation();
    evt.preventDefault();
    for (let i=0; i<localStorage.length; i++) {
        if (localStorage.key(i).match(/^sfcc::cybr475::intern-data::/)) {
            keys.push(localStorage.key(i)); }
    }
    //console.log(keys);
    keys.forEach( x => localStorage.removeItem(x));
    return;
}

function is_val_date_str(dts ) {
    if (!dts.match(/\d\d\d\d-\d\d-\d\d/)) return false;
    let dta = dts.split('-',3).map( x => parseInt(x,10));
    //console.log(dta);
    if (dta[0]<2021 || dta[0]>2025) {return false;}
    if (dta[1]<1 || dta[1]>12) {return false;}
    if (dta[1]<1 || dta[1]>31) {return false;}
    let dt = new Date(dta[0],dta[1]-1, dta[2], 2 );
    // gawd the month is zero indexed so jan is 0, dec is 11
    // b0rken
    //console.log(dt);
    return true;
}
function str_to_Date(dts) {
    let dta = dts.split('-',3).map( x => parseInt(x,10));
    return new Date(dta[0],dta[1]-1, dta[2] );
}
function Date_to_str(dt) {
    function df2(n) { if (n<10) return '0' + n.toString(10); return n.toString(10);}
    return [dt.getFullYear(), dt.getMonth()+1, dt.getDate() ].map(df2).join('-');
}
function Date_within_days_now(dts, n) {
    let bnchMrk = str_to_Date(dts).getTime() + (+n *86400000);
    return Date.now() < bnchMrk;
}
function getDateOffs(dts) {
    return Math.floor((Date.now() - str_to_Date(dts).getTime()) / 86400000 );
}
function getTmplCloneSrc(tmplId, itmClass) {
    const tmpl= document.getElementById(tmplId);
    //console.log(tmpl, tmpl.content)
    for (let elem of tmpl.content.childNodes) {
        //console.log(elem);
        if (elem.classList?.contains(itmClass)) return elem;
    }
    return null;
}
function tmplClone(tmplId, itmClass) {
    //const srcElem = getTmplCloneSrc(tmplId, itmClass) ;
    //console.log(srcElem);
    return getTmplCloneSrc(tmplId, itmClass)?.cloneNode(true);
}
function addEventListenerById(nodeId, eventName, callback) {
    let node = document.getElementById(nodeId);
    node.addEventListener(eventName, callback);
}
function initTimeSheet0() {
    const timeSheetAutoPages = document.getElementById('timeSheetAutoPages');
    let tsPage = tmplClone("tmpl-timeSheetAutoPages","timeSheetPage");
    let tsFooter = tmplClone("tmpl-timeSheetAutoPages","timeSheetFinalFooter");
    timeSheetAutoPages.appendChild(tsPage);
    tsPage.appendChild(tsFooter);
}

/*
 * https://pollei.github.io/sfcc-cyber-bas/ASTR100/wk-sched/?strtDay=2023-03-31
 * https://www.youtube.com/watch?v=EoUIS2PxKCs util functions
 * https://www.youtube.com/watch?v=czZ1PvNW5hk responsive HTML table
 */
