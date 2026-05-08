export const OVERVIEW_LAYOUT_SECTION_IDS = [
  'api-info',
  'announcements',
  'contact-panels',
  'faq',
] as const

export type OverviewLayoutSectionId =
  (typeof OVERVIEW_LAYOUT_SECTION_IDS)[number]

export const DEFAULT_OVERVIEW_LAYOUT: OverviewLayoutSectionId[] = [
  'api-info',
  'announcements',
  'contact-panels',
  'faq',
]

export function normalizeOverviewLayout(
  raw: string | null | undefined
): OverviewLayoutSectionId[] {
  const next: OverviewLayoutSectionId[] = []

  try {
    const parsed = raw?.trim() ? (JSON.parse(raw) as unknown) : []
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const id =
          typeof item === 'string'
            ? item
            : item &&
                typeof item === 'object' &&
                typeof (item as { id?: unknown }).id === 'string'
              ? String((item as { id: string }).id)
              : ''

        if (
          OVERVIEW_LAYOUT_SECTION_IDS.includes(id as OverviewLayoutSectionId) &&
          !next.includes(id as OverviewLayoutSectionId)
        ) {
          next.push(id as OverviewLayoutSectionId)
        }
      }
    }
  } catch {
    // ignore invalid JSON and fall back to defaults
  }

  for (const id of DEFAULT_OVERVIEW_LAYOUT) {
    if (!next.includes(id)) {
      next.push(id)
    }
  }

  return next
}

export function serializeOverviewLayout(
  ids: OverviewLayoutSectionId[]
): string {
  return JSON.stringify(ids.map((id) => ({ id })), null, 2)
}
