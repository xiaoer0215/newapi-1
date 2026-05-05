const en = {
  'Data Board': 'Data Board',
  'Group Monitor': 'Group Monitor',
  Tip: 'Tip',
  Attention: 'Attention',
  'Rotation Seconds': 'Rotation Seconds',
  'Display Pages': 'Display Pages',
  'Select pages': 'Select pages',
  'Select type': 'Select type',
  'No top notices yet': 'No top notices yet',
  'Top notice content': 'Top notice content',
  'Enter top notice content': 'Enter top notice content',
  'Top notice added. Save settings to apply.':
    'Top notice added. Save settings to apply.',
  'Top notice updated. Save settings to apply.':
    'Top notice updated. Save settings to apply.',
  'Top notice deleted. Save settings to apply.':
    'Top notice deleted. Save settings to apply.',
  'Rotation seconds must be between 2 and 30':
    'Rotation seconds must be between 2 and 30',
  'Failed to save top notices': 'Failed to save top notices',
  'Top notices saved successfully': 'Top notices saved successfully',
  'This top notice will be removed.': 'This top notice will be removed.',
  'Top notice content is required': 'Top notice content is required',
  'Top notice content must be less than 240 characters':
    'Top notice content must be less than 240 characters',
  'Please choose at least one page': 'Please choose at least one page',
  'Start time is required': 'Start time is required',
  'End time must be after start time': 'End time must be after start time',
  'No icon configured yet': 'No icon configured yet',
  'Custom input': 'Custom input',
  'Configure the ratio for this group.': 'Configure the ratio for this group.',
  'Add selectable group': 'Add selectable group',
  'Edit selectable group': 'Edit selectable group',
  'Configure a group that users can select when creating API keys.':
    'Configure a group that users can select when creating API keys.',
  'Add auto group': 'Add auto group',
  'Add a group identifier to the auto assignment list.':
    'Add a group identifier to the auto assignment list.',
  'Create a new user group to configure ratio overrides for.':
    'Create a new user group to configure ratio overrides for.',
  'Edit ratio override': 'Edit ratio override',
  'Add ratio override': 'Add ratio override',
  'Configure a custom ratio for "{{userGroup}}" users when using a specific token group.':
    'Configure a custom ratio for "{{userGroup}}" users when using a specific token group.',
  'Configure a custom ratio for when users use a specific token group.':
    'Configure a custom ratio for when users use a specific token group.',
  'The token group that will have a custom ratio':
    'The token group that will have a custom ratio',
  'Multiplier applied when {{userGroup}} uses {{targetGroup}}':
    'Multiplier applied when {{userGroup}} uses {{targetGroup}}',
  'this user group': 'this user group',
  'this token group': 'this token group',
} as const

const zh = {
  'Data Board': '数据看板',
  'Group Monitor': '分组监控',
  Tip: '提示',
  Attention: '注意',
  'Rotation Seconds': '轮播秒数',
  'Display Pages': '显示页面',
  'Select pages': '选择页面',
  'Select type': '选择类型',
  'No top notices yet': '暂无顶部公告',
  'Top notice content': '顶部公告内容',
  'Enter top notice content': '请输入顶部公告内容',
  'Top notice added. Save settings to apply.': '顶部公告已新增，保存设置后生效。',
  'Top notice updated. Save settings to apply.': '顶部公告已更新，保存设置后生效。',
  'Top notice deleted. Save settings to apply.': '顶部公告已删除，保存设置后生效。',
  'Rotation seconds must be between 2 and 30': '轮播秒数需在 2 到 30 之间',
  'Failed to save top notices': '保存顶部公告失败',
  'Top notices saved successfully': '顶部公告保存成功',
  'This top notice will be removed.': '这条顶部公告将被删除。',
  'Top notice content is required': '顶部公告内容不能为空',
  'Top notice content must be less than 240 characters':
    '顶部公告内容不能超过 240 个字符',
  'Please choose at least one page': '请至少选择一个页面',
  'Start time is required': '开始时间不能为空',
  'End time must be after start time': '结束时间必须晚于开始时间',
  'No icon configured yet': '暂未配置分组图标',
  'Custom input': '自定义输入',
  'Configure the ratio for this group.': '为这个分组配置倍率。',
  'Add selectable group': '新增可选分组',
  'Edit selectable group': '编辑可选分组',
  'Configure a group that users can select when creating API keys.':
    '配置用户创建 API 密钥时可选择的分组。',
  'Add auto group': '新增自动分组',
  'Add a group identifier to the auto assignment list.':
    '向自动分组队列中新增一个分组标识。',
  'Create a new user group to configure ratio overrides for.':
    '新增一个用于配置覆盖倍率的用户分组。',
  'Edit ratio override': '编辑覆盖倍率',
  'Add ratio override': '新增覆盖倍率',
  'Configure a custom ratio for "{{userGroup}}" users when using a specific token group.':
    '为 {{userGroup}} 用户使用指定令牌分组时配置自定义倍率。',
  'Configure a custom ratio for when users use a specific token group.':
    '为用户使用指定令牌分组时配置自定义倍率。',
  'The token group that will have a custom ratio': '将应用自定义倍率的令牌分组',
  'Multiplier applied when {{userGroup}} uses {{targetGroup}}':
    '{{userGroup}} 使用 {{targetGroup}} 时应用的倍率',
  'this user group': '该用户分组',
  'this token group': '该令牌分组',
} as const

const ja = {} as const
const fr = {} as const
const ru = {} as const
const vi = {} as const

export const TOP_NOTICE_RATIO_I18N_OVERRIDES = {
  en,
  zh,
  ja,
  fr,
  ru,
  vi,
} as const
