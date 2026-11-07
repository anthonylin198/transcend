type CalloutPerson = {
  profileId: string;
  name: string;
  todaySteps: number;
};

export type CalloutRoll = {
  profileId: string;
  role: "top" | "bottom";
  index: number;
};

const TOP_COUNT = 3;
const BOTTOM_COUNT = 3;

function pickOne<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** One visit, one joke. Top or bottom for today, stable until the card remounts. */
export function rollCallout(people: CalloutPerson[]): CalloutRoll | null {
  if (people.length === 0) return null;
  const max = Math.max(...people.map((person) => person.todaySteps));
  const min = Math.min(...people.map((person) => person.todaySteps));
  const role: CalloutRoll["role"] =
    max === min
      ? max > 0
        ? "top"
        : "bottom"
      : Math.random() < 0.5
        ? "top"
        : "bottom";
  const pool = people.filter(
    (person) => person.todaySteps === (role === "top" ? max : min),
  );
  const person = pickOne(pool);
  const count = role === "top" ? TOP_COUNT : BOTTOM_COUNT;
  return {
    profileId: person.profileId,
    role,
    index: Math.floor(Math.random() * count),
  };
}

export function calloutLine(
  roll: CalloutRoll,
  name: string,
  stepsLabel: string,
) {
  const you = name === "You";
  if (roll.role === "top") {
    const lines = [
      you
        ? `You're fucking it up with ${stepsLabel} steps today.`
        : `${name} is fucking it up with ${stepsLabel} steps today.`,
      you
        ? `You woke up and chose violence. ${stepsLabel} steps today.`
        : `${name} woke up and chose violence. ${stepsLabel} steps today.`,
      you
        ? `${stepsLabel} steps today. The rest of the group is watching you.`
        : `${name} has ${stepsLabel} steps today. Everyone else is watching.`,
    ];
    return lines[roll.index] ?? lines[0]!;
  }
  const lines = [
    you
      ? `You're dead last with ${stepsLabel} steps. Get your ass moving.`
      : `${name} is being lazy as shit. ${stepsLabel} steps. Tell them to get moving.`,
    you
      ? `${stepsLabel} steps today. That ain't it. Move.`
      : `${name} has ${stepsLabel} steps today. Tell their ass to get moving.`,
    you
      ? `Lowest today, and it's you. The group is waiting.`
      : `Lowest today is ${name}. Tell their ass to get moving.`,
  ];
  return lines[roll.index] ?? lines[0]!;
}
