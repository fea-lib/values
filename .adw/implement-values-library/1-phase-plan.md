# Phase Plan: implement-values-library

## Task

Implement the `@fea-lib/values` TypeScript library from scratch according to the spec in `implement-values-library.md`. The library provides zero-dependency, typed, unit-aware scalar value objects for length, angle, area, volume, and money. Each value carries a numeric magnitude and a unit key, and exposes arithmetic methods (`.add`, `.sub`, `.mul`, `.div`, `.as`) plus `toString()`. The implementation migrates existing code from `apps/docs/src/@jscad/builder/measure.ts` for length and angle, and introduces new files for area, volume, and money. Tests use vitest.

## Task slug
implement-values-library

## Phase plan
| # | Phase | Status | Reason if skipped |
|---|---|---|---|
| 1 | Idea | complete | — |
| 2 | Research | run | — |
| 3 | Prototype | skip | No UI/UX work; architecture is fully specified in the implementation doc |
| 4 | PRD | run | — |
| 5 | Plan | run | — |
| 6 | Refine | run | — |
| 7 | Execution | run | — |
| 8 | QA | run | — |

## Context
- `implement-values-library.md` — full specification (in repo root)
- `apps/docs/src/@jscad/builder/measure.ts` — existing length+angle source to migrate
- `apps/docs/src/@jscad/builder/__tests__/measure.test.ts` — existing tests to mirror
- `pocs/values.ts` — existing volume reference (`l`, `calculateVolume`)
