import { bloubAvatarProfile } from "@openbot/brand/bloub-avatar";
import { type AvatarMood, avatarMoodPresentation } from "@openbot/brand/bloub-avatar-motion";
import { mascotNodes } from "@openbot/brand/mascot-avatar";
import type { AvatarColor, AvatarHue } from "@openbot/contracts/ipc";
import { memo, useMemo } from "react";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

/**
 * The cat or panda mascot of an agent, from the same shape data as the desktop
 * (`@openbot/brand/mascot-avatar`). A mood with its own face shows that face; a disconnected agent
 * is faded.
 */
export const MascotAvatar = memo(function MascotAvatar({
  seed,
  hue,
  color,
  size,
  mood = "idle",
  disconnected = false,
}: {
  seed: string;
  hue: AvatarHue | null;
  color: AvatarColor | null;
  size: number;
  mood?: AvatarMood;
  disconnected?: boolean;
}) {
  const nodes = useMemo(() => {
    const profile = bloubAvatarProfile(seed, hue, color);
    const expression = avatarMoodPresentation(mood).expression ?? profile.expression;
    return mascotNodes({ shape: profile.shape, expression, color: profile.color });
  }, [seed, hue, color, mood]);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={disconnected ? 0.5 : 1}>
      {nodes.map(([tag, attributes], index) => {
        const key = `${tag}-${index}`;
        if (tag === "circle") return <Circle key={key} {...attributes} />;
        if (tag === "ellipse") return <Ellipse key={key} {...attributes} />;
        if (tag === "rect") return <Rect key={key} {...attributes} />;
        return <Path key={key} {...attributes} />;
      })}
    </Svg>
  );
});
