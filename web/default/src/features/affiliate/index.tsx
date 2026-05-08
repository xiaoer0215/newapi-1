import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Gift,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { getSelf } from '@/lib/api'
import {
  formatPercent,
  formatTimestampToDate,
} from '@/lib/format'
import {
  formatBillingCurrencyFromQuota,
  parseBillingAmountToQuota,
  quotaToBillingAmount,
} from '@/lib/currency'
import { ROLE } from '@/lib/roles'
import { SectionPageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useAuthStore } from '@/stores/auth-store'
import {
  createAffiliateWithdrawal,
  getAdminAffiliateInviteRelations,
  getAdminAffiliateRecords,
  getAdminAffiliateWithdrawals,
  getAffiliateInvitees,
  getAffiliateRecords,
  getAffiliateSummary,
  getAffiliateWithdrawals,
  reviewAdminAffiliateWithdrawal,
  transferAffiliateQuota,
} from '@/features/wallet/api'
import {
  generateAffiliateLink,
  getAffiliateAccountTypeLabel,
  getAffiliateTierName,
  maskAffiliateEmail,
  maskAffiliateUsername,
} from '@/features/wallet/lib'
import type {
  AdminAffiliateRecord,
  AffiliateCommissionTier,
  AffiliateInvitee,
  AffiliateRecord,
  AffiliateSummary,
  AffiliateWithdrawal,
} from '@/features/wallet/types'

const PAGE_SIZE = 20

function statusLabel(
  status: AffiliateWithdrawal['status'],
  t: (key: string) => string
) {
  switch (status) {
    case 'approved':
      return t('Approved')
    case 'rejected':
      return t('Rejected')
    case 'paid':
      return t('Paid')
    default:
      return t('Pending')
  }
}

function statusVariant(status: AffiliateWithdrawal['status']) {
  switch (status) {
    case 'approved':
      return 'outline' as const
    case 'rejected':
      return 'destructive' as const
    case 'paid':
      return 'default' as const
    default:
      return 'secondary' as const
  }
}

function EmptyTableRow({
  colSpan,
  label,
}: {
  colSpan: number
  label: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className='text-muted-foreground py-8 text-center text-sm'
      >
        {label}
      </TableCell>
    </TableRow>
  )
}

function TablePagination({
  currentPage,
  total,
  pageSize,
  onPageChange,
  t,
}: {
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const totalPages = Math.max(1, Math.ceil(Math.max(total, 0) / pageSize))

  if (total <= pageSize) {
    return null
  }

  return (
    <div className='mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='text-muted-foreground text-xs sm:text-sm'>
        {t('Page {{current}} of {{total}}', {
          current: currentPage,
          total: totalPages,
        })}
      </div>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('Previous')}
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t('Next')}
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  hint: string
}) {
  return (
    <div className='rounded-2xl border bg-background/80 p-4 shadow-sm'>
      <div className='mb-3 flex items-center gap-3'>
        <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl'>
          <Icon className='size-4' />
        </div>
        <div className='min-w-0'>
          <div className='text-muted-foreground text-xs'>{label}</div>
          <div className='truncate text-lg font-semibold'>{value}</div>
        </div>
      </div>
      <div className='text-muted-foreground text-xs'>{hint}</div>
    </div>
  )
}

