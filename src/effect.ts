import { run, start, stop } from './runner';

interface IEffectOptions {
	lazy?: boolean;
}

export interface IEffectFunction {
	/**
	 * The current effect state. Determines whether its handler is invoked upon initialization,
	 * and manages its control state.
	 */
	active: boolean;

	/**
	 * The effect computation
	 */
	handler: () => void;

	/**
	 * References to the effect's dependencies
	 */
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
		handler,
		refs: []
	};

	run(newEffect);

	return {
		/**
		 * Start an inactive effect
		 *
		 * @public
		 */
		start: () => {
			start(newEffect);
		},

		/**
		 * Stop an active effect
		 *
		 * @public
		 */
		stop: () => {
			stop(newEffect);
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
