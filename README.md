# resonant

[![Coverage Status](https://coveralls.io/repos/github/MatthewZito/resonant/badge.svg?branch=master)](https://coveralls.io/github/MatthewZito/resonant?branch=master)
[![Continuous Deployment](https://github.com/MatthewZito/resonant/actions/workflows/cd.yml/badge.svg)](https://github.com/MatthewZito/resonant/actions/workflows/cd.yml)
[![Continuous Integration](https://github.com/MatthewZito/resonant/actions/workflows/ci.yml/badge.svg)](https://github.com/MatthewZito/resonant/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/resonant.svg)](https://badge.fury.io/js/resonant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Reactive effects with automatic dependency management, caching, and leak-free finalization.

## Table of Contents

- [Install](#install)
  - [Supported Environments](#support)
- [Documentation](#docs)


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

Inspired by React's `useEffect` and Vue's `watchEffect`, `resonant` is a compact utility library that mitigates the inherent burdens of managing observable data, including dependency tracking; caching and cache invalidation; and object dereferencing and finalization.

In `resonant`, an effect is a computation that is automatically invoked any time its reactive state changes.

To create an effect, you must first make the target object (the effect state) reactive with the `resonant` function:

```ts
import { resonant } from 'resonant';

const plainObject = {
  x: 1,
  y: 1
};

const r = resonant(plainObject);
```

Now, `r` is equipped with deep reactivity. All get / set operations will trigger any effects that happen to be observing the data.

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

The effect will be invoked immediately. Next, the effect is cached and tracks `r` as a reactive dependency. Any time `r.x` or `r.y` change, the effect will run.

This works with branching and nested conditionals; if the effect encounters new properties by way of conditional logic, it tracks them as dependencies.

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

`resonant` uses weak references; deleted properties to which there are no references will be finalized so they may be garbage collected, as will all of that property's dependencies and effects. Finally, to nullify a resonant object's reactivity, use the `revokes` store:

```ts
import { resonant, effect, revokes } from 'resonant';

const r = resonant({...});

effect(() => {
  ...
});

const revoke = revokes.get(r);

revoke();
```

Full documentation can be found [here](https://matthewzito.github.io/resonant/resonant.html)
