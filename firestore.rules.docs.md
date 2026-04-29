# Firestore Security Rules — Logic Documentation

> Last updated: 2026-04-29T10:18:17-07:00
> Author: Hicks (Full-Stack Dev)

## Overview

The `firestore.rules` file defines access control for all Firestore documents. Rules are divided into two sections:

1. **User rules** — Existing per-user data (matches, owned-sets, etc.)
2. **Game Groups rules** — New collaborative group feature

---

## Section 1: User Rules (Existing)

### `users/{userId}`
- **Read:** Public (anyone, including non-authenticated users)
- **Write:** Owner only (`auth.uid == userId`)
- **Rationale:** User profiles are public so `getAllUserMatches()` can aggregate community stats for the landing page without requiring login.

### `users/{userId}/data/{docId}`
- **Read:** Public if `docId == 'matches'`; otherwise owner only
- **Write:** Owner only
- **Rationale:** Match data is public for community stats. Sensitive docs (owned-sets, matches-meta, groups, group-invites) are private.

### `users/{userId}/matches/{matchId}`
- **Read/Write:** Owner only
- **Rationale:** Individual match subcollection (migration target) is strictly per-user.

---

## Section 2: Game Groups Rules

### Collection Structure

```
groups/{groupId}                    — Group metadata + memberUids[] + ownerUid
groups/{groupId}/members/{userId}   — Rich membership data (role, joinedAt, displayName)
groups/{groupId}/matches/{matchId}  — Match logs for the group
groups/{groupId}/invites/{inviteId} — Pending invitations
```

### `groups/{groupId}` — Group Document

| Operation | Who Can Do It | How It's Checked |
|-----------|---------------|------------------|
| Read | Members only | `auth.uid in resource.data.memberUids` |
| Create | Any authenticated user | Must set `ownerUid == auth.uid` and include self in `memberUids` |
| Update | Owner only | `resource.data.ownerUid == auth.uid` |
| Delete | Owner only | `resource.data.ownerUid == auth.uid` |

**Design note:** The `memberUids[]` array on the group document enables O(1) membership checks in security rules without needing a `get()` call. This is the most cost-efficient pattern for Firestore rules.

### `groups/{groupId}/matches/{matchId}` — Group Matches

| Operation | Who Can Do It | How It's Checked |
|-----------|---------------|------------------|
| Read | Group members | `get()` parent group doc, check `memberUids` |
| Create | Group members | Must be member AND `loggedBy == auth.uid` |
| Update | Match author only | `resource.data.loggedBy == auth.uid` |
| Delete | Match author only | `resource.data.loggedBy == auth.uid` |

**Design note:** `loggedBy` field is enforced on create to prevent impersonation. Only the original logger can edit/delete.

### `groups/{groupId}/members/{userId}` — Membership

| Operation | Who Can Do It | How It's Checked |
|-----------|---------------|------------------|
| Read | Group members | `get()` parent group doc, check `memberUids` |
| Write | Owner or Admin | Checks `ownerUid` on group doc OR `role in ['owner', 'admin']` in member's own membership doc |

### `groups/{groupId}/invites/{inviteId}` — Invitations

| Operation | Who Can Do It | How It's Checked |
|-----------|---------------|------------------|
| Read | Group members OR the invitee | Member check OR `inviteeUid == auth.uid` |
| Create | Any group member | `get()` parent group doc, check `memberUids` |
| Update | Invitee OR owner/admin | `inviteeUid == auth.uid` OR admin/owner role check |
| Delete | Invitee OR owner/admin | Same as update |

---

## Helper Functions

All helper functions are scoped inside the `groups/{groupId}` match block:

- **`isAuthenticated()`** — `request.auth != null`
- **`isMember()`** — Auth'd + uid in `resource.data.memberUids` (for group doc itself)
- **`isMemberOfGroup()`** — Auth'd + uid in group doc's `memberUids` (uses `get()`, for subcollections)
- **`isOwner()`** — Auth'd + `resource.data.ownerUid == auth.uid` (for group doc itself)
- **`isOwnerOfGroup()`** — Auth'd + group doc's `ownerUid == auth.uid` (uses `get()`)
- **`isAdminOrOwner()`** — Owner check OR member doc role is 'owner'/'admin' (uses `get()`)

---

## Cost Considerations

- `get()` calls count as 1 read each in Firestore billing
- Rules on the group doc itself (`isMember()`, `isOwner()`) use NO extra reads
- Subcollection rules (`isMemberOfGroup()`) use 1 extra read per operation
- `isAdminOrOwner()` may use up to 2 extra reads (group doc + member doc)
- Cached within a single request — multiple `get()` to the same path in one evaluation counts as 1

---

## Testing Checklist

Before deploying to production, verify:

- [ ] Unauthenticated user CANNOT read group data
- [ ] Authenticated non-member CANNOT read group data
- [ ] Member CAN read group doc and all subcollections
- [ ] Only owner can update/delete group doc
- [ ] Member can create match with `loggedBy == self`
- [ ] Member CANNOT create match with `loggedBy != self`
- [ ] Only match author can update/delete their match
- [ ] Owner/admin can add/remove members
- [ ] Regular member CANNOT modify members subcollection
- [ ] Invitee can read and accept/delete their invite
- [ ] Non-member, non-invitee CANNOT read invites
- [ ] Community stats (public match reads) still work without auth
- [ ] User's private data (owned-sets) still requires auth

---

## Deployment

```bash
# Preview rules (requires firebase-tools)
firebase deploy --only firestore:rules --project unmatched-match-trac

# Or paste directly in Firebase Console:
# Console → Firestore Database → Rules tab → paste contents of firestore.rules → Publish
```

**⚠️ Do NOT deploy until Game Groups feature is fully tested locally.**
