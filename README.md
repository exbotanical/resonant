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

To create an effect, you must first make the target object reactive with the `resonant` function:

```ts
import { resonant } from 'resonant';

const plainObject = {
  x: 1,
  y: 1
};

const r = resonant(plainObject);
```

Now, `r` is equipped with deep reactivity. All get / set operations will trigger any dependencies (i.e. effects) that happen to be observing the data.

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

The effect will run immediately. It has now been cached and will execute whenever its properties change. `resonant` also uses weak references; deleted properties to which there are no references will be finalized so they may be garbage collected, as will all of that property's dependencies and effects.

Full documentation can be found [here](https://matthewzito.github.io/resonant/resonant.html)
