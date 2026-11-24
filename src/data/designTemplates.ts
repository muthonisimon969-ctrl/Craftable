import type { DesignTemplate } from '../types/project';

// Fixed website archetypes are intentionally disabled.
// Zuno should generate a fresh design from each user's brief instead of
// selecting from a limited catalogue. Keep the type and lookup helper so
// existing callers remain safe while the library is empty.
export const DESIGN_TEMPLATES: DesignTemplate[] = [];

export function findTemplateById(_id: string): DesignTemplate | undefined {
  return undefined;
}
