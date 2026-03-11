// ---------------------------------------------------------------------------
// volume.ts — volume unit constructors, types, converters
// ---------------------------------------------------------------------------

import { measure } from "./core.js";
import * as core from "./core.js";
import { type Length, toM } from "./length.js";

// ---------------------------------------------------------------------------
// Volume unit constructors (internal, used by overloads)
// ---------------------------------------------------------------------------

const _μl   = measure("μl",   " μl");
const _ml   = measure("ml",   " ml");
const _cl   = measure("cl",   " cl");
const _dl   = measure("dl",   " dl");
const _l    = measure("l",    " l");
const _cm3  = measure("cm3",  " cm³");
const _m3   = measure("m3",   " m³");
const _in3  = measure("in3",  " in³");
const _ft3  = measure("ft3",  " ft³");
const _floz = measure("floz", " fl oz");
const _pint = measure("pint", " pint");
const _qt   = measure("qt",   " qt");
const _gal  = measure("gal",  " gal");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Microliters      = ReturnType<typeof _μl>;
export type Milliliters      = ReturnType<typeof _ml>;
export type Centiliters      = ReturnType<typeof _cl>;
export type Deciliters       = ReturnType<typeof _dl>;
export type Liters           = ReturnType<typeof _l>;
export type CubicCentimeters = ReturnType<typeof _cm3>;
export type CubicMeters      = ReturnType<typeof _m3>;
export type CubicInches      = ReturnType<typeof _in3>;
export type CubicFeet        = ReturnType<typeof _ft3>;
export type FluidOunces      = ReturnType<typeof _floz>;
export type Pints            = ReturnType<typeof _pint>;
export type Quarts           = ReturnType<typeof _qt>;
export type Gallons          = ReturnType<typeof _gal>;

export type Volume =
  | Microliters
  | Milliliters
  | Centiliters
  | Deciliters
  | Liters
  | CubicCentimeters
  | CubicMeters
  | CubicInches
  | CubicFeet
  | FluidOunces
  | Pints
  | Quarts
  | Gallons;

// ---------------------------------------------------------------------------
// Conversion factors to m³
// ---------------------------------------------------------------------------
//   1 μl   = 0.000_000_001 m³
//   1 ml   = 0.000_001 m³
//   1 cl   = 0.000_01 m³
//   1 dl   = 0.000_1 m³
//   1 l    = 0.001 m³
//   1 cm³  = 0.000_001 m³
//   1 in³  = 0.000_016_387_064 m³
//   1 ft³  = 0.028_316_846_592 m³
//   1 fl oz (US) = 0.000_029_573_529_6 m³
//   1 pint (US)  = 0.000_473_176_473 m³
//   1 qt (US)    = 0.000_946_352_946 m³
//   1 gal (US)   = 0.003_785_411_784 m³

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export const VOLUME_UNITS = new Set<string>([
  "μl", "ml", "cl", "dl", "l",
  "cm3", "m3", "in3", "ft3",
  "floz", "pint", "qt", "gal",
]);

/** Returns true if `value` is a tagged volume. */
export function isVolume(value: unknown): value is Volume {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value &&
    typeof (value as Record<string, unknown>).value === "number" &&
    VOLUME_UNITS.has((value as Record<string, unknown>).unit as string)
  );
}

// ---------------------------------------------------------------------------
// Converters — all anchored through m³
// ---------------------------------------------------------------------------

/** Convert any Volume to cubic meters. */
function toM3(value: Volume): CubicMeters {
  switch (value.unit) {
    case "μl":   return _m3(value.value * 0.000_000_001);
    case "ml":   return _m3(value.value * 0.000_001);
    case "cl":   return _m3(value.value * 0.000_01);
    case "dl":   return _m3(value.value * 0.000_1);
    case "l":    return _m3(value.value * 0.001);
    case "cm3":  return _m3(value.value * 0.000_001);
    case "in3":  return _m3(value.value * 0.000_016_387_064);
    case "ft3":  return _m3(value.value * 0.028_316_846_592);
    case "floz": return _m3(value.value * 0.000_029_573_529_6);
    case "pint": return _m3(value.value * 0.000_473_176_473);
    case "qt":   return _m3(value.value * 0.000_946_352_946);
    case "gal":  return _m3(value.value * 0.003_785_411_784);
    default:     return value as CubicMeters;
  }
}

/** Convert any Volume to microliters. */
function toμl(value: Volume): Microliters {
  return _μl(toM3(value).value / 0.000_000_001);
}

/** Convert any Volume to milliliters. */
function toMl(value: Volume): Milliliters {
  return _ml(toM3(value).value / 0.000_001);
}

/** Convert any Volume to centiliters. */
function toCl(value: Volume): Centiliters {
  return _cl(toM3(value).value / 0.000_01);
}

/** Convert any Volume to deciliters. */
function toDl(value: Volume): Deciliters {
  return _dl(toM3(value).value / 0.000_1);
}

