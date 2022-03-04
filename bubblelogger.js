// ==UserScript==
// @name         Bubble Logger
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js
// @require      https://cdn.rawgit.com/caldwell/renderjson/master/renderjson.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/rxjs/8.0.0-alpha.2/rxjs.umd.min.js
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  log uncaught window (XHR.send, XHR.onerror) exceptions and write them in the document as bootstrap alert html elements
// @author       Sloppy Lo
// @match        http*://*/*
// @icon         https://store-images.s-microsoft.com/image/apps.32031.13510798887630003.b4c5c861-c9de-4301-99ce-5af68bf21fd1.ba559483-bc2c-4eb9-a17e-c302009b2690?w=180&h=180&q=60
// @resource     REMOTE_BOOTSTRAP_CSS https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css
// @resource     ANIMATE_CSS_MIN https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==
//Info: https://sourceforge.net/p/greasemonkey/wiki/unsafeWindow/
// https://benjamine.github.io/jsondiffpatch/demo/index.html
// https://abodelot.github.io/jquery.json-viewer/
// https://programming.mediatagtw.com/article/tampermonkey+unsafewindow
// https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reload-to-the-same-place-even-if/2631931#2631931
// http://jsfiddle.net/luisperezphd/L8pXL/
// /nl/wlan-access-points/mikrotik/omnitik-5-poe-ac-rbomnitikpg-5hacd-art-rbomnitikpg-5hacd-num-6166159/
//IIFE
(function() {
    "use strict";
    let id = 0;
    const $ = window.jQuery;
    const rxjs = window.rxjs;
    window.dataLayer = window.dataLayer || [];
    const spinner = $("<div class=\"svgDiv\"><svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"margin: auto; background: none; display: block; shape-rendering: crispedges; animation-play-state: running; animation-delay: 0s;\" width=\"50px\" height=\"50px\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\">  <g style=\"animation-play-state: running; animation-delay: 0s;\">    <circle cx=\"60\" cy=\"50\" r=\"4\" fill=\"#ffffff\" style=\"animation-play-state: running; animation-delay: 0s;\">      <animate attributeName=\"cx\" repeatCount=\"indefinite\" dur=\"1s\" values=\"95;35\" keyTimes=\"0;1\" begin=\"-0.67s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>      <animate attributeName=\"fill-opacity\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0;1;1\" keyTimes=\"0;0.2;1\" begin=\"-0.67s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>    </circle>    <circle cx=\"60\" cy=\"50\" r=\"4\" fill=\"#ffffff\" style=\"animation-play-state: running; animation-delay: 0s;\">      <animate attributeName=\"cx\" repeatCount=\"indefinite\" dur=\"1s\" values=\"95;35\" keyTimes=\"0;1\" begin=\"-0.33s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>      <animate attributeName=\"fill-opacity\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0;1;1\" keyTimes=\"0;0.2;1\" begin=\"-0.33s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>    </circle>    <circle cx=\"60\" cy=\"50\" r=\"4\" fill=\"#ffffff\" style=\"animation-play-state: running; animation-delay: 0s;\">      <animate attributeName=\"cx\" repeatCount=\"indefinite\" dur=\"1s\" values=\"95;35\" keyTimes=\"0;1\" begin=\"0s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>      <animate attributeName=\"fill-opacity\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0;1;1\" keyTimes=\"0;0.2;1\" begin=\"0s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>    </circle>  </g><g transform=\"translate(-15 0)\" style=\"animation-play-state: running; animation-delay: 0s;\">  <path d=\"M50 50L20 50A30 30 0 0 0 80 50Z\" fill=\"#005bbf\" transform=\"rotate(90 50 50)\" style=\"animation-play-state: running; animation-delay: 0s;\"></path>  <path d=\"M50 50L20 50A30 30 0 0 0 80 50Z\" fill=\"#005bbf\" style=\"animation-play-state: running; animation-delay: 0s;\">    <animateTransform attributeName=\"transform\" type=\"rotate\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0 50 50;45 50 50;0 50 50\" keyTimes=\"0;0.5;1\" style=\"animation-play-state: running; animation-delay: 0s;\"></animateTransform>  </path>  <path d=\"M50 50L20 50A30 30 0 0 1 80 50Z\" fill=\"#005bbf\" style=\"animation-play-state: running; animation-delay: 0s;\">    <animateTransform attributeName=\"transform\" type=\"rotate\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0 50 50;-45 50 50;0 50 50\" keyTimes=\"0;0.5;1\" style=\"animation-play-state: running; animation-delay: 0s;\"></animateTransform>  </path></g>  <!-- [ldio] generated by https://loading.io/ --></svg></div>");
    const bubbleStates = ["primary", "danger", "warning"];
    console.defaultError = console.error.bind(console);
    console.errors = [];
    console.defaultWarn = console.warn.bind(console);
    console.warns = [];
    console.defaultInfo = console.info.bind(console);
    console.infos = [];

    importCSS();

    const requestsBox = $("<div id=\"requestsBox\" class=\"requestsBox animate__animated animate__rollIn customCollapse\">");
    // const responsesBox = $("<div class=\"responsesBox\">");
    const containerSvg = $("<div id=\"svgContainer\" class=\"svgContainer\">");
    const containerErrors = $("<div id=\"containerErrors\" class=\"containerErrors animate__animated\">");
    const hrefButton = $("<a class=\"btn btn-primary\" role=\"button\">href</a>");
    const refreshButton = $("<a class=\"btn btn-primary\" onclick=\"window.location.reload(true)\" role=\"button\">refresh</a>");
    const closeButton = $("<a class=\"btn btn-danger\" role=\"button\">X</a>");
    const buttonsDiv = $("<div class=\"buttonsDiv\"></div>");
    refreshButton.prependTo(buttonsDiv);
    hrefButton.prependTo(buttonsDiv);
    closeButton.prependTo(buttonsDiv);

    spinner.prependTo(containerSvg);
    buttonsDiv.appendTo(containerSvg);
    containerSvg.prependTo(requestsBox);
    containerErrors.appendTo(requestsBox);
    requestsBox.appendTo($("body"));

    spinner.on("click", function() {
      if ($(requestsBox).hasClass("customCollapse")) {
        $(requestsBox).removeClass("customCollapse");
        $(".containerErrors div").fadeIn("2000");
        $(containerSvg).css("left", "1%");
        $(requestsBox).css("left", "0%");
        $(".svgDiv svg").css("float", "right");
        $(buttonsDiv).css("display", "block");
        $(containerErrors).css("display", "block");
      } else {
        $(containerErrors).addClass("animate__hinge");
        setTimeout(() => {
          $(containerErrors).removeClass("animate__hinge");
        }, 2000);
        $(".svgDiv svg").css("float", "left");
        $(buttonsDiv).css("display", "none");
        $(".containerErrors div").fadeOut("2000");
        $(containerSvg).css("left", "1%");
        $(requestsBox).css("left", "-37%");
        // $(containerErrors).css("display", "none");
        setTimeout(() => {
          $(requestsBox).addClass("customCollapse");
        }, 500);
      }
      // $(containerErrors).siblings().hide("slow");
    });

    hrefButton.on("click", function() {
      const anchors = $("a[href]").not(".svgContainer a").not(".containerErrors a");
      const buttons = $("button");
      buttons.map((index, button) => {
        // if($(button).data("events").click){
        //   $(button).css("background", "red");
        //   $(button).css("border-color", "yellow");
        //   $(button).css("border", "2px");
        // }
      });
      $(anchors).css("background", "red").css("border-color", "yellow").css("border", "2px");
    });
    closeButton.on("click", function() {
      $(".containerErrors div").fadeOut("2000");
    });

    // responsesBox.appendTo($("body"));

    function importCSS() {
      // Load remote CSS
      // @see https://github.com/Tampermonkey/tampermonkey/issues/835
      const bootstrapCss = GM_getResourceText("REMOTE_BOOTSTRAP_CSS");
      GM_addStyle(bootstrapCss);
      const animateCssMin = GM_getResourceText("ANIMATE_CSS_MIN");
      GM_addStyle(animateCssMin);
      const jsonViewerCss = `.renderjson a { text-decoration: none; }
                            .renderjson .disclosure { color: green;
                             font-size: 150%; }
                            .renderjson .syntax { color: grey; }
                            .renderjson .string { color: darkred; }
                            .renderjson .number { color: darkcyan; }
                            .renderjson .boolean { color: blueviolet; }
                            .renderjson .key    { color: darkblue; }
                            .renderjson .keyword { color: blue; }
                            .renderjson .object.syntax { color: lightseagreen; }
                            .renderjson .array.syntax  { color: orange; }`;
      GM_addStyle(jsonViewerCss);
      const customCollapse = ".customCollapse {float: right !important}";
      GM_addStyle(customCollapse);
      const spinnerCss = ".loadingio-spinner-bean-eater-m1d52hd0p4d {top:50% !important; left:50% !important} a {display: inline !important}";
      GM_addStyle(spinnerCss);
      const errorMessageCss = ".alert {word-break: break-word !important; opacity: 0.95 !important; margin: 0px !important; font-size:13px !important}";
      GM_addStyle(errorMessageCss);
      const requestsBoxCss = ".requestsBox { overflow-y: scroll !important; max-height: 88% !important; opacity: 0.95 !important; position: fixed !important; top: 17% !important; width: 40% !important; z-index: 99999999 !important; left: -37%;} .string {word-wrap: break-word !important;}";
      GM_addStyle(requestsBoxCss);
      const svgDivCss = ".svgDiv {width: 100% !important; float: left !important; background-color: black !important} .svgContainer svg {float: right !important}";
      GM_addStyle(svgDivCss);
      const buttonsDivCss = ".buttonsDiv {overflow-y: scroll !important;display: none; background-color: yellow !important; width: 100% !important; position: relative !important; float: left !important; height: 28px !important;} .buttonsDiv a {width: 33.3% !important; height: 28px !important; float: left !important; text-align: center !important; font-size: 12px !important; border-color: black !important; padding-top: 5px !important}";
      GM_addStyle(buttonsDivCss);
      // const responsesBoxCss = ".responsesBox {position: fixed !important; right: 0% !important; top: 70% !important; width: 50% !important; z-index: 99999999 !important; overflow-y: scroll !important;}";
      // GM_addStyle(responsesBoxCss);
      const containerErrorsCss = ".containerErrors {display: none; width: 100% !important; position: relative !important; overflow-y: scroll !important; z-index: 99999999 !important;}";
      GM_addStyle(containerErrorsCss);
      const containerSvgCss = ".svgContainer {cursor: pointer !important;left: 1%; z-index: 99999999 !important;} .svgContainer svg{float: left}";
      GM_addStyle(containerSvgCss);
    }

    function appendObjectToHTML(event, requestLine) {
      let url;
      try {
        url = new URL(event.url);
      } catch (e) {//Sometimes event.url will not have origin
        url = event.url;
      }
      let jsonHTML;
      let response;
      try {
        response = JSON.parse(event.response);
      } catch (e) {
        console.log(e);//Sometimes we get malformed jsons
        response = JSON.parse(JSON.stringify({ response: event.response }));
      }
      jsonHTML = renderjson(response);
      if (event.url) {
        url = event.url.replace(url.origin, "");
        requestLine.append("<p style=\"word-break: break-word;\">" + " <a href=\"" + event.url + "\" class=\"alert-link\">" + url.substring(1, url.length) + "<a/> <br/>" + (event.method ? event.method.toUpperCase() : "") + " " + event.statusCode + " " + event.duration + "<p\>"); // adding the error response to the message
      } else {
        requestLine.append("<p style=\"word-break: break-word;\">" + event[0] + "<p\>"); // adding the error response to the message
      }
      // if($(requestsBox).hasClass("customCollapse")){
      //   requestLine.css("display", "none");
      // }
      requestLine.append(jsonHTML);
    }

    function bubbleErrorInHtml(event, bubbleType) {
      bubbleType = bubbleStates.includes(bubbleType) ? bubbleType : "primary";
      const newId = id++;
      const requestLine = $("<div id=\"requestId-" + newId + "\" class=\"alert alert-dismissible fade show\" style=\"display: none;\">");
      // const responseLine = $("<div id=\"responseId-" + newId + "\" style=\"display: block;\">");
      requestLine.addClass("alert-" + bubbleType);
      const close = $("<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">&times</button>");
      requestLine.append(close);
      if (typeof event === "string") {
        requestLine.append(event);
      } else {
        appendObjectToHTML(event, requestLine);
      }
      requestLine.prependTo(containerErrors).fadeIn(300); //.delay(20000).fadeOut(500); //.delay(5000).fadeOut(500);
    }

    console.error = function() {
      bubbleErrorInHtml(arguments[0], "danger");
      // default &  console.error()
      console.defaultError.apply(console, arguments);
      // new & array data
      console.errors.push(Array.from(arguments));
    };

    console.warn = function() {
      bubbleErrorInHtml(arguments[0], "warning");
      // default &  console.error()
      console.defaultWarn.apply(console, arguments);
      // new & array data
      console.warns.push(Array.from(arguments));
    };

    console.info = function() {
      bubbleErrorInHtml(arguments[0], "primary");
      // default &  console.error()
      console.defaultInfo.apply(console, arguments);
      // new & array data
      console.infos.push(Array.from(arguments));
    };

    window.addEventListener("load", function() {
      if (window) {
        let _onerror = function(event, url, lineNo, columnNo, error) {
          let message = [];
          let eventMessage = event.message ? event.message.toLowerCase() : event.error ? event.error : null;
          if (!eventMessage && event.path[0].tagName === "IMG") {//This is hacky, change me
            eventMessage = event.type + " at <a href=\"#\" style=\"word-break: break-word;\">" + new Option(event.path[0].outerHTML).innerHTML + "<a\>";
          }
          if (!eventMessage) {
            eventMessage = event.target.id || event.target.src;
          }
          let substring = "script error";
          if (eventMessage.indexOf(substring) > -1) {
            alert("Script Error: See Browser Console for Detail");
          } else {
            message = [
              "Message: " + eventMessage,
              "URL: " + url,
              "Line: " + lineNo,
              "Column: " + columnNo,
              "Error object: " + JSON.stringify(error)
            ].join(" - ");
            console.error(message);
          }
          //GM_notification('text', 'title', 'https://store-images.s-microsoft.com/image/apps.32031.13510798887630003.b4c5c861-c9de-4301-99ce-5af68bf21fd1.ba559483-bc2c-4eb9-a17e-c302009b2690?w=180&h=180&q=60', ()=>{console.log('click');})
          return false;
        };
        // Handle Uncaught Errors
        window.onerror = function() {
          let args = Array.prototype.slice.call(arguments);
          if (_onerror) {
            return _onerror.apply(window, args);
          }
          return false;
        };
      }
      window.addEventListener("unhandledrejection", function(errorEvent) {
        let error = undefined;
        try {
          if (errorEvent.reason) {
            error = errorEvent.reason.stack || errorEvent.reason.message;
          } else {
            error = errorEvent.error || errorEvent.message || JSON.stringify(errorEvent);
          }
        } catch (e) {
          console.log(e);
        }
        console.error("window.rejectionhandled: " + error);
      });
      window.addEventListener("rejectionhandled", function(errorEvent) {
        let error = undefined;
        try {
          if (errorEvent.reason) {
            error = errorEvent.reason.stack || errorEvent.reason.message;
          } else {
            error = errorEvent.error || errorEvent.message || JSON.stringify(errorEvent);
          }
        } catch (e) {
          console.log(e);
        }
        console.error("window.rejectionhandled: " + error);
      });
      window.addEventListener("error", function(errorEvent) {
        let error = undefined;
        try {
          if (errorEvent.reason) {
            error = errorEvent.reason.stack || errorEvent.reason.message;
          } else {
            error = errorEvent.error || errorEvent.message || JSON.stringify(errorEvent);
          }
        } catch (e) {
          console.log(e);
        }
        console.error("window.error: " + error);
      });
      window.addEventListener("fetch", function(event) {
        let error = undefined;
        try {
          if (event.reason) {
            error = event.reason.stack || event.reason.message;
          } else {
            error = event.error || JSON.stringify(event);
          }
        } catch (e) {
          console.log(e);
        }
        console.warn("window.fetch: " + error);
        event.respondWith(
          fetch(event.request)
        );
      });
      $.error = function(message) {
        console.error("jQuery: " + message);
      };

      let stats = [];
      let timeoutId = null;
      let open = XMLHttpRequest.prototype.open;
      let send = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this._url = url;
        open.call(this, method, url, async, user, pass);
      };

      function sendToConsole(event, stats) {
        stats.forEach((stat) => {
          if (stat.statusCode >= 200 && stat.statusCode < 400) {
            console.info(stat);
          } else if (stat.statusCode === 404) {
            console.warn(stat);
          } else {
            console.error(stat);
          }
        });
      }

      XMLHttpRequest.prototype.send = function(data) {
        let self = this;
        let start;
        let oldOnReadyStateChange;
        let url = this._url;

        function onReadyStateChange(event) {
          //Info: Log all you need from event
          if (self.readyState === 4 /* complete */) {
            let time = new Date() - start;
            stats.push({
              url: url,
              duration: time + "ms",
              statusCode: ["undefined", "null", "", null, undefined].includes(event.currentTarget.status) ? "unknown" : event.currentTarget.status,
              response: ["undefined", "null", "", null, undefined].includes(event.currentTarget.response) ? "unknown" : event.currentTarget.response,
              method: event.currentTarget["nr@context"] && event.currentTarget["nr@context"].params ? event.currentTarget["nr@context"].params.method : "unknown"
            });

            if (!timeoutId) {
              timeoutId = window.setTimeout(function() {
                sendToConsole(event, stats);
                timeoutId = null;
                stats = [];
              }, 2000);
            }
          }
          if (oldOnReadyStateChange) {
            oldOnReadyStateChange();
          }
        }

        if (!this.noIntercept) {
          start = new Date();

          if (this.addEventListener) {
            this.addEventListener("readystatechange", onReadyStateChange, false);
          } else {
            oldOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = onReadyStateChange;
          }
        }
        send.call(this, data);
      };
    });

    //Only way to access window.dataLayer is by creating a script in the DOM as seeing in https://programming.mediatagtw.com/article/tampermonkey+unsafewindow AND use // @grant        unsafeWindow
    function observeDataLayer() {
      for (let i = 0; i < 10; i++) {
        console.log(window.dataLayer);
        console.log(window.jQuery);
      }
      rxjs.of(window.dataLayer)
        .subscribe(x => {
            try {
              const element = document.createElement("div");
              element.innerText = "Data: " + JSON.stringify(x);
              document.body.appendChild(element);
              document.body.appendChild(JSON.stringify(window.dataLayer));
            } catch (e) {
              console.log(e);
            }
          },
          err => {
            console.log(err);
          },
          () => {
            const element = document.createElement("div");
            element.innerText = "All done";
            document.body.appendChild(element);
          });
    }

    let script = document.createElement("script");
    script.textContent = "(" + observeDataLayer.toString() + ")();";
    try {
      document.head.appendChild(script);
    } catch (e) {// This is for: Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'unsafe-eval' 'self' 'sha256-nnRzvGsB15enSSxWufoVP+C4WOA6Spq28ybk2OobhJo=' https://static.observablehq.com https://www.google-analytics.com https://www.googleapis.com https://apis.google.com https://js.stripe.com". Either the 'unsafe-inline' keyword, a hash ('sha256-NW48ymmYcooO0dbY1vr0sH+pipddsZUK7g5L8N3COw8='), or a nonce ('nonce-...') is required to enable inline execution.
      console.error(e);
    }
    //Get info of clicked elements
    document.onclick = (event) => {
      if (event === undefined) event = window.event;                     // IE hack
      let target = "target" in event ? event.target : event.srcElement; // another IE hack
      // if (window.event.path[0].attributes[0].nodeValue ==='requestsBox' || window.event.path[2].attributes[0].nodeValue) return;//Don't
      let root = document.compatMode === "CSS1Compat" ? document.documentElement : document.body;
      let mxy = [event.clientX + root.scrollLeft, event.clientY + root.scrollTop];

      let path = getPathTo(target);
      if (path.includes("requestsBox") || path.includes("svgContainer") || path.includes("containerErrors") || path.includes("requestId-")) return;
      let txy = getPageXY(target);
      // path = path.replaceAll("/", "\n");
      //// let treePath = {response: {}};
      // const array = [1, 2, 3, 4];
      // const reducer = (accumulator, currentValue, index ) => {
      //   return accumulator + '<pre>' + currentValue;
      // }
      // 1 + 2 + 3 + 4
      // console.log(array.reduce(reducer)); //10
      // event.response = path.split("/").reduce(reducer)
      ////path.split("/").forEach(function(part, index) {
      // const last = index - 1;
      ////treePath.response.add(index, part)
      ////});
      ////treePath["offset"] = {
      ////x: (mxy[0] - txy[0]),
      ////y: (mxy[1] - txy[1])
      ////};
      ////console.info(treePath);
      console.info(path + " \noffset x:" + (mxy[0] - txy[0]) + ", y:" + (mxy[1] - txy[1]));
    };

    function getPathTo(element) {
      if (element.id !== "")
        return "id(\"" + element.id + "\")";
      if (element === document.body)
        return element.tagName;

      let ix = 0;
      let siblings = element.parentNode.childNodes;
      for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i];
        if (sibling === element)
          return getPathTo(element.parentNode) + "/" + element.tagName + "[" + (ix + 1) + "]";
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
          ix++;
      }
    }

    function getPageXY(element) {
      let x = 0, y = 0;
      while (element) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      }
      return [x, y];
    }

    //Count number of elements
    // let paragraphCount = document.evaluate("count(//p)", document, null, XPathResult.ANY_TYPE, null);

    // console.info("This document contains " + paragraphCount.numberValue + " paragraph elements");
    // Check if canonical link URI is matching window.location.href
    let canonicalLinkURI, windowURI;
    try {
      setTimeout(() => {// This needs to be async and timedout to aovid false positives when website has a redirection
        if (window.self === window.top) {// We don't want to check this if we are in an Iframe to avoid false positive
          canonicalLinkURI = $("link[rel='canonical']");
          if (canonicalLinkURI[0] && canonicalLinkURI[0].href) {
            canonicalLinkURI = new URL(canonicalLinkURI[0].href);
            windowURI = new URL(window.location.href);
            const message = `Canonical url: ${canonicalLinkURI}`;
            if (canonicalLinkURI.pathname === windowURI.pathname) {
              console.info(message);
            } else {
              console.error(message);
            }
          } else {
            console.warn("No canonical link found");
          }
        }
      }, 2000);
    } catch (e) {
      console.log(e);
      return;
    }
  }
)();
