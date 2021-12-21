import { effect, reactive } from '../src';

describe('emulated scenarios', () => {
	it('observes consistency when branching', () => {
		const mock1 = jest.fn();
		const mock2 = jest.fn();

		const r = reactive({
			price: 1,
			quantity: 2,
			meta: {
				uuid: '<>',
				inStock: false
			}
		});

		let total = 0;

		effect(() => {
			if (r.meta.inStock) {
				total += r.price;
				console.log('run');
				mock1();
			} else {
				total += r.quantity;
				mock2();
			}
		});

		expect(mock1).toHaveBeenCalledTimes(0);
		expect(mock2).toHaveBeenCalledTimes(1);
		expect(total).toBe(2);

		r.price++;

		expect(mock1).toHaveBeenCalledTimes(0);
		expect(mock2).toHaveBeenCalledTimes(1);
		expect(total).toBe(2);

		r.quantity += 3;

		expect(mock1).toHaveBeenCalledTimes(0);
		expect(mock2).toHaveBeenCalledTimes(2);
		expect(total).toBe(7);

		// now we trigger the `if` branch
		r.meta.inStock = true;

		expect(mock1).toHaveBeenCalledTimes(1);
		expect(mock2).toHaveBeenCalledTimes(2);
		expect(total).toBe(9);

		r.meta.inStock = false;

		expect(mock1).toHaveBeenCalledTimes(1);
		expect(mock2).toHaveBeenCalledTimes(3);
		expect(total).toBe(14);

		r.meta.inStock = true;

		expect(mock1).toHaveBeenCalledTimes(2);
		expect(mock2).toHaveBeenCalledTimes(3);
		expect(total).toBe(16);

		r.price++;
		console.log(total);

		// expect(mock1).toHaveBeenCalledTimes(3);
		// expect(mock2).toHaveBeenCalledTimes(3);
		// expect(total).toBe(19);
	});
});
