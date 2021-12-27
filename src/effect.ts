import { run, start, stop } from './runner';

interface IEffectOptions {
	lazy?: boolean;
}

export interface IEffectFunction {
	active: boolean;
	lazy: boolean;
	handler: () => void;
	refs: Set<IEffectFunction>[];
}

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
