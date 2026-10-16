import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Eyebrow from "@/components/feed/Eyebrow";
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
};

type ShareDayModalProps = {
  day: ShareDay | null;
  onClose: () => void;
};

const muted = "#737373";
const faint = "#262626";

function Rings() {
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: -120, right: -120 }}
    >
      {[300, 230, 160].map((size) => (
        <View
          key={size}
          style={{
            position: "absolute",
            top: (300 - size) / 2,
            left: (300 - size) / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: "#1C1C1C",
          }}
        />
      ))}
    </View>
  );
}

function ShareCard({ day, width }: { day: ShareDay; width: number }) {
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
  const hasAnything = day.totals !== null || day.workouts.length > 0;

  return (
    <View
      style={{
        width,
        minHeight: width * 1.25,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: faint,
        backgroundColor: "#0A0A0A",
        padding: 28,
        overflow: "hidden",
      }}
    >
      <Rings />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Eyebrow>{weekday}</Eyebrow>
        <Eyebrow>{monthDay}</Eyebrow>
      </View>

      <Text
        type="heading-1"
        numberOfLines={2}
        style={{ marginTop: 28, letterSpacing: -0.8 }}
      >
        {day.name}
      </Text>

      {day.totals ? (
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: appFonts.semiBold,
              fontSize: 76,
              lineHeight: 80,
              letterSpacing: -2.5,
            }}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatCalories(day.totals.calories)}
          </Text>
          <Eyebrow>CALORIES</Eyebrow>

          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <Text type="heading-2" style={{ letterSpacing: -0.8 }}>
              {formatProtein(day.totals.proteinG)}g
            </Text>
            <Eyebrow>PROTEIN</Eyebrow>
          </View>
        </View>
      ) : null}

      {day.workouts.length > 0 ? (
        <View style={{ marginTop: 32, gap: 14 }}>
          <View style={{ height: 1, backgroundColor: faint }} />
          <Eyebrow>MOVEMENT</Eyebrow>
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
                color={muted}
                style={{ marginTop: 3 }}
              />
              <Text type="heading-5" style={{ flex: 1 }}>
                {workout.description}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {!hasAnything ? (
        <Text type="heading-5" color={muted} style={{ marginTop: 32 }}>
          A quiet day so far.
        </Text>
      ) : null}

      <View style={{ flex: 1, minHeight: 32 }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text type="text-semibold" style={{ letterSpacing: -0.2 }}>
          lifeOS
        </Text>
        <Eyebrow>FITNESS TRACKER</Eyebrow>
      </View>
    </View>
  );
}

export default function ShareDayModal({ day, onClose }: ShareDayModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - 40, 400);

  return (
    <Modal
      visible={day !== null}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityLabel="Close"
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
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
          <Ionicons name="close" size={22} color="#525252" />
        </Pressable>

        {day ? <ShareCard day={day} width={cardWidth} /> : null}

        <Text type="text-detail" color="#404040" style={{ marginTop: 20 }}>
          Screenshot to share
        </Text>
      </Pressable>
    </Modal>
  );
}
