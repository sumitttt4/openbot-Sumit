/**
 * The Talk screen made an agent from the user's words and opened its chat. The chat takes this once,
 * starts the voice conversation, and reads the answer to those words aloud before it listens again.
 */
interface TalkHandoff {
  agentId: string;
  text: string;
}

let handoff: TalkHandoff | null = null;

export function handOffTalk(next: TalkHandoff): void {
  handoff = next;
}

/** The words for this agent's chat, once. */
export function takeTalkHandoff(agentId: string): string | null {
  if (handoff?.agentId !== agentId) return null;
  const { text } = handoff;
  handoff = null;
  return text;
}

/** Whether a handoff waits for this agent, without taking it. */
export function talkHandoffWaits(agentId: string): boolean {
  return handoff?.agentId === agentId;
}
