import { TextInput, View } from "react-native";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";

/** Matches MAX_CALORIE_DESCRIPTION_LENGTH on the server. */
export const MAX_NUTRITION_DESCRIPTION_LENGTH = 200;

export function sanitizeCalories(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 5);
}

export function sanitizeProtein(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) return cleaned.slice(0, 4);

  const whole = cleaned.slice(0, dotIndex).slice(0, 4);
  const decimals = cleaned
    .slice(dotIndex + 1)
    .replace(/\./g, "")
    .slice(0, 1);
  return `${whole}.${decimals}`;
}

const amountStyle = {
  color: "#F9FAFB",
  borderBottomWidth: 1,
  borderBottomColor: "#374151",
  fontFamily: appFonts.semiBold,
  fontSize: 28,
  lineHeight: 36,
  paddingVertical: 8,
} as const;

const descriptionStyle = {
  color: "#F9FAFB",
  borderBottomWidth: 1,
  borderBottomColor: "#374151",
  fontFamily: appFonts.regular,
  fontSize: 18,
  lineHeight: 24,
  paddingVertical: 8,
} as const;

function FieldLabel({ children }: { children: string }) {
  return (
    <Text type="text-detail" color="#9CA3AF">
      {children}
    </Text>
  );
}

type NutritionFieldsProps = {
  calories: string;
  protein: string;
  description: string;
  onCalories: (value: string) => void;
  onProtein: (value: string) => void;
  onDescription: (value: string) => void;
  editable?: boolean;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionFirst?: boolean;
  autoFocus?: "calories" | "description";
};

export default function NutritionFields({
  calories,
  protein,
  description,
  onCalories,
  onProtein,
  onDescription,
  editable = true,
  descriptionLabel,
  descriptionPlaceholder,
  descriptionFirst = false,
  autoFocus = "calories",
}: NutritionFieldsProps) {
  const descriptionField = (
    <View style={{ gap: 6 }}>
      <FieldLabel>{descriptionLabel}</FieldLabel>
      <TextInput
        value={description}
        onChangeText={onDescription}
        maxLength={MAX_NUTRITION_DESCRIPTION_LENGTH}
        placeholder={descriptionPlaceholder}
        placeholderTextColor="#6B7280"
        accessibilityLabel={descriptionLabel}
        editable={editable}
        autoFocus={autoFocus === "description"}
        style={descriptionStyle}
      />
    </View>
  );

  const amountFields = (
    <>
      <View style={{ gap: 6 }}>
        <FieldLabel>Calories</FieldLabel>
        <TextInput
          value={calories}
          onChangeText={(value) => onCalories(sanitizeCalories(value))}
          keyboardType="number-pad"
          inputMode="numeric"
          placeholder="0"
          placeholderTextColor="#6B7280"
          accessibilityLabel="Calories"
          editable={editable}
          autoFocus={autoFocus === "calories"}
          style={amountStyle}
        />
      </View>
      <View style={{ gap: 6 }}>
        <FieldLabel>Protein (g)</FieldLabel>
        <TextInput
          value={protein}
          onChangeText={(value) => onProtein(sanitizeProtein(value))}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor="#6B7280"
          accessibilityLabel="Protein in grams"
          editable={editable}
          style={amountStyle}
        />
      </View>
    </>
  );

  return (
    <View style={{ gap: 16 }}>
      {descriptionFirst ? descriptionField : null}
      {amountFields}
      {descriptionFirst ? null : descriptionField}
    </View>
  );
}
