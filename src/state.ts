import type { IEffectFunction } from './effect'

type IEffects = Set<IEffectFunction>
type ITargetMap = WeakMap<any, IEffectsMap>

export type IEffectsMap = Map<PropertyKey, IEffects>

/**
 * A map of all tracked targets and their dependencies
 *
 * @internal
 */
export const targetMap: ITargetMap = new WeakMap()

/**
 * A stack for tracking active effects
 *
 * @internal
 */
export const effectStack: (IEffectFunction | undefined)[] = []
