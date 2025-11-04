import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

export function useUserData<T>(key: string, defaultValue: T, userId: string | null | undefined) {
  const userKey = userId ? `${key}-${userId}` : `${key}-temp`
  const [value, setValue, deleteValue] = useKV<T>(userKey, defaultValue)
  
  useEffect(() => {
    if (!userId) {
      return
    }
    
    const loadData = async () => {
      const storedValue = await window.spark.kv.get<T>(`${key}-${userId}`)
      if (storedValue !== undefined) {
        setValue(storedValue)
      }
    }
    
    loadData()
  }, [userId, key])
  
  return [value, setValue, deleteValue] as const
}