function TierCard({
  tier,
  currentLevel,
  nextLevel,
  t,
}: {
  tier: AffiliateCommissionTier
  currentLevel: number
  nextLevel?: number
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const isCurrent = tier.level === currentLevel
  const isNext = tier.level === nextLevel

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isCurrent
          ? 'border-primary/40 bg-primary/8 shadow-sm'
          : isNext
            ? 'border-amber-500/40 bg-amber-500/8'
            : 'bg-background'
      }`}
    >
      <div className='mb-3 flex items-center justify-between gap-2'>
        <div className='text-sm font-semibold'>
          {getAffiliateTierName(tier.level, t)}
        </div>
        {isCurrent ? (
          <Badge>{t('Current')}</Badge>
        ) : isNext ? (
          <Badge variant='secondary'>{t('Next')}</Badge>
        ) : (
          <Badge variant='outline'>{formatPercent(tier.percentage)}</Badge>
        )}
      </div>
      <div className='space-y-1'>
        <div className='text-2xl font-semibold'>
          {formatPercent(tier.percentage)}
        </div>
        <div className='text-muted-foreground text-xs'>
          {t('{{count}} invites', { count: tier.min_invites })}
        </div>
      </div>
    </div>
  )
}

function MiniInfo({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className='rounded-2xl border bg-background/70 px-4 py-3'>
      <div className='text-muted-foreground text-xs'>{label}</div>
      <div className='mt-1 text-base font-semibold'>{value}</div>
      {hint ? <div className='text-muted-foreground mt-1 text-xs'>{hint}</div> : null}
    </div>
  )
}

export function AffiliatePage() {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const currentUser = useAuthStore((state) => state.auth.user)
  const isAdmin = (currentUser?.role ?? 0) >= ROLE.ADMIN

  const [summary, setSummary] = useState<AffiliateSummary | null>(null)
  const [records, setRecords] = useState<AffiliateRecord[]>([])
  const [invitees, setInvitees] = useState<AffiliateInvitee[]>([])
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>([])
  const [adminInviteRelations, setAdminInviteRelations] = useState<
    AffiliateInvitee[]
  >([])
  const [adminRecords, setAdminRecords] = useState<
    AdminAffiliateRecord[]
  >([])
  const [adminWithdrawals, setAdminWithdrawals] = useState<
    AffiliateWithdrawal[]
  >([])
  const [loading, setLoading] = useState(true)
  const [transfering, setTransfering] = useState(false)
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  const [reviewLoadingId, setReviewLoadingId] = useState<number | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [transferAmount, setTransferAmount] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [accountNo, setAccountNo] = useState('')
  const [accountName, setAccountName] = useState('')
  const [note, setNote] = useState('')
  const [adminKeyword, setAdminKeyword] = useState('')
  const [adminQueryKeyword, setAdminQueryKeyword] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [inviteesPage, setInviteesPage] = useState(1)
  const [inviteesTotal, setInviteesTotal] = useState(0)
  const [withdrawalsPage, setWithdrawalsPage] = useState(1)
  const [withdrawalsTotal, setWithdrawalsTotal] = useState(0)
  const [adminInviteRelationsPage, setAdminInviteRelationsPage] = useState(1)
  const [adminInviteRelationsTotal, setAdminInviteRelationsTotal] = useState(0)
  const [adminRecordsPage, setAdminRecordsPage] = useState(1)
  const [adminRecordsTotal, setAdminRecordsTotal] = useState(0)
  const [adminWithdrawalsPage, setAdminWithdrawalsPage] = useState(1)
  const [adminWithdrawalsTotal, setAdminWithdrawalsTotal] = useState(0)

  const affiliateLink = useMemo(
    () => generateAffiliateLink(summary?.aff_code ?? ''),
    [summary?.aff_code]
  )
  const minimumWithdrawText = useMemo(() => {
    const minimumWithdrawQuota = Number(summary?.affiliate_min_withdraw_quota ?? 0)
    return formatBillingCurrencyFromQuota(
      Number.isFinite(minimumWithdrawQuota) ? minimumWithdrawQuota : 0
    )
  }, [summary?.affiliate_min_withdraw_quota])
  const tierList = Array.isArray(summary?.affiliate_commission_tiers)
    ? summary.affiliate_commission_tiers
    : []
  const currentTierLevel = summary?.current_affiliate_level ?? 1
  const nextTierLevel = summary?.next_affiliate_tier?.level
  const withdrawNotice = summary?.affiliate_withdraw_notice?.trim() ?? ''
  const pendingReviewCount = useMemo(
    () => adminWithdrawals.filter((item) => item.status === 'pending').length,
    [adminWithdrawals]
  )
  const currentInviteCount = Math.max(Number(summary?.aff_count ?? 0), 0)
  const currentTier =
    tierList.find((tier) => tier.level === currentTierLevel) ??
    summary?.current_affiliate_tier
  const currentTierMinInvites = Math.max(
    Number(currentTier?.min_invites ?? 0),
    0
  )
  const nextTierMinInvites = Math.max(
    Number(summary?.next_affiliate_tier?.min_invites ?? currentTierMinInvites),
    currentTierMinInvites
  )
  const nextTierRateText = summary?.next_affiliate_tier
    ? formatPercent(summary.next_affiliate_tier.percentage)
    : formatPercent(summary?.affiliate_commission_percentage ?? 0)
  const progressQuota =
    nextTierMinInvites > currentTierMinInvites
      ? nextTierMinInvites - currentTierMinInvites
      : 1
  const progressStep = Math.min(
    Math.max(currentInviteCount - currentTierMinInvites, 0),
    progressQuota
  )
  const progressValue = summary?.next_affiliate_tier
    ? Math.min(100, (progressStep / progressQuota) * 100)
    : 100
  const availableAffiliateAmount = formatBillingCurrencyFromQuota(
    summary?.aff_quota ?? 0
  )
  const canTransfer =
    !transfering &&
    !!summary?.affiliate_transfer_enabled &&
    !loading &&
    transferAmount > 0
  const canWithdraw =
    !submittingWithdraw &&
    !!summary?.affiliate_withdraw_enabled &&
    !loading &&
    withdrawAmount > 0 &&
    !!accountNo.trim()

  const loadUserData = async () => {
    const [summaryRes, recordsRes, inviteesRes, withdrawalsRes] =
      await Promise.all([
        getAffiliateSummary(),
        getAffiliateRecords(recordsPage, PAGE_SIZE),
        getAffiliateInvitees(inviteesPage, PAGE_SIZE),
        getAffiliateWithdrawals(withdrawalsPage, PAGE_SIZE),
      ])

    if (summaryRes.success && summaryRes.data) {
      setSummary(summaryRes.data)
      const minWithdrawQuotaRaw = Number(
        summaryRes.data.affiliate_min_withdraw_quota ?? 0
      )
      const minWithdrawQuota = Number.isFinite(minWithdrawQuotaRaw)
        ? Math.max(minWithdrawQuotaRaw, 0)
        : 0
      const availableQuota = Math.max(Number(summaryRes.data.aff_quota || 0), 0)
      const defaultTransferQuota =
        availableQuota > 0
          ? Math.min(availableQuota, minWithdrawQuota)
          : minWithdrawQuota
      setTransferAmount((prev) =>
        prev > 0 ? prev : quotaToBillingAmount(defaultTransferQuota)
      )
      setWithdrawAmount((prev) =>
        prev > 0 ? prev : quotaToBillingAmount(minWithdrawQuota)
      )
    }
    if (recordsRes.success && recordsRes.data) {
      setRecordsTotal(Number(recordsRes.data.total) || 0)
      setRecords(Array.isArray(recordsRes.data.items) ? recordsRes.data.items : [])
    }
    if (inviteesRes.success && inviteesRes.data) {
      setInviteesTotal(Number(inviteesRes.data.total) || 0)
      setInvitees(
        Array.isArray(inviteesRes.data.items) ? inviteesRes.data.items : []
      )
    }
    if (withdrawalsRes.success && withdrawalsRes.data) {
      setWithdrawalsTotal(Number(withdrawalsRes.data.total) || 0)
      setWithdrawals(
        Array.isArray(withdrawalsRes.data.items) ? withdrawalsRes.data.items : []
      )
    }
  }

  const loadAdminData = async (keyword = '') => {
    if (!isAdmin) return
    const [inviteRelationsRes, adminRecordsRes, adminWithdrawalsRes] =
      await Promise.all([
        getAdminAffiliateInviteRelations(
          adminInviteRelationsPage,
          PAGE_SIZE,
          keyword
        ),
        getAdminAffiliateRecords(adminRecordsPage, PAGE_SIZE, keyword),
        getAdminAffiliateWithdrawals(
          adminWithdrawalsPage,
          PAGE_SIZE,
          keyword
        ),
      ])

    if (inviteRelationsRes.success && inviteRelationsRes.data) {
      setAdminInviteRelationsTotal(Number(inviteRelationsRes.data.total) || 0)
      setAdminInviteRelations(
        Array.isArray(inviteRelationsRes.data.items)
          ? inviteRelationsRes.data.items
          : []
      )
    }
    if (adminRecordsRes.success && adminRecordsRes.data) {
      setAdminRecordsTotal(Number(adminRecordsRes.data.total) || 0)
      setAdminRecords(
        Array.isArray(adminRecordsRes.data.items) ? adminRecordsRes.data.items : []
      )
    }
    if (adminWithdrawalsRes.success && adminWithdrawalsRes.data) {
      setAdminWithdrawalsTotal(Number(adminWithdrawalsRes.data.total) || 0)
      setAdminWithdrawals(
        Array.isArray(adminWithdrawalsRes.data.items)
          ? adminWithdrawalsRes.data.items
          : []
      )
    }
  }

  const triggerReload = () => setReloadNonce((prev) => prev + 1)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        if (mounted) {
          setLoading(true)
        }
        await loadUserData()
        await loadAdminData(adminQueryKeyword)
      } catch {
        toast.error(t('Failed to load data'))
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAdmin,
    recordsPage,
    inviteesPage,
    withdrawalsPage,
    adminInviteRelationsPage,
    adminRecordsPage,
    adminWithdrawalsPage,
    adminQueryKeyword,
    reloadNonce,
  ])

  const handleTransfer = async () => {
    try {
      setTransfering(true)
      const res = await transferAffiliateQuota({
        quota: parseBillingAmountToQuota(transferAmount),
      })
      if (!res.success) return
      toast.success(t('Transfer successful'))
      await getSelf()
      triggerReload()
    } finally {
      setTransfering(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      setSubmittingWithdraw(true)
      const res = await createAffiliateWithdrawal({
        amount: parseBillingAmountToQuota(withdrawAmount),
        account_type: 'alipay',
        account_no: accountNo,
        account_name: accountName,
        note,
      })
      if (!res.success) return
      toast.success(t('Submitted'))
      setAccountNo('')
      setAccountName('')
      setNote('')
      setWithdrawAmount(quotaToBillingAmount(Number(summary?.affiliate_min_withdraw_quota ?? 0)))
      triggerReload()
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  const handleReview = async (
    id: number,
    status: 'approved' | 'rejected' | 'paid'
  ) => {
    try {
      setReviewLoadingId(id)
      const res = await reviewAdminAffiliateWithdrawal(id, { status })
      if (!res.success) return
      toast.success(t('Updated successfully'))
      triggerReload()
    } finally {
      setReviewLoadingId(null)
    }
  }

  const handleAdminSearch = () => {
    const nextKeyword = adminKeyword.trim()
    const changed =
      nextKeyword !== adminQueryKeyword ||
      adminInviteRelationsPage !== 1 ||
      adminRecordsPage !== 1 ||
      adminWithdrawalsPage !== 1

    setAdminQueryKeyword(nextKeyword)
    setAdminInviteRelationsPage(1)
    setAdminRecordsPage(1)
    setAdminWithdrawalsPage(1)

    if (!changed) {
      triggerReload()
    }
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Affiliate Center')}</SectionPageLayout.Title>
      <SectionPageLayout.Description>
        {t('Manage referral commission, transfer, and withdrawal')}
      </SectionPageLayout.Description>
      <SectionPageLayout.Actions>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={triggerReload}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
          {t('Reload Data')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-4'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className={`grid h-auto w-full gap-1 rounded-xl p-1 ${
                isAdmin ? 'grid-cols-2' : 'grid-cols-1'
              }`}
            >
              <TabsTrigger value='overview'>{t('My Affiliate')}</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value='admin'>{t('Affiliate Admin')}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value='overview' className='mt-4 space-y-4'>
              <div className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]'>
                <Card className='border-primary/15 bg-gradient-to-br from-primary/8 via-background to-background'>
                  <CardHeader className='pb-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge>{getAffiliateTierName(currentTierLevel, t)}</Badge>
                      <Badge variant='outline'>
                        {formatPercent(summary?.affiliate_commission_percentage ?? 0)}
                      </Badge>
                    </div>
                    <CardTitle>{t('Referral Program')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-4'>
                    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                      <StatCard
                        icon={Wallet}
                        label={t('Pending')}
                        value={formatBillingCurrencyFromQuota(summary?.aff_quota ?? 0)}
                        hint={t('Available for transfer or withdrawal')}
                      />
                      <StatCard
                        icon={TrendingUp}
                        label={t('Total Earned')}
                        value={formatBillingCurrencyFromQuota(summary?.aff_history_quota ?? 0)}
                        hint={t('Historical commission earnings')}
                      />
                      <StatCard
                        icon={Users}
                        label={t('Invites')}
                        value={String(summary?.aff_count ?? 0)}
                        hint={t('Successfully invited users')}
                      />
                      <StatCard
                        icon={Gift}
                        label={t('Commission Rate')}
                        value={formatPercent(
                          summary?.affiliate_commission_percentage ?? 0
                        )}
                        hint={t('Active commission percentage')}
                      />
                    </div>

                    <Separator />

                    <div className='rounded-2xl border bg-background/80 p-4 shadow-sm'>
                      <div className='mb-2 flex items-center gap-2'>
                        <Share2 className='text-primary size-4' />
                        <div className='font-medium'>{t('Your Referral Link')}</div>
                      </div>
                      <div className='text-muted-foreground mb-3 text-sm'>
                        {t('Share your registration link to invite more users')}
                      </div>
                      <div className='flex flex-col gap-2 sm:flex-row'>
                        <Input readOnly value={affiliateLink} className='flex-1' />
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => copyToClipboard(affiliateLink)}
                          className='sm:w-auto'
                        >
                          {t('Copy')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='secondary'>{t('Current Tier')}</Badge>
                      {summary?.next_affiliate_tier ? (
                        <Badge variant='outline'>
                          {t('Next Tier')}:&nbsp;
                          {getAffiliateTierName(
                            summary.next_affiliate_tier.level,
                            t
                          )}
                        </Badge>
                      ) : (
                        <Badge variant='outline'>{t('Top tier unlocked')}</Badge>
                      )}
                    </div>
                    <CardTitle>
                      {t('Your current referral level and upgrade progress')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-4'>
                    <div className='rounded-3xl border bg-background/80 p-4 shadow-sm'>
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div>
                          <div className='text-muted-foreground text-xs'>
                            {t('Progress')}
                          </div>
                          <div className='mt-1 text-xl font-semibold'>
                            {summary?.next_affiliate_tier
                              ? `${currentInviteCount} / ${nextTierMinInvites}`
                              : t('Top tier unlocked')}
                          </div>
                        </div>
                        {summary?.next_affiliate_tier ? (
                          <Badge variant='outline'>
                            {t('Need {{count}} more invites', {
                              count: summary.remaining_invites_for_next_level ?? 0,
                            })}
                          </Badge>
                        ) : (
                          <Badge>{t('Top tier unlocked')}</Badge>
                        )}
                      </div>

                      <div className='mt-4 space-y-2'>
                        <Progress value={progressValue} className='h-2.5' />
                        <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs'>
                          <span>{t('Current Tier')}</span>
                          <span>
                            {summary?.next_affiliate_tier
                              ? getAffiliateTierName(
                                  summary.next_affiliate_tier.level,
                                  t
                                )
                              : t('Top tier unlocked')}
                          </span>
                        </div>
                      </div>

                      <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                        <MiniInfo
                          label={t('Current Tier')}
                          value={getAffiliateTierName(currentTierLevel, t)}
                          hint={formatPercent(
                            summary?.affiliate_commission_percentage ?? 0
                          )}
                        />
                        <MiniInfo
                          label={t('Next Tier')}
                          value={
                            summary?.next_affiliate_tier
                              ? getAffiliateTierName(
                                  summary.next_affiliate_tier.level,
                                  t
                                )
                              : t('Top tier unlocked')
                          }
                          hint={nextTierRateText}
                        />
                        <MiniInfo
                          label={t('Invites')}
                          value={String(currentInviteCount)}
                          hint={
                            summary?.next_affiliate_tier
                              ? t('{{count}} invites', {
                                  count: summary.next_affiliate_tier.min_invites,
                                })
                              : t('Top tier unlocked')
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className='pb-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='secondary'>{t('Four Tiers')}</Badge>
                    <Badge variant='outline'>{t('Invite-Based')}</Badge>
                  </div>
                  <CardTitle>{t('Commission Tiers')}</CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
                    {tierList.map((tier) => (
                      <TierCard
                        key={tier.level}
                        tier={tier}
                        currentLevel={currentTierLevel}
                        nextLevel={nextTierLevel}
                        t={t}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className='grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'>
                <Card className='border-primary/15'>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Transfer to Balance')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-4'>
                    <div className='text-muted-foreground text-sm'>
                      {t('Move commission rewards into your wallet balance')}
                    </div>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <MiniInfo
                        label={t('Pending')}
                        value={availableAffiliateAmount}
                        hint={t('Available for transfer or withdrawal')}
                      />
                      <MiniInfo
                        label={t('Commission Rate')}
                        value={formatPercent(
                          summary?.affiliate_commission_percentage ?? 0
                        )}
                        hint={t('Active commission percentage')}
                      />
                    </div>
                    <div className='rounded-2xl border bg-background/70 p-4'>
                      <Label className='mb-2 block'>{t('Transfer Amount')}</Label>
                      <Input
                        type='number'
                        step='0.01'
                        min={0}
                        value={transferAmount}
                        onChange={(e) =>
                          setTransferAmount(Number.parseFloat(e.target.value) || 0)
                        }
                      />
                      <div className='text-muted-foreground mt-2 text-xs'>
                        {t('Pending')}: {availableAffiliateAmount}
                      </div>
                    </div>
                    <Button
                      type='button'
                      className='w-full'
                      disabled={!canTransfer}
                      onClick={handleTransfer}
                    >
                      {t('Transfer to Balance')}
                    </Button>
                  </CardContent>
                </Card>

                <Card className='border-amber-500/20'>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Apply for Withdrawal')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-4'>
                    <div className='text-muted-foreground text-sm'>
                      {t('Submit a manual payout request')}
                    </div>
                    <div className='grid gap-3 sm:grid-cols-3'>
                      <MiniInfo
                        label={t('Withdrawal Account Type')}
                        value={t('Alipay')}
                      />
                      <MiniInfo
                        label={t('Pending')}
                        value={availableAffiliateAmount}
                        hint={t('Available for transfer or withdrawal')}
                      />
                      <MiniInfo
                        label={t('Minimum withdrawal amount: {{amount}}', {
                          amount: minimumWithdrawText,
                        })}
                        value={minimumWithdrawText}
                      />
                    </div>
                    {withdrawNotice && (
                      <div className='rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-700 dark:text-amber-300'>
                        {withdrawNotice}
                      </div>
                    )}
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div className='space-y-2 md:col-span-2'>
                        <Label>{t('Withdrawal Amount')}</Label>
                        <Input
                          type='number'
                          step='0.01'
                          min={0}
                          value={withdrawAmount}
                          onChange={(e) =>
                            setWithdrawAmount(Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>{t('Withdrawal Account')}</Label>
                        <Input
                          value={accountNo}
                          onChange={(e) => setAccountNo(e.target.value)}
                          placeholder={t('Withdrawal Account')}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>{t('Withdrawal Account Name')}</Label>
                        <Input
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder={t('Withdrawal Account Name')}
                        />
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <Label>{t('Notes')}</Label>
                        <Textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder={t('Notes')}
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button
                      type='button'
                      className='w-full'
                      disabled={!canWithdraw}
                      onClick={handleWithdraw}
                    >
                      {t('Apply for Withdrawal')}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className='grid gap-4 xl:grid-cols-2'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Invited Users')}</CardTitle>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('User ID')}</TableHead>
                            <TableHead>{t('Username')}</TableHead>
                            <TableHead>{t('Email')}</TableHead>
                            <TableHead>{t('Created')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invitees.length === 0 ? (
                            <EmptyTableRow
                              colSpan={4}
                              label={t('No invited users yet')}
                            />
                          ) : (
                            invitees.map((item) => (
                              <TableRow key={item.invitee_id}>
                                <TableCell>{item.invitee_id}</TableCell>
                                <TableCell>
                                  {maskAffiliateUsername(
                                    item.invitee_display_name ||
                                      item.invitee_username ||
                                      ''
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.invitee_email
                                    ? maskAffiliateEmail(item.invitee_email)
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  {formatTimestampToDate(item.created_at)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <TablePagination
                      currentPage={inviteesPage}
                      total={inviteesTotal}
                      pageSize={PAGE_SIZE}
                      onPageChange={setInviteesPage}
                      t={t}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Affiliate Records')}</CardTitle>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('Trade No')}</TableHead>
                            <TableHead>{t('Commission Rate')}</TableHead>
                            <TableHead>{t('Commission Quota')}</TableHead>
                            <TableHead>{t('Created')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {records.length === 0 ? (
                            <EmptyTableRow
                              colSpan={4}
                              label={t('No affiliate records yet')}
                            />
                          ) : (
                            records.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className='max-w-[220px] truncate'>
                                  {item.trade_no}
                                </TableCell>
                                <TableCell>
                                  {formatPercent(item.commission_percentage_snapshot)}
                                </TableCell>
                                <TableCell>
                                  {formatBillingCurrencyFromQuota(item.commission_quota)}
                                </TableCell>
                                <TableCell>
                                  {formatTimestampToDate(item.created_at)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <TablePagination
                      currentPage={recordsPage}
                      total={recordsTotal}
                      pageSize={PAGE_SIZE}
                      onPageChange={setRecordsPage}
                      t={t}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle>{t('Withdrawal Records')}</CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('Amount')}</TableHead>
                          <TableHead>{t('Account')}</TableHead>
                          <TableHead>{t('Status')}</TableHead>
                          <TableHead>{t('Review Note')}</TableHead>
                          <TableHead>{t('Created')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.length === 0 ? (
                          <EmptyTableRow
                            colSpan={5}
                            label={t('No withdrawal records yet')}
                          />
                        ) : (
                          withdrawals.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {formatBillingCurrencyFromQuota(item.amount)}
                              </TableCell>
                              <TableCell>
                                {getAffiliateAccountTypeLabel(
                                  item.account_type,
                                  t
                                )}{' '}
                                / {item.account_no}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusVariant(item.status)}>
                                  {statusLabel(item.status, t)}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.review_note || '-'}</TableCell>
                              <TableCell>
                                {formatTimestampToDate(item.created_at)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <TablePagination
                    currentPage={withdrawalsPage}
                    total={withdrawalsTotal}
                    pageSize={PAGE_SIZE}
                    onPageChange={setWithdrawalsPage}
                    t={t}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value='admin' className='mt-4 space-y-4'>
                <Card>
                  <CardHeader className='pb-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='secondary'>
                        {t('Pending Reviews')}: {pendingReviewCount}
                      </Badge>
                      <Badge variant='outline'>
                        {t('Invite Relations')}: {adminInviteRelationsTotal}
                      </Badge>
                      <Badge variant='outline'>
                        {t('Affiliate Records')}: {adminRecordsTotal}
                      </Badge>
                    </div>
                    <CardTitle>{t('Affiliate Admin')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-4'>
                    <div className='text-muted-foreground text-sm'>
                      {t('Search and review affiliate data')}
                    </div>
                    <div className='flex flex-col gap-2 sm:flex-row'>
                      <Input
                        value={adminKeyword}
                        onChange={(e) => setAdminKeyword(e.target.value)}
                        placeholder={t('Search by inviter, user, email, trade no')}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleAdminSearch}
                        className='sm:w-auto'
                      >
                        {t('Search')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Invite Relations')}</CardTitle>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('Inviter')}</TableHead>
                            <TableHead>{t('Invitee')}</TableHead>
                            <TableHead>{t('Email')}</TableHead>
                            <TableHead>{t('Created')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminInviteRelations.length === 0 ? (
                            <EmptyTableRow
                              colSpan={4}
                              label={t('No invite relations yet')}
                            />
                          ) : (
                            adminInviteRelations.map((item) => (
                              <TableRow key={item.invitee_id}>
                                <TableCell>
                                  {maskAffiliateUsername(
                                    item.inviter_display_name ||
                                      item.inviter_username ||
                                      ''
                                  )}{' '}
                                  (
                                  {item.inviter_id})
                                </TableCell>
                                <TableCell>
                                  {maskAffiliateUsername(
                                    item.invitee_display_name ||
                                      item.invitee_username ||
                                      ''
                                  )}{' '}
                                  (
                                  {item.invitee_id})
                                </TableCell>
                                <TableCell>
                                  {item.invitee_email
                                    ? maskAffiliateEmail(item.invitee_email)
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  {formatTimestampToDate(item.created_at)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <TablePagination
                      currentPage={adminInviteRelationsPage}
                      total={adminInviteRelationsTotal}
                      pageSize={PAGE_SIZE}
                      onPageChange={setAdminInviteRelationsPage}
                      t={t}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Affiliate Records')}</CardTitle>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('Inviter')}</TableHead>
                            <TableHead>{t('Invitee')}</TableHead>
                            <TableHead>{t('Trade No')}</TableHead>
                            <TableHead>{t('Commission Rate')}</TableHead>
                            <TableHead>{t('Commission Quota')}</TableHead>
                            <TableHead>{t('Created')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminRecords.length === 0 ? (
                            <EmptyTableRow
                              colSpan={6}
                              label={t('No admin affiliate records yet')}
                            />
                          ) : (
                            adminRecords.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  {maskAffiliateUsername(
                                    item.inviter_display_name ||
                                      item.inviter_username ||
                                      ''
                                  )}{' '}
                                  (
                                  {item.inviter_id})
                                </TableCell>
                                <TableCell>
                                  {maskAffiliateUsername(
                                    item.user_display_name ||
                                      item.user_username ||
                                      ''
                                  )}{' '}
                                  (
                                  {item.user_id})
                                </TableCell>
                                <TableCell className='max-w-[220px] truncate'>
                                  {item.trade_no}
                                </TableCell>
                                <TableCell>
                                  {formatPercent(item.commission_percentage_snapshot)}
                                </TableCell>
                                <TableCell>
                                  {formatBillingCurrencyFromQuota(item.commission_quota)}
                                </TableCell>
                                <TableCell>
                                  {formatTimestampToDate(item.created_at)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <TablePagination
                      currentPage={adminRecordsPage}
                      total={adminRecordsTotal}
                      pageSize={PAGE_SIZE}
                      onPageChange={setAdminRecordsPage}
                      t={t}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle>{t('Withdrawal Review')}</CardTitle>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('User ID')}</TableHead>
                            <TableHead>{t('Amount')}</TableHead>
                            <TableHead>{t('Account')}</TableHead>
                            <TableHead>{t('Status')}</TableHead>
                            <TableHead>{t('Review Note')}</TableHead>
                            <TableHead>{t('Actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminWithdrawals.length === 0 ? (
                            <EmptyTableRow
                              colSpan={6}
                              label={t('No pending withdrawal requests')}
                            />
                          ) : (
                            adminWithdrawals.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.user_id}</TableCell>
                                <TableCell>
                                  {formatBillingCurrencyFromQuota(item.amount)}
                                </TableCell>
                                <TableCell>
                                  {getAffiliateAccountTypeLabel(
                                    item.account_type,
                                    t
                                  )}{' '}
                                  / {item.account_no}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusVariant(item.status)}>
                                    {statusLabel(item.status, t)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.review_note || '-'}</TableCell>
                                <TableCell>
                                  <div className='flex flex-wrap gap-2'>
                                    <Button
                                      type='button'
                                      size='sm'
                                      variant='outline'
                                      disabled={
                                        reviewLoadingId === item.id ||
                                        item.status !== 'pending'
                                      }
                                      onClick={() => handleReview(item.id, 'approved')}
                                    >
                                      {t('Approve')}
                                    </Button>
                                    <Button
                                      type='button'
                                      size='sm'
                                      variant='outline'
                                      disabled={
                                        reviewLoadingId === item.id ||
                                        item.status !== 'pending'
                                      }
                                      onClick={() => handleReview(item.id, 'rejected')}
                                    >
                                      {t('Reject')}
                                    </Button>
                                    <Button
                                      type='button'
                                      size='sm'
                                      disabled={
                                        reviewLoadingId === item.id ||
                                        item.status !== 'approved'
                                      }
                                      onClick={() => handleReview(item.id, 'paid')}
                                    >
                                      {t('Mark as Paid')}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <TablePagination
                      currentPage={adminWithdrawalsPage}
                      total={adminWithdrawalsTotal}
                      pageSize={PAGE_SIZE}
                      onPageChange={setAdminWithdrawalsPage}
                      t={t}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
