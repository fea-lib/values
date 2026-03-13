// ---------------------------------------------------------------------------
// index.ts — public barrel + composed multi-category dispatch
//
// This file:
//   1. Re-exports all category modules
//   2. Rewires the core dispatch hooks with a composed implementation
//      that routes by category type guard (length → angle → area → volume → money)
// ---------------------------------------------------------------------------

export * from "./length.js";
export * from "./angle.js";
export * from "./area.js";
export * from "./volume.js";
export * from "./money.js";

import * as core from "./core.js";
import type { MeasureValue } from "./core.js";

import { isLength } from "./length.js";
import { isAngle } from "./angle.js";
import { isArea } from "./area.js";
import { isVolume } from "./volume.js";
import { isMoney } from "./money.js";

import {
  μm as _μm,
  mm as _mm,
  cm as _cm,
  m as _m,
  km as _km,
  inch as _inch,
  ft as _ft,
  yd as _yd,
  mile as _mile,
  toM as _lengthToM,
  add as _lengthAdd,
  sub as _lengthSub,
  mul as _lengthMul,
  div as _lengthDiv,
} from "./length.js";
import { rad as _rad, _angleAsImpl, add as _angleAdd, sub as _angleSub, mul as _angleMul, div as _angleDiv } from "./angle.js";
import { m2 as _m2, _areaAsImpl, add as _areaAdd, sub as _areaSub, mul as _areaMul, div as _areaDiv } from "./area.js";
import { m3 as _m3, _volumeAsImpl, add as _volumeAdd, sub as _volumeSub, mul as _volumeMul, div as _volumeDiv } from "./volume.js";
import { eur as _eur, add as _moneyAdd, sub as _moneySub, mul as _moneyMul, div as _moneyDiv } from "./money.js";

import type { Length } from "./length.js";
import type { Degrees, Radians } from "./angle.js";
import type { Area } from "./area.js";
import type { Volume } from "./volume.js";
import type { Money } from "./money.js";

// ---------------------------------------------------------------------------
// Measure — top-level union
// ---------------------------------------------------------------------------

/** Union of all tagged measure types across all categories. */
export type Measure = Length | Degrees | Radians | Area | Volume | Money;

/** Returns true if `v` is any tagged measure object (any category, any unit). */
export function isMeasure(v: unknown): v is Measure {
  return isLength(v) || isAngle(v) || isArea(v) || isVolume(v) || isMoney(v);
}

// ---------------------------------------------------------------------------
// Helper: build a minimal tagged raw object
// ---------------------------------------------------------------------------

function mkRaw(value: number, unit: string): { value: number; unit: string } {
  return { value, unit, toString: () => `${value}${unit}` } as never;
}

// ---------------------------------------------------------------------------
// Composed .as() dispatcher
// ---------------------------------------------------------------------------

