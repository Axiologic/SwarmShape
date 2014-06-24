
var objAgent = navigator.userAgent;
appPhoneGap = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( appPhoneGap ) {
    // PhoneGap application
    $(document).ready(function () {
        var cordovaScript=document.createElement('script');
        cordovaScript.setAttribute("type","text/javascript");
        cordovaScript.setAttribute("src", 'cordova.js');
        document.getElementsByTagName("head")[0].appendChild(cordovaScript);
        var facebookPluginScript=document.createElement('script');
        facebookPluginScript.setAttribute("type","text/javascript");
        facebookPluginScript.setAttribute("src", 'cdv-plugin-fb-connect.js');
        document.getElementsByTagName("head")[0].appendChild(facebookPluginScript);
        var facebookSDKScript=document.createElement('script');
        facebookSDKScript.setAttribute("type","text/javascript");
        facebookSDKScript.setAttribute("src", 'facebook-js-sdk.js');
        document.getElementsByTagName("head")[0].appendChild(facebookSDKScript);
        var pushNotificationScript=document.createElement('script');
        pushNotificationScript.setAttribute("type","text/javascript");
        pushNotificationScript.setAttribute("src", 'PushNotification.js');
        document.getElementsByTagName("head")[0].appendChild(pushNotificationScript);
    });
// Android Mobile
    var isAndroidMobile = objAgent.indexOf('Android') > -1 && objAgent.indexOf('Mozilla/5.0') > -1 && objAgent.indexOf('AppleWebKit') > -1;
    if (isAndroidMobile) {
        var androidVersion = parseFloat(objAgent.slice(objAgent.indexOf("Android") + 8));
    }
    if (isAndroidMobile && androidVersion < 4) {
        $(document).ready(function () {
//            var siteLink = "http://192.168.2.140/channels";
//            var marketFirefoxLink = "https://play.google.com/store/apps/details?id=org.mozilla.firefox";
//            var pageSwitchBrowser = document.createElement('div');
//            pageSwitchBrowser.setAttribute("id", 'overLayIncompatibleBrowser');
//            pageSwitchBrowser.innerHTML = '<div class="contentUnsupported">' +
//                '<div class="headerUnsupported">' +
//                '<label class="titleUnsupported">Improve Your Experience</label>' +
//                '</div>' +
//                '<div class="descriptionUnsupported"><label>You\'re using a Android version we don\'t support.</label><label>You can access this application from web by tapping the follow icon, we strongly recommend Firefox Browser.</label></div>' +
//                '<ul class="optionList" style="width: 300px">' +
//                '<li class="itemsToPickFrom" style="display: block"><a href="#null" id="siteLink" target="_system"><img class="imgBrowserIcon" src="img/channel64.png"/><div class="labelBrowser"><label>TheBuzzCenter</label></div></a></li>' +
//                '</ul>' +
//                '<div class="descriptionUnsupported"><label>If you don\'t have Firefox browser installed on your device tap on the follow icon.</label></div>' +
//                '<ul class="optionList" style="width: 300px">' +
//                '<li class="itemsToPickFrom" style="display: block"><a href="#null" id="marketFirefoxLink" target="_system" ><img class="imgBrowserIcon" src="img/firefox-icon.png"/><div class="labelBrowser"><label>Mozilla Firefox</label></div></a></li>' +
//                '</ul>' +
//                '</div>';
//            document.getElementsByTagName("body")[0].appendChild(pageSwitchBrowser);
//            document.getElementById("siteLink").addEventListener("click", function () {
//                openExternalLink(siteLink);
//            }, false);
//            document.getElementById("marketFirefoxLink").addEventListener("click", function () {
//                openExternalLink(marketFirefoxLink);
//            }, false);
//            function openExternalLink(link) {
//                //alert("openExternalLink "+link);
//                navigator.app.loadUrl(link, { openExternal: true });
//                return false;
//            }
        })
    }
    function onDeviceReady() {
        navigator.splashscreen.hide();

    }
    document.addEventListener("deviceready", onDeviceReady, false);

}

