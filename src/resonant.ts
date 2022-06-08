import { track, trigger } from './scheduler'
import { isObject } from './utils'

/**
 * Add resonance to a plain object.
 * All object properties will be eligible dependencies for an effect.
 * @param target
 *
 * @public
 */
export function resonant<T extends Record<any, any>>(target: T) {
  return new Proxy(target, {
    deleteProperty(target, key) {
      const hadKey = Reflect.has(target, key)
      const result = Reflect.deleteProperty(target, key)

      if (hadKey) {
        trigger(target, key)
      }

      return result
    },

    get(target, key, receiver): T {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: T[keyof T] = Reflect.get(target, key, receiver)

      // ensure we set nested objects and arrays and make them resonant
      if (isObject(result)) {
        track<T>(result, key)

        return resonant(result)
      }

      track<T>(target, key)

      return result
    },

    set(target, key, value, receiver) {
      const oldVal = target[key as keyof typeof target]
      const hadKey = Reflect.has(target, key)
      const result = Reflect.set(target, key, value, receiver)

      // replicate `length` accessors that trigger after setting an element
      if (!hadKey && Array.isArray(target)) {
        trigger(target, 'length')
      } else if (!Object.is(oldVal, value)) {
        trigger(target, key)
      }

      return result
    },
  })
}
