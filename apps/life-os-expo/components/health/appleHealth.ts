import { Platform } from "react-native";
import { addDays, parseLocalDateKey } from "@/utils/calorieWeek";

const STEP_COUNT = "HKQuantityTypeIdentifierStepCount" as const;

async function loadHealthKit() {
  try {
    return await import("@kingstinct/react-native-healthkit");
  } catch {
    throw new Error(
      "Apple Health needs a new iOS build. Rebuild the app, then try again.",
    );
  }
}

export async function requestStepCountAccess() {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Health is only available on iOS.");
  }

  const healthkit = await loadHealthKit();
  if (!healthkit.isHealthDataAvailable()) {
    throw new Error("Apple Health is not available on this device.");
  }

  const accepted = await healthkit.requestAuthorization({
    toRead: [STEP_COUNT],
  });
  if (!accepted) {
    throw new Error(
      "Apple Health did not grant access. Allow Steps for lifeOS in the Health app, then try again.",
    );
  }
}

/** Local step total for a calendar day. Null when HealthKit cannot be read. */
export async function readStepCount(dateKey: string): Promise<number | null> {
  if (Platform.OS !== "ios") return null;

  try {
    const healthkit = await loadHealthKit();
    if (!healthkit.isHealthDataAvailable()) return null;

    const start = parseLocalDateKey(dateKey);
    const end = new Date(addDays(start, 1).getTime() - 1);
    const result = await healthkit.queryStatisticsForQuantity(
      STEP_COUNT,
      ["cumulativeSum"],
      {
        unit: "count",
        filter: {
          date: { startDate: start, endDate: end },
        },
      },
    );
    const quantity = result.sumQuantity?.quantity;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) return 0;
    return Math.max(0, Math.round(quantity));
  } catch {
    return null;
  }
}
