/**
 * The following API was inspired by Vue 3's reactivity system
 */

type IEffectFunction = () => void;

type IDeps = Set<IEffectFunction>;
type ITargetMap = WeakMap<any, IDepsMap>;
type IDepsMap = Map<PropertyKey, IDeps>;

let activeEffect: (() => void) | null = null;
let isEffectRunning = false;
const targetMap: ITargetMap = new WeakMap();

export function effect(eff: () => void) {
	activeEffect = eff;

	isEffectRunning = true;
	activeEffect();
	isEffectRunning = false;

	activeEffect = null;
}

export function reactive<T extends object>(target: T) {
	return new Proxy<T>(target, {
		get(target, key, receiver) {
			const ret = Reflect.get(target, key, receiver);

			if (typeof ret === 'object') {
				track(ret, key);

				return reactive(ret);
			}

			track(target, key);

			return ret;
		},

		set(target, key, value, receiver) {
			const oldVal = target[key as keyof typeof target];
			const result = Reflect.set(target, key, value, receiver);

			if (result && oldVal !== value && !isEffectRunning) {
				trigger(target, key);
			}

			// TODO deduplicate
			return Reflect.set(target, key, value, receiver);
		}
	});
}

function track(target: any, key: PropertyKey) {
	console.log('TRACK', { target, key });

	if (activeEffect) {
		let depsMap = targetMap.get(target);

		if (!depsMap) {
			targetMap.set(target, (depsMap = new Map()));
		}

		let dep = depsMap.get(key);
		if (!dep) {
			depsMap.set(key, (dep = new Set<IEffectFunction>()));
		}

		const ae = activeEffect;

		dep.add(() => {
			isEffectRunning = true;

			ae();
			isEffectRunning = false;
		});
	}
}

function trigger(target: any, key: PropertyKey) {
	console.log('TRIGGER', { target, key });

	if (isEffectRunning) return;

	let depsMap = targetMap.get(target);
	if (!depsMap) return;

	let dep = depsMap.get(key);

	if (dep) {
		dep.forEach((effect) => effect());
	}
}
