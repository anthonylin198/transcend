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
import { formatWeightNumber } from "@/utils/weight";

export type ShareWeek = {
  name: string;
  startKey: string;
  endKey: string;
  average: { calories: number; proteinG: number } | null;
  weightPounds: number | null;
  weightComparison: string | null;
};

function posterRange(startKey: string, endKey: string) {
  const format = (dateKey: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
      .format(parseLocalDateKey(dateKey))
      .toUpperCase();
  return `${format(startKey)} – ${format(endKey)}`;
}

function ShareWeekCard({
  week,
  theme,
  width,
  minHeight,
  onHeight,
}: {
  week: ShareWeek;
  theme: ShareTheme;
  width: number;
  minHeight: number;
  onHeight?: (height: number) => void;
}) {
  const labelShadow = theme.photo
    ? {
        textShadowColor: "rgba(0, 0, 0, 0.85)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
      }
    : undefined;
  const hasWeight = week.weightPounds !== null;
  const showWeightFooter = week.average !== null && hasWeight;

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
            WEEK
          </Eyebrow>
          <Eyebrow color={theme.muted} style={labelShadow}>
            {posterRange(week.startKey, week.endKey)}
          </Eyebrow>
        </View>

        <Text
          type="heading-1"
          color={theme.text}
          numberOfLines={2}
          style={[{ marginTop: 28, letterSpacing: -0.8 }, labelShadow]}
        >
          {week.name}
        </Text>

        {week.average ? (
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
              {formatCalories(week.average.calories)}
            </Text>
            <Eyebrow color={theme.muted} style={labelShadow}>
              AVG CALORIES
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
                {formatProtein(week.average.proteinG)}g
              </Text>
              <Eyebrow color={theme.muted} style={labelShadow}>
                AVG PROTEIN
              </Eyebrow>
            </View>
          </View>
        ) : hasWeight && week.weightPounds !== null ? (
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
              {formatWeightNumber(week.weightPounds)}
            </Text>
            <Eyebrow color={theme.muted} style={labelShadow}>
              POUNDS
            </Eyebrow>
            {week.weightComparison ? (
              <Text
                type="heading-5"
                color={theme.muted}
                style={[{ marginTop: 16 }, labelShadow]}
              >
                {week.weightComparison}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text
            type="heading-5"
            color={theme.muted}
            style={[{ marginTop: 32 }, labelShadow]}
          >
            A quiet week.
          </Text>
        )}
      </View>

      {showWeightFooter && week.weightPounds !== null ? (
        <View style={{ marginTop: 32, gap: 14 }}>
          <View style={{ height: 1, backgroundColor: theme.line }} />
          <Eyebrow color={theme.muted} style={labelShadow}>
            WEIGHT
          </Eyebrow>
          <View
            style={{
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
              {formatWeightNumber(week.weightPounds)}
            </Text>
            <Eyebrow color={theme.muted} style={labelShadow}>
              LB
            </Eyebrow>
          </View>
          {week.weightComparison ? (
            <Text type="heading-5" color={theme.text} style={labelShadow}>
              {week.weightComparison}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function ShareWeekModal({
  week,
  onClose,
}: {
  week: ShareWeek | null;
  onClose: () => void;
}) {
  return (
    <SharePosterModal
      open={week !== null}
      posterKey={
        week
          ? `${week.startKey}-${week.average?.calories ?? "none"}-${week.weightPounds ?? "none"}`
          : ""
      }
      onClose={onClose}
      renderCard={(frame) =>
        week ? (
          <ShareWeekCard
            week={week}
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
