import { isObject } from './utils';

interface IEffectFunction {
	(): void;
	active: boolean;
	handler: () => void;
}

interface IRevokeHandler {
	<T>(this: { target: T; revoke: () => void }): void;
}

type ITargetMap = WeakMap<any, IEffectsMap>;
type IEffects = Set<IEffectFunction>;
type IEffectsMap = Map<PropertyKey, IEffects>;

export const revokes = new WeakMap<
	ReturnType<typeof reactive>,
	IRevokeHandler
>();

const targetMap: ITargetMap = new WeakMap();
const effectStack: IEffectFunction[] = [];

export function effect(handler: () => void) {
	const newEffect: IEffectFunction = () => {
		run(newEffect);
	};

	newEffect.active = true;
	newEffect.handler = handler;

	newEffect();
}

export function reactive<T extends Record<any, any>>(target: T) {
	const { proxy, revoke } = Proxy.revocable<T>(target, {
		get(target, key, receiver): T {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const result: T[keyof T] = Reflect.get(target, key, receiver);

			// ensure we set nested objects and arrays and make them reactive
			if (isObject(result)) {
				track<T>(result, key);

				return reactive(result);
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

function run(effect: IEffectFunction) {
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

function revokeAndCleanup<T>(this: { target: T; revoke: () => void }) {
	const { target, revoke } = this;

	const effectsMap = targetMap.get(target);
	if (!effectsMap) return;

	revoke();
	effectsMap.clear();
}

function track<T>(target: T, key: PropertyKey) {
	// grab the last run effect - this is the one in which the reactive property is being tracked
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

function trigger(target: any, key: PropertyKey) {
	const effectsMap = targetMap.get(target);

	if (!effectsMap) {
		return;
	}

	effectsMap.get(key)?.forEach((effect) => {
		effect();
	});
}
