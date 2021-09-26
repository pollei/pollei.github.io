function copyCode() {
    var copyText = document.getElementById("enrollCode");
    copyText.select();
    document.execCommand("copy");
  }
   function sf_cb(url,vn) {
     var sf,hid,query;
     sf=(document.getElementsByName('searchF'))[0];
     sf.action=url;
     if (vn) {
        console.log('vn: '+vn);
        hid=(document.getElementsByName(vn))[0];
        query=(document.getElementsByName('q'))[0];
        console.log('hid: '+hid);
        hid.removeAttribute('disabled');query.setAttribute('disabled','');
        hid.value=query.value;
     }
     sf.submit();
     if (vn) {query.removeAttribute('disabled');hid.setAttribute('disabled','');}
     sf.action='https://google.com/search';
    }
    function sf_url_cb() {
     var query,url,scheme,host,todo,m,wnd;
     query=(document.getElementsByName('q'))[0];
     url=query.value;
     if (! url.match(/(\w|\d+[.:]\d+)/i)) {
         url='https://tools.ietf.org/html/rfc3986#section-9';
     }
     if (m=url.match(/^([a-z0-9_+.-]+:\/{0,2})(.*)$/i)) {
       scheme=m[1];todo=m[2];
     } else {scheme='https://';todo=url;}
     if (m=todo.match(/^([^\/?#]+)([\/?#].*)$/i)) {
       host=m[1];todo=m[2];
     } else {host=todo;todo='';}
     host=host.replace(/\s+/,'_');
     todo=todo.replace(/\s+/,'%20');
     url=scheme+host+todo;
     wnd=window.open(url,'_blank','noopener');
     wnd.opener = null;
    }
    function us_smb_cb() {
     var query,usrn,url,wnd;
     query=(document.getElementsByName('usrName'))[0];
     usrn=query.value;
     console.log('us_smb_cb: '+usrn);
     if (! usrn.match(/^[a-zA-Z]+\d\d\d\d$/)) {alert('FirstL0000');return;}
     console.log('us_smb_cb: '+usrn);
     url='file://///scc-stufile.ccs.spokane.cc.wa.us/Users'+ usrn[0].toUpperCase() +'/'+usrn;
     console.log('us_smb_cb url: '+url);
     wnd=window.open(url,'_blank','noopener');
     wnd.opener = null;
    }
    function us_sp_cb() {
     var query,usrn,url,wnd;
     query=(document.getElementsByName('usrName'))[0];
     usrn=query.value;
     if (! usrn.match(/^[a-zA-Z]+\d\d\d\d$/)) {alert('FirstL0000');return;}
     console.log('us_sp_cb: '+usrn);
     url='https://communitycollegesofspokane-my.sharepoint.com/personal/'+usrn+'_bigfoot_spokane_edu';
     console.log('us_sp_cb url: '+url);
     wnd=window.open(url,'_blank','noopener');
     wnd.opener = null;
    }
    function onload_body_cb() {
      if ("ActiveXObject" in window) {
        try { 
          var ax = new ActiveXObject("wscript.shell");
          uname = ax.ExpandEnvironmentStrings("%USERNAME%");
          //alert("un:"+uname);
          console.log("un:"+uname)
          } catch(e) {
          //alert("caught:"+e);"Automation server can't create object"
        }
      } else {
        //alert("no active X")
        console.log("no active X")
      }
    }