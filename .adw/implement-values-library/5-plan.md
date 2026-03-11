# Implementation Plan: implement-values-library

## Tickets

### T-01: Project scaffolding
**Description:** Create `package.json` (with `vitest` and `typescript` as devDependencies), `tsconfig.json`, `vitest.config.ts`, and `dependencies.json` in `lib/values/`. Run `npm install`.
**Acceptance criteria:** `npx vitest run` can be invoked without "command not found"; `tsconfig.json` matches spec.
**Blocks:** T-02, T-03, T-04, T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13
**Blocked by:** none

### T-02: `src/core.ts`
**Description:** Create `src/core.ts` with the `measure()` factory, `RawOther` type, and `export let` dispatch hooks (`_asImpl`, `_addImpl`, `_subImpl`, `_mulImpl`, `_divImpl`). The factory takes `unit` (clean key) and optional `unitToPrint` (display string). `toString()` uses `unitToPrint ?? unit`.
**Acceptance criteria:** File compiles; the factory is callable; each dispatch hook throws `"not yet initialised"` by default.
**Blocks:** T-03, T-04, T-05, T-06, T-07
**Blocked by:** T-01

### T-03: `src/length.ts`
**Description:** Migrate from `measure.ts`. Use `measure(unit, unitToPrint)` from `core.ts`. Update all unit keys to clean identifiers (e.g. `"mm"`, `"inch"`, not `" mm"`, `'"'`). Export constructors (`μm`, `mm`, `cm`, `m`, `km`, `inch`, `ft`, `yd`, `mile`), types, `Unit` type, `LENGTH_UNITS` set with clean keys, `isLength`, converters (`toMm`, `toCm`, `toM`, `toKm`, `toμm`, `toInch`, `toFt`, `toYd`, `toMile`) with switch cases using clean keys, standalone `add`/`sub`/`mul`/`div`, `convertTo` (takes `LengthUnitMap` keyed by clean units), `formatMeasure`, deprecated aliases (`isNumberWithUnit`, `formatValueWithUnit`, `NumberWithUnit`, `Inch`). Wire-up section assigns length-only dispatch to `_asImpl`/`_addImpl`/`_subImpl`/`_mulImpl`/`_divImpl` — these will be overridden in T-08 with composed dispatch.
**Acceptance criteria:** AC-01, AC-02, AC-03, AC-06, AC-07, AC-15, AC-21, AC-22, AC-23.
**Blocks:** T-05, T-06, T-08
**Blocked by:** T-02

### T-04: `src/angle.ts`
**Description:** Extract angle code from `measure.ts`. Use clean unit keys `"deg"` and `"rad"`. Export `deg`, `rad` constructors, `Degrees`, `Radians` types, `Angle` type, `ANGLE_UNITS` set, `isAngle`, `toRad`, `toDeg`, standalone `add`/`sub`/`mul`/`div`. Wire-up section: read current `_asImpl`/`_addImpl`/`_subImpl`/`_mulImpl`/`_divImpl` from `core.ts`, wrap them to extend dispatch to angles (call prior impl for non-angle, handle angle natively).
**Acceptance criteria:** AC-04, AC-05, AC-08, AC-16.
**Blocks:** T-08
**Blocked by:** T-02

### T-05: `src/area.ts`
**Description:** New file. Units: `mm2`, `cm2`, `m2`, `km2`, `in2`, `ft2`, `yd2`, `acre`, `ha`. Anchor: `m²`. Conversion factors per spec. Overloaded constructors accept `(n: number)` or `(a: Length, b: Length)` — convert both to meters via `toM` from `length.ts`, multiply, convert back. Export constructors, types, `Area` union, `AREA_UNITS` set, `isArea`, all `to*` converters, standalone `add`/`sub`/`mul`/`div`. Wire-up extends dispatch hooks to cover area.
**Acceptance criteria:** AC-09, AC-10, AC-17.
**Blocks:** T-08
**Blocked by:** T-02, T-03

### T-06: `src/volume.ts`
**Description:** New file. Units: `μl`, `ml`, `cl`, `dl`, `l`, `cm3`, `m3`, `in3`, `ft3`, `floz`, `pint`, `qt`, `gal`. Anchor: `m³`. Conversion factors per spec. Overloaded constructors accept `(n: number)`, `(a: Length, b: Length, c: Length)`, or `(v: Volume)`. Export constructors, types, `Volume` union, `VOLUME_UNITS` set, `isVolume`, all `to*` converters (including `toμl`), standalone `add`/`sub`/`mul`/`div`. Wire-up extends dispatch hooks.
**Acceptance criteria:** AC-11, AC-12, AC-18.
**Blocks:** T-08
**Blocked by:** T-02, T-03

### T-07: `src/money.ts`
**Description:** New file. Unit: `EUR`. Export `eur` constructor, `Euros` type, `Money` union type, `isMoney`. `.as()` throws `TypeError("as: currency conversion requires an exchange rate — use a dedicated conversion function")`. Wire-up extends dispatch hooks; `_asImpl` for money throws, others work normally.
**Acceptance criteria:** AC-13, AC-14, AC-19.
**Blocks:** T-08
**Blocked by:** T-02

