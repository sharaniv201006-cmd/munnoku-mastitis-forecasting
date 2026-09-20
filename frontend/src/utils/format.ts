/**
 * Formats cow identification into clean farmer/vet tag numbers (e.g. Cow #055, Tag #1024)
 */
export function formatCowTag(codeOrId?: string): string {
  if (!codeOrId) return 'Cow #001';
  
  const upper = codeOrId.toUpperCase();
  
  // E.g. COW_055 -> Cow #055
  if (upper.startsWith('COW')) {
    const num = codeOrId.replace(/[^0-9]/g, '');
    return num ? `Cow #${num}` : codeOrId;
  }
  
  // E.g. 1055 -> Cow #1055
  if (/^\d+$/.test(codeOrId)) {
    return `Cow #${codeOrId}`;
  }
  
  // If raw UUID -> Tag #A1B2
  if (codeOrId.length > 8 && codeOrId.includes('-')) {
    const shortCode = codeOrId.slice(0, 4).toUpperCase();
    return `Tag #${shortCode}`;
  }
  
  return `Cow #${codeOrId}`;
}
