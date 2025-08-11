/* 插件安装成功事件 */
chrome.runtime.onInstalled.addListener(function () {
    const version = chrome.runtime.getManifest().version;
    chrome.tabs.create({
        url: `installed.html#${version}`
    });
});

/* 扩展图标点击事件，打开单独窗口 */
chrome.action.onClicked.addListener((tab) => {
    chrome.windows.create({
        url: 'home.html',
        type: "popup",
        width: 512,
        height: 640
    });
});