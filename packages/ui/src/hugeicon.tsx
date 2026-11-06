import { Dynamic, type JSX } from "@solidjs/web";
import { For, omit, Show } from "solid-js";

/**
 * Hugeicons (the free stroke-rounded set, MIT) drawn with the props of a Lucide icon, so every
 * caller, size rule and `stroke-width` rule that was written for Lucide keeps working.
 *
 * The icon data is a list of `[tag, attributes]` pairs with React-style camelCase names. The
 * attributes become SVG attributes here. The per-path `stroke` and `strokeWidth` are dropped, so
 * the paths take the colour and the line width of the `<svg>`, where CSS and the props set them.
 *
 * The `<svg>` keeps the classes a Lucide icon has, `lucide` and `lucide-<name>` with the Lucide
 * name, because feature stylesheets select icons by them (for example, to mirror an arrow in a
 * right-to-left language).
 */
export type HugeiconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

export interface IconProps extends Partial<JSX.SvgSVGAttributes<SVGSVGElement>> {
  class?: string;
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  absoluteStrokeWidth?: boolean;
}

export type Icon = (props: IconProps) => JSX.Element;

/**
 * The movements of the Glaze animated icons (styles/animated-icons.css). An icon plays its movement
 * when the button, link or menu item around it is hovered or focused, and once when that control
 * becomes the open page or the selected item.
 */
export type IconMotion =
  | "swing"
  | "beat"
  | "pop"
  | "scan"
  | "spin"
  | "spin-once"
  | "fly"
  | "drop"
  | "rise"
  | "lift"
  | "twinkle"
  | "twinkle-late"
  | "blink"
  | "nudge"
  | "nudge-back"
  | "wave"
  | "wave-late"
  | "shackle"
  | "quarter"
  | "wiggle"
  | "float"
  | "shake"
  | "launch"
  | "tilt"
  | "flash"
  | "grow";

/** `whole` moves the whole drawing; `parts` moves single elements by their index in the icon data. */
export interface IconMotionConfig {
  whole?: IconMotion;
  parts?: Partial<Record<number, IconMotion>>;
  /** A delay in milliseconds for a part, so that parts move one after another. */
  delays?: Partial<Record<number, number>>;
}

/** Hugeicons are drawn for a 1.5 line on a 24 grid; Lucide's 2 makes them heavy. */
const DEFAULT_STROKE_WIDTH = 1.5;
const DEFAULT_SIZE = 24;

const DROPPED_PATH_ATTRIBUTES = new Set(["key", "stroke", "strokeWidth"]);

function svgAttributeName(name: string): string {
  return name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function pathAttributes(attributes: Readonly<Record<string, string | number>>): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (DROPPED_PATH_ATTRIBUTES.has(name)) continue;
    result[svgAttributeName(name)] = value;
  }
  return result;
}

function hasAccessibleName(props: IconProps): boolean {
  for (const name of Object.keys(props)) {
    if (name.startsWith("aria-") || name === "role" || name === "title") return true;
  }
  return false;
}

export function hugeicon(lucideName: string, node: HugeiconNode, motion?: IconMotionConfig): Icon {
  const paths = node.map(([tag, attributes], index) => {
    const part = motion?.parts?.[index];
    const delay = motion?.delays?.[index];
    const props: Record<string, string | number> = pathAttributes(attributes);
    if (part) props["data-icon-motion"] = part;
    if (delay) props.style = `animation-delay: ${delay}ms`;
    return [tag, props] as const;
  });
  return (props) => {
    const rest = omit(props, "size", "color", "strokeWidth", "absoluteStrokeWidth", "class", "children");
    const size = () => props.size ?? DEFAULT_SIZE;
    const strokeWidth = () => {
      const width = Number(props.strokeWidth ?? DEFAULT_STROKE_WIDTH);
      return props.absoluteStrokeWidth === true ? (width * DEFAULT_SIZE) / Number(size()) : width;
    };
    const attributes = () => ({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      "stroke-linecap": "round" as const,
      "stroke-linejoin": "round" as const,
      width: size(),
      height: size(),
      stroke: props.color ?? "currentColor",
      "stroke-width": strokeWidth(),
      class: ["lucide", "lucide-icon", `lucide-${lucideName}`, "hugeicon", props.class].filter(Boolean).join(" "),
      "data-animated-icon": motion ? "" : undefined,
    });
    const parts = () => <For each={paths}>{([tag, pathProps]) => <Dynamic component={tag} {...pathProps} />}</For>;
    const drawing = () => (motion?.whole ? <g data-icon-motion={motion.whole}>{parts()}</g> : parts());
    // A decorative icon is hidden from screen readers. One with a name, as Lucide does, is not.
    return (
      <Show
        when={hasAccessibleName(props)}
        fallback={
          <svg {...attributes()} {...rest} aria-hidden="true">
            {drawing()}
          </svg>
        }
      >
        <svg {...attributes()} {...rest} role="img" aria-label={props["aria-label"]}>
          {drawing()}
        </svg>
      </Show>
    );
  };
}
