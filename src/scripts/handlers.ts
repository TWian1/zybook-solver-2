import { findAllNodes, findNode, delay, simulateTyping } from "./utils";

export function handleShortAnswer(activity: Element): void {
  const questions = findAllNodes<HTMLDivElement>(activity.childNodes, (node) => node.classList.contains("question-set-question"));
  questions.forEach(async (question) => {
    const completed = findNode<HTMLDivElement>(question.childNodes, (node) => node.classList.contains("question-chevron") && node.classList.contains("filled"));
    if (completed) return;

    const input = findNode<HTMLInputElement>(question.childNodes, (node) => node.tagName === "INPUT");
    const showAnswerButton = findNode<HTMLButtonElement>(question.childNodes, (node) => node.tagName === "BUTTON" && !!findNode(node.childNodes, (child) => child.textContent === "Show answer"));
    const checkButton = findNode<HTMLButtonElement>(question.childNodes, (node) => node.tagName === "BUTTON" && !!findNode(node.childNodes, (child) => child.textContent === "Check"));
    if (!input || !showAnswerButton || !checkButton) return;

    showAnswerButton.click();
    await delay(100);
    showAnswerButton.click();
    await delay(100);
    const explanation = findNode<HTMLDivElement>(question.childNodes, (node) => node.classList.contains("has-explanation"));
    if (!explanation) return;

    const answerNode = findNode<HTMLDivElement>(explanation.childNodes, (node) => node.classList.contains("answers"));
    if (!answerNode) return;
    const answer = findNode(answerNode.childNodes, (node) => node.tagName === "SPAN" && node.classList.contains("forfeit-answer"));
    if (!answer) return;

    simulateTyping(input, answer.textContent!);
    await delay(100);
    checkButton.click();
    await delay(1000);
  });
}
