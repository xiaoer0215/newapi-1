import { memo, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { safeJsonParse } from '../utils/json-parser'

type GroupRatioVisualEditorProps = {
  groupRatio: string
  topupGroupRatio: string
  userUsableGroups: string
  userGroupIcons: string
  groupGroupRatio: string
  autoGroups: string
  onChange: (field: string, value: string) => void
}

type SimpleGroup = {
  name: string
  value: string
}

type UsableGroup = {
  name: string
  description: string
}

type GroupOverride = {
  targetGroup: string
  ratio: number
}

type GroupIconItem = {
  name: string
  displayName: string
  value: string
}

type GroupOption = {
  value: string
  label: string
}

function removeSvgRootSizingStyle(styleValue: string): string {
  const blockedProps = new Set([
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
  ])

  return String(styleValue || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const propName = item.split(':')[0]?.trim().toLowerCase()
      return !!propName && !blockedProps.has(propName)
    })
    .join('; ')
}

function isInlineSvgMarkup(value: string): boolean {
  const trimmed = value.trim()
  return (
    trimmed.startsWith('<svg') ||
    (trimmed.startsWith('<?xml') && trimmed.includes('<svg'))
  )
}

function normalizeInlineSvgMarkup(value: string): string {
  const trimmed = value.trim()
  if (!isInlineSvgMarkup(trimmed)) {
    return trimmed
  }

  return trimmed.replace(/<svg\b([^>]*)>/i, (_match, attrs = '') => {
    let rootStyle = ''
    const nextAttrs = String(attrs)
      .replace(/\swidth\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\sheight\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\spreserveAspectRatio\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\sstyle\s*=\s*(['"])(.*?)\1/i, (_whole, _quote, styleValue) => {
        rootStyle = removeSvgRootSizingStyle(styleValue)
        return ''
      })

    const normalizedStyle = [
      'display:block',
      rootStyle,
      'max-width:100%',
      'max-height:100%',
    ]
      .filter(Boolean)
      .join('; ')

    return `<svg${nextAttrs} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="${normalizedStyle}">`
  })
}

function sanitizeInlineSvgMarkup(value: string): string {
  return normalizeInlineSvgMarkup(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z-]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(
      /\s(?:href|xlink:href)\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi,
      ''
    )
}

function resolveUserGroupIconSrc(value: unknown): string {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return ''
  }

  if (isInlineSvgMarkup(trimmed)) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      sanitizeInlineSvgMarkup(trimmed)
    )}`
  }

  return trimmed
}

function GroupIconPreview({
  value,
  fallback,
}: {
  value?: string
  fallback: string
}) {
  const src = resolveUserGroupIconSrc(value)

  return (
    <div className='flex h-12 w-12 items-center justify-center rounded-md border bg-muted/20 p-2'>
      {src ? (
        <img
          src={src}
          alt={fallback}
          className='block h-full w-full object-contain'
          referrerPolicy='no-referrer'
        />
      ) : (
        <span className='text-muted-foreground text-xs font-semibold'>
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  )
}

export const GroupRatioVisualEditor = memo(function GroupRatioVisualEditor({
  groupRatio,
  topupGroupRatio,
  userUsableGroups,
  userGroupIcons,
  groupGroupRatio,
  autoGroups,
  onChange,
}: GroupRatioVisualEditorProps) {
  const { t } = useTranslation()
  const [simpleDialogOpen, setSimpleDialogOpen] = useState(false)
  const [simpleDialogType, setSimpleDialogType] = useState<
    'groupRatio' | 'topupGroupRatio' | null
  >(null)
  const [simpleEditData, setSimpleEditData] = useState<SimpleGroup | null>(null)

  const [usableDialogOpen, setUsableDialogOpen] = useState(false)
  const [usableEditData, setUsableEditData] = useState<UsableGroup | null>(null)

  const [iconDialogOpen, setIconDialogOpen] = useState(false)
  const [iconEditData, setIconEditData] = useState<GroupIconItem | null>(null)
  const [iconInitialGroupName, setIconInitialGroupName] = useState('')

  const [autoGroupDialogOpen, setAutoGroupDialogOpen] = useState(false)
  const [autoGroupInput, setAutoGroupInput] = useState('')

  const [groupOverrideDialogOpen, setGroupOverrideDialogOpen] = useState(false)
  const [groupOverrideUserGroup, setGroupOverrideUserGroup] = useState<
    string | null
  >(null)
  const [groupOverrideEditData, setGroupOverrideEditData] =
    useState<GroupOverride | null>(null)

  const [userGroupDialogOpen, setUserGroupDialogOpen] = useState(false)
  const [userGroupInput, setUserGroupInput] = useState('')

  const groupRatioMap = useMemo(
    () =>
      safeJsonParse<Record<string, number>>(groupRatio, {
        fallback: {},
        context: 'group ratios',
      }),
    [groupRatio]
  )

  const topupRatioMap = useMemo(
    () =>
      safeJsonParse<Record<string, number>>(topupGroupRatio, {
        fallback: {},
        context: 'topup group ratios',
      }),
    [topupGroupRatio]
  )

  const usableGroupsMap = useMemo(
    () =>
      safeJsonParse<Record<string, string>>(userUsableGroups, {
        fallback: {},
        context: 'user usable groups',
      }),
    [userUsableGroups]
  )

  const userGroupIconsMap = useMemo(
    () =>
      safeJsonParse<Record<string, string>>(userGroupIcons, {
        fallback: {},
        context: 'user group icons',
      }),
    [userGroupIcons]
  )

  const autoGroupsList = useMemo(
    () =>
      safeJsonParse<string[]>(autoGroups, {
        fallback: [],
        context: 'auto groups',
      }),
    [autoGroups]
  )

  const groupGroupRatioMap = useMemo(
    () =>
      safeJsonParse<Record<string, Record<string, number>>>(groupGroupRatio, {
        fallback: {},
        context: 'group-group ratios',
      }),
    [groupGroupRatio]
  )

  const groupRatioList = useMemo(
    () =>
      Object.entries(groupRatioMap).map(([name, value]) => ({
        name,
        value: String(value),
      })),
    [groupRatioMap]
  )

  const topupRatioList = useMemo(
    () =>
      Object.entries(topupRatioMap).map(([name, value]) => ({
        name,
        value: String(value),
      })),
    [topupRatioMap]
  )

  const usableGroupsList = useMemo(
    () =>
      Object.entries(usableGroupsMap).map(([name, description]) => ({
        name,
        description: String(description),
      })),
    [usableGroupsMap]
  )

  const groupGroupRatioList = useMemo(
    () =>
      Object.entries(groupGroupRatioMap).map(([userGroup, overrides]) => ({
        userGroup,
        overrides: Object.entries(overrides).map(([targetGroup, ratio]) => ({
          targetGroup,
          ratio,
        })),
      })),
    [groupGroupRatioMap]
  )

  const allGroupNames = useMemo(() => {
    const names = new Set<string>()

    Object.keys(groupRatioMap).forEach((name) => names.add(name))
    Object.keys(topupRatioMap).forEach((name) => names.add(name))
    Object.keys(usableGroupsMap).forEach((name) => names.add(name))
    Object.keys(userGroupIconsMap).forEach((name) => names.add(name))
    autoGroupsList.forEach((name) => names.add(name))
    Object.entries(groupGroupRatioMap).forEach(([userGroup, overrides]) => {
      names.add(userGroup)
      Object.keys(overrides || {}).forEach((targetGroup) => names.add(targetGroup))
    })

    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [
    autoGroupsList,
    groupGroupRatioMap,
    groupRatioMap,
    topupRatioMap,
    usableGroupsMap,
    userGroupIconsMap,
  ])

  const allGroupOptions = useMemo<GroupOption[]>(
    () =>
      allGroupNames.map((name) => ({
        value: name,
        label: usableGroupsMap[name]
          ? `${name} · ${String(usableGroupsMap[name])}`
          : name,
      })),
    [allGroupNames, usableGroupsMap]
  )

  const groupIconItems = useMemo<GroupIconItem[]>(
    () =>
      Object.entries(userGroupIconsMap)
        .map(([name, value]) => ({
          name,
          displayName: String(usableGroupsMap[name] || ''),
          value: String(value || ''),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [usableGroupsMap, userGroupIconsMap]
  )

  const availableGroupRatioOptions = useMemo(
    () =>
      allGroupOptions.filter((option) => !Object.prototype.hasOwnProperty.call(groupRatioMap, option.value)),
    [allGroupOptions, groupRatioMap]
  )

  const availableTopupRatioOptions = useMemo(
    () =>
      allGroupOptions.filter((option) => !Object.prototype.hasOwnProperty.call(topupRatioMap, option.value)),
    [allGroupOptions, topupRatioMap]
  )

  const availableUsableGroupOptions = useMemo(
    () =>
      allGroupOptions.filter(
        (option) => !Object.prototype.hasOwnProperty.call(usableGroupsMap, option.value)
      ),
    [allGroupOptions, usableGroupsMap]
  )

  const availableIconGroupOptions = useMemo(
    () =>
      allGroupOptions.filter(
        (option) => !Object.prototype.hasOwnProperty.call(userGroupIconsMap, option.value)
      ),
    [allGroupOptions, userGroupIconsMap]
  )

  const availableAutoGroupOptions = useMemo(
    () =>
      allGroupOptions.filter((option) => !autoGroupsList.includes(option.value)),
    [allGroupOptions, autoGroupsList]
  )

  const availableUserGroupOptions = useMemo(
    () =>
      allGroupOptions.filter(
        (option) => !Object.prototype.hasOwnProperty.call(groupGroupRatioMap, option.value)
      ),
    [allGroupOptions, groupGroupRatioMap]
  )

  const handleSimpleAdd = (type: 'groupRatio' | 'topupGroupRatio') => {
    setSimpleDialogType(type)
    setSimpleEditData(null)
    setSimpleDialogOpen(true)
  }

  const handleSimpleEdit = (
    type: 'groupRatio' | 'topupGroupRatio',
    group: SimpleGroup
  ) => {
    setSimpleDialogType(type)
    setSimpleEditData(group)
    setSimpleDialogOpen(true)
  }

  const handleSimpleSave = (name: string, value: string) => {
    if (!simpleDialogType) return

    const map =
      simpleDialogType === 'groupRatio'
        ? { ...groupRatioMap }
        : { ...topupRatioMap }

    if (simpleEditData && simpleEditData.name !== name) {
      delete map[simpleEditData.name]
    }

    map[name] = parseFloat(value)

    onChange(
      simpleDialogType === 'groupRatio' ? 'GroupRatio' : 'TopupGroupRatio',
      JSON.stringify(map, null, 2)
    )
    setSimpleDialogOpen(false)
  }

  const handleSimpleDelete = (
    type: 'groupRatio' | 'topupGroupRatio',
    name: string
  ) => {
    const map = type === 'groupRatio' ? { ...groupRatioMap } : { ...topupRatioMap }
    delete map[name]

    onChange(
      type === 'groupRatio' ? 'GroupRatio' : 'TopupGroupRatio',
      JSON.stringify(map, null, 2)
    )
  }

  const handleUsableAdd = () => {
    setUsableEditData(null)
    setUsableDialogOpen(true)
  }

  const handleUsableEdit = (group: UsableGroup) => {
    setUsableEditData(group)
    setUsableDialogOpen(true)
  }

  const handleUsableSave = (name: string, description: string) => {
    const map = { ...usableGroupsMap }

    if (usableEditData && usableEditData.name !== name) {
      delete map[usableEditData.name]
    }

    map[name] = description

    onChange('UserUsableGroups', JSON.stringify(map, null, 2))
    setUsableDialogOpen(false)
  }

  const handleUsableDelete = (name: string) => {
    const map = { ...usableGroupsMap }
    delete map[name]
    onChange('UserUsableGroups', JSON.stringify(map, null, 2))
  }

  const handleOpenAddIcon = (groupName = '') => {
    setIconEditData(null)
    setIconInitialGroupName(groupName)
    setIconDialogOpen(true)
  }

  const handleEditIcon = (item: GroupIconItem) => {
    setIconEditData(item)
    setIconInitialGroupName(item.name)
    setIconDialogOpen(true)
  }

  const handleSaveIcon = (name: string, value: string) => {
    const trimmedName = name.trim()
    const trimmedValue = value.trim()
    if (!trimmedName || !trimmedValue) return

    const map = { ...userGroupIconsMap }
    if (iconEditData && iconEditData.name !== trimmedName) {
      delete map[iconEditData.name]
    }
    map[trimmedName] = trimmedValue
    onChange('UserGroupIcons', JSON.stringify(map, null, 2))
    setIconDialogOpen(false)
  }

  const handleDeleteIcon = (name: string) => {
    const map = { ...userGroupIconsMap }
    delete map[name]
    onChange('UserGroupIcons', JSON.stringify(map, null, 2))
  }

  const handleAutoGroupAdd = () => {
    setAutoGroupInput(availableAutoGroupOptions[0]?.value || '')
    setAutoGroupDialogOpen(true)
  }

  const handleAutoGroupSave = () => {
    if (!autoGroupInput.trim()) return

    const list = [...autoGroupsList, autoGroupInput.trim()]
    onChange('AutoGroups', JSON.stringify(list, null, 2))
    setAutoGroupDialogOpen(false)
  }

  const handleAutoGroupDelete = (index: number) => {
    const list = autoGroupsList.filter((_, i) => i !== index)
    onChange('AutoGroups', JSON.stringify(list, null, 2))
  }

  const handleAutoGroupMove = (index: number, direction: 'up' | 'down') => {
    const list = [...autoGroupsList]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= list.length) return
    ;[list[index], list[newIndex]] = [list[newIndex], list[index]]
    onChange('AutoGroups', JSON.stringify(list, null, 2))
  }

  const handleUserGroupAdd = () => {
    setUserGroupInput(availableUserGroupOptions[0]?.value || '')
    setUserGroupDialogOpen(true)
  }

  const handleUserGroupSave = () => {
    if (!userGroupInput.trim()) return

    const nextGroup = userGroupInput.trim()
    const map = { ...groupGroupRatioMap }
    if (!map[nextGroup]) {
      map[nextGroup] = {}
    }

    onChange('GroupGroupRatio', JSON.stringify(map, null, 2))
    setUserGroupDialogOpen(false)
  }

  const handleUserGroupDelete = (userGroup: string) => {
    const map = { ...groupGroupRatioMap }
    delete map[userGroup]
    onChange('GroupGroupRatio', JSON.stringify(map, null, 2))
  }

  const handleOverrideAdd = (userGroup: string) => {
    setGroupOverrideUserGroup(userGroup)
    setGroupOverrideEditData(null)
    setGroupOverrideDialogOpen(true)
  }

  const handleOverrideEdit = (userGroup: string, override: GroupOverride) => {
    setGroupOverrideUserGroup(userGroup)
    setGroupOverrideEditData(override)
    setGroupOverrideDialogOpen(true)
  }

  const handleOverrideSave = (
    targetGroup: string,
    ratio: number,
    oldTargetGroup?: string
  ) => {
    if (!groupOverrideUserGroup) return

    const map = {
      ...groupGroupRatioMap,
      [groupOverrideUserGroup]: {
        ...(groupGroupRatioMap[groupOverrideUserGroup] || {}),
      },
    }

    if (oldTargetGroup && oldTargetGroup !== targetGroup) {
      delete map[groupOverrideUserGroup][oldTargetGroup]
    }

    map[groupOverrideUserGroup][targetGroup] = ratio

    onChange('GroupGroupRatio', JSON.stringify(map, null, 2))
    setGroupOverrideDialogOpen(false)
  }

  const handleOverrideDelete = (userGroup: string, targetGroup: string) => {
    const map = {
      ...groupGroupRatioMap,
      [userGroup]: {
        ...(groupGroupRatioMap[userGroup] || {}),
      },
    }

    if (map[userGroup]) {
      delete map[userGroup][targetGroup]
      if (Object.keys(map[userGroup]).length === 0) {
        delete map[userGroup]
      }
    }

    onChange('GroupGroupRatio', JSON.stringify(map, null, 2))
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{t('Group ratios')}</CardTitle>
          <CardDescription>
            {t('Base multipliers applied when users select specific groups.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button
              type='button'
              onClick={() => handleSimpleAdd('groupRatio')}
              size='sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('Add group')}
            </Button>
            {groupRatioList.length > 0 && (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Group name')}</TableHead>
                      <TableHead>{t('Ratio')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupRatioList.map((group) => (
                      <TableRow key={group.name}>
                        <TableCell className='font-medium'>
                          {group.name}
                        </TableCell>
                        <TableCell>{group.value}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSimpleEdit('groupRatio', group)
                              }
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSimpleDelete('groupRatio', group.name)
                              }
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Top-up group ratios')}</CardTitle>
          <CardDescription>
            {t('Multipliers for recharge pricing based on user groups.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button
              type='button'
              onClick={() => handleSimpleAdd('topupGroupRatio')}
              size='sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('Add group')}
            </Button>
            {topupRatioList.length > 0 && (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Group name')}</TableHead>
                      <TableHead>{t('Multiplier')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topupRatioList.map((group) => (
                      <TableRow key={group.name}>
                        <TableCell className='font-medium'>
                          {group.name}
                        </TableCell>
                        <TableCell>{group.value}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSimpleEdit('topupGroupRatio', group)
                              }
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSimpleDelete(
                                  'topupGroupRatio',
                                  group.name
                                )
                              }
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Inter-group ratio overrides')}</CardTitle>
          <CardDescription>
            {t(
              'Custom multipliers when specific user groups use specific token groups. Example: VIP users get 0.9x rate when using "edit_this" group tokens.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button type='button' onClick={handleUserGroupAdd} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              {t('Add user group')}
            </Button>
            {groupGroupRatioList.length > 0 && (
              <div className='space-y-3'>
                {groupGroupRatioList.map((userGroupData) => (
                  <Collapsible key={userGroupData.userGroup}>
                    <div className='rounded-lg border'>
                      <div className='flex items-center justify-between p-4'>
                        <div className='flex items-center gap-2'>
                          <CollapsibleTrigger asChild>
                            <Button type='button' variant='ghost' size='sm'>
                              <ChevronDown className='h-4 w-4' />
                            </Button>
                          </CollapsibleTrigger>
                          <span className='font-semibold'>
                            {userGroupData.userGroup}
                          </span>
                          <span className='text-muted-foreground text-sm'>
                            {t('{{count}} override', {
                              count: userGroupData.overrides.length,
                            })}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleOverrideAdd(userGroupData.userGroup)
                            }
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleUserGroupDelete(userGroupData.userGroup)
                            }
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent>
                        {userGroupData.overrides.length > 0 && (
                          <div className='border-t'>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('Target group')}</TableHead>
                                  <TableHead>{t('Ratio')}</TableHead>
                                  <TableHead className='text-right'>
                                    {t('Actions')}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {userGroupData.overrides.map((override) => (
                                  <TableRow key={override.targetGroup}>
                                    <TableCell className='font-medium'>
                                      {override.targetGroup}
                                    </TableCell>
                                    <TableCell>{override.ratio}</TableCell>
                                    <TableCell className='text-right'>
                                      <div className='flex justify-end gap-2'>
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            handleOverrideEdit(
                                              userGroupData.userGroup,
                                              override
                                            )
                                          }
                                        >
                                          <Pencil className='h-4 w-4' />
                                        </Button>
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            handleOverrideDelete(
                                              userGroupData.userGroup,
                                              override.targetGroup
                                            )
                                          }
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Selectable groups')}</CardTitle>
          <CardDescription>
            {t('Groups that users can select when creating API keys.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button type='button' onClick={handleUsableAdd} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              {t('Add group')}
            </Button>
            {usableGroupsList.length > 0 && (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Group name')}</TableHead>
                      <TableHead>{t('Description')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usableGroupsList.map((group) => (
                      <TableRow key={group.name}>
                        <TableCell className='font-medium'>
                          {group.name}
                        </TableCell>
                        <TableCell>{group.description}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => handleUsableEdit(group)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => handleUsableDelete(group.name)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Group icons')}</CardTitle>
          <CardDescription>
            {t(
              'Configure group icons shown on the member upgrade page and related views.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button
              type='button'
              onClick={() => handleOpenAddIcon()}
              size='sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('Add {{title}}', { title: t('Icon') })}
            </Button>
            {groupIconItems.length > 0 ? (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Group name')}</TableHead>
                      <TableHead>{t('Display name')}</TableHead>
                      <TableHead>{t('Preview')}</TableHead>
                      <TableHead>{t('Icon')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupIconItems.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className='font-medium'>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          {item.displayName || (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <GroupIconPreview
                            value={item.value}
                            fallback={item.displayName || item.name}
                          />
                        </TableCell>
                        <TableCell className='max-w-[280px]'>
                          {item.value ? (
                            <code className='block truncate text-xs'>
                              {item.value}
                            </code>
                          ) : (
                            <span className='text-muted-foreground text-sm'>
                              {t('No icon configured')}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEditIcon(item)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteIcon(item.name)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
                {t('No icon configured yet')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Auto assignment order')}</CardTitle>
          <CardDescription>
            {t(
              'Priority order for automatic group assignment. New tokens rotate through this list.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button type='button' onClick={handleAutoGroupAdd} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              {t('Add group')}
            </Button>
            {autoGroupsList.length > 0 && (
              <div className='space-y-2'>
                {autoGroupsList.map((group, index) => (
                  <div
                    key={`${group}-${index}`}
                    className='flex items-center gap-2 rounded-md border p-3'
                  >
                    <GripVertical className='text-muted-foreground h-4 w-4' />
                    <span className='flex-1 font-medium'>{group}</span>
                    <div className='flex gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={index === 0}
                        onClick={() => handleAutoGroupMove(index, 'up')}
                      >
                        <ChevronUp className='h-4 w-4' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={index === autoGroupsList.length - 1}
                        onClick={() => handleAutoGroupMove(index, 'down')}
                      >
                        <ChevronDown className='h-4 w-4' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleAutoGroupDelete(index)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SimpleGroupDialog
        open={simpleDialogOpen}
        onOpenChange={setSimpleDialogOpen}
        onSave={handleSimpleSave}
        editData={simpleEditData}
        type={simpleDialogType}
        groupOptions={
          simpleDialogType === 'groupRatio'
            ? availableGroupRatioOptions
            : availableTopupRatioOptions
        }
      />

      <UsableGroupDialog
        open={usableDialogOpen}
        onOpenChange={setUsableDialogOpen}
        onSave={handleUsableSave}
        editData={usableEditData}
        groupOptions={availableUsableGroupOptions}
      />

      <GroupIconDialog
        open={iconDialogOpen}
        onOpenChange={setIconDialogOpen}
        onSave={handleSaveIcon}
        editData={iconEditData}
        initialGroupName={iconInitialGroupName}
        groupOptions={availableIconGroupOptions}
      />

      <Dialog open={autoGroupDialogOpen} onOpenChange={setAutoGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Add auto group')}</DialogTitle>
            <DialogDescription>
              {t('Add a group identifier to the auto assignment list.')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>{t('Group identifier')}</Label>
              <GroupSelectorField
                value={autoGroupInput}
                onChange={setAutoGroupInput}
                options={availableAutoGroupOptions}
                placeholder={t('default')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setAutoGroupDialogOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type='button' onClick={handleAutoGroupSave}>
              {t('Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={userGroupDialogOpen} onOpenChange={setUserGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Add user group')}</DialogTitle>
            <DialogDescription>
              {t('Create a new user group to configure ratio overrides for.')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>{t('User group name')}</Label>
              <GroupSelectorField
                value={userGroupInput}
                onChange={setUserGroupInput}
                options={availableUserGroupOptions}
                placeholder={t('vip')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setUserGroupDialogOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type='button' onClick={handleUserGroupSave}>
              {t('Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GroupOverrideDialog
        open={groupOverrideDialogOpen}
        onOpenChange={setGroupOverrideDialogOpen}
        onSave={handleOverrideSave}
        editData={groupOverrideEditData}
        userGroup={groupOverrideUserGroup}
        groupOptions={allGroupOptions}
      />
    </div>
  )
})

const CUSTOM_GROUP_VALUE = '__custom__'

type GroupSelectorFieldProps = {
  value: string
  onChange: (value: string) => void
  options: GroupOption[]
  placeholder: string
  disabled?: boolean
}

function GroupSelectorField({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: GroupSelectorFieldProps) {
  const { t } = useTranslation()
  const hasMatchingOption = options.some((option) => option.value === value)
  const showInput = disabled || options.length === 0 || !hasMatchingOption

  return (
    <div className='space-y-2'>
      {!disabled && options.length > 0 && (
        <Select
          value={hasMatchingOption ? value : CUSTOM_GROUP_VALUE}
          onValueChange={(nextValue) => {
            if (nextValue === CUSTOM_GROUP_VALUE) {
              onChange('')
              return
            }
            onChange(nextValue)
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_GROUP_VALUE}>
              {t('Custom input')}
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {showInput && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  )
}

type SimpleGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, value: string) => void
  editData: SimpleGroup | null
  type: 'groupRatio' | 'topupGroupRatio' | null
  groupOptions: GroupOption[]
}

function SimpleGroupDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  type,
  groupOptions,
}: SimpleGroupDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [value, setValue] = useState('')

  const title = type === 'groupRatio' ? t('group ratio') : t('top-up ratio')

  useEffect(() => {
    if (!open) return

    if (editData) {
      setName(editData.name)
      setValue(editData.value)
      return
    }

    setName(groupOptions[0]?.value || '')
    setValue('')
  }, [editData, groupOptions, open])

  const handleSave = () => {
    if (!name.trim() || !value.trim()) return
    onSave(name.trim(), value.trim())
    setName('')
    setValue('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData
              ? t('Edit {{title}}', { title })
              : t('Add {{title}}', { title })}
          </DialogTitle>
          <DialogDescription>
            {t('Configure the ratio for this group.')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>{t('Group name')}</Label>
            <GroupSelectorField
              value={name}
              onChange={setName}
              options={groupOptions}
              placeholder={t('default')}
              disabled={!!editData}
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('Ratio')}</Label>
            <Input
              value={value}
              onChange={(e) => {
                const nextValue = e.target.value
                if (nextValue === '' || !isNaN(parseFloat(nextValue))) {
                  setValue(nextValue)
                }
              }}
              placeholder='1.0'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button type='button' onClick={handleSave}>
            {editData ? t('Update') : t('Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type UsableGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, description: string) => void
  editData: UsableGroup | null
  groupOptions: GroupOption[]
}

function UsableGroupDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  groupOptions,
}: UsableGroupDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return

    if (editData) {
      setName(editData.name)
      setDescription(editData.description)
      return
    }

    setName(groupOptions[0]?.value || '')
    setDescription('')
  }, [editData, groupOptions, open])

  const handleSave = () => {
    if (!name.trim() || !description.trim()) return
    onSave(name.trim(), description.trim())
    setName('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData ? t('Edit selectable group') : t('Add selectable group')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Configure a group that users can select when creating API keys.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>{t('Group name')}</Label>
            <GroupSelectorField
              value={name}
              onChange={setName}
              options={groupOptions}
              placeholder={t('vip')}
              disabled={!!editData}
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('Description')}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('VIP users with premium access')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button type='button' onClick={handleSave}>
            {editData ? t('Update') : t('Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type GroupIconDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, value: string) => void
  editData: GroupIconItem | null
  initialGroupName: string
  groupOptions: GroupOption[]
}

function GroupIconDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  initialGroupName,
  groupOptions,
}: GroupIconDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!open) return

    if (editData) {
      setName(editData.name)
      setValue(editData.value)
      return
    }

    setName(initialGroupName || groupOptions[0]?.value || '')
    setValue('')
  }, [editData, groupOptions, initialGroupName, open])

  const handleSave = () => {
    if (!name.trim() || !value.trim()) return
    onSave(name.trim(), value.trim())
    setName('')
    setValue('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[720px]'>
        <DialogHeader>
          <DialogTitle>
            {editData
              ? t('Edit {{title}}', { title: t('Icon') })
              : t('Add {{title}}', { title: t('Icon') })}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Supports inline SVG markup, image URLs, and data:image content. Saved icons are pushed to the frontend immediately.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label>{t('Group name')}</Label>
            <GroupSelectorField
              value={name}
              onChange={setName}
              options={groupOptions}
              placeholder={t('default')}
              disabled={!!editData}
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('Icon')}</Label>
            <Textarea
              rows={8}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('Preview')}</Label>
            <GroupIconPreview value={value} fallback={name || 'icon'} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button type='button' onClick={handleSave}>
            {editData ? t('Update') : t('Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type GroupOverrideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (targetGroup: string, ratio: number, oldTargetGroup?: string) => void
  editData: GroupOverride | null
  userGroup: string | null
  groupOptions: GroupOption[]
}

function GroupOverrideDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  userGroup,
  groupOptions,
}: GroupOverrideDialogProps) {
  const { t } = useTranslation()
  const [targetGroup, setTargetGroup] = useState('')
  const [ratio, setRatio] = useState('')
  const availableTargetGroupOptions = useMemo(
    () => groupOptions.filter((option) => option.value !== userGroup),
    [groupOptions, userGroup]
  )

  useEffect(() => {
    if (!open) return

    if (editData) {
      setTargetGroup(editData.targetGroup)
      setRatio(String(editData.ratio))
      return
    }

    setTargetGroup(availableTargetGroupOptions[0]?.value || '')
    setRatio('')
  }, [availableTargetGroupOptions, editData, open])

  const handleSave = () => {
    if (!targetGroup.trim() || !ratio.trim()) return
    const parsedRatio = parseFloat(ratio)
    if (isNaN(parsedRatio)) return

    onSave(targetGroup.trim(), parsedRatio, editData?.targetGroup)
    setTargetGroup('')
    setRatio('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData ? t('Edit ratio override') : t('Add ratio override')}
          </DialogTitle>
          <DialogDescription>
            {userGroup
              ? t(
                  'Configure a custom ratio for "{{userGroup}}" users when using a specific token group.',
                  { userGroup }
                )
              : t(
                  'Configure a custom ratio for when users use a specific token group.'
                )}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>{t('Target group')}</Label>
            <GroupSelectorField
              value={targetGroup}
              onChange={setTargetGroup}
              options={availableTargetGroupOptions}
              placeholder={t('edit_this')}
              disabled={!!editData}
            />
            <p className='text-muted-foreground text-xs'>
              {t('The token group that will have a custom ratio')}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>{t('Ratio')}</Label>
            <Input
              value={ratio}
              onChange={(e) => {
                const nextValue = e.target.value
                if (nextValue === '' || !isNaN(parseFloat(nextValue))) {
                  setRatio(nextValue)
                }
              }}
              placeholder='0.9'
            />
            <p className='text-muted-foreground text-xs'>
              {t('Multiplier applied when {{userGroup}} uses {{targetGroup}}', {
                userGroup: userGroup || t('this user group'),
                targetGroup: targetGroup || t('this token group'),
              })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button type='button' onClick={handleSave}>
            {editData ? t('Update') : t('Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
