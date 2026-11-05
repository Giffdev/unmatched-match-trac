import { Question } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function GroupsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-11 gap-1.5">
          <Question size={18} aria-hidden="true" />
          How groups work
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] flex flex-col [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:top-1 [&>button]:right-1">
        <DialogHeader className="shrink-0 pr-8 text-left">
          <DialogTitle>How groups work</DialogTitle>
          <DialogDescription>A shared match log for your gaming circle.</DialogDescription>
        </DialogHeader>

        <div tabIndex={0} role="region" aria-label="Groups guide" className="min-h-0 overflow-y-auto space-y-4 text-sm text-muted-foreground">
          <section className="space-y-1">
            <h3 className="font-semibold text-foreground">Share only the matches you choose</h3>
            <p>
              Creating or joining a group does not share your existing match history.
              On the Matches tab, use Log Match and select “Also log to group(s)” to
              share a new match with those groups. It also stays in My Matches.
            </p>
            <p>
              For past games, open a group from the Groups tab, choose Import Matches,
              then select which personal matches to copy into the shared log.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-semibold text-foreground">Switch the view, not your data</h3>
            <p>
              On Matches, Players, and Heroes, choose My Matches for your personal
              history and stats, or Group: [name] for that group’s shared matches
              and stats. Switching views does not share or move matches.
            </p>
            <p>Your owned-set collection stays personal; joining a group does not combine collections.</p>
          </section>

          <section className="space-y-1">
            <h3 className="font-semibold text-foreground">Create or join a circle</h3>
            <p>
              Choose Create Group on the Groups tab, then invite friends from the
              group’s Members tab. To join, open a shared invite link and sign in,
              or accept a pending invitation on the Groups tab.
            </p>
            <p>
              Group names are just labels. “Home Group” is a name you can choose,
              not a special home or default group.
            </p>
          </section>
        </div>

        <DialogFooter className="shrink-0">
          <DialogClose asChild>
            <Button className="min-h-11">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
