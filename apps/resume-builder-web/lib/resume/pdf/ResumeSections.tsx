import { Circle, Svg, Text, View } from "@react-pdf/renderer";
import type { ResumeTheme } from "../resumeTheme";
import type {
  CertificationItem,
  ExperienceItem,
  ResumeSection,
} from "../types";
import type { ResumeStyles } from "./styles";

function BulletMark({
  styles,
  theme,
}: {
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  const size = theme.spacing.bulletSize;
  return (
    <View style={styles.bulletGlyph}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={theme.colors.text}
        />
      </Svg>
    </View>
  );
}

function BulletList({
  bullets,
  styles,
  theme,
}: {
  bullets: string[];
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  if (bullets.length === 0) return null;

  return (
    <View style={styles.bulletList}>
      {bullets.map((bullet, index) => (
        <View
          key={`${bullet}-${index}`}
          style={
            index === bullets.length - 1
              ? [styles.bulletRow, { marginBottom: 0 }]
              : styles.bulletRow
          }
        >
          <BulletMark styles={styles} theme={theme} />
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

function EntryBlock({
  primary,
  secondary,
  location,
  date,
  bullets,
  isLast,
  styles,
  theme,
}: {
  primary: string;
  secondary?: string;
  location?: string;
  date?: string;
  bullets: string[];
  isLast: boolean;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  const dateOnFirstRow = Boolean(date) && !secondary && !location;
  const firstMeta = dateOnFirstRow ? date : location;
  const secondMeta = dateOnFirstRow ? undefined : date;
  const secondaryText = secondary ?? "";

  return (
    <View style={isLast ? styles.entryLast : styles.entry}>
      <View wrap={false} minPresenceAhead={theme.spacing.entryKeepWithNext}>
        <View style={styles.entryRow}>
          <Text style={styles.entryPrimary}>{primary}</Text>
          {firstMeta ? (
            <Text
              style={dateOnFirstRow ? styles.entryDate : styles.entryLocation}
            >
              {firstMeta}
            </Text>
          ) : null}
        </View>
        {secondaryText || secondMeta ? (
          <View style={styles.roleRow}>
            <Text style={styles.entrySecondary}>{secondaryText || " "}</Text>
            {secondMeta ? (
              <Text style={styles.entryDate}>{secondMeta}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <BulletList bullets={bullets} styles={styles} theme={theme} />
    </View>
  );
}

function ExperienceBlock({
  item,
  isLast,
  styles,
  theme,
}: {
  item: ExperienceItem;
  isLast: boolean;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  const roles =
    item.roles && item.roles.length > 0
      ? item.roles
      : item.position || item.date
        ? [{ position: item.position, date: item.date }]
        : [];

  return (
    <View style={isLast ? styles.entryLast : styles.entry}>
      <View wrap={false} minPresenceAhead={theme.spacing.entryKeepWithNext}>
        <View style={styles.entryRow}>
          <Text style={styles.entryPrimary}>{item.organization}</Text>
          {item.location ? (
            <Text style={styles.entryLocation}>{item.location}</Text>
          ) : null}
        </View>
        {roles.map((role, index) => {
          const position = role.position ?? "";
          if (!position && !role.date) return null;
          return (
            <View
              key={`${position}-${role.date ?? ""}-${index}`}
              style={styles.roleRow}
            >
              <Text style={styles.entrySecondary}>{position || " "}</Text>
              {role.date ? (
                <Text style={styles.entryDate}>{role.date}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
      <BulletList bullets={item.bullets} styles={styles} theme={theme} />
    </View>
  );
}

function certificationLabel(item: CertificationItem): string {
  const name = item.issuer ? `${item.name}, ${item.issuer}` : item.name;
  const details = [item.location, item.date].filter(Boolean).join(" — ");
  return details ? `${name} — ${details}` : name;
}

function CertificationCell({
  item,
  styles,
  theme,
}: {
  item: CertificationItem;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  return (
    <View style={styles.certCell} wrap={false}>
      <View style={[styles.bulletRow, { marginBottom: 0 }]}>
        <BulletMark styles={styles} theme={theme} />
        <Text style={styles.certText}>{certificationLabel(item)}</Text>
      </View>
      <BulletList bullets={item.bullets} styles={styles} theme={theme} />
    </View>
  );
}

function BulletColumns({
  bullets,
  styles,
  theme,
}: {
  bullets: string[];
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  const rows: string[][] = [];
  for (let index = 0; index < bullets.length; index += 2) {
    rows.push(bullets.slice(index, index + 2));
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={`bullets-${rowIndex}`} style={styles.certRow}>
          {row.map((bullet, index) => (
            <View
              key={`${bullet}-${index}`}
              style={styles.certCell}
              wrap={false}
            >
              <View style={[styles.bulletRow, { marginBottom: 0 }]}>
                <BulletMark styles={styles} theme={theme} />
                <Text style={styles.certText}>{bullet}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function SectionHeading({
  title,
  styles,
  theme,
}: {
  title: string;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  return (
    <View
      style={styles.sectionHeading}
      minPresenceAhead={theme.spacing.headingKeepWithNext}
      wrap={false}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function SectionEntries({
  section,
  styles,
  theme,
}: {
  section: ResumeSection;
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  if (section.type === "skills") {
    return (
      <View>
        {section.items.map((item, index) => (
          <View
            key={`${item.label}-${index}`}
            style={
              index === section.items.length - 1
                ? [styles.skillRow, { marginBottom: 0 }]
                : styles.skillRow
            }
          >
            <Text style={styles.skillLabel}>{item.label}</Text>
            <Text style={styles.skillValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (section.type === "education") {
    return (
      <View>
        {section.items.map((item, index) => (
          <EntryBlock
            key={`${item.institution}-${index}`}
            primary={item.institution}
            secondary={item.degree}
            location={item.location}
            date={item.date}
            bullets={item.bullets}
            isLast={index === section.items.length - 1}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>
    );
  }

  if (section.type === "experience") {
    return (
      <View>
        {section.items.map((item, index) => (
          <ExperienceBlock
            key={`${item.organization}-${index}`}
            item={item}
            isLast={index === section.items.length - 1}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>
    );
  }

  if (section.type === "projects") {
    return (
      <View>
        {section.items.map((item, index) => (
          <EntryBlock
            key={`${item.name}-${index}`}
            primary={item.name}
            location={item.location}
            date={item.date}
            bullets={item.bullets}
            isLast={index === section.items.length - 1}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>
    );
  }

  if (section.type === "summary") {
    return (
      <View>
        {section.items.map((item, index) => (
          <Text
            key={`${item.text}-${index}`}
            style={
              index === section.items.length - 1
                ? styles.summaryText
                : [styles.summaryText, { marginBottom: theme.spacing.entryGap }]
            }
          >
            {item.text}
          </Text>
        ))}
      </View>
    );
  }

  if (section.type === "certifications") {
    const rows: CertificationItem[][] = [];
    for (let index = 0; index < section.items.length; index += 2) {
      rows.push(section.items.slice(index, index + 2));
    }
    return (
      <View>
        {rows.map((row, rowIndex) => (
          <View key={`certs-${rowIndex}`} style={styles.certRow}>
            {row.map((item, index) => (
              <CertificationCell
                key={`${item.name}-${index}`}
                item={item}
                styles={styles}
                theme={theme}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {section.items.map((item, index) =>
        item.heading ? (
          <EntryBlock
            key={`${item.heading}-${index}`}
            primary={item.heading}
            secondary={item.subheading}
            location={item.location}
            date={item.date}
            bullets={item.bullets}
            isLast={index === section.items.length - 1}
            styles={styles}
            theme={theme}
          />
        ) : (
          <BulletColumns
            key={`bullets-${index}`}
            bullets={item.bullets}
            styles={styles}
            theme={theme}
          />
        ),
      )}
    </View>
  );
}

export function ResumeSections({
  sections,
  styles,
  theme,
}: {
  sections: ResumeSection[];
  styles: ResumeStyles;
  theme: ResumeTheme;
}) {
  return (
    <>
      {sections.map((section, index) => {
        if (section.items.length === 0) return null;
        return (
          <View
            key={`${section.type}-${section.title}-${index}`}
            style={styles.section}
          >
            <SectionHeading
              title={section.title}
              styles={styles}
              theme={theme}
            />
            <SectionEntries section={section} styles={styles} theme={theme} />
          </View>
        );
      })}
    </>
  );
}
