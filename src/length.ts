// ---------------------------------------------------------------------------
// length.ts — length unit constructors, types, converters
// ---------------------------------------------------------------------------

import { measure } from "./core.js";
import * as core from "./core.js";

// ---------------------------------------------------------------------------
// Internal (private) primitive constructors — plain number only.
// Public constructors below are overloaded to also accept a Length.
// ---------------------------------------------------------------------------

const _μm   = measure("μm",   " μm");
const _mm   = measure("mm",   " mm");
const _cm   = measure("cm",   " cm");
const _m    = measure("m",    " m");
const _km   = measure("km",   " km");
const _inch = measure("inch", '"');
const _ft   = measure("ft",   " ft");
const _yd   = measure("yd",   " yd");
const _mile = measure("mile", " mi");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Micrometers = ReturnType<typeof _μm>;
export type Millimeters = ReturnType<typeof _mm>;
export type Centimeters = ReturnType<typeof _cm>;
export type Meters      = ReturnType<typeof _m>;
export type Kilometers  = ReturnType<typeof _km>;
export type Inches      = ReturnType<typeof _inch>;
export type Feet        = ReturnType<typeof _ft>;
export type Yards       = ReturnType<typeof _yd>;
export type Miles       = ReturnType<typeof _mile>;

export type Length =
  | Micrometers
  | Millimeters
  | Centimeters
  | Meters
  | Kilometers
  | Inches
  | Feet
  | Yards
  | Miles;

/**
 * Supported coordinate units for the builder.
 * Unit type values match the clean unit keys exactly.
 */
export type Unit =
  | "μm"
  | "mm"
  | "cm"
  | "m"
  | "km"
  | "inch"
  | "ft"
  | "yd"
  | "mile";

// ---------------------------------------------------------------------------
// Maps unit key → concrete type (used by convertTo / .as())
// ---------------------------------------------------------------------------

export type LengthUnitMap = {
  μm: Micrometers;
  mm: Millimeters;
  cm: Centimeters;
  m: Meters;
  km: Kilometers;
  inch: Inches;
  ft: Feet;
  yd: Yards;
  mile: Miles;
};

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export const LENGTH_UNITS = new Set<string>([
  "μm", "mm", "cm", "m", "km", "inch", "ft", "yd", "mile",
]);

/** Returns true if `value` is a tagged length (`mm()`, `cm()`, `ft()`, etc.). */
export function isLength(value: unknown): value is Length {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value &&
    typeof (value as Record<string, unknown>).value === "number" &&
    LENGTH_UNITS.has((value as Record<string, unknown>).unit as string)
  );
}

// ---------------------------------------------------------------------------
// Internal conversion helpers (private — not exported)
// All conversion factors are relative to mm as the internal anchor.
// 1 inch = 25.4 mm  |  1 ft = 304.8 mm  |  1 yd = 914.4 mm
// 1 mi   = 1 609 344 mm  |  1 μm = 0.001 mm
// ---------------------------------------------------------------------------

function _toMm(value: Length): Millimeters {
  switch (value.unit) {
    case "μm":   return _mm(value.value * 0.001);
    case "cm":   return _mm(value.value * 10);
    case "m":    return _mm(value.value * 1_000);
    case "km":   return _mm(value.value * 1_000_000);
    case "inch": return _mm(value.value * 25.4);
    case "ft":   return _mm(value.value * 304.8);
    case "yd":   return _mm(value.value * 914.4);
    case "mile": return _mm(value.value * 1_609_344);
    default:     return value as Millimeters;
  }
}

function _toCm(value: Length): Centimeters {
  switch (value.unit) {
    case "μm":   return _cm(value.value * 0.0001);
    case "mm":   return _cm(value.value / 10);
    case "m":    return _cm(value.value * 100);
    case "km":   return _cm(value.value * 100_000);
    case "inch": return _cm(value.value * 2.54);
    case "ft":   return _cm(value.value * 30.48);
    case "yd":   return _cm(value.value * 91.44);
    case "mile": return _cm(value.value * 160_934.4);
    default:     return value as Centimeters;
  }
}

function _toM(value: Length): Meters {
  switch (value.unit) {
    case "μm":   return _m(value.value * 0.000_001);
    case "mm":   return _m(value.value / 1_000);
    case "cm":   return _m(value.value / 100);
    case "km":   return _m(value.value * 1_000);
    case "inch": return _m(value.value * 0.0254);
    case "ft":   return _m(value.value * 0.3048);
    case "yd":   return _m(value.value * 0.9144);
    case "mile": return _m(value.value * 1_609.344);
    default:     return value as Meters;
  }
}

