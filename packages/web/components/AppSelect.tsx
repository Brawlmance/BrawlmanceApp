import * as Select from '@radix-ui/react-select'
import { useExclusiveOpenState } from './ExclusiveOverlayContext'
import styles from './AppSelect.module.css'

export type AppSelectOption = { value: string; label: string }

type AppSelectProps = {
  value: string
  onValueChange: (value: string) => void
  options: AppSelectOption[]
  /** Passed to the trigger for form-like semantics / tests */
  name?: string
  'aria-label'?: string
  /** Header bar vs rankings form sizing */
  variant?: 'default' | 'header' | 'ranking'
}

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M1 3h8L5 8z" fill="currentColor" />
    </svg>
  )
}

export default function AppSelect({
  value,
  onValueChange,
  options,
  name,
  'aria-label': ariaLabel,
  variant = 'default',
}: AppSelectProps) {
  const [open, onOpenChange] = useExclusiveOpenState()

  if (!options.length) return null

  const safeValue = options.some((o) => o.value === value) ? value : options[0].value

  const triggerClass = [styles.trigger, variant === 'ranking' ? styles.triggerRanking : ''].filter(Boolean).join(' ')

  return (
    <Select.Root open={open} onOpenChange={onOpenChange} value={safeValue} onValueChange={onValueChange}>
      <Select.Trigger className={triggerClass} name={name} aria-label={ariaLabel}>
        <Select.Value />
        <Select.Icon className={styles.icon}>
          <ChevronDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={styles.content}
          position="popper"
          sideOffset={4}
          onCloseAutoFocus={(e) => e.preventDefault()}>
          <Select.Viewport className={styles.viewport}>
            {options.map((opt) => (
              <Select.Item key={opt.value} value={opt.value} className={styles.item}>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
