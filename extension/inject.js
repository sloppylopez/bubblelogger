let srcArray = [
    "lib/popper-1.16.0.min.js",
    "lib/bootstrap-4.4.1.min.js",
    "lib/renderjson-1.4.0.min.js",
    "lib/rxjs-8.0.0.min.js",
    "lib/d3-7.3.0.min.js",
    "lib/axios-0.26.0.min.js"
];

for (let i = 0; i < srcArray.length; i++) {
    let s = document.createElement('script');
    s.src = chrome.runtime.getURL(srcArray[i]);
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

let styles = [
    "css/bootstrap-4.4.1.min.css",
    "css/animate-4.1.1.min.css",
];

for (let e = 0; e < styles.length; e++) {
    let style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = chrome.runtime.getURL(styles[e]);
    (document.head || document.documentElement).appendChild(style);
}

const nullThrows = (v) => {
    if (v == null) throw new Error("it's a null");
    return v;
}
//https://stackoverflow.com/questions/67439012/chrome-extension-manifest-v3-content-security-policy
function injectCode(src) {
    const script = document.createElement('script');
    // This is why it works!
    script.src = src;
    script.onload = function() {
        console.log("script injected");
        this.remove();
    };

    // This script runs before the <head> element is created,
    // so we add the script to <html> instead.
    nullThrows(document.head || document.documentElement).appendChild(script);
}

injectCode(chrome.runtime.getURL('/content.js'));