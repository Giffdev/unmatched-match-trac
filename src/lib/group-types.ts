import type { Match } from './types'

export type GroupRole = 'owner' | 'admin' | 'member'

export type GroupSettings = {
  allowMemberInvites: boolean
  autoAddToPersonal: boolean
}

export type GameGroup = {
  id: string
  name: string
  description?: string
  ownerUid: string
  createdBy: string
  createdAt: string
  updatedAt: string
  memberUids: string[]
  memberCount: number
  settings: GroupSettings
}

export type GroupMember = {
  uid: string
  displayName: string
  playerName?: string
  role: GroupRole
  joinedAt: string
  invitedBy: string
}

export type GroupMatch = Match & {
  groupId: string
  loggedBy: string
  loggedByName: string
}

export type GroupInviteStatus = 'pending' | 'accepted' | 'declined'

export type GroupInvite = {
  id: string
  groupId: string
  groupName: string
  invitedUid: string
  invitedBy: string
  invitedByName: string
  status: GroupInviteStatus
  createdAt: string
  respondedAt?: string
}

export type UserGroupMembership = {
  groupId: string
  groupName: string
  role: GroupRole
}