function _toKm(value: Length): Kilometers {
  switch (value.unit) {
    case "μm":   return _km(value.value * 0.000_000_001);
    case "mm":   return _km(value.value / 1_000_000);
    case "cm":   return _km(value.value / 100_000);
    case "m":    return _km(value.value / 1_000);
    case "inch": return _km(value.value * 0.0000254);
    case "ft":   return _km(value.value * 0.0003048);
    case "yd":   return _km(value.value * 0.0009144);
    case "mile": return _km(value.value * 1.609344);
    default:     return value as Kilometers;
  }
}

function _toμm(value: Length): Micrometers {
  switch (value.unit) {
    case "mm":   return _μm(value.value * 1_000);
    case "cm":   return _μm(value.value * 10_000);
    case "m":    return _μm(value.value * 1_000_000);
    case "km":   return _μm(value.value * 1_000_000_000);
    case "inch": return _μm(value.value * 25_400);
    case "ft":   return _μm(value.value * 304_800);
    case "yd":   return _μm(value.value * 914_400);
    case "mile": return _μm(value.value * 1_609_344_000);
    default:     return value as Micrometers;
  }
}

function _toInch(value: Length): Inches {
  switch (value.unit) {
    case "μm":   return _inch(value.value / 25_400);
    case "mm":   return _inch(value.value / 25.4);
    case "cm":   return _inch(value.value / 2.54);
    case "m":    return _inch(value.value / 0.0254);
    case "km":   return _inch(value.value / 0.0000254);
    case "ft":   return _inch(value.value * 12);
    case "yd":   return _inch(value.value * 36);
    case "mile": return _inch(value.value * 63_360);
    default:     return value as Inches;
  }
}

function _toFt(value: Length): Feet {
  switch (value.unit) {
    case "μm":   return _ft(value.value / 304_800);
    case "mm":   return _ft(value.value / 304.8);
    case "cm":   return _ft(value.value / 30.48);
    case "m":    return _ft(value.value / 0.3048);
    case "km":   return _ft(value.value / 0.0003048);
    case "inch": return _ft(value.value / 12);
    case "yd":   return _ft(value.value * 3);
    case "mile": return _ft(value.value * 5_280);
    default:     return value as Feet;
  }
}

function _toYd(value: Length): Yards {
  switch (value.unit) {
    case "μm":   return _yd(value.value / 914_400);
    case "mm":   return _yd(value.value / 914.4);
    case "cm":   return _yd(value.value / 91.44);
    case "m":    return _yd(value.value / 0.9144);
    case "km":   return _yd(value.value / 0.0009144);
    case "inch": return _yd(value.value / 36);
    case "ft":   return _yd(value.value / 3);
    case "mile": return _yd(value.value * 1_760);
    default:     return value as Yards;
  }
}

function _toMile(value: Length): Miles {
  switch (value.unit) {
    case "μm":   return _mile(value.value / 1_609_344_000);
    case "mm":   return _mile(value.value / 1_609_344);
    case "cm":   return _mile(value.value / 160_934.4);
    case "m":    return _mile(value.value / 1_609.344);
    case "km":   return _mile(value.value / 1.609344);
    case "inch": return _mile(value.value / 63_360);
    case "ft":   return _mile(value.value / 5_280);
    case "yd":   return _mile(value.value / 1_760);
    default:     return value as Miles;
  }
}

// ---------------------------------------------------------------------------
// Internal .as() dispatcher — used by hooks and convertTo
// ---------------------------------------------------------------------------

