export function uid(): string {
  return "cad_" + Math.random().toString(36).substring(2, 9);
}
