/// <reference path="../../node_modules/chrome-types/index.d.ts" />

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url!.includes("learn.zybooks.com/zybook")) return (document.body.innerHTML = /* html */ `<div>this isnt a zybook silly</div>`);

  document.body.innerHTML = /* html */ `<button>click me</button>`;

  const button: HTMLButtonElement = document.querySelector("button")!;

  button.addEventListener("click", async () => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      files: ["src/build.js"]
    });
  });
});
