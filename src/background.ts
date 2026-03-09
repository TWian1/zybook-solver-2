/// <reference path="../node_modules/chrome-types/index.d.ts" />

function isZybook(url: string): boolean {
  return url?.includes("learn.zybooks.com/zybook");
}

function updateIcon(url?: string): void {
  const isGray = url && !isZybook(url);

  chrome.action.setIcon({
    path: isGray
      ? {
          "16": "../assets/icon-gray-16.png",
          "32": "../assets/icon-gray-32.png",
          "48": "../assets/icon-gray-48.png",
          "128": "../assets/icon-gray-128.png"
        }
      : {
          "16": "../assets/icon-16.png",
          "32": "../assets/icon-32.png",
          "48": "../assets/icon-48.png",
          "128": "../assets/icon-128.png"
        }
  });
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateIcon(tab.url);
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") updateIcon(tab.url);
});
