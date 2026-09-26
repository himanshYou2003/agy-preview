/**
 * Visual Decision Protocol (VDP) - Core Protocol Types
 */

export type Archetype = 'minimalist' | 'editorial' | 'glassmorphism' | 'brutalist' | 'custom';

export interface VariantStates {
  loading?: string;
  empty?: string;
  error?: string;
}

export interface VisualVariant {
  id: string;
  name: string;
  archetype?: Archetype;
  description?: string;
  html: string;
  css: string;
  states?: VariantStates;
}

export interface VisualDecisionRequest {
  prompt: string;
  context?: string;
  variants: VisualVariant[];
  timeoutMs?: number; // Defaults to 600,000 (10 min)
}

export interface ExtractedTokens {
  colors: Record<string, string>;
  typography: Record<string, string>;
  radii: Record<string, string>;
  cssVariables: string;
}

export interface VisualDecisionResponse {
  status: 'selected' | 'cancelled' | 'timeout';
  selectedId?: string;
  feedback?: string;
  tokens?: ExtractedTokens;
  rawHtml?: string;
  rawCss?: string;
}

export interface ArenaSessionConfig {
  sessionId: string;
  port: number;
  wsUrl: string;
  prompt: string;
  context?: string;
  variants: VisualVariant[];
}
