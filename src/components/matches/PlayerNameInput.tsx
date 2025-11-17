import { useState, useEffect, useMemo, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/types'

type PlayerNameInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  matches: Match[]
}

export function PlayerNameInput({ value, onChange, placeholder, matches }: PlayerNameInputProps) {
  const [open, setOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const existingPlayerNames = useMemo(() => {
    const names = new Set<string>()
    matches.forEach(match => {
      match.players.forEach(player => {
        if (player.playerName.trim()) {
          names.add(player.playerName)
        }
      })
    })
    return Array.from(names).sort()
  }, [matches])

  const filteredNames = useMemo(() => {
    if (!value.trim()) return existingPlayerNames
    const searchLower = value.toLowerCase()
    return existingPlayerNames.filter(name => 
      name.toLowerCase().includes(searchLower)
    )
  }, [value, existingPlayerNames])

  const shouldShowDropdown = inputFocused && filteredNames.length > 0 && value !== filteredNames[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setInputFocused(false)
      }
    }

    if (inputFocused) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inputFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelectName = (name: string) => {
    onChange(name)
    setOpen(false)
    setInputFocused(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    setInputFocused(true)
    if (filteredNames.length > 0) {
      setOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setInputFocused(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder || "Player name"}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      
      {shouldShowDropdown && open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
          <Command shouldFilter={false}>
            <CommandList>
              <CommandGroup>
                {filteredNames.map((name) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => handleSelectName(name)}
                    className="cursor-pointer"
                  >
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
