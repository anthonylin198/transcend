import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
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
import { stitchPngBase64 } from "@/components/feed/shareCardImage";
import Eyebrow from "@/components/ui/Eyebrow";

const princessPhoto = require("../../assets/images/ashwin-tiara.png");

export type ShareTheme = {
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

export type ShareCardFrame = {
  theme: ShareTheme;
  width: number;
  minHeight: number;
  onHeight?: (height: number) => void;
};

type SharePosterModalProps = {
  open: boolean;
  posterKey: string;
  onClose: () => void;
  renderCard: (frame: ShareCardFrame) => ReactNode;
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
  page,
  screenWidth,
  cardWidth,
  naturalHeight,
  scale,
  posterHeight,
  copying,
  onContentHeight,
  onPageChange,
  renderCard,
}: {
  page: number;
  screenWidth: number;
  cardWidth: number;
  naturalHeight: number;
  scale: number;
  posterHeight: number;
  copying: boolean;
  onContentHeight: (height: number) => void;
  onPageChange: (index: number) => void;
  renderCard: (frame: ShareCardFrame) => ReactNode;
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
                {renderCard({
                  theme,
                  width: cardWidth,
                  minHeight: posterHeight,
                  onHeight: onContentHeight,
                })}
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
  theme,
  width,
  minHeight,
  viewportHeight,
  offset,
  cardHeight,
  onHeight,
  hostRef,
  renderCard,
}: {
  theme: ShareTheme;
  width: number;
  minHeight: number;
  viewportHeight: number;
  offset: number;
  cardHeight: number;
  onHeight: (height: number) => void;
  hostRef: RefObject<View | null>;
  renderCard: (frame: ShareCardFrame) => ReactNode;
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
        {renderCard({ theme, width, minHeight, onHeight })}
      </View>
    </View>
  );
}

export default function SharePosterModal({
  open,
  posterKey,
  onClose,
  renderCard,
}: SharePosterModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
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
  const measuredRef = useRef(posterHeight);
  const [measuredHeight, setMeasuredHeight] = useState(posterHeight);
  const [measuredFor, setMeasuredFor] = useState(posterKey);
  if (measuredFor !== posterKey) {
    measuredRef.current = posterHeight;
    setMeasuredFor(posterKey);
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
    if (!open || !hostRef.current || copyingRef.current) return;
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
      visible={open}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        {open ? (
          <CaptureHost
            key={posterKey}
            theme={theme}
            width={cardWidth}
            minHeight={posterHeight}
            viewportHeight={slice.height}
            offset={slice.offset}
            cardHeight={naturalHeight}
            onHeight={rememberHeight}
            hostRef={hostRef}
            renderCard={renderCard}
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
              disabled={copyState === "copying" || !open}
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

          {open ? (
            <ShareDeck
              key={posterKey}
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
              renderCard={renderCard}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
