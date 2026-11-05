import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { getUserMatches } from '@/lib/firestore'
import { getGroupMatches } from '@/lib/group-matches'
import { importMatchesToGroup } from '@/lib/groups'
import { ImportMatchesDialog } from '../ImportMatchesDialog'
import type { Match } from '@/lib/types'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { uid: 'user-1', displayName: 'Test User' } }),
}))
vi.mock('@/lib/firestore', () => ({ getUserMatches: vi.fn() }))
vi.mock('@/lib/group-matches', () => ({ getGroupMatches: vi.fn() }))
vi.mock('@/lib/groups', () => ({ importMatchesToGroup: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const match: Match = {
  id: 'personal-1', date: '2026-11-05', mode: '1v1', mapId: 'soho',
  players: [
    { playerName: 'Alice', heroId: 'sinbad', turnOrder: 1 },
    { playerName: 'Bob', heroId: 'medusa', turnOrder: 2 },
  ],
  winnerId: 'sinbad', isDraw: false, userId: 'user-1',
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getUserMatches).mockResolvedValue([match])
  vi.mocked(getGroupMatches).mockResolvedValue({ matches: [], lastDoc: null })
  vi.mocked(importMatchesToGroup).mockResolvedValue({ imported: 1 })
})

describe('group import affordances', () => {
  it('selects a match once when its checkbox is clicked and imports the selected personal copy', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ImportMatchesDialog open onOpenChange={onOpenChange} groupId="group-1" />)

    const checkbox = await screen.findByRole('checkbox', { name: /Select match: Sinbad vs Medusa/ })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    await user.keyboard(' ')
    expect(checkbox).not.toBeChecked()
    await user.keyboard(' ')
    expect(checkbox).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Import 1 Match' }))

    await waitFor(() => expect(importMatchesToGroup).toHaveBeenCalledWith(
      'group-1', [match], 'user-1', 'Test User'
    ))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not claim an empty personal log has already been shared', async () => {
    vi.mocked(getUserMatches).mockResolvedValue([])
    render(<ImportMatchesDialog open onOpenChange={vi.fn()} groupId="group-1" />)

    expect(await screen.findByText(/No personal matches are available to import/)).toHaveTextContent(
      /Log a match on the Matches tab/
    )
    expect(screen.queryByText(/All your matches are already in this group/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import 0 Matches/ })).toBeDisabled()
  })

  it('distinguishes a load failure from an empty log and lets the user retry', async () => {
    const user = userEvent.setup()
    vi.mocked(getGroupMatches).mockRejectedValueOnce(new Error('Unavailable'))
    render(<ImportMatchesDialog open onOpenChange={vi.fn()} groupId="group-1" />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load matches to import/)
    expect(screen.queryByText(/No personal matches are available/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try Again' }))

    expect(await screen.findByRole('checkbox', { name: /Select match:/ })).not.toBeChecked()
    expect(getGroupMatches).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('import load lifecycle', () => {
  it('keeps a reopened request loading when an old opening succeeds', async () => {
    const oldRequest = deferred<Match[]>()
    const currentRequest = deferred<Match[]>()
    vi.mocked(getUserMatches)
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(currentRequest.promise)
    const props = { onOpenChange: vi.fn(), groupId: 'group-1' }
    const view = render(<ImportMatchesDialog {...props} open />)
    view.rerender(<ImportMatchesDialog {...props} open={false} />)
    view.rerender(<ImportMatchesDialog {...props} open />)

    await act(async () => { oldRequest.resolve([match]); await oldRequest.promise })

    expect(screen.getByText('Loading your matches...')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import 0 Matches' })).toBeDisabled()

    await act(async () => { currentRequest.resolve([]); await currentRequest.promise })

    expect(await screen.findByText(/No personal matches are available/)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('ignores a previous opening failure after the reopened list succeeds', async () => {
    const user = userEvent.setup()
    const oldRequest = deferred<Match[]>()
    vi.mocked(getUserMatches).mockReturnValueOnce(oldRequest.promise)
    const props = { onOpenChange: vi.fn(), groupId: 'group-1' }
    const view = render(<ImportMatchesDialog {...props} open />)
    view.rerender(<ImportMatchesDialog {...props} open={false} />)
    view.rerender(<ImportMatchesDialog {...props} open />)
    const checkbox = await screen.findByRole('checkbox', { name: /Select match:/ })
    await user.click(checkbox)

    await act(async () => {
      oldRequest.reject(new Error('Old opening failed'))
      await oldRequest.promise.catch(() => {})
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(checkbox).toBeChecked()
    expect(screen.getByRole('button', { name: 'Import 1 Match' })).toBeEnabled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('uses only the current group results when retrying after a group change', async () => {
    const user = userEvent.setup()
    const oldGroupRequest = deferred<Awaited<ReturnType<typeof getGroupMatches>>>()
    const retryRequest = deferred<Awaited<ReturnType<typeof getGroupMatches>>>()
    vi.mocked(getGroupMatches)
      .mockReturnValueOnce(oldGroupRequest.promise)
      .mockRejectedValueOnce(new Error('Current group unavailable'))
      .mockReturnValueOnce(retryRequest.promise)
    const props = { onOpenChange: vi.fn(), open: true }
    const view = render(<ImportMatchesDialog {...props} groupId="group-1" />)
    view.rerender(<ImportMatchesDialog {...props} groupId="group-2" />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load matches/)
    expect(toast.error).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Try Again' }))
    await act(async () => {
      oldGroupRequest.resolve({ matches: [], lastDoc: null })
      await oldGroupRequest.promise
    })

    expect(screen.getByText('Loading your matches...')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

    await act(async () => {
      retryRequest.resolve({
        matches: [{
          ...match, sourceMatchId: match.id, groupId: 'group-2',
          loggedBy: 'user-1', loggedByName: 'Test User',
        }],
        lastDoc: null,
      })
      await retryRequest.promise
    })

    expect(await screen.findByText(/No personal matches are available/)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(getGroupMatches).toHaveBeenNthCalledWith(1, 'group-1')
    expect(getGroupMatches).toHaveBeenNthCalledWith(2, 'group-2')
    expect(getGroupMatches).toHaveBeenNthCalledWith(3, 'group-2')
    expect(toast.error).toHaveBeenCalledTimes(1)
  })
})
