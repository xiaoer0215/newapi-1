export type LegacyPaymentStatus =
  | 'success'
  | 'fail'
  | 'pending'
  | 'cancelled'

const SUCCESS_STATUSES = new Set([
  'success',
  'succeeded',
  'paid',
  'trade_success',
  'trade_finished',
])

const PENDING_STATUSES = new Set([
  'pending',
  'processing',
  'waiting',
  'trade_pending',
])

const FAILED_STATUSES = new Set([
  'fail',
  'failed',
  'error',
  'trade_failed',
  'trade_closed',
])

const CANCELLED_STATUSES = new Set([
  'cancel',
  'cancelled',
  'canceled',
])

function normalizeStatus(value?: string | null): string {
  return (value || '').trim().toLowerCase()
}

function parseLegacySearch(searchStr: string): URLSearchParams {
  const trimmed = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr
  return new URLSearchParams(trimmed)
}

function isTruthy(value?: string | null): boolean {
  const normalized = normalizeStatus(value)
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

export function resolveLegacyPaymentStatus(
  params: URLSearchParams
): LegacyPaymentStatus | undefined {
  const pay = normalizeStatus(params.get('pay'))
  const tradeStatus = normalizeStatus(params.get('trade_status'))
  const candidate = pay || tradeStatus

  if (!candidate) return undefined
  if (SUCCESS_STATUSES.has(candidate)) return 'success'
  if (PENDING_STATUSES.has(candidate)) return 'pending'
  if (FAILED_STATUSES.has(candidate)) return 'fail'
  if (CANCELLED_STATUSES.has(candidate)) return 'cancelled'

  return undefined
}

export function hasLegacyPaymentParams(searchStr: string): boolean {
  const params = parseLegacySearch(searchStr)

  return [
    'pay',
    'trade_status',
    'trade_no',
    'out_trade_no',
    'pid',
    'sign',
    'sign_type',
    'money',
    'type',
  ].some((key) => params.has(key))
}

export function buildLegacyWalletHref(
  searchStr: string,
  options?: {
    forceShowHistory?: boolean
  }
): string {
  const params = parseLegacySearch(searchStr)
  const next = new URLSearchParams()
  const paymentStatus = resolveLegacyPaymentStatus(params)
  const tradeNo = params.get('out_trade_no') || params.get('trade_no') || ''

  const showHistory =
    options?.forceShowHistory ||
    isTruthy(params.get('show_history')) ||
    !!paymentStatus

  if (showHistory) {
    next.set('show_history', 'true')
  }

  if (paymentStatus) {
    next.set('pay', paymentStatus)
  }

  if (tradeNo) {
    next.set('trade_no', tradeNo)
  }

  const nextSearch = next.toString()
  return nextSearch ? `/wallet?${nextSearch}` : '/wallet'
}
