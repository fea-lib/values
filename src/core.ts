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

/** Shape of every tagged measure value returned by `measure()`. */
// The methods use a recursive-ish self-reference via the raw shape to avoid
// circular type issues while still allowing chaining (e.g. value.as("mm").as("cm")).
export type MeasureValue<U extends string> = {
  readonly value: number;
  readonly unit: U;
  toString(): string;
  as(targetUnit: string): MeasureValue<string>;
  add(other: { value: number; unit: string } | number): MeasureValue<string>;
  sub(other: { value: number; unit: string } | number): MeasureValue<string>;
  mul(factor: number): MeasureValue<string>;
  div(divisor: number): MeasureValue<string>;
};

// Dispatch hooks — stored in a mutable container so category files can
// overwrite the default implementations after importing this module.
// (ESM `export let` creates read-only live bindings for importers, so we
// use an object instead to allow mutation from sibling modules.)
export const hooks: {
  _asImpl: (
    self: { value: number; unit: string },
    targetUnit: string,
  ) => MeasureValue<string>;
  _addImpl: (
    a: { value: number; unit: string },
    b: RawOther,
  ) => MeasureValue<string>;
  _subImpl: (
    a: { value: number; unit: string },
    b: RawOther,
  ) => MeasureValue<string>;
  _mulImpl: (
    a: { value: number; unit: string },
    factor: number,
  ) => MeasureValue<string>;
  _divImpl: (
    a: { value: number; unit: string },
    divisor: number,
  ) => MeasureValue<string>;
} = {
  _asImpl: () => {
    throw new Error("_asImpl not yet initialised");
  },
  _addImpl: () => {
    throw new Error("_addImpl not yet initialised");
  },
  _subImpl: () => {
    throw new Error("_subImpl not yet initialised");
  },
  _mulImpl: () => {
    throw new Error("_mulImpl not yet initialised");
  },
  _divImpl: () => {
    throw new Error("_divImpl not yet initialised");
  },
};

/**
 * Internal factory. Each category file calls this to produce its constructors.
 *
 * @param unit         - canonical unit key, e.g. "mm", "inch", "deg", "EUR", "m2", "cm3"
 * @param unitToPrint  - optional display string used in toString().
 *                       When omitted, `unit` is used as-is.
 *                       Include leading space if desired, e.g. " mm", " ft".
 *                       For symbols with no space use the symbol directly, e.g. "°", '"'.
 * @param digitsAfterDecimal - optional number of digits to display after the decimal point.
 *                            If set to `false`, the value is displayed as-is without rounding.
 */
export const measure =
  <U extends string>(
    unit: U,
    unitToPrint?: string,
    digitsAfterDecimal: number | false = 2,
  ) =>
  (value: number): MeasureValue<U> => {
    const display = unitToPrint ?? unit;
    const self: MeasureValue<U> = {
      value,
      unit,
      toString: () =>
        `${digitsAfterDecimal !== false ? Math.round(value * Math.pow(10, digitsAfterDecimal)) / Math.pow(10, digitsAfterDecimal) : value}${display}`,
      as(targetUnit: string) {
        return hooks._asImpl(
          self as { value: number; unit: string },
          targetUnit,
        );
      },
      add(other: { value: number; unit: string } | number) {
        return hooks._addImpl(self as { value: number; unit: string }, other);
      },
      sub(other: { value: number; unit: string } | number) {
        return hooks._subImpl(self as { value: number; unit: string }, other);
      },
      mul(factor: number) {
        return hooks._mulImpl(self as { value: number; unit: string }, factor);
      },
      div(divisor: number) {
        return hooks._divImpl(self as { value: number; unit: string }, divisor);
      },
    };
    return self;
  };
