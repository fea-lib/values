# @fea-lib/values

Typed, unit-aware scalar values for TypeScript. Zero dependencies. You own the code.

## What's included

| Category | Units |
|----------|-------|
| **Length** | μm, mm, cm, m, km, inch, ft, yd, mile |
| **Angle** | deg, rad |
| **Area** | mm², cm², m², km², in², ft², yd², acre, ha |
| **Volume** | μl, ml, cl, dl, l, cm³, m³, in³, ft³, fl oz, pint, qt, gal |
| **Money** | EUR |

Every value is a plain object `{ value: number; unit: string }` with five methods:
`.as()`, `.add()`, `.sub()`, `.mul()`, `.div()`, and `toString()`.

## Install

```bash
./install.sh ./src/libs
```

This copies the source files into `./src/libs/@fea-lib/values/`. No npm publish needed.

## Add to tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@fea-lib/values": ["./src/libs/@fea-lib/values/src/index.ts"]
    }
  }
}
```

## Usage

### Length

```ts
import { mm, cm, m, toMm, toCm, toM } from "@fea-lib/values";

const width = cm(42);           // { value: 42, unit: "cm" }
width.toString();               // "42 cm"

const inMm = toMm(width);      // { value: 420, unit: "mm" }
const also = width.as("mm");   // same as toMm(width)

// Arithmetic — result kept in the left operand's unit
width.add(cm(8));               // 50 cm
width.add(mm(10));              // 43 cm  (auto-converts mm → cm)
width.mul(2);                   // 84 cm
width.div(2);                   // 21 cm
```

### Angle

```ts
import { deg, rad, toDeg, toRad } from "@fea-lib/values";

const angle = deg(90);
angle.as("rad");                // ≈ 1.5708 rad
toRad(deg(180)).value;          // ≈ Math.PI
```

### Area

```ts
import { m2, cm2, toM2, m, cm } from "@fea-lib/values";

// From a plain number
const floor = m2(24);

// From two lengths (product)
const wall = m2(m(3), m(4));   // 12 m²
const tile = cm2(cm(20), cm(20)); // 400 cm²

// Convert
floor.as("cm2");               // 240 000 cm²
```

### Volume

```ts
import { l, ml, m3, toL, toMl, m, cm } from "@fea-lib/values";

// From a plain number
const bottle = ml(500);

// From three lengths
const box = m3(m(2), m(3), m(4));  // 24 m³
const cup = ml(cm(7), cm(7), cm(9));

// From an existing volume
const inLitres = l(ml(500));   // 0.5 l

// Convert
bottle.as("l");                // 0.5 l
toL(m3(1));                    // 1000 l
```

### Money

```ts
import { eur } from "@fea-lib/values";

const price = eur(9.99);
price.toString();              // "9.99 EUR"

price.add(eur(0.01));          // 10 EUR
price.mul(2);                  // 19.98 EUR

// .as() always throws — currency conversion needs an exchange rate
price.as("USD");               // TypeError
```

### Arithmetic methods

All measure types expose the same four arithmetic methods:

| Method | Signature | Notes |
|--------|-----------|-------|
| `.add(other)` | `Measure \| number` | Cross-unit: converts `other` to anchor first |
| `.sub(other)` | `Measure \| number` | Same as add |
| `.mul(factor)` | `number` | Scales the value, keeps the unit |
| `.div(divisor)` | `number` | Scales the value; throws `RangeError` on zero |

Standalone functions `add`, `sub`, `mul`, `div` are also exported from each category module
(`length.js`, `angle.js`, `area.js`, `volume.js`, `money.js`).

### Type guards

```ts
import { isLength, isAngle, isArea, isVolume, isMoney, isMeasure } from "@fea-lib/values";

isLength(mm(5));    // true
isLength(deg(90));  // false
isMeasure(eur(10)); // true — any category
```

## Design notes

- **No build step.** The library ships as TypeScript source. You reference it via `paths` in `tsconfig.json`.
- **Hooks pattern.** `core.ts` exposes a `hooks` object. Each category file overwrites the relevant hook so the base `.add/.sub/.mul/.div/.as` methods dispatch correctly even before `index.ts` is imported. `index.ts` replaces all hooks with a composed multi-category implementation.
- **Anchor-based conversion.** Each category has a single anchor unit (length → mm, angle → rad, area → m², volume → m³). All conversions go through the anchor to keep the conversion table small.
- **Clean unit keys.** Internal `unit` strings are plain identifiers (`"mm"`, `"inch"`, `"deg"`, `"cm3"`). Display strings (with spaces and symbols) live only in `toString()`.
