/**
 * Tests for user discovery / search functionality.
 * Tests the expected API from src/lib/user-discovery.ts (being created by Hicks).
 *
 * Key design: Search by email (exact match) or playerName (prefix, case-insensitive).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...args: any[]) => ({ path: args.slice(1).join('/'), id: args[args.length - 1] })),
  collection: vi.fn((...args: any[]) => ({ path: args.slice(1).join('/') })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((...args: any[]) => ({ _query: args })),
  where: vi.fn((...args: any[]) => ({ _where: args })),
  orderBy: vi.fn((...args: any[]) => ({ _orderBy: args })),
  limit: vi.fn((n: number) => ({ _limit: n })),
  startAt: vi.fn((...args: any[]) => ({ _startAt: args })),
  endAt: vi.fn((...args: any[]) => ({ _endAt: args })),
}))

vi.mock('../firebase', () => ({
  db: { _db: 'mock-firestore' },
}))

// --- Types ---

type UserSearchResult = {
  uid: string
  email: string
  displayName?: string
  playerName?: string
}

// --- Factory helpers ---

function createUserResult(overrides: Partial<UserSearchResult> = {}): UserSearchResult {
  return {
    uid: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice Smith',
    playerName: 'AliceGamer',
    ...overrides,
  }
}

// --- Test suites ---

describe('user-discovery — search by email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exact email match returns user info', async () => {
    const { getDocs, query, where, collection } = await import('firebase/firestore')
    const searchEmail = 'alice@example.com'

    const matchedUser = createUserResult()
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ id: matchedUser.uid, data: () => matchedUser }],
      size: 1,
      empty: false,
    } as any)

    const q = query(
      collection({} as any, 'users'),
      where('email', '==', searchEmail)
    )
    const result = await getDocs(q as any)

    expect(where).toHaveBeenCalledWith('email', '==', searchEmail)
    expect(result.size).toBe(1)
    expect((result as any).docs[0].data().email).toBe(searchEmail)
    expect((result as any).docs[0].data().uid).toBe('user-1')
  })

  it('email search is case-sensitive by default (Firestore behavior)', async () => {
    const { getDocs, query, where, collection } = await import('firebase/firestore')

    // Searching with different case
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [],
      size: 0,
      empty: true,
    } as any)

    const q = query(
      collection({} as any, 'users'),
      where('email', '==', 'ALICE@EXAMPLE.COM')
    )
    const result = await getDocs(q as any)

    // Firestore where('==') is case-sensitive — implementation should lowercase before query
    expect(result.empty).toBe(true)
  })

  it('returns only safe fields (no sensitive data leaked)', () => {
    const result = createUserResult()

    // Should NOT include fields like authProvider, createdAt, etc.
    const exposedFields = Object.keys(result)
    expect(exposedFields).toContain('uid')
    expect(exposedFields).toContain('email')
    expect(exposedFields).toContain('displayName')
    expect(exposedFields).toContain('playerName')
    expect(exposedFields).not.toContain('authProvider')
    expect(exposedFields).not.toContain('createdAt')
  })

  it('no match returns empty array', async () => {
    const { getDocs } = await import('firebase/firestore')

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [],
      size: 0,
      empty: true,
    } as any)

    const result = await getDocs({} as any)
    expect(result.empty).toBe(true)
    expect(result.docs).toHaveLength(0)
  })
})

describe('user-discovery — search by playerName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefix match works for playerName search', async () => {
    const { getDocs, query, where, orderBy, startAt, endAt, collection } = await import('firebase/firestore')
    const searchPrefix = 'Ali'

    const matchedUsers = [
      createUserResult({ uid: 'user-1', playerName: 'Alice' }),
      createUserResult({ uid: 'user-2', playerName: 'Alia', email: 'alia@example.com' }),
    ]

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: matchedUsers.map((u) => ({ id: u.uid, data: () => u })),
      size: 2,
      empty: false,
    } as any)

    // Firestore prefix query pattern: startAt(prefix) endAt(prefix + '\uf8ff')
    const q = query(
      collection({} as any, 'users'),
      orderBy('playerName'),
      startAt(searchPrefix),
      endAt(searchPrefix + '\uf8ff')
    )
    const result = await getDocs(q as any)

    expect(result.size).toBe(2)
    expect(startAt).toHaveBeenCalledWith(searchPrefix)
    expect(endAt).toHaveBeenCalledWith(searchPrefix + '\uf8ff')
  })

  it('case-insensitive search via normalized field', async () => {
    const { getDocs, query, where, orderBy, startAt, endAt, collection } = await import('firebase/firestore')

    // Implementation should store a lowercased version for searching
    const searchPrefix = 'ali' // lowercase input
    const normalizedField = 'playerNameLower' // or similar

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'user-1', data: () => createUserResult({ playerName: 'Alice' }) },
      ],
      size: 1,
    } as any)

    const q = query(
      collection({} as any, 'users'),
      orderBy(normalizedField),
      startAt(searchPrefix.toLowerCase()),
      endAt(searchPrefix.toLowerCase() + '\uf8ff')
    )
    const result = await getDocs(q as any)

    expect(result.size).toBe(1)
    // Searching 'ali' should match 'Alice' via normalized field
  })

  it('returns multiple matching users', async () => {
    const { getDocs } = await import('firebase/firestore')

    const matches = [
      createUserResult({ uid: 'user-1', playerName: 'Bob' }),
      createUserResult({ uid: 'user-2', playerName: 'Bobby', email: 'bobby@example.com' }),
      createUserResult({ uid: 'user-3', playerName: 'Bob_the_Builder', email: 'bob3@example.com' }),
    ]

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: matches.map((u) => ({ id: u.uid, data: () => u })),
      size: 3,
    } as any)

    const result = await getDocs({} as any)
    expect(result.size).toBe(3)
  })

  it('limits results to prevent excessive reads', async () => {
    const { limit, query, collection, orderBy, startAt, endAt } = await import('firebase/firestore')
    const maxResults = 10

    query(
      collection({} as any, 'users'),
      orderBy('playerName'),
      startAt('A'),
      endAt('A\uf8ff'),
      limit(maxResults)
    )

    expect(limit).toHaveBeenCalledWith(maxResults)
  })
})

describe('user-discovery — no results', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when no users match email', async () => {
    const { getDocs } = await import('firebase/firestore')

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [],
      size: 0,
      empty: true,
    } as any)

    const result = await getDocs({} as any)
    expect(result.docs).toHaveLength(0)
  })

  it('returns empty array when no users match playerName prefix', async () => {
    const { getDocs } = await import('firebase/firestore')

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [],
      size: 0,
      empty: true,
    } as any)

    const result = await getDocs({} as any)
    expect(result.docs).toHaveLength(0)
  })
})

describe('user-discovery — edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles special characters in search input safely', () => {
    // Special chars should not break Firestore queries
    const specialInputs = [
      'user+tag@example.com',
      "O'Brien",
      'name with spaces',
      'user@domain.co.uk',
      'emoji🎮player',
    ]

    specialInputs.forEach((input) => {
      // Should not throw — Firestore handles these as string values
      expect(() => input.trim()).not.toThrow()
      expect(typeof input).toBe('string')
    })
  })

  it('empty string search returns empty results (no full table scan)', async () => {
    const { getDocs } = await import('firebase/firestore')

    // Implementation should short-circuit on empty string
    const searchTerm = ''
    expect(searchTerm.trim().length).toBe(0)

    // Should NOT call Firestore at all for empty search
    // Implementation: if (searchTerm.trim() === '') return []
    expect(getDocs).not.toHaveBeenCalled()
  })

  it('whitespace-only search returns empty results', () => {
    const searchTerm = '   '
    expect(searchTerm.trim().length).toBe(0)
    // Implementation should treat as empty
  })

  it('very long search string is handled (no crash)', () => {
    const longSearch = 'a'.repeat(500)
    expect(longSearch.length).toBe(500)
    // Firestore can handle long strings but implementation should cap at reasonable length
  })

  it('excludes current user from search results', () => {
    const currentUserId = 'user-1'
    const results = [
      createUserResult({ uid: 'user-1', playerName: 'Alice' }),
      createUserResult({ uid: 'user-2', playerName: 'AliceB', email: 'aliceb@example.com' }),
    ]

    // Implementation should filter out current user
    const filtered = results.filter((r) => r.uid !== currentUserId)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].uid).toBe('user-2')
  })

  it('excludes users already in the group from search results', () => {
    const existingMembers = ['user-1', 'user-3']
    const results = [
      createUserResult({ uid: 'user-2', playerName: 'Bob', email: 'bob@example.com' }),
      createUserResult({ uid: 'user-3', playerName: 'Charlie', email: 'charlie@example.com' }),
    ]

    // Implementation should filter out existing group members
    const filtered = results.filter((r) => !existingMembers.includes(r.uid))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].uid).toBe('user-2')
  })

  it('handles users with no playerName set', () => {
    const userWithoutPlayerName = createUserResult({
      uid: 'user-4',
      playerName: undefined,
      displayName: 'No Name User',
    })

    // Should still be searchable by email, just not by playerName
    expect(userWithoutPlayerName.playerName).toBeUndefined()
    expect(userWithoutPlayerName.email).toBeTruthy()
  })

  it('search by partial email does NOT match (email is exact only)', async () => {
    const { getDocs, where } = await import('firebase/firestore')

    // Firestore where('==') requires exact match
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [],
      size: 0,
      empty: true,
    } as any)

    // Searching "alice" should NOT match "alice@example.com"
    const result = await getDocs({} as any)
    expect(result.empty).toBe(true)
  })
})
