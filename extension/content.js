// This file is loaded into the context of the web page.
//document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);

//function fireContentLoadedEvent () {
//    console.log ("DOMContentLoaded");
    // PUT YOUR CODE HERE.
    //document.body.textContent = "Changed this!";
//}




//https://stackoverflow.com/questions/28186349/chrome-extension-set-to-run-at-document-start-is-running-too-fast


// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js
// @require      https://cdn.jsdelivr.net/npm/renderjson@1.4.0/renderjson.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/rxjs/8.0.0-alpha.2/rxjs.umd.min.js
// @require      https://cdn.jsdelivr.net/npm/d3@7.3.0/dist/d3.min.js
// @require      https://cdn.jsdelivr.net/npm/axios@0.26.0/dist/axios.min.js
//var srcArray = ["https://code.jquery.com/jquery-3.4.1.min.js",
//"https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
//"https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js",
//"https://cdn.jsdelivr.net/npm/renderjson@1.4.0/renderjson.min.js",
//"https://cdnjs.cloudflare.com/ajax/libs/rxjs/8.0.0-alpha.2/rxjs.umd.min.js",
//"https://cdn.jsdelivr.net/npm/d3@7.3.0/dist/d3.min.js",
//"https://cdn.jsdelivr.net/npm/axios@0.26.0/dist/axios.min.js"]
//

var srcArray =[
        "jquery-3.4.1.min.js",
        "popper-1.16.0.min.js",
        "bootstrap-4.4.1.min.js",
        "renderjson-1.4.0.min.js",
        "rxjs-8.0.0.min.js",
        "d3-7.3.0.min.js",
        "axios-0.26.0.min.js"
      ];

for (var i = 0; i < srcArray.length; i++) {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(srcArray[i]);
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

document.body.innerHTML = "<h1>Hello World</h1>" + document.body.innerHTML;