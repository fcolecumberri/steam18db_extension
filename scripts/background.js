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

function GetJsonWithStatusCheck(response) {
    if (!response.ok) {
        const e = new Error(`HTTP ${response.status}`);
        e.name = "FetchError";
        throw e;
    }
    return response.json();
}

function BackgroundFetch(url, callback) {
    fetch(url)
        .then(GetJsonWithStatusCheck)
        .then(callback)
        .catch((error) => callback({ success: false, error: error.message }));
}

ExtensionApi.runtime.onMessage.addListener((request, sender, callback) => {
    if (!sender || !sender.tab) {
        return false;
    }
    if (!Object.hasOwn(request, "contentScriptQuery")) {
        return false;
    }
    switch (request.contentScriptQuery) {
        case "fetch":
            BackgroundFetch(request.url, callback);
            return true;
    }
    return false;
});