function composedAs(
  self: { value: number; unit: string },
  targetUnit: string,
): MeasureValue<string> {
  if (isLength(self)) {
    switch (targetUnit) {
      case "μm":
        return _μm(self);
      case "mm":
        return _mm(self);
      case "cm":
        return _cm(self);
      case "m":
        return _m(self);
      case "km":
        return _km(self);
      case "inch":
        return _inch(self);
      case "ft":
        return _ft(self);
      case "yd":
        return _yd(self);
      case "mile":
        return _mile(self);
    }
    throw new TypeError(
      `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
    );
  }
  if (isAngle(self)) {
    return _angleAsImpl(self, targetUnit);
  }
  if (isArea(self)) {
    return _areaAsImpl(self, targetUnit);
  }
  if (isVolume(self)) {
    return _volumeAsImpl(self, targetUnit);
  }
  if (isMoney(self)) {
    throw new TypeError(
      "as: currency conversion requires an exchange rate — use a dedicated conversion function",
    );
  }
  throw new TypeError(
    `as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`,
  );
}

// ---------------------------------------------------------------------------
// Composed .add() dispatcher
// ---------------------------------------------------------------------------

function composedAdd(
  a: { value: number; unit: string },
  b: { value: number; unit: string } | number,
): MeasureValue<string> {
  const bNorm = typeof b === "number" ? mkRaw(b, a.unit) : b;

  if (isLength(a) && isLength(bNorm)) {
    // anchor via mm (using _lengthToM → multiply by 1000 to get mm equivalent)
    const aMm = _lengthToM(a).value * 1000;
    const bMm = _lengthToM(bNorm).value * 1000;
    const sumMm = _mm(aMm + bMm);
    return composedAs(sumMm, a.unit);
  }
  if (isAngle(a) && isAngle(bNorm)) {
    const aRad = (_angleAsImpl(a, "rad") as { value: number }).value;
    const bRad = (_angleAsImpl(bNorm, "rad") as { value: number }).value;
    const sumRad = _rad(aRad + bRad);
    return composedAs(sumRad, a.unit);
  }
  if (isArea(a) && isArea(bNorm)) {
    const aM2 = (_areaAsImpl(a, "m2") as { value: number }).value;
    const bM2 = (_areaAsImpl(bNorm, "m2") as { value: number }).value;
    const total = _m2(aM2 + bM2);
    return composedAs(total, a.unit);
  }
  if (isVolume(a) && isVolume(bNorm)) {
    const aM3 = (_volumeAsImpl(a, "m3") as { value: number }).value;
    const bM3 = (_volumeAsImpl(bNorm, "m3") as { value: number }).value;
    const total = _m3(aM3 + bM3);
    return composedAs(total, a.unit);
  }
  if (isMoney(a) && isMoney(bNorm)) {
    return _eur(a.value + bNorm.value);
  }
  throw new TypeError(
    `add: cannot mix incompatible categories ("${a.unit}" and "${bNorm.unit}")`,
  );
}

// ---------------------------------------------------------------------------
// Composed .sub() dispatcher
// ---------------------------------------------------------------------------

function composedSub(
  a: { value: number; unit: string },
  b: { value: number; unit: string } | number,
): MeasureValue<string> {
  const bNorm = typeof b === "number" ? mkRaw(b, a.unit) : b;

  if (isLength(a) && isLength(bNorm)) {
    const aMm = _lengthToM(a).value * 1000;
    const bMm = _lengthToM(bNorm).value * 1000;
    const diffMm = _mm(aMm - bMm);
    return composedAs(diffMm, a.unit);
  }
  if (isAngle(a) && isAngle(bNorm)) {
    const aRad = (_angleAsImpl(a, "rad") as { value: number }).value;
    const bRad = (_angleAsImpl(bNorm, "rad") as { value: number }).value;
    const diffRad = _rad(aRad - bRad);
    return composedAs(diffRad, a.unit);
  }
  if (isArea(a) && isArea(bNorm)) {
    const aM2 = (_areaAsImpl(a, "m2") as { value: number }).value;
    const bM2 = (_areaAsImpl(bNorm, "m2") as { value: number }).value;
    const total = _m2(aM2 - bM2);
    return composedAs(total, a.unit);
  }
  if (isVolume(a) && isVolume(bNorm)) {
    const aM3 = (_volumeAsImpl(a, "m3") as { value: number }).value;
    const bM3 = (_volumeAsImpl(bNorm, "m3") as { value: number }).value;
    const total = _m3(aM3 - bM3);
    return composedAs(total, a.unit);
  }
  if (isMoney(a) && isMoney(bNorm)) {
    return _eur(a.value - bNorm.value);
  }
  throw new TypeError(
    `sub: cannot mix incompatible categories ("${a.unit}" and "${bNorm.unit}")`,
  );
}

// ---------------------------------------------------------------------------
// Composed .mul() dispatcher
// ---------------------------------------------------------------------------

function composedMul(
  a: { value: number; unit: string },
  factor: number,
): MeasureValue<string> {
  if (isMoney(a)) return _eur(a.value * factor);
  const scaled = { ...a, value: a.value * factor } as never;
  return composedAs(scaled, a.unit);
}

// ---------------------------------------------------------------------------
// Composed .div() dispatcher
// ---------------------------------------------------------------------------

function composedDiv(
  a: { value: number; unit: string },
  divisor: number,
): MeasureValue<string> {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isMoney(a)) return _eur(a.value / divisor);
  const scaled = { ...a, value: a.value / divisor } as never;
  return composedAs(scaled, a.unit);
}

// ---------------------------------------------------------------------------
// Rewire core hooks with the composed dispatch
// ---------------------------------------------------------------------------

core.hooks._asImpl = composedAs;
core.hooks._addImpl = composedAdd;
core.hooks._subImpl = composedSub;
core.hooks._mulImpl = composedMul;
core.hooks._divImpl = composedDiv;

// ---------------------------------------------------------------------------
// Explicit overloaded exports for add / sub / mul / div
//
// Each of length, angle, area, volume and money exports its own `add`, `sub`,
// `mul` and `div`.  When all five are re-exported via `export *` TypeScript
// sees an ambiguous binding and resolves every call site to `never`.
//
// The fix: provide a single explicit overloaded export for each name here.
// Explicit named exports always win over wildcard re-exports, so these
// declarations shadow the five conflicting `export *` bindings.
// ---------------------------------------------------------------------------

export function add(a: Length,            b: Length | number):            Length;
export function add(a: Degrees | Radians, b: Degrees | Radians | number): Degrees | Radians;
export function add(a: Area,              b: Area | number):              Area;
export function add(a: Volume,            b: Volume | number):            Volume;
export function add(a: Money,             b: Money | number):             Money;
export function add(
  a: Length | Degrees | Radians | Area | Volume | Money,
  b: Length | Degrees | Radians | Area | Volume | Money | number,
): Length | Degrees | Radians | Area | Volume | Money {
  if (isLength(a))  return _lengthAdd(a,  b as Length | number);
  if (isAngle(a))   return _angleAdd(a,   b as Degrees | Radians | number);
  if (isArea(a))    return _areaAdd(a,    b as Area | number);
  if (isVolume(a))  return _volumeAdd(a,  b as Volume | number);
  if (isMoney(a))   return _moneyAdd(a,   b as Money | number);
  throw new TypeError("add: unsupported measure type");
}

export function sub(a: Length,            b: Length | number):            Length;
export function sub(a: Degrees | Radians, b: Degrees | Radians | number): Degrees | Radians;
export function sub(a: Area,              b: Area | number):              Area;
export function sub(a: Volume,            b: Volume | number):            Volume;
export function sub(a: Money,             b: Money | number):             Money;
export function sub(
  a: Length | Degrees | Radians | Area | Volume | Money,
  b: Length | Degrees | Radians | Area | Volume | Money | number,
): Length | Degrees | Radians | Area | Volume | Money {
  if (isLength(a))  return _lengthSub(a,  b as Length | number);
  if (isAngle(a))   return _angleSub(a,   b as Degrees | Radians | number);
  if (isArea(a))    return _areaSub(a,    b as Area | number);
  if (isVolume(a))  return _volumeSub(a,  b as Volume | number);
  if (isMoney(a))   return _moneySub(a,   b as Money | number);
  throw new TypeError("sub: unsupported measure type");
}

export function mul(a: Length,            factor: number): Length;
export function mul(a: Degrees | Radians, factor: number): Degrees | Radians;
export function mul(a: Area,              factor: number): Area;
export function mul(a: Volume,            factor: number): Volume;
export function mul(a: Money,             factor: number): Money;
export function mul(
  a: Length | Degrees | Radians | Area | Volume | Money,
  factor: number,
): Length | Degrees | Radians | Area | Volume | Money {
  if (isLength(a))  return _lengthMul(a,  factor);
  if (isAngle(a))   return _angleMul(a,   factor);
  if (isArea(a))    return _areaMul(a,    factor);
  if (isVolume(a))  return _volumeMul(a,  factor);
  if (isMoney(a))   return _moneyMul(a,   factor);
  throw new TypeError("mul: unsupported measure type");
}

export function div(a: Length,            divisor: number): Length;
export function div(a: Degrees | Radians, divisor: number): Degrees | Radians;
export function div(a: Area,              divisor: number): Area;
export function div(a: Volume,            divisor: number): Volume;
export function div(a: Money,             divisor: number): Money;
export function div(
  a: Length | Degrees | Radians | Area | Volume | Money,
  divisor: number,
): Length | Degrees | Radians | Area | Volume | Money {
  if (isLength(a))  return _lengthDiv(a,  divisor);
  if (isAngle(a))   return _angleDiv(a,   divisor);
  if (isArea(a))    return _areaDiv(a,    divisor);
  if (isVolume(a))  return _volumeDiv(a,  divisor);
  if (isMoney(a))   return _moneyDiv(a,   divisor);
  throw new TypeError("div: unsupported measure type");
}
