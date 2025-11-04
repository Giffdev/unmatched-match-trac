import { useKV } from '@github/spark/hooks'

export function useUserData<T>(key: string, defaultValue: T, userId: string | null | undefined) {
  const userKey = userId ? `${key}-${userId}` : key
  return useKV<T>(userKey, defaultValue)
}
