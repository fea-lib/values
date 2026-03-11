# Implementation Instructions: `@fea-lib/values`

## Purpose

A zero-dependency TypeScript copy-paste library of typed, unit-aware scalar value
objects. Every value carries its numeric magnitude and a unit key, and exposes
arithmetic methods (`.add`, `.sub`, `.mul`, `.div`, `.as`) as well as a clean
`toString()` for display. No build step, no npm publish required — users own the
code after copying it in.

## Repository layout

```
/
├── src/
│   ├── index.ts       ← public barrel: re-exports all categories + top-level isMeasure
│   ├── core.ts        ← measure() factory, MeasureDisplay type, dispatch hooks
│   ├── length.ts      ← length unit constructors, types, converters, isLength
│   ├── angle.ts       ← angle unit constructors, types, converters, isAngle
│   ├── area.ts        ← area unit constructors (incl. overloads), types, converters, isArea
│   ├── volume.ts      ← volume unit constructors (incl. overloads), types, converters, isVolume
│   └── money.ts       ← eur() constructor, Euros type, isMoney
├── __tests__/
│   ├── length.test.ts
│   ├── angle.test.ts
│   ├── area.test.ts
│   ├── volume.test.ts
│   └── money.test.ts
├── package.json
├── dependencies.json
├── install.sh
├── tsconfig.json
└── README.md
```

---

## `package.json`

```json
{
  "name": "@fea-lib/values",
  "version": "1.0.0",
  "description": "Typed, unit-aware scalar value objects with arithmetic and conversion. Zero dependencies.",
  "type": "module",
  "main": "src/index.ts"
}
```

## `dependencies.json`

This library has no peer dependencies. The file may be omitted, or included as:

```json
{
  "peerLibraries": []
}
```

---

## `install.sh`

The script clones this repo into the target directory, then recursively installs
any peer libraries declared in `dependencies.json`. It also prints the
`tsconfig.json` `paths` entry the user needs to add.

```bash
#!/usr/bin/env bash
# Usage: ./install.sh <target-dir>
#
# Installs @fea-lib/values into <target-dir>/@fea-lib/values/
# and recursively installs declared peer libraries.
#
# Example:
#   ./install.sh ./src/libs
#
# After running, add to your tsconfig.json:
#   "paths": {
#     "@fea-lib/values": ["<target-dir>/@fea-lib/values/src/index.ts"]
#   }

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:?Usage: ./install.sh <target-dir>}"

# Read library name from package.json
NAME=$(node -e "process.stdout.write(require('$SCRIPT_DIR/package.json').name)")
INSTALL_PATH="$TARGET_DIR/$NAME"

echo "Installing $NAME into $INSTALL_PATH ..."

# Clone repo into target (shallow, no history)
REPO_URL="https://github.com/fea-lib/values"
TMP=$(mktemp -d)
git clone --depth=1 "$REPO_URL" "$TMP/repo" --quiet
mkdir -p "$INSTALL_PATH"
rsync -a --exclude="install.sh" --exclude=".git" "$TMP/repo/" "$INSTALL_PATH/"
rm -rf "$TMP"

# Recursively install peer libraries
DEPS_FILE="$INSTALL_PATH/dependencies.json"
if [ -f "$DEPS_FILE" ]; then
  PEER_COUNT=$(node -e "
    const d = require('$DEPS_FILE');
    process.stdout.write(String((d.peerLibraries || []).length));
  ")
  for i in $(seq 0 $((PEER_COUNT - 1))); do
    PEER_INSTALL_SH=$(node -e "
      const d = require('$DEPS_FILE');
      const p = d.peerLibraries[$i];
      process.stdout.write(p.repo + '/raw/main/install.sh');
    ")
    PEER_TMP=$(mktemp)
    curl -fsSL "$PEER_INSTALL_SH" -o "$PEER_TMP"
    bash "$PEER_TMP" "$TARGET_DIR"
    rm "$PEER_TMP"
  done
fi

echo ""
echo "Done. Add the following to your tsconfig.json compilerOptions.paths:"
echo "  \"$NAME\": [\"$INSTALL_PATH/src/index.ts\"]"
```

