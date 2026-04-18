import { useLayoutEffect, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Command, defaultFilter } from 'cmdk'
import type { AppSelectOption } from './AppSelect'
import { useExclusiveOpenState } from './ExclusiveOverlayContext'
import styles from './AppSelect.module.css'

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
  variant?: 'default' | 'header' | 'ranking'
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
  variant = 'default',
  searchPlaceholder = 'Search…',
}: AppSearchableSelectProps) {
  const [open, setExclusiveOpen] = useExclusiveOpenState()
  const [menuKey, setMenuKey] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (!open) return
    let cancelled = false
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

  const triggerClass = [styles.trigger, variant === 'ranking' ? styles.triggerRanking : ''].filter(Boolean).join(' ')

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
          className={triggerClass}
          name={name}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}>
          <span className={styles.value}>{selectedLabel}</span>
          <span className={styles.icon}>
            <ChevronDown />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={`${styles.content} ${styles.contentSearchable}`}
          sideOffset={4}
          collisionPadding={12}
          align="start"
          avoidCollisions
          onOpenAutoFocus={(e) => e.preventDefault()}>
          <Command
            key={menuKey}
            className={styles.command}
            label={ariaLabel ?? 'Options'}
            loop
            shouldFilter
            filter={diacriticInsensitiveFilter}>
            <Command.Input ref={searchInputRef} className={styles.searchInput} placeholder={searchPlaceholder} />
            <Command.List className={styles.commandList}>
              <Command.Empty className={styles.empty}>No matches.</Command.Empty>
              {options.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.value}
                  keywords={[opt.label, opt.value]}
                  className={styles.item}
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
