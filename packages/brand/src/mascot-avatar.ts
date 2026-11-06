// The agent mascots: flat, round cats and pandas in the manner of Duolingo characters. They are
// plain shape data on a 100 by 100 grid, so the desktop (SolidJS SVG) and the mobile app
// (react-native-svg) draw the same picture from one source.
//
// A mascot comes from the avatar profile that every app already saves and edits: the Bloub shape
// chooses the animal and its markings, the expression chooses the face, and the colour is the cat's
// fur, or the panda's backdrop and accessories. No new saved field exists, and an app that does not
// know mascots draws the same profile as a Bloub.

import type { ExpressionId, ShapeId } from "@norbert_bodziony/bloub";

export type MascotTag = "path" | "circle" | "ellipse" | "rect";

/** One element: an SVG tag and its attributes, with camelCase names as react-native-svg takes them. */
export type MascotNode = readonly [MascotTag, Readonly<Record<string, string | number>>];

export type MascotAnimal = "cat" | "panda";

type CatMarking = "plain" | "tabby" | "siamese" | "chubby" | "tuxedo" | "calico";
type PandaMarking = "plain" | "bamboo" | "bow" | "beanie";

type MascotKind = { animal: "cat"; marking: CatMarking } | { animal: "panda"; marking: PandaMarking };

const KIND_BY_SHAPE: Readonly<Record<ShapeId, MascotKind>> = {
  cercle: { animal: "cat", marking: "plain" },
  galet: { animal: "panda", marking: "plain" },
  squircle: { animal: "cat", marking: "tabby" },
  capsule: { animal: "panda", marking: "bamboo" },
  triangle: { animal: "cat", marking: "siamese" },
  hexagone: { animal: "panda", marking: "bow" },
  nuage: { animal: "cat", marking: "chubby" },
  goutte: { animal: "cat", marking: "plain" },
  carre: { animal: "cat", marking: "tuxedo" },
  losange: { animal: "panda", marking: "beanie" },
  pentagone: { animal: "cat", marking: "calico" },
};

type Face = "neutral" | "curious" | "surprised" | "excited" | "happy" | "angry" | "sad" | "sleepy";

const FACE_BY_EXPRESSION: Readonly<Record<ExpressionId, Face>> = {
  neutre: "neutral",
  attentif: "curious",
  surpris: "surprised",
  excite: "excited",
  heureux: "happy",
  hilare: "excited",
  colere: "angry",
  triste: "sad",
  effraye: "surprised",
  mefiant: "neutral",
  confus: "curious",
  curieux: "curious",
  fier: "happy",
  timide: "sad",
  blase: "neutral",
  somnolent: "sleepy",
};

const INK = "#1d1d1f";
const WHITE = "#ffffff";
const PINK = "#ff8fab";
const EAR_PINK = "#ffc2d1";
const LEAF = "#58cc02";
const LEAF_DARK = "#3f9a00";
const CALICO_ORANGE = "#ff9f43";

export function mascotAnimal(shape: ShapeId): MascotAnimal {
  return KIND_BY_SHAPE[shape].animal;
}

/** The elements of the mascot for an avatar profile, back to front. */
export function mascotNodes(profile: { shape: ShapeId; expression: ExpressionId; color: string }): MascotNode[] {
  const kind = KIND_BY_SHAPE[profile.shape];
  const face = FACE_BY_EXPRESSION[profile.expression];
  return kind.animal === "cat"
    ? catNodes(kind.marking, face, profile.color)
    : pandaNodes(kind.marking, face, profile.color);
}

