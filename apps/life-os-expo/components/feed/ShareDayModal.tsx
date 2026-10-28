import { useEffect, useRef, useState, type RefObject } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { captureRef as captureView } from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Eyebrow from "@/components/ui/Eyebrow";
import Rings from "@/components/ui/Rings";
import Text from "@/components/ui/Text";
import { stitchPngBase64 } from "@/components/feed/shareCardImage";
import { appFonts } from "@/constants/fonts";
import {
  formatCalories,
  formatProtein,
  parseLocalDateKey,
} from "@/utils/calorieWeek";

export type ShareDay = {
  name: string;
  dateKey: string;
  totals: { calories: number; proteinG: number } | null;
  workouts: { _id: string; description: string }[];
  steps: number | null;
  stepsPending: boolean;
};

const princessPhoto = require("../../assets/images/ashwin-tiara.png");

type ShareTheme = {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundImage?: string;
  photo?: number;
  text: string;
  muted: string;
  line: string;
  ring: string;
  accent: string;
  borderColor?: string;
};

const shareThemes: ShareTheme[] = [
  {
    id: "ink",
    name: "Ink",
    backgroundColor: "#0A0A0A",
    text: "#FFFFFF",
    muted: "#737373",
    line: "#262626",
    ring: "#1C1C1C",
    accent: "#FFFFFF",
    borderColor: "#262626",
  },
  {
    id: "sunset",
    name: "Sunset",
    backgroundColor: "#FF8F5E",
    backgroundImage:
      "linear-gradient(165deg, #FFD29A 0%, #FF8F5E 24%, #FF6A62 55%, #F08BB4 100%)",
    text: "#3C1428",
    muted: "#4A1830",
    line: "rgba(60, 20, 40, 0.16)",
    ring: "rgba(60, 20, 40, 0.2)",
    accent: "#FF8A5B",
  },
  {
    id: "dusk",
    name: "Dusk",
    backgroundColor: "#6D28A8",
    backgroundImage:
      "linear-gradient(160deg, #1A1233 0%, #6D28A8 46%, #8E4564 100%)",
    text: "#FFF7FB",
    muted: "#F4E2EC",
    line: "rgba(255, 247, 251, 0.22)",
    ring: "rgba(255, 247, 251, 0.28)",
    accent: "#E7A0B8",
  },
  {
    id: "aurora",
    name: "Aurora",
    backgroundColor: "#12344F",
    backgroundImage:
      "linear-gradient(155deg, #0F766E 0%, #12344F 42%, #5B21B6 100%)",
    text: "#F4FFFB",
    muted: "#D8F6F0",
    line: "rgba(244, 255, 251, 0.2)",
    ring: "rgba(244, 255, 251, 0.26)",
    accent: "#5EEAD4",
  },
  {
    id: "dawn",
    name: "Dawn",
    backgroundColor: "#EED4EE",
    backgroundImage:
      "linear-gradient(168deg, #F8D3C2 0%, #EED4EE 40%, #D4E3FB 100%)",
    text: "#24182F",
    muted: "#4C3C58",
    line: "rgba(36, 24, 47, 0.14)",
    ring: "rgba(36, 24, 47, 0.16)",
    accent: "#F0B9A8",
  },
  {
    id: "sand",
    name: "Sand",
    backgroundColor: "#F3E6D6",
    backgroundImage: "linear-gradient(180deg, #FBF6F0 0%, #EAD8C4 100%)",
    text: "#2A2118",
    muted: "#5A4E44",
    line: "rgba(42, 33, 24, 0.14)",
    ring: "rgba(42, 33, 24, 0.12)",
    accent: "#E7C8A8",
  },
  {
    id: "princess",
    name: "Princess",
    backgroundColor: "#FFB07A",
    photo: princessPhoto,
    text: "#FFFFFF",
    muted: "#FFFFFF",
    line: "rgba(255, 255, 255, 0.72)",
    ring: "rgba(255, 255, 255, 0.28)",
    accent: "#F6D56A",
  },
];

