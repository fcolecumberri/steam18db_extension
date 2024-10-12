"use strict";

const ExtensionApi = (() => {
    if (
        typeof browser !== "undefined" &&
        typeof browser.storage !== "undefined"
    ) {
        return browser;
    } else if (
        typeof chrome !== "undefined" &&
        typeof chrome.storage !== "undefined"
    ) {
        return chrome;
    }

    throw new Error("Did not find appropriate web extensions api");
})();

function SendMessageToBackgroundScript(message, callback) {
    const errorCallback = (error) =>
        callback({ success: false, error: error.message });
    try {
        ExtensionApi.runtime
            .sendMessage(message)
            .then(callback)
            .catch(errorCallback);
    } catch (error) {
        errorCallback(error);
    }
}

function execute() {
    const steampowered_re = new RegExp(
        ".*?store.steampowered.com/app/(?<app_id>[^/]*)",
    );
    var steam_app_id =
        window.location.href.match(steampowered_re).groups["app_id"];
    if (!steam_app_id) {
        return;
    }
    SendMessageToBackgroundScript(
        {
            contentScriptQuery: "fetch",
            url: "https://steam18db.com/api/app/" + steam_app_id,
        },
        function (data) {
            function insertAfter(referenceNode, newNode) {
                referenceNode.parentNode.insertBefore(
                    newNode,
                    referenceNode.nextSibling,
                );
            }
            const patch = data["patch"];
            if (patch) {
                var patch_div = document.createElement("div");
                patch_div.innerHTML =
                    "This is an «Adult only» censored game, there is a uncensoring patch" +
                    ' <a href="' +
                    patch +
                    '" class="btnv6_blue_hoverfade btn_medium right" data-tooltip-text="Access to uncensoring patch" target="_blank" rel="noopener noreferrer"> <span>Go to uncensoring patch&nbsp;&nbsp;&nbsp;<i class="ico16 arrow_next"></i></span> </a>';
                patch_div.className = "mature_content_notice";
                insertAfter(
                    document.getElementsByClassName("game_background_glow")[0],
                    patch_div,
                );
            }
        },
    );
}

execute();
