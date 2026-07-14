const SLOTS_VALIDOS = new Set(["head", "chest", "hands", "legs", "feet", "weapon", "consumable"]);

export function iconePorSlot(slot) {
  return SLOTS_VALIDOS.has(slot) ? slot : "generico";
}
