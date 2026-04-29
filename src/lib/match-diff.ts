import type { Match } from './types'

export type MatchDiff = {
  added: Match[]
  modified: Match[]
  deleted: string[]
}

/**
 * Valid migration states for a user's data migration progress.
 */
export const VALID_MIGRATION_STATES = [
  'legacy-only',
  'dual-write',
  'subcollection-primary',
  'cleanup-ready',
] as const

export type MigrationState = (typeof VALID_MIGRATION_STATES)[number]

/**
 * Returns the default migration state when no meta document exists.
 */
export function getDefaultMigrationState(): MigrationState {
  return 'legacy-only'
}

/**
 * Validates that a string is a valid migration state.
 */
export function isValidMigrationState(state: string): state is MigrationState {
  return (VALID_MIGRATION_STATES as readonly string[]).includes(state)
}

/**
 * Computes the diff between two Match arrays.
 * - added: matches in `next` whose id doesn't appear in `prev`
 * - modified: matches in `next` whose id appears in `prev` but data differs
 * - deleted: ids that appear in `prev` but not in `next`
 *
 * Handles duplicates by using the last occurrence of a given id.
 */
export function diffMatches(prev: Match[], next: Match[]): MatchDiff {
  // Build maps keyed by id (last occurrence wins for duplicates)
  const prevMap = new Map<string, Match>()
  for (const m of prev) {
    prevMap.set(m.id, m)
  }

  const nextMap = new Map<string, Match>()
  for (const m of next) {
    nextMap.set(m.id, m)
  }

  const added: Match[] = []
  const modified: Match[] = []
  const deleted: string[] = []

  // Find added and modified
  for (const [id, nextMatch] of nextMap) {
    const prevMatch = prevMap.get(id)
    if (!prevMatch) {
      added.push(nextMatch)
    } else if (!matchesEqual(prevMatch, nextMatch)) {
      modified.push(nextMatch)
    }
  }

  // Find deleted
  for (const id of prevMap.keys()) {
    if (!nextMap.has(id)) {
      deleted.push(id)
    }
  }

  return { added, modified, deleted }
}

/**
 * Deep equality check for two Match objects.
 * Compares JSON serialization for simplicity and correctness.
 */
function matchesEqual(a: Match, b: Match): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
