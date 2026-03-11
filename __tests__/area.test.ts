import { describe, it, expect } from "vitest";
import {
  mm, cm, m, km, inch, ft, yd,
  mm2, cm2, m2, km2, in2, ft2, yd2, acre, ha,
  isArea,
  AREA_UNITS,
} from "../src/index.js";
import * as area from "../src/area.js";

// ---------------------------------------------------------------------------
// Constructors — plain number
// ---------------------------------------------------------------------------

describe("area constructors (number)", () => {
  it("mm2(n) stores value and unit", () => {
    const v = mm2(100);
    expect(v.value).toBe(100);
    expect(v.unit).toBe("mm2");
  });

  it("cm2(n) stores value and unit", () => {
    const v = cm2(50);
    expect(v.value).toBe(50);
    expect(v.unit).toBe("cm2");
  });

  it("m2(n) stores value and unit", () => {
    const v = m2(2);
    expect(v.value).toBe(2);
    expect(v.unit).toBe("m2");
  });

  it("km2(n) stores value and unit", () => {
    expect(km2(1).unit).toBe("km2");
  });

  it("in2(n) stores value and unit", () => {
    expect(in2(6).unit).toBe("in2");
  });

  it("ft2(n) stores value and unit", () => {
    expect(ft2(9).unit).toBe("ft2");
  });

  it("yd2(n) stores value and unit", () => {
    expect(yd2(3).unit).toBe("yd2");
  });

  it("acre(n) stores value and unit", () => {
    expect(acre(1).unit).toBe("acre");
  });

  it("ha(n) stores value and unit", () => {
    expect(ha(1).unit).toBe("ha");
  });
});

// ---------------------------------------------------------------------------
// toString()
// ---------------------------------------------------------------------------

describe("toString()", () => {
  it("mm2 uses ' mm²'",  () => expect(mm2(5).toString()).toBe("5 mm²"));
  it("cm2 uses ' cm²'",  () => expect(cm2(5).toString()).toBe("5 cm²"));
  it("m2 uses ' m²'",    () => expect(m2(5).toString()).toBe("5 m²"));
  it("km2 uses ' km²'",  () => expect(km2(5).toString()).toBe("5 km²"));
  it("in2 uses ' in²'",  () => expect(in2(5).toString()).toBe("5 in²"));
  it("ft2 uses ' ft²'",  () => expect(ft2(5).toString()).toBe("5 ft²"));
  it("yd2 uses ' yd²'",  () => expect(yd2(5).toString()).toBe("5 yd²"));
  it("acre uses ' acre'",() => expect(acre(5).toString()).toBe("5 acre"));
  it("ha uses ' ha'",    () => expect(ha(5).toString()).toBe("5 ha"));
});

// ---------------------------------------------------------------------------
// AREA_UNITS set
// ---------------------------------------------------------------------------

