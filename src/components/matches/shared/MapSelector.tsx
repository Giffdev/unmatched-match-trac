import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, CaretUpDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { MAPS } from '@/lib/data'

export type MapSelectorProps = {
  value: string
  onChange: (mapId: string) => void
  availableMaps: typeof MAPS
}

export function MapSelector({ value, onChange, availableMaps }: MapSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredMaps = useMemo(() => {
    const maps = !search ? [...availableMaps] : availableMaps.filter(
      map =>
        map.name.toLowerCase().includes(search.toLowerCase()) ||
        map.set.toLowerCase().includes(search.toLowerCase())
    )
    return maps.sort((a, b) => a.name.localeCompare(b.name))
  }, [search, availableMaps])

  const selectedMap = MAPS.find(m => m.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-w-0 whitespace-normal text-left h-auto min-h-9 py-2"
        >
          {selectedMap ? (
            <span className="truncate flex-1 text-left min-w-0 block">
              {selectedMap.name}
              <span className="text-xs text-muted-foreground ml-2">
                ({selectedMap.minPlayers === selectedMap.maxPlayers 
                  ? `${selectedMap.minPlayers}p` 
                  : `${selectedMap.minPlayers}-${selectedMap.maxPlayers}p`})
              </span>
            </span>
          ) : (
            <span className="whitespace-nowrap">Select map...</span>
          )}
          <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search maps..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No map found.</CommandEmpty>
            <CommandGroup>
              {filteredMaps.map((map) => (
                <CommandItem
                  key={map.id}
                  value={map.id}
                  onSelect={() => {
                    onChange(map.id)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === map.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div>{map.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {map.set} • {map.minPlayers === map.maxPlayers 
                        ? `${map.minPlayers}p` 
                        : `${map.minPlayers}-${map.maxPlayers}p`}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
