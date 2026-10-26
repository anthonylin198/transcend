import { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Eyebrow from "@/components/ui/Eyebrow";
import Rings from "@/components/ui/Rings";
import Text from "@/components/ui/Text";
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
  onHeight: (height: number) => void;
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
      onLayout={(event) => onHeight(event.nativeEvent.layout.height)}
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
  onSelect,
}: {
  page: number;
  width: number;
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
        accessibilityState={{ disabled: page === 0 }}
        disabled={page === 0}
        onPress={() => onSelect(page - 1)}
        hitSlop={8}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          opacity: page === 0 ? 0.28 : 1,
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
                accessibilityState={{ selected }}
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
        accessibilityState={{ disabled: page === shareThemes.length - 1 }}
        disabled={page === shareThemes.length - 1}
        onPress={() => onSelect(page + 1)}
        hitSlop={8}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          opacity: page === shareThemes.length - 1 ? 0.28 : 1,
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
  maxHeight,
  onPageChange,
}: {
  day: ShareDay;
  page: number;
  screenWidth: number;
  cardWidth: number;
  maxHeight: number;
  onPageChange: (index: number) => void;
}) {
  const pagerRef = useRef<PagerView>(null);
  const pageRef = useRef(page);
  const posterHeight = Math.min(maxHeight, Math.round(cardWidth * 1.32));
  const [measuredHeight, setMeasuredHeight] = useState(posterHeight);
  const cardHeight = Math.min(
    maxHeight,
    Math.max(posterHeight, measuredHeight),
  );

  function showTheme(index: number) {
    if (index < 0 || index >= shareThemes.length || index === pageRef.current) {
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
        style={{ width: screenWidth, height: cardHeight }}
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
              height: cardHeight,
              alignItems: "center",
            }}
          >
            <ShareCard
              day={day}
              theme={theme}
              width={cardWidth}
              minHeight={posterHeight}
              onHeight={(height) => {
                const next = Math.ceil(height);
                setMeasuredHeight((current) =>
                  next > current + 1 ? next : current,
                );
              }}
            />
          </View>
        ))}
      </PagerView>
      <ThemeSwitcher page={page} width={cardWidth} onSelect={showTheme} />
    </View>
  );
}

export default function ShareDayModal({ day, onClose }: ShareDayModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const isOpen = day !== null;
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) setPage(0);
  }
  const cardWidth = Math.min(screenWidth - 40, 400);
  const maxCardHeight = Math.max(
    280,
    screenHeight - insets.top - insets.bottom - 150,
  );

  return (
    <Modal
      visible={day !== null}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            hitSlop={12}
            style={{
              position: "absolute",
              top: insets.top + 12,
              right: 20,
              padding: 6,
            }}
          >
            <Ionicons name="close" size={22} color="#737373" />
          </Pressable>

          {day ? (
            <ShareDeck
              key={`${day.dateKey}-${day.name}`}
              day={day}
              page={page}
              screenWidth={screenWidth}
              cardWidth={cardWidth}
              maxHeight={maxCardHeight}
              onPageChange={setPage}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
