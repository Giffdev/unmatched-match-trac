import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGroups, usePendingInvites, useGroup } from '@/hooks/use-groups'
import { GroupsTab } from '../GroupsTab'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}))
vi.mock('@/hooks/use-groups', () => ({
  useGroups: vi.fn(),
  usePendingInvites: vi.fn(),
  useGroup: vi.fn(),
}))
vi.mock('../CreateGroupDialog', () => ({ CreateGroupDialog: () => null }))
vi.mock('../PendingInvites', () => ({ PendingInvites: () => null }))
vi.mock('../GroupMatchList', () => ({ GroupMatchList: () => null }))
vi.mock('../MemberList', () => ({ MemberList: () => null }))
vi.mock('../InviteMemberDialog', () => ({ InviteMemberDialog: () => null }))
vi.mock('../GroupSettingsDialog', () => ({ GroupSettingsDialog: () => null }))
vi.mock('../ImportMatchesDialog', () => ({ ImportMatchesDialog: () => null }))

beforeEach(() => {
  vi.mocked(useGroups).mockReturnValue({
    groups: [], loading: false, error: null, refetch: vi.fn(),
  })
  vi.mocked(usePendingInvites).mockReturnValue({
    invites: [], count: 0, loading: false, refetch: vi.fn(),
  })
  vi.mocked(useGroup).mockReturnValue({
    group: {
      id: 'group-1', name: 'Home Group', ownerUid: 'owner-1', createdBy: 'owner-1',
      createdAt: '', updatedAt: '', memberUids: ['owner-1', 'user-1'], memberCount: 2,
      settings: { allowMemberInvites: false, autoAddToPersonal: true },
    },
    loading: false, error: null, refetch: vi.fn(),
  })
})

describe('ongoing groups guidance', () => {
  it('is keyboard-accessible without groups, explains sharing, and restores focus on Escape', async () => {
    const user = userEvent.setup()
    render(<GroupsTab />)
    const trigger = screen.getByRole('button', { name: 'How groups work' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    trigger.focus()
    await user.keyboard('{Enter}')

    const dialog = screen.getByRole('dialog', { name: 'How groups work' })
    expect(dialog).toHaveAccessibleDescription('A shared match log for your gaming circle.')
    expect(within(dialog).getByText(/does not share your existing match history/)).toHaveTextContent(
      /Also log to group\(s\).*It also stays in My Matches/
    )
    expect(within(dialog).getByText(/For past games/)).toHaveTextContent(
      /Import Matches.*select which personal matches to copy/
    )
    expect(within(dialog).getByText(/choose My Matches/)).toHaveTextContent(
      /Group: \[name\].*Switching views does not share or move matches/
    )
    expect(within(dialog).getByText(/owned-set collection stays personal/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Choose Create Group/)).toHaveTextContent(
      /Members tab.*invite link and sign in.*pending invitation/
    )
    expect(within(dialog).getByText(/Group names are just labels/)).toHaveTextContent(
      /not a special home or default group/
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('remains available on a populated overview and inside an existing group for a non-owner', async () => {
    const user = userEvent.setup()
    vi.mocked(useGroups).mockReturnValue({
      groups: [{ groupId: 'group-1', groupName: 'Home Group', role: 'member' }],
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<GroupsTab />)

    await user.click(screen.getByRole('button', { name: 'How groups work' }))
    await user.click(screen.getByRole('button', { name: 'Got it' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Home Group'))
    expect(screen.getByRole('button', { name: 'Import Matches' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'How groups work' }))
    expect(screen.getByRole('dialog', { name: 'How groups work' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