function formatSteps(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

type ShareDayModalProps = {
  day: ShareDay | null;
  onClose: () => void;
};

type CopyState = "idle" | "copying" | "copied" | "failed";

type CardSlice = {
  offset: number;
  height: number;
};

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function planSlices(cardHeight: number, screenHeight: number) {
  const total = Math.max(1, Math.ceil(cardHeight));
  const maxSlice = Math.max(1, Math.floor(screenHeight));
  const slices: CardSlice[] = [];
  let offset = 0;
  while (offset < total) {
    const height = Math.min(maxSlice, total - offset);
    slices.push({ offset, height });
    offset += height;
  }
  return slices;
}

function ShareCard({
  day,
  theme,
  width,
  minHeight,
  onHeight,
}: {
  day: ShareDay;
  theme: ShareTheme;
  width: number;
  minHeight: number;
  onHeight?: (height: number) => void;
}) {
  const date = parseLocalDateKey(day.dateKey);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(date)
    .toUpperCase();
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  })
    .format(date)
    .toUpperCase();
  const hasAnything =
    day.totals !== null || day.workouts.length > 0 || day.steps !== null;
  const hasMovement = day.workouts.length > 0 || day.steps !== null;
  const labelShadow = theme.photo
    ? {
        textShadowColor: "rgba(0, 0, 0, 0.85)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
      }
    : undefined;

  return (
    <View
      onLayout={
        onHeight
          ? (event) => onHeight(event.nativeEvent.layout.height)
          : undefined
      }
      style={{
        width,
        minHeight,
        borderRadius: 28,
        borderCurve: "continuous",
        borderWidth: theme.borderColor ? 1 : 0,
        borderColor: theme.borderColor,
        backgroundColor: theme.backgroundColor,
        experimental_backgroundImage: theme.backgroundImage,
        padding: 28,
        overflow: "hidden",
        justifyContent: "space-between",
      }}
    >
      {theme.photo ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Image
            source={theme.photo}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      ) : null}

      <Rings color={theme.ring} />

      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Eyebrow color={theme.muted} style={labelShadow}>
            {weekday}
          </Eyebrow>
          <Eyebrow color={theme.muted} style={labelShadow}>
            {monthDay}
          </Eyebrow>
        </View>

        <Text
          type="heading-1"
          color={theme.text}
          numberOfLines={2}
          style={[{ marginTop: 28, letterSpacing: -0.8 }, labelShadow]}
        >
          {day.name}
        </Text>

        {day.totals ? (
          <View style={{ marginTop: 32 }}>
            <Text
              color={theme.text}
              style={[
                {
                  fontFamily: appFonts.semiBold,
                  fontSize: 76,
                  lineHeight: 80,
                  letterSpacing: -2.5,
                },
                labelShadow,
              ]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatCalories(day.totals.calories)}
            </Text>
            <Eyebrow color={theme.muted} style={labelShadow}>
              CALORIES
            </Eyebrow>

            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <Text
                type="heading-2"
                color={theme.text}
                style={[{ letterSpacing: -0.8 }, labelShadow]}
              >
                {formatProtein(day.totals.proteinG)}g
              </Text>
              <Eyebrow color={theme.muted} style={labelShadow}>
                PROTEIN
              </Eyebrow>
            </View>
          </View>
        ) : null}

        {!hasAnything && !day.stepsPending ? (
          <Text
            type="heading-5"
            color={theme.muted}
            style={[{ marginTop: 32 }, labelShadow]}
          >
            A quiet day so far.
          </Text>
        ) : null}
      </View>

      {hasMovement ? (
        <View style={{ marginTop: 32, gap: 14 }}>
          <View style={{ height: 1, backgroundColor: theme.line }} />
          <Eyebrow color={theme.muted} style={labelShadow}>
            MOVEMENT
          </Eyebrow>
          {day.workouts.map((workout) => (
            <View
              key={workout._id}
              style={{
                flexDirection: "row",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <Ionicons
                name="barbell-outline"
                size={18}
                color={theme.muted}
                style={{ marginTop: 3 }}
              />
              <Text
                type="heading-5"
                color={theme.text}
                style={[{ flex: 1 }, labelShadow]}
              >
                {workout.description}
              </Text>
            </View>
          ))}
          {day.steps !== null ? (
            <View
              style={{
                flexDirection: "row",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <Ionicons
                name="footsteps-outline"
                size={18}
                color={theme.muted}
                style={{ marginTop: 3 }}
              />
              <Text
                type="heading-5"
                color={theme.text}
                style={[{ flex: 1 }, labelShadow]}
              >
                {`${formatSteps(day.steps)} steps`}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function ThemeSwitcher({
  page,
  width,
  disabled,
  onSelect,
}: {
  page: number;
  width: number;
  disabled: boolean;
  onSelect: (index: number) => void;
}) {
  const theme = shareThemes[page] ?? shareThemes[0];

  return (
    <View
      style={{
        marginTop: 18,
        width,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous theme"
        accessibilityState={{ disabled: disabled || page === 0 }}
        disabled={disabled || page === 0}
        onPress={() => onSelect(page - 1)}
        hitSlop={8}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled || page === 0 ? 0.28 : 1,
        }}
      >
        <Ionicons name="chevron-back" size={20} color="#D4D4D4" />
      </Pressable>

      <View style={{ flex: 1, alignItems: "center", gap: 8 }}>
        <Eyebrow color="#D4D4D4">{theme.name.toUpperCase()}</Eyebrow>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {shareThemes.map((item, index) => {
            const selected = index === page;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} theme`}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onSelect(index)}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                style={{
                  width: selected ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: selected ? item.accent : "#3F3F3F",
                }}
              />
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next theme"
        accessibilityState={{
          disabled: disabled || page === shareThemes.length - 1,
        }}
        disabled={disabled || page === shareThemes.length - 1}
        onPress={() => onSelect(page + 1)}
        hitSlop={8}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled || page === shareThemes.length - 1 ? 0.28 : 1,
        }}
      >
        <Ionicons name="chevron-forward" size={20} color="#D4D4D4" />
      </Pressable>
    </View>
  );
}

function ShareDeck({
  day,
  page,
  screenWidth,
  cardWidth,
  naturalHeight,
  scale,
  posterHeight,
  copying,
  onContentHeight,
  onPageChange,
}: {
  day: ShareDay;
  page: number;
  screenWidth: number;
  cardWidth: number;
  naturalHeight: number;
  scale: number;
  posterHeight: number;
  copying: boolean;
  onContentHeight: (height: number) => void;
  onPageChange: (index: number) => void;
}) {
  const pagerRef = useRef<PagerView>(null);
  const pageRef = useRef(page);
  const displayHeight = naturalHeight * scale;

  function showTheme(index: number) {
    if (
      copying ||
      index < 0 ||
      index >= shareThemes.length ||
      index === pageRef.current
    ) {
      return;
    }
    pageRef.current = index;
    onPageChange(index);
    pagerRef.current?.setPage(index);
    void Haptics.selectionAsync();
  }

  return (
    <View style={{ width: screenWidth, alignItems: "center" }}>
      <PagerView
        ref={pagerRef}
        scrollEnabled={!copying}
        style={{ width: screenWidth, height: displayHeight }}
        initialPage={page}
        onPageSelected={(event) => {
          const next = event.nativeEvent.position;
          if (next === pageRef.current) return;
          pageRef.current = next;
          onPageChange(next);
          void Haptics.selectionAsync();
        }}
      >
        {shareThemes.map((theme) => (
          <View
            key={theme.id}
            collapsable={false}
            style={{
              width: screenWidth,
              height: displayHeight,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: cardWidth * scale,
                height: displayHeight,
                borderRadius: 28 * scale,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: cardWidth,
                  transform: [{ scale }],
                  transformOrigin: "top left",
                }}
              >
                <ShareCard
                  day={day}
                  theme={theme}
                  width={cardWidth}
                  minHeight={posterHeight}
                  onHeight={onContentHeight}
                />
              </View>
            </View>
          </View>
        ))}
      </PagerView>
      <ThemeSwitcher
        page={page}
        width={cardWidth}
        disabled={copying}
        onSelect={showTheme}
      />
    </View>
  );
}

function CaptureHost({
  day,
  theme,
  width,
  minHeight,
  viewportHeight,
  offset,
  cardHeight,
  onHeight,
  hostRef,
}: {
  day: ShareDay;
  theme: ShareTheme;
  width: number;
  minHeight: number;
  viewportHeight: number;
  offset: number;
  cardHeight: number;
  onHeight: (height: number) => void;
  hostRef: RefObject<View | null>;
}) {
  const roundTop = offset <= 0;
  const roundBottom = offset + viewportHeight >= cardHeight - 1;

  return (
    <View
      ref={hostRef}
      collapsable={false}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height: Math.max(1, viewportHeight),
        overflow: "hidden",
        backgroundColor: "transparent",
        borderTopLeftRadius: roundTop ? 28 : 0,
        borderTopRightRadius: roundTop ? 28 : 0,
        borderBottomLeftRadius: roundBottom ? 28 : 0,
        borderBottomRightRadius: roundBottom ? 28 : 0,
      }}
    >
      <View
        collapsable={false}
        style={{ transform: [{ translateY: -offset }] }}
      >
        <ShareCard
          day={day}
          theme={theme}
          width={width}
          minHeight={minHeight}
          onHeight={onHeight}
        />
      </View>
    </View>
  );
}

export default function ShareDayModal({ day, onClose }: ShareDayModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const isOpen = day !== null;
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) {
      setPage(0);
      setCopyState("idle");
    }
  }
  const cardWidth = Math.min(screenWidth - 40, 400);
  const maxCardHeight = Math.max(
    280,
    screenHeight - insets.top - insets.bottom - 150,
  );
  const posterHeight = Math.min(maxCardHeight, Math.round(cardWidth * 1.32));
  const dayKey = day ? `${day.dateKey}-${day.name}` : "";
  const measuredRef = useRef(posterHeight);
  const [measuredHeight, setMeasuredHeight] = useState(posterHeight);
  const [measuredFor, setMeasuredFor] = useState(dayKey);
  if (measuredFor !== dayKey) {
    measuredRef.current = posterHeight;
    setMeasuredFor(dayKey);
    setMeasuredHeight(posterHeight);
  }
  const naturalHeight = Math.max(posterHeight, measuredHeight);
  const zoomed = naturalHeight > maxCardHeight + 1;
  const scale = zoomed ? maxCardHeight / naturalHeight : 1;
  const idleSliceHeight = Math.min(
    naturalHeight,
    Math.max(1, Math.floor(screenHeight)),
  );
  const [slice, setSlice] = useState<CardSlice>({
    offset: 0,
    height: idleSliceHeight,
  });
  const sliceRef = useRef(slice);
  const sliceWaiter = useRef<(() => void) | null>(null);
  const hostRef = useRef<View>(null);
  const copyingRef = useRef(false);
  const mounted = useRef(true);
  const theme = shareThemes[page] ?? shareThemes[0];

  sliceRef.current = slice;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      sliceWaiter.current?.();
      sliceWaiter.current = null;
    };
  }, []);

  useEffect(() => {
    if (copyState === "copying") return;
    setSlice((current) =>
      current.offset === 0 && current.height === idleSliceHeight
        ? current
        : { offset: 0, height: idleSliceHeight },
    );
  }, [copyState, idleSliceHeight]);

  useEffect(() => {
    const resolve = sliceWaiter.current;
    if (!resolve) return;
    sliceWaiter.current = null;
    resolve();
  }, [slice]);

  useEffect(() => {
    if (copyState !== "copied" && copyState !== "failed") return;
    const timeout = setTimeout(() => setCopyState("idle"), 1800);
    return () => clearTimeout(timeout);
  }, [copyState]);

  function rememberHeight(height: number) {
    const next = Math.ceil(height);
    if (next <= measuredRef.current + 1) return;
    measuredRef.current = next;
    setMeasuredHeight(next);
  }

  async function presentSlice(next: CardSlice) {
    const current = sliceRef.current;
    if (current.offset !== next.offset || current.height !== next.height) {
      await new Promise<void>((resolve) => {
        sliceWaiter.current = resolve;
        setSlice(next);
      });
    }
    await nextFrame();
    await nextFrame();
  }

  async function copyCard() {
    if (!day || !hostRef.current || copyingRef.current) return;
    const cardHeight = Math.max(measuredRef.current, naturalHeight);
    copyingRef.current = true;
    setCopyState("copying");
    try {
      const parts: string[] = [];
      for (const nextSlice of planSlices(cardHeight, screenHeight)) {
        await presentSlice(nextSlice);
        if (!mounted.current) return;
        if (!hostRef.current) throw new Error("Share card image was empty.");
        const captured = await captureView(hostRef, {
          format: "png",
          quality: 1,
          result: "base64",
        });
        if (!captured) throw new Error("Share card image was empty.");
        parts.push(captured);
      }
      if (!mounted.current) return;
      const image = await stitchPngBase64(parts);
      await Clipboard.setImageAsync(image);
      if (!mounted.current) return;
      setCopyState("copied");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      if (!mounted.current) return;
      setCopyState("failed");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      copyingRef.current = false;
    }
  }

  return (
    <Modal
      visible={day !== null}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        {day ? (
          // Full-size card for the clipboard. The backdrop covers it so the preview can stay zoomed out.
          <CaptureHost
            key={dayKey}
            day={day}
            theme={theme}
            width={cardWidth}
            minHeight={posterHeight}
            viewportHeight={slice.height}
            offset={slice.offset}
            cardHeight={naturalHeight}
            onHeight={rememberHeight}
            hostRef={hostRef}
          />
        ) : null}
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: "#000000" }]}
        />
        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: insets.top + 12,
              right: 14,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copyState === "copied" ? "Card copied" : "Copy card"
              }
              accessibilityState={{ disabled: copyState === "copying" }}
              disabled={copyState === "copying" || day === null}
              onPress={() => {
                void copyCard();
              }}
              hitSlop={8}
              style={{
                padding: 6,
                opacity: copyState === "copying" ? 0.4 : 1,
              }}
            >
              <Ionicons
                name={
                  copyState === "copied"
                    ? "checkmark"
                    : copyState === "failed"
                      ? "alert-circle-outline"
                      : "copy-outline"
                }
                size={20}
                color="#737373"
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={8}
              style={{ padding: 6 }}
            >
              <Ionicons name="close" size={22} color="#737373" />
            </Pressable>
          </View>

          {day ? (
            <ShareDeck
              key={dayKey}
              day={day}
              page={page}
              screenWidth={screenWidth}
              cardWidth={cardWidth}
              naturalHeight={naturalHeight}
              scale={scale}
              posterHeight={posterHeight}
              copying={copyState === "copying"}
              onContentHeight={rememberHeight}
              onPageChange={(index) => {
                setPage(index);
                setCopyState((current) =>
                  current === "copying" ? current : "idle",
                );
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
