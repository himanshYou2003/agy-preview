import { ExtractedTokens } from '../protocol/types.js';

/**
 * Extracts design tokens (CSS variables, colors, typography, border radius)
 * from a raw CSS string.
 */
export function extractTokensFromCss(css: string): ExtractedTokens {
  const colors: Record<string, string> = {};
  const typography: Record<string, string> = {};
  const radii: Record<string, string> = {};
  const rawVarMatches: string[] = [];

  if (!css || typeof css !== 'string') {
    return {
      colors,
      typography,
      radii,
      cssVariables: ':root {}'
    };
  }

  // 1. Match custom properties: --name: value;
  const customPropRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = customPropRegex.exec(css)) !== null) {
    const propName = match[1].trim();
    const propVal = match[2].trim();
    rawVarMatches.push(`  --${propName}: ${propVal};`);

    if (/color|bg|background|border|accent|text|primary|secondary|surface/i.test(propName)) {
      colors[propName] = propVal;
    } else if (/font|family|serif|sans|mono/i.test(propName)) {
      typography[propName] = propVal;
    } else if (/radius|rounded/i.test(propName)) {
      radii[propName] = propVal;
    }
  }

  // 2. Fallback: If no CSS variables were explicitly declared, scan standard declarations
  if (Object.keys(colors).length === 0) {
    const hexColorRegex = /#([a-fA-F0-9]{3,8})\b/g;
    const foundHexes = new Set<string>();
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexColorRegex.exec(css)) !== null) {
      foundHexes.add(hexMatch[0]);
    }
    let colorIdx = 1;
    for (const hex of foundHexes) {
      if (colorIdx > 6) break;
      colors[`color-${colorIdx}`] = hex;
      rawVarMatches.push(`  --color-${colorIdx}: ${hex};`);
      colorIdx++;
    }
  }

  if (Object.keys(typography).length === 0) {
    const fontRegex = /font-family\s*:\s*([^;]+);/i;
    const fontMatch = fontRegex.exec(css);
    if (fontMatch) {
      typography['font-family'] = fontMatch[1].trim();
      rawVarMatches.push(`  --font-family: ${fontMatch[1].trim()};`);
    }
  }

  if (Object.keys(radii).length === 0) {
    const radiusRegex = /border-radius\s*:\s*([^;]+);/i;
    const radMatch = radiusRegex.exec(css);
    if (radMatch) {
      radii['border-radius'] = radMatch[1].trim();
      rawVarMatches.push(`  --border-radius: ${radMatch[1].trim()};`);
    }
  }

  const cssVariables = rawVarMatches.length > 0
    ? `:root {\n${rawVarMatches.join('\n')}\n}`
    : ':root {}';

  return {
    colors,
    typography,
    radii,
    cssVariables
  };
}
