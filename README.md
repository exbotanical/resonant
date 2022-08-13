# resonant

[![Coverage Status](https://coveralls.io/repos/github/exbotanical/resonant/badge.svg?branch=master)](https://coveralls.io/github/exbotanical/resonant?branch=master)
[![Continuous Deployment](https://github.com/exbotanical/resonant/actions/workflows/cd.yml/badge.svg)](https://github.com/exbotanical/resonant/actions/workflows/cd.yml)
[![Continuous Integration](https://github.com/exbotanical/resonant/actions/workflows/ci.yml/badge.svg)](https://github.com/exbotanical/resonant/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/resonant.svg)](https://badge.fury.io/js/resonant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Reactive effects with automatic dependency management, caching, and leak-free finalization.

## Table of Contents

- [Install](#install)
  - [Supported Environments](#support)
- [Documentation](#docs)
  - [Creating an Effect](#docs_effect)
  - [Starting and Stopping an Effect](#docs_control)
  - [Deferred Effects](#docs_defer)

## <a name="install"></a> Installation

```bash
npm install resonant
```

### <a name="support"></a>  Supported Environments

`resonant` currently supports UMD, CommonJS (node versions >= 10), and ESM build-targets

Commonjs:

```js
const { resonant, effect } = require('resonant');
```

ESM:

```js
import { resonant, effect } from 'resonant';
```

## <a name="docs"></a> Documentation

Inspired by React's `useEffect` and Vue's `watchEffect`, `resonant` is a compact utility library that mitigates the overhead of managing observable data, such as dependency tracking; caching and cache invalidation; and object dereferencing and finalization.

In `resonant`, an effect is a computation that is automatically invoked any time its reactive state changes. An effect's reactive state is any state that is accessed inside the effect body (specifically, the function passed to the `effect` initializer). A deterministic heuristic follows that any data access that triggers getters will be visible to and therefore tracked by the effect.

This reactive state 'resonates', hence `resonant`.

###  <a name="docs_effect"></a> Creating an Effect

To create an effect, you must first make the target object (the effect state) reactive with the `resonant` function:

```ts
import { resonant } from 'resonant';

const plainObject = {
  x: 1,
  y: 1
};

const r = resonant(plainObject);
```

`r` is now equipped with deep reactivity. All getters / setters will trigger any effects that happen to be observing the data.

Let's create an effect:

```ts
import { resonant, effect } from 'resonant';

const plainObject = {
  x: 1,
  y: 1
};

const r = resonant(plainObject);

let count = 0;

effect(() => {
  count += r.x + r.y;
});
```

The effect will be invoked immediately. Next, the effect is cached and tracks `r` as a reactive dependency. Any time `r.x` or `r.y` is mutated, the effect will run.

This paradigm works with branching and nested conditionals; if the effect encounters new properties by way of conditional logic, it tracks them as dependencies.

```ts
const r = resonant({
  x: {
    y: {
      z: 1
    }
  }
});

effect(() => {
  if (r.x.y.k) {
    if (r.x.y.z > 1) {
      computation();
    }
  }
});

// the outer condition evaluates to `false`
// the effect doesn't need to know about `r.x.y.z` yet - we'll track it only when necessary

r.x.y.k = 1;
// now, the outer condition evaluates to `true`
// the effect will see the second condition and begin tracking `r.x.y.z`
```

Effect dependencies are tracked lazily; the effect only ever cares about resonant data that it can see.

`resonant` uses weak references; deleted properties to which there are no references will be finalized so they may be garbage collected, as will all of that property's dependencies and effects.

###  <a name="docs_control"></a> Starting and Stopping an Effect

To control an effect, each effect initializer returns unique `stop`, `start`, and `toggle` handlers. These functions are used to pause, resume, or toggle the effect's active state.

Use `stop` to pause an effect. The effect will not run during this period. Stopping an effect flushes its dependency cache, so subsequent `start` or `toggle` calls are akin to creating the effect anew.

```ts
import { resonant, effect } from 'resonant';

const r = resonant({ x: 1 });

let c = 0;
const { stop } = effect(() => {
  c += r.x;
});

// initial run - `c` == 1

r.x++;

// trigger - `c` == 3

stop();

r.x++;

// `c` == 3
```

Use `start` to transition the effect to an active state. `start` is idempotent; if the effect is already active, invoking `start` will *not* immediately trigger the effect. Otherwise, `start` - like instantiating a new effect - will run the effect immediately.

```ts
import { resonant, effect } from 'resonant';

const r = resonant({ x: 1 });
let c = 0;

const { stop, start } = effect(() => {
  c += r.x;
});
// initial run - r.x == 1, c == 1

r.x++;
// r.x == 2, c == 3

stop();

r.x++;
// r.x == 3, c == 3

start();
// initial run - r.x == 3, c == 6

r.x++;
// r.x == 4, c == 7
```

Use `toggle` to toggle the effect's active state. Toggle invokes the appropriate `start` or `stop` handler and returns a boolean indicating whether the effect's state is active.

```ts
import { resonant, effect } from 'resonant';

const r = resonant({ x: 1 });
let c = 0;
let isActive = true;

const { toggle } = effect(() => {
  c += r.x;
});
// initial run - r.x == 1, c == 1

r.x++;
// r.x == 2, c == 3

isActive = toggle();
// isActive == false

r.x++;
// r.x == 3, c == 3

isActive = toggle();
// isActive == true
// initial run - r.x == 3, c == 6

r.x++;
// r.x == 4, c == 7
```

###  <a name="docs_defer"></a> Deferred Effects

Effects may be initialized lazily with the `lazy` option. Passing this optional flag to the `effect` initializer will initialize the effect in an inactive state. The effect will *not* run immediately; either the effect's `start` or `toggle` handler *must be invoked before the effect can trigger*.

```ts
import { resonant, effect } from 'resonant';

const r = resonant({ x: 1 });
let c = 0;

const { start } = effect(() => {
  c += r.x;
}, { lazy: true });
// no initial run - r.x == 1, c == 0

r.x++;
// r.x == 2, c == 0

start();

r.x++;
// r.x == 3, c == 3
```

Full documentation and type signatures can be found [here](https://exbotanical.github.io/resonant/resonant.html)
