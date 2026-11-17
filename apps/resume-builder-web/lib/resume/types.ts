/**
 * Normalized resume passed to the PDF template.
 * The editor keeps the raw JSON. Parsing accepts a slightly looser shape:
 * custom and unrecognized sections may use heading/name/title,
 * subheading/subtitle/position/role, location, date, and bullets.
 * An experience item can use position and date for one role, or a roles
 * array when several titles share one organization.
 * Section order in `sections` is the order on the page.
 */

export interface PersonalInfo {
  name: string;
  title?: string;
  /** Short line above the name, such as a department the resume is prepared for. */
  tagline?: string;
  location?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  /** Image URL. A placeholder is shown when this is empty. */
  photo?: string;
}

export interface EducationItem {
  institution: string;
  degree?: string;
  location?: string;
  date?: string;
  bullets: string[];
}

export interface SkillItem {
  label: string;
  value: string;
}

export interface ExperienceRole {
  position?: string;
  date?: string;
}

export interface ExperienceItem {
  organization: string;
  /** Single-role jobs can set these instead of `roles`. */
  position?: string;
  location?: string;
  date?: string;
  /** Several titles at one organization, most recent first. */
  roles?: ExperienceRole[];
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  location?: string;
  date?: string;
  bullets: string[];
}

export interface CertificationItem {
  name: string;
  issuer?: string;
  location?: string;
  date?: string;
  bullets: string[];
}

export interface SummaryItem {
  text: string;
}

export interface CustomItem {
  heading?: string;
  subheading?: string;
  location?: string;
  date?: string;
  bullets: string[];
}

export interface EducationSection {
  type: "education";
  title: string;
  items: EducationItem[];
}

export interface SkillsSection {
  type: "skills";
  title: string;
  items: SkillItem[];
}

export interface ExperienceSection {
  type: "experience";
  title: string;
  items: ExperienceItem[];
}

export interface ProjectsSection {
  type: "projects";
  title: string;
  items: ProjectItem[];
}

export interface CertificationsSection {
  type: "certifications";
  title: string;
  items: CertificationItem[];
}

export interface SummarySection {
  type: "summary";
  title: string;
  items: SummaryItem[];
}

export interface CustomSection {
  type: "custom";
  title: string;
  items: CustomItem[];
}

export type ResumeSection =
  | SummarySection
  | EducationSection
  | SkillsSection
  | ExperienceSection
  | ProjectsSection
  | CertificationsSection
  | CustomSection;

export interface Resume {
  personal: PersonalInfo;
  sections: ResumeSection[];
}
