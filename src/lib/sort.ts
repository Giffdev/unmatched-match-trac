import type { Match } from './types'

/**
 * Parses a YYYY-MM-DD date string to epoch ms (local midnight).
 * Returns NaN on invalid input.
 */
function parseDateOnly(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

/**
 * Comparator for sorting matches newest-first.
 *
 * Primary key:  `date`     (YYYY-MM-DD, day granularity) — newest first.
 * Secondary key: `loggedAt` (ISO datetime, set at log time) — newest first.
 *   Falls back gracefully if `loggedAt` is absent (older records), treating
 *   the missing value as equal so existing ordering is preserved for legacy data.
 *
 * Usage: matches.sort(compareMatchesByRecency)
 */
export function compareMatchesByRecency(a: Match, b: Match): number {
  const dateA = parseDateOnly(a.date)
  const dateB = parseDateOnly(b.date)

  // Push records with invalid dates to the end
  if (isNaN(dateA) && isNaN(dateB)) return 0
  if (isNaN(dateA)) return 1
  if (isNaN(dateB)) return -1

  const dateDiff = dateB - dateA
  if (dateDiff !== 0) return dateDiff

  // Same calendar day — break tie by loggedAt (full-precision ISO timestamp)
  const loggedA = a.loggedAt ? new Date(a.loggedAt).getTime() : NaN
  const loggedB = b.loggedAt ? new Date(b.loggedAt).getTime() : NaN

  if (isNaN(loggedA) && isNaN(loggedB)) return 0
  if (isNaN(loggedA)) return 1
  if (isNaN(loggedB)) return -1

  return loggedB - loggedA
}
