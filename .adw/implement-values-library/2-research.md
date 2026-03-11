# Research: implement-values-library

## Task context

Implement the `@fea-lib/values` TypeScript library in `/Users/tobiasbelch/fea/lib/values/`. The library provides typed, unit-aware scalar value objects for length, angle, area, volume, and money — each carrying a numeric magnitude and a unit key, with `.add`, `.sub`, `.mul`, `.div`, `.as`, and `toString()` methods. The repo is a green field (only the spec file and `.adw/` exist). Length and angle code is migrated from `brain/main/apps/docs/src/@jscad/builder/measure.ts`; area, volume, and money are new. Tests use vitest.

## Relevant code

### Source files to migrate
- `brain/main/apps/docs/src/@jscad/builder/measure.ts` — 797-line file with the `measure()` factory, dispatch hooks, length/angle constructors, converters, type guards, standalone arithmetic functions, deprecated aliases. **Unit keys are display-prefixed** (`" mm"`, `'"'`, `"°"`, `" rad"`) — must be changed to clean keys.
- `brain/main/apps/docs/src/@jscad/builder/__tests__/measure.test.ts` — 337-line vitest test file; style reference. Uses `toBeCloseTo()` for floats, `.toBe()` for exact matches, one assertion per `it()` in converter suites, grouped assertions in constructor/guard suites.
- `brain/main/apps/docs/src/pocs/values.ts` — 103-line file; contains `calculateVolume(width, height, depth)` logic (convert three lengths to meters, multiply, return liters) and the `l` constructor. This becomes the three-`Length` overload of `l()` in `src/volume.ts`.

### Key patterns in measure.ts
- `measure()` factory: `(unit: U) => (value: number) => { value, unit, toString, as, add, sub, mul, div }`
- Dispatch hooks (`_asImpl`, `_addImpl`, etc.) declared first as `let`, assigned after converters are defined
- All length conversion anchors through `mm`; angle through `rad`
- `_addImpl` normalises both operands to the anchor unit, sums, converts back to source unit
- `_mulImpl` / `_divImpl` use `_asImpl` to reconstruct the result in the same unit
- `convertTo` function uses a lookup to the `to*()` functions
- `formatMeasure` is just `${value.value}${value.unit}` (same as `toString()`)

### New files with no equivalent
- `src/area.ts` — 9 units, anchor `m²`, overloaded constructors accepting two `Length` args
- `src/volume.ts` — 13 units, anchor `m³`, overloaded constructors accepting three `Length` args or a `Volume` arg
- `src/money.ts` — EUR only, `.as()` throws `TypeError`

### Config
No `package.json`, `tsconfig.json`, or `vitest.config.ts` exist in `lib/values/`. All must be created. Reference vitest config from `brain/main/apps/docs/` is `{ test: { environment: "node" } }`.

## Constraints

- **Zero dependencies**: no runtime deps. `vitest` and `typescript` are devDependencies only.
- **Unit keys must be clean identifiers** (no space prefix, no `'"'` for inch, no `"°"` for deg): `"mm"`, `"cm"`, `"inch"`, `"deg"`, `"rad"`, etc. The `measure()` factory takes `unit` (clean) and optional `unitToPrint` (display). `toString()` uses `unitToPrint`.
- **`Unit` type** must equal `"μm" | "mm" | "cm" | "m" | "km" | "inch" | "ft" | "yd" | "mile"` — clean keys match exactly. Existing consumers of the old `measure.ts` may reference this type; the new lib makes the type cleaner.
- **`core.ts` is internal** — `measure()` factory and hooks are imported by category files; `core.ts` itself is not exported from `index.ts`.
- **Dispatch hook architecture**: `_asImpl`, `_addImpl`, etc. in `core.ts` are `export let`. Each category file reassigns them. The hooks are overwritten at module initialisation time in dependency order (last category file to load wins). **Risk**: because all category files overwrite the same module-level hooks in `core.ts`, only the last-imported category's implementations are active. The hooks must dispatch over all categories, not just the current one. See Risk section.

## Risks

1. **Dispatch hook collision**: The existing `measure.ts` uses local `let` variables; only one file reassigns them, so there's no conflict. In the new library, **five** category files each import and overwrite the same `export let _asImpl` etc. from `core.ts`. Only the last file's assignment survives. Solution: the final wire-up (in `index.ts` or a dedicated `_wire.ts`) must compose all category converters into a single multi-dispatch implementation. Alternatively, `core.ts` can expose a registration function (`registerCategory`) instead of direct hook overwriting.
   - **Spec does say** "filled in by each category file after its converters are defined" and "category files can overwrite the default" — the spec implies sequential overwriting, which would only preserve the last category's hook. This is a design flaw in the spec. The correct interpretation is that each hook must dispatch over all registered categories. The safest approach: have `index.ts` (which imports all categories) do the final hook wiring that combines all converters.

2. **`isMeasure` / `isLength` / `isAngle` set membership**: with clean unit keys, the sets must be updated (e.g., `LENGTH_UNITS.has("mm")` not `LENGTH_UNITS.has(" mm")`). All switch cases in converters must use clean keys.

3. **`μm` (micro sign U+03BC vs Greek mu U+00B5)**: The existing `measure.ts` uses `μm` (micro sign). Must be consistent throughout.

4. **Area/volume overloaded constructors**: Each overloaded constructor needs `toM` (from `length.ts`) imported. `area.ts` and `volume.ts` must import `Length` type and `toM` converter from `length.ts`, creating an inter-category dependency (`length.ts` ← `area.ts`, `volume.ts`).

5. **`vitest` not installed**: `node_modules` does not exist in `lib/values/`. Must run `npm install` before any tests can run.

6. **`toμl` converter naming**: The spec names a converter `toμl`. This is valid TypeScript (identifier with Unicode) but may be unusual. Must be exported exactly as specified.

## Handoff notes

- **Green field repo**: create `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/`, `__tests__/` from scratch
- **Critical architecture decision on dispatch hooks**: the spec's "each category overwrites the hooks" pattern is broken for multi-category usage. Recommend implementing a dispatch table in `core.ts` (e.g. `_asImpl` checks `isLength(self)`, then `isAngle(self)`, etc.) — but this creates circular imports if `core.ts` imports from category files. Cleanest solution: use a registry pattern where each category *registers* its handler, and `core.ts`'s hooks dispatch to the registry. Or: only the last file (`money.ts`) sets all hooks, composing all prior converters.
- **Existing `measure.ts` is NOT modified** — this is a new standalone library; the old file stays as-is in `apps/docs/`.
- **Test style**: mirror `measure.test.ts` (one assertion per `it()` in converter suites); update `.unit` assertions to clean keys.
- **`devDependencies`**: need `vitest` and `typescript` — add to `package.json` and run `npm install`.