---

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src", "__tests__"]
}
```

---

## `src/core.ts`

The internal factory function used by every category file. Never imported by
consumers directly — all public exports come through the category files.

```ts
// ---------------------------------------------------------------------------
// core.ts — internal measure() factory
//
// Builds a tagged value object for any unit string.
// Each object exposes five methods:
//   .as(targetUnit)  — convert to a different unit of the same dimension
//   .add(other)      — add a compatible measure or plain number (same unit)
//   .sub(other)      — subtract a compatible measure or plain number
//   .mul(factor)     — multiply by a plain number
//   .div(divisor)    — divide by a plain number
//
// All methods resolve their implementations at call-time via the module-level
// hooks defined after the converter functions, so the factory itself can be
// declared before those functions exist.
// ---------------------------------------------------------------------------

export type RawOther = { value: number; unit: string } | number;

// Dispatch hooks — filled in by each category file after its converters are defined.
// Each hook is a module-level let so category files can overwrite the default.
export let _asImpl: (
  self: { value: number; unit: string },
  targetUnit: string,
) => { value: number; unit: string } = () => {
  throw new Error("_asImpl not yet initialised");
};

export let _addImpl: (
  a: { value: number; unit: string },
  b: RawOther,
) => { value: number; unit: string } = () => {
  throw new Error("_addImpl not yet initialised");
};

export let _subImpl: (
  a: { value: number; unit: string },
  b: RawOther,
) => { value: number; unit: string } = () => {
  throw new Error("_subImpl not yet initialised");
};

export let _mulImpl: (
  a: { value: number; unit: string },
  factor: number,
) => { value: number; unit: string } = () => {
  throw new Error("_mulImpl not yet initialised");
};

export let _divImpl: (
  a: { value: number; unit: string },
  divisor: number,
) => { value: number; unit: string } = () => {
  throw new Error("_divImpl not yet initialised");
};

/**
 * Internal factory. Each category file calls this to produce its constructors.
 *
 * @param unit         - canonical unit key, e.g. "mm", "inch", "deg", "EUR", "m2", "cm3"
 * @param unitToPrint  - optional display string used in toString().
 *                       When omitted, `unit` is used as-is.
 *                       Include leading space if desired, e.g. " mm", " ft".
 *                       For symbols with no space use the symbol directly, e.g. "°", '"'.
 */
export const measure =
  <U extends string>(unit: U, unitToPrint?: string) =>
  (value: number) => {
    const display = unitToPrint ?? unit;
    const self = {
      value,
      unit,
      toString: () => `${value}${display}`,
      as<V extends string>(targetUnit: V) {
        return _asImpl(self as never, targetUnit as never) as never;
      },
      add(other: { value: number; unit: string } | number) {
        return _addImpl(self as never, other as never) as never;
      },
      sub(other: { value: number; unit: string } | number) {
        return _subImpl(self as never, other as never) as never;
      },
      mul(factor: number) {
        return _mulImpl(self as never, factor) as never;
      },
      div(divisor: number) {
        return _divImpl(self as never, divisor) as never;
      },
    };
    return self as never;
  };
