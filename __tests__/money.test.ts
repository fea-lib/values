import { describe, it, expect } from "vitest";
import {
  eur,
  isMoney,
  isMeasure,
  mm, deg, m2, l,
} from "../src/index.js";
import * as money from "../src/money.js";

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

describe("eur() constructor", () => {
  it("stores value and unit", () => {
    const v = eur(42.5);
    expect(v.value).toBe(42.5);
    expect(v.unit).toBe("EUR");
  });

  it("eur(0) works", () => {
    const v = eur(0);
    expect(v.value).toBe(0);
    expect(v.unit).toBe("EUR");
  });

  it("negative amounts", () => {
    const v = eur(-10);
    expect(v.value).toBe(-10);
    expect(v.unit).toBe("EUR");
  });
});

// ---------------------------------------------------------------------------
// toString()
// ---------------------------------------------------------------------------

describe("toString()", () => {
  it("uses ' EUR' display", () => expect(eur(100).toString()).toBe("100 EUR"));
  it("zero", () => expect(eur(0).toString()).toBe("0 EUR"));
  it("decimal", () => expect(eur(9.99).toString()).toBe("9.99 EUR"));
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isMoney()", () => {
  it("returns true for eur()", () => {
    expect(isMoney(eur(10))).toBe(true);
    expect(isMoney(eur(0))).toBe(true);
  });

  it("returns false for other measure categories", () => {
    expect(isMoney(mm(5))).toBe(false);
    expect(isMoney(deg(90))).toBe(false);
    expect(isMoney(m2(1))).toBe(false);
    expect(isMoney(l(1))).toBe(false);
  });

  it("returns false for plain values", () => {
    expect(isMoney(42)).toBe(false);
    expect(isMoney(null)).toBe(false);
    expect(isMoney(undefined)).toBe(false);
    expect(isMoney("EUR")).toBe(false);
  });

  it("returns false for objects without right shape", () => {
    expect(isMoney({ value: 10 })).toBe(false);
    expect(isMoney({ unit: "EUR" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isMeasure — covers money too
// ---------------------------------------------------------------------------

describe("isMeasure() with money", () => {
  it("returns true for eur()", () => {
    expect(isMeasure(eur(50))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// .as() — must throw TypeError
// ---------------------------------------------------------------------------

describe(".as() throws", () => {
  it("eur.as('EUR') throws TypeError", () => {
    expect(() => eur(10).as("EUR" as never)).toThrow(TypeError);
  });

  it("eur.as('USD') throws TypeError", () => {
    expect(() => eur(10).as("USD" as never)).toThrow(TypeError);
  });

  it("error message mentions exchange rate", () => {
    expect(() => eur(10).as("USD" as never)).toThrow(
      "as: currency conversion requires an exchange rate",
    );
  });
});

// ---------------------------------------------------------------------------
// Arithmetic methods (via dispatch hooks)
// ---------------------------------------------------------------------------

describe("method .add()", () => {
  it("eur + eur", () => {
    const result = eur(10).add(eur(5));
    expect(result.value).toBeCloseTo(15);
    expect(result.unit).toBe("EUR");
  });

  it("eur + plain number (same unit)", () => {
    const result = eur(10).add(5 as never);
    expect(result.value).toBeCloseTo(15);
    expect(result.unit).toBe("EUR");
  });
});

describe("method .sub()", () => {
  it("eur - eur", () => {
    const result = eur(10).sub(eur(3));
    expect(result.value).toBeCloseTo(7);
    expect(result.unit).toBe("EUR");
  });
});

describe("method .mul()", () => {
  it("eur * scalar", () => {
    const result = eur(5).mul(3);
    expect(result.value).toBeCloseTo(15);
    expect(result.unit).toBe("EUR");
  });
});

describe("method .div()", () => {
  it("eur / scalar", () => {
    const result = eur(10).div(4);
    expect(result.value).toBeCloseTo(2.5);
    expect(result.unit).toBe("EUR");
  });

  it("throws on zero", () => {
    expect(() => eur(10).div(0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Standalone arithmetic (from money module)
// ---------------------------------------------------------------------------

describe("standalone money arithmetic", () => {
  it("add(eur, eur)", () => {
    const result = money.add(eur(4), eur(6));
    expect(result.value).toBeCloseTo(10);
    expect(result.unit).toBe("EUR");
  });

  it("sub(eur, eur)", () => {
    const result = money.sub(eur(10), eur(4));
    expect(result.value).toBeCloseTo(6);
    expect(result.unit).toBe("EUR");
  });

  it("mul(eur, scalar)", () => {
    const result = money.mul(eur(7), 2);
    expect(result.value).toBeCloseTo(14);
    expect(result.unit).toBe("EUR");
  });

  it("div(eur, scalar)", () => {
    const result = money.div(eur(8), 4);
    expect(result.value).toBeCloseTo(2);
    expect(result.unit).toBe("EUR");
  });

  it("div by zero throws", () => {
    expect(() => money.div(eur(1), 0)).toThrow(RangeError);
  });
});
