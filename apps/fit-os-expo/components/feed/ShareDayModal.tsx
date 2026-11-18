import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";
import SharePosterModal, {
  type ShareTheme,
} from "@/components/feed/sharePoster";
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

export default function ShareDayModal({ day, onClose }: ShareDayModalProps) {
  return (
    <SharePosterModal
      open={day !== null}
      posterKey={day ? `${day.dateKey}-${day.name}` : ""}
      onClose={onClose}
      renderCard={(frame) =>
        day ? (
          <ShareCard
            day={day}
            theme={frame.theme}
            width={frame.width}
            minHeight={frame.minHeight}
            onHeight={frame.onHeight}
          />
        ) : null
      }
    />
  );
}
