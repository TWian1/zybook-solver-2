import { handleShortAnswer, handleMultipleChoice, handleAnimationPlayer, handleDefinitions } from "./handlers";
import { findNode } from "./utils";

export class Task {
  type: "short-answer" | "multiple-choice" | "animation-player" | "definitions" | "unknown";
  name: string;
  isRunning: boolean;
  isComplete: boolean;
  root: Element;
  isFailed = false;

  constructor(type: Task["type"], name: string, root: Element) {
    this.type = type;
    this.name = name;
    this.isRunning = true;
    this.isComplete = false;
    this.root = root;
  }

  completeTask(success: boolean): void {
    this.isRunning = false;
    this.isComplete = success;
    this.isFailed = !success;
  }

  static getTaskType(activity: Element): Task["type"] {
    if (activity.classList.contains("short-answer-content-resource")) return "short-answer";
    if (activity.classList.contains("multiple-choice-content-resource")) return "multiple-choice";
    if (activity.classList.contains("animation-player-content-resource")) return "animation-player";
    if (activity.classList.contains("custom-content-resource")) {
      if (!!findNode(activity.childNodes, (node) => node.classList.contains("definition-match-payload"))) return "definitions";
    }
    return "unknown";
  }
}

(async () => {
  const runningTasks: Task[] = [];

  const onMessageListener = (message: any, _: any, sendResponse: (response?: any) => void) => {
    if (message.type === "clearTasks") {
      chrome.runtime.onMessage.removeListener(onMessageListener);
      return void (runningTasks.length = 0);
    }
    if (message.type === "getTasks") sendResponse(runningTasks);
    return true;
  };
  chrome.runtime.onMessage.addListener(onMessageListener);

  const activities = Array.from(document.querySelectorAll(".participation")).filter((activity) => activity.classList.contains("interactive-activity-container"));
  for (const activity of activities) {
    const activityName = findNode<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("activity-title"))?.innerText;
    if (!activityName) continue;

    const taskType = Task.getTaskType(activity);
    if (taskType === "unknown") continue;

    const task = new Task(taskType, activityName, activity);
    runningTasks.push(task);
  }

  for (const task of runningTasks) {
    if (task.type === "animation-player") handleAnimationPlayer(task.root, task);
    else if (task.type === "short-answer") task.completeTask(await handleShortAnswer(task.root));
    else if (task.type === "multiple-choice") task.completeTask(await handleMultipleChoice(task.root));
    else if (task.type === "definitions") task.completeTask(await handleDefinitions(task.root));
  }
})();
