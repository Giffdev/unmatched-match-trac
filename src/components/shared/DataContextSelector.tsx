import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UsersThree } from '@phosphor-icons/react'

type DataContextSelectorProps = {
  groups: { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
}

export function DataContextSelector({ groups, value, onChange }: DataContextSelectorProps) {
  if (groups.length === 0) return null

  return (
    <div className="mb-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full md:w-auto md:min-w-[220px] h-9 text-sm">
          <div className="flex items-center gap-2">
            {value !== 'personal' && <UsersThree className="w-4 h-4 text-primary flex-shrink-0" />}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">My Matches</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              Group: {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