```

**Key design point:** `unit` stores only the clean identifier (e.g. `"mm"`, not
`" mm"`). All `switch` statements in converter functions use these clean keys.
`unitToPrint` is purely for `toString()` and is never stored on the object.

---

## `src/length.ts`

Migrate directly from the existing `apps/docs/src/@jscad/builder/measure.ts`.

**Changes from the existing file:**
- Remove all angle-related code (moves to `angle.ts`)
- Update unit strings: remove space prefix from the `measure()` call's first
  argument; pass the display string as `unitToPrint`
- Update all `switch (value.unit)` cases to use clean keys (e.g. `"mm"` not
  `" mm"`, `"inch"` not `'"'`)
- Remove the `_asImpl` / `_addImpl` / etc. hook declarations (they now live in
  `core.ts`); import them instead
- Keep all exports: constructors, types, union types, converters, `isLength`,
  `add`, `sub`, `mul`, `div`, `convertTo`, `formatMeasure`, deprecated aliases

**Unit key table for length:**

| Constructor | `unit` key | `unitToPrint` | `toString()` example |
|---|---|---|---|
| `μm(10)` | `"μm"` | `" μm"` | `"10 μm"` |
| `mm(10)` | `"mm"` | `" mm"` | `"10 mm"` |
| `cm(5)` | `"cm"` | `" cm"` | `"5 cm"` |
| `m(1)` | `"m"` | `" m"` | `"1 m"` |
| `km(2)` | `"km"` | `" km"` | `"2 km"` |
| `inch(6)` | `"inch"` | `'"'` | `'6"'` |
| `ft(3)` | `"ft"` | `" ft"` | `"3 ft"` |
| `yd(2)` | `"yd"` | `" yd"` | `"2 yd"` |
| `mile(1)` | `"mile"` | `" mi"` | `"1 mi"` |

**`Unit` type** (used by `jscad-builder`'s `createBuilder`):
```ts
export type Unit = "μm" | "mm" | "cm" | "m" | "km" | "inch" | "ft" | "yd" | "mile";
```

The `Unit` type values now match the clean unit keys exactly (previously they
did not: `"inch"` was already correct but the internal unit string was `'"'`).

**`isLength` set** — update to clean keys:
```ts
const LENGTH_UNITS = new Set(["μm", "mm", "cm", "m", "km", "inch", "ft", "yd", "mile"]);
```

**Converter switch cases** — all `case " mm":` become `case "mm":`,
`case '"':` becomes `case "inch":`, etc.

**Wire-up section** (`_asImpl`, `_addImpl`, etc.) — import the hooks from
`core.ts` and assign them at the bottom of the file, same pattern as the
existing `measure.ts`.

---

## `src/angle.ts`

Extract the angle section from the existing `measure.ts`.

**Unit key table:**

| Constructor | `unit` key | `unitToPrint` | `toString()` example |
|---|---|---|---|
| `deg(90)` | `"deg"` | `"°"` | `"90°"` |
| `rad(1.57)` | `"rad"` | `" rad"` | `"1.57 rad"` |

**Exports:**
- `deg`, `rad` constructors
- `Degrees`, `Radians` types
- `Angle` type: `number | Degrees | Radians` (plain number = raw radians, JSCAD convention)
- `isAngle(v): v is Degrees | Radians`
- `toRad(v: Degrees | Radians): Radians`
- `toDeg(v: Degrees | Radians): Degrees`

**`ANGLE_UNITS` set:**
```ts
const ANGLE_UNITS = new Set(["deg", "rad"]);
```

**`_addImpl` and `_subImpl`** for angles: same logic as existing `measure.ts`
but using `toRad` instead of the inline dispatch — normalise both operands to
radians, sum, convert back to the source unit.

---

## `src/area.ts`

New file. No equivalent exists in the codebase.

**Unit key table:**

| Constructor | `unit` key | `unitToPrint` |
|---|---|---|
| `mm2(n)` | `"mm2"` | `" mm²"` |
| `cm2(n)` | `"cm2"` | `" cm²"` |
| `m2(n)` | `"m2"` | `" m²"` |
| `km2(n)` | `"km2"` | `" km²"` |
| `in2(n)` | `"in2"` | `" in²"` |
| `ft2(n)` | `"ft2"` | `" ft²"` |
| `yd2(n)` | `"yd2"` | `" yd²"` |
| `acre(n)` | `"acre"` | `" acre"` |
| `ha(n)` | `"ha"` | `" ha"` |

**Conversion anchor:** `m²` (square meters). All converters go through `m²`.

**Conversion factors (to m²):**
```
1 mm²  = 0.000_001 m²
1 cm²  = 0.000_1 m²
1 km²  = 1_000_000 m²
1 in²  = 0.000_645_16 m²
1 ft²  = 0.092_903_04 m²
1 yd²  = 0.836_127_36 m²
1 acre = 4_046.856_422_4 m²
1 ha   = 10_000 m²
```

**Overloaded constructors** — each area constructor accepts either a literal
number or two `Length` values (converted to meters first, then multiplied):

```ts
export function m2(n: number): SquareMeters;
export function m2(a: Length, b: Length): SquareMeters;
export function m2(a: number | Length, b?: Length): SquareMeters {
  if (typeof a === "number") return _m2(a);
  // convert both lengths to meters, multiply
  const result = toM(a).value * toM(b!).value;
  return _m2(result);
}
```

Apply the same overload pattern to all area constructors, converting to the
target unit after computing the product in `m²`.

**Exports:**
- All constructors (simple and overloaded)
- `SquareMillimeters`, `SquareCentimeters`, `SquareMeters`, `SquareKilometers`,
  `SquareInches`, `SquareFeet`, `SquareYards`, `Acres`, `Hectares` types
- `Area` union type
- `isArea(v): v is Area`
- `toMm2`, `toCm2`, `toM2`, `toKm2`, `toIn2`, `toFt2`, `toYd2`, `toAcre`,
  `toHa` converters
- Standalone `add`, `sub`, `mul`, `div` overloaded for `Area`

**`AREA_UNITS` set:**
```ts
const AREA_UNITS = new Set(["mm2", "cm2", "m2", "km2", "in2", "ft2", "yd2", "acre", "ha"]);
```

**Arithmetic:** both operands must be `Area`. Normalise to `m²`, operate, convert
back to the source unit. Plain numbers are treated as the same unit as `a`.

---

## `src/volume.ts`

New file. Extends the `l` and `calculateVolume` from `pocs/values.ts`.

**Unit key table:**

| Constructor | `unit` key | `unitToPrint` |
|---|---|---|
| `μl(n)` | `"μl"` | `" μl"` |
| `ml(n)` | `"ml"` | `" ml"` |
| `cl(n)` | `"cl"` | `" cl"` |
| `dl(n)` | `"dl"` | `" dl"` |
| `l(n)` | `"l"` | `" l"` |
| `cm3(n)` | `"cm3"` | `" cm³"` |
| `m3(n)` | `"m3"` | `" m³"` |
| `in3(n)` | `"in3"` | `" in³"` |
| `ft3(n)` | `"ft3"` | `" ft³"` |
| `floz(n)` | `"floz"` | `" fl oz"` |
| `pint(n)` | `"pint"` | `" pint"` |
| `qt(n)` | `"qt"` | `" qt"` |
| `gal(n)` | `"gal"` | `" gal"` |

**Conversion anchor:** `m³` (cubic meters). All converters go through `m³`.

**Conversion factors (to m³):**
```
1 μl   = 0.000_000_001 m³
1 ml   = 0.000_001 m³
1 cl   = 0.000_01 m³
1 dl   = 0.000_1 m³
1 l    = 0.001 m³
1 cm³  = 0.000_001 m³
1 in³  = 0.000_016_387_064 m³
1 ft³  = 0.028_316_846_592 m³
1 fl oz (US) = 0.000_029_573_529_6 m³
1 pint (US)  = 0.000_473_176_473 m³
1 qt (US)    = 0.000_946_352_946 m³
1 gal (US)   = 0.003_785_411_784 m³
```

**Overloaded constructors** — three signatures, applied to every volume
constructor:

```ts
// 1. Literal value
export function l(n: number): Liters;
// 2. Computed from three lengths (replaces calculateVolume)
export function l(a: Length, b: Length, c: Length): Liters;
// 3. Converted from any existing volume
export function l(v: Volume): Liters;

