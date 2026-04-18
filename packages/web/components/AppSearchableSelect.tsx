import { useLayoutEffect, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Command, defaultFilter } from 'cmdk'
import type { AppSelectOption } from './AppSelect'
import { useExclusiveOpenState } from './ExclusiveOverlayContext'

/** Latin combining marks (NFD); keeps search usable when typing without accents. */
function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const diacriticInsensitiveFilter = (value: string, search: string, keywords?: string[]) =>
  defaultFilter(stripDiacritics(value), stripDiacritics(search), keywords?.map(stripDiacritics))

type AppSearchableSelectProps = {
  value: string
  onValueChange: (value: string) => void
  options: AppSelectOption[]
  name?: string
  'aria-label'?: string
  className?: string
  searchPlaceholder?: string
}

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M1 3h8L5 8z" fill="currentColor" />
    </svg>
  )
}

export default function AppSearchableSelect({
  value,
  onValueChange,
  options,
  name,
  'aria-label': ariaLabel,
  className,
  searchPlaceholder = 'Search…',
}: AppSearchableSelectProps) {
  const [open, setExclusiveOpen] = useExclusiveOpenState()
  const [menuKey, setMenuKey] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (!open) return
    let cancelled = false
    // Portal + cmdk mount after layout; double rAF so the input ref is attached before focus.
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) searchInputRef.current?.focus({ preventScroll: true })
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(outer)
    }
  }, [open, menuKey])

  if (!options.length) return null

  const safeValue = options.some((o) => o.value === value) ? value : options[0].value
  const selectedLabel = options.find((o) => o.value === safeValue)?.label ?? safeValue

  return (
    <Popover.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setExclusiveOpen(next)
        if (next) setMenuKey((k) => k + 1)
      }}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`app-select-trigger ${className ?? ''}`.trim()}
          name={name}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}>
          <span className="app-select-value">{selectedLabel}</span>
          <span className="app-select-icon">
            <ChevronDown />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="app-select-content app-select-content--searchable"
          sideOffset={4}
          collisionPadding={12}
          align="start"
          avoidCollisions
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{
            width: 'max(var(--radix-popper-anchor-width, 160px), min(100vw - 24px, 320px))',
            maxWidth: 'min(100vw - 24px, 360px)',
          }}>
          <Command
            key={menuKey}
            className="app-select-command"
            label={ariaLabel ?? 'Options'}
            loop
            shouldFilter
            filter={diacriticInsensitiveFilter}>
            <Command.Input ref={searchInputRef} className="app-select-search-input" placeholder={searchPlaceholder} />
            <Command.List className="app-select-command-list">
              <Command.Empty className="app-select-empty">No matches.</Command.Empty>
              {options.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.value}
                  keywords={[opt.label, opt.value]}
                  className="app-select-item"
                  onSelect={() => {
                    onValueChange(opt.value)
                    setExclusiveOpen(false)
                  }}>
                  {opt.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
