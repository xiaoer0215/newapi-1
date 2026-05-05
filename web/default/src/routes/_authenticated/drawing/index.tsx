import { createFileRoute } from '@tanstack/react-router'
import { AppHeader, Main } from '@/components/layout'
import { Drawing } from '@/features/drawing/index'

export const Route = createFileRoute('/_authenticated/drawing/')({
  component: DrawingPage,
})

function DrawingPage() {
  return (
    <>
      <AppHeader />
      <Main className='p-0'>
        <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
          <Drawing />
        </div>
      </Main>
    </>
  )
}


