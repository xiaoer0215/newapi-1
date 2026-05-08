import { useEffect } from 'react'
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { saveAffiliateCode } from '@/features/auth'
import { SignUp } from '@/features/auth/sign-up'

const searchSchema = z.object({
  aff: z.string().optional(),
})

function SignUpRoute() {
  const { aff } = Route.useSearch()

  useEffect(() => {
    const affCode = aff?.trim()
    if (affCode) {
      saveAffiliateCode(affCode)
    }
  }, [aff])

  return <SignUp />
}

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUpRoute,
  validateSearch: searchSchema,
})
