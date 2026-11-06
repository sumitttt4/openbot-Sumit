import type { ExpressionId, ShapeId } from "@norbert_bodziony/bloub";
import { mascotNodes } from "@openbot/brand/mascot-avatar";
import { Dynamic } from "@solidjs/web";
import { createMemo, For } from "solid-js";

/** SVG attribute names from the camelCase names of the mascot data. */
function svgAttributes(attributes: Readonly<Record<string, string | number>>): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(attributes)) {
    result[name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)] = value;
  }
  return result;
}

/** A cat or panda mascot for an avatar profile (`@openbot/brand/mascot-avatar`). */
export function MascotSvg(props: { shape: ShapeId; expression: ExpressionId; color: string; class?: string }) {
  const nodes = createMemo(() =>
    mascotNodes({ shape: props.shape, expression: props.expression, color: props.color }).map(
      ([tag, attributes]) => [tag, svgAttributes(attributes)] as const,
    ),
  );
  return (
    <svg
      viewBox="0 0 100 100"
      width="100"
      height="100"
      class={["mascot-avatar-svg", props.class].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <For each={nodes()}>{([tag, attributes]) => <Dynamic component={tag} {...attributes} />}</For>
    </svg>
  );
}