export function l(
  a: number | Length | Volume,
  b?: Length,
  c?: Length,
): Liters {
  if (typeof a === "number") return _l(a);
  if (isVolume(a)) return toL(a);
  // three lengths: convert all to meters, multiply, convert m³ to l
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return _l(m3val * 1000); // 1 m³ = 1000 l
}
```

Apply the same three-overload pattern to all volume constructors, computing
the result in `m³` first then converting to the target unit.

**Exports:**
- All constructors (three-overloaded)
- `Microliters`, `Milliliters`, `Centiliters`, `Deciliters`, `Liters`,
  `CubicCentimeters`, `CubicMeters`, `CubicInches`, `CubicFeet`,
  `FluidOunces`, `Pints`, `Quarts`, `Gallons` types
- `Volume` union type
- `isVolume(v): v is Volume`
- `toμl`, `toMl`, `toCl`, `toDl`, `toL`, `toCm3`, `toM3`, `toIn3`, `toFt3`,
  `toFloz`, `toPint`, `toQt`, `toGal` converters
- Standalone `add`, `sub`, `mul`, `div` overloaded for `Volume`

**`VOLUME_UNITS` set:**
```ts
const VOLUME_UNITS = new Set([
  "μl", "ml", "cl", "dl", "l",
  "cm3", "m3", "in3", "ft3",
  "floz", "pint", "qt", "gal",
]);
```

---

## `src/money.ts`

Simple category. Only EUR for v1. No `.as()` across currencies (no exchange
rates). All other arithmetic methods work normally within the same currency.

**Unit key table:**

| Constructor | `unit` key | `unitToPrint` |
|---|---|---|
| `eur(n)` | `"EUR"` | `" EUR"` |

**Exports:**
- `eur` constructor
- `Euros` type
- `Money` type: `Euros` (union, extensible when more currencies are added)
- `isMoney(v): v is Money`

**`.as()` behaviour:** throw `TypeError` with message
`"as: currency conversion requires an exchange rate — use a dedicated conversion function"`.

---

## `src/index.ts`

```ts
export * from "./length";
export * from "./angle";
export * from "./area";
export * from "./volume";
export * from "./money";

