import { isObject } from './utils';

interface IEffectOptions {
	lazy?: boolean;
}

interface IEffectFunction {
	active: boolean;
	lazy: boolean;
	handler: () => void;
	refs: Set<IEffectFunction>[];
}

type ITargetMap = WeakMap<any, IEffectsMap>;
type IEffectsMap = Map<PropertyKey, IEffects>;

type IEffects = Set<IEffectFunction>;

/**
 * A map of all tracked targets and their dependencies
 *
 * @internal
 */
const targetMap: ITargetMap = new WeakMap();

/**
 * A stack for tracking active effects
 *
 * @internal
 */
const effectStack: (IEffectFunction | undefined)[] = [];

/**
 * Create a resonant effect. All get / set operations within the handler will be tracked.
 * An effect is run upon initialization, and subsequent to any mutations to its dependencies.
 * @param handler
 *
 * @public
 */
export function effect(handler: () => void, opts: IEffectOptions = {}) {
	const { lazy } = opts;

	const newEffect: IEffectFunction = {
		active: !lazy,
		lazy: !!lazy,
		handler: handler,
		refs: []
	};

	if (!lazy) {
		run(newEffect);
	}

	return {
		/**
		 * Stop an active effect
		 *
		 * @public
		 */
		stop: () => {
			stop(newEffect);
		},

		/**
		 * Start an inactive effect
		 *
		 * @public
		 */
		start: () => {
			if (newEffect.lazy) {
				newEffect.lazy = false;
			}

			start(newEffect);
		},

		/**
		 * Toggle the effect's active status
		 *
		 * @returns A boolean indicating whether the effect is active
		 *
		 * @public
		 */
		toggle: () => {
			newEffect.active ? stop(newEffect) : start(newEffect);

			return newEffect.active;
		}
	};
}

/**
 * Make an object resonant.
 * All object properties will be eligible dependencies for an effect.
 * @param target
 *
 * @public
 */
export function resonant<T extends Record<any, any>>(target: T) {
	return new Proxy(target, {
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
}

/**
 * Delete all auxillary effect dependencies of a given effect
 * @param effect
 *
 * @internal
 */
function cleanup(effect: IEffectFunction) {
	const { refs } = effect;

	if (refs.length) {
		for (const ref of refs) {
			ref.delete(effect);
		}
	}

	// prevent empty sets from accumulating
	refs.length = 0;
}

/**
 * Remove all effect dependencies if active, then stop the effect
 * @param effect
 *
 * @internal
 */
function stop(effect: IEffectFunction) {
	if (effect.active) {
		cleanup(effect);
	}

	effect.active = false;
}

/**
 * Start an inactive effect
 * @param effect
 *
 * @internal
 */
function start(effect: IEffectFunction) {
	if (!effect.active) {
		effect.active = true;

		run(effect);
	}
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

	if (effectStack.indexOf(effect) === -1) {
		cleanup(effect);

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
			activeEffect.refs.push(effects);
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

	// this is necessary to prevent infinite recursion
	// if we run `cleanup` *and* run the effects as we iterate `effectsMap`, we'll
	// end up invoking `run` and end up back here all over again
	const scheduled = new Set<IEffectFunction>();

	effectsMap.get(key)?.forEach((effect) => {
		scheduled.add(effect);
	});

	scheduled.forEach(run);
}
