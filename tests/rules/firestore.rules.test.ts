/**
 * Firestore Security Rules Tests
 *
 * Tests actual security rules against real scenarios that have caused bugs:
 * - Invite acceptance (user can join via invite code)
 * - Self-join (user adds themselves to memberUids)
 * - Member doc creation (user creates their own member doc)
 * - Group creation (owner sets themselves)
 * - Read permissions (authenticated users can read groups)
 * - Negative cases (unauthenticated blocked, non-owners can't delete)
 */
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { setDoc, doc, getDoc, updateDoc, deleteDoc, setLogLevel } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { resolve } from 'path'

let testEnv: RulesTestEnvironment

// Suppress Firestore logs during tests
setLogLevel('error')

const RULES_PATH = resolve(__dirname, '../../firestore.rules')

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'unmatched-tracker-test',
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('Group creation', () => {
  it('allows authenticated user to create group with self as owner', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const groupRef = doc(alice.firestore(), 'groups/group1')

    await assertSucceeds(
      setDoc(groupRef, {
        name: 'Friday Night Games',
        ownerUid: 'alice',
        memberUids: ['alice'],
        inviteCode: 'ABC123',
        createdAt: new Date().toISOString(),
      })
    )
  })

  it('blocks group creation if owner is not the creator', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const groupRef = doc(alice.firestore(), 'groups/group1')

    await assertFails(
      setDoc(groupRef, {
        name: 'Fake Group',
        ownerUid: 'bob', // alice trying to set bob as owner
        memberUids: ['alice'],
        inviteCode: 'XYZ',
      })
    )
  })

  it('blocks group creation if creator not in memberUids', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const groupRef = doc(alice.firestore(), 'groups/group1')

    await assertFails(
      setDoc(groupRef, {
        name: 'Sneaky Group',
        ownerUid: 'alice',
        memberUids: [], // alice not included
        inviteCode: 'XYZ',
      })
    )
  })

  it('blocks unauthenticated user from creating group', async () => {
    const unauth = testEnv.unauthenticatedContext()
    const groupRef = doc(unauth.firestore(), 'groups/group1')

    await assertFails(
      setDoc(groupRef, {
        name: 'Blocked',
        ownerUid: 'nobody',
        memberUids: ['nobody'],
      })
    )
  })
})

describe('Group read permissions', () => {
  it('allows any authenticated user to read a group', async () => {
    // Setup: create group as alice
    const admin = testEnv.authenticatedContext('alice')
    await setDoc(doc(admin.firestore(), 'groups/group1'), {
      name: 'Test Group',
      ownerUid: 'alice',
      memberUids: ['alice'],
      inviteCode: 'CODE1',
    })

    // Bob (not a member) can still read group details (needed for invite code lookup)
    const bob = testEnv.authenticatedContext('bob')
    const groupRef = doc(bob.firestore(), 'groups/group1')
    await assertSucceeds(getDoc(groupRef))
  })

  it('blocks unauthenticated user from reading groups', async () => {
    const admin = testEnv.authenticatedContext('alice')
    await setDoc(doc(admin.firestore(), 'groups/group1'), {
      name: 'Test Group',
      ownerUid: 'alice',
      memberUids: ['alice'],
      inviteCode: 'CODE1',
    })

    const unauth = testEnv.unauthenticatedContext()
    const groupRef = doc(unauth.firestore(), 'groups/group1')
    await assertFails(getDoc(groupRef))
  })
})

describe('Invite acceptance — self-join via invite code', () => {
  it('allows user to add themselves to memberUids (join via invite)', async () => {
    // Setup: group exists, bob is NOT a member
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Game Night',
      ownerUid: 'alice',
      memberUids: ['alice'],
      inviteCode: 'JOIN123',
    })

    // Bob joins by adding himself to memberUids
    const bob = testEnv.authenticatedContext('bob')
    const groupRef = doc(bob.firestore(), 'groups/group1')
    await assertSucceeds(
      updateDoc(groupRef, {
        memberUids: ['alice', 'bob'],
      })
    )
  })

  it('blocks user from joining if already a member (no self-duplicate)', async () => {
    // Setup: bob is already a member
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Game Night',
      ownerUid: 'alice',
      memberUids: ['alice', 'bob'],
    })

    // Bob tries to update but is already a member — rule requires NOT in resource.data.memberUids
    const bob = testEnv.authenticatedContext('bob')
    const groupRef = doc(bob.firestore(), 'groups/group1')
    await assertFails(
      updateDoc(groupRef, {
        memberUids: ['alice', 'bob'],
      })
    )
  })
})

