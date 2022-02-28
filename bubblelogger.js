// ==UserScript==
// @name         Bubble Logger
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  log uncaught window (XHR.send, XHR.onerror, $.ajax...) exceptions and write them in the document as bootstrap alert html elements
// @author       Sergio Lopez
// @match        http*://*/*
// @icon         https://store-images.s-microsoft.com/image/apps.32031.13510798887630003.b4c5c861-c9de-4301-99ce-5af68bf21fd1.ba559483-bc2c-4eb9-a17e-c302009b2690?w=180&h=180&q=60
// @resource     REMOTE_CSS https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==
//IIFE
(function() {
    "use strict";
    const $ = window.jQuery;
    const spinner = $("<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"margin: auto; background: none; display: block; shape-rendering: crispedges; animation-play-state: running; animation-delay: 0s;\" width=\"50px\" height=\"50px\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\">  <g style=\"animation-play-state: running; animation-delay: 0s;\">    <circle cx=\"60\" cy=\"50\" r=\"4\" fill=\"#ffffff\" style=\"animation-play-state: running; animation-delay: 0s;\">      <animate attributeName=\"cx\" repeatCount=\"indefinite\" dur=\"1s\" values=\"95;35\" keyTimes=\"0;1\" begin=\"-0.67s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>      <animate attributeName=\"fill-opacity\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0;1;1\" keyTimes=\"0;0.2;1\" begin=\"-0.67s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>    </circle>    <circle cx=\"60\" cy=\"50\" r=\"4\" fill=\"#ffffff\" style=\"animation-play-state: running; animation-delay: 0s;\">      <animate attributeName=\"cx\" repeatCount=\"indefinite\" dur=\"1s\" values=\"95;35\" keyTimes=\"0;1\" begin=\"-0.33s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>      <animate attributeName=\"fill-opacity\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0;1;1\" keyTimes=\"0;0.2;1\" begin=\"-0.33s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>    </circle>    <circle cx=\"60\" cy=\"50\" r=\"4\" fill=\"#ffffff\" style=\"animation-play-state: running; animation-delay: 0s;\">      <animate attributeName=\"cx\" repeatCount=\"indefinite\" dur=\"1s\" values=\"95;35\" keyTimes=\"0;1\" begin=\"0s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>      <animate attributeName=\"fill-opacity\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0;1;1\" keyTimes=\"0;0.2;1\" begin=\"0s\" style=\"animation-play-state: running; animation-delay: 0s;\"></animate>    </circle>  </g><g transform=\"translate(-15 0)\" style=\"animation-play-state: running; animation-delay: 0s;\">  <path d=\"M50 50L20 50A30 30 0 0 0 80 50Z\" fill=\"#005bbf\" transform=\"rotate(90 50 50)\" style=\"animation-play-state: running; animation-delay: 0s;\"></path>  <path d=\"M50 50L20 50A30 30 0 0 0 80 50Z\" fill=\"#005bbf\" style=\"animation-play-state: running; animation-delay: 0s;\">    <animateTransform attributeName=\"transform\" type=\"rotate\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0 50 50;45 50 50;0 50 50\" keyTimes=\"0;0.5;1\" style=\"animation-play-state: running; animation-delay: 0s;\"></animateTransform>  </path>  <path d=\"M50 50L20 50A30 30 0 0 1 80 50Z\" fill=\"#005bbf\" style=\"animation-play-state: running; animation-delay: 0s;\">    <animateTransform attributeName=\"transform\" type=\"rotate\" repeatCount=\"indefinite\" dur=\"1s\" values=\"0 50 50;-45 50 50;0 50 50\" keyTimes=\"0;0.5;1\" style=\"animation-play-state: running; animation-delay: 0s;\"></animateTransform>  </path></g>  <!-- [ldio] generated by https://loading.io/ --></svg>");
    const bubbleStates = ["primary", "danger", "warning"];
    let startTime = new Date();
    console.defaultError = console.error.bind(console);
    console.errors = [];
    console.defaultWarn = console.warn.bind(console);
    console.warns = [];
    console.defaultInfo = console.info.bind(console);
    console.infos = [];

    const messagesBox = $("<div class=\"messagesBox\">");
    const containerSvg = $("<div class=\"svgContainer\">");
    const containerErrors = $("<div class=\"containerErrors\">");
    spinner.appendTo(containerSvg);
    containerSvg.appendTo(messagesBox)
    containerErrors.prependTo(messagesBox);
    messagesBox.appendTo($('body'))

    // containerErrors.prependTo(container);

    function bubbleErrorInHtml(event, bubbleType) {
      bubbleType = bubbleStates.includes(bubbleType) ? bubbleType : "primary";
      // set the message to display: none to fade it in later.
      const messagesBox = $("<div class=\"alert alert-dismissible fade show\" style=\"display: none;\">");
      messagesBox.addClass("alert-" + bubbleType);
      // a close button
      const close = $("<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">&times</button>");
      if (typeof event === "string") {
        messagesBox.append(close); // adding the close button to the message
        messagesBox.append(event); // adding the error response to the message
        messagesBox.prependTo(containerErrors).fadeIn(300); //.delay(10000).fadeOut(500); //.delay(5000).fadeOut(500);
      } else {
        // set the message to display: none to fade it in later.
        const messagesBox = $("<div class=\"alert alert-dismissible fade show\" style=\"display: none;\">");
        messagesBox.addClass("alert-" + bubbleType);
        const close = $("<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">&times</button>");
        messagesBox.append(close); // adding the close button to the message
        messagesBox.append(event.statusCode + " " + event.url + " " + event.duration); // adding the error response to the message
        messagesBox.prependTo(containerErrors).fadeIn(300); //.delay(10000).fadeOut(500); //.delay(5000).fadeOut(500);
      }
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

    // Load remote CSS
    // @see https://github.com/Tampermonkey/tampermonkey/issues/835
    const spinnerCss = ".loadingio-spinner-bean-eater-m1d52hd0p4d {top:50% !important; left:50% !important}";
    GM_addStyle(spinnerCss);
    const myCss = GM_getResourceText("REMOTE_CSS");
    GM_addStyle(myCss);
    const errorMessageCss = ".alert {opacity: 0.9; margin: 0px !important; font-size:13px !important}";
    GM_addStyle(errorMessageCss);
    const messagesBoxCss = ".messagesBox {position: fixed !important; top: 0% !important; width: 100% !important; z-index: 99999999 !important;}";
    GM_addStyle(messagesBoxCss);
    const containerErrorsCss = ".containerErrors {position: fixed !important; top: 0% !important; max-height: 400px !important; width: 100% !important; overflow-y: scroll !important; z-index: 99999999 !important;}";
    GM_addStyle(containerErrorsCss);
    const containerSvgCss = ".svgContainer {position: fixed !important; bottom: 0% !important; max-height: 50px !important; width: 100% !important; z-index: 99999999 !important;}";
    GM_addStyle(containerSvgCss);

    window.addEventListener("load", function() {
      if (window) {
        let _onerror = function(event, url, lineNo, columnNo, error) {
          let eventMessage = event.message ? event.message.toLowerCase() : "";
          if (!eventMessage) {
            eventMessage = event.target.id || event.target.src;
          }
          let substring = "script error";
          if (eventMessage.indexOf(substring) > -1) {
            alert("Script Error: See Browser Console for Detail");
          } else {
            let message = [
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
          // logger.error(args);
          if (_onerror) {
            return _onerror.apply(window, args);
          }
          return false;
        };
      }
      window.addEventListener("unhandledrejection", function(promiseRejectionEvent) {
        console.error("window.rejectionhandled: " + (promiseRejectionEvent.reason.message || promiseRejectionEvent.error || promiseRejectionEvent));
      });
      window.addEventListener("rejectionhandled", function(promiseRejectionEvent) {
        console.error("window.rejectionhandled: " + (promiseRejectionEvent.reason.message || promiseRejectionEvent.error || promiseRejectionEvent));
      });
      window.addEventListener("error", function(errorEvent) {
        console.error("window.error: " + (event.reason.message || errorEvent.error || errorEvent));
      });
      window.addEventListener("fetch", function(event) {
        console.warn("window.fetch: " + (event.reason.message || event.error || event));
        event.respondWith(
          fetch(event.request)
        );
      });
      $.error = function(message) {
        //alert(["jQuery error", message || e.error].join());
        console.error("jQuery: " + message);
      };
      $.ajax({
        url: window.location.href,
        success: function(data, textStatus, event) {
          let time = (new Date() - startTime) + "ms";
          console.info(event.status + " " + window.location.href + " " + time);
        },
        error: function(error) {
          console.error(event.status + " " + window.location.href + " " + event.statusText);
        }
      });
      (function(XHR) {
        "use strict";

        let stats = [];
        let timeoutId = null;

        let open = XHR.prototype.open;
        let send = XHR.prototype.send;

        XHR.prototype.open = function(method, url, async, user, pass) {
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

        //Monkey patch send to be able to profile responses time and log it
        XHR.prototype.send = function(data) {
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
                statusCode: event.currentTarget.status
              });

              if (!timeoutId) {
                timeoutId = window.setTimeout(function() {
                  sendToConsole(event, stats);
                  // let xhr = new XHR();
                  // xhr.noIntercept = true;
                  // xhr.open("POST", "/clientAjaxStats", true);
                  // xhr.setRequestHeader("Content-type", "application/json");
                  // xhr.send(JSON.stringify({ stats: stats }));
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
      })(XMLHttpRequest);
      //Monkey patching window.fetch
      // const { fetch: originalFetch } = window;
      // window.fetch = async (...args) => {
      //   let [resource, config] = args;
      //   let response = await originalFetch(resource, config);
      //   if (!response.ok && response.status === 404) {
      //     // 404 error handling
      //     return Promise.reject(response);
      //   }
      //   return response;
      // };
      //Monkey patching
      // (function(send) {
      //   XMLHttpRequest.prototype.send = function(data, hole) {
      //     let _valuToAdd = $("input[name='valuToAdd']").val();
      //     this.setRequestHeader('valueName', _valuToAdd);
      //     send.call(this, data);
      //   };
      // })(XMLHttpRequest.prototype.send);
      // function banana(xhrInstance) { // Example
      //   xhrInstance.onerror = function(e){
      //     console.log('Monkey sees Monkey does: ' + xhrInstance.readyState);
      //     console.error(e)
      //   }
      //   console.log('Monkey RS: ' + xhrInstance.readyState);
      // }
      // if ('serviceWorker' in navigator) {
      //   window.addEventListener('load', function() {
      //     navigator.serviceWorker.register('http://localhost:2055/pwa/sw.monkeypatcher.js').then(function(registration) {
      //       console.log('Service worker registered with scope: ', registration.scope);
      //     }, function(err) {
      //       console.log('ServiceWorker registration failed: ', err);
      //     });
      //   });
      // }
      // Capture request before any network activity occurs:
      // let onerror = xhr.onerror;
      // let send = xhr.send;
      // xhr.send = function(data) {
      //   let rsc = this.onreadystatechange;
      //   if (rsc) {
      //     // "onreadystatechange" exists. Monkey-patch it
      //     this.onreadystatechange = function() {
      //       banana(this);
      //       return rsc.apply(this, arguments);
      //     };
      //     this.onerror = function() {
      //       banana(this);
      //       return this.onerror.apply(this, arguments);
      //     };
      //   }
      //   return send.apply(this, arguments);
      // };
      // xhr.onerror = function(data) {
      //   let rsc = this.onerror;
      //   if (rsc) {
      //     // "onreadystatechange" exists. Monkey-patch it
      //     this.onerror = function() {
      //       banana(this);
      //       return rsc.apply(this, arguments);
      //     };
      //   }
      //   return onerror.apply(this, arguments);
      // };
      // axios.interceptors.request.use(
      //   request => {
      //     if (localResponse) {
      //       throw { isLocal: true, data: { hello: 'world' } }; // <- this will stop request and trigger
      //       // response error. I want to trigger
      //       // the actual response callback
      //     } else {
      //       return request;   // <- will perform full request
      //     }
      //   },
      //   error => {
      //     return error.isLocal
      //       ? Promise.resolve(error) // <- triggers response intercept
      //       : Promise.reject(error);
      //   }
      // );
      // axios.interceptors.response.use(
      //   response => {
      //     return response;
      //   },
      //   error => {
      //     error.isLocal
      //       ? Promise.resolve(error) // <- sends as successful response
      //       : Promise.reject(error);
      //   }
      // );
      //(function (open) {
      //  XMLHttpRequest.prototype.onload = function (data) {
      //     let _valuToAdd = $("input[name='valuToAdd']").val();
      //    this.setRequestHeader('valueName', _valuToAdd);
      //   onload.call(this, data);
      //};
      // })(XMLHttpRequest.prototype.onload);
      //(function(send) {
      //    XMLHttpRequest.prototype.onerror = function(data) {
      //       //let _valuToAdd = $("input[name='valuToAdd']").val();
      //       this.setRequestHeader('monkeyPatched', true);
      //       onerror.call(this, data);
      //   };
      //})(XMLHttpRequest.prototype.onerror);
      //Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "onerror").get.call(instance);
      //fetch('https://jsonplaceholder.typicode.com/todos/1000000')
      //   .then((response) => response.json())
      //  .then((json) => console.log(json))
      // .catch((error) => console.error(error));
      //navigator.serviceWorker.register('sw.js').then(function(registration) {
      //   console.log('Service worker registered with scope: ', registration.scope);
      //}, function(err) {
      //     console.log('ServiceWorker registration failed: ', err);
      // });
    });
  }
)();
