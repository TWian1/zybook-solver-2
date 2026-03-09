import { findAllNodes, findNode, delay, simulateTyping } from "./utils";
import { Task } from ".";

export async function handleShortAnswer(activity: Element): Promise<true> {
  const questions = findAllNodes<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("question-set-question"));

  for (const question of questions) {
    const completed = findNode<HTMLDivElement>(question.childNodes, (node) => node.classList.contains("question-chevron") && node.classList.contains("filled"));
    if (completed) continue;

    const input = findNode<HTMLInputElement>(question.childNodes, (node) => node.tagName === "INPUT");
    const showAnswerButton = findNode<HTMLButtonElement>(question.childNodes, (node) => node.tagName === "BUTTON" && !!findNode(node.childNodes, (child) => child.textContent === "Show answer"));
    const checkButton = findNode<HTMLButtonElement>(question.childNodes, (node) => node.tagName === "BUTTON" && !!findNode(node.childNodes, (child) => child.textContent === "Check"));
    if (!input || !showAnswerButton || !checkButton) continue;

    await delay(100, () => showAnswerButton.click());
    await delay(100, () => showAnswerButton.click());
    const explanation = findNode<HTMLDivElement>(question.childNodes, (node) => node.classList.contains("has-explanation"));
    if (!explanation) continue;

    const answerNode = findNode<HTMLDivElement>(explanation.childNodes, (node) => node.classList.contains("answers"));
    if (!answerNode) continue;
    const answer = findNode(answerNode.childNodes, (node) => node.tagName === "SPAN" && node.classList.contains("forfeit-answer"));
    if (!answer) continue;

    await delay(100, () => simulateTyping(input, answer.textContent!));
    await delay(500, () => checkButton.click());
  }

  return true;
}

export async function handleMultipleChoice(activity: Element): Promise<true> {
  const questions = findAllNodes<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("question-set-question"));

  for (const question of questions) {
    const chevron = findNode<HTMLDivElement>(question.childNodes, (node) => node.classList.contains("question-chevron"));
    const isCompleted = () => chevron?.classList.contains("filled") || chevron?.classList.contains("zb-progress-circular");
    if (isCompleted()) continue;

    const choiceContainer = findNode<HTMLDivElement>(question.childNodes, (node) => node.classList.contains("question-choices"));
    if (!choiceContainer) continue;
    const choices = findAllNodes<HTMLInputElement>(choiceContainer.childNodes, (node) => node.tagName === "INPUT");
    if (!choices.length) continue;

    for (const choice of choices) {
      await delay(500, () => choice.click());
      if (isCompleted()) break;
    }
  }

  return true;
}

export async function handleAnimationPlayer(activity: Element, task: Task): Promise<void> {
  const chevronContainer = findNode<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("title-bar-chevron-container"));
  if (!chevronContainer) return task.completeTask(false);
  const isCompleted = () => {
    const indicator = findNode<HTMLDivElement>(chevronContainer.childNodes, (node) => node.tagName === "DIV");
    return indicator?.classList.contains("filled") || indicator?.classList.contains("zb-progress-circular");
  };
  if (isCompleted()) return task.completeTask(true);

  const animationControls = findNode<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("animation-controls"));
  if (!animationControls) return task.completeTask(false);
  const speedInput = findNode<HTMLInputElement>(animationControls.childNodes, (node) => node.tagName === "INPUT");
  if (!speedInput) return task.completeTask(false);
  await delay(100, () => speedInput.click());

  const startButton = findNode<HTMLButtonElement>(animationControls.childNodes, (node) => node.tagName === "BUTTON" && !!findNode(node.childNodes, (child) => child.textContent === "Start"));
  if (!startButton) return task.completeTask(false);
  await delay(100, () => startButton.click());

  const playButton = findNode<HTMLButtonElement>(activity.childNodes, (node) => (node.tagName === "BUTTON" && node.ariaLabel === "Play") || node.ariaLabel === "Pause");
  if (!playButton) return task.completeTask(false);
  const playIcon = findNode<HTMLDivElement>(playButton.childNodes, (node) => node.tagName === "DIV");
  const isPlayable = () => playIcon?.classList.contains("play-button");
  const interval = setInterval(() => {
    if (isCompleted()) {
      task.completeTask(true);
      return clearInterval(interval);
    }
    if (isPlayable()) playButton.click();
  }, 100);
}

export async function handleDefinitions(activity: Element): Promise<boolean> {
  const chevron = findNode<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("title-bar-chevron"));
  const isCompleted = () => chevron?.classList.contains("filled") || chevron?.classList.contains("zb-progress-circular");
  if (isCompleted()) return true;

  const rowAnswers = findAllNodes<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("definition-match-explanation"));
  const hasIncorrectRows = () => rowAnswers.some((row) => row.classList.contains("incorrect"));

  while (!isCompleted()) {
    const termBank = findNode<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("term-bank"));
    if (!termBank) return false;
    const terms = findAllNodes<HTMLDivElement>(termBank.childNodes, (node) => node.classList.contains("definition-match-term"));
    if (!terms.length) return false;
    const termIds = terms.map((term) => term.attributes.getNamedItem("data-id")?.value);
    if (!termIds.every((id): id is string => !!id)) return false;

    const select = () => new KeyboardEvent("keydown", { key: " ", bubbles: true });
    const down = () => new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true });
    for (const id of termIds) {
      let term = document.querySelector<HTMLDivElement>(`div[data-id=${id}]`);
      if (!term) continue;

      const doneRows = rowAnswers.map((row) => row.classList.contains("correct"));
      let currentRow = -1;

      do {
        term = document.querySelector<HTMLDivElement>(`div[data-id=${id}]`);
        await delay(100, () => term!.dispatchEvent(select()));
        do {
          await delay(100, () => term!.dispatchEvent(down()));
          currentRow++;
        } while (doneRows[currentRow]);
        await delay(100, () => term!.dispatchEvent(select()));
      } while (hasIncorrectRows());
    }
  }

  return true;
}
