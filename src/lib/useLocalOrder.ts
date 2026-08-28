import { useState, useCallback } from 'react'

/**
 * Hook that manages drag-and-drop reordering of a list, persisting to localStorage.
 * T must have an `id: string` field.
 */
export function useLocalOrder<T extends { id: string }>(
  items: T[],
  storageKey: string,
): {
  ordered: T[]
  dragHandlers: (id: string) => {
    draggable: true
    onDragStart: () => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: () => void
    onDragEnd: () => void
    'data-drag-over': boolean
  }
  resetOrder: () => void
} {
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overIds, setOverId] = useState<string | null>(null)

  const ordered = (() => {
    if (!customOrder.length) return items
    const byId = new Map(items.map((i) => [i.id, i]))
    const known = customOrder.filter((id) => byId.has(id)).map((id) => byId.get(id)!)
    const newItems = items.filter((i) => !customOrder.includes(i.id))
    return [...known, ...newItems]
  })()

  const dragHandlers = useCallback(
    (id: string) => ({
      draggable: true as const,
      onDragStart: () => setDraggingId(id),
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        setOverId(id)
      },
      onDrop: () => {
        if (!draggingId || draggingId === id) return
        setCustomOrder((prev) => {
          const base = prev.length ? prev : items.map((i) => i.id)
          const from = base.indexOf(draggingId)
          const to = base.indexOf(id)
          if (from === -1 || to === -1) return base

          // If any item is missing from base, rebuild from current ordered
          const full = ordered.map((i) => i.id)
          const fi = full.indexOf(draggingId)
          const ti = full.indexOf(id)
          const next = [...full]
          next.splice(fi, 1)
          next.splice(ti, 0, draggingId)
          localStorage.setItem(storageKey, JSON.stringify(next))
          return next
        })
        setOverId(null)
      },
      onDragEnd: () => {
        setDraggingId(null)
        setOverId(null)
      },
      'data-drag-over': overIds === id && draggingId !== id,
    }),
    [draggingId, overIds, items, ordered, storageKey],
  )

  const resetOrder = useCallback(() => {
    localStorage.removeItem(storageKey)
    setCustomOrder([])
  }, [storageKey])

  return { ordered, dragHandlers, resetOrder }
}
