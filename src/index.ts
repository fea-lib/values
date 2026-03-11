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

import { isLength }   from "./length.js";
import { isAngle }    from "./angle.js";
import { isArea }     from "./area.js";
import { isVolume }   from "./volume.js";
import { isMoney }    from "./money.js";

import {
  μm as _μm, mm as _mm, cm as _cm, m as _m, km as _km,
  inch as _inch, ft as _ft, yd as _yd, mile as _mile,
  toM as _lengthToM,
} from "./length.js";
import { rad as _rad, _angleAsImpl } from "./angle.js";
import {
  m2 as _m2,
  _areaAsImpl,
} from "./area.js";
import {
  m3 as _m3,
  _volumeAsImpl,
} from "./volume.js";
import { eur as _eur } from "./money.js";

import type { Length }           from "./length.js";
import type { Degrees, Radians } from "./angle.js";
import type { Area }             from "./area.js";
import type { Volume }           from "./volume.js";
import type { Money }            from "./money.js";

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
): { value: number; unit: string } {
  if (isLength(self)) {
    switch (targetUnit) {
      case "μm":   return _μm(self);
      case "mm":   return _mm(self);
      case "cm":   return _cm(self);
      case "m":    return _m(self);
      case "km":   return _km(self);
      case "inch": return _inch(self);
      case "ft":   return _ft(self);
      case "yd":   return _yd(self);
      case "mile": return _mile(self);
    }
    throw new TypeError(`as: cannot convert "${self.unit}" to "${targetUnit}" — incompatible or unknown units`);
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
): { value: number; unit: string } {
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
): { value: number; unit: string } {
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
): { value: number; unit: string } {
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
): { value: number; unit: string } {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isMoney(a)) return _eur(a.value / divisor);
  const scaled = { ...a, value: a.value / divisor } as never;
  return composedAs(scaled, a.unit);
}

// ---------------------------------------------------------------------------
// Rewire core hooks with the composed dispatch
// ---------------------------------------------------------------------------

core.hooks._asImpl  = composedAs;
core.hooks._addImpl = composedAdd;
core.hooks._subImpl = composedSub;
core.hooks._mulImpl = composedMul;
core.hooks._divImpl = composedDiv;
