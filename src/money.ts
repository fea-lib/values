// ---------------------------------------------------------------------------
// money.ts — money unit constructors, types
// ---------------------------------------------------------------------------

import { measure } from "./core.js";
import * as core from "./core.js";

// ---------------------------------------------------------------------------
// Money unit constructors (internal, used by overloads)
// ---------------------------------------------------------------------------

const _eur = measure("EUR", " EUR");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Euros = ReturnType<typeof _eur>;

/** Union of all supported money types. Extensible when more currencies are added. */
export type Money = Euros;

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

const MONEY_UNITS = new Set<string>(["EUR"]);

/** Returns true if `value` is a tagged money value. */
export function isMoney(value: unknown): value is Money {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value &&
    typeof (value as Record<string, unknown>).value === "number" &&
    MONEY_UNITS.has((value as Record<string, unknown>).unit as string)
  );
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

export function eur(n: number): Euros {
  return _eur(n);
}

// ---------------------------------------------------------------------------
// Internal money .as() dispatcher — always throws
// ---------------------------------------------------------------------------

export function _moneyAsImpl(
  self: { value: number; unit: string },
  targetUnit: string,
): never {
  void targetUnit;
  void self;
  throw new TypeError(
    "as: currency conversion requires an exchange rate — use a dedicated conversion function",
  );
}

// ---------------------------------------------------------------------------
// Wire up dispatch hooks — extend prior hooks to also handle money.
// (Will be overridden by index.ts with the final composed dispatch.)
// ---------------------------------------------------------------------------

const _prevAs  = core.hooks._asImpl;
const _prevAdd = core.hooks._addImpl;
const _prevSub = core.hooks._subImpl;
const _prevMul = core.hooks._mulImpl;
const _prevDiv = core.hooks._divImpl;

core.hooks._asImpl = (self, targetUnit) => {
  if (isMoney(self)) return _moneyAsImpl(self, targetUnit);
  return _prevAs(self, targetUnit);
};

core.hooks._addImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isMoney(a) && isMoney(bNorm)) {
    return _eur(a.value + bNorm.value);
  }
  return _prevAdd(a, b);
};

core.hooks._subImpl = (a, b) => {
  const bNorm: { value: number; unit: string } =
    typeof b === "number"
      ? { value: b, unit: a.unit, toString: () => `${b}${a.unit}` } as never
      : b;
  if (isMoney(a) && isMoney(bNorm)) {
    return _eur(a.value - bNorm.value);
  }
  return _prevSub(a, b);
};

core.hooks._mulImpl = (a, factor) => {
  if (isMoney(a)) return _eur(a.value * factor);
  return _prevMul(a, factor);
};

core.hooks._divImpl = (a, divisor) => {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  if (isMoney(a)) return _eur(a.value / divisor);
  return _prevDiv(a, divisor);
};

// ---------------------------------------------------------------------------
// Standalone arithmetic helpers
// ---------------------------------------------------------------------------

export function add(a: Money, b: Money | number): Money {
  const bVal = typeof b === "number" ? b : b.value;
  return _eur(a.value + bVal);
}

export function sub(a: Money, b: Money | number): Money {
  const bVal = typeof b === "number" ? b : b.value;
  return _eur(a.value - bVal);
}

export function mul(a: Money, factor: number): Money {
  return _eur(a.value * factor);
}

export function div(a: Money, divisor: number): Money {
  if (divisor === 0) throw new RangeError("div: cannot divide by zero");
  return _eur(a.value / divisor);
}
