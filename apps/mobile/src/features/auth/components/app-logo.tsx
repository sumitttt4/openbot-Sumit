import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Path, Polyline, Rect } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { type AppLogoAnimation, useAppLogoMotion } from "@/features/auth/components/use-app-logo-motion";
import { useText } from "@/shared/lib/text";

export interface AppLogoProps {
  animation?: AppLogoAnimation;
  interactive?: boolean;
  size?: number;
}

const VIEWBOX_SIZE = 240;
// The cat face of the desktop logo (packages/brand/src/app-logo-shape.ts).
const LEFT_EYE_CENTER_X = 96;
const RIGHT_EYE_CENTER_X = 144;
const EYE_CENTER_Y = 126;
const LEFT_EYE_POINTS = "96 116 96 136";
const RIGHT_EYE_POINTS = "144 116 144 136";
const HEAD_PATH =
  "M50 118 C49 96 52 70 58 48 C60 41 66 39 72 43 L100 64 C113 60 127 60 140 64 L168 43 C174 39 180 41 182 48 C188 70 191 96 190 118 C190 160 159 190 120 190 C81 190 50 160 50 118 Z";
const NOSE_PATH = "M113 152 L127 152 L120 160 Z";

function resolveColor(value: string | number | undefined, fallback: string): string {
  return String(value ?? fallback);
}

export function AppLogo({ animation = "none", interactive = false, size = VIEWBOX_SIZE }: AppLogoProps) {
  const { t } = useText();
  const backgroundColor = resolveColor(useCSSVariable("--openbot-logo-production"), "#2445e6");
  // The eyes and nose take the colour of the square, on the white face.
  const eyeColor = backgroundColor;
  const faceColor = "#ffffff";
  const { handlePressIn, leftEyeAnimatedStyle, rightEyeAnimatedStyle } = useAppLogoMotion({ animation, size });
  const eyeLayerStyle = {
    height: size,
    left: 0,
    position: "absolute" as const,
    top: 0,
    width: size,
  };

  const logo = (
    <View
      style={{ height: size, width: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
        <Rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} rx={50} ry={50} fill={backgroundColor} />
        <Path d={HEAD_PATH} fill={faceColor} />
        <Path d={NOSE_PATH} fill={eyeColor} stroke={eyeColor} strokeWidth={5} strokeLinejoin="round" />
      </Svg>

      <Animated.View
        pointerEvents="none"
        style={[
          eyeLayerStyle,
          { transformOrigin: [(LEFT_EYE_CENTER_X * size) / VIEWBOX_SIZE, (EYE_CENTER_Y * size) / VIEWBOX_SIZE, 0] },
          leftEyeAnimatedStyle,
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
          <Polyline
            points={LEFT_EYE_POINTS}
            fill="none"
            stroke={eyeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={13}
          />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          eyeLayerStyle,
          { transformOrigin: [(RIGHT_EYE_CENTER_X * size) / VIEWBOX_SIZE, (EYE_CENTER_Y * size) / VIEWBOX_SIZE, 0] },
          rightEyeAnimatedStyle,
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
          <Polyline
            points={RIGHT_EYE_POINTS}
            fill="none"
            stroke={eyeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={13}
          />
        </Svg>
      </Animated.View>
    </View>
  );

  if (!interactive) return logo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("mobile.auth.logo.animate")}
      accessibilityHint={t("mobile.auth.logo.animateHint")}
      onPressIn={handlePressIn}
      pressRetentionOffset={12}
    >
      {logo}
    </Pressable>
  );
}
