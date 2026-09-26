import { describe, it, expect } from 'vitest';
import { validateDecisionRequest, validateVisualVariant, ValidationError } from '../src/protocol/validator.js';

describe('Protocol Validation - Exhaustive QA Coverage', () => {
  it('validates a well-formed VisualVariant with explicit states and custom archetype', () => {
    const raw = {
      id: 'variant-a',
      name: 'Linear Minimalist',
      archetype: 'minimalist',
      description: 'Clean monochrome cards',
      html: '<div class="card">Hello</div>',
      css: '.card { padding: 12px; }',
      states: {
        loading: '<div class="skeleton"></div>',
        empty: '<div class="empty">No data</div>',
        error: '<div class="error">Failed</div>'
      }
    };

    const validated = validateVisualVariant(raw, 0);
    expect(validated.id).toBe('variant-a');
    expect(validated.archetype).toBe('minimalist');
    expect(validated.states?.loading).toContain('skeleton');
  });

  it('handles default fallbacks for archetype, description, css, and states', () => {
    const minimal = {
      id: 'var-1',
      name: 'Variant 1',
      html: '<h1>Hi</h1>'
      // css, archetype, description, states omitted
    };

    const validated = validateVisualVariant(minimal, 0);
    expect(validated.archetype).toBe('custom');
    expect(validated.description).toBe('');
    expect(validated.css).toBe('');
    expect(validated.states).toEqual({});
  });

  it('throws ValidationError for non-object or null variant', () => {
    expect(() => validateVisualVariant(null, 0)).toThrow(ValidationError);
    expect(() => validateVisualVariant('string-instead-of-object', 1)).toThrow(ValidationError);
    expect(() => validateVisualVariant(123, 2)).toThrow(ValidationError);
  });

  it('throws ValidationError when variant is missing id, name, or html', () => {
    expect(() => validateVisualVariant({ name: 'No ID', html: '<div/>' }, 0)).toThrow(/missing a string 'id'/);
    expect(() => validateVisualVariant({ id: 'v1', html: '<div/>' }, 0)).toThrow(/missing a string 'name'/);
    expect(() => validateVisualVariant({ id: 'v1', name: 'No HTML' }, 0)).toThrow(/missing string 'html'/);
  });

  it('throws ValidationError when VisualDecisionRequest is null or non-object', () => {
    expect(() => validateDecisionRequest(null)).toThrow(/must be an object/);
    expect(() => validateDecisionRequest('not-an-object')).toThrow(/must be an object/);
  });

  it('throws ValidationError when prompt is missing or not a string', () => {
    expect(() => validateDecisionRequest({ variants: [{ id: 'v1', name: 'V', html: '<div/>' }] })).toThrow(/Missing required 'prompt'/);
    expect(() => validateDecisionRequest({ prompt: 123, variants: [] })).toThrow(/Missing required 'prompt'/);
  });

  it('throws ValidationError when variants is not an array or is empty', () => {
    expect(() => validateDecisionRequest({ prompt: 'test', variants: 'not-array' })).toThrow(/non-empty array/);
    expect(() => validateDecisionRequest({ prompt: 'test', variants: [] })).toThrow(/non-empty array/);
  });

  it('throws ValidationError when variants exceed maximum allowed limit (8)', () => {
    const tooMany = Array.from({ length: 9 }, (_, i) => ({
      id: `v-${i}`,
      name: `Variant ${i}`,
      html: `<div>${i}</div>`
    }));

    expect(() => validateDecisionRequest({ prompt: 'test', variants: tooMany })).toThrow(/Maximum 8 variants supported/);
  });

  it('applies custom timeoutMs and context when provided', () => {
    const req = {
      prompt: 'Design metric cards',
      context: 'React Tailwind Dashboard',
      timeoutMs: 30000,
      variants: [
        { id: 'v1', name: 'A', html: '<div>A</div>' }
      ]
    };

    const validated = validateDecisionRequest(req);
    expect(validated.context).toBe('React Tailwind Dashboard');
    expect(validated.timeoutMs).toBe(30000);
  });
});
