import { Image } from "expo-image";
import { View } from "react-native";
import SharePosterModal, {
  type ShareTheme,
} from "@/components/feed/sharePoster";
import Eyebrow from "@/components/ui/Eyebrow";
import Rings from "@/components/ui/Rings";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import { formatCalories, parseLocalDateKey } from "@/utils/calorieWeek";
import { formatGroupWeight } from "@/utils/groupWeek";

export type ShareGroup = {
  startKey: string;
  endKey: string;
  names: string[];
  poundsLost: number | null;
  workouts: number;
  steps: number;
  caloriesEaten: number;
};

function posterRange(startKey: string, endKey: string) {
  const format = (dateKey: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
      .format(parseLocalDateKey(dateKey))
      .toUpperCase();
  return `${format(startKey)} – ${format(endKey)}`;
}

function ShareGroupCard({
  group,
  theme,
  width,
  minHeight,
  onHeight,
}: {
  group: ShareGroup;
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
  const weight = formatGroupWeight(group.poundsLost);
  const stats = [
    [weight.value, weight.label],
    [formatCalories(group.workouts), "WORKOUTS"],
    [formatCalories(group.steps), "STEPS"],
    [formatCalories(group.caloriesEaten), "CALORIES"],
  ] as const;

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
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
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
            {posterRange(group.startKey, group.endKey)}
          </Eyebrow>
        </View>

        {group.names.length <= 4 ? (
          <View style={{ marginTop: 22, gap: 2 }}>
            {group.names.map((name, index) => (
              <Text
                key={`${name}-${index}`}
                color={theme.text}
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  {
                    fontFamily: appFonts.semiBold,
                    fontSize: 26,
                    lineHeight: 34,
                    letterSpacing: -0.6,
                  },
                  labelShadow,
                ]}
              >
                {name}
              </Text>
            ))}
          </View>
        ) : (
          <Text
            color={theme.text}
            style={[
              {
                marginTop: 22,
                fontFamily: appFonts.semiBold,
                fontSize: 18,
                lineHeight: 26,
                letterSpacing: -0.3,
              },
              labelShadow,
            ]}
          >
            {group.names.join("  ·  ")}
          </Text>
        )}
      </View>

      <View style={{ marginTop: 36, gap: 28 }}>
        {[stats.slice(0, 2), stats.slice(2)].map((row) => (
          <View key={row[0][1]} style={{ flexDirection: "row", gap: 16 }}>
            {row.map(([value, label]) => (
              <View key={label} style={{ flex: 1, gap: 6 }}>
                <Text
                  color={theme.text}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    {
                      fontFamily: appFonts.semiBold,
                      fontSize: 40,
                      lineHeight: 46,
                      letterSpacing: -1.4,
                    },
                    labelShadow,
                  ]}
                >
                  {value}
                </Text>
                <Eyebrow color={theme.muted} style={labelShadow}>
                  {label}
                </Eyebrow>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ShareGroupModal({
  group,
  onClose,
}: {
  group: ShareGroup | null;
  onClose: () => void;
}) {
  return (
    <SharePosterModal
      open={group !== null}
      posterKey={
        group
          ? `${group.startKey}-${group.names.join(",")}-${group.poundsLost ?? "none"}-${group.workouts}-${group.steps}-${group.caloriesEaten}`
          : ""
      }
      onClose={onClose}
      renderCard={(frame) =>
        group ? (
          <ShareGroupCard
            group={group}
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
