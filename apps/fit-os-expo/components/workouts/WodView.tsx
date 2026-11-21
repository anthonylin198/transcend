import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import Eyebrow from "@/components/ui/Eyebrow";
import Text from "@/components/ui/Text";
import {
  wodCategoryLabels,
  type Wod,
  type WodBlock,
  type WodMovement,
  type WodSection,
  type WodVariant,
} from "@/data/wods";

const DEFAULT_VARIANT_ID = "standard";
const lineColor = "#3A3A3C";
const muted = "#8E8E93";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function minuteLabel(totalSeconds: number) {
  if (totalSeconds % 60 === 0) return `${totalSeconds / 60} min`;
  return formatClock(totalSeconds);
}

function sectionKindLabel(type: string) {
  if (type === "warmup") return "WARM-UP";
  return type.replace(/[-_]/g, " ").toUpperCase();
}

function movementParts(movement: WodMovement) {
  const subtitle: string[] = [];
  let quantity: string | null = null;

  if (movement.distance != null) {
    quantity = String(movement.distance);
    if (movement.unit) subtitle.push(movement.unit);
  } else if (movement.repsPerSide != null) {
    quantity = String(movement.repsPerSide);
    subtitle.push("per side");
  } else if (movement.reps != null) {
    quantity = String(movement.reps);
    if (movement.perSide) subtitle.push("per side");
  }

  if (movement.weight) {
    subtitle.unshift(
      `${movement.weight.male}/${movement.weight.female} ${movement.weight.unit}`,
    );
  }
  if (movement.prescription) subtitle.push(movement.prescription);

  return {
    quantity,
    subtitle: subtitle.length > 0 ? subtitle.join(" · ") : null,
  };
}

function formatCell(key: string, value: string | number | undefined) {
  if (value == null) return "—";
  if (typeof value === "number" && key.toLowerCase().includes("percent")) {
    return `${value}%`;
  }
  return String(value);
}

