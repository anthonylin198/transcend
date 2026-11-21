import { v } from "convex/values";

export const wodCategory = v.union(
  v.literal("upper"),
  v.literal("lower"),
  v.literal("olympic"),
  v.literal("endurance"),
);

const wodWeight = v.object({
  male: v.number(),
  female: v.number(),
  unit: v.string(),
});

const wodMovement = v.object({
  name: v.string(),
  reps: v.optional(v.number()),
  perSide: v.optional(v.boolean()),
  repsPerSide: v.optional(v.number()),
  distance: v.optional(v.number()),
  unit: v.optional(v.string()),
  prescription: v.optional(v.string()),
  weight: v.optional(wodWeight),
});

const wodVariant = v.object({
  id: v.string(),
  label: v.string(),
  subtitle: v.optional(v.string()),
  movements: v.array(wodMovement),
});

export const wodBlock = v.union(
  v.object({
    type: v.literal("heading"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("movementList"),
    items: v.array(wodMovement),
  }),
  v.object({
    type: v.literal("protocol"),
    format: v.string(),
    label: v.string(),
    intervalSeconds: v.optional(v.number()),
    sets: v.optional(v.number()),
    rounds: v.optional(v.number()),
    targetSeconds: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      }),
    ),
    timeCapSeconds: v.optional(v.number()),
  }),
  v.object({
    type: v.literal("movementComplex"),
    label: v.optional(v.string()),
    movements: v.array(wodMovement),
  }),
  v.object({
    type: v.literal("setTable"),
    columns: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
      }),
    ),
    rows: v.array(v.record(v.string(), v.union(v.string(), v.number()))),
  }),
  v.object({
    type: v.literal("note"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("alternative"),
    label: v.string(),
    description: v.optional(v.string()),
    movements: v.array(wodMovement),
  }),
  v.object({
    type: v.literal("variants"),
    options: v.array(wodVariant),
  }),
  v.object({
    type: v.literal("score"),
    metric: v.string(),
    label: v.string(),
    timeCapSeconds: v.optional(v.number()),
  }),
);

export const wodSection = v.object({
  id: v.string(),
  type: v.string(),
  title: v.string(),
  blocks: v.array(wodBlock),
});

export const wodFields = {
  slug: v.string(),
  schemaVersion: v.number(),
  title: v.string(),
  category: wodCategory,
  date: v.optional(v.string()),
  sections: v.array(wodSection),
};

const MAX_TITLE_LENGTH = 180;
const MAX_SCHEDULE_DAYS = 84;

type Movement = {
  name: string;
  reps?: number;
  perSide?: boolean;
  repsPerSide?: number;
  distance?: number;
  unit?: string;
  prescription?: string;
  weight?: {
    male: number;
    female: number;
    unit: string;
  };
};

type Block = {
  type: string;
  items?: Movement[];
  movements?: Movement[];
  options?: { movements: Movement[] }[];
};

export function assertTitle(title: string) {
  const next = title.trim();
  if (!next) {
    throw new Error("Enter a workout title");
  }
  if (next.length > MAX_TITLE_LENGTH) {
    throw new Error("Title is too long");
  }
  return next;
}

export function assertDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Enter a valid date");
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Enter a valid date");
  }
  return value;
}

function assertFiniteNumber(value: number | undefined, label: string) {
  if (value === undefined) return;
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a number`);
  }
}

function cleanMovement(movement: Movement): Movement {
  const name = movement.name.trim();
  if (!name) {
    throw new Error("Enter a name for every movement");
  }
  assertFiniteNumber(movement.reps, "Reps");
  assertFiniteNumber(movement.repsPerSide, "Reps per side");
  assertFiniteNumber(movement.distance, "Distance");
  if (movement.weight) {
    assertFiniteNumber(movement.weight.male, "Weight");
    assertFiniteNumber(movement.weight.female, "Weight");
    if (!movement.weight.unit.trim()) {
      throw new Error("Enter a unit for the weight");
    }
  }
  return {
    ...movement,
    name,
    ...(movement.weight
      ? { weight: { ...movement.weight, unit: movement.weight.unit.trim() } }
      : {}),
  };
}

function cleanMovements(movements: Movement[] | undefined) {
  return movements?.map(cleanMovement);
}

export function cleanSections<T extends { blocks: Block[] }>(sections: T[]) {
  if (sections.length === 0) {
    throw new Error("A workout needs at least one section");
  }
  return sections.map((section) => ({
    ...section,
    blocks: section.blocks.map((block) => {
      if (block.type === "movementList") {
        return { ...block, items: cleanMovements(block.items) ?? [] };
      }
      if (block.type === "movementComplex" || block.type === "alternative") {
        return { ...block, movements: cleanMovements(block.movements) ?? [] };
      }
      if (block.type === "variants") {
        return {
          ...block,
          options: (block.options ?? []).map((option) => ({
            ...option,
            movements: cleanMovements(option.movements) ?? [],
          })),
        };
      }
      return block;
    }),
  }));
}

export function assertScheduleLength(length: number) {
  if (length < 1 || length > MAX_SCHEDULE_DAYS) {
    throw new Error("The schedule needs between 1 and 84 days");
  }
}
