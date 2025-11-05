import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Warning, Info } from '@phosphor-icons/react'

export function DataLossExplanation() {
  return (
    <Card className="max-w-3xl mx-auto mb-6 border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Warning className="h-5 w-5" />
          Data Loss Investigation
        </CardTitle>
        <CardDescription>
          What happened to your 70+ matches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertTitle>Root Cause Identified</AlertTitle>
          <AlertDescription>
            The DataCleanup component was automatically deleting storage keys that weren't in its whitelist. This likely deleted your match data.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 text-sm">
          <h3 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            What Happened:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
            <li>Your 70+ matches were stored under a specific user ID key (e.g., "matches-USER_ID")</li>
            <li>The DataCleanup component ran on page load and scanned all storage keys</li>
            <li>It deleted any keys not matching its hardcoded whitelist</li>
            <li>Your match data key was likely not in the whitelist and got deleted</li>
          </ol>
        </div>

        <div className="space-y-2 text-sm">
          <h3 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            What We're Doing Now:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong className="text-accent">Disabled DataCleanup</strong> - It can no longer delete data</li>
            <li><strong className="text-accent">Added Recovery Tool</strong> - Use it to scan for any remaining data</li>
            <li><strong className="text-accent">Checking Storage</strong> - Look for any backup or cached data</li>
          </ol>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Next Steps:</strong> Use the Data Recovery Tool above to scan your storage. If any match data is found, we can restore it. Unfortunately, if the data was already deleted by the cleanup, it may not be recoverable.
          </AlertDescription>
        </Alert>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <strong>Prevention:</strong> The destructive cleanup code has been removed. Your data is now safe from automatic deletion.
        </div>
      </CardContent>
    </Card>
  )
}
