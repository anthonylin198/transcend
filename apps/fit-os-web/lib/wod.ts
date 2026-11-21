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

export const wodCategories: { id: WodCategory; label: string }[] = [
  { id: "upper", label: "Upper" },
  { id: "lower", label: "Lower" },
  { id: "olympic", label: "Olympic" },
  { id: "endurance", label: "Endurance" },
];

export const wodCategoryLabels: Record<WodCategory, string> = {
  upper: "Upper",
  lower: "Lower",
  olympic: "Olympic",
  endurance: "Endurance",
};

export type StoredWod = {
  slug: string;
  title: string;
  category: WodCategory;
  date?: string;
  sections: WodSection[];
};

export type MovementPath = {
  sectionIndex: number;
  blockIndex: number;
  variantIndex?: number;
  movementIndex: number;
};

function replaceAt<T>(items: T[], index: number, next: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? next : item));
}

export function replaceMovement(
  sections: WodSection[],
  path: MovementPath,
  next: WodMovement,
): WodSection[] {
  return sections.map((section, sectionIndex) => {
    if (sectionIndex !== path.sectionIndex) return section;
    return {
      ...section,
      blocks: section.blocks.map((block, blockIndex) => {
        if (blockIndex !== path.blockIndex) return block;
        if (block.type === "movementList") {
          return {
            ...block,
            items: replaceAt(block.items, path.movementIndex, next),
          };
        }
        if (block.type === "movementComplex" || block.type === "alternative") {
          return {
            ...block,
            movements: replaceAt(block.movements, path.movementIndex, next),
          };
        }
        if (block.type === "variants" && path.variantIndex != null) {
          return {
            ...block,
            options: block.options.map((option, variantIndex) =>
              variantIndex === path.variantIndex
                ? {
                    ...option,
                    movements: replaceAt(
                      option.movements,
                      path.movementIndex,
                      next,
                    ),
                  }
                : option,
            ),
          };
        }
        return block;
      }),
    };
  });
}

export function blockSummary(block: WodBlock) {
  switch (block.type) {
    case "heading":
      return block.text;
    case "note":
      return block.text;
    case "protocol":
      return `${block.label} · ${block.format}`;
    case "score":
      return block.timeCapSeconds
        ? `${block.label} · ${Math.round(block.timeCapSeconds / 60)} min cap`
        : block.label;
    case "setTable":
      return `${block.columns.map((column) => column.label).join(" · ")}`;
    default:
      return null;
  }
}
