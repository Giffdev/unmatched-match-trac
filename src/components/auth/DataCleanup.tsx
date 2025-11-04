import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/types'

const ALLOWED_EMAIL = 'giffdev@gmail.com'

export function DataCleanup() {
  const [users] = useKV<User[]>('users', [])
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    if (!users || users.length === 0 || hasRun) {
      return
    }

    runCleanup()
  }, [users, hasRun])

  const runCleanup = async () => {
    setHasRun(true)

    if (!users || users.length === 0) {
      console.log('DataCleanup: No users found')
      return
    }

    const allowedUser = users.find(u => u.email === ALLOWED_EMAIL)
    
    if (!allowedUser) {
      console.log('DataCleanup: No giffdev@gmail.com user found')
      return
    }

    console.log(`DataCleanup: Found allowed user ${ALLOWED_EMAIL} with ID ${allowedUser.id}`)

    const allKeys = await window.spark.kv.keys()
    console.log(`DataCleanup: Total keys in storage: ${allKeys.length}`)

    const keysToKeep = [
      'users',
      'current-user-id',
      `matches-${allowedUser.id}`,
      `owned-sets-${allowedUser.id}`,
      `password-${allowedUser.id}`
    ]

    console.log('DataCleanup: Keys to keep:', keysToKeep)

    const usersToKeep = [allowedUser]
    await window.spark.kv.set('users', usersToKeep)
    console.log('DataCleanup: Updated users list to only include giffdev@gmail.com')

    for (const key of allKeys) {
      if (!keysToKeep.includes(key)) {
        await window.spark.kv.delete(key)
        console.log(`DataCleanup: Deleted key: ${key}`)
      }
    }

    const currentUserId = await window.spark.kv.get<string | null>('current-user-id')
    if (currentUserId !== allowedUser.id) {
      await window.spark.kv.set('current-user-id', allowedUser.id)
      console.log(`DataCleanup: Set current user to ${ALLOWED_EMAIL}`)
    }

    console.log('DataCleanup: Cleanup complete')
  }

  return null
}
