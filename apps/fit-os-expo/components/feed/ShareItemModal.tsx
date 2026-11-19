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

type ShareMeal = {
  kind: "meal";
  id: string;
  name: string;
  dateKey: string;
  calories: number;
  proteinG: number;
  description?: string;
};

type ShareWorkout = {
  kind: "workout";
  id: string;
  name: string;
  dateKey: string;
  description: string;
};

export type ShareItem = ShareMeal | ShareWorkout;

function posterDate(dateKey: string) {
  const date = parseLocalDateKey(dateKey);
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long" })
      .format(date)
      .toUpperCase(),
    monthDay: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    })
      .format(date)
      .toUpperCase(),
  };
}

function ShareItemCard({
  item,
  theme,
  width,
  minHeight,
  onHeight,
}: {
  item: ShareItem;
  theme: ShareTheme;
  width: number;
  minHeight: number;
  onHeight?: (height: number) => void;
}) {
  const date = posterDate(item.dateKey);
  const description =
    item.kind === "meal" ? item.description?.trim() : item.description.trim();
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
            {date.weekday}
          </Eyebrow>
          <Eyebrow color={theme.muted} style={labelShadow}>
            {date.monthDay}
          </Eyebrow>
        </View>

        <Text
          type="heading-1"
          color={theme.text}
          numberOfLines={2}
          style={[{ marginTop: 28, letterSpacing: -0.8 }, labelShadow]}
        >
          {item.name}
        </Text>

        {item.kind === "meal" ? (
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
              {formatCalories(item.calories)}
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
                {formatProtein(item.proteinG)}g
              </Text>
              <Eyebrow color={theme.muted} style={labelShadow}>
                PROTEIN
              </Eyebrow>
            </View>
          </View>
        ) : (
          <Text
            type="heading-2"
            color={theme.text}
            style={[{ marginTop: 32, letterSpacing: -0.6 }, labelShadow]}
          >
            {description}
          </Text>
        )}
      </View>

      {item.kind === "meal" && description ? (
        <Text
          type="heading-5"
          color={theme.text}
          style={[{ marginTop: 32 }, labelShadow]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export default function ShareItemModal({
  item,
  onClose,
}: {
  item: ShareItem | null;
  onClose: () => void;
}) {
  return (
    <SharePosterModal
      open={item !== null}
      posterKey={item ? `${item.kind}-${item.id}` : ""}
      onClose={onClose}
      renderCard={(frame) =>
        item ? (
          <ShareItemCard
            item={item}
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
