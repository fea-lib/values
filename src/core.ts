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

// Dispatch hooks — stored in a mutable container so category files can
// overwrite the default implementations after importing this module.
// (ESM `export let` creates read-only live bindings for importers, so we
// use an object instead to allow mutation from sibling modules.)
export const hooks: {
  _asImpl: (
    self: { value: number; unit: string },
    targetUnit: string,
  ) => { value: number; unit: string };
  _addImpl: (
    a: { value: number; unit: string },
    b: RawOther,
  ) => { value: number; unit: string };
  _subImpl: (
    a: { value: number; unit: string },
    b: RawOther,
  ) => { value: number; unit: string };
  _mulImpl: (
    a: { value: number; unit: string },
    factor: number,
  ) => { value: number; unit: string };
  _divImpl: (
    a: { value: number; unit: string },
    divisor: number,
  ) => { value: number; unit: string };
} = {
  _asImpl: () => { throw new Error("_asImpl not yet initialised"); },
  _addImpl: () => { throw new Error("_addImpl not yet initialised"); },
  _subImpl: () => { throw new Error("_subImpl not yet initialised"); },
  _mulImpl: () => { throw new Error("_mulImpl not yet initialised"); },
  _divImpl: () => { throw new Error("_divImpl not yet initialised"); },
};

// Re-export as individual lets for backwards-compat with any code that
// reads them (reads go through the hooks object reference at call-time).
export const _asImpl = (...args: Parameters<typeof hooks._asImpl>) =>
  hooks._asImpl(...args);
export const _addImpl = (...args: Parameters<typeof hooks._addImpl>) =>
  hooks._addImpl(...args);
export const _subImpl = (...args: Parameters<typeof hooks._subImpl>) =>
  hooks._subImpl(...args);
export const _mulImpl = (...args: Parameters<typeof hooks._mulImpl>) =>
  hooks._mulImpl(...args);
export const _divImpl = (...args: Parameters<typeof hooks._divImpl>) =>
  hooks._divImpl(...args);

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
        return hooks._asImpl(self as never, targetUnit as never) as never;
      },
      add(other: { value: number; unit: string } | number) {
        return hooks._addImpl(self as never, other as never) as never;
      },
      sub(other: { value: number; unit: string } | number) {
        return hooks._subImpl(self as never, other as never) as never;
      },
      mul(factor: number) {
        return hooks._mulImpl(self as never, factor) as never;
      },
      div(divisor: number) {
        return hooks._divImpl(self as never, divisor) as never;
      },
    };
    return self as never;
  };
