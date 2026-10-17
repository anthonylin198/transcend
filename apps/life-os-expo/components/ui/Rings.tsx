import { View } from "react-native";

type RingsProps = {
  /** Diameter of the outermost ring. */
  size?: number;
  /** How far the rings hang past the top-right corner. */
  overhang?: number;
  color?: string;
};

export default function Rings({
  size = 300,
  overhang = 120,
  color = "#1C1C1C",
}: RingsProps) {
  const diameters = [size, size * 0.77, size * 0.53];

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -overhang,
        right: -overhang,
        width: size,
        height: size,
      }}
    >
      {diameters.map((diameter) => (
        <View
          key={diameter}
          style={{
            position: "absolute",
            top: (size - diameter) / 2,
            left: (size - diameter) / 2,
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            borderWidth: 1,
            borderColor: color,
          }}
        />
      ))}
    </View>
  );
}
