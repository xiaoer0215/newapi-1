import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'

const searchSchema = z.object({
  aff: z.string().optional(),
})

export const Route = createFileRoute('/register')({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/sign-up',
      search: search.aff ? { aff: search.aff } : {},
      replace: true,
    })
  },
})
