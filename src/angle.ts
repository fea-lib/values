// ---------------------------------------------------------------------------
// angle.ts — angle unit constructors, types, converters
// ---------------------------------------------------------------------------

import { measure } from "./core.js";
import * as core from "./core.js";

// ---------------------------------------------------------------------------
// Internal (private) primitive constructors — plain number only.
// ---------------------------------------------------------------------------

const _deg = measure("deg", "°");
const _rad = measure("rad", " rad");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Degrees = ReturnType<typeof _deg>;
export type Radians = ReturnType<typeof _rad>;

// ---------------------------------------------------------------------------
// Union types
// ---------------------------------------------------------------------------

/**
 * A rotation angle input. Accepts:
 * - `number` — treated as radians (same convention as JSCAD's raw rotate())
 * - `deg(n)` — degrees
 * - `rad(n)` — explicit radians
 */
export type Angle = number | Degrees | Radians;

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export const ANGLE_UNITS = new Set<string>(["deg", "rad"]);

/** Returns true if `value` is a tagged angle object (`deg()` or `rad()`). Plain numbers return false. */
export function isAngle(value: unknown): value is Degrees | Radians {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value &&
    typeof (value as Record<string, unknown>).value === "number" &&
    ANGLE_UNITS.has((value as Record<string, unknown>).unit as string)
  );
}

// ---------------------------------------------------------------------------
// Internal angle converters (private — not exported)
// ---------------------------------------------------------------------------

function _toRad(value: Degrees | Radians): Radians {
  switch (value.unit) {
    case "deg":
      return _rad(value.value * (Math.PI / 180));
    default:
      return value as Radians;
  }
}

function _toDeg(value: Degrees | Radians): Degrees {
  switch (value.unit) {
    case "rad":
      return _deg(value.value * (180 / Math.PI));
    default:
      return value as Degrees;
  }
}

// ---------------------------------------------------------------------------
// Public overloaded constructors
// ---------------------------------------------------------------------------

export function deg(n: number): Degrees;
export function deg(v: Radians): Degrees;
export function deg(v: Degrees): Degrees;
export function deg(v: Degrees | Radians): Degrees;
export function deg(a: number | Radians | Degrees): Degrees {
  if (typeof a === "number") return _deg(a);
  return _toDeg(a);
}

export function rad(n: number): Radians;
export function rad(v: Degrees): Radians;
export function rad(v: Radians): Radians;
export function rad(v: Degrees | Radians): Radians;
export function rad(a: number | Degrees | Radians): Radians {
  if (typeof a === "number") return _rad(a);
  return _toRad(a);
}

// ---------------------------------------------------------------------------
// Internal angle .as() dispatcher
// ---------------------------------------------------------------------------

export function _angleAsImpl(
  self: { value: number; unit: string },
  targetUnit: string,
): Degrees | Radians {
  switch (targetUnit) {
    case "deg": return _toDeg(self as Degrees | Radians);
    case "rad": return _toRad(self as Degrees | Radians);
    default:
      throw new TypeError(
        `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
      );
  }
}

// ---------------------------------------------------------------------------
// Standalone arithmetic functions (prefer method forms: a.add(b), etc.)
// ---------------------------------------------------------------------------

function normaliseBAngle(
  a: { value: number; unit: string },
  b: Degrees | Radians | number,
): Degrees | Radians {
  if (typeof b === "number") {
    return { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never;
  }
  return b;
}

export function add(a: Degrees | Radians, b: Degrees | Radians | number): Degrees | Radians {
  const bNorm = normaliseBAngle(a, b);
  const sumRad = _rad(_toRad(a).value + _toRad(bNorm).value);
  return _angleAsImpl(sumRad, a.unit);
}

export function sub(a: Degrees | Radians, b: Degrees | Radians | number): Degrees | Radians {
  const bNorm = normaliseBAngle(a, b);
  const diffRad = _rad(_toRad(a).value - _toRad(bNorm).value);
  return _angleAsImpl(diffRad, a.unit);
}

export function mul(a: Degrees | Radians, factor: number): Degrees | Radians {
  return _angleAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
}

export function div(a: Degrees | Radians, divisor: number): Degrees | Radians {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  return _angleAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
}

// ---------------------------------------------------------------------------
// Wire up dispatch hooks — extend prior hooks to also handle angles.
// (Will be overridden by index.ts with the final composed dispatch.)
// ---------------------------------------------------------------------------

const _prevAs = core.hooks._asImpl;
const _prevAdd = core.hooks._addImpl;
const _prevSub = core.hooks._subImpl;
const _prevMul = core.hooks._mulImpl;
const _prevDiv = core.hooks._divImpl;

core.hooks._asImpl = (self, targetUnit) => {
  if (isAngle(self)) return _angleAsImpl(self, targetUnit);
  return _prevAs(self, targetUnit);
};

core.hooks._addImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isAngle(a) && isAngle(bNorm)) {
    const sumRad = _rad(_toRad(a).value + _toRad(bNorm).value);
    return _angleAsImpl(sumRad, a.unit);
  }
  return _prevAdd(a, b);
};

core.hooks._subImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isAngle(a) && isAngle(bNorm)) {
    const diffRad = _rad(_toRad(a).value - _toRad(bNorm).value);
    return _angleAsImpl(diffRad, a.unit);
  }
  return _prevSub(a, b);
};

core.hooks._mulImpl = (a, factor) => {
  if (isAngle(a)) return _angleAsImpl({ value: a.value * factor, unit: a.unit } as never, a.unit);
  return _prevMul(a, factor);
};

core.hooks._divImpl = (a, divisor) => {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isAngle(a)) return _angleAsImpl({ value: a.value / divisor, unit: a.unit } as never, a.unit);
  return _prevDiv(a, divisor);
};