/** Convert any Volume to liters. */
function toL(value: Volume): Liters {
  return _l(toM3(value).value / 0.001);
}

/** Convert any Volume to cubic centimeters. */
function toCm3(value: Volume): CubicCentimeters {
  return _cm3(toM3(value).value / 0.000_001);
}

/** Convert any Volume to cubic inches. */
function toIn3(value: Volume): CubicInches {
  return _in3(toM3(value).value / 0.000_016_387_064);
}

/** Convert any Volume to cubic feet. */
function toFt3(value: Volume): CubicFeet {
  return _ft3(toM3(value).value / 0.028_316_846_592);
}

/** Convert any Volume to fluid ounces (US). */
function toFloz(value: Volume): FluidOunces {
  return _floz(toM3(value).value / 0.000_029_573_529_6);
}

/** Convert any Volume to pints (US). */
function toPint(value: Volume): Pints {
  return _pint(toM3(value).value / 0.000_473_176_473);
}

/** Convert any Volume to quarts (US). */
function toQt(value: Volume): Quarts {
  return _qt(toM3(value).value / 0.000_946_352_946);
}

/** Convert any Volume to gallons (US). */
function toGal(value: Volume): Gallons {
  return _gal(toM3(value).value / 0.003_785_411_784);
}

// ---------------------------------------------------------------------------
// Internal volume .as() dispatcher
// ---------------------------------------------------------------------------

