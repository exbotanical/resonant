/**
 * Execute a callback function for a given range.
 * The callback receives as an argument the current index in said range.
 * Intended for use with mocks.
 * @param start The mock at which to begin
 * @param end The
 * @param fn
 */
export function forMocks(start: number, end: number, fn: (n: number) => void) {
	for (let i = start; i < end; i++) {
		fn(i);
	}
}

/**
 * Given a list of mocks, log the number of invocations for each
 * @param mocks A list of jest mocks
 */
export function debug(mocks: jest.Mock[]) {
	mocks.forEach(({ mock }, idx) => {
		// eslint-disable-next-line no-console
		console.log(`mock id: ${idx}`, `calls: ${mock.calls.length}`);
	});
}
