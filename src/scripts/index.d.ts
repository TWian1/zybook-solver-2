interface Task {
  type: "short-answer" | "multiple-choice" | "animation-player" | "code-writing" | "unknown";
  name: string;
  isRunning: boolean;
  isComplete: boolean;
  root: Element;
  isFailed: boolean;

  constructor(type: Task["type"], name: string, root: Element);
  completeTask(success: boolean): void;
  static getTaskType(activity: Element): Task["type"];
}
