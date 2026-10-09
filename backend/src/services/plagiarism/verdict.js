import { LIMITS } from './limits.js';

/**
 * A web stage that did not finish is never a clean result.
 * Overlap is the share of this article found in other sources.
 */
export function decideVerdict({ webComplete, internalOverlap = 0, webOverlap = 0, longestRun = 0 }) {
  if (!webComplete) return 'incomplete';
  const overlap = Math.max(internalOverlap, webOverlap);
  if (overlap >= LIMITS.strongOverlap || longestRun >= LIMITS.strongRunWords) return 'strong';
  if (overlap >= LIMITS.reviewOverlap) return 'review';
  return 'clear';
}
