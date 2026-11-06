/** Words that start a spoken request but say nothing about the work. */
const LEADING_FILLER =
  /^(?:(?:hey|hi|ok|okay)\s+sumit[,\s]*)?(?:(?:can|could|would|will)\s+you\s+|please\s+|i\s+(?:want|need|would\s+like)\s+(?:you\s+)?to\s+|i\s+want\s+|i\s+need\s+|help\s+me\s+(?:to\s+)?|let'?s\s+)*/i;

const NAME_WORDS = 4;
const NAME_LENGTH = 40;

/**
 * A short name for the agent of a spoken task: its first words without the polite start, in Title
 * Case. "Can you plan a weekend trip to Goa" becomes "Plan A Weekend Trip".
 */
export function talkAgentName(task: string): string {
  const words = task
    .trim()
    .replace(LEADING_FILLER, "")
    .replace(/[.,!?;:]+$/u, "")
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, NAME_WORDS)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  const name = words.join(" ").slice(0, NAME_LENGTH).trim();
  return name || "New Task";
}
