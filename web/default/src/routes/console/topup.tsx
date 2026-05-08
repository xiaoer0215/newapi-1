import { createFileRoute, redirect } from '@tanstack/react-router'
import { buildLegacyWalletHref } from '@/lib/legacy-console'

export const Route = createFileRoute('/console/topup')({
  beforeLoad: ({ location }) => {
    throw redirect({
      href: buildLegacyWalletHref(location.searchStr),
      replace: true,
    })
  },
})
