// ---------------------------------------------------------------------------
// area.ts — area unit constructors, types, converters
// ---------------------------------------------------------------------------

import { measure } from "./core.js";
import * as core from "./core.js";
import { type Length, toM } from "./length.js";

// ---------------------------------------------------------------------------
// Area unit constructors (internal, used by overloads)
// ---------------------------------------------------------------------------

const _mm2 = measure("mm2", " mm²");
const _cm2 = measure("cm2", " cm²");
const _m2  = measure("m2",  " m²");
const _km2 = measure("km2", " km²");
const _in2 = measure("in2", " in²");
const _ft2 = measure("ft2", " ft²");
const _yd2 = measure("yd2", " yd²");
const _acre = measure("acre", " acre");
const _ha  = measure("ha",  " ha");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SquareMillimeters  = ReturnType<typeof _mm2>;
export type SquareCentimeters  = ReturnType<typeof _cm2>;
export type SquareMeters       = ReturnType<typeof _m2>;
export type SquareKilometers   = ReturnType<typeof _km2>;
export type SquareInches       = ReturnType<typeof _in2>;
export type SquareFeet         = ReturnType<typeof _ft2>;
export type SquareYards        = ReturnType<typeof _yd2>;
export type Acres              = ReturnType<typeof _acre>;
export type Hectares           = ReturnType<typeof _ha>;

export type Area =
  | SquareMillimeters
  | SquareCentimeters
  | SquareMeters
  | SquareKilometers
  | SquareInches
  | SquareFeet
  | SquareYards
  | Acres
  | Hectares;

// ---------------------------------------------------------------------------
// Conversion factors to m²
// ---------------------------------------------------------------------------
//   1 mm²  = 0.000_001 m²
//   1 cm²  = 0.000_1 m²
//   1 km²  = 1_000_000 m²
//   1 in²  = 0.000_645_16 m²
//   1 ft²  = 0.092_903_04 m²
//   1 yd²  = 0.836_127_36 m²
//   1 acre = 4_046.856_422_4 m²
//   1 ha   = 10_000 m²

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export const AREA_UNITS = new Set<string>([
  "mm2", "cm2", "m2", "km2", "in2", "ft2", "yd2", "acre", "ha",
]);

/** Returns true if `value` is a tagged area. */
export function isArea(value: unknown): value is Area {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value &&
    typeof (value as Record<string, unknown>).value === "number" &&
    AREA_UNITS.has((value as Record<string, unknown>).unit as string)
  );
}

// ---------------------------------------------------------------------------
// Converters — all anchored through m²
// ---------------------------------------------------------------------------

/** Convert any Area to square meters. */
function toM2(value: Area): SquareMeters {
  switch (value.unit) {
    case "mm2":  return _m2(value.value * 0.000_001);
    case "cm2":  return _m2(value.value * 0.000_1);
    case "km2":  return _m2(value.value * 1_000_000);
    case "in2":  return _m2(value.value * 0.000_645_16);
    case "ft2":  return _m2(value.value * 0.092_903_04);
    case "yd2":  return _m2(value.value * 0.836_127_36);
    case "acre": return _m2(value.value * 4_046.856_422_4);
    case "ha":   return _m2(value.value * 10_000);
    default:     return value as SquareMeters;
  }
}

/** Convert any Area to square millimeters. */
function toMm2(value: Area): SquareMillimeters {
  return _mm2(toM2(value).value / 0.000_001);
}

/** Convert any Area to square centimeters. */
function toCm2(value: Area): SquareCentimeters {
  return _cm2(toM2(value).value / 0.000_1);
}

/** Convert any Area to square kilometers. */
function toKm2(value: Area): SquareKilometers {
  return _km2(toM2(value).value / 1_000_000);
}

/** Convert any Area to square inches. */
function toIn2(value: Area): SquareInches {
  return _in2(toM2(value).value / 0.000_645_16);
}

/** Convert any Area to square feet. */
function toFt2(value: Area): SquareFeet {
  return _ft2(toM2(value).value / 0.092_903_04);
}

/** Convert any Area to square yards. */
function toYd2(value: Area): SquareYards {
  return _yd2(toM2(value).value / 0.836_127_36);
}

/** Convert any Area to acres. */
function toAcre(value: Area): Acres {
  return _acre(toM2(value).value / 4_046.856_422_4);
}

/** Convert any Area to hectares. */
function toHa(value: Area): Hectares {
  return _ha(toM2(value).value / 10_000);
}

// ---------------------------------------------------------------------------
// Internal area .as() dispatcher
// ---------------------------------------------------------------------------