function defaultVariantId(options: readonly WodVariant[]) {
  return (
    options.find((option) => option.id === DEFAULT_VARIANT_ID)?.id ??
    options[0]?.id ??
    ""
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View
      style={{
        borderRadius: 8,
        backgroundColor: "#2C2C2E",
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text
        type="text-medium"
        color="#A1A1AA"
        style={{ fontSize: 13, lineHeight: 16 }}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailLine({
  quantity,
  title,
  subtitle,
}: {
  quantity: string | null;
  title: string;
  subtitle: string | null;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: lineColor,
      }}
    >
      <Text
        type="text-semibold"
        style={
          quantity != null && quantity.length > 2
            ? { minWidth: 44, fontSize: 22, lineHeight: 28 }
            : { width: 44, fontSize: 28, lineHeight: 34 }
        }
      >
        {quantity ?? ""}
      </Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text type="text-semibold" style={{ fontSize: 17, lineHeight: 22 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text type="text-detail" color={muted} style={{ lineHeight: 18 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function MovementRows({
  movements,
}: {
  movements: readonly WodMovement[];
}) {
  return (
    <View>
      {movements.map((movement, index) => {
        const parts = movementParts(movement);
        return (
          <DetailLine
            key={`${movement.name}-${index}`}
            quantity={parts.quantity}
            title={movement.name}
            subtitle={parts.subtitle}
          />
        );
      })}
    </View>
  );
}

function VariantPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: readonly WodVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => ({
              borderRadius: 999,
              backgroundColor: selected ? "#3A3A3C" : "transparent",
              paddingHorizontal: selected ? 18 : 8,
              paddingVertical: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              type="text-semibold"
              color={selected ? "#FFFFFF" : "#D4D4D4"}
              style={{ fontSize: 15, lineHeight: 20 }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function protocolPills(
  block: Extract<WodBlock, { type: "protocol" }>,
) {
  const pills: string[] = [];
  if (block.intervalSeconds != null) {
    pills.push(`Every ${minuteLabel(block.intervalSeconds)}`);
  }
  if (block.targetSeconds) {
    const { min, max } = block.targetSeconds;
    pills.push(
      min % 60 === 0 && max % 60 === 0
        ? `Target ${min / 60}–${max / 60} min`
        : `Target ${formatClock(min)}–${formatClock(max)}`,
    );
  }
  if (block.timeCapSeconds != null) {
    pills.push(`Cap ${minuteLabel(block.timeCapSeconds)}`);
  }
  return pills;
}

function WodBlockView({
  block,
  selectedVariantId,
  onSelectVariant,
}: {
  block: WodBlock;
  selectedVariantId?: string;
  onSelectVariant?: (id: string) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <Text type="text-semibold" style={{ fontSize: 20, lineHeight: 26 }}>
          {block.text}
        </Text>
      );
    case "movementList":
      return <MovementRows movements={block.items} />;
    case "movementComplex":
      return (
        <View style={{ gap: 8 }}>
          {block.label ? (
            <Text type="text-detail" color={muted}>
              {block.label}
            </Text>
          ) : null}
          <MovementRows movements={block.movements} />
        </View>
      );
    case "protocol": {
      const pills = protocolPills(block);
      return (
        <View style={{ gap: 12 }}>
          <Text
            type="text-semibold"
            style={{ fontSize: 20, lineHeight: 26 }}
          >
            {block.label}
          </Text>
          {pills.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {pills.map((pill) => (
                <MetaPill key={pill} label={pill} />
              ))}
            </View>
          ) : null}
        </View>
      );
    }
    case "setTable": {
      const setColumn = block.columns.find((column) => column.key === "set");
      const rest = block.columns.filter((column) => column.key !== "set");
      return (
        <View>
          {block.rows.map((row, index) => {
            const titleColumn = rest[0];
            const subtitle = rest
              .slice(1)
              .map((column) => formatCell(column.key, row[column.key]))
              .join(" · ");
            return (
              <DetailLine
                key={index}
                quantity={
                  setColumn ? formatCell(setColumn.key, row[setColumn.key]) : null
                }
                title={
                  titleColumn
                    ? formatCell(titleColumn.key, row[titleColumn.key])
                    : ""
                }
                subtitle={subtitle || null}
              />
            );
          })}
        </View>
      );
    }
    case "note":
      return (
        <Text type="text-regular" color={muted} style={{ lineHeight: 22 }}>
          {block.text}
        </Text>
      );
    case "alternative":
      return (
        <View style={{ gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Text type="text-semibold" style={{ fontSize: 20, lineHeight: 26 }}>
              {block.label}
            </Text>
            {block.description ? (
              <Text type="text-detail" color={muted} style={{ lineHeight: 18 }}>
                {block.description}
              </Text>
            ) : null}
          </View>
          <MovementRows movements={block.movements} />
        </View>
      );
    case "variants": {
      const selected =
        block.options.find((option) => option.id === selectedVariantId) ??
        block.options.find(
          (option) => option.id === defaultVariantId(block.options),
        );
      if (!selected) return null;
      return (
        <View style={{ gap: 8 }}>
          {block.options.length > 1 && onSelectVariant ? (
            <VariantPicker
              options={block.options}
              selectedId={selected.id}
              onSelect={onSelectVariant}
            />
          ) : null}
          <MovementRows movements={selected.movements} />
        </View>
      );
    }
    case "score": {
      const genericTimeLabel =
        block.label === "Total completion time" || block.label === "Total Time";
      const title =
        block.metric === "time" && genericTimeLabel
          ? "Score · Total Time"
          : `Score · ${block.label}`;
      const cap =
        block.timeCapSeconds == null
          ? null
          : block.timeCapSeconds % 60 === 0
            ? `Complete within the ${block.timeCapSeconds / 60}-minute cap`
            : `Complete within ${formatClock(block.timeCapSeconds)}`;
      return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <Ionicons
            name={block.metric === "time" ? "time-outline" : "repeat-outline"}
            size={16}
            color="#FFFFFF"
            style={{ marginTop: 4 }}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Text type="text-semibold">{title}</Text>
            {cap ? (
              <Text type="text-detail" color={muted} style={{ lineHeight: 18 }}>
                {cap}
              </Text>
            ) : null}
          </View>
        </View>
      );
    }
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

function WodSectionView({
  section,
  index,
  selectedByKey,
  onSelectVariant,
}: {
  section: WodSection;
  index: number;
  selectedByKey: Record<string, string>;
  onSelectVariant: (key: string, id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const indexLabel = `${String(index + 1).padStart(2, "0")} / ${sectionKindLabel(section.type)}`;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${section.title}, ${open ? "expanded" : "collapsed"}`}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 8,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            type="text-medium"
            color="#8A8A8A"
            style={{ fontSize: 12, lineHeight: 16, letterSpacing: 1.2 }}
          >
            {indexLabel}
          </Text>
          <Text type="text-semibold" style={{ fontSize: 22, lineHeight: 28 }}>
            {section.title}
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#A3A3A3"
        />
      </Pressable>
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: lineColor,
        }}
      />
      {open ? (
        <View style={{ paddingTop: 22, gap: 22 }}>
          {section.blocks.map((block, blockIndex) => {
            const variantKey = `${section.id}:${blockIndex}`;
            const selectedVariantId =
              block.type === "variants"
                ? (selectedByKey[variantKey] ??
                  defaultVariantId(block.options))
                : undefined;
            return (
              <WodBlockView
                key={variantKey}
                block={block}
                selectedVariantId={selectedVariantId}
                onSelectVariant={
                  block.type === "variants"
                    ? (id) => onSelectVariant(variantKey, id)
                    : undefined
                }
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default function WodView({ wod }: { wod: Wod }) {
  const [selectedByKey, setSelectedByKey] = useState<Record<string, string>>(
    {},
  );

  return (
    <View>
      <View style={{ gap: 10 }}>
        <Eyebrow>{wodCategoryLabels[wod.category].toUpperCase()}</Eyebrow>
        <Text
          accessibilityRole="header"
          type="heading-3"
          style={{ letterSpacing: -0.4 }}
        >
          {wod.title}
        </Text>
      </View>
      <View style={{ marginTop: 28, gap: 28 }}>
        {wod.sections.map((section, index) => (
          <WodSectionView
            key={section.id}
            section={section}
            index={index}
            selectedByKey={selectedByKey}
            onSelectVariant={(key, id) =>
              setSelectedByKey((current) => ({ ...current, [key]: id }))
            }
          />
        ))}
      </View>
    </View>
  );
}
