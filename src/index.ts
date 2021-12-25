import { isObject } from './utils';

interface IEffectFunction {
	(): void;
	active: boolean;
	handler: () => void;
}

type ITargetMap = WeakMap<any, IEffectsMap>;
type IEffects = Set<IEffectFunction>;
type IEffectsMap = Map<PropertyKey, IEffects>;

/**
 * A map of revoke handlers. Pass in a proxy reference to retrieve its corresponding handler.
 * @public
 */
export const revokes = new WeakMap<ReturnType<typeof resonant>, () => void>();

/**
 * A map of all tracked targets and their dependencies
 * @internal
 */
const targetMap: ITargetMap = new WeakMap();

/**
 * A stack for tracking active effects
 * @internal
 */
const effectStack: IEffectFunction[] = [];

/**
 * Create a resonant effect. All get / set operations within the handler will be tracked.
 * An effect is run upon initialization, and subsequent to any mutations to its dependencies.
 * @param handler
 *
 * @public
 */
export function effect(handler: () => void) {
	const newEffect: IEffectFunction = () => {
		run(newEffect);
	};

	newEffect.active = true;
	newEffect.handler = handler;

	newEffect();
}

/**
 * Make an object resonant. All object properties will be eligible dependencies for an effect.
 * @param target
 *
 * @public
 */
export function resonant<T extends Record<any, any>>(target: T) {
	const { proxy, revoke } = Proxy.revocable<T>(target, {
		deleteProperty(target, key) {
			const hadKey = Reflect.has(target, key);
			const result = Reflect.deleteProperty(target, key);

			if (hadKey) {
				trigger(target, key);
			}

			return result;
		},

		get(target, key, receiver): T {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const result: T[keyof T] = Reflect.get(target, key, receiver);

			// ensure we set nested objects and arrays and make them resonant
			if (isObject(result)) {
				track<T>(result, key);

				return resonant(result);
			}

			track<T>(target, key);

			return result;
		},

		set(target, key, value, receiver) {
			const oldVal = target[key as keyof typeof target];
			const hadKey = Reflect.has(target, key);
			const result = Reflect.set(target, key, value, receiver);

			// replicate `length` accessors that trigger after setting an element
			if (!hadKey && Array.isArray(target)) {
				trigger(target, 'length');
			} else if (!Object.is(oldVal, value)) {
				trigger(target, key);
			}

			return result;
		}
	});

	revokes.set(
		proxy,
		revokeAndCleanup.bind({
			revoke,
			target
		})
	);

	return proxy;
}

/**
 * Push the given effect onto the stack, run it, then pop it off
 * @param effect
 *
 * @internal
 */
function run(effect: IEffectFunction) {
	/* istanbul ignore if */
	if (!effect.active) {
		effect.handler();
		return;
	}

	if (!effectStack.includes(effect)) {
		// using try / catch here allows us to both return the effect handler's return value
		// and subsequently pop it off the stack
		try {
			effectStack.push(effect);

			effect.handler();
			return;
		} finally {
			effectStack.pop();
		}
	}
}

/**
 * Revoke the proxy and clear all effects
 *
 * @internal
 */
function revokeAndCleanup<T>(this: { target: T; revoke: () => void }) {
	const { target, revoke } = this;

	revoke();

	const effectsMap = targetMap.get(target);

	/* istanbul ignore if */
	if (!effectsMap) {
		return;
	}

	effectsMap.clear();
}

/**
 * For a given target, track the given key
 * @param target
 * @param key
 *
 * @internal
 */
function track<T>(target: T, key: PropertyKey) {
	// grab the last run effect - this is the one in which the resonant property is being tracked
	const activeEffect = effectStack[effectStack.length - 1];

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (activeEffect) {
		let effectsMap = targetMap.get(target);
		if (!effectsMap) {
			targetMap.set(target, (effectsMap = new Map() as IEffectsMap));
		}

		let effects = effectsMap.get(key);
		if (!effects) {
			effectsMap.set(key, (effects = new Set<IEffectFunction>()));
		}

		if (!effects.has(activeEffect)) {
			effects.add(activeEffect);
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
function trigger(target: any, key: PropertyKey) {
	const effectsMap = targetMap.get(target);

	if (!effectsMap) {
		return;
	}

	effectsMap.get(key)?.forEach((effect) => {
		effect();
	});
}
