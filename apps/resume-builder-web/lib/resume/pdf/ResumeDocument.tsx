import { Document, Font, Page } from "@react-pdf/renderer";
import type { ResumeTheme } from "../resumeTheme";
import type { Resume } from "../types";
import { ResumeHeader } from "./ResumeHeader";
import { ResumeSections } from "./ResumeSections";
import { createResumeStyles } from "./styles";

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.woff", fontWeight: 400 },
    { src: "/fonts/Inter-Italic.woff", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/Inter-Bold.woff", fontWeight: 700 },
    {
      src: "/fonts/Inter-BoldItalic.woff",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

const MAX_UNBROKEN_WORD = 40;

// Keep ordinary words intact. Only split very long tokens such as URLs
// so they wrap inside the margins instead of running off the page.
Font.registerHyphenationCallback((word) => {
  if (word.length <= MAX_UNBROKEN_WORD) return [word];
  const chunks: string[] = [];
  for (let index = 0; index < word.length; index += MAX_UNBROKEN_WORD) {
    chunks.push(word.slice(index, index + MAX_UNBROKEN_WORD));
  }
  return chunks;
});

export function ResumeDocument({
  resume,
  theme,
}: {
  resume: Resume;
  theme: ResumeTheme;
}) {
  const styles = createResumeStyles(theme);
  const name = resume.personal.name.trim() || "Resume";

  return (
    <Document
      title={`${name} Resume`}
      author={name}
      subject="Resume"
      language="en"
      creator="Resume Builder"
    >
      <Page size={theme.page.size} style={styles.page} wrap>
        <ResumeHeader
          personal={resume.personal}
          styles={styles}
          theme={theme}
        />
        <ResumeSections
          sections={resume.sections}
          styles={styles}
          theme={theme}
        />
      </Page>
    </Document>
  );
}
