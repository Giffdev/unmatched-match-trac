import { useKV } from '@github/spark/hooks'

export function useUserData<T>(key: string, defaultValue: T) {
  const [currentUserId] = useKV<number | null>('current-user-id', null)
  const userKey = currentUserId ? `${key}-${currentUserId}` : key
  return useKV<T>(userKey, defaultValue)
}
