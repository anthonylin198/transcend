/**
 * Visual settings for the resume PDF.
 *
 * Sizes are in points (72 points = 1 inch). Line heights are unitless
 * multipliers of the font size. Edit this file to restyle the resume;
 * resume content stays in the JSON editor.
 *
 * Inter is registered in the PDF document (regular, italic, and bold).
 * The files live in public/fonts so the preview and the download embed
 * the same family.
 */

export interface ResumeTheme {
  page: {
    size: "LETTER" | "A4" | "LEGAL";
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
  };
  colors: {
    primary: string;
    text: string;
    divider: string;
    separator: string;
    icon: string;
  };
  typography: {
    fontFamily: string;
    nameSize: number;
    titleSize: number;
    titleLetterSpacing: number;
    sectionHeadingSize: number;
    sectionLetterSpacing: number;
    bodySize: number;
    smallSize: number;
    entryTitleSize: number;
    /** Job titles under an organization. */
    roleSize: number;
    /** Italic locations and dates. */
    metaSize: number;
    subtitleLetterSpacing: number;
    lineHeight: number;
    tightLineHeight: number;
  };
  spacing: {
    nameGap: number;
    titleGap: number;
    headerBottom: number;
    sectionGap: number;
    sectionTitleGap: number;
    sectionRuleGap: number;
    ruleThickness: number;
    entryGap: number;
    /** Space between a company line and each role line under it. */
    roleGap: number;
    bulletGap: number;
    certRowGap: number;
    bulletIndent: number;
    bulletWidth: number;
    bulletSize: number;
    bulletOffset: number;
    bulletListTop: number;
    skillsLabelWidth: number;
    skillsRowGap: number;
    contactIconSize: number;
    contactIconGap: number;
    contactSeparatorGap: number;
    contactItemGap: number;
    photoSize: number;
    /** Keep a section heading with the entry that follows it. */
    headingKeepWithNext: number;
    /** Keep an entry heading with the first lines of its body. */
    entryKeepWithNext: number;
  };
}

export const resumeTheme = {
  page: {
    size: "LETTER",
    marginTop: 28,
    marginBottom: 32,
    marginLeft: 42,
    marginRight: 42,
  },
  colors: {
    primary: "#C41230",
    text: "#000000",
    divider: "#3A3A3A",
    separator: "#8A8A8A",
    icon: "#000000",
  },
  typography: {
    fontFamily: "Inter",
    nameSize: 22,
    titleSize: 8.5,
    titleLetterSpacing: 1.15,
    sectionHeadingSize: 13,
    sectionLetterSpacing: 0.1,
    bodySize: 10,
    smallSize: 9,
    entryTitleSize: 11,
    roleSize: 10,
    metaSize: 9,
    subtitleLetterSpacing: 0,
    lineHeight: 1.22,
    tightLineHeight: 1.15,
  },
  spacing: {
    nameGap: 2,
    titleGap: 5,
    headerBottom: 4,
    sectionGap: 9,
    sectionTitleGap: 3,
    sectionRuleGap: 7,
    ruleThickness: 0.8,
    entryGap: 8,
    roleGap: 1,
    bulletGap: 2,
    certRowGap: 1,
    bulletIndent: 2,
    bulletWidth: 12,
    bulletSize: 3,
    bulletOffset: 3.6,
    bulletListTop: 2,
    skillsLabelWidth: 74,
    skillsRowGap: 1,
    contactIconSize: 9,
    contactIconGap: 4,
    contactSeparatorGap: 6,
    contactItemGap: 12,
    photoSize: 52,
    headingKeepWithNext: 70,
    entryKeepWithNext: 42,
  },
} satisfies ResumeTheme;
