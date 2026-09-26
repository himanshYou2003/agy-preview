import { describe, it, expect } from 'vitest';
import { extractTokensFromCss } from '../src/tokens/token-extractor.js';

describe('Token Extractor', () => {
  it('extracts custom properties from :root correctly', () => {
    const css = `
      :root {
        --primary-color: #3b82f6;
        --surface-bg: #09090b;
        --border-color: #27272a;
        --font-heading: 'Playfair Display', serif;
        --border-radius: 12px;
      }
      .card { background: var(--surface-bg); }
    `;

    const tokens = extractTokensFromCss(css);
    expect(tokens.colors['primary-color']).toBe('#3b82f6');
    expect(tokens.colors['surface-bg']).toBe('#09090b');
    expect(tokens.typography['font-heading']).toBe("'Playfair Display', serif");
    expect(tokens.radii['border-radius']).toBe('12px');
    expect(tokens.cssVariables).toContain('--primary-color: #3b82f6;');
  });

  it('handles css with standard hex codes and fonts when no variables are declared', () => {
    const css = `
      .card {
        background: #18181b;
        color: #f4f4f5;
        font-family: Inter, sans-serif;
        border-radius: 8px;
      }
    `;

    const tokens = extractTokensFromCss(css);
    expect(Object.keys(tokens.colors).length).toBeGreaterThan(0);
    expect(tokens.typography['font-family']).toBe('Inter, sans-serif');
    expect(tokens.radii['border-radius']).toBe('8px');
  });

  it('returns empty root block on empty or non-string css', () => {
    const tokens = extractTokensFromCss('');
    expect(tokens.cssVariables).toBe(':root {}');
    expect(tokens.colors).toEqual({});

    const nonString = extractTokensFromCss(null as any);
    expect(nonString.cssVariables).toBe(':root {}');
  });

  it('extracts radius and rounded custom properties correctly', () => {
    const css = `
      :root {
        --card-radius: 14px;
        --btn-rounded: 6px;
      }
    `;
    const tokens = extractTokensFromCss(css);
    expect(tokens.radii['card-radius']).toBe('14px');
    expect(tokens.radii['btn-rounded']).toBe('6px');
  });

  it('returns :root {} when css has rules but no design tokens or custom variables', () => {
    const css = '.container { display: flex; width: 100%; margin: 0; }';
    const tokens = extractTokensFromCss(css);
    expect(tokens.cssVariables).toBe(':root {}');
    expect(tokens.colors).toEqual({});
  });

  it('caps extracted hex colors at 6 when numerous raw colors are present', () => {
    const css = '.palette { color: #111; border-color: #222; background: #333; outline-color: #444; text-decoration-color: #555; fill: #666; stroke: #777; stop-color: #888; }';
    const tokens = extractTokensFromCss(css);
    expect(Object.keys(tokens.colors).length).toBe(6);
    expect(tokens.colors['color-6']).toBe('#666');
  });
});
