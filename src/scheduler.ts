import { run } from './runner'
import { effectStack, targetMap } from './state'

import type { EffectFunction } from './effect'
import type { EffectsMap } from './state'

/**
 * Delete all auxillary effect dependencies of a given effect
 * @param effect
 *
 * @internal
 */
export function cleanup(effect: EffectFunction) {
  const { refs } = effect

  if (refs.length) {
    for (const ref of refs) {
      ref.delete(effect)
    }
  }

  // prevent empty sets from accumulating
  refs.length = 0
}

/**
 * For a given target, track the given key
 * @param target
 * @param key
 *
 * @internal
 */
export function track<T>(target: T, key: PropertyKey) {
  // grab the last run effect - this is the one in which the resonant property is being tracked
  const activeEffect = effectStack[effectStack.length - 1]

  if (activeEffect) {
    let effectsMap = targetMap.get(target)
    if (!effectsMap) {
      targetMap.set(target, (effectsMap = new Map() as EffectsMap))
    }

    let effects = effectsMap.get(key)
    if (!effects) {
      effectsMap.set(key, (effects = new Set<EffectFunction>()))
    }

    if (!effects.has(activeEffect)) {
      effects.add(activeEffect)
      activeEffect.refs.push(effects)
    }
  }
}

/**
 * Trigger all effects for a given key of a given target
 * @param target
 * @param key
 *
 * @internal
 */
export function trigger(target: any, key: PropertyKey) {
  const effectsMap = targetMap.get(target)

  if (!effectsMap) {
    return
  }

  // this is necessary to prevent infinite recursion
  // if we run `cleanup` *and* run the effects as we iterate `effectsMap`, we'll
  // end up invoking `run` and end up back here all over again
  const scheduled = new Set<EffectFunction>()

  effectsMap.get(key)?.forEach(effect => {
    scheduled.add(effect)
  })

  scheduled.forEach(run)
}
