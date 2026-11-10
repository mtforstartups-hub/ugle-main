/**
 * Estimate reading time from Lexical JSON or plain text.
 */
export function estimateReadingTime(content: unknown): number {
  if (!content || typeof content !== "object") return 1;
  const text = JSON.stringify(content).replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean).length;
  // ~200 wpm, min 1 minute
  return Math.max(1, Math.round(text / 200));
}
