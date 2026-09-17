/// <reference path="../../node_modules/chrome-types/index.d.ts" />
/// <reference path="../scripts/index.d.ts" />

async function updateTasks(tab: chrome.tabs.Tab): Promise<Task[]> {
  if (tab.id === undefined) return [];
  const response: Task[] = await chrome.tabs.sendMessage(tab.id, { type: "getTasks" });

  const tasks = /* html */ `<section class="list">
    ${response
      .map(
        (task) => /* html */ `<div class="task">
          <h3>${task.name}</h3>
          ${task.isRunning ? /* html */ `<span class="loading"></span>` : ""}
          ${task.isComplete ? /* html */ `<span class="success"><img src="../../assets/ui/checkmark-circle-outline.svg" draggable="false" /></span>` : ""}
          ${task.isFailed ? /* html */ `<span class="failure"><img src="../../assets/ui/close-circle-outline.svg" draggable="false" /></span>` : ""}
        </div>`
      )
      .join("")}
  </section>`;

  const list = document.querySelector(".list");
  if (!list) document.body.insertAdjacentHTML("beforeend", tasks);
  else list.outerHTML = tasks;

  return response;
}

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url!.includes("learn.zybooks.com/zybook")) return (document.body.innerHTML = /* html */ `<div>this isnt a zybook silly</div>`);

  try {
    if (!tab.id) return;
    await chrome.tabs.sendMessage(tab.id, { type: "clearTasks" });
  } catch (error) {}

  const [section, course] = tab.title!.split(/[|\-]/g).map((part) => part.trim());
  document.body.innerHTML = /* html */ `<header>
    <h1>${section ?? "Loading"}</h1>
    <h2 class="course">${course ?? "Loading"}</h2>
  </header>

  <button class="solve">Solve!</button>
  <button class="copy">Copy?</button>`;

  const button: HTMLButtonElement = document.querySelector(".solve")!;
  const copyButton: HTMLButtonElement = document.querySelector(".copy")!;

  copyButton.addEventListener("click", async () => {
    const { copyText } = await chrome.storage.local.get("copyText");
    await navigator.clipboard.writeText(copyText);
    copyButton.textContent = "Copied";
  });

  button.addEventListener("click", async () => {
    if (tab.id === undefined) return;
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: () => {
        document.querySelectorAll<HTMLElement>(".ace_editor").forEach((el) => {
          el.dataset.aceText = (el as any).env?.editor?.getValue() ?? "";
        });
      }
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["out/build.js"]
    });

    updateTasks(tab);

    const interval = setInterval(async () => {
      const results = await updateTasks(tab);
      if (results.every((task) => !task.isRunning)) clearInterval(interval);
    }, 1000);
  });
});
