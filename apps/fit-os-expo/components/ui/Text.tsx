import { ReactNode } from "react";
import {
  StyleProp,
  Text as NativeText,
  TextProps as NativeTextProps,
  TextStyle,
} from "react-native";
import { appFonts } from "@/constants/fonts";

const textTypes = {
  "heading-1": {
    fontFamily: appFonts.semiBold,
    fontSize: 40,
    lineHeight: 48,
  },
  "heading-2": {
    fontFamily: appFonts.semiBold,
    fontSize: 32,
    lineHeight: 40,
  },
  "heading-3": {
    fontFamily: appFonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  "heading-4": {
    fontFamily: appFonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  "heading-5": {
    fontFamily: appFonts.medium,
    fontSize: 18,
    lineHeight: 24,
  },
  "text-regular": {
    fontFamily: appFonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  "text-medium": {
    fontFamily: appFonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  "text-semibold": {
    fontFamily: appFonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  "text-detail": {
    fontFamily: appFonts.medium,
    fontSize: 14,
    lineHeight: 16,
  },
} as const satisfies Record<string, TextStyle>;

const defaultTextType = "text-regular" as const;

export type TextType = keyof typeof textTypes;

interface TextProps extends NativeTextProps {
  type?: TextType;
  color?: string;
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
}

export default function Text({
  type = defaultTextType,
  color = "#FFFFFF",
  children,
  style,
  ...props
}: TextProps) {
  const textStyle = textTypes[type] ?? textTypes[defaultTextType];

  return (
    <NativeText
      allowFontScaling={false}
      style={[textStyle, { color }, style]}
      {...props}
    >
      {children}
    </NativeText>
  );
}
