import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { Button, Typography } from "heroui-native";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useVoiceDictation } from "@/features/chat/components/use-voice-dictation";
import { talkAgentName } from "@/features/talk/model/talk-agent-name";
import { handOffTalk } from "@/features/talk/model/talk-handoff";
import { useVoiceSettings } from "@/features/voice/model/voice-settings";
import {
  useMobileWorkspaceReader,
  useMobileWorkspaceSelector,
} from "@/features/workspace/context/mobile-workspace-context";
import { showsOnline } from "@/features/workspace/model/server-status";
import { Mic, X } from "@/shared/icons";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

type TalkStep = "idle" | "listening" | "naming" | "creating" | "failed";

const ORB_SIZE = 168;
/** How long the server's AI has to name the agent before the first words name it. */
const NAMING_TIMEOUT_MS = 15_000;

/**
 * Talk: say a task, and a new agent named after it starts on it. The words go to a new agent as its
 * first message, its chat opens, and the voice conversation there reads the answer aloud and listens
 * for the next request, which goes to the same agent.
 */
export function TalkScreen() {
  const { t, errorMessage } = useText();
  const workspace = useMobileWorkspaceReader();
  const online = useMobileWorkspaceSelector((current) => showsOnline(current.activeServer));
  const [step, setStep] = useState<TalkStep>("idle");
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const heardRef = useRef("");
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dictation = useVoiceDictation({
    enabled: step === "listening" || step === "idle",
    onDraft: (text) => {
      heardRef.current = text;
      setHeard(text);
      // A pause after the first words ends the request.
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      if (text.trim()) pauseTimer.current = setTimeout(() => void finish(), useVoiceSettings.getState().turnPauseMs);
    },
  });

  function listen(): void {
    if (!online) {
      setError(t("mobile.chat.talk.noServer"));
      return;
    }
    setError(null);
    heardRef.current = "";
    setHeard("");
    if (dictation.start("")) {
      setStep("listening");
      void haptics.impact("light");
    } else setError(t("mobile.chat.talk.unavailable"));
  }

  async function finish(): Promise<void> {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = null;
    await dictation.finish();
    const task = heardRef.current.trim();
    if (!task) {
      setStep("idle");
      return;
    }
    // The server's AI names the agent and picks its look and description, as the new-agent form on
    // the computer does. A server without it, or a slow answer, falls back to the first words.
    setStep("naming");
    const profile = await withTimeout(workspace().generateAgentProfile(task), NAMING_TIMEOUT_MS).catch(() => null);
    const name = profile?.name.trim() || talkAgentName(task);
    setAgentName(name);
    setStep("creating");
    try {
      const agentId = await workspace().createAgent({
        name,
        description: profile?.description.trim() || task,
        initialMessage: task,
        avatarSeed: profile?.avatarSeed ?? `talk:${Crypto.randomUUID().replaceAll("-", "")}`,
        avatarHue: profile?.avatarHue ?? null,
      });
      void haptics.notification("success");
      handOffTalk({ agentId, text: task });
      router.replace({ pathname: "/chat/[agentId]", params: { agentId } });
    } catch (cause) {
      void haptics.notification("error");
      setStep("failed");
      setError(errorMessage(cause, t("mobile.chat.talk.failed")));
    }
  }

  // The screen opens listening, as a voice assistant does, and stops listening when it closes.
  const opened = useEffectEvent(() => listen());
  const closed = useEffectEvent(() => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    dictation.cancel();
  });
  useEffect(() => {
    opened();
    return () => closed();
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 + dictation.level.get() * 0.35, { damping: 14, stiffness: 160 }) }],
  }));

  const status =
    step === "listening"
      ? t("mobile.chat.talk.listening")
      : step === "naming"
        ? t("mobile.chat.talk.naming")
        : step === "creating"
          ? t("mobile.chat.talk.creating", { name: agentName })
          : t("mobile.chat.talk.tapToSpeak");

  return (
    <View className="flex-1 items-center justify-between bg-background px-6 pb-safe-offset-6 pt-safe-offset-4">
      <View className="w-full flex-row justify-end">
        <Button
          isIconOnly
          variant="ghost"
          accessibilityLabel={t("common.close")}
          onPress={() => {
            dictation.cancel();
            router.back();
          }}
        >
          <X size={24} className="text-foreground" />
        </Button>
      </View>

      <View className="items-center gap-4">
        <Typography.Heading className="text-center text-3xl">{t("mobile.chat.talk.prompt")}</Typography.Heading>
        <Typography.Paragraph align="center" className="text-muted">
          {t("mobile.chat.talk.hint")}
        </Typography.Paragraph>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={step === "listening" ? t("mobile.chat.talk.listening") : t("mobile.chat.talk.tapToSpeak")}
        disabled={step === "naming" || step === "creating"}
        onPress={() => (step === "listening" ? void finish() : listen())}
      >
        <Animated.View
          style={[{ width: ORB_SIZE, height: ORB_SIZE, borderRadius: ORB_SIZE / 2 }, orbStyle]}
          className="items-center justify-center bg-accent"
        >
          <Mic size={56} color="#ffffff" />
        </Animated.View>
      </Pressable>

      <View className="min-h-24 w-full items-center gap-2">
        <Typography.Paragraph align="center" className="text-muted">
          {status}
        </Typography.Paragraph>
        {heard ? (
          <Typography.Paragraph align="center" className="text-lg">
            {heard}
          </Typography.Paragraph>
        ) : null}
        {error ? (
          <Typography.Paragraph accessibilityRole="alert" align="center" className="text-danger-text">
            {error}
          </Typography.Paragraph>
        ) : null}
      </View>
    </View>
  );
}

/** The promise, or a failure after `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (cause) => {
        clearTimeout(timer);
        reject(cause);
      },
    );
  });
}
