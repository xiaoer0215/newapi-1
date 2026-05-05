export function applyFaviconToDom(url: string) {
  if (typeof document === 'undefined' || !url) return
  try {
    const next = new URL(url, window.location.href).href
    const existing =
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
    if (existing.length === 1 && existing[0].href === next) return
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = url
    existing.forEach((l) => l.remove())
    document.head.appendChild(link)
  } catch {
    // Ignore malformed URLs
  }
}

type SeoPayload = {
  description?: string
  keywords?: string
}

function upsertMeta(name: string, content?: string) {
  if (typeof document === 'undefined') return
  const normalized = String(content || '').trim()
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!normalized) {
    meta?.remove()
    return
  }
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', normalized)
}

export function applySeoToDom(payload: SeoPayload) {
  if (typeof document === 'undefined') return
  upsertMeta('description', payload.description)
  upsertMeta('keywords', payload.keywords)
}