### T-08: `src/index.ts` + dispatch hook composition
**Description:** Create `src/index.ts` re-exporting all category files. Also: resolve the dispatch hook collision — `index.ts` is the last file imported, so it rewires `_asImpl`/`_addImpl`/`_subImpl`/`_mulImpl`/`_divImpl` in `core.ts` with composed dispatch that checks each category in turn (length → angle → area → volume → money). For `_asImpl`: throw `"as: unsupported conversion"` if no category matches. For `_addImpl`/`_subImpl`: normalise to anchor unit of the source category, operate, convert back. For `_mulImpl`/`_divImpl`: use `_asImpl` to reconstruct in same unit; guard `div` against zero. Export `Measure` union type and `isMeasure`. Import `_asImpl`, `_addImpl`, `_subImpl`, `_mulImpl`, `_divImpl` from `core.ts` and reassign them. **This ticket is the critical one for multi-category dispatch correctness.**
**Acceptance criteria:** AC-20; `.as()`, `.add()`, `.sub()`, `.mul()`, `.div()` all work on values from every category after `index.ts` is imported; `() => mm(1).as("EUR")` throws an error.
**Blocks:** T-09, T-10, T-11, T-12, T-13
**Blocked by:** T-03, T-04, T-05, T-06, T-07

### T-09: `__tests__/length.test.ts`
**Description:** Migrate from `measure.test.ts`. Update all `.unit` assertions to clean keys (`"mm"` not `" mm"`, `"inch"` not `'"'`, `"mile"` not `" mi"`). Cover: construction, `toString()`, all `to*()` converters, roundtrip, `isLength()`, standalone `add`/`sub`/`mul`/`div`, `convertTo`, `formatMeasure`.
**Acceptance criteria:** All length tests pass in `vitest run`.
**Blocks:** T-14
**Blocked by:** T-08

### T-10: `__tests__/angle.test.ts`
**Description:** New test file. Cover: construction of `deg` and `rad`, `toString()`, `toRad`, `toDeg`, roundtrip, `isAngle`, `add`/`sub`/`mul`/`div` cross-unit, `.as()`.
**Acceptance criteria:** All angle tests pass in `vitest run`.
**Blocks:** T-14
**Blocked by:** T-08

### T-11: `__tests__/area.test.ts`
**Description:** New test file. Cover: each area constructor with plain number and with two `Length` args, `toString()`, all `to*()` converters, `isArea`, `add`/`sub`/`mul`/`div`, `.as()`.
**Acceptance criteria:** All area tests pass in `vitest run`.
**Blocks:** T-14
**Blocked by:** T-08

### T-12: `__tests__/volume.test.ts`
**Description:** New test file. Cover: each volume constructor with plain number, with three `Length` args, and with a `Volume` arg, `toString()`, all `to*()` converters, `isVolume`, `add`/`sub`/`mul`/`div`, `.as()`.
**Acceptance criteria:** All volume tests pass in `vitest run`.
**Blocks:** T-14
**Blocked by:** T-08

### T-13: `__tests__/money.test.ts`
**Description:** New test file. Cover: `eur` constructor, `toString()`, `isMoney`, `add`/`sub`/`mul`/`div`, `.as()` throws.
**Acceptance criteria:** All money tests pass in `vitest run`.
**Blocks:** T-14
**Blocked by:** T-08

### T-14: Full `vitest run` green
**Description:** Run `npx vitest run` and fix any remaining failures across all five test files.
**Acceptance criteria:** AC-24 — `vitest run` exits 0.
**Blocks:** T-15
**Blocked by:** T-09, T-10, T-11, T-12, T-13

### T-15: `install.sh` and `README.md`
**Description:** Create `install.sh` per spec (shell script with `set -euo pipefail`, shallow git clone, peer library recursion, tsconfig advice). Create `README.md` with the sections specified in the spec.
**Acceptance criteria:** `install.sh` is executable (`chmod +x`); `README.md` contains all required sections.
**Blocks:** none
**Blocked by:** T-14

## Dependency graph

```
T-01 → T-02 → T-03 → T-05 → T-08 → T-09 → T-14 → T-15
                    ↗           ↗
              T-04 →          T-10
                    ↘           ↘
              T-03 → T-06 → T-11
                              ↘
                         T-07 → T-12
                                  ↘
                             T-08 → T-13
```

Simplified linear critical path:
`T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-09..T-13 → T-14 → T-15`

## Refinement notes
- T-03: Clarified that `LENGTH_UNITS` set must use clean keys (not space-prefixed), switch cases in converters use clean keys, and that the per-category wire-up in T-03 will be overridden by the composed dispatch in T-08.
- T-03: Clarified `convertTo` function's `LengthUnitMap` must be re-keyed to clean unit keys (e.g. `"mm"` not `" mm"`).
- T-03: Explicit list of deprecated aliases to carry forward: `isNumberWithUnit`, `formatValueWithUnit`, `NumberWithUnit`, `Inch`.
- T-08: Clarified the exact responsibilities — import and reassign all five hooks from `core.ts` using composed dispatch that routes by category type guard; document error thrown when no category matches `.as()`.
- T-08: Added "cross-category `.as()` error" to AC (e.g. `mm(1).as("EUR")` throws).
- T-04: T-04 is independent of T-03 (no import dependency); both can start immediately after T-02 completes.
