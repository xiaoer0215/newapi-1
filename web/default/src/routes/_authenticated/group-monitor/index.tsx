import { createFileRoute } from '@tanstack/react-router'
import { AppHeader, Main } from '@/components/layout'
import { GroupMonitor } from '@/features/group-monitor'

export const Route = createFileRoute('/_authenticated/group-monitor/')({
  component: GroupMonitorPage,
})

function GroupMonitorPage() {
  return (
    <>
      <AppHeader />
      <Main className='p-0'>
        <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
          <GroupMonitor />
        </div>
      </Main>
    </>
  )
}
