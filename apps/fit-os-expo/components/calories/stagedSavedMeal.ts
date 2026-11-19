type StagedSavedMeal = {
  calories: number;
  proteinG: number;
  description: string;
};

let staged: StagedSavedMeal | null = null;

export function stageSavedMeal(meal: StagedSavedMeal) {
  staged = meal;
}

export function takeStagedSavedMeal() {
  const meal = staged;
  staged = null;
  return meal;
}
