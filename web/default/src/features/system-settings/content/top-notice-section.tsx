import { useEffect, useMemo, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Save, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import dayjs from '@/lib/dayjs'
import {
  DEFAULT_TOP_NOTICE_ROUTES,
  normalizeTopNoticeItems,
  TOP_NOTICE_ROUTE_OPTIONS,
  TOP_NOTICE_TYPES,
  type TopNoticeItem,
  type TopNoticeType,
} from '@/lib/top-notice'
import { MultiSelect, type Option } from '@/components/multi-select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/datetime-picker'
import { SettingsSection } from '../components/settings-section'
import { updateSystemOption } from '../api'
import { useUpdateOption } from '../hooks/use-update-option'

type ManagedTopNoticeItem = Omit<TopNoticeItem, 'id'> & {
  id: number
  type: TopNoticeType
  routes: string[]
}

type TopNoticeSectionProps = {
  enabled: boolean
  data: string
  rotationSeconds: number
}

type TopNoticeFormValues = {
  content: string
  type: TopNoticeType
  routes: string[]
  startAt: string
  endAt?: string
}

function createTopNoticeSchema(t: (key: string) => string) {
  return z
    .object({
      content: z
        .string()
        .min(1, t('Top notice content is required'))
        .max(240, t('Top notice content must be less than 240 characters')),
      type: z.enum(['info', 'notice', 'warning']),
      routes: z.array(z.string()).min(1, t('Please choose at least one page')),
      startAt: z.string().min(1, t('Start time is required')),
      endAt: z.string().optional(),
    })
    .refine(
      (value) => {
        if (!value.endAt) return true
        return (
          new Date(value.endAt).getTime() >=
          new Date(value.startAt).getTime()
        )
      },
      {
        message: t('End time must be after start time'),
        path: ['endAt'],
      }
    )
}

function parseItems(raw: string): ManagedTopNoticeItem[] {
  try {
    const parsed = JSON.parse(raw || '[]')
    return normalizeTopNoticeItems(parsed).map((item, index) => ({
      id: typeof item.id === 'number' && !Number.isNaN(item.id) ? item.id : index + 1,
      content: item.content,
      startAt: item.startAt,
      endAt: item.endAt || '',
      type: item.type || 'info',
      routes:
        Array.isArray(item.routes) && item.routes.length > 0
          ? item.routes
          : [...DEFAULT_TOP_NOTICE_ROUTES],
    }))
  } catch {
    return []
  }
}

function getTypeLabel(type: TopNoticeType, t: (key: string) => string) {
  if (type === 'warning') return t('Warning')
  if (type === 'notice') return t('Attention')
  return t('Tip')
}

function getTypeBadgeClass(type: TopNoticeType) {
  if (type === 'warning') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200'
  }
  if (type === 'notice') {
    return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/30 dark:text-orange-200'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200'
}

export function TopNoticeSection({
  enabled,
  data,
  rotationSeconds,
}: TopNoticeSectionProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateOption = useUpdateOption()
  const [items, setItems] = useState<ManagedTopNoticeItem[]>([])
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [currentRotationSeconds, setCurrentRotationSeconds] = useState(
    rotationSeconds || 4
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ManagedTopNoticeItem | null>(null)

  const routeOptions = useMemo<Option[]>(
    () =>
      TOP_NOTICE_ROUTE_OPTIONS.map((item) => ({
        value: item.value,
        label: t(item.labelKey),
      })),
    [t]
  )

  const routeLabelMap = useMemo(
    () =>
      Object.fromEntries(routeOptions.map((item) => [item.value, item.label])) as Record<
        string,
        string
      >,
    [routeOptions]
  )

  const topNoticeSchema = useMemo(() => createTopNoticeSchema(t), [t])

  const form = useForm<TopNoticeFormValues>({
    resolver: zodResolver(topNoticeSchema),
    defaultValues: {
      content: '',
      type: 'info',
      routes: [],
      startAt: new Date().toISOString(),
      endAt: '',
    },
  })

  useEffect(() => {
    setItems(parseItems(data))
  }, [data])

  useEffect(() => {
    setIsEnabled(enabled)
  }, [enabled])

  useEffect(() => {
    setCurrentRotationSeconds(rotationSeconds || 4)
  }, [rotationSeconds])

  const handleToggleEnabled = async (checked: boolean) => {
    try {
      await updateOption.mutateAsync({
        key: 'console_setting.top_notice_enabled',
        value: checked,
      })
      setIsEnabled(checked)
      toast.success(t('Setting saved'))
    } catch {
      toast.error(t('Failed to update setting'))
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.reset({
      content: '',
      type: 'info',
      routes: [],
      startAt: new Date().toISOString(),
      endAt: '',
    })
    setShowDialog(true)
  }

  const handleEdit = (item: ManagedTopNoticeItem) => {
    setEditingItem(item)
    form.reset({
      content: item.content,
      type: item.type,
      routes: item.routes,
      startAt: item.startAt,
      endAt: item.endAt || '',
    })
    setShowDialog(true)
  }

  const handleDelete = (item: ManagedTopNoticeItem) => {
    setEditingItem(item)
    setShowDeleteDialog(true)
  }

  const handleSubmitForm = (values: TopNoticeFormValues) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...values,
                endAt: values.endAt || '',
              }
            : item
        )
      )
      toast.success(t('Top notice updated. Save settings to apply.'))
    } else {
      const newId = Math.max(...items.map((item) => item.id), 0) + 1
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          content: values.content,
          type: values.type,
          routes: values.routes,
          startAt: values.startAt,
          endAt: values.endAt || '',
        },
      ])
      toast.success(t('Top notice added. Save settings to apply.'))
    }

    setHasChanges(true)
    setShowDialog(false)
  }

  const confirmDelete = () => {
    if (!editingItem) return

    setItems((prev) => prev.filter((item) => item.id !== editingItem.id))
    setEditingItem(null)
    setShowDeleteDialog(false)
    setHasChanges(true)
    toast.success(t('Top notice deleted. Save settings to apply.'))
  }

  const handleSaveAll = async () => {
    if (currentRotationSeconds < 2 || currentRotationSeconds > 30) {
      toast.error(t('Rotation seconds must be between 2 and 30'))
      return
    }

    try {
      const itemsResult = await updateSystemOption({
        key: 'console_setting.top_notice_items',
        value: JSON.stringify(items),
      })
      if (!itemsResult.success) {
        toast.error(itemsResult.message || t('Failed to save top notices'))
        return
      }

      const rotationResult = await updateSystemOption({
        key: 'console_setting.top_notice_rotation_seconds',
        value: currentRotationSeconds,
      })
      if (!rotationResult.success) {
        toast.error(rotationResult.message || t('Failed to save top notices'))
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['system-options'] }),
        queryClient.invalidateQueries({ queryKey: ['status'] }),
      ])

      setHasChanges(false)
      toast.success(t('Top notices saved successfully'))
    } catch {
      toast.error(t('Failed to save top notices'))
    }
  }

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
      ),
    [items]
  )

  return (
    <SettingsSection title={t('Top Notice')}>
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button onClick={handleAdd} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              {t('Add Top Notice')}
            </Button>
            <Button
              onClick={handleSaveAll}
              size='sm'
              variant='secondary'
              disabled={!hasChanges}
            >
              <Save className='mr-2 h-4 w-4' />
              {t('Save Settings')}
            </Button>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                {t('Enabled')}
              </span>
              <Switch checked={isEnabled} onCheckedChange={handleToggleEnabled} />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                {t('Rotation Seconds')}
              </span>
              <Input
                type='number'
                min={2}
                max={30}
                value={currentRotationSeconds}
                onChange={(event) => {
                  setCurrentRotationSeconds(Number(event.target.value) || 0)
                  setHasChanges(true)
                }}
                className='h-9 w-24'
              />
            </div>
          </div>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Content')}</TableHead>
                <TableHead>{t('Type')}</TableHead>
                <TableHead>{t('Display Pages')}</TableHead>
                <TableHead>{t('Time')}</TableHead>
                <TableHead className='w-32'>{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-20 text-center'>
                    {t('No top notices yet')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='max-w-xl'>
                      <div className='line-clamp-2'>{item.content}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={getTypeBadgeClass(item.type)}
                      >
                        {getTypeLabel(item.type, t)}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-sm'>
                      <div className='flex flex-wrap gap-1'>
                        {item.routes.slice(0, 2).map((route) => (
                          <Badge key={route} variant='secondary'>
                            {routeLabelMap[route] || route}
                          </Badge>
                        ))}
                        {item.routes.length > 2 && (
                          <Badge variant='secondary'>+{item.routes.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>
                      <div>{dayjs(item.startAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                      <div className='text-muted-foreground mt-1'>
                        {item.endAt
                          ? dayjs(item.endAt).format('YYYY-MM-DD HH:mm:ss')
                          : t('Optional')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button
                          onClick={() => handleEdit(item)}
                          size='sm'
                          variant='ghost'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item)}
                          size='sm'
                          variant='ghost'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t('Edit Top Notice') : t('Add Top Notice')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmitForm)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Top notice content')}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={t('Enter top notice content')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Type')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOP_NOTICE_TYPES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {t(item.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='routes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Display Pages')}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={routeOptions}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder={t('Select pages')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='startAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Start Time')}</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          placeholder={t('Select publish date')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='endAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('End Time')}</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          placeholder={t('Optional')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowDialog(false)}
                >
                  {t('Cancel')}
                </Button>
                <Button type='submit'>
                  {editingItem ? t('Update') : t('Add')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This top notice will be removed.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  )
}
