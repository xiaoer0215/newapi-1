export const DRAWING_I18N_OVERRIDES = {
  en: {
    "AI Drawing": "AI Drawing",
    "Failed to load drawing configuration": "Failed to load drawing configuration",
    "You can upload up to 3 reference images":
      "You can upload up to 3 reference images",
    "Only image files are supported": "Only image files are supported",
    "exceeds the 5MB limit": "exceeds the 5MB limit",
    "Failed to read image": "Failed to read image",
    "Image URL is invalid": "Image URL is invalid",
    "Reference image data is invalid": "Reference image data is invalid",
    "Added to reference images": "Added to reference images",
    "Failed to read history image": "Failed to read history image",
    "Drawing is not enabled on this site yet":
      "Drawing is not enabled on this site yet",
    "Please enter a prompt": "Please enter a prompt",
    "No drawing model is currently available":
      "No drawing model is currently available",
    "Drawing token is not initialized yet. Please refresh the configuration.":
      "Drawing token is not initialized yet. Please refresh the configuration.",
    "The current model does not support reference images. Please switch to a compatible model.":
      "The current model does not support reference images. Please switch to a compatible model.",
    "The upstream returned success, but no displayable image result was found.":
      "The upstream returned success, but no displayable image result was found.",
    "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.":
      "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.",
    "Drawing completed": "Drawing completed",
    "Drawing request failed": "Drawing request failed",
    "Model Count": "Model Count",
    "Your ideas start turning into finished images the moment inspiration appears.":
      "Your ideas start turning into finished images the moment inspiration appears.",
    "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.":
      "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.",
    "Refresh Configuration": "Refresh Configuration",
    "Drawing is not configured yet": "Drawing is not configured yet",
    "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.":
      "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.",
    "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.":
      "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.",
    "Reference Images (Optional, 1-3)": "Reference Images (Optional, 1-3)",
    "The current model will generate together with the reference images.":
      "The current model will generate together with the reference images.",
    "The current model does not use reference images.":
      "The current model does not use reference images.",
    "Click or drag images here": "Click or drag images here",
    "Supports JPEG, PNG, and WebP. Maximum 5MB per image.":
      "Supports JPEG, PNG, and WebP. Maximum 5MB per image.",
    "Add More": "Add More",
    "Dedicated Token": "Dedicated Token",
    "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.":
      "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.",
    "Different models automatically switch to their matching request endpoints.":
      "Different models automatically switch to their matching request endpoints.",
    "Please select a model": "Please select a model",
    "Aspect Ratio": "Aspect Ratio",
    "Controls the orientation and composition space of the image.":
      "Controls the orientation and composition space of the image.",
    "Image Size": "Image Size",
    "Higher sizes usually produce better quality but may take longer.":
      "Higher sizes usually produce better quality but may take longer.",
    "Generate Image": "Generate Image",
    "Latest Result": "Latest Result",
    "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.":
      "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.",
    "Records": "Records",
    "History": "History",
    "Generating image, please wait": "Generating image, please wait",
    "Elapsed": "Elapsed",
    "The generated result will appear here automatically.":
      "The generated result will appear here automatically.",
    "Original": "Original",
    "Your generated images will appear here":
      "Your generated images will appear here",
    "Specification": "Specification",
    "Prompt Used": "Prompt Used",
    "Model Notes": "Model Notes",
    "Click an image to switch the preview. Use the pencil button to add it as a reference image.":
      "Click an image to switch the preview. Use the pencil button to add it as a reference image.",
    "No history images yet": "No history images yet",
    "Generated images with uploaded CDN URLs will be stored here.":
      "Generated images with uploaded CDN URLs will be stored here.",
    "Reference": "Reference",
    "The drawing service is currently busy. Please try again later.":
      "The drawing service is currently busy. Please try again later.",
    "The drawing service is out of disk space. Please contact the administrator.":
      "The drawing service is out of disk space. Please contact the administrator.",
    "The drawing service is temporarily unavailable. Please try again later.":
      "The drawing service is temporarily unavailable. Please try again later.",
    "Failed to load drawing groups": "Failed to load drawing groups",
    "Failed to load drawing models": "Failed to load drawing models",
    "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.":
      "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.",
    "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.":
      "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.",
    "Keep this enabled if you need to proxy drawing requests for different upstream accounts.":
      "Keep this enabled if you need to proxy drawing requests for different upstream accounts.",
    "Automatically replaces upstream callback URLs with the current server address.":
      "Automatically replaces upstream callback URLs with the current server address.",
    "Clear --fast / --relax / --turbo flags in prompts":
      "Clear --fast / --relax / --turbo flags in prompts",
    "Removes Midjourney mode flags from user prompts before forwarding them upstream.":
      "Removes Midjourney mode flags from user prompts before forwarding them upstream.",
    "Require success before follow-up actions":
      "Require success before follow-up actions",
    "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.":
      "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.",
    "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.":
      "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.",
    "Dedicated drawing token settings": "Dedicated drawing token settings",
    "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.":
      "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.",
    "Drawing group": "Drawing group",
    "Please select drawing group": "Please select drawing group",
    "The system will load all available drawing-capable models from the selected group.":
      "The system will load all available drawing-capable models from the selected group.",
    "Default drawing model": "Default drawing model",
    "Leave empty to use the first available model":
      "Leave empty to use the first available model",
    "If left empty, the system automatically uses the first available model in the allowed list.":
      "If left empty, the system automatically uses the first available model in the allowed list.",
    "Allowed drawing models": "Allowed drawing models",
    "Supports multi-select. Leave empty to allow all available models in this group.":
      "Supports multi-select. Leave empty to allow all available models in this group.",
    "Please select drawing group first":
      "Please select drawing group first",
    "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.":
      "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.",
    "Drawing CDN settings": "Drawing CDN settings",
    "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.":
      "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.",
    "Upload strategy": "Upload strategy",
    "Fastest available": "Fastest available",
    "Please select upload strategy": "Please select upload strategy",
    "Choose fastest to race multiple providers, or lock to one fixed provider.":
      "Choose fastest to race multiple providers, or lock to one fixed provider.",
    "Enabled CDN providers": "Enabled CDN providers",
    "Please select CDN providers": "Please select CDN providers",
    "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.":
      "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.",
    "1:1 · Square": "1:1 · Square",
    "16:9 · Wide": "16:9 · Wide",
    "9:16 · Poster": "9:16 · Poster",
    "4:3 · Standard": "4:3 · Standard",
    "3:4 · Portrait": "3:4 · Portrait",
    "SKY Image": "SKY Image",
    "Litterbox 72h": "Litterbox 72h",
    "SCDN CN": "SCDN CN",
    "SCDN EdgeOne": "SCDN EdgeOne",
    "SCDN Anycast": "SCDN Anycast",
    "Image Host XZ": "Image Host XZ",
    "360 Image Host": "360 Image Host",
  },
  zh: {
    "AI Drawing": "AI 绘图",
    "Failed to load drawing configuration": "加载绘图配置失败",
    "You can upload up to 3 reference images": "最多可上传 3 张参考图",
    "Only image files are supported": "仅支持图片文件",
    "exceeds the 5MB limit": "超过 5MB 限制",
    "Failed to read image": "读取图片失败",
    "Image URL is invalid": "图片地址无效",
    "Reference image data is invalid": "参考图数据无效",
    "Added to reference images": "已添加到参考图",
    "Failed to read history image": "读取历史图片失败",
    "Drawing is not enabled on this site yet": "当前站点尚未启用绘图功能",
    "Please enter a prompt": "请输入提示词",
    "No drawing model is currently available": "当前暂无可用绘图模型",
    "Drawing token is not initialized yet. Please refresh the configuration.":
      "绘图令牌尚未初始化，请刷新配置",
    "The current model does not support reference images. Please switch to a compatible model.":
      "当前模型不支持参考图，请切换到兼容模型",
    "The upstream returned success, but no displayable image result was found.":
      "上游已返回成功，但未找到可展示的图片结果",
    "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.":
      "图片已生成，但上传到免费 CDN 失败，将暂时使用上游地址",
    "Drawing completed": "绘图完成",
    "Drawing request failed": "绘图请求失败",
    "Model Count": "模型数量",
    "Your ideas start turning into finished images the moment inspiration appears.":
      "灵感一出现，你的想法就能开始变成成品图像",
    "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.":
      "可自由组合提示词、参考图、宽高比和图像尺寸。可用模型会从后端绘图配置自动同步，让每个想法更快变成可见结果。",
    "Refresh Configuration": "刷新配置",
    "Drawing is not configured yet": "绘图尚未配置",
    "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.":
      "绘图功能已关闭，或后端尚未配置绘图分组与模型",
    "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.":
      "例如：一只橙色猫咪戴着金属耳机，坐在夜晚霓虹雨街上，电影感，超精细。",
    "Reference Images (Optional, 1-3)": "参考图（可选，1-3 张）",
    "The current model will generate together with the reference images.":
      "当前模型会结合参考图一起生成",
    "The current model does not use reference images.": "当前模型不使用参考图",
    "Click or drag images here": "点击或拖拽图片到此处",
    "Supports JPEG, PNG, and WebP. Maximum 5MB per image.":
      "支持 JPEG、PNG 和 WebP，每张图片最大 5MB",
    "Add More": "继续添加",
    "Dedicated Token": "专用令牌",
    "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.":
      "系统会自动为当前用户绑定专用绘图令牌，无需手动创建或切换",
    "Different models automatically switch to their matching request endpoints.":
      "不同模型会自动切换到对应的请求端点",
    "Please select a model": "请选择模型",
    "Aspect Ratio": "宽高比",
    "Controls the orientation and composition space of the image.":
      "控制图片的方向与构图空间",
    "Image Size": "图像尺寸",
    "Higher sizes usually produce better quality but may take longer.":
      "更高尺寸通常画质更好，但耗时也更长",
    "Generate Image": "生成图片",
    "Latest Result": "最新结果",
    "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.":
      "最近生成的图片会保留其 CDN 地址，可通过右下角历史按钮查看",
    "Records": "记录",
    "Generating image, please wait": "正在生成图片，请稍候",
    "Elapsed": "已耗时",
    "The generated result will appear here automatically.":
      "生成结果会自动显示在这里",
    "Original": "原图",
    "Your generated images will appear here": "你生成的图片会显示在这里",
    "Specification": "规格",
    "Prompt Used": "使用的提示词",
    "Model Notes": "模型说明",
    "Click an image to switch the preview. Use the pencil button to add it as a reference image.":
      "点击图片可切换预览，点击铅笔按钮可将其加入参考图",
    "No history images yet": "暂无历史图片",
    "Generated images with uploaded CDN URLs will be stored here.":
      "已上传 CDN 地址的生成图片会保存在这里",
    "Reference": "参考",
    "The drawing service is currently busy. Please try again later.":
      "绘图服务当前繁忙，请稍后再试",
    "The drawing service is out of disk space. Please contact the administrator.":
      "绘图服务磁盘空间不足，请联系管理员",
    "The drawing service is temporarily unavailable. Please try again later.":
      "绘图服务暂时不可用，请稍后再试",
    "Failed to load drawing groups": "加载绘图分组失败",
    "Failed to load drawing models": "加载绘图模型失败",
    "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.":
      "启用后，系统会自动为用户创建专用绘图令牌，并绑定到配置的分组与模型",
    "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.":
      "启用后将接受 Midjourney 回调，这可能暴露服务器 IP 地址",
    "Keep this enabled if you need to proxy drawing requests for different upstream accounts.":
      "如果你需要为不同上游账号代理绘图请求，请保持开启",
    "Automatically replaces upstream callback URLs with the current server address.":
      "自动将上游回调地址替换为当前服务器地址",
    "Clear --fast / --relax / --turbo flags in prompts":
      "清除提示词中的 --fast / --relax / --turbo 标记",
    "Removes Midjourney mode flags from user prompts before forwarding them upstream.":
      "在转发到上游前，移除用户提示词中的 Midjourney 模式标记",
    "Require success before follow-up actions": "后续操作前必须先成功生成",
    "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.":
      "在这里迁移并管理 AI 绘图专用令牌、模型范围和免费 CDN 存储策略",
    "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.":
      "启用后，系统会在用户首次调用 /api/user/self/drawing/init 时自动创建一个专用绘图令牌。该令牌只限制分组和模型范围，额度计费仍按用户账号本身执行。",
    "Dedicated drawing token settings": "专用绘图令牌设置",
    "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.":
      "绘图分组决定可用通道，模型限制和默认模型将应用到专用令牌上",
    "Drawing group": "绘图分组",
    "Please select drawing group": "请选择绘图分组",
    "The system will load all available drawing-capable models from the selected group.":
      "系统会从所选分组加载全部可绘图模型",
    "Default drawing model": "默认绘图模型",
    "Leave empty to use the first available model": "留空则使用第一个可用模型",
    "If left empty, the system automatically uses the first available model in the allowed list.":
      "若留空，系统会自动使用允许列表中的第一个可用模型",
    "Allowed drawing models": "允许的绘图模型",
    "Supports multi-select. Leave empty to allow all available models in this group.":
      "支持多选。留空则允许此分组下全部可用模型",
    "Please select drawing group first": "请先选择绘图分组",
    "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.":
      "系统优先选择支持 /v1/images/generations 或等效绘图端点的模型。若缺少端点元数据，则会回退列出该分组下所有可用模型。",
    "Drawing CDN settings": "绘图 CDN 设置",
    "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.":
      "图片生成后，系统可上传到免费 CDN 提供商；在最快模式下会并发上传并使用最先成功的结果。",
    "Upload strategy": "上传策略",
    "Fastest available": "最快可用",
    "Please select upload strategy": "请选择上传策略",
    "Choose fastest to race multiple providers, or lock to one fixed provider.":
      "可选择“最快可用”并发竞速多个提供商，或固定指定单一提供商",
    "Enabled CDN providers": "启用的 CDN 提供商",
    "Please select CDN providers": "请选择 CDN 提供商",
    "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.":
      "保存后会写入 DrawingCDNMode 和 DrawingCDNProviders，之后生成图片将上传到这里配置的提供商。",
    "1:1 · Square": "1:1 · 正方形",
    "16:9 · Wide": "16:9 · 宽屏",
    "9:16 · Poster": "9:16 · 海报",
    "4:3 · Standard": "4:3 · 标准",
    "3:4 · Portrait": "3:4 · 竖构图",
    "SKY Image": "SKY 图床",
    "Litterbox 72h": "Litterbox 72小时",
    "SCDN CN": "SCDN 中国",
    "SCDN EdgeOne": "SCDN EdgeOne",
    "SCDN Anycast": "SCDN Anycast",
    "Image Host XZ": "图床小栈",
    "360 Image Host": "360 图床",
  },
  fr: {
    "AI Drawing": "Dessin IA",
    "Failed to load drawing configuration":
      "Échec du chargement de la configuration de dessin",
    "You can upload up to 3 reference images":
      "Vous pouvez téléverser jusqu'à 3 images de référence",
    "Only image files are supported":
      "Seuls les fichiers image sont pris en charge",
    "exceeds the 5MB limit": "dépasse la limite de 5 Mo",
    "Failed to read image": "Échec de lecture de l'image",
    "Image URL is invalid": "L'URL de l'image n'est pas valide",
    "Reference image data is invalid":
      "Les données de l'image de référence sont invalides",
    "Added to reference images": "Ajouté aux images de référence",
    "Failed to read history image":
      "Échec de lecture de l'image d'historique",
    "Drawing is not enabled on this site yet":
      "Le dessin n'est pas encore activé sur ce site",
    "Please enter a prompt": "Veuillez saisir un prompt",
    "No drawing model is currently available":
      "Aucun modèle de dessin n'est actuellement disponible",
    "Drawing token is not initialized yet. Please refresh the configuration.":
      "Le jeton de dessin n'est pas encore initialisé. Veuillez actualiser la configuration.",
    "The current model does not support reference images. Please switch to a compatible model.":
      "Le modèle actuel ne prend pas en charge les images de référence. Veuillez passer à un modèle compatible.",
    "The upstream returned success, but no displayable image result was found.":
      "Le service amont a répondu avec succès, mais aucune image affichable n'a été trouvée.",
    "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.":
      "Les images ont été générées, mais l'envoi vers le CDN gratuit a échoué. Les URL temporaires du service amont seront utilisées à la place.",
    "Drawing completed": "Dessin terminé",
    "Drawing request failed": "La requête de dessin a échoué",
    "Model Count": "Nombre de modèles",
    "Your ideas start turning into finished images the moment inspiration appears.":
      "Vos idées commencent à se transformer en images finales dès que l'inspiration arrive.",
    "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.":
      "Combinez librement prompts, images de référence, ratios et tailles d'image. Les modèles disponibles sont synchronisés automatiquement depuis la configuration backend afin de concrétiser chaque idée plus rapidement.",
    "Refresh Configuration": "Actualiser la configuration",
    "Drawing is not configured yet":
      "Le dessin n'est pas encore configuré",
    "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.":
      "Le dessin est désactivé, ou le groupe et les modèles de dessin ne sont pas encore configurés dans le backend.",
    "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.":
      "Par exemple : un chat orange portant un casque métallique assis dans une rue pluvieuse néon la nuit, cinématographique, ultra détaillé.",
    "Reference Images (Optional, 1-3)":
      "Images de référence (facultatif, 1 à 3)",
    "The current model will generate together with the reference images.":
      "Le modèle actuel générera l'image avec les images de référence.",
    "The current model does not use reference images.":
      "Le modèle actuel n'utilise pas d'images de référence.",
    "Click or drag images here": "Cliquez ou glissez des images ici",
    "Supports JPEG, PNG, and WebP. Maximum 5MB per image.":
      "JPEG, PNG et WebP pris en charge. 5 Mo max par image.",
    "Add More": "Ajouter",
    "Dedicated Token": "Jeton dédié",
    "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.":
      "Le système associe automatiquement un jeton de dessin dédié à l'utilisateur actuel. Vous n'avez pas besoin de le créer ou de le changer manuellement.",
    "Different models automatically switch to their matching request endpoints.":
      "Les différents modèles basculent automatiquement vers le point d'accès correspondant.",
    "Please select a model": "Veuillez sélectionner un modèle",
    "Aspect Ratio": "Format d'image",
    "Controls the orientation and composition space of the image.":
      "Contrôle l'orientation et l'espace de composition de l'image.",
    "Image Size": "Taille de l'image",
    "Higher sizes usually produce better quality but may take longer.":
      "Des tailles plus élevées donnent généralement une meilleure qualité mais peuvent prendre plus de temps.",
    "Generate Image": "Générer l'image",
    "Latest Result": "Dernier résultat",
    "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.":
      "Les images générées récemment conservent leurs URL CDN. Utilisez le bouton d'historique en bas à droite pour les parcourir.",
    "Records": "Enregistrements",
    "History": "Historique",
    "Generating image, please wait":
      "Génération de l'image, veuillez patienter",
    "Elapsed": "Temps écoulé",
    "The generated result will appear here automatically.":
      "Le résultat généré apparaîtra ici automatiquement.",
    "Original": "Original",
    "Your generated images will appear here":
      "Vos images générées apparaîtront ici",
    "Specification": "Spécification",
    "Prompt Used": "Prompt utilisé",
    "Model Notes": "Notes du modèle",
    "Click an image to switch the preview. Use the pencil button to add it as a reference image.":
      "Cliquez sur une image pour changer l'aperçu. Utilisez le bouton crayon pour l'ajouter comme image de référence.",
    "No history images yet": "Aucune image d'historique pour l'instant",
    "Generated images with uploaded CDN URLs will be stored here.":
      "Les images générées avec des URL CDN téléversées seront stockées ici.",
    "Reference": "Référence",
    "The drawing service is currently busy. Please try again later.":
      "Le service de dessin est actuellement occupé. Veuillez réessayer plus tard.",
    "The drawing service is out of disk space. Please contact the administrator.":
      "Le service de dessin n'a plus d'espace disque. Veuillez contacter l'administrateur.",
    "The drawing service is temporarily unavailable. Please try again later.":
      "Le service de dessin est temporairement indisponible. Veuillez réessayer plus tard.",
    "Failed to load drawing groups":
      "Échec du chargement des groupes de dessin",
    "Failed to load drawing models":
      "Échec du chargement des modèles de dessin",
    "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.":
      "Après activation, le système créera automatiquement un jeton de dessin dédié pour l'utilisateur et l'associera au groupe et aux modèles configurés.",
    "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.":
      "Lorsque cette option est activée, les rappels Midjourney sont acceptés, ce qui peut révéler l'adresse IP du serveur.",
    "Keep this enabled if you need to proxy drawing requests for different upstream accounts.":
      "Laissez cette option activée si vous devez relayer les requêtes de dessin pour différents comptes amont.",
    "Automatically replaces upstream callback URLs with the current server address.":
      "Remplace automatiquement les URL de rappel amont par l'adresse actuelle du serveur.",
    "Clear --fast / --relax / --turbo flags in prompts":
      "Supprimer les indicateurs --fast / --relax / --turbo des prompts",
    "Removes Midjourney mode flags from user prompts before forwarding them upstream.":
      "Supprime les indicateurs de mode Midjourney des prompts utilisateur avant leur envoi au service amont.",
    "Require success before follow-up actions":
      "Exiger une réussite avant les actions de suivi",
    "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.":
      "Migrez et gérez ici le jeton de dessin IA dédié, la portée des modèles et la stratégie de stockage CDN gratuite.",
    "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.":
      "Une fois activé, le système crée automatiquement un jeton de dessin dédié pour chaque utilisateur lors du premier appel à /api/user/self/drawing/init. Ce jeton limite seulement le groupe et les modèles, tandis que la facturation du quota continue de suivre le compte utilisateur lui-même.",
    "Dedicated drawing token settings":
      "Paramètres du jeton de dessin dédié",
    "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.":
      "Le groupe de dessin détermine les canaux disponibles. Les restrictions de modèle et le modèle par défaut seront appliqués au jeton dédié.",
    "Drawing group": "Groupe de dessin",
    "Please select drawing group": "Veuillez sélectionner un groupe de dessin",
    "The system will load all available drawing-capable models from the selected group.":
      "Le système chargera tous les modèles capables de dessiner depuis le groupe sélectionné.",
    "Default drawing model": "Modèle de dessin par défaut",
    "Leave empty to use the first available model":
      "Laissez vide pour utiliser le premier modèle disponible",
    "If left empty, the system automatically uses the first available model in the allowed list.":
      "S'il est laissé vide, le système utilise automatiquement le premier modèle disponible dans la liste autorisée.",
    "Allowed drawing models": "Modèles de dessin autorisés",
    "Supports multi-select. Leave empty to allow all available models in this group.":
      "Prise en charge de la sélection multiple. Laissez vide pour autoriser tous les modèles disponibles de ce groupe.",
    "Please select drawing group first":
      "Veuillez d'abord sélectionner un groupe de dessin",
    "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.":
      "Le système privilégie les modèles qui prennent en charge /v1/images/generations ou des points d'accès de dessin équivalents. Si les métadonnées du point d'accès sont absentes, tous les modèles disponibles du groupe seront listés en secours.",
    "Drawing CDN settings": "Paramètres CDN du dessin",
    "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.":
      "Après la génération des images, le système peut les téléverser vers des fournisseurs CDN gratuits. En mode le plus rapide, il téléverse en parallèle et utilise le premier succès.",
    "Upload strategy": "Stratégie de téléversement",
    "Fastest available": "Le plus rapide disponible",
    "Please select upload strategy":
      "Veuillez sélectionner une stratégie de téléversement",
    "Choose fastest to race multiple providers, or lock to one fixed provider.":
      "Choisissez le plus rapide pour mettre plusieurs fournisseurs en concurrence, ou verrouillez-en un seul.",
    "Enabled CDN providers": "Fournisseurs CDN activés",
    "Please select CDN providers": "Veuillez sélectionner des fournisseurs CDN",
    "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.":
      "Les valeurs enregistrées seront écrites dans DrawingCDNMode et DrawingCDNProviders. Les images générées seront ensuite téléversées vers les fournisseurs configurés ici.",
    "1:1 · Square": "1:1 · Carré",
    "16:9 · Wide": "16:9 · Large",
    "9:16 · Poster": "9:16 · Affiche",
    "4:3 · Standard": "4:3 · Standard",
    "3:4 · Portrait": "3:4 · Portrait",
    "SKY Image": "SKY Image",
    "Litterbox 72h": "Litterbox 72h",
    "SCDN CN": "SCDN CN",
    "SCDN EdgeOne": "SCDN EdgeOne",
    "SCDN Anycast": "SCDN Anycast",
    "Image Host XZ": "Hébergement d'images XZ",
    "360 Image Host": "Hébergement d'images 360",
  },
  ru: {
    "AI Drawing": "AI-рисование",
    "Failed to load drawing configuration":
      "Не удалось загрузить конфигурацию рисования",
    "You can upload up to 3 reference images":
      "Можно загрузить до 3 эталонных изображений",
    "Only image files are supported":
      "Поддерживаются только файлы изображений",
    "exceeds the 5MB limit": "превышает лимит 5 МБ",
    "Failed to read image": "Не удалось прочитать изображение",
    "Image URL is invalid": "URL изображения недействителен",
    "Reference image data is invalid":
      "Данные эталонного изображения недействительны",
    "Added to reference images": "Добавлено в эталонные изображения",
    "Failed to read history image":
      "Не удалось прочитать изображение из истории",
    "Drawing is not enabled on this site yet":
      "Функция рисования на этом сайте еще не включена",
    "Please enter a prompt": "Пожалуйста, введите промпт",
    "No drawing model is currently available":
      "Сейчас нет доступной модели рисования",
    "Drawing token is not initialized yet. Please refresh the configuration.":
      "Токен рисования еще не инициализирован. Пожалуйста, обновите конфигурацию.",
    "The current model does not support reference images. Please switch to a compatible model.":
      "Текущая модель не поддерживает эталонные изображения. Переключитесь на совместимую модель.",
    "The upstream returned success, but no displayable image result was found.":
      "Вышестоящий сервис вернул успех, но не найдено отображаемого результата изображения.",
    "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.":
      "Изображения были сгенерированы, но загрузка в бесплатный CDN не удалась. Вместо этого будут использованы временные URL вышестоящего сервиса.",
    "Drawing completed": "Рисование завершено",
    "Drawing request failed": "Запрос на рисование не удался",
    "Model Count": "Количество моделей",
    "Your ideas start turning into finished images the moment inspiration appears.":
      "Ваши идеи начинают превращаться в готовые изображения в тот момент, когда приходит вдохновение.",
    "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.":
      "Свободно комбинируйте промпты, эталонные изображения, соотношения сторон и размеры. Доступные модели автоматически синхронизируются из backend-конфигурации, чтобы каждая идея быстрее превращалась в видимый результат.",
    "Refresh Configuration": "Обновить конфигурацию",
    "Drawing is not configured yet": "Рисование еще не настроено",
    "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.":
      "Рисование отключено, либо группа и модели рисования еще не настроены в backend.",
    "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.":
      "Например: рыжий кот в металлических наушниках сидит на неоновой дождливой улице ночью, кинематографично, ультрадетализировано.",
    "Reference Images (Optional, 1-3)":
      "Эталонные изображения (необязательно, 1-3)",
    "The current model will generate together with the reference images.":
      "Текущая модель будет генерировать вместе с эталонными изображениями.",
    "The current model does not use reference images.":
      "Текущая модель не использует эталонные изображения.",
    "Click or drag images here": "Нажмите или перетащите изображения сюда",
    "Supports JPEG, PNG, and WebP. Maximum 5MB per image.":
      "Поддерживаются JPEG, PNG и WebP. Максимум 5 МБ на изображение.",
    "Add More": "Добавить еще",
    "Dedicated Token": "Выделенный токен",
    "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.":
      "Система автоматически привязывает выделенный токен рисования к текущему пользователю. Вам не нужно создавать его или переключаться вручную.",
    "Different models automatically switch to their matching request endpoints.":
      "Разные модели автоматически переключаются на соответствующие конечные точки запросов.",
    "Please select a model": "Пожалуйста, выберите модель",
    "Aspect Ratio": "Соотношение сторон",
    "Controls the orientation and composition space of the image.":
      "Управляет ориентацией и компоновочным пространством изображения.",
    "Image Size": "Размер изображения",
    "Higher sizes usually produce better quality but may take longer.":
      "Большие размеры обычно дают лучшее качество, но могут занимать больше времени.",
    "Generate Image": "Сгенерировать изображение",
    "Latest Result": "Последний результат",
    "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.":
      "Недавно сгенерированные изображения сохраняют свои CDN-URL. Используйте кнопку истории в правом нижнем углу, чтобы просмотреть их.",
    "Records": "Записи",
    "Generating image, please wait":
      "Изображение генерируется, пожалуйста, подождите",
    "Elapsed": "Прошло",
    "The generated result will appear here automatically.":
      "Сгенерированный результат автоматически появится здесь.",
    "Original": "Оригинал",
    "Your generated images will appear here":
      "Здесь появятся ваши сгенерированные изображения",
    "Specification": "Спецификация",
    "Prompt Used": "Использованный промпт",
    "Model Notes": "Примечания модели",
    "Click an image to switch the preview. Use the pencil button to add it as a reference image.":
      "Нажмите на изображение, чтобы переключить предпросмотр. Используйте кнопку с карандашом, чтобы добавить его как эталонное изображение.",
    "No history images yet": "Исторических изображений пока нет",
    "Generated images with uploaded CDN URLs will be stored here.":
      "Сгенерированные изображения с загруженными CDN-URL будут храниться здесь.",
    "Reference": "Эталон",
    "The drawing service is currently busy. Please try again later.":
      "Сервис рисования сейчас занят. Пожалуйста, попробуйте позже.",
    "The drawing service is out of disk space. Please contact the administrator.":
      "У сервиса рисования закончилось место на диске. Свяжитесь с администратором.",
    "The drawing service is temporarily unavailable. Please try again later.":
      "Сервис рисования временно недоступен. Пожалуйста, попробуйте позже.",
    "Failed to load drawing groups":
      "Не удалось загрузить группы рисования",
    "Failed to load drawing models":
      "Не удалось загрузить модели рисования",
    "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.":
      "После включения система автоматически создаст для пользователя выделенный токен рисования и привяжет его к настроенной группе и моделям.",
    "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.":
      "При включении принимаются callback'и Midjourney, что может раскрыть IP-адрес сервера.",
    "Keep this enabled if you need to proxy drawing requests for different upstream accounts.":
      "Оставьте это включенным, если вам нужно проксировать запросы на рисование для разных вышестоящих аккаунтов.",
    "Automatically replaces upstream callback URLs with the current server address.":
      "Автоматически заменяет URL обратного вызова вышестоящего сервиса текущим адресом сервера.",
    "Clear --fast / --relax / --turbo flags in prompts":
      "Удалять флаги --fast / --relax / --turbo из промптов",
    "Removes Midjourney mode flags from user prompts before forwarding them upstream.":
      "Удаляет флаги режимов Midjourney из пользовательских промптов перед отправкой вышестоящему сервису.",
    "Require success before follow-up actions":
      "Требовать успех перед последующими действиями",
    "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.":
      "Здесь можно перенести и управлять выделенным AI-токеном рисования, областью моделей и стратегией хранения в бесплатном CDN.",
    "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.":
      "После включения система автоматически создает один выделенный токен рисования для каждого пользователя при первом вызове /api/user/self/drawing/init. Токен ограничивает только группу и область моделей, а списание квоты по-прежнему идет по самому пользовательскому аккаунту.",
    "Dedicated drawing token settings":
      "Настройки выделенного токена рисования",
    "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.":
      "Группа рисования определяет доступные каналы. Ограничения моделей и модель по умолчанию будут применены к выделенному токену.",
    "Drawing group": "Группа рисования",
    "Please select drawing group":
      "Пожалуйста, выберите группу рисования",
    "The system will load all available drawing-capable models from the selected group.":
      "Система загрузит все доступные модели с поддержкой рисования из выбранной группы.",
    "Default drawing model": "Модель рисования по умолчанию",
    "Leave empty to use the first available model":
      "Оставьте пустым, чтобы использовать первую доступную модель",
    "If left empty, the system automatically uses the first available model in the allowed list.":
      "Если оставить пустым, система автоматически использует первую доступную модель в разрешенном списке.",
    "Allowed drawing models": "Разрешенные модели рисования",
    "Supports multi-select. Leave empty to allow all available models in this group.":
      "Поддерживается множественный выбор. Оставьте пустым, чтобы разрешить все доступные модели в этой группе.",
    "Please select drawing group first":
      "Сначала выберите группу рисования",
    "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.":
      "Система предпочитает модели, поддерживающие /v1/images/generations или эквивалентные конечные точки рисования. Если метаданные конечной точки отсутствуют, в качестве резервного варианта будут перечислены все доступные модели группы.",
    "Drawing CDN settings": "Настройки CDN для рисования",
    "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.":
      "После генерации изображений система может загружать их к бесплатным CDN-провайдерам. В самом быстром режиме загрузка идет параллельно и используется первый успешный результат.",
    "Upload strategy": "Стратегия загрузки",
    "Fastest available": "Самый быстрый доступный",
    "Please select upload strategy":
      "Пожалуйста, выберите стратегию загрузки",
    "Choose fastest to race multiple providers, or lock to one fixed provider.":
      "Выберите самый быстрый вариант для параллельной гонки нескольких провайдеров или зафиксируйте одного конкретного провайдера.",
    "Enabled CDN providers": "Включенные CDN-провайдеры",
    "Please select CDN providers":
      "Пожалуйста, выберите CDN-провайдеров",
    "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.":
      "Сохраненные значения будут записаны в DrawingCDNMode и DrawingCDNProviders. После этого сгенерированные изображения будут загружаться к указанным здесь провайдерам.",
    "1:1 · Square": "1:1 · Квадрат",
    "16:9 · Wide": "16:9 · Широкий",
    "9:16 · Poster": "9:16 · Постер",
    "4:3 · Standard": "4:3 · Стандарт",
    "3:4 · Portrait": "3:4 · Портрет",
    "SKY Image": "SKY Image",
    "Litterbox 72h": "Litterbox 72h",
    "SCDN CN": "SCDN CN",
    "SCDN EdgeOne": "SCDN EdgeOne",
    "SCDN Anycast": "SCDN Anycast",
    "Image Host XZ": "Image Host XZ",
    "360 Image Host": "360 Image Host",
  },
  ja: {
    "AI Drawing": "AI画像生成",
    "Failed to load drawing configuration": "画像生成設定の読み込みに失敗しました",
    "You can upload up to 3 reference images":
      "参照画像は最大3枚までアップロードできます",
    "Only image files are supported":
      "画像ファイルのみ対応しています",
    "exceeds the 5MB limit": "5MB の上限を超えています",
    "Failed to read image": "画像の読み込みに失敗しました",
    "Image URL is invalid": "画像 URL が無効です",
    "Reference image data is invalid": "参照画像データが無効です",
    "Added to reference images": "参照画像に追加しました",
    "Failed to read history image": "履歴画像の読み込みに失敗しました",
    "Drawing is not enabled on this site yet":
      "このサイトではまだ画像生成が有効になっていません",
    "Please enter a prompt": "プロンプトを入力してください",
    "No drawing model is currently available":
      "現在利用できる画像生成モデルがありません",
    "Drawing token is not initialized yet. Please refresh the configuration.":
      "画像生成トークンはまだ初期化されていません。設定を再読み込みしてください。",
    "The current model does not support reference images. Please switch to a compatible model.":
      "現在のモデルは参照画像をサポートしていません。対応モデルに切り替えてください。",
    "The upstream returned success, but no displayable image result was found.":
      "上流サービスは成功を返しましたが、表示できる画像結果が見つかりませんでした。",
    "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.":
      "画像は生成されましたが、無料 CDN へのアップロードに失敗しました。代わりに一時的な上流 URL を使用します。",
    "Drawing completed": "画像生成が完了しました",
    "Drawing request failed": "画像生成リクエストに失敗しました",
    "Model Count": "モデル数",
    "Your ideas start turning into finished images the moment inspiration appears.":
      "ひらめいた瞬間から、あなたのアイデアは完成した画像へと変わり始めます。",
    "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.":
      "プロンプト、参照画像、アスペクト比、画像サイズを自由に組み合わせられます。利用可能なモデルはバックエンドの画像生成設定から自動同期され、あらゆるアイデアをより早く見える形にします。",
    "Refresh Configuration": "設定を再読み込み",
    "Drawing is not configured yet": "画像生成はまだ設定されていません",
    "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.":
      "画像生成が無効になっているか、バックエンドで画像生成グループとモデルがまだ設定されていません。",
    "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.":
      "例：金属製ヘッドホンを着けたオレンジ色の猫が、夜のネオン雨の街に座っている。シネマ風、超高精細。",
    "Reference Images (Optional, 1-3)": "参照画像（任意、1〜3枚）",
    "The current model will generate together with the reference images.":
      "現在のモデルは参照画像とあわせて生成を行います。",
    "The current model does not use reference images.":
      "現在のモデルは参照画像を使用しません。",
    "Click or drag images here":
      "ここをクリックするか画像をドラッグしてください",
    "Supports JPEG, PNG, and WebP. Maximum 5MB per image.":
      "JPEG、PNG、WebP に対応。1枚あたり最大 5MB です。",
    "Add More": "さらに追加",
    "Dedicated Token": "専用トークン",
    "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.":
      "システムは現在のユーザーに専用の画像生成トークンを自動で紐づけます。手動で作成や切り替えを行う必要はありません。",
    "Different models automatically switch to their matching request endpoints.":
      "モデルごとに対応するリクエストエンドポイントへ自動で切り替わります。",
    "Please select a model": "モデルを選択してください",
    "Aspect Ratio": "アスペクト比",
    "Controls the orientation and composition space of the image.":
      "画像の向きと構図の余白を調整します。",
    "Image Size": "画像サイズ",
    "Higher sizes usually produce better quality but may take longer.":
      "サイズが大きいほど高品質になりやすいですが、時間がかかる場合があります。",
    "Generate Image": "画像を生成",
    "Latest Result": "最新の結果",
    "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.":
      "最近生成した画像は CDN URL を保持します。右下の履歴ボタンから確認できます。",
    "Records": "記録",
    "Generating image, please wait": "画像を生成中です。しばらくお待ちください",
    "Elapsed": "経過時間",
    "The generated result will appear here automatically.":
      "生成結果はここに自動で表示されます。",
    "Original": "元画像",
    "Your generated images will appear here":
      "生成した画像がここに表示されます",
    "Specification": "仕様",
    "Prompt Used": "使用したプロンプト",
    "Model Notes": "モデルメモ",
    "Click an image to switch the preview. Use the pencil button to add it as a reference image.":
      "画像をクリックするとプレビューを切り替えられます。鉛筆ボタンで参照画像に追加できます。",
    "No history images yet": "履歴画像はまだありません",
    "Generated images with uploaded CDN URLs will be stored here.":
      "CDN URL へアップロード済みの生成画像はここに保存されます。",
    "Reference": "参照",
    "The drawing service is currently busy. Please try again later.":
      "画像生成サービスは現在混み合っています。しばらくしてからお試しください。",
    "The drawing service is out of disk space. Please contact the administrator.":
      "画像生成サービスのディスク容量が不足しています。管理者に連絡してください。",
    "The drawing service is temporarily unavailable. Please try again later.":
      "画像生成サービスは一時的に利用できません。しばらくしてからお試しください。",
    "Failed to load drawing groups": "画像生成グループの読み込みに失敗しました",
    "Failed to load drawing models": "画像生成モデルの読み込みに失敗しました",
    "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.":
      "有効化すると、システムはユーザー専用の画像生成トークンを自動作成し、設定されたグループとモデルに紐づけます。",
    "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.":
      "有効にすると Midjourney のコールバックを受け付けます。サーバー IP アドレスが露出する可能性があります。",
    "Keep this enabled if you need to proxy drawing requests for different upstream accounts.":
      "異なる上流アカウント向けに画像生成リクエストをプロキシする必要がある場合は有効のままにしてください。",
    "Automatically replaces upstream callback URLs with the current server address.":
      "上流のコールバック URL を現在のサーバーアドレスに自動置換します。",
    "Clear --fast / --relax / --turbo flags in prompts":
      "プロンプト内の --fast / --relax / --turbo フラグを削除",
    "Removes Midjourney mode flags from user prompts before forwarding them upstream.":
      "上流へ転送する前に、ユーザープロンプトから Midjourney のモードフラグを削除します。",
    "Require success before follow-up actions":
      "後続操作の前に成功を必須にする",
    "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.":
      "ここで AI 画像生成専用トークン、モデル範囲、無料 CDN 保存戦略を移行・管理します。",
    "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.":
      "有効にすると、/api/user/self/drawing/init への初回呼び出し時に、ユーザーごとに専用の画像生成トークンが自動作成されます。このトークンはグループとモデル範囲のみを制限し、クォータ課金は引き続きユーザーアカウント本体に従います。",
    "Dedicated drawing token settings": "専用画像生成トークン設定",
    "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.":
      "画像生成グループによって利用可能なチャネルが決まります。モデル制限とデフォルトモデルは専用トークンに適用されます。",
    "Drawing group": "画像生成グループ",
    "Please select drawing group": "画像生成グループを選択してください",
    "The system will load all available drawing-capable models from the selected group.":
      "選択したグループから、画像生成可能なすべてのモデルを読み込みます。",
    "Default drawing model": "デフォルト画像生成モデル",
    "Leave empty to use the first available model":
      "空欄の場合は最初に利用可能なモデルを使用します",
    "If left empty, the system automatically uses the first available model in the allowed list.":
      "空欄のままにすると、許可リスト内の最初に利用可能なモデルが自動で使用されます。",
    "Allowed drawing models": "許可された画像生成モデル",
    "Supports multi-select. Leave empty to allow all available models in this group.":
      "複数選択に対応。空欄にすると、このグループ内のすべての利用可能モデルを許可します。",
    "Please select drawing group first":
      "先に画像生成グループを選択してください",
    "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.":
      "システムは /v1/images/generations または同等の画像生成エンドポイントをサポートするモデルを優先します。エンドポイントのメタデータがない場合は、このグループ内のすべての利用可能モデルを代替として一覧表示します。",
    "Drawing CDN settings": "画像生成 CDN 設定",
    "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.":
      "画像生成後、システムは無料 CDN プロバイダーへアップロードできます。最速モードでは並列アップロードを行い、最初に成功した結果を使用します。",
    "Upload strategy": "アップロード戦略",
    "Fastest available": "最速優先",
    "Please select upload strategy": "アップロード戦略を選択してください",
    "Choose fastest to race multiple providers, or lock to one fixed provider.":
      "最速優先で複数プロバイダーを競わせるか、1つの固定プロバイダーに限定できます。",
    "Enabled CDN providers": "有効な CDN プロバイダー",
    "Please select CDN providers": "CDN プロバイダーを選択してください",
    "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.":
      "保存した値は DrawingCDNMode と DrawingCDNProviders に書き込まれます。その後、生成画像はここで設定したプロバイダーへアップロードされます。",
    "1:1 · Square": "1:1 · 正方形",
    "16:9 · Wide": "16:9 · ワイド",
    "9:16 · Poster": "9:16 · ポスター",
    "4:3 · Standard": "4:3 · 標準",
    "3:4 · Portrait": "3:4 · 縦長",
    "SKY Image": "SKY Image",
    "Litterbox 72h": "Litterbox 72h",
    "SCDN CN": "SCDN CN",
    "SCDN EdgeOne": "SCDN EdgeOne",
    "SCDN Anycast": "SCDN Anycast",
    "Image Host XZ": "Image Host XZ",
    "360 Image Host": "360 Image Host",
  },
  vi: {
    "AI Drawing": "Vẽ AI",
    "Failed to load drawing configuration":
      "Không thể tải cấu hình vẽ",
    "You can upload up to 3 reference images":
      "Bạn có thể tải lên tối đa 3 ảnh tham chiếu",
    "Only image files are supported":
      "Chỉ hỗ trợ tệp hình ảnh",
    "exceeds the 5MB limit": "vượt quá giới hạn 5MB",
    "Failed to read image": "Không thể đọc hình ảnh",
    "Image URL is invalid": "URL hình ảnh không hợp lệ",
    "Reference image data is invalid":
      "Dữ liệu ảnh tham chiếu không hợp lệ",
    "Added to reference images": "Đã thêm vào ảnh tham chiếu",
    "Failed to read history image":
      "Không thể đọc ảnh lịch sử",
    "Drawing is not enabled on this site yet":
      "Tính năng vẽ chưa được bật trên trang này",
    "Please enter a prompt": "Vui lòng nhập prompt",
    "No drawing model is currently available":
      "Hiện không có mô hình vẽ nào khả dụng",
    "Drawing token is not initialized yet. Please refresh the configuration.":
      "Token vẽ chưa được khởi tạo. Vui lòng làm mới cấu hình.",
    "The current model does not support reference images. Please switch to a compatible model.":
      "Mô hình hiện tại không hỗ trợ ảnh tham chiếu. Vui lòng chuyển sang mô hình tương thích.",
    "The upstream returned success, but no displayable image result was found.":
      "Dịch vụ upstream đã trả về thành công, nhưng không tìm thấy kết quả hình ảnh có thể hiển thị.",
    "Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.":
      "Ảnh đã được tạo, nhưng tải lên CDN miễn phí thất bại. Sẽ dùng URL upstream tạm thời thay thế.",
    "Drawing completed": "Đã tạo ảnh xong",
    "Drawing request failed": "Yêu cầu tạo ảnh thất bại",
    "Model Count": "Số lượng mô hình",
    "Your ideas start turning into finished images the moment inspiration appears.":
      "Ý tưởng của bạn bắt đầu biến thành hình ảnh hoàn chỉnh ngay khi cảm hứng xuất hiện.",
    "Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.":
      "Kết hợp tự do prompt, ảnh tham chiếu, tỷ lệ khung hình và kích thước ảnh. Các mô hình khả dụng được đồng bộ tự động từ cấu hình backend để mọi ý tưởng nhanh chóng trở thành kết quả nhìn thấy được.",
    "Refresh Configuration": "Làm mới cấu hình",
    "Drawing is not configured yet": "Tính năng vẽ chưa được cấu hình",
    "Drawing is disabled, or the drawing group and models have not been configured yet in the backend.":
      "Tính năng vẽ đang bị tắt hoặc nhóm và mô hình vẽ chưa được cấu hình trong backend.",
    "For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.":
      "Ví dụ: một chú mèo màu cam đeo tai nghe kim loại, ngồi trên con phố mưa neon vào ban đêm, phong cách điện ảnh, siêu chi tiết.",
    "Reference Images (Optional, 1-3)":
      "Ảnh tham chiếu (tùy chọn, 1-3 ảnh)",
    "The current model will generate together with the reference images.":
      "Mô hình hiện tại sẽ tạo ảnh cùng với các ảnh tham chiếu.",
    "The current model does not use reference images.":
      "Mô hình hiện tại không sử dụng ảnh tham chiếu.",
    "Click or drag images here": "Nhấp hoặc kéo thả ảnh vào đây",
    "Supports JPEG, PNG, and WebP. Maximum 5MB per image.":
      "Hỗ trợ JPEG, PNG và WebP. Tối đa 5MB cho mỗi ảnh.",
    "Add More": "Thêm nữa",
    "Dedicated Token": "Token chuyên dụng",
    "The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.":
      "Hệ thống tự động gắn token vẽ chuyên dụng cho người dùng hiện tại. Bạn không cần tự tạo hoặc chuyển thủ công.",
    "Different models automatically switch to their matching request endpoints.":
      "Các mô hình khác nhau sẽ tự động chuyển sang endpoint phù hợp.",
    "Please select a model": "Vui lòng chọn một mô hình",
    "Aspect Ratio": "Tỷ lệ khung hình",
    "Controls the orientation and composition space of the image.":
      "Điều khiển hướng và không gian bố cục của hình ảnh.",
    "Image Size": "Kích thước ảnh",
    "Higher sizes usually produce better quality but may take longer.":
      "Kích thước lớn hơn thường cho chất lượng tốt hơn nhưng có thể mất nhiều thời gian hơn.",
    "Generate Image": "Tạo ảnh",
    "Latest Result": "Kết quả mới nhất",
    "Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.":
      "Các ảnh vừa tạo sẽ giữ nguyên URL CDN của chúng. Dùng nút lịch sử ở góc dưới bên phải để xem lại.",
    "Records": "Bản ghi",
    "Generating image, please wait": "Đang tạo ảnh, vui lòng chờ",
    "Elapsed": "Thời gian đã trôi qua",
    "The generated result will appear here automatically.":
      "Kết quả được tạo sẽ tự động xuất hiện ở đây.",
    "Original": "Gốc",
    "Your generated images will appear here":
      "Ảnh bạn tạo sẽ xuất hiện tại đây",
    "Specification": "Thông số",
    "Prompt Used": "Prompt đã dùng",
    "Model Notes": "Ghi chú mô hình",
    "Click an image to switch the preview. Use the pencil button to add it as a reference image.":
      "Nhấp vào ảnh để chuyển bản xem trước. Dùng nút bút chì để thêm ảnh đó làm ảnh tham chiếu.",
    "No history images yet": "Chưa có ảnh lịch sử",
    "Generated images with uploaded CDN URLs will be stored here.":
      "Các ảnh được tạo với URL CDN đã tải lên sẽ được lưu ở đây.",
    "Reference": "Tham chiếu",
    "The drawing service is currently busy. Please try again later.":
      "Dịch vụ tạo ảnh hiện đang bận. Vui lòng thử lại sau.",
    "The drawing service is out of disk space. Please contact the administrator.":
      "Dịch vụ tạo ảnh đã hết dung lượng đĩa. Vui lòng liên hệ quản trị viên.",
    "The drawing service is temporarily unavailable. Please try again later.":
      "Dịch vụ tạo ảnh tạm thời không khả dụng. Vui lòng thử lại sau.",
    "Failed to load drawing groups":
      "Không thể tải các nhóm vẽ",
    "Failed to load drawing models":
      "Không thể tải các mô hình vẽ",
    "After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.":
      "Sau khi bật, hệ thống sẽ tự động tạo token vẽ chuyên dụng cho người dùng và gắn nó với nhóm và mô hình đã cấu hình.",
    "When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.":
      "Khi bật, callback Midjourney sẽ được chấp nhận, điều này có thể làm lộ địa chỉ IP của máy chủ.",
    "Keep this enabled if you need to proxy drawing requests for different upstream accounts.":
      "Hãy giữ tùy chọn này bật nếu bạn cần proxy các yêu cầu vẽ cho các tài khoản upstream khác nhau.",
    "Automatically replaces upstream callback URLs with the current server address.":
      "Tự động thay URL callback upstream bằng địa chỉ máy chủ hiện tại.",
    "Clear --fast / --relax / --turbo flags in prompts":
      "Xóa cờ --fast / --relax / --turbo trong prompt",
    "Removes Midjourney mode flags from user prompts before forwarding them upstream.":
      "Xóa các cờ chế độ Midjourney khỏi prompt của người dùng trước khi chuyển tiếp lên upstream.",
    "Require success before follow-up actions":
      "Yêu cầu thành công trước các thao tác tiếp theo",
    "Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.":
      "Di chuyển và quản lý token vẽ AI chuyên dụng, phạm vi mô hình và chiến lược lưu trữ CDN miễn phí tại đây.",
    "When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.":
      "Khi bật, hệ thống sẽ tự động tạo một token vẽ chuyên dụng cho mỗi người dùng ở lần gọi đầu tiên đến /api/user/self/drawing/init. Token này chỉ giới hạn phạm vi nhóm và mô hình, còn tính phí quota vẫn theo chính tài khoản người dùng.",
    "Dedicated drawing token settings": "Cài đặt token vẽ chuyên dụng",
    "The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.":
      "Nhóm vẽ quyết định các kênh khả dụng. Các giới hạn mô hình và mô hình mặc định sẽ được áp dụng vào token chuyên dụng.",
    "Drawing group": "Nhóm vẽ",
    "Please select drawing group": "Vui lòng chọn nhóm vẽ",
    "The system will load all available drawing-capable models from the selected group.":
      "Hệ thống sẽ tải tất cả các mô hình có khả năng vẽ từ nhóm đã chọn.",
    "Default drawing model": "Mô hình vẽ mặc định",
    "Leave empty to use the first available model":
      "Để trống để dùng mô hình khả dụng đầu tiên",
    "If left empty, the system automatically uses the first available model in the allowed list.":
      "Nếu để trống, hệ thống sẽ tự động dùng mô hình khả dụng đầu tiên trong danh sách cho phép.",
    "Allowed drawing models": "Các mô hình vẽ được phép",
    "Supports multi-select. Leave empty to allow all available models in this group.":
      "Hỗ trợ chọn nhiều. Để trống để cho phép tất cả mô hình khả dụng trong nhóm này.",
    "Please select drawing group first":
      "Vui lòng chọn nhóm vẽ trước",
    "The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.":
      "Hệ thống ưu tiên các mô hình hỗ trợ /v1/images/generations hoặc endpoint vẽ tương đương. Nếu thiếu metadata endpoint, tất cả mô hình khả dụng trong nhóm sẽ được liệt kê làm phương án dự phòng.",
    "Drawing CDN settings": "Cài đặt CDN cho vẽ",
    "After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.":
      "Sau khi ảnh được tạo, hệ thống có thể tải chúng lên các nhà cung cấp CDN miễn phí. Ở chế độ nhanh nhất, hệ thống tải song song và dùng nhà cung cấp thành công đầu tiên.",
    "Upload strategy": "Chiến lược tải lên",
    "Fastest available": "Nhanh nhất hiện có",
    "Please select upload strategy":
      "Vui lòng chọn chiến lược tải lên",
    "Choose fastest to race multiple providers, or lock to one fixed provider.":
      "Chọn nhanh nhất để chạy song song nhiều nhà cung cấp hoặc cố định vào một nhà cung cấp duy nhất.",
    "Enabled CDN providers": "Các nhà cung cấp CDN đã bật",
    "Please select CDN providers":
      "Vui lòng chọn nhà cung cấp CDN",
    "Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.":
      "Các giá trị đã lưu sẽ được ghi vào DrawingCDNMode và DrawingCDNProviders. Sau đó ảnh được tạo sẽ được tải lên các nhà cung cấp đã cấu hình tại đây.",
    "1:1 · Square": "1:1 · Vuông",
    "16:9 · Wide": "16:9 · Rộng",
    "9:16 · Poster": "9:16 · Poster",
    "4:3 · Standard": "4:3 · Tiêu chuẩn",
    "3:4 · Portrait": "3:4 · Dọc",
    "SKY Image": "SKY Image",
    "Litterbox 72h": "Litterbox 72h",
    "SCDN CN": "SCDN CN",
    "SCDN EdgeOne": "SCDN EdgeOne",
    "SCDN Anycast": "SCDN Anycast",
    "Image Host XZ": "Image Host XZ",
    "360 Image Host": "360 Image Host",
  },
} as const