export function _areaAsImpl(
  self: { value: number; unit: string },
  targetUnit: string,
): Area {
  const area = self as Area;
  switch (targetUnit) {
    case "mm2":  return toMm2(area);
    case "cm2":  return toCm2(area);
    case "m2":   return toM2(area);
    case "km2":  return toKm2(area);
    case "in2":  return toIn2(area);
    case "ft2":  return toFt2(area);
    case "yd2":  return toYd2(area);
    case "acre": return toAcre(area);
    case "ha":   return toHa(area);
    default:
      throw new TypeError(
        `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
      );
  }
}

// ---------------------------------------------------------------------------
// Overloaded constructors
// Each accepts either a literal number or two Length values.
// ---------------------------------------------------------------------------

export function mm2(n: number): SquareMillimeters;
export function mm2(a: Length, b: Length): SquareMillimeters;
export function mm2(v: Area): SquareMillimeters;
export function mm2(a: number | Length | Area, b?: Length): SquareMillimeters {
  if (typeof a === "number") return _mm2(a);
  if (isArea(a)) return toMm2(a);
  const result = toM(a).value * toM(b!).value;
  return toMm2(_m2(result));
}

export function cm2(n: number): SquareCentimeters;
export function cm2(a: Length, b: Length): SquareCentimeters;
export function cm2(v: Area): SquareCentimeters;
export function cm2(a: number | Length | Area, b?: Length): SquareCentimeters {
  if (typeof a === "number") return _cm2(a);
  if (isArea(a)) return toCm2(a);
  const result = toM(a).value * toM(b!).value;
  return toCm2(_m2(result));
}

export function m2(n: number): SquareMeters;
export function m2(a: Length, b: Length): SquareMeters;
export function m2(v: Area): SquareMeters;
export function m2(a: number | Length | Area, b?: Length): SquareMeters {
  if (typeof a === "number") return _m2(a);
  if (isArea(a)) return toM2(a);
  const result = toM(a).value * toM(b!).value;
  return _m2(result);
}

export function km2(n: number): SquareKilometers;
export function km2(a: Length, b: Length): SquareKilometers;
export function km2(v: Area): SquareKilometers;
export function km2(a: number | Length | Area, b?: Length): SquareKilometers {
  if (typeof a === "number") return _km2(a);
  if (isArea(a)) return toKm2(a);
  const result = toM(a).value * toM(b!).value;
  return toKm2(_m2(result));
}

export function in2(n: number): SquareInches;
export function in2(a: Length, b: Length): SquareInches;
export function in2(v: Area): SquareInches;
export function in2(a: number | Length | Area, b?: Length): SquareInches {
  if (typeof a === "number") return _in2(a);
  if (isArea(a)) return toIn2(a);
  const result = toM(a).value * toM(b!).value;
  return toIn2(_m2(result));
}

export function ft2(n: number): SquareFeet;
export function ft2(a: Length, b: Length): SquareFeet;
export function ft2(v: Area): SquareFeet;
export function ft2(a: number | Length | Area, b?: Length): SquareFeet {
  if (typeof a === "number") return _ft2(a);
  if (isArea(a)) return toFt2(a);
  const result = toM(a).value * toM(b!).value;
  return toFt2(_m2(result));
}

export function yd2(n: number): SquareYards;
export function yd2(a: Length, b: Length): SquareYards;
export function yd2(v: Area): SquareYards;
export function yd2(a: number | Length | Area, b?: Length): SquareYards {
  if (typeof a === "number") return _yd2(a);
  if (isArea(a)) return toYd2(a);
  const result = toM(a).value * toM(b!).value;
  return toYd2(_m2(result));
}

export function acre(n: number): Acres;
export function acre(a: Length, b: Length): Acres;
export function acre(v: Area): Acres;
export function acre(a: number | Length | Area, b?: Length): Acres {
  if (typeof a === "number") return _acre(a);
  if (isArea(a)) return toAcre(a);
  const result = toM(a).value * toM(b!).value;
  return toAcre(_m2(result));
}

export function ha(n: number): Hectares;
export function ha(a: Length, b: Length): Hectares;
export function ha(v: Area): Hectares;
export function ha(a: number | Length | Area, b?: Length): Hectares {
  if (typeof a === "number") return _ha(a);
  if (isArea(a)) return toHa(a);
  const result = toM(a).value * toM(b!).value;
  return toHa(_m2(result));
}

// ---------------------------------------------------------------------------
// Standalone arithmetic functions
// ---------------------------------------------------------------------------

function normaliseBArea(
  a: { value: number; unit: string },
  b: Area | number,
): Area {
  if (typeof b === "number") {
    return { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never;
  }
  return b;
}

export function add(a: Area, b: Area | number): Area {
  const bNorm = normaliseBArea(a, b);
  const sumM2 = _m2(toM2(a).value + toM2(bNorm).value);
  return _areaAsImpl(sumM2, a.unit);
}

export function sub(a: Area, b: Area | number): Area {
  const bNorm = normaliseBArea(a, b);
  const diffM2 = _m2(toM2(a).value - toM2(bNorm).value);
  return _areaAsImpl(diffM2, a.unit);
}

export function mul(a: Area, factor: number): Area {
  return _areaAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
}

export function div(a: Area, divisor: number): Area {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  return _areaAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
}

// ---------------------------------------------------------------------------
// Wire up dispatch hooks — extend prior hooks to also handle area.
// (Will be overridden by index.ts with the final composed dispatch.)
// ---------------------------------------------------------------------------

const _prevAs  = core.hooks._asImpl;
const _prevAdd = core.hooks._addImpl;
const _prevSub = core.hooks._subImpl;
const _prevMul = core.hooks._mulImpl;
const _prevDiv = core.hooks._divImpl;

core.hooks._asImpl = (self, targetUnit) => {
  if (isArea(self)) return _areaAsImpl(self, targetUnit);
  return _prevAs(self, targetUnit);
};

core.hooks._addImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isArea(a) && isArea(bNorm)) {
    const sumM2 = _m2(toM2(a).value + toM2(bNorm).value);
    return _areaAsImpl(sumM2, a.unit);
  }
  return _prevAdd(a, b);
};

core.hooks._subImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isArea(a) && isArea(bNorm)) {
    const diffM2 = _m2(toM2(a).value - toM2(bNorm).value);
    return _areaAsImpl(diffM2, a.unit);
  }
  return _prevSub(a, b);
};

core.hooks._mulImpl = (a, factor) => {
  if (isArea(a)) return _areaAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
  return _prevMul(a, factor);
};

core.hooks._divImpl = (a, divisor) => {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isArea(a)) return _areaAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
  return _prevDiv(a, divisor);
};
