import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, CaretUpDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { HEROES, getSelectableHeroes } from '@/lib/data'

export type HeroSelectorProps = {
  value: string
  onChange: (heroId: string) => void
  variant?: string
  onVariantChange?: (variant: string) => void
}

export function HeroSelector({ value, onChange, variant, onVariantChange }: HeroSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectableHeroes = getSelectableHeroes()

  const filteredHeroes = useMemo(() => {
    if (!search) return selectableHeroes
    const searchLower = search.toLowerCase()
    return selectableHeroes.filter(
      hero =>
        hero.name.toLowerCase().includes(searchLower) ||
        hero.set.toLowerCase().includes(searchLower)
    )
  }, [search, selectableHeroes])

  const selectedHero = HEROES.find(h => h.id === value)
  const isYenneferTriss = value === 'yennefer-triss'

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-w-0 whitespace-normal text-left h-auto min-h-9 py-2"
          >
            {selectedHero ? (
              <span className="truncate flex-1 text-left min-w-0 block">
                {selectedHero.name} <span className="text-xs text-muted-foreground">({selectedHero.set})</span>
              </span>
            ) : (
              <span className="whitespace-nowrap">Select hero...</span>
            )}
            <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search heroes..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No hero found.</CommandEmpty>
              <CommandGroup>
                {filteredHeroes.map((hero) => (
                  <CommandItem
                    key={hero.id}
                    value={hero.id}
                    onSelect={() => {
                      onChange(hero.id)
                      setOpen(false)
                      setSearch('')
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === hero.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div>{hero.name}</div>
                      <div className="text-xs text-muted-foreground">{hero.set}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isYenneferTriss && onVariantChange && (
        <RadioGroup value={variant || 'yennefer'} onValueChange={onVariantChange}>
          <div className="flex gap-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yennefer" id={`yennefer-${value}`} />
              <Label htmlFor={`yennefer-${value}`} className="cursor-pointer font-normal">
                Yennefer (Hero)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="triss" id={`triss-${value}`} />
              <Label htmlFor={`triss-${value}`} className="cursor-pointer font-normal">
                Triss (Hero)
              </Label>
            </div>
          </div>
        </RadioGroup>
      )}
    </div>
  )
}
