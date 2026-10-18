import { View } from "react-native";
import Eyebrow from "@/components/ui/Eyebrow";

type SectionHeaderProps = {
  title: string;
  meta?: string;
};

export default function SectionHeader({ title, meta }: SectionHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Eyebrow>{title}</Eyebrow>
      {meta ? <Eyebrow color="#525252">{meta}</Eyebrow> : null}
    </View>
  );
}
