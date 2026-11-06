// The app mark (a cat face in a rounded square) as plain data, so that a canvas can draw the same mark that
// `AppLogo` draws as SVG: the social cards in apps/auth-api do.

/** The mark is a square of this side, in its own units. */
export const APP_LOGO_SIZE = 240;
/** The corner radius of the square, in the same units. */
export const APP_LOGO_CORNER = 50;

/** The cat head with its two ears, as an SVG path, in the same units. */
export const APP_LOGO_HEAD_PATH =
  "M50 118 C49 96 52 70 58 48 C60 41 66 39 72 43 L100 64 C113 60 127 60 140 64 L168 43 C174 39 180 41 182 48 C188 70 191 96 190 118 C190 160 159 190 120 190 C81 190 50 160 50 118 Z";

/** The nose, a small rounded triangle. */
export const APP_LOGO_NOSE_PATH = "M113 152 L127 152 L120 160 Z";

/** Each eye is one short upright stroke, as SVG `points`. */
export const APP_LOGO_EYE_POINTS = {
  left: "96 116 96 136",
  right: "144 116 144 136",
} as const;
