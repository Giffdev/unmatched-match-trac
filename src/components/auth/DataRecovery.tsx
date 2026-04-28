import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from '@phosphor-icons/react'

export function DataRecovery() {
  return (
    <Card className="max-w-3xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Recovery Tool
        </CardTitle>
        <CardDescription>
          Data is now stored in Firebase Firestore. Use the Firebase console to inspect or recover data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <strong>Note:</strong> This tool is no longer needed with Firebase. Your data is automatically backed up in Firestore.
        </div>
      </CardContent>
    </Card>
  )
}