function catNodes(marking: CatMarking, face: Face, fur: string): MascotNode[] {
  const shade = mix(fur, INK, 0.22);
  const light = mix(fur, WHITE, 0.72);
  const ears = marking === "siamese" ? mix(fur, INK, 0.55) : fur;
  const headRx = marking === "chubby" ? 40 : 36;
  const nodes: MascotNode[] = [
    // Ears, then their pink insides.
    [
      "path",
      {
        d: "M18 46 C15 30 17 16 22 9 C25 6 29 7 32 10 L45 24 Z",
        fill: ears,
        stroke: ears,
        strokeWidth: 4,
        strokeLinejoin: "round",
      },
    ],
    [
      "path",
      {
        d: "M82 46 C85 30 83 16 78 9 C75 6 71 7 68 10 L55 24 Z",
        fill: ears,
        stroke: ears,
        strokeWidth: 4,
        strokeLinejoin: "round",
      },
    ],
    ["path", { d: "M23 34 C22 26 23 19 26 15 L36 25 Z", fill: EAR_PINK }],
    ["path", { d: "M77 34 C78 26 77 19 74 15 L64 25 Z", fill: EAR_PINK }],
    // The head, with a darker lower half for the Duolingo two-tone look.
    ["ellipse", { cx: 50, cy: 57, rx: headRx, ry: 33, fill: shade }],
    ["ellipse", { cx: 50, cy: 54, rx: headRx, ry: 30, fill: fur }],
  ];
  if (marking === "tabby") {
    for (const d of ["M42 26 L44 35", "M50 24 L50 34", "M58 26 L56 35"]) {
      nodes.push(["path", { d, stroke: shade, strokeWidth: 4, strokeLinecap: "round", fill: "none" }]);
    }
  }
  if (marking === "calico") {
    nodes.push(["path", { d: "M18 46 C16 36 17 26 22 18 L34 30 C30 36 26 42 22 50 Z", fill: CALICO_ORANGE }]);
    nodes.push(["ellipse", { cx: 66, cy: 36, rx: 9, ry: 7, fill: INK, opacity: 0.85 }]);
  }
  if (marking === "tuxedo") {
    // A white lower face and chin, as a tuxedo cat has.
    nodes.push([
      "path",
      { d: "M26 66 C30 58 40 56 50 60 C60 56 70 58 74 66 C70 80 60 86 50 86 C40 86 30 80 26 66 Z", fill: WHITE },
    ]);
  }
  if (marking === "siamese") {
    nodes.push(["ellipse", { cx: 50, cy: 66, rx: 20, ry: 15, fill: mix(fur, INK, 0.45) }]);
  }
  // The muzzle, cheeks and nose.
  nodes.push([
    "ellipse",
    { cx: 50, cy: 68, rx: 15, ry: 10, fill: marking === "siamese" ? mix(light, INK, 0.25) : light },
  ]);
  if (marking === "chubby") {
    nodes.push(["ellipse", { cx: 24, cy: 64, rx: 7, ry: 4.5, fill: PINK, opacity: 0.55 }]);
    nodes.push(["ellipse", { cx: 76, cy: 64, rx: 7, ry: 4.5, fill: PINK, opacity: 0.55 }]);
  }
  nodes.push([
    "path",
    { d: "M46 62 L54 62 L50 66.5 Z", fill: PINK, stroke: PINK, strokeWidth: 2.5, strokeLinejoin: "round" },
  ]);
  nodes.push(...mouth(face, 50, 67, INK));
  nodes.push(...eyes(face, 36, 52, 64, 52, INK, WHITE));
  return nodes;
}

function pandaNodes(marking: PandaMarking, face: Face, accent: string): MascotNode[] {
  const backdrop = mix(accent, WHITE, 0.15);
  const nodes: MascotNode[] = [
    // A disc of the agent colour behind the head, so a panda still shows the agent's colour.
    ["circle", { cx: 50, cy: 52, r: 47, fill: backdrop }],
    ["circle", { cx: 24, cy: 26, r: 12, fill: INK }],
    ["circle", { cx: 76, cy: 26, r: 12, fill: INK }],
    ["ellipse", { cx: 50, cy: 58, rx: 36, ry: 31, fill: "#e8e8ec" }],
    ["ellipse", { cx: 50, cy: 55, rx: 36, ry: 29, fill: WHITE }],
    // The eye patches, tilted down and out.
    ["ellipse", { cx: 36, cy: 53, rx: 9, ry: 11, fill: INK, transform: "rotate(28 36 53)" }],
    ["ellipse", { cx: 64, cy: 53, rx: 9, ry: 11, fill: INK, transform: "rotate(-28 64 53)" }],
    ["ellipse", { cx: 26, cy: 65, rx: 6, ry: 3.5, fill: PINK, opacity: 0.5 }],
    ["ellipse", { cx: 74, cy: 65, rx: 6, ry: 3.5, fill: PINK, opacity: 0.5 }],
    ["ellipse", { cx: 50, cy: 66, rx: 5, ry: 3.5, fill: INK }],
  ];
  if (marking === "bamboo") {
    nodes.push(["path", { d: "M70 18 C78 10 88 10 94 14 C88 20 78 22 70 18 Z", fill: LEAF }]);
    nodes.push(["path", { d: "M70 18 C80 15 87 14 94 14", stroke: LEAF_DARK, strokeWidth: 1.5, fill: "none" }]);
  }
  if (marking === "bow") {
    nodes.push([
      "path",
      { d: "M72 24 L62 16 L62 32 Z", fill: accent, stroke: accent, strokeWidth: 3, strokeLinejoin: "round" },
    ]);
    nodes.push([
      "path",
      { d: "M72 24 L82 16 L82 32 Z", fill: accent, stroke: accent, strokeWidth: 3, strokeLinejoin: "round" },
    ]);
    nodes.push(["circle", { cx: 72, cy: 24, r: 4, fill: mix(accent, INK, 0.25) }]);
  }
  if (marking === "beanie") {
    nodes.push(["path", { d: "M18 38 C20 16 80 16 82 38 Z", fill: accent }]);
    nodes.push(["rect", { x: 16, y: 34, width: 68, height: 9, rx: 4.5, fill: mix(accent, INK, 0.25) }]);
    nodes.push(["circle", { cx: 50, cy: 15, r: 6, fill: mix(accent, WHITE, 0.4) }]);
  }
  nodes.push(...mouth(face, 50, 70, INK));
  nodes.push(...eyes(face, 36, 54, 64, 54, WHITE, INK));
  return nodes;
}