describe('Member doc creation', () => {
  it('allows user to create their own member doc with member role', async () => {
    // Setup: group with alice as owner, bob in memberUids
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Game Night',
      ownerUid: 'alice',
      memberUids: ['alice', 'bob'],
    })
    await setDoc(doc(alice.firestore(), 'groups/group1/members/alice'), {
      role: 'owner',
      displayName: 'Alice',
      joinedAt: new Date().toISOString(),
    })

    // Bob creates his own member doc
    const bob = testEnv.authenticatedContext('bob')
    const memberRef = doc(bob.firestore(), 'groups/group1/members/bob')
    await assertSucceeds(
      setDoc(memberRef, {
        role: 'member',
        displayName: 'Bob',
        joinedAt: new Date().toISOString(),
      })
    )
  })

  it('blocks user from creating member doc for someone else', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Game Night',
      ownerUid: 'alice',
      memberUids: ['alice'],
    })
    await setDoc(doc(alice.firestore(), 'groups/group1/members/alice'), {
      role: 'owner',
      displayName: 'Alice',
      joinedAt: new Date().toISOString(),
    })

    // Bob tries to create a member doc as 'charlie' (not himself)
    const bob = testEnv.authenticatedContext('bob')
    const memberRef = doc(bob.firestore(), 'groups/group1/members/charlie')
    await assertFails(
      setDoc(memberRef, {
        role: 'member',
        displayName: 'Charlie',
        joinedAt: new Date().toISOString(),
      })
    )
  })

  it('blocks user from creating member doc with admin role (privilege escalation)', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Game Night',
      ownerUid: 'alice',
      memberUids: ['alice', 'bob'],
    })
    await setDoc(doc(alice.firestore(), 'groups/group1/members/alice'), {
      role: 'owner',
      displayName: 'Alice',
      joinedAt: new Date().toISOString(),
    })

    // Bob tries to make himself admin
    const bob = testEnv.authenticatedContext('bob')
    const memberRef = doc(bob.firestore(), 'groups/group1/members/bob')
    await assertFails(
      setDoc(memberRef, {
        role: 'admin', // not allowed via self-create
        displayName: 'Bob',
        joinedAt: new Date().toISOString(),
      })
    )
  })
})

describe('Group deletion', () => {
  it('allows owner to delete group', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const groupRef = doc(alice.firestore(), 'groups/group1')
    await setDoc(groupRef, {
      name: 'To Delete',
      ownerUid: 'alice',
      memberUids: ['alice'],
    })

    await assertSucceeds(deleteDoc(groupRef))
  })

  it('blocks non-owner from deleting group', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Protected',
      ownerUid: 'alice',
      memberUids: ['alice', 'bob'],
    })

    const bob = testEnv.authenticatedContext('bob')
    const groupRef = doc(bob.firestore(), 'groups/group1')
    await assertFails(deleteDoc(groupRef))
  })

  it('blocks unauthenticated user from deleting group', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Protected',
      ownerUid: 'alice',
      memberUids: ['alice'],
    })

    const unauth = testEnv.unauthenticatedContext()
    const groupRef = doc(unauth.firestore(), 'groups/group1')
    await assertFails(deleteDoc(groupRef))
  })
})

describe('Owner update permissions', () => {
  it('allows owner to update group fields', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const groupRef = doc(alice.firestore(), 'groups/group1')
    await setDoc(groupRef, {
      name: 'Original Name',
      ownerUid: 'alice',
      memberUids: ['alice'],
    })

    await assertSucceeds(
      updateDoc(groupRef, { name: 'Updated Name' })
    )
  })

  it('blocks non-owner non-joining user from updating group', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await setDoc(doc(alice.firestore(), 'groups/group1'), {
      name: 'Original',
      ownerUid: 'alice',
      memberUids: ['alice', 'bob'],
    })

    // Bob is already a member, so the join path doesn't apply
    // And bob is not owner, so owner path doesn't apply
    const bob = testEnv.authenticatedContext('bob')
    const groupRef = doc(bob.firestore(), 'groups/group1')
    await assertFails(
      updateDoc(groupRef, { name: 'Hacked Name' })
    )
  })
})
