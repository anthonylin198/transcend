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

export const wods: Wod[] = [
  {
    schemaVersion: 1,
    id: "missing-monocle",
    title: "Missing Monocle: Chest Strength + Cardio/Core Circuit",
    category: "upper",
    date: "2026-09-03",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Bench Press",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 5 Sets",
            intervalSeconds: 120,
            sets: 5,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 7,
                percentage: 70,
              },
              {
                set: 2,
                reps: 5,
                percentage: 75,
              },
              {
                set: 3,
                reps: 3,
                percentage: 80,
              },
              {
                set: 4,
                reps: 5,
                percentage: 75,
              },
              {
                set: 5,
                reps: 3,
                percentage: 80,
              },
            ],
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Missing Monocle",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "16-Minute Alternating EMOM",
            intervalSeconds: 60,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Minute 1 · Echo Bike",
                    prescription: "16/12 cal",
                  },
                  {
                    name: "Minute 2 · Push-Ups",
                    prescription: "20/15",
                  },
                  {
                    name: "Minute 3 · Floor Leg Raises",
                    reps: 20,
                    prescription: "Replaces GHD sit-ups",
                  },
                  {
                    name: "Minute 4 · Rest",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Minute 1 · Echo Bike",
                    prescription: "15/11 cal",
                  },
                  {
                    name: "Minute 2 · Push-Ups",
                    prescription: "15/12",
                  },
                  {
                    name: "Minute 3 · Floor Leg Raises",
                    reps: 15,
                    prescription: "Replaces GHD or med-ball sit-ups",
                  },
                  {
                    name: "Minute 4 · Rest",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Minute 1 · Burpees",
                    reps: 12,
                  },
                  {
                    name: "Minute 2 · Push-Ups",
                    prescription: "12/10, or knee push-ups",
                  },
                  {
                    name: "Minute 3 · Floor Leg Raises or Sit-Ups",
                    reps: 20,
                  },
                  {
                    name: "Minute 4 · Rest",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds completed",
          },
          {
            type: "note",
            text: "4 rounds. Work for 50 seconds each minute, then rest through the remainder of that minute.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "looney-toons",
    title: "Looney Toons: Leg Strength + Kettlebell Conditioning Circuit",
    category: "lower",
    date: "2026-09-04",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 4 Sets",
            intervalSeconds: 180,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 8,
                percentage: "67–72%",
              },
              {
                set: 2,
                reps: 8,
                percentage: "67–72%",
              },
              {
                set: 3,
                reps: 8,
                percentage: "67–72%",
              },
              {
                set: 4,
                reps: 8,
                percentage: "67–72%",
              },
            ],
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Looney Toons",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "3 Rounds For Time",
            rounds: 3,
            targetSeconds: {
              min: 600,
              max: 780,
            },
            timeCapSeconds: 900,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 21,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Single-Arm KB Overhead Lunges",
                    reps: 14,
                    repsPerSide: 7,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 21,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Single-Arm KB Overhead Lunges",
                    reps: 14,
                    repsPerSide: 7,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 300,
                    unit: "m",
                  },
                  {
                    name: "Jump Squats",
                    reps: 21,
                  },
                  {
                    name: "Alternating Reverse Lunges",
                    reps: 14,
                    repsPerSide: 7,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "Go Hard and Standard are the same workout.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "team-badger",
    title: "Team Badger: Weekend Team Workout — Full-Body Strength + Running",
    category: "endurance",
    date: "2026-09-07",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Team Badger",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "3 Rounds For Time · Teams of 2",
            rounds: 3,
            timeCapSeconds: 2700,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Squat Cleans",
                    reps: 40,
                    weight: {
                      male: 95,
                      female: 65,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Pull-Ups",
                    reps: 40,
                  },
                  {
                    name: "Run",
                    distance: 800,
                    unit: "m",
                    prescription: "CFCH style",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Squat Cleans",
                    reps: 40,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Pull-Ups",
                    reps: 40,
                  },
                  {
                    name: "Run",
                    distance: 800,
                    unit: "m",
                    prescription: "CFCH style",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Jump Squats",
                    reps: 40,
                  },
                  {
                    name: "Prone Reverse Snow Angels",
                    reps: 40,
                  },
                  {
                    name: "Run",
                    distance: 600,
                    unit: "m",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 2700,
          },
          {
            type: "note",
            text: "Share the reps between partners and follow the gym's CFCH-style run instructions.",
          },
          {
            type: "note",
            text: "In honor of U.S. Navy Chief Petty Officer Mark Carter, who died during combat operations in Iraq on December 11, 2007.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "jamais-vu",
    title: "Jamais Vu: Squat Strength + Full-Body Thruster Circuit",
    category: "lower",
    date: "2026-09-08",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Front Squat + Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–3",
                lift: "Front Squat",
                reps: 3,
                percentage: "75% front squat",
              },
              {
                set: "4–6",
                lift: "Back Squat",
                reps: 3,
                percentage: "70% back squat",
              },
            ],
          },
          {
            type: "note",
            text: "Go straight into the back squats after the three front-squat sets.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Jamais Vu",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "15-12-9 Reps For Time",
            targetSeconds: {
              min: 420,
              max: 660,
            },
            timeCapSeconds: 720,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Single-Arm KB Thrusters — Right",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "15-12-9",
                  },
                  {
                    name: "Burpees to 6-inch Reach",
                    prescription: "15-12-9",
                  },
                  {
                    name: "Single-Arm KB Thrusters — Left",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "15-12-9",
                  },
                  {
                    name: "Burpees to 6-inch Reach",
                    prescription: "15-12-9",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Single-Arm KB Thrusters — Right",
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "15-12-9",
                  },
                  {
                    name: "Burpees to 6-inch Reach",
                    prescription: "15-12-9",
                  },
                  {
                    name: "Single-Arm KB Thrusters — Left",
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "15-12-9",
                  },
                  {
                    name: "Burpees to 6-inch Reach",
                    prescription: "15-12-9",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Right-Leg Split Squat with Overhead Reach",
                    prescription: "12-9-6",
                  },
                  {
                    name: "Burpees",
                    prescription: "12-9-6",
                  },
                  {
                    name: "Left-Leg Split Squat with Overhead Reach",
                    prescription: "12-9-6",
                  },
                  {
                    name: "Burpees",
                    prescription: "12-9-6",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 720,
          },
          {
            type: "note",
            text: "No Equipment is 12-9-6, not 15-12-9.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "doppelganger",
    title: "Doppelgänger: Full-Body Conditioning + Core & Kettlebell Circuit",
    category: "endurance",
    date: "2026-09-09",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Doppelgänger",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "Two Parts For Time",
            targetSeconds: {
              min: 480,
              max: 600,
            },
            timeCapSeconds: 660,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Part A · Run",
                    distance: 1000,
                    unit: "m",
                  },
                  {
                    name: "Part A · Floor Leg Raises",
                    reps: 50,
                    prescription: "Replaces GHD sit-ups",
                  },
                  {
                    name: "Part A · Kettlebell Swings",
                    reps: 50,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Part B · Echo Bike",
                    prescription: "45/40 cal, replaces a 1000/900m row",
                  },
                  {
                    name: "Part B · Sit-Ups",
                    reps: 50,
                  },
                  {
                    name: "Part B · Alternating DB Snatches",
                    reps: 50,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Part A · Run",
                    distance: 800,
                    unit: "m",
                  },
                  {
                    name: "Part A · Floor Leg Raises or V-Ups",
                    reps: 40,
                    prescription: "Replaces GHD sit-ups",
                  },
                  {
                    name: "Part A · Kettlebell Swings",
                    reps: 40,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Part B · Echo Bike",
                    prescription: "35/30 cal, replaces an 800/700m row",
                  },
                  {
                    name: "Part B · Sit-Ups",
                    reps: 40,
                  },
                  {
                    name: "Part B · Alternating DB Snatches",
                    reps: 40,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Part A · Run",
                    distance: 600,
                    unit: "m",
                  },
                  {
                    name: "Part A · Sit-Ups",
                    reps: 30,
                  },
                  {
                    name: "Part A · Jump Squats",
                    reps: 30,
                  },
                  {
                    name: "Part B · Run",
                    distance: 600,
                    unit: "m",
                  },
                  {
                    name: "Part B · Sit-Ups",
                    reps: 30,
                  },
                  {
                    name: "Part B · Burpees",
                    reps: 30,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Time for each part",
          },
          {
            type: "note",
            text: "24 minutes total. The 8–10 minute target and 11-minute cap are for each part. Start Part B at 12:00 and rest with whatever time is left after Part A. Echo bike calories replace the row.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "familiar-stranger",
    title:
      "Familiar Stranger: Weekend Team Workout — Full-Body Power + Leg Conditioning",
    category: "endurance",
    date: "2026-09-12",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Familiar Stranger",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "6 Rounds For Time · Teams of 2",
            rounds: 6,
            targetSeconds: {
              min: 1500,
              max: 1800,
            },
            timeCapSeconds: 2100,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                    prescription: "CFCH style",
                  },
                  {
                    name: "Hang Power Snatches",
                    reps: 32,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Barbell Back-Rack Step-Ups",
                    reps: 32,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription: "24/20-inch box",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                    prescription: "CFCH style",
                  },
                  {
                    name: "Hang Power Snatches",
                    reps: 28,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Barbell Back-Rack Step-Ups",
                    reps: 28,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                    prescription: "24/20-inch box",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Burpees",
                    reps: 16,
                  },
                  {
                    name: "Alternating Reverse Lunges",
                    reps: 32,
                    repsPerSide: 16,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 2100,
          },
          {
            type: "note",
            text: "Share the reps between partners and follow the gym's CFCH-style run instructions.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "fore",
    title: "Fore!: Heavy Leg Strength + Kettlebell/Core Circuit",
    category: "lower",
    date: "2026-09-14",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 3,
                percentage: 80,
              },
              {
                set: 2,
                reps: 3,
                percentage: 80,
              },
              {
                set: 3,
                reps: 3,
                percentage: 80,
              },
              {
                set: 4,
                reps: 2,
                percentage: "80%+",
              },
              {
                set: 5,
                reps: 2,
                percentage: "80%+",
              },
              {
                set: 6,
                reps: 2,
                percentage: 85,
              },
            ],
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Fore!",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time · 3 Rounds After Buy-In",
            targetSeconds: {
              min: 420,
              max: 600,
            },
            timeCapSeconds: 720,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Buy-In · Echo Bike",
                    prescription: "33/24 cal",
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 21,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Sit-Ups",
                    reps: 21,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Buy-In · Echo Bike",
                    prescription: "33/24 cal",
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 21,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Sit-Ups",
                    reps: 21,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Buy-In · Burpees",
                    reps: 20,
                  },
                  {
                    name: "Jump Squats",
                    reps: 15,
                  },
                  {
                    name: "Sit-Ups",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 720,
          },
          {
            type: "note",
            text: "Go Hard and Standard are the same workout. The time includes the buy-in.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "in-the-rough",
    title: "In the Rough: Olympic Lifting Power + Shoulders & Full-Body AMRAP",
    category: "olympic",
    date: "2026-09-16",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Power Clean + Push Jerk",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 5 Sets",
            intervalSeconds: 180,
            sets: 5,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                lift: "3 Power Cleans + 3 Push Jerks",
                percentage: "70–75%",
              },
              {
                set: 2,
                lift: "3 Power Cleans + 3 Push Jerks",
                percentage: "70–75%",
              },
              {
                set: 3,
                lift: "3 Power Cleans + 3 Push Jerks",
                percentage: "70–75%",
              },
              {
                set: 4,
                lift: "3 Power Cleans + 3 Push Jerks",
                percentage: "70–75%",
              },
              {
                set: 5,
                lift: "3 Power Cleans + 3 Push Jerks",
                percentage: "70–75%",
              },
            ],
          },
          {
            type: "note",
            text: "Use about 70–75% of your clean and jerk, or a hard weight you can still control.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "In the Rough",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "7-Minute AMRAP",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Power Cleans",
                    reps: 3,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Push Jerks",
                    reps: 5,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Lateral Bar-Over Burpees",
                    reps: 7,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Power Cleans",
                    reps: 3,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Push Jerks",
                    reps: 5,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Lateral Bar-Over Burpees",
                    reps: 7,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Broad Jumps",
                    reps: 3,
                  },
                  {
                    name: "Pike Push-Ups",
                    reps: 5,
                  },
                  {
                    name: "Lateral Line-Over Burpees",
                    reps: 7,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Target is 6 or more rounds.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-back-nine",
    title: "The Back Nine: Core & Grip Strength + Cardio Endurance Circuit",
    category: "endurance",
    date: "2026-09-17",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Back Nine",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E6:30 x 5 Rounds",
            intervalSeconds: 390,
            rounds: 5,
            targetSeconds: {
              min: 300,
              max: 330,
            },
            timeCapSeconds: 330,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "18/15 cal, replaces a 300/250m row",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 15,
                    prescription: "Replaces toes-to-bar",
                  },
                  {
                    name: "Run",
                    distance: 300,
                    unit: "m",
                  },
                  {
                    name: "Double-KB Farmer's Carry",
                    reps: 12,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription:
                      "Each dumbbell. Carry distance was not in the source.",
                  },
                  {
                    name: "Double Unders",
                    reps: 50,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "15/12 cal, replaces a 250/200m row",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 10,
                    prescription: "Replaces toes-to-bar",
                  },
                  {
                    name: "Run",
                    distance: 300,
                    unit: "m",
                  },
                  {
                    name: "Double-KB Farmer's Carry",
                    reps: 12,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription:
                      "Each dumbbell. Carry distance was not in the source.",
                  },
                  {
                    name: "Double Unders",
                    reps: 35,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 15,
                  },
                  {
                    name: "V-Ups or Floor Leg Raises",
                    reps: 10,
                  },
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Bear Crawl Steps",
                    reps: 20,
                  },
                  {
                    name: "Lateral Line Hops",
                    reps: 50,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Slowest round",
          },
          {
            type: "note",
            text: "Rest until the next 6:30 start. Echo bike calories replace the row.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-yips",
    title: "The Yips: Deadlift & Chest Strength + Shoulder/Core Circuit",
    category: "lower",
    date: "2026-09-18",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Inchworms",
                reps: 5,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Deadlift + Bench Press",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "Every 90 Seconds x 8 Sets",
            intervalSeconds: 90,
            sets: 8,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                lift: "Deadlift",
                reps: 4,
                percentage: 70,
              },
              {
                set: 2,
                lift: "Bench Press",
                reps: 8,
                percentage: "60–65%",
              },
              {
                set: 3,
                lift: "Deadlift",
                reps: 4,
                percentage: "70%+",
              },
              {
                set: 4,
                lift: "Bench Press",
                reps: 7,
                percentage: "65–70%",
              },
              {
                set: 5,
                lift: "Deadlift",
                reps: 4,
                percentage: "70%+",
              },
              {
                set: 6,
                lift: "Bench Press",
                reps: 7,
                percentage: "70–75%",
              },
              {
                set: 7,
                lift: "Deadlift",
                reps: 4,
                percentage: 75,
              },
              {
                set: 8,
                lift: "Bench Press",
                reps: 6,
                percentage: "75%+",
              },
            ],
          },
          {
            type: "note",
            text: "Score the total combined load the way your gym directs. Deadlift and bench alternate.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Yips",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "5 Rounds For Time",
            rounds: 5,
            targetSeconds: {
              min: 480,
              max: 600,
            },
            timeCapSeconds: 600,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Wall Walk Complex",
                    reps: 1,
                  },
                  {
                    name: "Alternating DB Snatches",
                    reps: 8,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Wall Walk Complex",
                    reps: 1,
                  },
                  {
                    name: "Alternating DB Snatches",
                    reps: 8,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Inchworm Push-Up Complex",
                    reps: 1,
                  },
                  {
                    name: "Jump Squats with Overhead Reach",
                    reps: 8,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 600,
          },
          {
            type: "note",
            text: "One wall-walk complex is 1 wall walk, 2 push-ups, 1 wall walk, 3 push-ups, 1 wall walk. Start prone with your feet toward the wall, walk your feet up as your hands move toward the wall, then return to the floor. Push-ups are on the floor. The inchworm complex is 1 inchworm push-up, 1 burpee, 1 inchworm push-up, 2 burpees, 1 inchworm push-up.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "best-ball",
    title:
      "Best Ball: Weekend Team Workout — Full-Body Conditioning + Pull-Ups & Thrusters",
    category: "endurance",
    date: "2026-09-19",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Best Ball",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "24-Minute AMRAP · Teams of 2",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "10/8 cal",
                  },
                  {
                    name: "Chest-to-Bar Pull-Ups",
                    reps: 8,
                  },
                  {
                    name: "Light DB Thrusters",
                    reps: 10,
                    prescription:
                      "Replaces 20/14 lb wall balls to a 10/9-foot target",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "10/8 cal",
                  },
                  {
                    name: "Pull-Ups",
                    reps: 8,
                  },
                  {
                    name: "Light DB Thrusters",
                    reps: 10,
                    prescription:
                      "Replaces 20/14 lb wall balls to a 10/9-foot target",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 10,
                  },
                  {
                    name: "Prone Reverse Snow Angels",
                    reps: 10,
                  },
                  {
                    name: "Squat Jumps with Overhead Reach",
                    reps: 10,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Combined rounds + reps",
          },
          {
            type: "note",
            text: "Target is 16 total rounds, 8 per partner. One partner completes a full round while the other rests, then they switch. Each partner has 1:30 to finish a round. Choose a dumbbell you can keep unbroken. The source does not prescribe a dumbbell weight.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "ambush",
    title: "Ambush: Snatch & Overhead Squat Strength + Full-Body Conditioning",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Overhead Squats",
                reps: 10,
                prescription: "PVC",
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Power Snatch + Overhead Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                lift: "1 Power Snatch + 2 Overhead Squats",
                percentage: 70,
              },
              {
                set: 2,
                lift: "1 Power Snatch + 2 Overhead Squats",
                percentage: 70,
              },
              {
                set: 3,
                lift: "1 Power Snatch + 2 Overhead Squats",
                percentage: 75,
              },
              {
                set: 4,
                lift: "1 Power Snatch + 2 Overhead Squats",
                percentage: 75,
              },
              {
                set: 5,
                lift: "1 Power Snatch + 2 Overhead Squats",
                percentage: 80,
              },
              {
                set: 6,
                lift: "1 Power Snatch + 2 Overhead Squats",
                percentage: 80,
              },
            ],
          },
          {
            type: "note",
            text: "No seated box jumps. Percentages are based on the limiting lift.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Ambush",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "10 Rounds For Time",
            rounds: 10,
            targetSeconds: {
              min: 660,
              max: 840,
            },
            timeCapSeconds: 900,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Power Snatches",
                    reps: 3,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hand-Release Push-Ups",
                    reps: 6,
                  },
                  {
                    name: "Double Unders",
                    reps: 30,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Power Snatches",
                    reps: 3,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hand-Release Push-Ups",
                    reps: 6,
                  },
                  {
                    name: "Double Unders",
                    reps: 30,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees with Overhead Reach",
                    reps: 3,
                  },
                  {
                    name: "Hand-Release Push-Ups",
                    reps: 6,
                  },
                  {
                    name: "Lateral Line Hops",
                    reps: 30,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "The first 3 intervals are 2:15 of work and 0:45 of rest. After that, finish the remaining rounds with no required rest. The clock includes those rests.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "fight-or-flight",
    title:
      "Fight or Flight: Power Clean Strength + Explosive Leg & Cardio Circuit",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Pogo Jumps",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Power Clean",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 5 Sets",
            intervalSeconds: 150,
            sets: 5,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 2,
                percentage: 70,
              },
              {
                set: 2,
                reps: 2,
                percentage: 75,
              },
              {
                set: 3,
                reps: 2,
                percentage: 80,
              },
              {
                set: 4,
                reps: 2,
                percentage: 80,
              },
              {
                set: 5,
                reps: 2,
                percentage: 85,
              },
            ],
          },
          {
            type: "note",
            text: "Two power cleans each set.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Fight or Flight",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time",
            targetSeconds: {
              min: 420,
              max: 660,
            },
            timeCapSeconds: 720,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Burpee Box Jump Overs",
                    reps: 20,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Echo Bike",
                    prescription: "26/21 cal, replaces 32/26 BikeErg calories",
                  },
                  {
                    name: "Burpee Box Jump Overs",
                    reps: 20,
                    prescription: "24/20-inch box",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Burpee Box Jump Overs",
                    reps: 16,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Echo Bike",
                    prescription: "21/17 cal, replaces 26/21 BikeErg calories",
                  },
                  {
                    name: "Burpee Box Jump Overs",
                    reps: 16,
                    prescription: "24/20-inch box",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Burpee Broad Jumps",
                    reps: 12,
                  },
                  {
                    name: "Alternating Reverse Lunges",
                    reps: 40,
                    repsPerSide: 20,
                  },
                  {
                    name: "Burpee Broad Jumps",
                    reps: 12,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 720,
          },
          {
            type: "note",
            text: "Echo bike calories are an estimate of the BikeErg targets.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-chase",
    title: "The Chase: Leg Strength + Back/Core Conditioning Circuit",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 4 Sets",
            intervalSeconds: 180,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 6,
                percentage: 72,
              },
              {
                set: 2,
                reps: 6,
                percentage: 74,
              },
              {
                set: 3,
                reps: 6,
                percentage: 75,
              },
              {
                set: 4,
                reps: 6,
                percentage: 77,
              },
            ],
          },
          {
            type: "note",
            text: "The source is 6 reps at 72–77%. This table is a suggested build.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Chase",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "3 × 5-Minute AMRAPs",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Pull-Ups",
                    reps: 12,
                  },
                  {
                    name: "Sit-Ups",
                    reps: 15,
                  },
                  {
                    name: "Air Squats",
                    reps: 18,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Pull-Ups",
                    reps: 9,
                  },
                  {
                    name: "Sit-Ups",
                    reps: 15,
                  },
                  {
                    name: "Air Squats",
                    reps: 18,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Superman Pull-Downs",
                    reps: 12,
                  },
                  {
                    name: "Sit-Ups",
                    reps: 12,
                  },
                  {
                    name: "Air Squats",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Target is about 9 total rounds. Work 0:00–5:00, rest until 6:00, work until 11:00, rest until 12:00, then work until 17:00. Continue where you stopped instead of starting the sequence over. Pull-ups are regular pull-ups, not chest-to-bar.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "natural-selection",
    title: "Natural Selection: Deadlift Strength + Shoulder & Cardio Endurance",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pike Push-Ups",
                reps: 8,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Natural Selection",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "20-Minute AMRAP",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "40/32 cal, replaces a 50/40 cal row",
                  },
                  {
                    name: "Deadlifts",
                    reps: 35,
                    weight: {
                      male: 205,
                      female: 145,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Strict Handstand Push-Ups",
                    reps: 20,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "35/28 cal, replaces a 45/35 cal row",
                  },
                  {
                    name: "Deadlifts",
                    reps: 30,
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Strict Handstand Push-Ups",
                    reps: 15,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 25,
                  },
                  {
                    name: "Alternating Single-Leg Romanian Deadlifts",
                    reps: 30,
                    repsPerSide: 15,
                  },
                  {
                    name: "Pike Push-Ups",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Target is 3 rounds. Pike push-ups stand in for the handstand push-ups when you have no wall. Echo bike calories are estimates, not the original row.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "apex",
    title: "Apex: Chest Strength + Leg/Core Conditioning Circuit",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Bench Press",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 3,
                percentage: 80,
              },
              {
                set: 2,
                reps: 3,
                percentage: 80,
              },
              {
                set: 3,
                reps: 3,
                percentage: 82,
              },
              {
                set: 4,
                reps: 2,
                percentage: 82,
              },
              {
                set: 5,
                reps: 2,
                percentage: 85,
              },
              {
                set: 6,
                reps: 2,
                percentage: 85,
              },
            ],
          },
          {
            type: "note",
            text: "The source is 3-3-3-2-2-2 at 80–85%. This table is a suggested build.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Apex",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time",
            targetSeconds: {
              min: 480,
              max: 720,
            },
            timeCapSeconds: 840,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Light DB Thrusters",
                    reps: 50,
                    prescription: "Replaces 20/14 lb wall balls",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 30,
                    prescription: "Replaces toes-to-bar",
                  },
                  {
                    name: "Double-KB Front-Rack Walking Lunges",
                    reps: 2,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 20,
                  },
                  {
                    name: "Double-KB Front-Rack Walking Lunges",
                    reps: 2,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 10,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Light DB Thrusters",
                    reps: 40,
                    prescription: "Replaces 20/14 lb wall balls",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 24,
                  },
                  {
                    name: "Double-KB Front-Rack Walking Lunges",
                    reps: 2,
                    weight: {
                      male: 35,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 16,
                  },
                  {
                    name: "Double-KB Front-Rack Walking Lunges",
                    reps: 2,
                    weight: {
                      male: 35,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 8,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Jump Squats with Overhead Reach",
                    reps: 30,
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 20,
                  },
                  {
                    name: "Alternating Walking Lunges",
                    reps: 20,
                    repsPerSide: 10,
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 15,
                  },
                  {
                    name: "Alternating Walking Lunges",
                    reps: 20,
                    repsPerSide: 10,
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 5,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 840,
          },
          {
            type: "note",
            text: "Light dumbbell thrusters replace wall balls, and floor leg raises replace toes-to-bar. Pick a dumbbell you can manage. The source does not prescribe that dumbbell weight.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "interlocked",
    title: "Interlocked: Clean & Jerk Strength + Full-Body Thruster Circuit",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Power Clean + Jerk",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                lift: "1 Power Clean + Jerk",
                percentage: 70,
              },
              {
                set: 2,
                lift: "1 Power Clean + Jerk",
                percentage: 75,
              },
              {
                set: 3,
                lift: "1 Power Clean + Jerk",
                percentage: 75,
              },
              {
                set: 4,
                lift: "1 Power Clean + Jerk",
                percentage: 80,
              },
              {
                set: 5,
                lift: "1 Power Clean + Jerk",
                percentage: 80,
              },
              {
                set: 6,
                lift: "1 Power Clean + Jerk",
                percentage: 85,
              },
            ],
          },
          {
            type: "note",
            text: "Build to heavy, not a max. The front squat is omitted. Percentages are based on the limiting lift.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Interlocked",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "5 Rounds For Time",
            rounds: 5,
            targetSeconds: {
              min: 780,
              max: 960,
            },
            timeCapSeconds: 1020,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Barbell Thrusters",
                    reps: 10,
                    weight: {
                      male: 95,
                      female: 65,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Alternating DB Snatches",
                    reps: 20,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Burpee Pull-Ups",
                    reps: 10,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Barbell Thrusters",
                    reps: 10,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Alternating DB Snatches",
                    reps: 20,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Burpee Pull-Ups",
                    reps: 10,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Jump Squats with Overhead Reach",
                    reps: 10,
                  },
                  {
                    name: "Alternating Jumping Lunges",
                    reps: 16,
                    repsPerSide: 8,
                  },
                  {
                    name: "Burpees",
                    reps: 8,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 1020,
          },
          {
            type: "note",
            text: "Steel Competitor is a separate option: 115/75 lb thrusters and chest-to-bar instead of burpee pull-ups. Do not substitute these into Go Hard.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "double-helix",
    title: "Double Helix: Shoulder & Core Strength + Cardio Endurance Circuit",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Floor Leg Raises",
                reps: 10,
              },
              {
                name: "Inchworms",
                reps: 5,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Double Helix",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "Two Parts For Time · 3 Rounds Each",
            targetSeconds: {
              min: 480,
              max: 660,
            },
            timeCapSeconds: 840,
          },
          {
            type: "note",
            text: "Steel Part A was cut off in the source and is not included. Use Standard Part A until those details are available. Start Part B at 15:00. If Part A hits the 14-minute cap, rest up to 1 minute before Part B.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Part B · Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Part B · Floor Leg Raises",
                    reps: 20,
                    prescription: "Replaces toes-to-bar",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Part A · Echo Bike",
                    prescription: "25/22 cal, replaces a 500/450m row",
                  },
                  {
                    name: "Part A · Wall Walks",
                    reps: 4,
                  },
                  {
                    name: "Part B · Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Part B · Floor Leg Raises",
                    reps: 15,
                    prescription: "Replaces toes-to-bar",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Part A · Burpees",
                    reps: 15,
                  },
                  {
                    name: "Part A · Inchworm Push-Ups",
                    reps: 5,
                  },
                  {
                    name: "Part B · Run",
                    distance: 300,
                    unit: "m",
                  },
                  {
                    name: "Part B · Floor Leg Raises",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Time for each part",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "tangled",
    title: "Tangled: Heavy Deadlift Strength + Explosive Leg Circuit",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Single-Leg Romanian Deadlifts",
                reps: 10,
                perSide: true,
                prescription: "Bodyweight",
              },
              {
                name: "Pogo Jumps",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Deadlift",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 4 Sets",
            intervalSeconds: 150,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 4,
                percentage: 80,
              },
              {
                set: 2,
                reps: 3,
                percentage: 82,
              },
              {
                set: 3,
                reps: 2,
                percentage: 85,
              },
              {
                set: 4,
                reps: 2,
                percentage: 85,
              },
            ],
          },
          {
            type: "note",
            text: "The source is 4-3-2-2, each set at 80–85%.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Tangled",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "Two Parts For Time",
            targetSeconds: {
              min: 420,
              max: 660,
            },
            timeCapSeconds: 780,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Part A · Deadlifts",
                    prescription: "9-7-5 · 315/205 lb",
                  },
                  {
                    name: "Part A · Box Jumps",
                    prescription: "9-7-5 · 30/24-inch box",
                  },
                  {
                    name: "Part B · Deadlifts",
                    prescription: "15-12-9 · 225/155 lb",
                  },
                  {
                    name: "Part B · Box Jumps",
                    prescription: "15-12-9 · 24/20-inch box",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Part A · Deadlifts",
                    prescription: "9-7-5 · 245/165 lb",
                  },
                  {
                    name: "Part A · Box Jumps",
                    prescription: "9-7-5 · 24/20-inch box",
                  },
                  {
                    name: "Part B · Deadlifts",
                    prescription: "15-12-9 · 185/125 lb",
                  },
                  {
                    name: "Part B · Box Jumps",
                    prescription: "15-12-9 · 24/20-inch box",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Part A · Alternating Single-Leg Romanian Deadlifts",
                    prescription: "9-7-5 total reps",
                  },
                  {
                    name: "Part A · Burpee Broad Jumps",
                    prescription: "9-7-5",
                  },
                  {
                    name: "Part B · Glute Bridge Walkouts",
                    prescription: "15-12-9",
                  },
                  {
                    name: "Part B · Jump Squats",
                    prescription: "15-12-9",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 780,
          },
          {
            type: "note",
            text: "Move straight from Part A into Part B. There is no prescribed rest.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "chain-reaction",
    title:
      "Chain Reaction: Shoulder Strength + Full-Body Power & Cardio Circuit",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Push Press",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 4 Sets",
            intervalSeconds: 150,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 8,
                percentage: 60,
              },
              {
                set: 2,
                reps: 7,
                percentage: 65,
              },
              {
                set: 3,
                reps: 7,
                percentage: 70,
              },
              {
                set: 4,
                reps: 6,
                percentage: "75%+",
              },
            ],
          },
          {
            type: "note",
            text: "Build from 60% to 75%+ of your push press.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Chain Reaction",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 5 Rounds",
            intervalSeconds: 120,
            rounds: 5,
            targetSeconds: {
              min: 55,
              max: 75,
            },
            timeCapSeconds: 90,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Double-DB Hang Clean & Jerks",
                    reps: 10,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                  {
                    name: "Double Unders",
                    reps: 50,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Double-DB Hang Clean & Jerks",
                    reps: 10,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                  {
                    name: "Double Unders",
                    reps: 35,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees with Overhead Reach",
                    reps: 8,
                  },
                  {
                    name: "Lateral Line Hops",
                    reps: 50,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Slowest round",
          },
          {
            type: "note",
            text: "Start a new round every 2 minutes and rest until the next start. 70/50 lb is the competitor option, not Go Hard.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "give-and-take",
    title:
      "Give and Take: Heavy Leg Strength + Back & Full-Body Conditioning Circuit",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Leg Swings (Front/Back)",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 6 Sets",
            intervalSeconds: 150,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 5,
                percentage: 75,
              },
              {
                set: 2,
                reps: 4,
                percentage: "75%+",
              },
              {
                set: 3,
                reps: 3,
                percentage: 80,
              },
              {
                set: 4,
                reps: 3,
                percentage: "80%+",
              },
              {
                set: 5,
                reps: 2,
                percentage: 85,
              },
              {
                set: 6,
                reps: "Max",
                percentage: 85,
              },
            ],
          },
          {
            type: "note",
            text: "On the last set, aim for 4–6 good reps and stop before your form breaks.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Give and Take",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "12-Minute EMOM · 45s Work / 15s Rest",
            intervalSeconds: 60,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Minute 1 · Back-Rack Reverse Lunges",
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Minute 2 · Lateral Bar-Over Burpees",
                  },
                  {
                    name: "Minute 3 · Strict Pull-Ups",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Minute 1 · Back-Rack Reverse Lunges",
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Minute 2 · Lateral Bar-Over Burpees",
                  },
                  {
                    name: "Minute 3 · Strict Pull-Ups",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Minute 1 · Alternating Reverse Lunges",
                    reps: 12,
                  },
                  {
                    name: "Minute 2 · Lateral Line-Over Burpees",
                    reps: 10,
                  },
                  {
                    name: "Minute 3 · Superman Pull-Downs",
                    reps: 12,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "Total reps",
          },
          {
            type: "note",
            text: "4 cycles. Original targets are 10–14 lunges, 10–14 burpees, and 6–12 strict pull-ups in each work interval. 155/105 lb and strict chest-to-bar is the competitor option, not Go Hard.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "intertwined",
    title:
      "Intertwined: Weekend Team Workout — Chest, Core & Loaded Carry Conditioning",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Intertwined",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "4 Rounds For Time · Teams of 2",
            rounds: 4,
            targetSeconds: {
              min: 1320,
              max: 1800,
            },
            timeCapSeconds: 1800,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Partner A · Single-KB Run",
                    distance: 200,
                    unit: "m",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Partner B · Double-DB Bench Press",
                    reps: 20,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                  {
                    name: "CFCH Synchronized AbMat Sit-Ups",
                    reps: 60,
                  },
                  {
                    name: "Double-KB Farmer's Carry",
                    distance: 200,
                    unit: "m",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Partner A · Single-KB Run",
                    distance: 200,
                    unit: "m",
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Partner B · Double-DB Bench Press",
                    reps: 20,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                  {
                    name: "CFCH Synchronized AbMat Sit-Ups",
                    reps: 60,
                  },
                  {
                    name: "Double-KB Farmer's Carry",
                    distance: 200,
                    unit: "m",
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Partner A · Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Partner B · Push-Ups",
                    reps: 20,
                  },
                  {
                    name: "Synchronized Floor Sit-Ups",
                    reps: 60,
                  },
                  {
                    name: "Bear Crawl Steps",
                    reps: 40,
                    prescription: "Per partner, replaces the farmer's carry",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "Do the partner stations at the same time, for 4 rounds, and switch when both partners finish. Sit up together on the synchronized sit-ups, then do the carry. The source does not say how to split that carry, so use your gym's team rule.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "mixed-signals",
    title:
      "Mixed Signals: Full-Body Cardio + Squat & Shoulder Endurance Circuit",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Mixed Signals",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E5MOM x 5 Sets",
            intervalSeconds: 300,
            sets: 5,
            targetSeconds: {
              min: 180,
              max: 225,
            },
            timeCapSeconds: 240,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "15/11 cal",
                  },
                  {
                    name: "Light Double-DB Thrusters",
                    reps: 15,
                    weight: {
                      male: 10,
                      female: 5,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell. Replaces 20/14 lb wall balls",
                  },
                  {
                    name: "Echo Bike",
                    prescription:
                      "12/9 cal, estimated replacement for a 15/12 cal row",
                  },
                  {
                    name: "Light Double-DB Thrusters",
                    reps: 15,
                    weight: {
                      male: 10,
                      female: 5,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell. Same weight as the first set",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "12/9 cal",
                  },
                  {
                    name: "Light Double-DB Thrusters",
                    reps: 12,
                    weight: {
                      male: 10,
                      female: 5,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell. Replaces 20/14 lb wall balls",
                  },
                  {
                    name: "Echo Bike",
                    prescription:
                      "10/8 cal, estimated replacement for a 12/9 cal row",
                  },
                  {
                    name: "Light Double-DB Thrusters",
                    reps: 12,
                    weight: {
                      male: 10,
                      female: 5,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell. Same weight as the first set",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 12,
                  },
                  {
                    name: "Jump Squats with Overhead Reach",
                    reps: 15,
                  },
                  {
                    name: "Alternating Reverse Lunges",
                    reps: 20,
                    repsPerSide: 10,
                  },
                  {
                    name: "Air Squats with Overhead Reach",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Slowest round",
          },
          {
            type: "note",
            text: "Finish the round, then rest until the next 5-minute start. The 10/5 lb thrusters and the row-to-bike calories are suggested substitutions, not the original numbers.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-upside-down",
    title: "The Upside Down: Snatch Power + Pulling, Shoulder & Core EMOM",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Upside Down",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "20-Minute Alternating EMOM",
            intervalSeconds: 60,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Minute 1 · Bar Muscle-Ups",
                    prescription: "3–5",
                  },
                  {
                    name: "Minute 2 · Power Snatches",
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                    prescription: "5–7",
                  },
                  {
                    name: "Minute 3 · V-Ups",
                    prescription: "12–15. Source alternative to GHD sit-ups",
                  },
                  {
                    name: "Minute 4 · Double Unders",
                    prescription: "45–60",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Minute 1 · Bar Muscle-Ups or Chest-to-Bar Pull-Ups",
                    prescription: "1–2 muscle-ups, or 8–10 chest-to-bar",
                  },
                  {
                    name: "Minute 2 · Power Snatches",
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                    prescription: "5–7",
                  },
                  {
                    name: "Minute 3 · V-Ups",
                    prescription: "10–12. Source alternative to GHD sit-ups",
                  },
                  {
                    name: "Minute 4 · Double Unders",
                    prescription: "40–50",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Minute 1 · Superman Pull-Downs",
                    reps: 10,
                  },
                  {
                    name: "Minute 2 · Broad Jumps",
                    reps: 8,
                  },
                  {
                    name: "Minute 3 · V-Ups or Floor Leg Raises",
                    reps: 12,
                  },
                  {
                    name: "Minute 4 · Lateral Line Hops",
                    reps: 40,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds completed",
          },
          {
            type: "note",
            text: "Repeat the four-minute sequence 5 times. Finish each station inside 45 seconds.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-rift",
    title:
      "The Rift: Chest & Deadlift Strength + Kettlebell, Jumps & Dips AMRAP",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Bench Press + Deadlift",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "12-Minute Alternating EMOM",
            intervalSeconds: 60,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Minute",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "Odd",
                lift: "Bench Press",
                reps: 3,
                percentage: "70% bench",
              },
              {
                set: "Even",
                lift: "Deadlift",
                reps: 3,
                percentage: "70% deadlift",
              },
            ],
          },
          {
            type: "note",
            text: "Odd minutes are bench press and even minutes are deadlift, 6 sets of each. Score the two loads added together.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Rift",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "8-Minute AMRAP",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Russian Kettlebell Swings",
                    weight: {
                      male: 70,
                      female: 53,
                      unit: "lb",
                    },
                    prescription: "2-4-6-8-10-12…",
                  },
                  {
                    name: "Box Jumps",
                    prescription: "2-4-6-8-10-12… · 24/20-inch box",
                  },
                  {
                    name: "Ring Dips",
                    prescription: "2-4-6-8-10-12…",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Russian Kettlebell Swings",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "2-4-6-8-10-12…",
                  },
                  {
                    name: "Box Jumps",
                    prescription: "2-4-6-8-10-12… · 24/20-inch box",
                  },
                  {
                    name: "Ring Dips",
                    prescription: "1-2-3-4-5-6…",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Glute Bridge Walkouts",
                    prescription: "2-4-6-8-10-12…",
                  },
                  {
                    name: "Jump Squats",
                    prescription: "2-4-6-8-10-12…",
                  },
                  {
                    name: "Close-Grip Push-Ups",
                    prescription: "1-2-3-4-5-6…",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Finish each movement before the next. Go Hard uses the same reps for all three. Standard and No Equipment climb the dips or push-ups by 1 rep while the other movements climb by 2. Try to start the round of 14.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-other-side",
    title:
      "The Other Side: Overhead Squat Strength + Full-Body Endurance Circuit",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Overhead Squats",
                reps: 10,
                prescription: "PVC",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Other Side",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "30-Minute AMRAP",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription:
                      "25/20 cal, estimated replacement for a 500/450m row",
                  },
                  {
                    name: "Single-DB Box Step-Overs",
                    reps: 20,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "24/20-inch box. Hold one dumbbell",
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Barbell Overhead Squats",
                    reps: 15,
                    weight: {
                      male: 95,
                      female: 65,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription:
                      "22/18 cal, estimated replacement for a 450/400m row",
                  },
                  {
                    name: "Single-DB Box Step-Overs",
                    reps: 20,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "24/20-inch box. Hold one dumbbell",
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Barbell Overhead Squats",
                    reps: 15,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 20,
                  },
                  {
                    name: "Alternating Reverse Lunges",
                    reps: 20,
                    repsPerSide: 10,
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Arms-Overhead Air Squats",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Target is 4 or more rounds. Only the row is converted to estimated Echo Bike calories. Keep the step-overs and overhead squats at the listed loads.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "deja-vu",
    title: "Déjà Vu: Power Clean Strength + Clean & Jerk/Core Sprint",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Power Clean",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "EMOM x 10 Minutes",
            intervalSeconds: 60,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Minutes",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–5",
                lift: "2 Power Cleans",
                percentage: "70–75%",
              },
              {
                set: "6–10",
                lift: "1 Power Clean",
                percentage: 80,
              },
            ],
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Déjà Vu",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time",
            targetSeconds: {
              min: 420,
              max: 600,
            },
            timeCapSeconds: 720,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Clean & Jerks",
                    reps: 30,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 8,
                    prescription:
                      "At 0:00 and every minute. Replaces toes-to-bar",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Clean & Jerks",
                    reps: 30,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 6,
                    prescription:
                      "At 0:00 and every minute. Replaces toes-to-bar",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees with Overhead Reach",
                    reps: 30,
                  },
                  {
                    name: "V-Ups or Floor Leg Raises",
                    reps: 6,
                    prescription: "At 0:00 and every minute",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 720,
          },
          {
            type: "note",
            text: "Start with the leg raises at 0:00, then do as many clean and jerks as you can before the next minute. At each minute mark, do the leg raises again before continuing. The time includes those reps.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "time-loop",
    title: "Time Loop: Back Squat Strength + Wall Walk & Thruster Intervals",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Inchworms",
                reps: 5,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 5 Sets",
            intervalSeconds: 150,
            sets: 5,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "reps",
                label: "Reps",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                reps: 7,
                percentage: 60,
              },
              {
                set: 2,
                reps: 5,
                percentage: 65,
              },
              {
                set: 3,
                reps: 5,
                percentage: 65,
              },
              {
                set: 4,
                reps: 3,
                percentage: 70,
              },
              {
                set: 5,
                reps: 3,
                percentage: 75,
              },
            ],
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Time Loop",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 5 Sets",
            intervalSeconds: 150,
            sets: 5,
            targetSeconds: {
              min: 85,
              max: 110,
            },
            timeCapSeconds: 130,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Wall Walks",
                    reps: 3,
                  },
                  {
                    name: "Echo Bike",
                    prescription: "9/7 cal",
                  },
                  {
                    name: "Light Double-DB Thrusters",
                    reps: 12,
                    weight: {
                      male: 15,
                      female: 10,
                      unit: "lb",
                    },
                    prescription:
                      "Each dumbbell. Suggested load, replaces 20/14 lb wall balls",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Wall Walks",
                    reps: 2,
                  },
                  {
                    name: "Echo Bike",
                    prescription: "8/6 cal",
                  },
                  {
                    name: "Light Double-DB Thrusters",
                    reps: 10,
                    weight: {
                      male: 15,
                      female: 10,
                      unit: "lb",
                    },
                    prescription:
                      "Each dumbbell. Suggested load, replaces 20/14 lb wall balls",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Inchworm Push-Ups",
                    reps: 4,
                  },
                  {
                    name: "Burpees",
                    reps: 8,
                  },
                  {
                    name: "Air Squats with Overhead Reach",
                    reps: 10,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Slowest round",
          },
          {
            type: "note",
            text: "Start a new round every 2:30. Finish inside 2:10 and rest with the time left. The 15/10 lb thrusters are a suggestion, not a prescribed weight.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-threshold",
    title: "The Threshold: Grip, Core & Loaded-Carry Endurance Circuit",
    category: "endurance",
    date: "2026-10-11",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Shoulder Taps",
                reps: 10,
                repsPerSide: 5,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Threshold",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E10MOM x 3 Sets · For Quality",
            intervalSeconds: 600,
            sets: 3,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription:
                      "15/13 cal, estimated replacement for a 300/270m row",
                  },
                  {
                    name: "Double-KB Farmer's Carry",
                    reps: 8,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                  {
                    name: "Wall-Supported Handstand Hold",
                    prescription: "30 sec",
                  },
                  {
                    name: "Sandbag Bear-Hug Carry",
                    reps: 8,
                    prescription: "25 ft, as heavy as possible with good form",
                  },
                  {
                    name: "Floor L-Sit",
                    prescription: "30 sec",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription:
                      "15/13 cal, estimated replacement for a 300/270m row",
                  },
                  {
                    name: "Double-KB Farmer's Carry",
                    reps: 8,
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                  {
                    name: "Wall-Supported Handstand Hold",
                    prescription: "30 sec",
                  },
                  {
                    name: "Sandbag Bear-Hug Carry",
                    reps: 8,
                    prescription: "25 ft, as heavy as possible with good form",
                  },
                  {
                    name: "Floor L-Sit",
                    prescription: "30 sec",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 15,
                  },
                  {
                    name: "Bear Crawls",
                    reps: 8,
                    prescription: "25 ft",
                  },
                  {
                    name: "Forearm Plank Hold",
                    prescription: "30 sec",
                  },
                  {
                    name: "Alternating Walking Lunges",
                    reps: 8,
                    prescription: "25 ft",
                  },
                  {
                    name: "Floor L-Sit or Tuck Hold",
                    prescription: "30 sec",
                  },
                ],
              },
            ],
          },
          {
            type: "note",
            text: "No formal score. Complete 3 quality sets and note the loads you use. Aim for about 7 minutes of work, then rest until the next 10-minute start. The sandbag weight is not specified. Bend your knees in the L-sit if a full hold is not sustainable yet.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "nancy",
    title: "Nancy: Back Squat Strength + Overhead Squat & Running Circuit",
    category: "lower",
    date: "2026-10-12",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Overhead Squats",
                reps: 10,
                prescription: "PVC",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Back Squat",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "15-Minute Clock · Find a 3-Rep Max",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "Build to the heaviest back squat you can do for 3 controlled reps. Record that set. No percentages were prescribed.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Nancy",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "5 Rounds For Time",
            rounds: 5,
            targetSeconds: {
              min: 600,
              max: 900,
            },
            timeCapSeconds: 1200,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Barbell Overhead Squats",
                    reps: 15,
                    weight: {
                      male: 95,
                      female: 65,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Barbell Overhead Squats",
                    reps: 15,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Alternating Reverse Lunges with Arms Overhead",
                    reps: 16,
                    repsPerSide: 8,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 1200,
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "hanging-on-by-a-thread",
    title:
      "Hanging on by a Thread: Power Clean Strength + Deadlift, Clean & Cardio AMRAP",
    category: "olympic",
    date: "2026-10-13",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Power Clean",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E90sec x 10 Sets",
            intervalSeconds: 90,
            sets: 10,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–10",
                lift: "1 Power Clean",
                percentage: "65–70%, then build",
              },
            ],
          },
          {
            type: "note",
            text: "One power clean each set. Start at 65–70% and build toward a single if the bar stays fast. Sets 2–10 have no prescribed percentages.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Hanging on by a Thread",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "12-Minute AMRAP",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription:
                      "12/10 cal, estimated substitute for 15/12 BikeErg calories",
                  },
                  {
                    name: "Deadlifts",
                    reps: 12,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 9,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Double Unders",
                    prescription: "36, 48, 60, 72… Add 12 each round",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription:
                      "10/8 cal, estimated substitute for 12/9 BikeErg calories",
                  },
                  {
                    name: "Deadlifts",
                    reps: 12,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 9,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Double Unders",
                    prescription: "30, 40, 50, 60… Add 10 each round",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 10,
                  },
                  {
                    name: "Alternating Single-Leg Romanian Deadlifts",
                    reps: 12,
                    repsPerSide: 6,
                  },
                  {
                    name: "Jump Squats",
                    reps: 9,
                  },
                  {
                    name: "Lateral Line Hops",
                    prescription: "36, 48, 60, 72… Add 12 each round",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Target is 4 or more rounds. Only the double unders, or the line hops, increase each round. The bike calories are an estimate of the BikeErg.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "climbing-the-walls",
    title: "Climbing the Walls: Bench Press Strength + Upper-Body & Core AMRAP",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
              {
                name: "Inchworms",
                reps: 5,
              },
              {
                name: "Shoulder Taps",
                reps: 10,
                repsPerSide: 5,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Bench Press",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "15-Minute Clock · Find a 3-Rep Max",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "Build to the heaviest bench press you can do for 3 controlled reps. Record that set. No percentages were prescribed.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Climbing the Walls",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "15-Minute AMRAP",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Push-Ups",
                    prescription: "5/3",
                  },
                  {
                    name: "Wall Walks",
                    prescription:
                      "1, then 2, then 3, then 4, then restart at 1",
                  },
                  {
                    name: "Strict Pull-Ups",
                    reps: 5,
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 8,
                    prescription: "Replaces toes-to-bar",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Push-Ups",
                    prescription: "5/3",
                  },
                  {
                    name: "Wall Walks",
                    prescription:
                      "1, then 2, then 3, then 4, then restart at 1",
                  },
                  {
                    name: "Strict Pull-Ups",
                    reps: 4,
                  },
                  {
                    name: "Floor Leg Raises",
                    reps: 6,
                    prescription: "Replaces toes-to-bar",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Push-Ups",
                    prescription: "5/3, any manageable variation",
                  },
                  {
                    name: "Inchworm Push-Ups",
                    prescription:
                      "2, then 4, then 6, then 8, then restart at 2",
                  },
                  {
                    name: "Superman Pull-Downs",
                    reps: 4,
                  },
                  {
                    name: "V-Ups or Floor Leg Raises",
                    reps: 6,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Target is 8 or more rounds. Push-ups, pull-ups, and leg raises stay the same every round. Wall walks climb from 1 to 4, then start over at 1. One wall walk is a single trip up the wall and back, not the complex from The Yips. No Equipment uses inchworm push-ups at 2, 4, 6, and 8 instead.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "engine-check",
    title: "Engine Check: Full-Body Cardio + Jump & Thruster Intervals",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                perSide: true,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Engine Check",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "20-Minute EMOM · 45s Work / 15s Off",
            intervalSeconds: 60,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Minute A · Echo Bike",
                    prescription:
                      "12/10 cal, estimated substitute for a 15/12 cal row",
                  },
                  {
                    name: "Minute B · Box Jump-Overs",
                    reps: 15,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Minute C · Echo Bike",
                    prescription: "Max calories. Replaces a max-calorie row",
                  },
                  {
                    name: "Minute D · Light Double-DB Thrusters",
                    weight: {
                      male: 15,
                      female: 10,
                      unit: "lb",
                    },
                    prescription:
                      "Max reps, each dumbbell. Suggested load, replaces max wall balls",
                  },
                  {
                    name: "Minute E · Rest",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Minute A · Echo Bike",
                    prescription:
                      "11/9 cal, estimated substitute for a 13/10 cal row",
                  },
                  {
                    name: "Minute B · Box Jump-Overs",
                    reps: 12,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Minute C · Echo Bike",
                    prescription: "Max calories. Replaces a max-calorie row",
                  },
                  {
                    name: "Minute D · Light Double-DB Thrusters",
                    weight: {
                      male: 15,
                      female: 10,
                      unit: "lb",
                    },
                    prescription:
                      "Max reps, each dumbbell. Suggested load, replaces max wall balls",
                  },
                  {
                    name: "Minute E · Rest",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Minute A · Burpees",
                    reps: 10,
                  },
                  {
                    name: "Minute B · Lateral Bounds",
                    reps: 12,
                    repsPerSide: 6,
                  },
                  {
                    name: "Minute C · Mountain Climbers",
                    prescription: "Max reps. Count each knee drive",
                  },
                  {
                    name: "Minute D · Squat-to-Overhead Reaches",
                    prescription: "Max reps",
                  },
                  {
                    name: "Minute E · Rest",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "Minute C + Minute D",
          },
          {
            type: "note",
            text: "4 cycles of the five minutes. Add every Minute C calorie to every Minute D thruster rep. With no equipment, add the mountain climbers and squat-to-reach reps instead. Try to finish the fixed Minute A and B work inside each 45-second station. The 15/10 lb dumbbells are a suggestion.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "rhythm-and-roll",
    title:
      "Rhythm and Roll: Deadlift Strength + Kettlebell & Loaded-Carry Circuit",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Deadlift",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "15-Minute Clock · Find a 3-Rep Max",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "Build to the heaviest deadlift you can do for 3 controlled reps. Record that set. No percentages were prescribed.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Rhythm and Roll",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "5 Rounds For Time",
            rounds: 5,
            targetSeconds: {
              min: 660,
              max: 900,
            },
            timeCapSeconds: 900,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 10,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Burpees to a Plate",
                    reps: 8,
                    prescription: "15-lb plate",
                  },
                  {
                    name: "Double-DB Farmer's Carry",
                    reps: 8,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 10,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Burpees to a Plate",
                    reps: 8,
                    prescription: "15-lb plate",
                  },
                  {
                    name: "Double-DB Farmer's Carry",
                    reps: 8,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "25 ft, each dumbbell",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Jump Squats",
                    reps: 10,
                  },
                  {
                    name: "Burpees",
                    reps: 6,
                  },
                  {
                    name: "Bear Crawl",
                    reps: 4,
                    prescription: "25 ft",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "Go Hard and Standard both use 10 kettlebell swings at 53/35 lb and 8 burpees to a 15-lb plate. Only the farmer's carry changes: 50/35 lb versus 35/25 lb, each dumbbell. Eight carries of 25 ft is 200 ft per round.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "controlled-chaos",
    title:
      "Controlled Chaos: Weekend Team Workout — Shoulder Strength & Conditioning",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Shoulder Taps",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Controlled Chaos",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "3 Sets For Time · Teams of 2",
            sets: 3,
            targetSeconds: {
              min: 1380,
              max: 1620,
            },
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "Each set is 3 rounds of the bike and shoulder-to-overhead work, then the gymnastics finisher. Rest 3 minutes after sets 1 and 2. One partner works while the other holds a plank, and you can switch any time. Keep that format for the bodyweight version.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "3 Rounds · Echo Bike",
                    prescription: "20/14 cal",
                  },
                  {
                    name: "3 Rounds · Barbell Shoulder-to-Overheads",
                    reps: 15,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Then · Bar Muscle-Ups",
                    reps: 10,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "3 Rounds · Echo Bike",
                    prescription: "18/13 cal",
                  },
                  {
                    name: "3 Rounds · Barbell Shoulder-to-Overheads",
                    reps: 15,
                    weight: {
                      male: 95,
                      female: 65,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Then · Chest-to-Bar Pull-Ups",
                    reps: 15,
                  },
                  {
                    name: "Then · Ring Dips",
                    reps: 15,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "3 Rounds · Burpees",
                    reps: 12,
                  },
                  {
                    name: "3 Rounds · Pike Push-Ups",
                    reps: 15,
                  },
                  {
                    name: "Then · Superman Pull-Downs",
                    reps: 15,
                  },
                  {
                    name: "Then · Push-Ups",
                    reps: 15,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "The score includes the 3-minute rests. Go Hard finishes each set with 10 bar muscle-ups after 20/14 cal and shoulder-to-overheads at 115/75 lb. Standard finishes with 15 chest-to-bar pull-ups and 15 ring dips after 18/13 cal and shoulder-to-overheads at 95/65 lb. Do not swap those finishers.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "repeat-offender",
    title: "Repeat Offender: Full-Body Cardio, Burpees & Core Circuit",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Repeat Offender",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "4 Rounds For Time · Rest 1 Minute Between Rounds",
            rounds: 4,
            targetSeconds: {
              min: 1620,
              max: 1920,
            },
            timeCapSeconds: 1920,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "30/22 cal",
                  },
                  {
                    name: "Burpee Box-Facing Jump-Overs",
                    reps: 5,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "AbMat Sit-Ups",
                    reps: 20,
                  },
                  {
                    name: "Burpee Box-Facing Jump-Overs",
                    reps: 5,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Echo Bike",
                    prescription: "24/18 cal",
                  },
                  {
                    name: "Burpee Box-Facing Jump-Overs",
                    reps: 5,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "AbMat Sit-Ups",
                    reps: 20,
                  },
                  {
                    name: "Burpee Box-Facing Jump-Overs",
                    reps: 5,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 18,
                  },
                  {
                    name: "Burpee Broad Jumps",
                    reps: 4,
                  },
                  {
                    name: "Sit-Ups",
                    reps: 15,
                  },
                  {
                    name: "Burpee Broad Jumps",
                    reps: 4,
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 1920,
          },
          {
            type: "note",
            text: "Rest 1 minute after rounds 1–3, and include those rests in the score. Both loaded versions use the same 5 + 5 burpee box-facing jump-overs, 20 AbMat sit-ups, and 400m run on a 24/20-inch box. Only the bike calories change: 30/22 versus 24/18.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "barbell-buddha",
    title:
      "Barbell Buddha: Tempo Deadlift Strength + Squat Clean & Power Clean Intervals",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Air Squats",
                reps: 15,
              },
              {
                name: "Front-Rack Elbow Raises with PVC Pipe",
                reps: 10,
              },
              {
                name: "Bear Crawls",
                reps: 10,
                prescription: "10 steps forward + 10 steps back",
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Tempo Floating Deadlift",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E4MOM x 4 Sets",
            intervalSeconds: 240,
            sets: 4,
          },
          {
            type: "movementList",
            items: [
              {
                name: "Tempo Floating Deadlifts",
                reps: 5,
                prescription: "60% of deadlift 1RM · 31X1",
              },
              {
                name: "Double-Kettlebell Front-Rack Marches",
                reps: 50,
                prescription: "Choose the load",
              },
            ],
          },
          {
            type: "note",
            text: "Tempo is 3 seconds down, a 1-second pause near the bottom, an explosive lift, and 1 second at the top. Stand on a 15-lb plate and stop the bar 2–3 inches above the ground.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Barbell Buddha",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 4 Sets · 1:30 Work / 0:30 Rest",
            intervalSeconds: 120,
            sets: 4,
          },
          {
            type: "note",
            text: "Finish the squat cleans and double unders, then do as many power cleans as possible in the time left.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Squat Cleans",
                    reps: 5,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Double Unders",
                    reps: 60,
                  },
                  {
                    name: "Max Power Cleans",
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                    prescription: "Remaining time",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Squat Cleans",
                    reps: 5,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Double Unders",
                    reps: 45,
                  },
                  {
                    name: "Max Power Cleans",
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                    prescription: "Remaining time",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Jump Squats",
                    reps: 5,
                  },
                  {
                    name: "Lateral Line Hops",
                    reps: 40,
                    prescription: "Count each jump",
                  },
                  {
                    name: "Max Burpees",
                    prescription: "Remaining time",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "Total power cleans",
          },
          {
            type: "note",
            text: "Add the power cleans from all 4 sets. The original target is about 7 per round. Keep one weight for both the squat cleans and the power cleans: 135/95 lb on Go Hard, 115/75 lb on Standard. No Equipment scores total burpees instead, and that total is not comparable.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "hang-time",
    title: "Hang Time — Dumbbell Snatches, Toes-to-Bar & Muscle-Up Sprint",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
                prescription: "Or 10 standing scapular retractions",
              },
              {
                name: "Alternating Standing Overhead Reaches",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Dead Bugs",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Hollow Rocks",
                reps: 10,
                prescription: "Or a 20-second hollow hold",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Hang Time",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "12-Minute Clock · 7-Min AMRAP, 2-Min Rest, 3-Min AMRAP",
            timeCapSeconds: 720,
          },
          {
            type: "note",
            text: "Work 0:00–7:00, rest 7:00–9:00, then work 9:00–12:00.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "7-Min AMRAP · Alternating Single-DB Hang Snatches",
                    reps: 12,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Alternating arms",
                  },
                  {
                    name: "7-Min AMRAP · Toes-to-Bar",
                    prescription: "4, 6, 8, 10, 12… add 2 each round",
                  },
                  {
                    name: "3-Min AMRAP · Bar Muscle-Ups",
                    reps: 10,
                  },
                  {
                    name: "3-Min AMRAP · Max Ring Muscle-Ups",
                    prescription: "Remaining time",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "7-Min AMRAP · Alternating Single-DB Hang Snatches",
                    reps: 12,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Alternating arms",
                  },
                  {
                    name: "7-Min AMRAP · Toes-to-Bar",
                    prescription: "4, 6, 8, 10, 12… add 2 each round",
                  },
                  {
                    name: "Path A · Bar Muscle-Ups",
                    reps: 5,
                  },
                  {
                    name: "Path A · Max Ring Muscle-Ups",
                    prescription: "Remaining time",
                  },
                  {
                    name: "Path B · Chest-to-Bar Pull-Ups",
                    reps: 15,
                  },
                  {
                    name: "Path B · Max Bar Muscle-Ups",
                    prescription: "Remaining time",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "7-Min AMRAP · Alternating Jumping Reverse Lunges",
                    reps: 12,
                    repsPerSide: 6,
                    prescription: "Step back instead of jumping if needed",
                  },
                  {
                    name: "7-Min AMRAP · V-Ups",
                    prescription: "4, 6, 8, 10, 12… add 2 each round",
                  },
                  {
                    name: "3-Min AMRAP · Burpees",
                    reps: 10,
                  },
                  {
                    name: "3-Min AMRAP · Max Pike Push-Ups",
                    prescription: "Remaining time",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "First AMRAP + gymnastics",
          },
          {
            type: "note",
            text: "Go Hard adds every rep from the 7-minute AMRAP to every muscle-up rep. Target is 112 reps in the first AMRAP and 5 or more ring muscle-ups. Standard chooses Path A or Path B, not both, and weights the finisher: ring muscle-up = 7, bar muscle-up = 3, chest-to-bar pull-up = 1. Target is 112 reps and 5 or more muscle-ups. No Equipment records the two AMRAPs separately and is not comparable to the official score.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "burden-run",
    title: "Burden Run — Partner Row, Thrusters & Medball Carry Circuit",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Standing Trunk Rotations",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Squat-to-Overhead Reaches",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Burden Run",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "4 Rounds For Time · Teams of 2",
            rounds: 4,
            targetSeconds: {
              min: 1560,
              max: 1920,
            },
            timeCapSeconds: 2100,
          },
          {
            type: "note",
            text: "On the rep work, one partner works while the other rests. Both partners run the 400m together. One carries the medball and you can switch any time.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Row",
                    prescription:
                      "500/450m. Or about 20/16 cal Echo Bike, or ride hard for about 2:00. Rough substitute, not the gym prescription.",
                  },
                  {
                    name: "Wall Balls",
                    reps: 40,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "10/9 ft target. Or 40 light dumbbell thrusters, two 5–10 lb dumbbells.",
                  },
                  {
                    name: "Medball Run",
                    distance: 400,
                    unit: "m",
                    prescription:
                      "Or carry one dumbbell or kettlebell at the chest. Run unweighted if that is not practical.",
                  },
                  {
                    name: "Partner Medball Russian Twist Tosses",
                    reps: 30,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "15 per partner. Or hand off a light dumbbell. Do not throw it.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Row",
                    prescription:
                      "450/400m. Or about 18/14 cal Echo Bike, or ride hard for about 1:45–2:00. Rough substitute, not the gym prescription.",
                  },
                  {
                    name: "Wall Balls",
                    reps: 30,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "10/9 ft target. Or 30 light dumbbell thrusters, two 5–10 lb dumbbells.",
                  },
                  {
                    name: "Medball Run",
                    distance: 400,
                    unit: "m",
                    prescription:
                      "Or carry one dumbbell or kettlebell at the chest. Run unweighted if that is not practical.",
                  },
                  {
                    name: "Partner Medball Russian Twist Tosses",
                    reps: 30,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "15 per partner. Or hand off a light dumbbell. Do not throw it.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                    prescription: "In place of the row",
                  },
                  {
                    name: "Squat-to-Overhead Reaches",
                    reps: 30,
                    prescription: "Explosive leg drive",
                  },
                  {
                    name: "Run Together",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Partner Seated Russian-Twist Hand Taps",
                    reps: 30,
                    prescription: "15 per partner",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 2100,
          },
          {
            type: "note",
            text: "Echo bike calories and light dumbbell thrusters are rough substitutes for the row and wall balls. The gym loads stay 20/14 lb to a 10/9 ft target. Adjust the bike so the effort lasts about as long as the row.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "chicka-chicka-boom-boom",
    title: "Chicka Chicka Boom Boom — Ski, Pull-Ups & Handstand Intervals",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
                prescription: "Or 10 standing scapular retractions",
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Pike Shoulder Taps",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Hollow Hold",
                prescription: "20 seconds",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Chicka Chicka Boom Boom",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "6 x Alternating E5MOM · 3 Visits Each Station",
            intervalSeconds: 300,
            sets: 6,
            targetSeconds: {
              min: 180,
              max: 210,
            },
            timeCapSeconds: 255,
          },
          {
            type: "note",
            text: "Start station 1 at 0:00 and station 2 at 5:00, then keep alternating through 25:00. Finish the station inside its 5-minute window and rest with the time left. The target and cap are for each station.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Station 1 · SkiErg",
                    prescription:
                      "500/450m. Or about 20/16 cal Echo Bike, or ride hard for about 2:00. Rough substitute, not the gym prescription.",
                  },
                  {
                    name: "Station 1 · Chest-to-Bar Pull-Ups",
                    reps: 8,
                  },
                  {
                    name: "Station 1 · Pull-Ups",
                    reps: 12,
                  },
                  {
                    name: "Station 2 · Row",
                    prescription:
                      "500/450m. Or about 20/16 cal Echo Bike, or ride hard for about 2:00. Rough substitute, not the gym prescription.",
                  },
                  {
                    name: "Station 2 · Wall-Facing Handstand Push-Ups",
                    reps: 12,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Station 1 · SkiErg",
                    prescription:
                      "450/400m. Or about 18/14 cal Echo Bike, or ride hard for about 1:45–2:00. Rough substitute, not the gym prescription.",
                  },
                  {
                    name: "Station 1 · Pull-Ups",
                    reps: 18,
                  },
                  {
                    name: "Station 2 · Row",
                    prescription:
                      "450/400m. Or about 18/14 cal Echo Bike, or ride hard for about 1:45–2:00. Rough substitute, not the gym prescription.",
                  },
                  {
                    name: "Station 2 · Handstand Push-Ups",
                    reps: 9,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Station 1 · Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Station 1 · Superman Pull-Downs",
                    reps: 20,
                    prescription:
                      "Pull the elbows to the ribs and squeeze the shoulder blades",
                  },
                  {
                    name: "Station 2 · Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Station 2 · Pike Push-Ups",
                    reps: 12,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Slowest station",
          },
          {
            type: "note",
            text: "Go Hard uses wall-facing handstand push-ups. Standard does not. An Echo Bike can replace both the ski and the row, and the pull-up and handstand reps stay the same. Those calories are a rough substitute, not the gym prescription.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "the-gruffalo",
    title: "The Gruffalo — Snatch Strength + Thruster-Style Conditioning",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Overhead Squats with PVC",
                reps: 10,
                prescription: "Or arms overhead",
              },
              {
                name: "Pogo Jumps",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Snatch",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E90sec x 8 Sets",
            intervalSeconds: 90,
            sets: 8,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–8",
                lift: "1 Hang Snatch + 2 Snatches",
                percentage: "60–75%",
              },
            ],
          },
          {
            type: "note",
            text: "Squat snatches if you can. Power snatches are allowed. Keep the positions controlled rather than forcing a heavy lift.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "The Gruffalo",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "4 Rounds For Time",
            rounds: 4,
            targetSeconds: {
              min: 360,
              max: 600,
            },
            timeCapSeconds: 600,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Hang Power Snatches",
                    reps: 8,
                    weight: {
                      male: 95,
                      female: 65,
                      unit: "lb",
                    },
                    prescription:
                      "Control the bar down. Do not drop it between reps.",
                  },
                  {
                    name: "Wall Balls",
                    reps: 16,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "10/9 ft target. Or 16 light dumbbell thrusters, two 5–10 lb dumbbells.",
                  },
                  {
                    name: "Double Unders",
                    reps: 48,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Hang Power Snatches",
                    reps: 8,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription:
                      "Control the bar down. Do not drop it between reps.",
                  },
                  {
                    name: "Wall Balls",
                    reps: 16,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "10/9 ft target. Or 16 light dumbbell thrusters, two 5–10 lb dumbbells.",
                  },
                  {
                    name: "Double Unders",
                    reps: 36,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpee Broad Jumps",
                    reps: 8,
                  },
                  {
                    name: "Jump Squats",
                    reps: 16,
                  },
                  {
                    name: "Lateral Line Hops",
                    reps: 48,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 600,
          },
          {
            type: "note",
            text: "The snatch loads stay 95/65 lb on Go Hard and 75/55 lb on Standard. Light dumbbell thrusters are a substitute for the wall balls, not a change to the 20/14 lb gym load.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "going-on-a-bear-hunt",
    title: "Going on a Bear Hunt — Deadlift & Running Intervals",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Standing Knee Drives",
                reps: 12,
                repsPerSide: 6,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Going on a Bear Hunt",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "3 Rounds For Time",
            rounds: 3,
            targetSeconds: {
              min: 1260,
              max: 1560,
            },
            timeCapSeconds: 1680,
          },
          {
            type: "note",
            text: "Do the pieces in order, including both 1-minute rests. No extra rest after the last rep of round 3.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Deadlifts",
                    reps: 12,
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Rest",
                    prescription: "1:00",
                  },
                  {
                    name: "Deadlifts",
                    reps: 6,
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Deadlifts",
                    reps: 6,
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Rest",
                    prescription: "1:00 between rounds",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Deadlifts",
                    reps: 12,
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Rest",
                    prescription: "1:00",
                  },
                  {
                    name: "Deadlifts",
                    reps: 6,
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Deadlifts",
                    reps: 6,
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Rest",
                    prescription: "1:00 between rounds",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Slow Hip Hinges",
                    reps: 12,
                    prescription: "Or good mornings. 3-second lowering",
                  },
                  {
                    name: "Run",
                    distance: 200,
                    unit: "m",
                  },
                  {
                    name: "Rest",
                    prescription: "1:00",
                  },
                  {
                    name: "Single-Leg Romanian Deadlifts",
                    reps: 6,
                    perSide: true,
                  },
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Glute Bridges",
                    reps: 12,
                  },
                  {
                    name: "Rest",
                    prescription: "1:00 between rounds",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 1680,
          },
          {
            type: "note",
            text: "Both loaded versions use the same runs and 24 deadlifts per round, 12 then 6 then 6. Only the load changes: 225/155 lb versus 185/125 lb. The 1-minute rests are part of the workout.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "go-dog-go",
    title: "Go, Dog. Go! — Push Press Strength + Burpees & Echo Bike Sprints",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Standing Overhead Reaches",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Push Press",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 4 Sets",
            intervalSeconds: 180,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–4",
                lift: "9 Push Press",
                percentage: 65,
              },
            ],
          },
          {
            type: "note",
            text: "Each set is 9 push presses at 65% of your 1-rep max.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Go, Dog. Go!",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 5 Sets · 1:00 Work / 1:00 Rest",
            intervalSeconds: 120,
            sets: 5,
          },
          {
            type: "note",
            text: "Do the burpees at the start of each interval, then ride for whatever is left of that first minute. Rest the second minute.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Burpees",
                    reps: 10,
                  },
                  {
                    name: "Echo Bike",
                    prescription:
                      "Max calories in the rest of the minute. Target 10/7+ per round.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Burpees",
                    reps: 8,
                  },
                  {
                    name: "Echo Bike",
                    prescription:
                      "Max calories in the rest of the minute. Target 10/7+ per round.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Burpees",
                    reps: 10,
                  },
                  {
                    name: "Fast High Knees",
                    prescription: "Max knee drives in the rest of the minute",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "Total bike calories",
          },
          {
            type: "note",
            text: "Add the Echo Bike calories from all 5 intervals. Go Hard starts with 10 burpees and Standard starts with 8. No Equipment scores total knee drives instead, and that total is not comparable.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "room-on-the-broom",
    title: "Room on the Broom — Partner Progressive-Ladder Chipper",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
                prescription: "Or 10 standing scapular retractions",
              },
              {
                name: "Alternating Step-Ups",
                reps: 10,
                repsPerSide: 5,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Room on the Broom",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time · Teams of 2",
            targetSeconds: {
              min: 1500,
              max: 1800,
            },
            timeCapSeconds: 2100,
          },
          {
            type: "note",
            text: "Each stage repeats the earlier movements and adds one. One partner works while the other rests. Split the reps and distances however you want.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Stage 1 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 1 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 2 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 2 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 2 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 3 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 3 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 3 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 3 · Kettlebell Swings",
                    reps: 36,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 4 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 4 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 4 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 4 · Kettlebell Swings",
                    reps: 36,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 4 · Row",
                    distance: 1000,
                    unit: "m",
                    prescription:
                      "Or about 4:00 of steady-hard Echo Bike. Approximate time substitute, not a calorie match.",
                  },
                  {
                    name: "Stage 5 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 155,
                      female: 105,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 5 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 5 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 5 · Kettlebell Swings",
                    reps: 36,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 5 · Row",
                    distance: 1000,
                    unit: "m",
                    prescription:
                      "Or about 4:00 of steady-hard Echo Bike. Approximate time substitute, not a calorie match.",
                  },
                  {
                    name: "Stage 5 · Two-Kettlebell Farmer's Carry",
                    distance: 400,
                    unit: "m",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription:
                      "Each kettlebell. Or a heavy pair of dumbbells.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Stage 1 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 1 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 2 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 2 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 2 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 3 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 3 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 3 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 3 · Kettlebell Swings",
                    reps: 36,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 4 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 4 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 4 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 4 · Kettlebell Swings",
                    reps: 36,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 4 · Row",
                    distance: 1000,
                    unit: "m",
                    prescription:
                      "Or about 4:00 of steady-hard Echo Bike. Approximate time substitute, not a calorie match.",
                  },
                  {
                    name: "Stage 5 · Power Cleans",
                    reps: 12,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 5 · Toes-to-Bar",
                    reps: 18,
                  },
                  {
                    name: "Stage 5 · Box Jumps",
                    reps: 24,
                    prescription: "24/20-inch box",
                  },
                  {
                    name: "Stage 5 · Kettlebell Swings",
                    reps: 36,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Stage 5 · Row",
                    distance: 1000,
                    unit: "m",
                    prescription:
                      "Or about 4:00 of steady-hard Echo Bike. Approximate time substitute, not a calorie match.",
                  },
                  {
                    name: "Stage 5 · Two-Kettlebell Farmer's Carry",
                    distance: 400,
                    unit: "m",
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription:
                      "Each kettlebell. Or a heavy pair of dumbbells.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Stage 1 · Squat Jumps",
                    reps: 12,
                  },
                  {
                    name: "Stage 1 · V-Ups",
                    reps: 18,
                  },
                  {
                    name: "Stage 2 · Squat Jumps",
                    reps: 12,
                  },
                  {
                    name: "Stage 2 · V-Ups",
                    reps: 18,
                  },
                  {
                    name: "Stage 2 · Lateral Line Hops",
                    reps: 24,
                  },
                  {
                    name: "Stage 3 · Squat Jumps",
                    reps: 12,
                  },
                  {
                    name: "Stage 3 · V-Ups",
                    reps: 18,
                  },
                  {
                    name: "Stage 3 · Lateral Line Hops",
                    reps: 24,
                  },
                  {
                    name: "Stage 3 · Glute Bridges",
                    reps: 36,
                  },
                  {
                    name: "Stage 4 · Squat Jumps",
                    reps: 12,
                  },
                  {
                    name: "Stage 4 · V-Ups",
                    reps: 18,
                  },
                  {
                    name: "Stage 4 · Lateral Line Hops",
                    reps: 24,
                  },
                  {
                    name: "Stage 4 · Glute Bridges",
                    reps: 36,
                  },
                  {
                    name: "Stage 4 · Run",
                    distance: 800,
                    unit: "m",
                    prescription: "In place of the row",
                  },
                  {
                    name: "Stage 5 · Squat Jumps",
                    reps: 12,
                  },
                  {
                    name: "Stage 5 · V-Ups",
                    reps: 18,
                  },
                  {
                    name: "Stage 5 · Lateral Line Hops",
                    reps: 24,
                  },
                  {
                    name: "Stage 5 · Glute Bridges",
                    reps: 36,
                  },
                  {
                    name: "Stage 5 · Run",
                    distance: 800,
                    unit: "m",
                    prescription: "In place of the row",
                  },
                  {
                    name: "Stage 5 · Brisk Walk",
                    distance: 400,
                    unit: "m",
                    prescription:
                      "Tall posture. In place of the farmer's carry.",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 2100,
          },
          {
            type: "note",
            text: "Standard keeps the power cleans at 115/75 lb. The Masters 55+ clean of 95/65 lb is not used. No Equipment times are not comparable. The Echo Bike option on the row is about 4 minutes of steady-hard riding, not a calorie match.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "cheat-code",
    title: "Cheat Code — Snatch Strength + Dumbbell Snatch & Burpee Ladder",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Overhead Squats with PVC",
                reps: 10,
                prescription: "Or arms overhead",
              },
              {
                name: "Lateral Line Hops",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Snatch",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E90sec x 6 Sets",
            intervalSeconds: 90,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–6",
                lift: "1 Power Snatch + 1 Squat Snatch + 1 Overhead Squat",
                percentage: "60%, then build",
              },
            ],
          },
          {
            type: "note",
            text: "Start at 60% of your 1-rep max and build to heavy.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Cheat Code",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "8-Minute AMRAP · 2-4-6-8-10 Ladder",
            timeCapSeconds: 480,
          },
          {
            type: "note",
            text: "Each round uses the same number for both movements, then add 2. Target is to finish the round of 12 and start the round of 14.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Alternating Single-Dumbbell Snatches",
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "2, 4, 6, 8, 10… add 2 each round",
                  },
                  {
                    name: "Double Jump Burpees over Dumbbell",
                    prescription: "Same reps as the snatches",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Alternating Single-Dumbbell Snatches",
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "2, 4, 6, 8, 10… add 2 each round",
                  },
                  {
                    name: "Double Jump Burpees over Dumbbell",
                    prescription: "Same reps as the snatches",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Alternating Squat-to-Overhead Reaches",
                    prescription:
                      "2, 4, 6, 8, 10… add 2 each round, one rep per side",
                  },
                  {
                    name: "Burpees with a Two-Foot Lateral Jump",
                    prescription:
                      "Over a floor line. Same reps as the reaches.",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Last full round + reps",
          },
          {
            type: "note",
            text: "Record the last finished round and any extra reps, such as 12 + 8. The screenshots do not define the double jump burpee. The 70/50 lb competitor dumbbell is not the Go Hard load.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "donkey-kong",
    title: "Donkey Kong — Pull-Ups, Wall Balls & Farmer-Hold Step-Overs",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Pull-Ups",
                reps: 10,
                prescription: "Or 10 standing scapular retractions",
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 12,
                repsPerSide: 6,
              },
              {
                name: "Farmer-March Knee Drives",
                reps: 20,
                repsPerSide: 10,
                prescription: "Standing tall",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Donkey Kong",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "5 Rounds For Time",
            rounds: 5,
            targetSeconds: {
              min: 1260,
              max: 1560,
            },
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "One loaded complex rep is 6 farmer-hold marches, 2 box step-overs over and back, and 6 farmer-hold marches. In round 3, do that whole sequence three times. One bodyweight rep is 6 high-knee marches, 2 alternating reverse lunges, and 6 high-knee marches.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Chest-to-Bar Pull-Ups",
                    reps: 15,
                  },
                  {
                    name: "Wall Balls",
                    reps: 15,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "10/9 ft target. Or 15 light dumbbell thrusters, two 5–10 lb dumbbells.",
                  },
                  {
                    name: "Double-DB Farmer-Hold Step-Overs",
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription:
                      "1, then 2, then 3, then 4, then 5. 24/20-inch box.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Pull-Ups",
                    reps: 15,
                  },
                  {
                    name: "Wall Balls",
                    reps: 15,
                    weight: {
                      male: 20,
                      female: 14,
                      unit: "lb",
                    },
                    prescription:
                      "10/9 ft target. Or 15 light dumbbell thrusters, two 5–10 lb dumbbells.",
                  },
                  {
                    name: "Double-DB Farmer-Hold Step-Overs",
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription:
                      "1, then 2, then 3, then 4, then 5. 24/20-inch box.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 400,
                    unit: "m",
                  },
                  {
                    name: "Superman Pull-Downs",
                    reps: 15,
                    prescription: "Prone, pull the elbows toward the ribs",
                  },
                  {
                    name: "Jump Squats",
                    reps: 15,
                  },
                  {
                    name: "Farmer-March / Lunge Complex",
                    prescription: "1, then 2, then 3, then 4, then 5",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "Go Hard uses chest-to-bar pull-ups and 50/35 lb dumbbells. Standard uses pull-ups and 35/25 lb dumbbells. Wall balls stay 20/14 lb to a 10/9 ft target, and the box stays 24/20 inches.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "tetris",
    title:
      "Tetris — Clean & Jerk Strength + Hang Clean / Shoulder-to-Overhead Intervals",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Front Rack Elbow Raises",
                reps: 10,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Standing Overhead Reaches",
                reps: 10,
              },
              {
                name: "Dead Bugs",
                reps: 12,
                repsPerSide: 6,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Clean & Jerk",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–6",
                lift: "1 Clean + 1 Hang Clean + 1 Jerk",
                percentage: "60–75%",
              },
            ],
          },
          {
            type: "note",
            text: "Push jerk or split jerk. Keep every rep between 60–75% of your clean and jerk 1-rep max.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Tetris",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E4MOM x 3 Sets · 3:00 Work / 1:00 Rest",
            intervalSeconds: 240,
            sets: 3,
          },
          {
            type: "note",
            text: "Buy in with the sit-ups, then AMRAP the ladder in the time left. Rest the fourth minute. Sit-ups do not count. A full ladder is 36 reps, and the target is 36 scored reps per interval. Continue if you finish a ladder early.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Buy-In · GHD Sit-Ups",
                    reps: 18,
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 9,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Shoulder-to-Overhead",
                    reps: 7,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 7,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Shoulder-to-Overhead",
                    reps: 5,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 5,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Shoulder-to-Overhead",
                    reps: 3,
                    weight: {
                      male: 135,
                      female: 95,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Buy-In · GHD Sit-Ups",
                    reps: 15,
                    prescription: "Or 15 stick sit-ups, 1-minute cap",
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 9,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Shoulder-to-Overhead",
                    reps: 7,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 7,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Shoulder-to-Overhead",
                    reps: 5,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Hang Power Cleans",
                    reps: 5,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Shoulder-to-Overhead",
                    reps: 3,
                    weight: {
                      male: 115,
                      female: 75,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Buy-In · Sit-Ups",
                    reps: 15,
                  },
                  {
                    name: "Squat Jumps",
                    reps: 9,
                  },
                  {
                    name: "Pike Push-Ups",
                    reps: 7,
                  },
                  {
                    name: "Squat Jumps",
                    reps: 7,
                  },
                  {
                    name: "Pike Push-Ups",
                    reps: 5,
                  },
                  {
                    name: "Squat Jumps",
                    reps: 5,
                  },
                  {
                    name: "Pike Push-Ups",
                    reps: 3,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "Hang power cleans + shoulder-to-overhead",
          },
          {
            type: "note",
            text: "Add those reps across all 3 intervals. Go Hard uses 135/95 lb and Standard uses 115/75 lb. No Equipment scores squat jumps plus pike push-ups instead.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "bonus-round",
    title: "Bonus Round — Row, Double-Unders, Echo Bike & Wall Walks",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Small Line Hops",
                reps: 20,
                prescription: "10 forward/back + 10 side-to-side",
              },
              {
                name: "Downward-Dog Shoulder Taps",
                reps: 8,
                repsPerSide: 4,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Bonus Round",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E6MOM x 4 Sets",
            intervalSeconds: 360,
            sets: 4,
            targetSeconds: {
              min: 270,
              max: 300,
            },
            timeCapSeconds: 315,
          },
          {
            type: "note",
            text: "Start rounds at 0:00, 6:00, 12:00, and 18:00. Rest from 24:00 to 26:00, then do one more full round with the same work. The score is only that bonus round. All four earlier rounds must finish under 5:15 for an RX result.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Row",
                    prescription: "20/16 cal",
                  },
                  {
                    name: "Double Unders",
                    reps: 60,
                  },
                  {
                    name: "Echo Bike",
                    prescription: "18/13 cal",
                  },
                  {
                    name: "Wall Walks",
                    reps: 4,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Row",
                    prescription: "18/14 cal",
                  },
                  {
                    name: "Double Unders",
                    reps: 45,
                  },
                  {
                    name: "Echo Bike",
                    prescription: "15/11 cal",
                  },
                  {
                    name: "Wall Walks",
                    reps: 3,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Fast High Knees",
                    prescription: "45 seconds. In place of the row.",
                  },
                  {
                    name: "Line Hops",
                    reps: 60,
                    prescription: "In place of double-unders",
                  },
                  {
                    name: "Mountain Climbers",
                    prescription: "45 seconds. In place of the Echo Bike.",
                  },
                  {
                    name: "Inchworm Push-Ups",
                    reps: 4,
                    prescription: "In place of wall walks",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Bonus round",
          },
          {
            type: "note",
            text: "Go Hard is 20/16 cal row, 60 double-unders, 18/13 cal bike, and 4 wall walks. Standard is 18/14 cal, 45 double-unders, 15/11 cal, and 3 wall walks. The competitor round is 25/20 cal, 75 double-unders, 21/15 cal, and 5 wall walks, and it is not Go Hard. No Equipment times are not comparable.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "game-over",
    title: "Game Over — Front Squat Strength + Deadlift / Toes-to-Bar Sprint",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
                prescription: "Controlled depth",
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Standing Knee-to-Chest Raises",
                reps: 10,
                repsPerSide: 5,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Front Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 4 Sets",
            intervalSeconds: 180,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–4",
                lift: "7 Front Squats",
                percentage: 70,
              },
            ],
          },
          {
            type: "note",
            text: "All four sets are 7 front squats at 70% of your 1-rep max.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Game Over",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time · 21-15-9",
            targetSeconds: {
              min: 240,
              max: 420,
            },
            timeCapSeconds: 480,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Deadlifts",
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                    reps: 21,
                  },
                  {
                    name: "Toes-to-Bar",
                    reps: 21,
                  },
                  {
                    name: "Deadlifts",
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                    reps: 15,
                  },
                  {
                    name: "Toes-to-Bar",
                    reps: 15,
                  },
                  {
                    name: "Deadlifts",
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                    reps: 9,
                  },
                  {
                    name: "Toes-to-Bar",
                    reps: 9,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Deadlifts",
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                    reps: 21,
                  },
                  {
                    name: "Toes-to-Bar",
                    reps: 21,
                  },
                  {
                    name: "Deadlifts",
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                    reps: 15,
                  },
                  {
                    name: "Toes-to-Bar",
                    reps: 15,
                  },
                  {
                    name: "Deadlifts",
                    weight: {
                      male: 185,
                      female: 125,
                      unit: "lb",
                    },
                    reps: 9,
                  },
                  {
                    name: "Toes-to-Bar",
                    reps: 9,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Alternating Single-Leg Glute Bridges",
                    prescription: "Count each rep",
                    reps: 21,
                  },
                  {
                    name: "Lying Leg Raises",
                    prescription: "Bend the knees to scale",
                    reps: 21,
                  },
                  {
                    name: "Alternating Single-Leg Glute Bridges",
                    prescription: "Count each rep",
                    reps: 15,
                  },
                  {
                    name: "Lying Leg Raises",
                    prescription: "Bend the knees to scale",
                    reps: 15,
                  },
                  {
                    name: "Alternating Single-Leg Glute Bridges",
                    prescription: "Count each rep",
                    reps: 9,
                  },
                  {
                    name: "Lying Leg Raises",
                    prescription: "Bend the knees to scale",
                    reps: 9,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 480,
          },
          {
            type: "note",
            text: "Standard is 21–15–9 at 185/125 lb. The gym also shows a separate Iron option of 15–12–9 deadlifts at 225/155 lb with toes-to-bar. The competitor scheme is 25–20–15 and is not Go Hard. No Equipment times are separate.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "multiplayer-mode",
    title: "Multiplayer Mode — Team-of-3 Run & Bodyweight Conditioning",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Low Box-Step Motions",
                reps: 10,
                repsPerSide: 5,
                prescription: "No box required",
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Multiplayer Mode",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time · Teams of 3",
            targetSeconds: {
              min: 1500,
              max: 1800,
            },
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "The run and the rounds happen at the same time. One athlete runs while the other two split the rounds, one working and one resting. Rotate the runner at any time or distance. The score starts when both the distance and the rounds are done.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Run",
                    distance: 5000,
                    unit: "m",
                    prescription: "Combined team distance",
                  },
                  {
                    name: "10 Rounds · Push-Ups",
                    prescription: "20/15",
                  },
                  {
                    name: "10 Rounds · Burpees to a Plate",
                    reps: 15,
                    prescription: "15-lb plate",
                  },
                  {
                    name: "10 Rounds · Box Jump-Overs",
                    reps: 15,
                    prescription: "24/20-inch box",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Run",
                    distance: 4000,
                    unit: "m",
                    prescription: "Combined team distance",
                  },
                  {
                    name: "8 Rounds · Push-Ups",
                    prescription: "20/15",
                  },
                  {
                    name: "8 Rounds · Burpees to a Plate",
                    reps: 15,
                    prescription: "15-lb plate",
                  },
                  {
                    name: "8 Rounds · Box Jump-Overs",
                    reps: 15,
                    prescription: "24/20-inch box",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Run",
                    distance: 3000,
                    unit: "m",
                    prescription:
                      "Combined team distance. Solo times are recorded separately.",
                  },
                  {
                    name: "8 Rounds · Push-Ups",
                    reps: 15,
                    prescription: "Knee push-ups are fine",
                  },
                  {
                    name: "8 Rounds · Burpees",
                    reps: 15,
                  },
                  {
                    name: "8 Rounds · Lateral Line Hops",
                    reps: 15,
                    prescription: "Two-foot or step-over",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 1800,
          },
          {
            type: "note",
            text: "Go Hard and Standard use the same 20/15 push-ups, 15 plate burpees, and 15 box jump-overs. Go Hard is 5,000m and 10 rounds. Standard is 4,000m and 8 rounds. This is not a 3,000m Bronze workout.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "1up",
    title: "1UP — Weighted Pull-Up Strength + Kettlebell Quality Work",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Standing Scapular Retractions",
                reps: 10,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Prone W Raises",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Weighted Strict Pull-Ups",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 5 Sets",
            intervalSeconds: 120,
            sets: 5,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
            ],
            rows: [
              {
                set: "1–5",
                lift: "3 Weighted Strict Pull-Ups + 5 Strict Pull-Ups",
              },
            ],
          },
          {
            type: "note",
            text: "The gym does not prescribe the added weight. Each interval is 3 weighted strict pull-ups plus 5 strict pull-ups.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "1UP",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E4MOM x 4 Sets · For Quality",
            intervalSeconds: 240,
            sets: 4,
          },
          {
            type: "note",
            text: "Move with control. This is completion, not a race.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Alternating Gorilla Rows",
                    reps: 16,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Two kettlebells, alternating",
                  },
                  {
                    name: "Front Rack Reverse Lunges",
                    reps: 10,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Two kettlebells",
                  },
                  {
                    name: "GHD Hip Extensions",
                    reps: 16,
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Alternating Gorilla Rows",
                    reps: 16,
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "Two kettlebells, alternating",
                  },
                  {
                    name: "Front Rack Reverse Lunges",
                    reps: 10,
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "Two kettlebells",
                  },
                  {
                    name: "GHD Hip Extensions",
                    reps: 16,
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Prone Alternating Lat Pull-Downs",
                    reps: 16,
                    repsPerSide: 8,
                  },
                  {
                    name: "Reverse Lunges",
                    reps: 10,
                    repsPerSide: 5,
                  },
                  {
                    name: "Prone Hip Extensions",
                    reps: 16,
                    repsPerSide: 8,
                    prescription: "Alternate lifting each leg",
                  },
                ],
              },
            ],
          },
          {
            type: "note",
            text: "Both kettlebell movements use 53/35 lb on Go Hard and 44/26 lb on Standard. There is no finish time. Mark the interval complete.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "flight-simulation",
    title:
      "Flight Simulation — Push Press Strength + Double-Under / Thruster Ladder",
    category: "upper",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Quick Line Hops",
                reps: 20,
                prescription: "10 forward/back + 10 side-to-side",
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Push Press",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 4 Sets",
            intervalSeconds: 180,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–4",
                lift: "7 Push Presses",
                percentage: 70,
              },
            ],
          },
          {
            type: "note",
            text: "Each set is 7 push presses at 70% of your 1-rep max.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Flight Simulation",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time · 5 Sets",
            sets: 5,
            targetSeconds: {
              min: 360,
              max: 480,
            },
            timeCapSeconds: 600,
          },
          {
            type: "note",
            text: "Do the jumps, then 12 thrusters. That pair happens five times.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Set 1 · Double Unders",
                    reps: 24,
                  },
                  {
                    name: "Set 1 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 2 · Double Unders",
                    reps: 48,
                  },
                  {
                    name: "Set 2 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 3 · Double Unders",
                    reps: 72,
                  },
                  {
                    name: "Set 3 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 4 · Double Unders",
                    reps: 48,
                  },
                  {
                    name: "Set 4 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 5 · Double Unders",
                    reps: 24,
                  },
                  {
                    name: "Set 5 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 75,
                      female: 55,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Set 1 · Double Unders",
                    reps: 24,
                  },
                  {
                    name: "Set 1 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 2 · Double Unders",
                    reps: 36,
                  },
                  {
                    name: "Set 2 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 3 · Double Unders",
                    reps: 48,
                  },
                  {
                    name: "Set 3 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 4 · Double Unders",
                    reps: 36,
                  },
                  {
                    name: "Set 4 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                  {
                    name: "Set 5 · Double Unders",
                    reps: 24,
                  },
                  {
                    name: "Set 5 · Thrusters",
                    reps: 12,
                    weight: {
                      male: 65,
                      female: 45,
                      unit: "lb",
                    },
                    prescription: "Control the bar down from overhead",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Set 1 · Two-Foot Line Hops",
                    reps: 24,
                  },
                  {
                    name: "Set 1 · Air-Squat-to-Overhead Reaches",
                    reps: 12,
                  },
                  {
                    name: "Set 2 · Two-Foot Line Hops",
                    reps: 48,
                  },
                  {
                    name: "Set 2 · Air-Squat-to-Overhead Reaches",
                    reps: 12,
                  },
                  {
                    name: "Set 3 · Two-Foot Line Hops",
                    reps: 72,
                  },
                  {
                    name: "Set 3 · Air-Squat-to-Overhead Reaches",
                    reps: 12,
                  },
                  {
                    name: "Set 4 · Two-Foot Line Hops",
                    reps: 48,
                  },
                  {
                    name: "Set 4 · Air-Squat-to-Overhead Reaches",
                    reps: 12,
                  },
                  {
                    name: "Set 5 · Two-Foot Line Hops",
                    reps: 24,
                  },
                  {
                    name: "Set 5 · Air-Squat-to-Overhead Reaches",
                    reps: 12,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 600,
          },
          {
            type: "note",
            text: "Go Hard thrusters are 75/55 lb. Standard stays at 12 thrusters and 65/45 lb. The Masters option of 10 thrusters and the competitor load of 95/65 lb are not used. No Equipment times are separate.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "lucky-numbers",
    title:
      "Lucky Numbers — Deadlift Strength + Dumbbell Cleans / Burpee Box Jump Overs",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Deadlift",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 4 Sets",
            intervalSeconds: 150,
            sets: 4,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: 1,
                lift: "7 Deadlifts",
                percentage: 60,
              },
              {
                set: 2,
                lift: "5 Deadlifts",
                percentage: 65,
              },
              {
                set: 3,
                lift: "5 Deadlifts",
                percentage: 70,
              },
              {
                set: 4,
                lift: "3 Deadlifts",
                percentage: 75,
              },
            ],
          },
          {
            type: "note",
            text: "Percentages are of your deadlift 1-rep max.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Lucky Numbers",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2:30 x 6 Sets · Work Inside 2:00",
            intervalSeconds: 150,
            sets: 6,
            timeCapSeconds: 120,
          },
          {
            type: "note",
            text: "Each interval starts on the 2:30 clock. Aim for about 1:30. Rest whatever is left after the 2:00 cap.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Two-Dumbbell Power Cleans",
                    reps: 9,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                  {
                    name: "Burpee Box-Facing Jump-Overs",
                    prescription:
                      "5, then 6, then 7, then 8, then 9, then 10. 24/20-inch box. One quantity per interval.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Two-Dumbbell Power Cleans",
                    reps: 9,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Each dumbbell",
                  },
                  {
                    name: "Burpee Box-Facing Jump-Overs",
                    prescription:
                      "5, then 6, then 7, then 8, then 9, then 10. 24/20-inch box. One quantity per interval.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Squat-to-Calf-Raise + Overhead Reach",
                    reps: 9,
                    prescription: "Fast overhead reach",
                  },
                  {
                    name: "Burpee Lateral Line Hops",
                    prescription:
                      "5, then 6, then 7, then 8, then 9, then 10. One quantity per interval.",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Slowest set",
          },
          {
            type: "note",
            text: "Go Hard dumbbells are 50/35 lb and Standard dumbbells are 35/25 lb. Both use the 5 through 10 burpee sequence. The Masters sequence of 4 through 9 and the competitor dumbbells of 70/50 lb are not used. No Equipment times stay separate.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "chad-1000x",
    title: "Chad 1000X — 1,000 Weighted Box Step-Ups",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Brisk Walk",
                prescription: "5 minutes. Or an easy jog.",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Standing Knee Drives",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Standing Calf Raises",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Chad 1000X",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time",
            timeCapSeconds: 3600,
          },
          {
            type: "note",
            text: "The source has one prescription and no Steel or Iron split. Go Hard and Standard are the same workout. Pace the reps and reduce the volume if you need to. There is no strength portion.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Box Step-Ups",
                    reps: 1000,
                    weight: {
                      male: 45,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "20-inch box. The load is the ruck.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Box Step-Ups",
                    reps: 1000,
                    weight: {
                      male: 45,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "20-inch box. The load is the ruck.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "20 Rounds · Alternating Reverse Lunges",
                    reps: 25,
                    prescription: "Total reps",
                  },
                  {
                    name: "20 Rounds · Standing High-Knee Drives",
                    reps: 25,
                    prescription: "Total reps",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 3600,
          },
          {
            type: "note",
            text: "In honor of Navy SEAL Senior Chief Chad Wilkinson. The no-equipment version is 1,000 bodyweight reps and is not an RX Chad 1000X time.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "friends-and-family",
    title: "Friends and Family — Partner Pull-Ups, Lunges, Burpees & Row",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
                prescription: "Easy",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Retractions",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 8,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Friends and Family",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "For Time · Teams of 2",
            targetSeconds: {
              min: 1380,
              max: 1680,
            },
            timeCapSeconds: 1920,
          },
          {
            type: "note",
            text: "One partner works while the other rests, and you can split those reps. Both partners do the synchronized burpees together.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Strict Pull-Ups",
                    prescription: "60/45",
                  },
                  {
                    name: "Stationary Farmer Lunges",
                    reps: 32,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Two dumbbells",
                  },
                  {
                    name: "AbMat Sit-Ups",
                    reps: 120,
                  },
                  {
                    name: "Stationary Farmer Lunges",
                    reps: 32,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Two dumbbells",
                  },
                  {
                    name: "CFCH Synchro Burpees",
                    reps: 60,
                  },
                  {
                    name: "Stationary Farmer Lunges",
                    reps: 32,
                    weight: {
                      male: 50,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "Two dumbbells",
                  },
                  {
                    name: "CFCH Synchro Burpees",
                    reps: 60,
                  },
                  {
                    name: "Row",
                    prescription: "120/90 cal",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Strict Pull-Ups",
                    prescription: "40/30",
                  },
                  {
                    name: "Stationary Farmer Lunges",
                    reps: 32,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Two dumbbells",
                  },
                  {
                    name: "AbMat Sit-Ups",
                    reps: 100,
                  },
                  {
                    name: "Stationary Farmer Lunges",
                    reps: 32,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Two dumbbells",
                  },
                  {
                    name: "CFCH Synchro Burpees",
                    reps: 48,
                  },
                  {
                    name: "Stationary Farmer Lunges",
                    reps: 32,
                    weight: {
                      male: 35,
                      female: 25,
                      unit: "lb",
                    },
                    prescription: "Two dumbbells",
                  },
                  {
                    name: "CFCH Synchro Burpees",
                    reps: 48,
                  },
                  {
                    name: "Row",
                    prescription: "100/80 cal",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Prone Lat Pull-Downs",
                    reps: 60,
                    prescription:
                      "On the floor. Squeeze the elbows toward the ribs.",
                  },
                  {
                    name: "Alternating Stationary Reverse Lunges",
                    reps: 32,
                  },
                  {
                    name: "Sit-Ups",
                    reps: 100,
                  },
                  {
                    name: "Alternating Stationary Reverse Lunges",
                    reps: 32,
                  },
                  {
                    name: "Synchronized Burpees",
                    reps: 40,
                  },
                  {
                    name: "Alternating Stationary Reverse Lunges",
                    reps: 32,
                  },
                  {
                    name: "Synchronized Burpees",
                    reps: 40,
                  },
                  {
                    name: "Shared Run",
                    distance: 1200,
                    unit: "m",
                    prescription: "In place of the row",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total team time",
            timeCapSeconds: 1920,
          },
          {
            type: "note",
            text: "Go Hard dumbbells stay 50/35 lb. The competitor load of 70/50 lb is not used. Standard is 35/25 lb, with fewer pull-ups, sit-ups, burpees, and row calories. No Equipment is its own version.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "landing-gear",
    title: "Landing Gear — Bench Press, A-Jumps, Kettlebell Swings & Echo Bike",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
                prescription: "Easy",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Hip Hinges",
                reps: 12,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Light Pogo Hops",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Landing Gear",
        blocks: [
          {
            type: "protocol",
            format: "emom",
            label: "25-Minute OTM · 5 Cycles",
            intervalSeconds: 60,
          },
          {
            type: "note",
            text: "Cycle A through E five times, one station each minute. Finish every station in under 30 seconds except the bike. This is completion, not a max-rep effort.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Minute A · Bench Press",
                    reps: 10,
                    prescription: "60% of 1-rep max",
                  },
                  {
                    name: "Minute B · “A” Jumps",
                    reps: 12,
                    prescription: "To a 15-lb plate",
                  },
                  {
                    name: "Minute C · Kettlebell Swings",
                    reps: 14,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Minute D · Echo Bike",
                    prescription: "16/12 cal",
                  },
                  {
                    name: "Minute E · Rest",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Minute A · Bench Press",
                    reps: 10,
                    prescription: "60% of 1-rep max",
                  },
                  {
                    name: "Minute B · “A” Jumps",
                    reps: 12,
                    prescription: "To a 15-lb plate",
                  },
                  {
                    name: "Minute C · Kettlebell Swings",
                    reps: 14,
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Minute D · Echo Bike",
                    prescription: "14/10 cal",
                  },
                  {
                    name: "Minute E · Rest",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Minute A · Push-Ups",
                    reps: 10,
                  },
                  {
                    name: "Minute B · A-Jumps",
                    reps: 12,
                    prescription: "In place, no plate",
                  },
                  {
                    name: "Minute C · Fast Hip Hinges",
                    reps: 14,
                    prescription: "Strong glute squeeze",
                  },
                  {
                    name: "Minute D · Fast High Knees",
                    prescription:
                      "40 seconds. The under-30 target does not apply here.",
                  },
                  {
                    name: "Minute E · Rest",
                  },
                ],
              },
            ],
          },
          {
            type: "note",
            text: "Both loaded versions use 10 bench presses at 60% and 12 “A” jumps. Kettlebells are 53/35 lb on Go Hard and 44/26 lb on Standard. The competitor bench at 65%, 70/53 lb kettlebells, and 18/14 bike calories are not Go Hard. Mark the workout complete.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "i-robot",
    title:
      "I, Robot — Front Squat Strength + Toes-to-Bar, Wall Walks & KB Cleans",
    category: "lower",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
                prescription: "Easy",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 10,
                repsPerSide: 5,
              },
              {
                name: "Scapular Push-Ups",
                reps: 8,
              },
              {
                name: "Downward-Dog Shoulder Taps",
                reps: 8,
                repsPerSide: 4,
              },
              {
                name: "Standing Knee Raises",
                reps: 10,
                repsPerSide: 5,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Front Squat",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E3MOM x 5 Sets",
            intervalSeconds: 180,
            sets: 5,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–5",
                lift: "5 Front Squats",
                percentage: 75,
              },
            ],
          },
          {
            type: "note",
            text: "Each set is 5 front squats at 75% of your 1-rep max.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "I, Robot",
        blocks: [
          {
            type: "protocol",
            format: "forTime",
            label: "3 Rounds For Time",
            rounds: 3,
            targetSeconds: {
              min: 540,
              max: 720,
            },
            timeCapSeconds: 900,
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Toes-to-Bar",
                    reps: 16,
                  },
                  {
                    name: "Wall Walks",
                    reps: 4,
                  },
                  {
                    name: "Single-Kettlebell Hang Squat Cleans",
                    reps: 8,
                    perSide: true,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                    prescription: "8 right / 8 left",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Toes-to-Bar",
                    reps: 12,
                  },
                  {
                    name: "Wall Walks",
                    reps: 3,
                  },
                  {
                    name: "Single-Kettlebell Hang Squat Cleans",
                    reps: 8,
                    perSide: true,
                    weight: {
                      male: 44,
                      female: 26,
                      unit: "lb",
                    },
                    prescription: "8 right / 8 left",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Lying Leg Raises",
                    reps: 12,
                    prescription: "Bend the knees if needed",
                  },
                  {
                    name: "Inchworm Push-Ups",
                    reps: 3,
                  },
                  {
                    name: "Alternating Reverse Lunge to Knee Drive",
                    reps: 8,
                    perSide: true,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "time",
            label: "Total completion time",
            timeCapSeconds: 900,
          },
          {
            type: "note",
            text: "Go Hard is 16 toes-to-bar, 4 wall walks, and 53/35 lb kettlebells. Standard is 12 toes-to-bar, 3 wall walks, and 44/26 lb. The competitor option of 20 toes-to-bar and 70/53 lb kettlebells is not Go Hard. No Equipment times are separate.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "ex-machina",
    title: "Ex Machina — Row, Echo Bike & Burpee Box Jump Overs",
    category: "endurance",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
                prescription: "Easy",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Alternating Reverse Lunges",
                reps: 8,
                repsPerSide: 4,
              },
              {
                name: "Squat-to-Plank Walkouts",
                reps: 10,
              },
              {
                name: "Light Line Hops",
                reps: 20,
              },
            ],
          },
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Ex Machina",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "5 x 2-Minute AMRAP · 2 Minutes Rest",
            intervalSeconds: 240,
            sets: 5,
          },
          {
            type: "note",
            text: "Each interval is the row, then the bike, then burpee box jump-overs in the time left. Rest 2 minutes between intervals. Finish every calorie for an RX score. The target is 40 burpee box jump-overs.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Interval 1 · Row",
                    prescription: "7/5 cal",
                  },
                  {
                    name: "Interval 1 · Echo Bike",
                    prescription: "7/5 cal",
                  },
                  {
                    name: "Interval 1 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 2 · Row",
                    prescription: "7/5 cal",
                  },
                  {
                    name: "Interval 2 · Echo Bike",
                    prescription: "7/5 cal",
                  },
                  {
                    name: "Interval 2 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 3 · Row",
                    prescription: "9/7 cal",
                  },
                  {
                    name: "Interval 3 · Echo Bike",
                    prescription: "9/7 cal",
                  },
                  {
                    name: "Interval 3 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 4 · Row",
                    prescription: "12/9 cal",
                  },
                  {
                    name: "Interval 4 · Echo Bike",
                    prescription: "12/9 cal",
                  },
                  {
                    name: "Interval 4 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 5 · Row",
                    prescription: "12/9 cal",
                  },
                  {
                    name: "Interval 5 · Echo Bike",
                    prescription: "12/9 cal",
                  },
                  {
                    name: "Interval 5 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                ],
              },
              {
                id: "standard",
                label: "Standard",
                movements: [
                  {
                    name: "Interval 1 · Row",
                    prescription: "6/4 cal",
                  },
                  {
                    name: "Interval 1 · Echo Bike",
                    prescription: "6/4 cal",
                  },
                  {
                    name: "Interval 1 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 2 · Row",
                    prescription: "6/4 cal",
                  },
                  {
                    name: "Interval 2 · Echo Bike",
                    prescription: "6/4 cal",
                  },
                  {
                    name: "Interval 2 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 3 · Row",
                    prescription: "8/6 cal",
                  },
                  {
                    name: "Interval 3 · Echo Bike",
                    prescription: "8/6 cal",
                  },
                  {
                    name: "Interval 3 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 4 · Row",
                    prescription: "10/8 cal",
                  },
                  {
                    name: "Interval 4 · Echo Bike",
                    prescription: "10/8 cal",
                  },
                  {
                    name: "Interval 4 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                  {
                    name: "Interval 5 · Row",
                    prescription: "10/8 cal",
                  },
                  {
                    name: "Interval 5 · Echo Bike",
                    prescription: "10/8 cal",
                  },
                  {
                    name: "Interval 5 · Burpee Box Jump-Overs",
                    prescription: "Max reps in the time left. 24/20-inch box.",
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "High-Knee Runs in Place",
                    reps: 20,
                    repsPerSide: 10,
                  },
                  {
                    name: "Mountain Climbers",
                    reps: 20,
                    repsPerSide: 10,
                  },
                  {
                    name: "Burpees + Lateral Line Hops",
                    prescription:
                      "Max in the time left. One hop per burpee. Same work each interval.",
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "reps",
            label: "Total burpee box jump-overs",
          },
          {
            type: "note",
            text: "Add the burpee box jump-overs from all 5 intervals. The competitor calorie ladder and 30/24-inch box are not Go Hard. No Equipment scores burpees plus line hops and is not an RX score.",
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: "terminator",
    title:
      "Terminator — Clean & Jerk Strength + HSPU, Deadlift & KB Swing AMRAP",
    category: "olympic",
    sections: [
      {
        id: "warmup",
        type: "warmup",
        title: "Warm-Up",
        blocks: [
          {
            type: "heading",
            text: "Cardio",
          },
          {
            type: "movementList",
            items: [
              {
                name: "Jog",
                distance: 1,
                unit: "mile",
                prescription: "Easy",
              },
            ],
          },
          {
            type: "heading",
            text: "Mobility & Activation",
          },
          {
            type: "movementList",
            items: [
              {
                name: "PVC Pipe Passovers",
                reps: 10,
              },
              {
                name: "Shoulder External/Internal Rotations",
                reps: 10,
                perSide: true,
              },
              {
                name: "Cat-Cows",
                reps: 10,
              },
              {
                name: "Supine Spinal Twists (Lying Knee Crossovers)",
                reps: 8,
                perSide: true,
              },
              {
                name: "Glute Bridges",
                reps: 12,
              },
              {
                name: "Upward Dog → Downward Dog → Runners",
                reps: 5,
              },
              {
                name: "Hip Hinges",
                reps: 10,
              },
              {
                name: "Air Squats",
                reps: 10,
              },
              {
                name: "Scapular Push-Ups",
                reps: 10,
              },
              {
                name: "Downward-Dog Shoulder Taps",
                reps: 8,
                repsPerSide: 4,
              },
              {
                name: "Pike-to-Plank Transitions",
                reps: 8,
              },
            ],
          },
        ],
      },
      {
        id: "strength",
        type: "strength",
        title: "Clean and Jerk",
        blocks: [
          {
            type: "protocol",
            format: "interval",
            label: "E2MOM x 6 Sets",
            intervalSeconds: 120,
            sets: 6,
          },
          {
            type: "setTable",
            columns: [
              {
                key: "set",
                label: "Set",
              },
              {
                key: "lift",
                label: "Lift",
              },
              {
                key: "percentage",
                label: "%",
              },
            ],
            rows: [
              {
                set: "1–6",
                lift: "1 Power Clean + 2 Split Jerks",
                percentage: "65%, then build",
              },
            ],
          },
          {
            type: "note",
            text: "Start near 65% of the limiting lift and build to heavy.",
          }
        ],
      },
      {
        id: "conditioning",
        type: "conditioning",
        title: "Terminator",
        blocks: [
          {
            type: "protocol",
            format: "amrap",
            label: "10-Minute AMRAP",
            timeCapSeconds: 600,
          },
          {
            type: "note",
            text: "The Iron prescription is cut off in the source, so there is no Standard version. The target for Go Hard is 4 or 5 rounds.",
          },
          {
            type: "variants",
            options: [
              {
                id: "goHard",
                label: "Go Hard",
                movements: [
                  {
                    name: "Strict Handstand Push-Ups",
                    prescription: "4, 6, 8, 10, 12… add 2 each round",
                  },
                  {
                    name: "Deadlifts",
                    reps: 8,
                    weight: {
                      male: 225,
                      female: 155,
                      unit: "lb",
                    },
                  },
                  {
                    name: "Kettlebell Swings",
                    reps: 12,
                    weight: {
                      male: 53,
                      female: 35,
                      unit: "lb",
                    },
                  },
                ],
              },
              {
                id: "noEquipment",
                label: "No Equipment",
                movements: [
                  {
                    name: "Pike Push-Ups",
                    prescription: "4, 6, 8, 10, 12… add 2 each round",
                  },
                  {
                    name: "Alternating Single-Leg Glute Bridges",
                    reps: 8,
                    repsPerSide: 4,
                  },
                  {
                    name: "Air Squats to Calf Raises",
                    reps: 12,
                  },
                ],
              },
            ],
          },
          {
            type: "score",
            metric: "rounds",
            label: "Rounds + reps",
          },
          {
            type: "note",
            text: "Go Hard deadlifts are 225/155 lb and kettlebell swings are 53/35 lb. The competitor kettlebell of 70/53 lb is not used. No Equipment is a separate score.",
          },
        ],
      },
    ],
  },
];