/** The eyes of a face. `iris` is the eye; `glint` is the small highlight or pupil in it. */
function eyes(face: Face, lx: number, ly: number, rx: number, ry: number, iris: string, glint: string): MascotNode[] {
  const both = (draw: (x: number, y: number, side: 1 | -1) => MascotNode[]) => [
    ...draw(lx, ly, -1),
    ...draw(rx, ry, 1),
  ];
  const arc = (d: string): MascotNode => [
    "path",
    { d, stroke: iris, strokeWidth: 4.5, strokeLinecap: "round", fill: "none" },
  ];
  switch (face) {
    case "happy":
      return both((x, y) => [arc(`M${x - 6} ${y + 2} Q${x} ${y - 6} ${x + 6} ${y + 2}`)]);
    case "sleepy":
      return both((x, y) => [arc(`M${x - 6} ${y} Q${x} ${y + 5} ${x + 6} ${y}`)]);
    case "angry":
      return both((x, y, side) => [
        ["circle", { cx: x, cy: y + 1, r: 5, fill: iris }],
        ["circle", { cx: x + 1.5, cy: y - 0.5, r: 1.6, fill: glint }],
        // The brows slope down toward the nose.
        arc(`M${x + 6 * side} ${y - 10} L${x - 5 * side} ${y - 6}`),
      ]);
    case "sad":
      return both((x, y, side) => [
        ["circle", { cx: x, cy: y + 1, r: 5, fill: iris }],
        ["circle", { cx: x + 1.5, cy: y - 0.5, r: 1.6, fill: glint }],
        // The brows slope up toward the nose.
        arc(`M${x + 6 * side} ${y - 6} L${x - 5 * side} ${y - 10}`),
      ]);
    case "surprised":
      return both((x, y) => [
        ["circle", { cx: x, cy: y, r: 7, fill: iris }],
        ["circle", { cx: x + 2.2, cy: y - 2.2, r: 2.4, fill: glint }],
      ]);
    case "excited":
      return both((x, y) => [
        ["path", { d: starPath(x, y, 7), fill: iris, stroke: iris, strokeWidth: 1.5, strokeLinejoin: "round" }],
      ]);
    case "curious":
      return both((x, y, side) => [
        ["circle", { cx: x, cy: y, r: side === 1 ? 6.5 : 5.5, fill: iris }],
        ["circle", { cx: x + 2, cy: y - 2, r: 2, fill: glint }],
      ]);
    default:
      return both((x, y) => [
        ["ellipse", { cx: x, cy: y, rx: 5, ry: 6.5, fill: iris }],
        ["circle", { cx: x + 1.8, cy: y - 2.4, r: 2, fill: glint }],
      ]);
  }
}

function mouth(face: Face, x: number, y: number, ink: string): MascotNode[] {
  const stroke = {
    stroke: ink,
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  switch (face) {
    case "excited":
    case "happy":
      return [["path", { d: `M${x - 6} ${y + 1} Q${x} ${y + 9} ${x + 6} ${y + 1} Z`, fill: ink }]];
    case "surprised":
      return [["ellipse", { cx: x, cy: y + 4, rx: 3, ry: 3.5, fill: ink }]];
    case "sad":
    case "angry":
      return [["path", { d: `M${x - 5} ${y + 6} Q${x} ${y + 1} ${x + 5} ${y + 6}`, ...stroke }]];
    case "sleepy":
      return [["path", { d: `M${x - 3} ${y + 3} L${x + 3} ${y + 3}`, ...stroke }]];
    default:
      return [
        [
          "path",
          { d: `M${x - 6} ${y + 2} Q${x - 3} ${y + 5} ${x} ${y + 2} Q${x + 3} ${y + 5} ${x + 6} ${y + 2}`, ...stroke },
        ],
      ];
  }
}

function starPath(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join(" L")} Z`;
}

/** `a` moved toward `b` by `amount` (0 to 1), as a #rrggbb colour. */
function mix(a: string, b: string, amount: number): string {
  const parse = (hex: string) => {
    const value = hex.replace("#", "");
    const full = value.length === 3 ? [...value].map((digit) => digit + digit).join("") : value.slice(0, 6);
    return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16));
  };
  const [ar = 0, ag = 0, ab = 0] = parse(a);
  const [br = 0, bg = 0, bb = 0] = parse(b);
  const channel = (from: number, to: number) =>
    Math.round(from + (to - from) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

/**
 * How generated agent faces are drawn: the cat and panda mascots, or the Bloub characters that
 * OpenBot draws. Change it here to go back to Bloub; the saved avatars are the same for both.
 */
export const AGENT_AVATAR_LOOK: "mascot" | "bloub" = "mascot";
