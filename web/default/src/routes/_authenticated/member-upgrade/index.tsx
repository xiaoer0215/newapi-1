import { createFileRoute } from '@tanstack/react-router'
import { MemberUpgrade } from '@/features/member-upgrade'

export const Route = createFileRoute('/_authenticated/member-upgrade/')({
  component: MemberUpgrade,
})
