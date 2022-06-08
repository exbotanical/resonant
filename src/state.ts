import type { EffectFunction } from './effect'

type Effects = Set<EffectFunction>
type TargetMap = WeakMap<any, EffectsMap>

export type EffectsMap = Map<PropertyKey, Effects>

/**
 * A map of all tracked targets and their dependencies
 *
 * @internal
 */
export const targetMap: TargetMap = new WeakMap()

/**
 * A stack for tracking active effects
 *
 * @internal
 */
export const effectStack: (EffectFunction | undefined)[] = []
