import { Image, Link, Path, Svg, Text, View } from "@react-pdf/renderer";
import { contactItems, type ContactItem, type ContactKind } from "../contact";
import type { ResumeTheme } from "../resumeTheme";
import type { PersonalInfo } from "../types";
import type { ResumeStyles } from "./styles";

const ICONS: Record<ContactKind, string> = {
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  email:
    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z",
  github:
    "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z",
  linkedin:
    "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.23 0z",
  location:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  website:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

function ContactIcon({
  kind,
  color,
  size,
}: {
  kind: ContactKind;
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={ICONS[kind]} fill={color} />
    </Svg>
  );
}

function ContactLine({
  item,
  styles,
  theme,
}: {
  item: ContactItem;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  const content = item.href ? (
    <Link src={item.href} style={styles.contactLink}>
      {item.label}
    </Link>
  ) : (
    <Text style={styles.contactLink}>{item.label}</Text>
  );

  return (
    <View style={styles.contactGroup} wrap={false}>
      <View style={styles.contactIcon}>
        <ContactIcon
          kind={item.kind}
          color={theme.colors.primary}
          size={theme.spacing.contactIconSize}
        />
      </View>
      {content}
    </View>
  );
}

const PERSON_ICON =
  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z";

function HeaderPhoto({
  photo,
  styles,
  theme,
}: {
  photo?: string;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  if (photo) {
    // react-pdf's Image does not accept an alt attribute.
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image src={photo} style={styles.headerPhoto} />;
  }

  const size = theme.spacing.photoSize * 0.62;
  return (
    <View style={styles.headerPhotoPlaceholder}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={PERSON_ICON} fill={theme.colors.primary} />
      </Svg>
    </View>
  );
}

export function ResumeHeader({
  personal,
  styles,
  theme,
}: {
  personal: PersonalInfo;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  const items = contactItems(personal);
  const title = personal.title?.trim();
  const tagline = personal.tagline?.trim();

  return (
    <View style={styles.headerBlock}>
      {tagline ? (
        <View style={styles.taglineRow}>
          <View style={styles.taglineRule} />
          <Text style={styles.tagline}>{tagline}</Text>
          <View style={styles.taglineRule} />
        </View>
      ) : null}
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={styles.name}>{personal.name}</Text>
          {title ? <Text style={styles.role}>{title}</Text> : null}
          {items.length > 0 ? (
            <View
              style={[
                styles.contactRow,
                {
                  marginTop: title ? theme.spacing.titleGap : theme.spacing.nameGap,
                },
              ]}
            >
              {items.map((item) => (
                <ContactLine
                  key={`${item.kind}-${item.label}`}
                  item={item}
                  styles={styles}
                  theme={theme}
                />
              ))}
            </View>
          ) : null}
        </View>
        <HeaderPhoto photo={personal.photo} styles={styles} theme={theme} />
      </View>
    </View>
  );
}