describe("AREA_UNITS", () => {
  it("contains all clean unit keys", () => {
    for (const u of ["mm2", "cm2", "m2", "km2", "in2", "ft2", "yd2", "acre", "ha"]) {
      expect(AREA_UNITS.has(u)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Overloaded constructors — from two lengths
// ---------------------------------------------------------------------------

describe("area constructors (two lengths)", () => {
  it("m2(m, m) computes correctly", () => {
    const result = m2(m(2), m(3));
    expect(result.value).toBeCloseTo(6);
    expect(result.unit).toBe("m2");
  });

  it("cm2(cm, cm) computes correctly", () => {
    // 10cm * 10cm = 100cm²
    const result = cm2(cm(10), cm(10));
    expect(result.value).toBeCloseTo(100);
    expect(result.unit).toBe("cm2");
  });

  it("mm2(mm, mm) computes 100mm * 100mm = 10000mm²", () => {
    const result = mm2(mm(100), mm(100));
    expect(result.value).toBeCloseTo(10_000);
    expect(result.unit).toBe("mm2");
  });

  it("m2(cm, cm) cross-unit length", () => {
    // 100cm * 100cm = 1m * 1m = 1m²
    const result = m2(cm(100), cm(100));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("m2");
  });

  it("ft2(ft, ft) computes correctly", () => {
    const result = ft2(ft(3), ft(4));
    expect(result.value).toBeCloseTo(12);
    expect(result.unit).toBe("ft2");
  });
});

// ---------------------------------------------------------------------------
// Overloaded constructors — from existing area
// ---------------------------------------------------------------------------

describe("area constructors (from area)", () => {
  it("cm2(m2(1)) converts m2 → cm2", () => {
    const result = cm2(m2(1));
    expect(result.value).toBeCloseTo(10_000);
    expect(result.unit).toBe("cm2");
  });

  it("mm2(m2(1)) converts m2 → mm2", () => {
    const result = mm2(m2(1));
    expect(result.value).toBeCloseTo(1_000_000);
    expect(result.unit).toBe("mm2");
  });

  it("m2(cm2(10000)) converts cm2 → m2", () => {
    const result = m2(cm2(10_000));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("m2");
  });

  it("km2(m2(1000000)) converts m2 → km2", () => {
    const result = km2(m2(1_000_000));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("km2");
  });

  it("m2(mm2(1000000)) converts mm2 → m2", () => {
    const result = m2(mm2(1_000_000));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("m2");
  });

  it("m2(in2(1)) converts in2 → m2", () => {
    const result = m2(in2(1));
    expect(result.value).toBeCloseTo(0.000_645_16);
    expect(result.unit).toBe("m2");
  });

  it("m2(ft2(1)) converts ft2 → m2", () => {
    const result = m2(ft2(1));
    expect(result.value).toBeCloseTo(0.092_903_04);
    expect(result.unit).toBe("m2");
  });

  it("m2(yd2(1)) converts yd2 → m2", () => {
    const result = m2(yd2(1));
    expect(result.value).toBeCloseTo(0.836_127_36);
    expect(result.unit).toBe("m2");
  });

  it("m2(acre(1)) converts acre → m2", () => {
    const result = m2(acre(1));
    expect(result.value).toBeCloseTo(4_046.856_422_4);
    expect(result.unit).toBe("m2");
  });

  it("m2(ha(1)) converts ha → m2", () => {
    const result = m2(ha(1));
    expect(result.value).toBeCloseTo(10_000);
    expect(result.unit).toBe("m2");
  });

  it("m2(m2(5)) identity", () => {
    const result = m2(m2(5));
    expect(result.value).toBe(5);
    expect(result.unit).toBe("m2");
  });

  it("ha(m2(10000)) converts m2 → ha", () => {
    const result = ha(m2(10_000));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("ha");
  });
});

// ---------------------------------------------------------------------------
// Roundtrip conversions
// ---------------------------------------------------------------------------

describe("roundtrip conversions", () => {
  it("m2 → cm2 → m2", () => expect(m2(cm2(m2(3))).value).toBeCloseTo(3));
  it("m2 → mm2 → m2", () => expect(m2(mm2(m2(2))).value).toBeCloseTo(2));
  it("ha → m2 → ha",  () => expect(ha(m2(ha(5))).value).toBeCloseTo(5));
});

// ---------------------------------------------------------------------------
// .as()
// ---------------------------------------------------------------------------

describe(".as()", () => {
  it("m2.as('cm2')", () => {
    const result = m2(1).as("cm2");
    expect(result.value).toBeCloseTo(10_000);
    expect(result.unit).toBe("cm2");
  });

  it("ha.as('m2')", () => {
    const result = ha(1).as("m2");
    expect(result.value).toBeCloseTo(10_000);
    expect(result.unit).toBe("m2");
  });

  it("cross-category .as() throws", () => {
    expect(() => m2(1).as("mm" as never)).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isArea()", () => {
  it("returns true for all area constructors", () => {
    expect(isArea(mm2(1))).toBe(true);
    expect(isArea(cm2(1))).toBe(true);
    expect(isArea(m2(1))).toBe(true);
    expect(isArea(km2(1))).toBe(true);
    expect(isArea(in2(1))).toBe(true);
    expect(isArea(ft2(1))).toBe(true);
    expect(isArea(yd2(1))).toBe(true);
    expect(isArea(acre(1))).toBe(true);
    expect(isArea(ha(1))).toBe(true);
  });

  it("returns false for lengths", () => {
    expect(isArea(mm(5))).toBe(false);
    expect(isArea(m(1))).toBe(false);
  });

  it("returns false for plain values", () => {
    expect(isArea(42)).toBe(false);
    expect(isArea(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Standalone arithmetic
// ---------------------------------------------------------------------------

describe("standalone add()", () => {
  it("same unit", () => {
    const result = area.add(m2(3), m2(2));
    expect(result.value).toBeCloseTo(5);
    expect(result.unit).toBe("m2");
  });

  it("cross-unit (m2 + cm2), result in m2", () => {
    // 1m² + 10000cm² = 1m² + 1m² = 2m²
    const result = area.add(m2(1), cm2(10_000));
    expect(result.value).toBeCloseTo(2);
    expect(result.unit).toBe("m2");
  });

  it("plain number (treated as same unit)", () => {
    const result = area.add(m2(3), 2);
    expect(result.value).toBeCloseTo(5);
    expect(result.unit).toBe("m2");
  });
});

describe("standalone sub()", () => {
  it("same unit", () => {
    const result = area.sub(m2(5), m2(2));
    expect(result.value).toBeCloseTo(3);
    expect(result.unit).toBe("m2");
  });
});

describe("standalone mul()", () => {
  it("scales the value", () => {
    const result = area.mul(m2(4), 3);
    expect(result.value).toBeCloseTo(12);
    expect(result.unit).toBe("m2");
  });
});

describe("standalone div()", () => {
  it("divides the value", () => {
    const result = area.div(m2(12), 4);
    expect(result.value).toBeCloseTo(3);
    expect(result.unit).toBe("m2");
  });

  it("throws on zero", () => {
    expect(() => area.div(m2(1), 0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Method forms
// ---------------------------------------------------------------------------

describe("method .add()", () => {
  it("same unit", () => {
    const result = cm2(10).add(cm2(5));
    expect(result.value).toBeCloseTo(15);
    expect(result.unit).toBe("cm2");
  });
});

describe("method .mul() / .div()", () => {
  it(".mul()", () => {
    const result = ha(2).mul(3);
    expect(result.value).toBeCloseTo(6);
    expect(result.unit).toBe("ha");
  });

  it(".div()", () => {
    const result = ha(6).div(2);
    expect(result.value).toBeCloseTo(3);
    expect(result.unit).toBe("ha");
  });

  it(".div() throws on zero", () => {
    expect(() => ha(1).div(0)).toThrow(RangeError);
  });
});
