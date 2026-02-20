import { handleShortAnswer } from "./handlers";

const activities = document.querySelectorAll(".participation");

activities.forEach((activity) => {
  if (!activity.classList.contains("interactive-activity-container")) return;

  if (activity.classList.contains("short-answer-content-resource")) return handleShortAnswer(activity);
});
