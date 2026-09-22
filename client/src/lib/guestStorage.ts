/** Local keys that must not persist nutrition data for signed-out users. */
const GUEST_NUTRITION_KEYS = [
  'weeklyMeals',
  'guestMeals',
] as const;

export function clearGuestNutritionStorage(): void {
  for (const key of GUEST_NUTRITION_KEYS) {
    localStorage.removeItem(key);
  }
}
