import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { wods } from "../../../apps/fit-os-expo/data/wods.ts";
import {
  WOD_CYCLE_START,
  wodSchedule,
} from "../../../apps/fit-os-expo/data/wodSchedule.ts";

const args = {
  cycleStart: WOD_CYCLE_START,
  wodSlugs: [...wodSchedule],
  wods: wods.map((wod) => ({
    slug: wod.id,
    schemaVersion: wod.schemaVersion,
    title: wod.title,
    category: wod.category,
    ...(wod.date ? { date: wod.date } : {}),
    sections: wod.sections,
  })),
};

const result = spawnSync(
  "npx",
  ["convex", "run", "wods/seedIfEmpty:seedIfEmpty", JSON.stringify(args)],
  {
    cwd: join(import.meta.dirname, ".."),
    stdio: "inherit",
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
