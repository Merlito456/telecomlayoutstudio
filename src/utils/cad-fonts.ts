/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CADFontOption {
  id: string;
  name: string;
  family: string;
  category: 'cad' | 'sans' | 'mono' | 'architectural' | 'serif';
  categoryLabel: string;
  description: string;
  badge: string;
}

export const CAD_FONTS: CADFontOption[] = [
  {
    id: 'titillium-web',
    name: 'Titillium Web',
    family: '"Titillium Web", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: 'cad',
    categoryLabel: 'CAD & Engineering',
    description: 'ISO standard engineering linework & technical equipment tagging',
    badge: 'ISO CAD',
  },
  {
    id: 'rajdhani',
    name: 'Rajdhani',
    family: '"Rajdhani", -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'cad',
    categoryLabel: 'CAD & Engineering',
    description: 'Crisp technical blueprint lettering with squared industrial curves',
    badge: 'Blueprint',
  },
  {
    id: 'oswald',
    name: 'Oswald (DIN)',
    family: '"Oswald", sans-serif',
    category: 'cad',
    categoryLabel: 'CAD & Engineering',
    description: 'DIN 1451 industrial condensed lettering for title blocks & headers',
    badge: 'DIN Title',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: 'sans',
    categoryLabel: 'Clean Sans-Serif',
    description: 'Ultra-legible modern typographic standard for UI and blueprints',
    badge: 'Modern Sans',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: '"Roboto", -apple-system, BlinkMacSystemFont, Arial, sans-serif',
    category: 'sans',
    categoryLabel: 'Clean Sans-Serif',
    description: 'Geometric yet friendly engineering standard for site specifications',
    badge: 'Standard Sans',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    category: 'mono',
    categoryLabel: 'Monospace & Telecom',
    description: 'Fixed-width precision telemetry, GPS coordinates & cable runs',
    badge: 'Telecom Mono',
  },
  {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    family: '"Roboto Mono", ui-monospace, Menlo, monospace',
    category: 'mono',
    categoryLabel: 'Monospace & Telecom',
    description: 'Engineering fixed pitch for slot numbers, racks & station tables',
    badge: 'Eng Mono',
  },
  {
    id: 'architects-daughter',
    name: "Architect's Daughter",
    family: '"Architects Daughter", cursive, sans-serif',
    category: 'architectural',
    categoryLabel: 'Architectural Hand-Drawn',
    description: 'Hand-lettered architectural drafting style for notes & sketches',
    badge: 'Hand Draft',
  },
  {
    id: 'system-sans',
    name: 'Arial / System Sans',
    family: 'Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'sans',
    categoryLabel: 'Clean Sans-Serif',
    description: 'Universal fallback drafting typeface for cross-platform AutoCAD parity',
    badge: 'Universal',
  },
  {
    id: 'courier-new',
    name: 'Courier New',
    family: '"Courier New", Courier, monospace',
    category: 'mono',
    categoryLabel: 'Monospace & Telecom',
    description: 'Classic telecom teletype & electrical schedule printouts',
    badge: 'Teletype',
  },
  {
    id: 'georgia',
    name: 'Georgia',
    family: 'Georgia, "Times New Roman", serif',
    category: 'serif',
    categoryLabel: 'Formal Specification',
    description: 'Formal contractual notices, legal covenants & title block signatures',
    badge: 'Formal Serif',
  },
];

export const DEFAULT_CAD_FONT_ID = 'titillium-web';
export const DEFAULT_CAD_FONT = CAD_FONTS[0];

/**
 * Find a CADFontOption by its ID or fallback to default
 */
export function getCADFontById(id?: string): CADFontOption {
  if (!id) return DEFAULT_CAD_FONT;
  const match = CAD_FONTS.find((f) => f.id === id);
  if (match) return match;
  // If family was passed as id
  const byFamily = CAD_FONTS.find(
    (f) => f.family.toLowerCase().includes(id.toLowerCase()) || f.name.toLowerCase() === id.toLowerCase()
  );
  return byFamily || DEFAULT_CAD_FONT;
}

/**
 * Returns a clean, safe CSS font-family string from font id or family string
 */
export function getSafeFontCss(fontFamilyOrId?: string): string {
  if (!fontFamilyOrId) return DEFAULT_CAD_FONT.family;
  const match = CAD_FONTS.find(
    (f) =>
      f.id === fontFamilyOrId ||
      f.name.toLowerCase() === fontFamilyOrId.toLowerCase() ||
      f.family === fontFamilyOrId
  );
  if (match) return match.family;
  // If user provided custom font family string with quotes
  return fontFamilyOrId;
}

/**
 * Formats full ctx.font string with style, weight, size, and font family
 */
export function buildCanvasFont(
  fontSize: number,
  options?: {
    bold?: boolean;
    italic?: boolean;
    fontFamily?: string;
  }
): string {
  const fontStyle = options?.italic ? 'italic ' : '';
  const fontWeight = options?.bold ? 'bold ' : 'normal ';
  const family = getSafeFontCss(options?.fontFamily);
  return `${fontStyle}${fontWeight}${fontSize}px ${family}`;
}
