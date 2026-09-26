import { VisualDecisionRequest, VisualVariant } from './types.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateVisualVariant(v: any, index: number): VisualVariant {
  if (!v || typeof v !== 'object') {
    throw new ValidationError(`Variant at index ${index} must be an object`);
  }
  if (!v.id || typeof v.id !== 'string') {
    throw new ValidationError(`Variant at index ${index} is missing a string 'id'`);
  }
  if (!v.name || typeof v.name !== 'string') {
    throw new ValidationError(`Variant '${v.id}' is missing a string 'name'`);
  }
  if (!v.html || typeof v.html !== 'string') {
    throw new ValidationError(`Variant '${v.id}' is missing string 'html'`);
  }
  if (typeof v.css !== 'string') {
    v.css = '';
  }
  return {
    id: v.id,
    name: v.name,
    archetype: v.archetype || 'custom',
    description: v.description || '',
    html: v.html,
    css: v.css,
    states: v.states || {}
  };
}

export function validateDecisionRequest(req: any): VisualDecisionRequest {
  if (!req || typeof req !== 'object') {
    throw new ValidationError('VisualDecisionRequest must be an object');
  }
  if (!req.prompt || typeof req.prompt !== 'string') {
    throw new ValidationError("Missing required 'prompt' string");
  }
  if (!Array.isArray(req.variants) || req.variants.length === 0) {
    throw new ValidationError("Variants must be a non-empty array with at least 1 variant");
  }
  if (req.variants.length > 8) {
    throw new ValidationError("Maximum 8 variants supported per decision session");
  }

  const validatedVariants = req.variants.map((v: any, i: number) => validateVisualVariant(v, i));

  return {
    prompt: req.prompt,
    context: req.context || '',
    variants: validatedVariants,
    timeoutMs: typeof req.timeoutMs === 'number' ? req.timeoutMs : 600000
  };
}
