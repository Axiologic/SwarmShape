var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( !app ) {
    var objappVersion = navigator.appVersion;
    var objAgent = navigator.userAgent;
    var objbrowserName = navigator.appName;
    var objfullVersion = '' + parseFloat(navigator.appVersion);
    var objBrMajorVersion = parseInt(navigator.appVersion, 10);
    var objOffsetName, objOffsetVersion, ix;

// In Chrome
    if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
        objbrowserName = "Chrome";
        objfullVersion = objAgent.substring(objOffsetVersion + 7);
    }
// In Microsoft internet explorer
    else if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
        objbrowserName = "Microsoft Internet Explorer";
        objfullVersion = objAgent.substring(objOffsetVersion + 5);
    }

// In Firefox
    else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
        objbrowserName = "Firefox";
    }
// In Safari
    else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
        objbrowserName = "Safari";
        objfullVersion = objAgent.substring(objOffsetVersion + 7);
        if ((objOffsetVersion = objAgent.indexOf("Version")) != -1)
            objfullVersion = objAgent.substring(objOffsetVersion + 8);
    }

// For other browser "name/version" is at the end of userAgent
    else if ((objOffsetName = objAgent.lastIndexOf(' ') + 1) <
        (objOffsetVersion = objAgent.lastIndexOf('/'))) {
        objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion);
        objfullVersion = objAgent.substring(objOffsetVersion + 1);
        if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) {
            objbrowserName = navigator.appName;
        }
    }
// In Opera
    else if ((objOffsetVersion = objAgent.indexOf("Opera")) != -1) {
        objbrowserName = "Opera";
    }
// trimming the fullVersion string at semicolon/space if present
    if ((ix = objfullVersion.indexOf(";")) != -1)
        objfullVersion = objfullVersion.substring(0, ix);
    if ((ix = objfullVersion.indexOf(" ")) != -1)
        objfullVersion = objfullVersion.substring(0, ix);

    objBrMajorVersion = parseInt('' + objfullVersion, 10);
    if (isNaN(objBrMajorVersion)) {
        objfullVersion = '' + parseFloat(navigator.appVersion);
        objBrMajorVersion = parseInt(navigator.appVersion, 10);
    }
// Android Mobile
    var isAndroidMobile = objAgent.indexOf('Android') > -1 && objAgent.indexOf('Mozilla/5.0') > -1 && objAgent.indexOf('AppleWebKit') > -1;
    var isIOSMobile = objAgent.indexOf('iPhone') > -1 && objAgent.indexOf('Mozilla/5.0') > -1 && objAgent.indexOf('AppleWebKit') > -1;

    var isOperaMobile = objAgent.indexOf('Opera') > -1 && objAgent.indexOf('Android') > -1;
    if (isAndroidMobile || isOperaMobile) {
        var androidVersion = parseFloat(objAgent.slice(objAgent.indexOf("Android") + 8));
    }
// Android Browser (not Chrome)
    var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
    var resultAppleWebKitRegEx = regExAppleWebKit.exec(objAgent);
    var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(objAgent)[1]));
    var isAndroidBrowser = isAndroidMobile && appleWebKitVersion !== null && appleWebKitVersion < 537;
    var isiOsBrowser = isIOSMobile && appleWebKitVersion !== null && appleWebKitVersion < 537;

    //lprint("Browser:" + resultAppleWebKitRegEx + " Agent:" + objAgent);

    if ((objbrowserName == "Microsoft Internet Explorer" && objBrMajorVersion < 10)
        || (objbrowserName == "Firefox" && objBrMajorVersion < 5)
        || (objbrowserName == "Chrome" && objBrMajorVersion < 14)
        || (objbrowserName == "Safari" && objBrMajorVersion < 5 && !isAndroidBrowser)
        || (isAndroidBrowser && androidVersion < 4)
        || (isiOsBrowser)
        || ((objbrowserName == "Opera" || navigator.appName == "Opera") && objBrMajorVersion < 21)
        || (!window.WebSocket)
        || (!window.localStorage)) {
        $(document).ready(function () {
            var pageSwitchBrowser = document.createElement('div');
            pageSwitchBrowser.setAttribute("id", 'overLayIncompatibleBrowser');
            pageSwitchBrowser.innerHTML = '<div class="contentUnsupported">' +
                '<div class="headerUnsupported">' +
                '<label class="titleUnsupported">Improve Your Experience</label>' +
                '</div>' +
                '<div class="descriptionUnsupported"><label>You\'re using a web browser we don\'t support.</label><label>Try one of these options to access this application.</label></div>' +
                '<ul class="optionList">' +
                '<li class="itemsToPickFrom"><a href="http://www.google.ro/intl/ro/chrome/browser/"><img class="imgBrowserIcon" src="../SwarmShape/deps/img/ChromeIcon.png" /><div class="labelBrowser"><label>Google Chrome</label></div></a></li>' +
                '<li class="itemsToPickFrom"><a href="http://www.mozilla.org/ro/firefox/new/"><img class="imgBrowserIcon" src="../SwarmShape/deps/img/firefox-icon.png"/><div class="labelBrowser"><label>Mozilla Firefox</label></div></a></li>' +
                '<li class="itemsToPickFrom"><a href="http://www.opera.com/"><img class="imgBrowserIcon" src="../SwarmShape/deps/img/OperaIcon.png"/><div class="labelBrowser"><label>Opera</label></div></a></li>' +
                '<li class="itemsToPickFrom"><a href="http://support.apple.com/downloads/#safari"><img class="imgBrowserIcon" src="../SwarmShape/deps/img/SafariIcon.png"/><div class="labelBrowser"><label>Safari</label></div></a></li>' +
                '<li class="itemsToPickFrom"><a href="http://windows.microsoft.com/ro-ro/internet-explorer/download-ie"><img class="imgBrowserIcon" src="../SwarmShape/deps/img/InternetExplorerIcon.png"/><div class="labelBrowser"><label>Internet Explorer</label></div></a></li>' +
                '</ul>' +
                '</div>';
            if ((isAndroidBrowser && androidVersion < 4) || (isOperaMobile && objBrMajorVersion < 21 && androidVersion < 4)) {
                pageSwitchBrowser.innerHTML = '<div class="contentUnsupported">' +
                    '<div class="headerUnsupported">' +
                    '<label class="titleUnsupported">Improve Your Experience</label>' +
                    '</div>' +
                    '<div class="descriptionUnsupported"><label>You\'re using a web browser we don\'t support.</label><label>Try one of these options to access this aplication.</label></div>' +
                    '<ul class="optionList" style="width: 300px">' +
                    '<li class="itemsToPickFrom" style="display: block"><a href="https://play.google.com/store/apps/details?id=org.mozilla.firefox"><img class="imgBrowserIcon" src="../SwarmShape/deps/img/firefox-icon.png"/><div class="labelBrowser"><label>Mozilla Firefox</label></div></a></li>' +
                    '</ul>' +
                    '</div>';
            }
            document.getElementsByTagName("body")[0].appendChild(pageSwitchBrowser);
        })
    }
}

//todo: check for safari, and ios6 in browsers and in phoneGap...
var shape_workaround_ios6_setTimeout = false;

