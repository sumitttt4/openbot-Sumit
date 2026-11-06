import { createSignal } from "solid-js";

/**
 * The Talk button of the rail asks the open agent chat for its voice conversation. The request waits
 * until a chat takes it, so a chat that opens after the click, when the rail switched to the agents
 * page, still starts the conversation. In live voice, a request for new work makes its own agent.
 */
const [pending, setPending] = createSignal(false);

export const talkRequested = pending;

export function requestTalk(): void {
  setPending(true);
}

export function takeTalkRequest(): boolean {
  if (!pending()) return false;
  setPending(false);
  return true;
}
