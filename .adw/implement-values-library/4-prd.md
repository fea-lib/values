# PRD: implement-values-library

## Goal

Deliver a complete, tested `@fea-lib/values` TypeScript library in `/Users/tobiasbelch/fea/lib/values/` that provides typed, unit-aware scalar value objects for length, angle, area, volume, and money. Every value object carries a clean canonical unit key (no space prefix), a numeric magnitude, arithmetic methods (`.add`, `.sub`, `.mul`, `.div`, `.as`), and a `toString()` that renders with the appropriate display string. `vitest run` must pass with zero failures across all five test files.

## End state

- `src/core.ts`, `src/length.ts`, `src/angle.ts`, `src/area.ts`, `src/volume.ts`, `src/money.ts`, `src/index.ts` all exist and compile cleanly under the spec `tsconfig.json`.
- `__tests__/length.test.ts`, `angle.test.ts`, `area.test.ts`, `volume.test.ts`, `money.test.ts` all exist.
- `npx vitest run` from `lib/values/` exits 0 with all tests passing.
- `package.json`, `tsconfig.json`, `dependencies.json`, `install.sh`, `README.md` all exist with the correct content.
- The dispatch hook architecture resolves cleanly: `.as()`, `.add()`, `.sub()`, `.mul()`, `.div()` work correctly on values from every category.

## Acceptance criteria

- AC-01: `mm(10).unit === "mm"` — unit key is the clean identifier, no space prefix.
- AC-02: `mm(10).toString() === "10 mm"` — toString uses the display string with leading space.
- AC-03: `inch(6).unit === "inch"` and `inch(6).toString() === '6"'`.
- AC-04: `deg(90).unit === "deg"` and `deg(90).toString() === "90°"`.
- AC-05: `rad(1).unit === "rad"` and `rad(1).toString() === "1 rad"`.
- AC-06: `mm(25.4).as("inch").value` is within floating-point tolerance of `1`.
- AC-07: `mm(10).add(cm(1)).value === 20` (cross-unit add, result in source unit mm).
- AC-08: `deg(90).add(rad(Math.PI / 2)).value` is within tolerance of `180` (result in deg).
- AC-09: `m2(2).as("ft2").value` is within tolerance of `21.527...` (m² → ft²).
- AC-10: `m2(mm(1000), mm(2000)).value === 2` (area from two lengths).
- AC-11: `l(m(1), m(1), m(1)).value === 1000` (volume from three lengths = 1 m³ = 1000 l).
- AC-12: `l(m3(0.001)).value === 1` (volume conversion overload).
- AC-13: `eur(9.99).toString() === "9.99 EUR"`.
- AC-14: `() => eur(1).as("USD")` throws `TypeError` with the specified message.
- AC-15: `isLength(mm(1)) === true`, `isLength(deg(1)) === false`, `isLength(42) === false`.
- AC-16: `isAngle(deg(1)) === true`, `isAngle(mm(1)) === false`.
- AC-17: `isArea(m2(1)) === true`, `isArea(mm(1)) === false`.
- AC-18: `isVolume(l(1)) === true`, `isVolume(m2(1)) === false`.
- AC-19: `isMoney(eur(1)) === true`, `isMoney(mm(1)) === false`.
- AC-20: `isMeasure(mm(1)) === true`, `isMeasure(eur(1)) === true`, `isMeasure(42) === false`.
- AC-21: `mm(10).mul(3).value === 30`, `mm(10).div(2).value === 5`.
- AC-22: `() => mm(10).div(0)` throws `RangeError`.
- AC-23: `Unit` type equals `"μm" | "mm" | "cm" | "m" | "km" | "inch" | "ft" | "yd" | "mile"`.
- AC-24: `npx vitest run` exits 0 with all tests passing in the `lib/values/` repo.

## Out of scope

- Publishing to npm — this is a copy-paste library; no publish step.
- Currency conversion (`.as()` across currencies) — v1 EUR only, `.as()` throws.
- Additional currencies beyond EUR.
- Any modification to `apps/docs/src/@jscad/builder/measure.ts` — the old file is left unchanged.
- Temperature, mass, time, or any units beyond the five categories specified.
- A build/compile step (no `tsc --outDir`; the library is used via `tsconfig.json` path aliases to source TypeScript).
- Browser/browser-compatible bundle.
