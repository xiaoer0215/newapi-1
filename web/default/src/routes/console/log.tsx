import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  buildLegacyWalletHref,
  hasLegacyPaymentParams,
} from '@/lib/legacy-console'

export const Route = createFileRoute('/console/log')({
  beforeLoad: ({ location }) => {
    if (hasLegacyPaymentParams(location.searchStr)) {
      throw redirect({
        href: buildLegacyWalletHref(location.searchStr, {
          forceShowHistory: true,
        }),
        replace: true,
      })
    }

    throw redirect({
      to: '/usage-logs/$section',
      params: { section: 'common' },
      replace: true,
    })
  },
})
