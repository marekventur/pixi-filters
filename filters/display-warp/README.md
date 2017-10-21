# DisplayWarpFilter

PixiJS v4 filter to emulate Display warp. Based on https://www.shadertoy.com/view/XsjSzR

Works great in combination with CrtLottes filter

Demo: See https://marekventur.github.io/pixi-filters/examples

## Installation

```bash
npm install pixi-filter-display-warp
```

## Usage

```js
import {DisplayWarpFilter} from 'pixi-filter-display-warp';

const container = new PIXI.Container();
container.filters = [new DisplayWarpFilter()];
```

## Documentation

See https://marekventur.github.io/pixi-filters/docs
