export type WodWeight = {
  male: number;
  female: number;
  unit: string;
};

export type WodMovement = {
  name: string;
  reps?: number;
  perSide?: boolean;
  repsPerSide?: number;
  distance?: number;
  unit?: string;
  prescription?: string;
  weight?: WodWeight;
};

export type WodVariant = {
  id: string;
  label: string;
  subtitle?: string;
  movements: WodMovement[];
};

export type WodBlock =
  | { type: "heading"; text: string }
  | { type: "movementList"; items: WodMovement[] }
  | {
      type: "protocol";
      format: string;
      label: string;
      intervalSeconds?: number;
      sets?: number;
      rounds?: number;
      targetSeconds?: { min: number; max: number };
      timeCapSeconds?: number;
    }
  | { type: "movementComplex"; label?: string; movements: WodMovement[] }
  | {
      type: "setTable";
      columns: { key: string; label: string }[];
      rows: Record<string, string | number>[];
    }
  | { type: "note"; text: string }
  | {
      type: "alternative";
      label: string;
      description?: string;
      movements: WodMovement[];
    }
  | { type: "variants"; options: WodVariant[] }
  | {
      type: "score";
      metric: string;
      label: string;
      timeCapSeconds?: number;
    };

export type WodSection = {
  id: string;
  type: string;
  title: string;
  blocks: WodBlock[];
};

export type WodCategory = "upper" | "lower" | "olympic" | "endurance";

export const wodCategoryLabels: Record<WodCategory, string> = {
  upper: "Upper",
  lower: "Lower",
  olympic: "Olympic",
  endurance: "Endurance",
};

export type Wod = {
  schemaVersion: number;
  id: string;
  title: string;
  category: WodCategory;
  date?: string;
  sections: WodSection[];
};

export function formatWodDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function toWod(doc: {
  schemaVersion: number;
  slug: string;
  title: string;
  category: WodCategory;
  date?: string;
  sections: WodSection[];
}): Wod {
  return {
    schemaVersion: doc.schemaVersion,
    id: doc.slug,
    title: doc.title,
    category: doc.category,
    date: doc.date,
    sections: doc.sections,
  };
}