export function _volumeAsImpl(
  self: { value: number; unit: string },
  targetUnit: string,
): Volume {
  const vol = self as Volume;
  switch (targetUnit) {
    case "μl":   return toμl(vol);
    case "ml":   return toMl(vol);
    case "cl":   return toCl(vol);
    case "dl":   return toDl(vol);
    case "l":    return toL(vol);
    case "cm3":  return toCm3(vol);
    case "m3":   return toM3(vol);
    case "in3":  return toIn3(vol);
    case "ft3":  return toFt3(vol);
    case "floz": return toFloz(vol);
    case "pint": return toPint(vol);
    case "qt":   return toQt(vol);
    case "gal":  return toGal(vol);
    default:
      throw new TypeError(
        `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
      );
  }
}

// ---------------------------------------------------------------------------
// Overloaded constructors
// Each accepts: (n: number) | (a: Length, b: Length, c: Length) | (v: Volume)
// ---------------------------------------------------------------------------

export function μl(n: number): Microliters;
export function μl(a: Length, b: Length, c: Length): Microliters;
export function μl(v: Volume): Microliters;
export function μl(a: number | Length | Volume, b?: Length, c?: Length): Microliters {
  if (typeof a === "number") return _μl(a);
  if (isVolume(a)) return toμl(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toμl(_m3(m3val));
}

export function ml(n: number): Milliliters;
export function ml(a: Length, b: Length, c: Length): Milliliters;
export function ml(v: Volume): Milliliters;
export function ml(a: number | Length | Volume, b?: Length, c?: Length): Milliliters {
  if (typeof a === "number") return _ml(a);
  if (isVolume(a)) return toMl(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toMl(_m3(m3val));
}

export function cl(n: number): Centiliters;
export function cl(a: Length, b: Length, c: Length): Centiliters;
export function cl(v: Volume): Centiliters;
export function cl(a: number | Length | Volume, b?: Length, c?: Length): Centiliters {
  if (typeof a === "number") return _cl(a);
  if (isVolume(a)) return toCl(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toCl(_m3(m3val));
}

export function dl(n: number): Deciliters;
export function dl(a: Length, b: Length, c: Length): Deciliters;
export function dl(v: Volume): Deciliters;
export function dl(a: number | Length | Volume, b?: Length, c?: Length): Deciliters {
  if (typeof a === "number") return _dl(a);
  if (isVolume(a)) return toDl(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toDl(_m3(m3val));
}

export function l(n: number): Liters;
export function l(a: Length, b: Length, c: Length): Liters;
export function l(v: Volume): Liters;
export function l(a: number | Length | Volume, b?: Length, c?: Length): Liters {
  if (typeof a === "number") return _l(a);
  if (isVolume(a)) return toL(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return _l(m3val * 1000); // 1 m³ = 1000 l
}

export function cm3(n: number): CubicCentimeters;
export function cm3(a: Length, b: Length, c: Length): CubicCentimeters;
export function cm3(v: Volume): CubicCentimeters;
export function cm3(a: number | Length | Volume, b?: Length, c?: Length): CubicCentimeters {
  if (typeof a === "number") return _cm3(a);
  if (isVolume(a)) return toCm3(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toCm3(_m3(m3val));
}

export function m3(n: number): CubicMeters;
export function m3(a: Length, b: Length, c: Length): CubicMeters;
export function m3(v: Volume): CubicMeters;
export function m3(a: number | Length | Volume, b?: Length, c?: Length): CubicMeters {
  if (typeof a === "number") return _m3(a);
  if (isVolume(a)) return toM3(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return _m3(m3val);
}

export function in3(n: number): CubicInches;
export function in3(a: Length, b: Length, c: Length): CubicInches;
export function in3(v: Volume): CubicInches;
export function in3(a: number | Length | Volume, b?: Length, c?: Length): CubicInches {
  if (typeof a === "number") return _in3(a);
  if (isVolume(a)) return toIn3(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toIn3(_m3(m3val));
}

export function ft3(n: number): CubicFeet;
export function ft3(a: Length, b: Length, c: Length): CubicFeet;
export function ft3(v: Volume): CubicFeet;
export function ft3(a: number | Length | Volume, b?: Length, c?: Length): CubicFeet {
  if (typeof a === "number") return _ft3(a);
  if (isVolume(a)) return toFt3(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toFt3(_m3(m3val));
}

export function floz(n: number): FluidOunces;
export function floz(a: Length, b: Length, c: Length): FluidOunces;
export function floz(v: Volume): FluidOunces;
export function floz(a: number | Length | Volume, b?: Length, c?: Length): FluidOunces {
  if (typeof a === "number") return _floz(a);
  if (isVolume(a)) return toFloz(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toFloz(_m3(m3val));
}

export function pint(n: number): Pints;
export function pint(a: Length, b: Length, c: Length): Pints;
export function pint(v: Volume): Pints;
export function pint(a: number | Length | Volume, b?: Length, c?: Length): Pints {
  if (typeof a === "number") return _pint(a);
  if (isVolume(a)) return toPint(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toPint(_m3(m3val));
}

export function qt(n: number): Quarts;
export function qt(a: Length, b: Length, c: Length): Quarts;
export function qt(v: Volume): Quarts;
export function qt(a: number | Length | Volume, b?: Length, c?: Length): Quarts {
  if (typeof a === "number") return _qt(a);
  if (isVolume(a)) return toQt(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toQt(_m3(m3val));
}

export function gal(n: number): Gallons;
export function gal(a: Length, b: Length, c: Length): Gallons;
export function gal(v: Volume): Gallons;
export function gal(a: number | Length | Volume, b?: Length, c?: Length): Gallons {
  if (typeof a === "number") return _gal(a);
  if (isVolume(a)) return toGal(a);
  const m3val = toM(a).value * toM(b!).value * toM(c!).value;
  return toGal(_m3(m3val));
}

// ---------------------------------------------------------------------------
// Standalone arithmetic functions
// ---------------------------------------------------------------------------

function normaliseBVolume(
  a: { value: number; unit: string },
  b: Volume | number,
): Volume {
  if (typeof b === "number") {
    return { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never;
  }
  return b;
}

export function add(a: Volume, b: Volume | number): Volume {
  const bNorm = normaliseBVolume(a, b);
  const sumM3 = _m3(toM3(a).value + toM3(bNorm).value);
  return _volumeAsImpl(sumM3, a.unit);
}

export function sub(a: Volume, b: Volume | number): Volume {
  const bNorm = normaliseBVolume(a, b);
  const diffM3 = _m3(toM3(a).value - toM3(bNorm).value);
  return _volumeAsImpl(diffM3, a.unit);
}

export function mul(a: Volume, factor: number): Volume {
  return _volumeAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
}

export function div(a: Volume, divisor: number): Volume {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  return _volumeAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
}

// ---------------------------------------------------------------------------
// Wire up dispatch hooks — extend prior hooks to also handle volume.
// (Will be overridden by index.ts with the final composed dispatch.)
// ---------------------------------------------------------------------------

const _prevAs  = core.hooks._asImpl;
const _prevAdd = core.hooks._addImpl;
const _prevSub = core.hooks._subImpl;
const _prevMul = core.hooks._mulImpl;
const _prevDiv = core.hooks._divImpl;

core.hooks._asImpl = (self, targetUnit) => {
  if (isVolume(self)) return _volumeAsImpl(self, targetUnit);
  return _prevAs(self, targetUnit);
};

core.hooks._addImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isVolume(a) && isVolume(bNorm)) {
    const sumM3 = _m3(toM3(a).value + toM3(bNorm).value);
    return _volumeAsImpl(sumM3, a.unit);
  }
  return _prevAdd(a, b);
};

core.hooks._subImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isVolume(a) && isVolume(bNorm)) {
    const diffM3 = _m3(toM3(a).value - toM3(bNorm).value);
    return _volumeAsImpl(diffM3, a.unit);
  }
  return _prevSub(a, b);
};

core.hooks._mulImpl = (a, factor) => {
  if (isVolume(a)) return _volumeAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
  return _prevMul(a, factor);
};

core.hooks._divImpl = (a, divisor) => {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isVolume(a)) return _volumeAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
  return _prevDiv(a, divisor);
};
