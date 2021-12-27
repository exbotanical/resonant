interface IObserverHandler {
	(): void;
}

/**
 * Create an observable object.
 * All set operations will trigger each subscribed function in sequence.
 * @param target The observable initial value
 *
 * @public
 */
export function observable<T extends Record<any, any>>(target: T) {
	const observers = new Set<IObserverHandler>();

	Object.defineProperty(target, 'subscribe', {
		configurable: false,
		enumerable: false,
		value: (effect: IObserverHandler) => {
			observers.add(effect);
		},
		writable: false
	});

	return new Proxy(target, {
		set(target, key, value, receiver) {
			if (key === 'subscribe') {
				return false;
			}

			const result = Reflect.set(target, key, value, receiver);

			observers.forEach((o) => {
				o();
			});

			return result;
		}
	});
}