import { isLength } from "./length";
import { isAngle } from "./angle";
import { isArea } from "./area";
import { isVolume } from "./volume";
import { isMoney } from "./money";
import type { Length } from "./length";
import type { Degrees, Radians } from "./angle";
import type { Area } from "./area";
import type { Volume } from "./volume";
import type { Money } from "./money";

/** Union of all tagged measure types across all categories. */
export type Measure = Length | Degrees | Radians | Area | Volume | Money;

/** Returns true if `v` is any tagged measure object (any category, any unit). */
export function isMeasure(v: unknown): v is Measure {
  return isLength(v) || isAngle(v) || isArea(v) || isVolume(v) || isMoney(v);
}
```

---

## Tests

Each `__tests__/*.test.ts` file should cover:

1. **Construction** — each constructor produces `{ value, unit }` with the
   correct clean key
2. **`toString()`** — each value prints with the correct `unitToPrint` string,
   including spaces and symbols
3. **`.as()`** — roundtrip conversions within the same dimension
4. **`.add()` / `.sub()`** — same-unit and cross-unit arithmetic, result in
   source unit
5. **`.mul()` / `.div()`** — scalar multiplication and division, including
   divide-by-zero guard
6. **Type guard** (`isLength`, `isAngle`, etc.) — true for in-category values,
   false for other categories and plain values
7. **Overloaded constructors** (area and volume) — computed from lengths,
   converted from existing values
8. **`isMeasure`** (in `index` test) — true for all categories

Use `vitest`. Mirror the structure of the existing
`apps/docs/src/@jscad/builder/__tests__/measure.test.ts` for style reference.

---

## Implementation order

1. `src/core.ts`
2. `src/length.ts` (migrate from existing `measure.ts`, update unit keys)
3. `src/angle.ts` (extract from existing `measure.ts`, update unit keys)
4. `src/area.ts` (new)
5. `src/volume.ts` (new)
6. `src/money.ts` (new)
7. `src/index.ts`
8. `__tests__/length.test.ts` (migrate from existing `measure.test.ts`)
9. `__tests__/angle.test.ts`
10. `__tests__/area.test.ts`
11. `__tests__/volume.test.ts`
12. `__tests__/money.test.ts`
13. `install.sh`
14. `README.md`

Run `vitest run` after each category file + its test file.

---

## README structure

```
# @fea-lib/values

Typed, unit-aware scalar values for TypeScript. Zero dependencies. You own the code.

## What's included
## Install
## Add to tsconfig.json
## Usage
  ### Length
  ### Angle
  ### Area
  ### Volume
  ### Money
  ### Arithmetic methods
  ### Type guards
## Design notes
```
