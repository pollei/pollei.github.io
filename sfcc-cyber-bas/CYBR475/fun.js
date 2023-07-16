function resetDialogForms(diaNd) {
    let forms = diaNd.querySelectorAll('form');
    forms.forEach(fElem => { fElem.reset();  });
}
function lclGetItem(itmName) {
    return (globalThis.internGlob.internItems?.[itmName] ?? 
        localStorage.getItem('sfcc::cybr475::intern-data::' + itmName));
}
function lclSetItem(itmName, itmValue ) {
    //localStorage.setItem('sfcc::cybr475::intern-data::' + itmName, '' + itmValue);
    globalThis.internGlob.internItems[itmName] = '' + itmValue;
}
function formToLclStore(formElem) {
    const inputElements = formElem.querySelectorAll('[name]')
    for (let inpEl of inputElements) {
        lclSetItem(inpEl.name, '' + inpEl.value)
        //console.log(inpEl)
        //if ('text' == inpEl.type || ('date' == inpEl.type)) {
            //localStorage.setItem('sfcc::cybr475::intern-data::' + inpEl.name, '' + inpEl.value)
        //}
    }
    blobInternItems();
}
function lclStoreToForm(formElem) {
    const inputElements = formElem.querySelectorAll('[name]')
    for (let inpEl of inputElements) {
        //const dynVal = localStorage.getItem('sfcc::cybr475::intern-data::' +inpEl.name)
        const dynVal = lclGetItem(inpEl.name)
        if (null != dynVal && dynVal.length >= 0) {
            inpEl.value = dynVal
        } else {
            inpEl.value = inpEl.dataset.internFormDefault ?? inpEl.dataset.internDefault ?? ''
        }
    } 
}
function lclStoreToDocument() {
    const dynamicElems = document.querySelectorAll('[data-intern-store]')
    for (let dynEl of dynamicElems) {
        //const dynVal = localStorage.getItem('sfcc::cybr475::intern-data::' + dynEl.dataset.internStore)
        const dynVal = lclGetItem(dynEl.dataset.internStore)
        //console.log(dynEl, dynVal)
        if (null != dynVal && dynVal.length >= 0) {
            dynEl.innerText = dynVal
        } else {
            dynEl.innerText = dynEl.dataset.internDocDefault ?? dynEl.dataset.internDefault ?? ''
        }
    }
    const dynamicKeyedElems = document.querySelectorAll('[data-intern-key]');
    for (let dynEl of dynamicKeyedElems) {
        const dynVal = lclGetItem(dynEl.dataset.internKey);
        if (null != dynVal && dynVal.length >= 0) {
            dynEl.dataset.internValue = dynVal
        } else {
            delete dynEl.dataset.internValue
        }
    }
}
function formToObj(containerElem) {
    let ret = {};
    for (const elem of containerElem.querySelectorAll('[name]')) {
        //console.info('named elem', elem);
        if ('name' in elem  && 'value' in  elem ) ret[elem.name] = elem.value;
    }
    return ret;
}
function objFillForm(obj, containerElem) {
    for (const elem of containerElem.querySelectorAll('[name]')) {
        elem.value = obj[elem.name] ?? elem.dataset.internDocDefault ?? elem.dataset.internDefault ?? ''
    }
}
function dialogedElementClick_cb(ev) {
    const dialogedEl = ev.target.closest('[data-intern-dialog]')
    //console.log(ev.target, ev.target.dataset, dialogedEl, dialogedEl.dataset)
    const targDialog = document.getElementById(dialogedEl.dataset.internDialog)
    if (!targDialog) return;
    lclStoreToForm(targDialog.querySelectorAll('form')[0])
    targDialog.showModal();
}
function paperFormPrintButt_cb(ev) {
    window.print() 
}
function dialogClose_cb(ev) {
    //console.log('close', ev)
    //const formElements = ev.target.querySelectorAll('[name]')
    //console.log('close return value', ev.target.returnValue)
    if ( 'done' == ev.target.returnValue) {
        formToLclStore(ev.target.querySelectorAll('form')[0])
        lclStoreToDocument()
    }
}
function objFillTsRow(tsRowObj, tsRowElem) {
    for (const elem of tsRowElem.querySelectorAll('[data-field-name]')) {
        if (elem.dataset.fieldName && elem.dataset.fieldName in tsRowObj ) {
            elem.innerText = tsRowObj[elem.dataset.fieldName]; }
    }
}
function tsNewRowClone(tsObj, opts) {
    tsObj ??= {};
    opts ??= {};
    const retNewRow = tmplClone("tmpl-timeSheetTable","timeSheetItem");
    objFillTsRow(tsObj, retNewRow);
    if ('click' in opts) {
        retNewRow?.addEventListener('click', opts?.click ) }
    retNewRow.dataset.internTsRowType= ( opts?.type ?? 'Normal' );
    return retNewRow;
}
function tsDialogClose_cb(ev) {
    console.log('ts close return value', ev.target.returnValue)
    if ('cancel' == ev.target.returnValue) {
        return;
    }
    const targDialog = document.getElementById("timeSheetCreateNew");
    if ('create' == ev.target.returnValue) {
        window.queueMicrotask(
            () => {targDialog.showModal() } );
        //ev.preventDefault();
        //ev.stopPropagation();
    }
    let tsObj = formToObj(targDialog);
    //console.info('ts obj', tsObj);
    const timeSheetCreateNewDesc = document.getElementById('timeSheetCreateNewDescTA');
    const tsNewRow = tsNewRowClone(tsObj,{ click : tsModifyRow_click_cb } );
    const tsPages = globalThis.internGlob.internItems.timeSheetPages;
    tsPages[tsPages.length -1].push(tsObj);
    blobInternItems();
    updateTimeSheetTotalHours();
    const tsCreateNewRow = document.querySelector("tr[data-intern-ts-row-type='CreateNew']");
    tsCreateNewRow.before(tsNewRow);
    timeSheetCreateNewDesc.value='';
    //targDialog.querySelector('form').reset();
    //ev.target.closest('form').reset()

}
function indexToNthChildCss(index) { return ':nth-child( ' + (index+1) + ' )'; }
function getTsRow(pageIndex, rowIndex) {
    return document.querySelector(
        '#timeSheetAutoPages > ' + indexToNthChildCss(pageIndex) + ' tbody > tr' + indexToNthChildCss(rowIndex))
}
function tsDialogModifyRowClose_cb(ev) {
    console.log('ts close return value', ev.target.returnValue)
    if ('cancel' == ev.target.returnValue) {
        return;
    }
    const targDialog = document.getElementById("timeSheetModifyRow");
    let tsObj = formToObj(targDialog);
    const pageIndexElem = targDialog.querySelector('[name="pageIndex"]');
    const rowIndexElem = targDialog.querySelector('[name="rowIndex"]');
    const pageIndexNum = 0 | + pageIndexElem.value;
    const rowIndexNum = 0 | + rowIndexElem.value;
    const modRow = getTsRow(pageIndexNum, rowIndexNum);
    const gii = globalThis?.internGlob?.internItems;
    const tsPages = gii?.timeSheetPages;
    if ('modify' == ev.target.returnValue) {
        console.info('mod row', modRow);
        tsPages[pageIndexNum][rowIndexNum]=tsObj;
        objFillTsRow(tsObj, modRow);
        blobInternItems();
        updateTimeSheetTotalHours()
        return;
    }
    if ('delete' == ev.target.returnValue) {
        console.info('del ts row', modRow, tsPages[pageIndexNum], rowIndexNum);
        tsPages[pageIndexNum].splice(rowIndexNum, 1);
        blobInternItems();
        modRow.remove();
        updateTimeSheetTotalHours()
        console.info('del ts row after', modRow, tsPages[pageIndexNum]);
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
function backCompatLclStore() {
    const keys = []
    const oldRegex = /^sfcc::cybr475::intern-data::/
    const keyRegex = /^sfcc::cybr475::intern-data::([^:]+)$/
    for (let i=0; i<localStorage.length; i++) {
        if (localStorage.key(i).match(oldRegex)) { keys.push(localStorage.key(i)); }
    }
    keys.forEach( ky => {
        const mtch = ky.match(keyRegex)
        //console.info(mtch,mtch[1])
        globalThis.internGlob.internItems[mtch[1]] = localStorage.getItem(ky)
        localStorage.removeItem(ky)
    } );
    blobInternItems()

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
function uploadJsonFileInput_change_cb(evt) {
    const uploadJsonFileBtn = document.getElementById('uploadJsonFileBtn');
    //console.info(evt.target, uploadJsonFileBtn)
    if ( + evt.target.files.length >= 1) {
        uploadJsonFileBtn.removeAttribute('disabled') }
    else {
        uploadJsonFileBtn.setAttribute('disabled','') }
}
function uploadJsonFileBtn_click_cb(evt) {
    const uploadJsonFileInput = document.getElementById('uploadJsonFileInput')
    evt.stopPropagation();
    evt.preventDefault();
    //console.info(evt.target, uploadJsonFileInput)
    if (uploadJsonFileInput.files.length < 1) {
        console.error('no json file to load')
    }
    //console.info(uploadJsonFileInput.files[0])
    uploadJsonFileInput.files[0].text().then(
        (textResult) => {
            console.info(typeof(textResult), textResult)
            try {
                const obj = JSON.parse(textResult)
                globalThis.internGlob.internItems = obj
                blobInternItems()
                lclStoreToDocument()
                loadTimeSheetPages()
            } catch (err) {
                console.error('file json not parsed', err?.name, err?.message) }
        } ).catch( (err) => { console.error('file text not read', err?.name, err?.message)  } )
}
function tsNewRow_click_cb(evt) {
    console.info(evt.target)
    const tr = evt.target.closest('tr');
    const targDialog = document.getElementById("timeSheetCreateNew");
    const startDate = lclGetItem("internBeginDate");
    const prevTrDateElem = tr.previousElementSibling?.querySelectorAll('.timeSheetItemDate')[0];
    const currTrDateElem = tr?.querySelectorAll('.timeSheetItemDate')[0];
    const timeSheetCreateNewDate = document.getElementById('timeSheetCreateNewDate');
    console.info('ts crear', timeSheetCreateNewDate.value, tr.previousElementSibling,prevTrDateElem,  prevTrDateElem?.innerText ?? startDate )
    if (timeSheetCreateNewDate.value.length < 6 || true ) {
        timeSheetCreateNewDate.value = prevTrDateElem?.innerText ?? startDate;
    }
    targDialog.showModal();
    
}
function tsModifyRow_click_cb(evt) {
    const tr = evt.target.closest('tr');
    const timeSheetPage= evt.target.closest('.timeSheetPage');
    console.info('modify targ', evt.target, tr, timeSheetPage);
    const targDialog = document.getElementById("timeSheetModifyRow");
    const gii = globalThis.internGlob.internItems;
    const tsPages = globalThis.internGlob.internItems.timeSheetPages;
    objFillForm(tsPages[0][tr.rowIndex-1], targDialog.querySelector('form'));
    const pageIndexElem = targDialog.querySelector('[name="pageIndex"]');
    const rowIndexElem = targDialog.querySelector('[name="rowIndex"]');
    pageIndexElem.value = '0'; // TODO FIXME multiple page
    rowIndexElem.value = '' +(tr.rowIndex-1);
    targDialog.showModal();
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
    node?.addEventListener(eventName, callback);
}
function wireDialogedElements (elem) {
    for (const digElem of (elem ?? document).querySelectorAll('[data-intern-dialog]')) {
      digElem.addEventListener('click', dialogedElementClick_cb)
    }
}
function tsSumPage(pgIndex) {
    let ret = 0;
    const tsPages = globalThis.internGlob.internItems.timeSheetPages;
    for (let i=0; i< tsPages[pgIndex].length; i++) {
        ret += + tsPages[pgIndex][i]['hours'];
    }
    return ret;
}
function tsNewPageClone(pgIndex) {
    pgIndex ??= 0;
    const gii = globalThis.internGlob.internItems;
    const tsPages = globalThis.internGlob.internItems.timeSheetPages;
    if (tsPages.length <= pgIndex) {tsPages.push([]);}
    const retTsPage = tmplClone("tmpl-timeSheetAutoPages","timeSheetPage");
    wireDialogedElements(retTsPage)
    const tsTbody = retTsPage.querySelector('tbody');
    for (let i=0; i< tsPages[pgIndex].length; i++) {
        const tsRow = tsNewRowClone(tsPages[pgIndex][i], { click : tsModifyRow_click_cb  });
        tsTbody.appendChild(tsRow);
    }
    return retTsPage;
}
function updateTimeSheetTotalHours() {
    const gig = globalThis.internGlob;
    const gii = gig.internItems;
    const tsPages = gii.timeSheetPages;
    const lastTsPage = gig.timeSheetPageElems.at(-1);
    let finalTotal = 0;
    for (let i=0; i< tsPages.length; i++) {
        const subTot = tsSumPage(i);
        const subTotHoursEl = lastTsPage.querySelector(
            'tr[data-ts-page-index="' + i + '"] td.timeSheetTotalHours');
        if (null != subTotHoursEl) {subTotHoursEl.innerText = '' + subTot;}
        finalTotal += subTot
    }
    const finalTotHoursEl = lastTsPage.querySelector('tr.timeSheetFinalTotal td.timeSheetTotalHours');
    finalTotHoursEl.innerText = '' + finalTotal;

}
function sizeTimeSheetPages() {
    const timeSheetAutoPages = document.getElementById('timeSheetAutoPages');
    const gig = globalThis.internGlob;
    const gii = globalThis.internGlob.internItems;
    if (!('timeSheetPageElems' in gig)) { gig.timeSheetPageElems = [];}
    while (gii.timeSheetPages.length < gig.timeSheetPageElems.length) {
        gig.timeSheetPageElems.pop()?.remove();
    }
    while (gii.timeSheetPages.length > gig.timeSheetPageElems.length) {
        const newTsPage = tmplClone("tmpl-timeSheetAutoPages","timeSheetPage");
        wireDialogedElements(newTsPage)
        timeSheetAutoPages.appendChild(newTsPage);
        gig.timeSheetPageElems.push(newTsPage);
    }
}
function loadTimeSheetPage(pgIndex) {
    pgIndex ??= 0;
    const timeSheetAutoPages = document.getElementById('timeSheetAutoPages');
    const gig = globalThis.internGlob;
    const gii = gig.internItems;
    const tsPages = gii.timeSheetPages;
    const myTsPage = tsPages[pgIndex]
    const myTsPageEl = gig.timeSheetPageElems[pgIndex];
    const tsTbody = myTsPageEl.querySelector('tbody');
    const tsTfoot = myTsPageEl.querySelector('tfoot');
    tsTbody.replaceChildren();
    tsTfoot.replaceChildren();
    myTsPageEl.querySelector('.timeSheetFinalFooter')?.remove();
    for (let i=0; i< myTsPage.length; i++) {
        const tsRow = tsNewRowClone(myTsPage[i], { click : tsModifyRow_click_cb  });
        tsTbody.appendChild(tsRow);
    }
}
function loadTimeSheetPages() {
    const gig = globalThis.internGlob;
    const gii = globalThis.internGlob.internItems;
    if (!('timeSheetPages' in gii)) { gii.timeSheetPages = [ [], ]; }
    if (gii.timeSheetPages.length < 1) {gii.timeSheetPages.push([]) }
    lclSetItem('timeSheetPageCnt', gii.timeSheetPages.length);
    const tsPages = gii.timeSheetPages;
    sizeTimeSheetPages();
    for (let i=0; i< tsPages.length; i++) { loadTimeSheetPage(i); }
    const lastTsPage = gig.timeSheetPageElems.at(-1);
    const lastTbody = lastTsPage.querySelector('tbody');
    const lastTfoot = lastTsPage.querySelector('tfoot');
    const tsNewRow = tsNewRowClone(null, { click : tsNewRow_click_cb, type: 'CreateNew'});
    lastTbody?.appendChild(tsNewRow);
    if (gii.timeSheetPages.length > 1 ) {
        for (let i=0; i< tsPages.length; i++) {
            const subTotEl = tmplClone("tmpl-timeSheetTable","timeSheetSubTotal");
            subTotEl.dataset.tsPageIndex= '' + i;
            subTotEl.querySelector('.timeSheetTotalDesc').innerText = 'Page ' + (i+1) + ' Subtotal';
            lastTfoot?.appendChild(subTotEl);
        }
    }
    const finalTotEl = tmplClone("tmpl-timeSheetTable","timeSheetFinalTotal");
    lastTfoot?.appendChild(finalTotEl);
    let tsFooter = tmplClone("tmpl-timeSheetAutoPages","timeSheetFinalFooter");
    lastTsPage.appendChild(tsFooter);
    updateTimeSheetTotalHours();

}
function initTimeSheet0() {
    loadTimeSheetPages(); return;
    const timeSheetAutoPages = document.getElementById('timeSheetAutoPages');
    const gii = globalThis.internGlob.internItems;
    if (!('timeSheetPages' in gii)) { gii.timeSheetPages = [ [], ]; }
    if (gii.timeSheetPages.length < 1) {gii.timeSheetPages.push([]) }
    lclSetItem('timeSheetPageCnt', gii.timeSheetPages.length);
    gii.timeSheetPageCnt = gii.timeSheetPages.length;
    let tsPage = tsNewPageClone(0);
    let sum0 = tsSumPage(0);
    tsPage.querySelector('[data-ts-page-index="0"] td.timeSheetTotalHours').innerText = '' + sum0;
    const tsTbody = tsPage.querySelector('tbody');
    const tsNewRow = tsNewRowClone(null, { click : tsNewRow_click_cb, type: 'CreateNew'});
    tsTbody?.appendChild(tsNewRow);
    let tsFooter = tmplClone("tmpl-timeSheetAutoPages","timeSheetFinalFooter");
    timeSheetAutoPages.appendChild(tsPage);
    tsPage.appendChild(tsFooter);
}
function blobInternItems() {
    globalThis.internGlob.jsonSerial = JSON.stringify(globalThis.internGlob.internItems)
    globalThis.internGlob.internBlob = new Blob(
        [globalThis.internGlob.jsonSerial], {type: "application/json", } )
    //console.info('dowblo', globalThis?.internGlob?.downBlobUrl, !!(globalThis?.internGlob?.downBlobUrl))
    if (globalThis?.internGlob?.downBlobUrl) URL.revokeObjectURL(globalThis?.internGlob?.downBlobUrl)
    globalThis.internGlob.downBlobUrl = URL.createObjectURL(globalThis.internGlob.internBlob)
    localStorage.setItem('sfcc::cybr475::intern-json',internGlob.jsonSerial )
    //console.info(globalThis.internGlob)
    const downJsonLink = document.getElementById('downJsonLink')
    downJsonLink.href = globalThis.internGlob.downBlobUrl
    downJsonLink.download = (
        "CYBR475_" + lclGetItem('orgName')
        +  "_" + lclGetItem('stuLastName') + "_" + Date.now() + "_intern.json" )
    //console.info(downJsonLink)
}
function initPage() {
    let lclJson = localStorage.getItem('sfcc::cybr475::intern-json')
    if ( ! ('internGlob'  in globalThis)) {
        globalThis.internGlob = {
            internItems : {
                timeSheetPages: [ [], ],
                weeklyReportPages: [],
                evalPages: [],

            }, internBlob : null,
        }
    }
    if ( null !== lclJson) {
        globalThis.internGlob.internItems =JSON.parse(lclJson)
    }
    backCompatLclStore()
    blobInternItems()
    wireDialogedElements()
    const dialogs = document.getElementsByTagName('dialog')
    for (const dialo of dialogs) {
      dialo.addEventListener('close',
        (('dialogCloseCb' in dialo.dataset && typeof(globalThis[ dialo.dataset.dialogCloseCb ]) === 'function' )
         ? globalThis[ dialo.dataset.dialogCloseCb ]
          : dialogClose_cb));
    }
    const printButts = document.querySelectorAll('button.paperFormPrintButt')
    for (prtButt of printButts) {
      prtButt.addEventListener('click', paperFormPrintButt_cb)
    }
    loadTimeSheetPages();
    lclStoreToDocument()
    addEventListenerById('uploadJsonFileInput','input',uploadJsonFileInput_change_cb)
    addEventListenerById('uploadJsonFileBtn','click',uploadJsonFileBtn_click_cb)
    //let intrnProfsLS = localStorage.getItem('sfcc::cybr475::intern-profiles');
}

/*
 * https://pollei.github.io/sfcc-cyber-bas/ASTR100/wk-sched/?strtDay=2023-03-31
 * https://www.youtube.com/watch?v=EoUIS2PxKCs util functions
 * https://www.youtube.com/watch?v=czZ1PvNW5hk responsive HTML table
 */
