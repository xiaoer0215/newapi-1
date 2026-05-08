import * as React from 'react'
import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'
import { PageFooterPortal } from '@/components/layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MobileCardList } from './mobile-card-list'
import { DataTablePagination } from './pagination'
import { TableEmpty } from './table-empty'
import { TableSkeleton } from './table-skeleton'
import { DataTableToolbar } from './toolbar'

export type DataTablePageToolbarProps<TData> = Omit<
  React.ComponentProps<typeof DataTableToolbar<TData>>,
  'table'
>

export type DataTablePageProps<TData> = {
  table: TanstackTable<TData>
  columns: ColumnDef<TData, unknown>[]
  isLoading?: boolean
  isFetching?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
  toolbar?: React.ReactNode
  toolbarProps?: DataTablePageToolbarProps<TData> | null
  bulkActions?: React.ReactNode
  mobile?: React.ReactNode
  mobileProps?: {
    getRowKey?: (row: Row<TData>) => string | number
    getRowClassName?: (row: Row<TData>) => string | undefined
  }
  hideMobile?: boolean
  getRowClassName?: (
    row: Row<TData>,
    ctx: { isMobile: boolean }
  ) => string | undefined
  renderRow?: (row: Row<TData>) => React.ReactNode
  applyHeaderSize?: boolean
  skeletonKeyPrefix?: string
  showPagination?: boolean
  paginationInFooter?: boolean
  afterTable?: React.ReactNode
  className?: string
  tableClassName?: string
  tableHeaderClassName?: string
}

export function DataTablePage<TData>(props: DataTablePageProps<TData>) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const showMobile = isMobile && !props.hideMobile

  const toolbarNode =
    props.toolbar !== undefined ? (
      props.toolbar
    ) : props.toolbarProps === null ? null : props.toolbarProps ? (
      <DataTableToolbar table={props.table} {...props.toolbarProps} />
    ) : null

  const mobileNode =
    !showMobile ? null : props.mobile !== undefined ? (
      props.mobile
    ) : (
      <MobileCardList
        table={props.table}
        isLoading={props.isLoading}
        emptyTitle={props.emptyTitle}
        emptyDescription={props.emptyDescription}
        getRowKey={props.mobileProps?.getRowKey}
        getRowClassName={
          props.mobileProps?.getRowClassName ??
          (props.getRowClassName
            ? (row) => props.getRowClassName?.(row, { isMobile: true })
            : undefined)
        }
      />
    )

  const rows = props.table.getRowModel().rows
  const desktopNode = showMobile ? null : (
    <div
      className={cn(
        'overflow-hidden rounded-lg border transition-opacity duration-150',
        props.isFetching && !props.isLoading && 'pointer-events-none opacity-60',
        props.tableClassName
      )}
    >
      <Table>
        <TableHeader className={props.tableHeaderClassName}>
          {props.table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={
                    props.applyHeaderSize
                      ? { width: header.getSize() }
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {props.isLoading ? (
            <TableSkeleton
              table={props.table}
              keyPrefix={props.skeletonKeyPrefix}
            />
          ) : rows.length === 0 ? (
            <TableEmpty
              colSpan={props.columns.length}
              title={props.emptyTitle}
              description={props.emptyDescription}
              icon={props.emptyIcon}
            >
              {props.emptyAction}
            </TableEmpty>
          ) : (
            rows.map((row) =>
              props.renderRow ? (
                props.renderRow(row)
              ) : (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={props.getRowClassName?.(row, { isMobile: false })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>
    </div>
  )

  const paginationNode =
    props.showPagination === false ? null : props.paginationInFooter === false ? (
      <div className='pt-2'>
        <DataTablePagination table={props.table} />
      </div>
    ) : (
      <PageFooterPortal>
        <DataTablePagination table={props.table} />
      </PageFooterPortal>
    )

  return (
    <>
      <div className={cn('space-y-2.5 sm:space-y-3', props.className)}>
        {toolbarNode}
        {mobileNode}
        {desktopNode}
        {props.afterTable}
      </div>
      {!showMobile && props.bulkActions}
      {paginationNode}
    </>
  )
}