function _lengthAsImpl(self: { value: number; unit: string }, targetUnit: string): Length {
  switch (targetUnit) {
    case "μm":   return _toμm(self as Length);
    case "mm":   return _toMm(self as Length);
    case "cm":   return _toCm(self as Length);
    case "m":    return _toM(self as Length);
    case "km":   return _toKm(self as Length);
    case "inch": return _toInch(self as Length);
    case "ft":   return _toFt(self as Length);
    case "yd":   return _toYd(self as Length);
    case "mile": return _toMile(self as Length);
    default:
      throw new TypeError(
        `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
      );
  }
}

// ---------------------------------------------------------------------------
// Public overloaded constructors
// Each accepts either a plain number OR an existing Length (converts to target unit).
// ---------------------------------------------------------------------------

export function μm(n: number): Micrometers;
export function μm(v: Length): Micrometers;
export function μm(a: number | Length): Micrometers {
  if (typeof a === "number") return _μm(a);
  return _toμm(a);
}

export function mm(n: number): Millimeters;
export function mm(v: Length): Millimeters;
export function mm(a: number | Length): Millimeters {
  if (typeof a === "number") return _mm(a);
  return _toMm(a);
}

export function cm(n: number): Centimeters;
export function cm(v: Length): Centimeters;
export function cm(a: number | Length): Centimeters {
  if (typeof a === "number") return _cm(a);
  return _toCm(a);
}

export function m(n: number): Meters;
export function m(v: Length): Meters;
export function m(a: number | Length): Meters {
  if (typeof a === "number") return _m(a);
  return _toM(a);
}

export function km(n: number): Kilometers;
export function km(v: Length): Kilometers;
export function km(a: number | Length): Kilometers {
  if (typeof a === "number") return _km(a);
  return _toKm(a);
}

export function inch(n: number): Inches;
export function inch(v: Length): Inches;
export function inch(a: number | Length): Inches {
  if (typeof a === "number") return _inch(a);
  return _toInch(a);
}

export function ft(n: number): Feet;
export function ft(v: Length): Feet;
export function ft(a: number | Length): Feet {
  if (typeof a === "number") return _ft(a);
  return _toFt(a);
}

export function yd(n: number): Yards;
export function yd(v: Length): Yards;
export function yd(a: number | Length): Yards {
  if (typeof a === "number") return _yd(a);
  return _toYd(a);
}

export function mile(n: number): Miles;
export function mile(v: Length): Miles;
export function mile(a: number | Length): Miles {
  if (typeof a === "number") return _mile(a);
  return _toMile(a);
}

// ---------------------------------------------------------------------------
// Standalone arithmetic functions (prefer method forms: a.add(b), etc.)
// ---------------------------------------------------------------------------

function normaliseBLength(
  a: { value: number; unit: string },
  b: Length | number,
): Length {
  if (typeof b === "number") {
    return { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never;
  }
  return b;
}

export function add(a: Length, b: Length | number): Length {
  const bNorm = normaliseBLength(a, b);
  const sumMm = _mm(_toMm(a).value + _toMm(bNorm).value);
  return _lengthAsImpl(sumMm, a.unit);
}

export function sub(a: Length, b: Length | number): Length {
  const bNorm = normaliseBLength(a, b);
  const diffMm = _mm(_toMm(a).value - _toMm(bNorm).value);
  return _lengthAsImpl(diffMm, a.unit);
}

export function mul(a: Length, factor: number): Length {
  return _lengthAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
}

export function div(a: Length, divisor: number): Length {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  return _lengthAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
}

// ---------------------------------------------------------------------------
// convertTo (standalone function — prefer the method form: a.as(unit))
// ---------------------------------------------------------------------------

export function convertTo<V extends keyof LengthUnitMap>(
  value: Length,
  targetUnit: V,
): LengthUnitMap[V] {
  return _lengthAsImpl(value, targetUnit) as LengthUnitMap[V];
}

// ---------------------------------------------------------------------------
// Formatting utility
// ---------------------------------------------------------------------------

export function formatMeasure(value: Length): string {
  return value.toString();
}

/** @deprecated Use `formatMeasure` instead. */
export const formatValueWithUnit = formatMeasure;

// ---------------------------------------------------------------------------
// Deprecated re-exports for backward compat
// ---------------------------------------------------------------------------

/** @deprecated Use `isMeasure` instead. */
export const isNumberWithUnit = isLength;

/** @deprecated Use `Inches` instead. */
export type Inch = Inches;

/** @deprecated Use `Length` (from index.ts) instead. */
export type NumberWithUnit = Length;

// ---------------------------------------------------------------------------
// Also export the internal toM helper needed by area.ts and volume.ts
// ---------------------------------------------------------------------------

/** @internal Used by area.ts and volume.ts for length-to-metres conversion. */
export { _toM as toM };

// ---------------------------------------------------------------------------
// Wire up dispatch hooks (will be overridden by index.ts with composed dispatch)
// ---------------------------------------------------------------------------

core.hooks._asImpl = (self, targetUnit) => {
  if (isLength(self)) return _lengthAsImpl(self, targetUnit);
  throw new TypeError(
    `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
  );
};

core.hooks._addImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isLength(a) && isLength(bNorm)) {
    const sumMm = _mm(_toMm(a).value + _toMm(bNorm).value);
    return _lengthAsImpl(sumMm, a.unit);
  }
  throw new TypeError(`add: cannot add "${a.unit}" and "${bNorm.unit}"`);
};

core.hooks._subImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isLength(a) && isLength(bNorm)) {
    const diffMm = _mm(_toMm(a).value - _toMm(bNorm).value);
    return _lengthAsImpl(diffMm, a.unit);
  }
  throw new TypeError(`sub: cannot subtract "${bNorm.unit}" from "${a.unit}"`);
};

core.hooks._mulImpl = (a, factor) => {
  if (isLength(a)) return _lengthAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
  throw new TypeError(`mul: unsupported unit "${a.unit}"`);
};

core.hooks._divImpl = (a, divisor) => {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isLength(a)) return _lengthAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
  throw new TypeError(`div: unsupported unit "${a.unit}"`);
};
