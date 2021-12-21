import { reactive, effect } from '../src';

const r = reactive({
	a: 1,
	b: 2,
	c: 3
});

const update = () => {
	r.a++;
	r.b++;
	r.c++;
};

describe('run effect', () => {
	// it('runs an effect when initialized, regardless of any dependencies', () => {
	// 	const mock = jest.fn();

	// 	effect(mock);

	// 	expect(mock).toHaveBeenCalledTimes(1);
	// });

	// it('reruns the effect when a reactive property dependency has been mutated', () => {
	// 	const mock = jest.fn(() => {
	// 		r.a;
	// 	});

	// 	effect(mock);

	// 	expect(mock).toHaveBeenCalledTimes(1);

	// 	r.a = 2221;
	// 	expect(mock).toHaveBeenCalledTimes(2);
	// });

	// it('only runs effects which depend on a reactive property', () => {
	// 	const mock = jest.fn(() => {});

	// 	const mock2 = jest.fn(() => {
	// 		r.a;
	// 	});

	// 	const mock3 = jest.fn(() => {
	// 		r.c;
	// 	});

	// 	effect(mock);

	// 	expect(mock).toHaveBeenCalledTimes(1);

	// 	update();

	// 	expect(mock).toHaveBeenCalledTimes(1);

	// 	effect(mock2);

	// 	expect(mock2).toHaveBeenCalledTimes(1);

	// 	update();

	// 	expect(mock).toHaveBeenCalledTimes(1);
	// 	expect(mock2).toHaveBeenCalledTimes(2);

	// 	effect(mock3);

	// 	update();

	// 	expect(mock).toHaveBeenCalledTimes(1);
	// 	expect(mock2).toHaveBeenCalledTimes(3);
	// 	expect(mock3).toHaveBeenCalledTimes(2);
	// });

	// it('runs an effect for each property mutation', () => {
	// 	const mock = jest.fn(() => {
	// 		r.a;
	// 		r.b;
	// 	});

	// 	effect(mock);
	// 	expect(mock).toHaveBeenCalledTimes(1);

	// 	update();
	// 	expect(mock).toHaveBeenCalledTimes(3);
	// });

	// it('mutating the dependency inside the effect does not trigger the effect', () => {
	// 	const mock = jest.fn(() => {
	// 		update();
	// 	});

	// 	effect(mock);
	// 	expect(mock).toHaveBeenCalledTimes(1);

	// 	update();
	// 	expect(mock).toHaveBeenCalledTimes(4);
	// });
	it.todo('');
	// it('triggers effects on nested object mutations', () => {
	// 	const r2 = reactive({
	// 		a: 1,
	// 		b: {
	// 			x: {
	// 				x: 1,
	// 				y: 2
	// 			},
	// 			y: 2
	// 		}
	// 	});

	// 	const mock = jest.fn(() => {
	// 		r2.b.x.y;
	// 	});

	// 	effect(mock);
	// 	expect(mock).toHaveBeenCalledTimes(1);

	// 	r2.b.x.y = 12;
	// 	expect(mock).toHaveBeenCalledTimes(2);
	// });

	// it('tracks and runs multiple effects', () => {
	// 	const r1 = reactive({
	// 		x: 1,
	// 		y: 2,
	// 		z: {
	// 			a: 1,
	// 			b: 2
	// 		}
	// 	});

	// 	const r2 = reactive({
	// 		c: 3,
	// 		d: 4
	// 	});

	// 	const mock1 = jest.fn();
	// 	const mock2 = jest.fn();
	// 	const mock3 = jest.fn(() => {
	// 		t3 += r1.x + r1.y + r2.c + r2.d + r1.z.a + r1.z.b;
	// 	});

	// 	let t1 = 0;
	// 	let t2 = 0;
	// 	let t3 = 0;

	// 	effect(() => {
	// 		t1 += r1.x;
	// 		mock1();
	// 	});

	// 	effect(() => {
	// 		t2 += r2.c + r1.y;
	// 		mock2();
	// 	});

	// 	effect(() => {
	// 		mock3();
	// 	});

	// 	expect(mock1).toHaveBeenCalledTimes(1);
	// 	expect(mock2).toHaveBeenCalledTimes(1);
	// 	expect(mock3).toHaveBeenCalledTimes(1);

	// 	// t1 = 1 (initial effect run)
	// 	// r1.x = 2, t1 = (1 + 2) = 3
	// 	// t2 = 3 (initial effect run)
	// 	r1.x++;
	// 	r2.c += 22;
	// 	r1.x++;
	// 	r1.y += 12;
	// 	r2.d += 2;
	// 	r1.z.a += 12;
	// 	r1.z.b++;

	// 	expect(mock1).toHaveBeenCalledTimes(3);
	// 	expect(mock2).toHaveBeenCalledTimes(3);
	// 	expect(mock3).toHaveBeenCalledTimes(8);

	// 	expect(t1).toEqual(6);
	// 	expect(t2).toEqual(71);
	// 	expect(t3).toEqual(327);
	// });
});
