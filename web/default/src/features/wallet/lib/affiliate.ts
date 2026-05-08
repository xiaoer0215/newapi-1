// ============================================================================
// Affiliate Functions
// ============================================================================

/**
 * Generate affiliate registration link
 */
export function generateAffiliateLink(affCode: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/sign-up?aff=${encodeURIComponent(affCode)}`
}

const AFFILIATE_TIER_NAME_KEYS: Record<number, string> = {
  1: 'Affiliate Tier Name 1',
  2: 'Affiliate Tier Name 2',
  3: 'Affiliate Tier Name 3',
  4: 'Affiliate Tier Name 4',
}

export function getAffiliateTierName(
  level: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const key = AFFILIATE_TIER_NAME_KEYS[level]
  if (!key) {
    return t('Tier {{level}}', { level })
  }
  return t(key)
}

export function maskAffiliateUsername(username: string): string {
  const chars = Array.from((username || '').trim())
  if (chars.length === 0) return '-'
  if (chars.length === 1) return `${chars[0]}****`
  if (chars.length <= 6) {
    return `${chars[0]}****${chars[chars.length - 1]}`
  }

  const prefixLength = Math.max(1, Math.floor((chars.length - 4) / 2))
  const suffixLength = Math.max(1, chars.length - prefixLength - 4)

  return `${chars.slice(0, prefixLength).join('')}****${chars
    .slice(chars.length - suffixLength)
    .join('')}`
}

export function maskAffiliateEmail(email: string): string {
  const trimmed = (email || '').trim()
  if (!trimmed) return '-'

  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0) return maskAffiliateUsername(trimmed)

  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)
  const chars = Array.from(local)

  if (chars.length === 0) return `*****@${domain}`

  let maskedLocal = ''

  if (chars.length >= 6 && chars.length <= 10) {
    const prefixLength = Math.max(1, Math.floor((chars.length - 5) / 2))
    const suffixLength = Math.max(0, chars.length - prefixLength - 5)
    maskedLocal = `${chars.slice(0, prefixLength).join('')}*****${chars
      .slice(chars.length - suffixLength)
      .join('')}`
  } else if (chars.length <= 5) {
    maskedLocal = `${chars[0]}***${chars.length > 2 ? chars[chars.length - 1] : ''}`
  } else {
    maskedLocal = `${chars.slice(0, 2).join('')}****${chars.slice(-3).join('')}`
  }

  return `${maskedLocal}@${domain}`
}

export function getAffiliateAccountTypeLabel(
  accountType: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const trimmed = (accountType || '').trim()
  const normalized = trimmed.toLowerCase()
  const normalizedNoSpaces = normalized.replace(/\s+/g, '')

  if (
    normalized === 'alipay' ||
    normalized === '支付宝' ||
    normalizedNoSpaces.includes('alipay') ||
    normalizedNoSpaces.includes('zhifubao')
  ) {
    return t('Alipay')
  }
  return trimmed || '-'
}
