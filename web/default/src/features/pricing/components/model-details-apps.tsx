import { ArrowDownRight, ArrowUpRight, ExternalLink, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  buildAppRankings,
  formatTokenVolume,
  type AppRanking,
} from '../lib/mock-stats'
import type { PricingModel } from '../types'

function GrowthValue(props: { value: number; className?: string }) {
  const value = props.value
  const isPositive = value > 0
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight

  if (!Number.isFinite(value) || value === 0) {
    return (
      <span
        className={cn(
          'text-muted-foreground font-mono text-xs tabular-nums',
          props.className
        )}
      >
        0%
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-end gap-0.5 font-mono text-xs tabular-nums',
        isPositive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400',
        props.className
      )}
    >
      <Icon className='size-3' />
      {Math.abs(value).toFixed(Math.abs(value) >= 100 ? 0 : 1)}%
    </span>
  )
}

function AppAvatar(props: { app: AppRanking }) {
  return (
    <span className='bg-muted text-muted-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold'>
      {props.app.initial}
    </span>
  )
}

function SummaryCard(props: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div className='bg-card/60 rounded-lg border p-3'>
      <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
        {props.label}
      </div>
      <div className='text-foreground mt-1 font-mono text-lg font-semibold tabular-nums'>
        {props.value}
      </div>
      {props.hint && (
        <p className='text-muted-foreground/70 mt-0.5 text-[11px]'>
          {props.hint}
        </p>
      )}
    </div>
  )
}

export function ModelDetailsApps(props: { model: PricingModel }) {
  const { t } = useTranslation()
  const apps = useMemo(() => buildAppRankings(props.model, 12), [props.model])

  if (apps.length === 0) {
    return (
      <div className='text-muted-foreground rounded-lg border p-6 text-center text-sm'>
        {t('No app usage data available for this model.')}
      </div>
    )
  }

  const totalTokens = apps.reduce((sum, app) => sum + app.monthly_tokens, 0)
  const topApp = apps[0]
  const avgGrowth =
    apps.reduce((sum, app) => sum + app.growth_pct, 0) / apps.length

  return (
    <div className='space-y-5'>
      <div className='grid gap-2 sm:grid-cols-3'>
        <SummaryCard
          label={t('Tracked apps')}
          value={apps.length}
          hint={t('Aggregated across the apps below')}
        />
        <SummaryCard
          label={t('Monthly tokens')}
          value={formatTokenVolume(totalTokens)}
          hint={t('tokens / mo')}
        />
        <SummaryCard
          label={t('30d change')}
          value={<GrowthValue value={avgGrowth} className='text-lg' />}
          hint={t('Based on app usage trend')}
        />
      </div>

      <section>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <Trophy className='text-muted-foreground/70 size-3.5 shrink-0' />
            <div className='min-w-0'>
              <h2 className='text-sm font-semibold'>
                {t('Top integrations using this model')}
              </h2>
              <p className='text-muted-foreground/80 text-xs'>
                {t('Ranked by estimated monthly token volume.')}
              </p>
            </div>
          </div>
          <Badge variant='outline' className='text-[10px]'>
            {t('#1 by usage')}: {topApp.name}
          </Badge>
        </div>

        <div className='overflow-x-auto rounded-lg border'>
          <Table className='text-sm'>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='text-muted-foreground w-[52px] py-2 text-[10px] font-medium tracking-wider uppercase'>
                  #
                </TableHead>
                <TableHead className='text-muted-foreground min-w-[220px] py-2 text-[10px] font-medium tracking-wider uppercase'>
                  {t('App')}
                </TableHead>
                <TableHead className='text-muted-foreground py-2 text-[10px] font-medium tracking-wider uppercase'>
                  {t('Category')}
                </TableHead>
                <TableHead className='text-muted-foreground py-2 text-right text-[10px] font-medium tracking-wider uppercase'>
                  {t('Monthly tokens')}
                </TableHead>
                <TableHead className='text-muted-foreground py-2 text-right text-[10px] font-medium tracking-wider uppercase'>
                  {t('30d change')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.name}>
                  <TableCell className='text-muted-foreground py-2.5 text-right font-mono text-xs tabular-nums'>
                    {app.rank}
                  </TableCell>
                  <TableCell className='py-2.5'>
                    <div className='flex min-w-0 items-center gap-2.5'>
                      <AppAvatar app={app} />
                      <div className='min-w-0'>
                        <div className='flex min-w-0 items-center gap-1.5'>
                          {app.url ? (
                            <a
                              href={app.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='hover:text-foreground truncate font-medium underline decoration-current/30 underline-offset-4 hover:decoration-current'
                            >
                              {app.name}
                            </a>
                          ) : (
                            <span className='truncate font-medium'>
                              {app.name}
                            </span>
                          )}
                          {app.url && (
                            <ExternalLink className='text-muted-foreground size-3 shrink-0' />
                          )}
                        </div>
                        <p className='text-muted-foreground/80 line-clamp-1 text-xs'>
                          {app.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-2.5'>
                    <Badge variant='secondary' className='text-[10px]'>
                      {app.category}
                    </Badge>
                  </TableCell>
                  <TableCell className='py-2.5 text-right font-mono font-semibold tabular-nums'>
                    {formatTokenVolume(app.monthly_tokens)}
                  </TableCell>
                  <TableCell className='py-2.5 text-right'>
                    <GrowthValue value={app.growth_pct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
