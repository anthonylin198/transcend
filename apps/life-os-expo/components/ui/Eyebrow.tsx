import Text from "@/components/ui/Text";

export default function Eyebrow({
  children,
  color = "#737373",
}: {
  children: string;
  color?: string;
}) {
  return (
    <Text
      type="text-detail"
      color={color}
      style={{ fontSize: 11, letterSpacing: 2.4 }}
    >
      {children}
    </Text>
  );
}
