import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Wallet } from '@/features/wallet'

const booleanSearchValue = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      return value === 'true' || value === '1'
    }
    return undefined
  })

const walletSearchSchema = z.object({
  show_history: booleanSearchValue,
  pay: z.enum(['success', 'fail', 'pending', 'cancelled']).optional(),
  trade_no: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/wallet/')({
  component: RouteComponent,
  validateSearch: walletSearchSchema,
})

function RouteComponent() {
  const { show_history, pay, trade_no } = Route.useSearch()

  return (
    <Wallet
      initialShowHistory={show_history}
      paymentReturnInfo={
        pay
          ? {
              status: pay,
              tradeNo: trade_no,
            }
          : undefined
      }
    />
  )
}
