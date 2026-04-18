import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

type ExclusiveOverlayContextValue = {
  activeId: string | null
  setActiveId: Dispatch<SetStateAction<string | null>>
}

const ExclusiveOverlayContext = createContext<ExclusiveOverlayContextValue | null>(null)

/** When wrapped around the app, at most one child that uses `useExclusiveOpenState` may be open at a time. */
export function ExclusiveOverlayProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId])
  return <ExclusiveOverlayContext.Provider value={value}>{children}</ExclusiveOverlayContext.Provider>
}

/**
 * Coordinates open state so opening one dropdown closes any other that uses this hook.
 * Without `ExclusiveOverlayProvider`, behaves like plain local open state (single control only).
 */
export function useExclusiveOpenState(): readonly [boolean, (next: boolean) => void] {
  const id = useId()
  const ctx = useContext(ExclusiveOverlayContext)
  const [localOpen, setLocalOpen] = useState(false)

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!ctx) {
        setLocalOpen(next)
      } else if (next) {
        ctx.setActiveId(id)
      } else {
        ctx.setActiveId((prev) => (prev === id ? null : prev))
      }
    },
    [ctx, id]
  )

  const open = ctx ? ctx.activeId === id : localOpen
  return [open, onOpenChange] as const
}
