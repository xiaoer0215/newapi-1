import type { SystemStatus } from '@/features/auth/types'

export type PricingMetadataVisibility = {
  context: boolean
  maxOutput: boolean
  modalities: boolean
  knowledgeCutoff: boolean
  releaseDate: boolean
  capabilities: boolean
}

export const DEFAULT_PRICING_METADATA_VISIBILITY: PricingMetadataVisibility = {
  context: true,
  maxOutput: true,
  modalities: true,
  knowledgeCutoff: true,
  releaseDate: true,
  capabilities: true,
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  }
  return fallback
}

export function getPricingMetadataVisibility(
  status?: SystemStatus | null
): PricingMetadataVisibility {
  const source =
    (status?.data as Record<string, unknown> | undefined) ??
    (status as Record<string, unknown> | null | undefined) ??
    {}

  return {
    context: readBoolean(
      source.pricing_context_enabled,
      DEFAULT_PRICING_METADATA_VISIBILITY.context
    ),
    maxOutput: readBoolean(
      source.pricing_max_output_enabled,
      DEFAULT_PRICING_METADATA_VISIBILITY.maxOutput
    ),
    modalities: readBoolean(
      source.pricing_modalities_enabled,
      DEFAULT_PRICING_METADATA_VISIBILITY.modalities
    ),
    knowledgeCutoff: readBoolean(
      source.pricing_knowledge_cutoff_enabled,
      DEFAULT_PRICING_METADATA_VISIBILITY.knowledgeCutoff
    ),
    releaseDate: readBoolean(
      source.pricing_release_date_enabled,
      DEFAULT_PRICING_METADATA_VISIBILITY.releaseDate
    ),
    capabilities: readBoolean(
      source.pricing_capabilities_enabled,
      DEFAULT_PRICING_METADATA_VISIBILITY.capabilities
    ),
  }
}

export function hasVisibleQuickStats(
  visibility: PricingMetadataVisibility
): boolean {
  return (
    visibility.context ||
    visibility.maxOutput ||
    visibility.modalities ||
    visibility.knowledgeCutoff ||
    visibility.releaseDate
  )
}
