import { describe, it, expect } from "vitest";
import {
  μm, mm, cm, m, km, inch, ft, yd, mile,
  isLength,
  convertTo,
  formatMeasure,
  LENGTH_UNITS,
} from "../src/index.js";
import { add, sub, mul, div } from "../src/length.js";

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

describe("unit constructors", () => {
  it("μm() stores value and unit", () => {
    const v = μm(500);
    expect(v.value).toBe(500);
    expect(v.unit).toBe("μm");
  });

  it("mm() stores value and unit", () => {
    const v = mm(25);
    expect(v.value).toBe(25);
    expect(v.unit).toBe("mm");
  });

  it("cm() stores value and unit", () => {
    const v = cm(10);
    expect(v.value).toBe(10);
    expect(v.unit).toBe("cm");
  });

  it("m() stores value and unit", () => {
    const v = m(1.5);
    expect(v.value).toBe(1.5);
    expect(v.unit).toBe("m");
  });

  it("km() stores value and unit", () => {
    const v = km(2);
    expect(v.value).toBe(2);
    expect(v.unit).toBe("km");
  });

  it("inch() stores value and unit", () => {
    const v = inch(12);
    expect(v.value).toBe(12);
    expect(v.unit).toBe("inch");
  });

  it("ft() stores value and unit", () => {
    const v = ft(6);
    expect(v.value).toBe(6);
    expect(v.unit).toBe("ft");
  });

  it("yd() stores value and unit", () => {
    const v = yd(2);
    expect(v.value).toBe(2);
    expect(v.unit).toBe("yd");
  });

  it("mile() stores value and unit", () => {
    const v = mile(1);
    expect(v.value).toBe(1);
    expect(v.unit).toBe("mile");
  });
});

// ---------------------------------------------------------------------------
// toString() — unitToPrint display strings
// ---------------------------------------------------------------------------

describe("toString()", () => {
  it("μm uses display ' μm'",  () => expect(μm(1).toString()).toBe("1 μm"));
  it("mm uses display ' mm'",  () => expect(mm(10).toString()).toBe("10 mm"));
  it("cm uses display ' cm'",  () => expect(cm(42).toString()).toBe("42 cm"));
  it("m uses display ' m'",    () => expect(m(1.5).toString()).toBe("1.5 m"));
  it("km uses display ' km'",  () => expect(km(2).toString()).toBe("2 km"));
  it("inch uses display '\"'", () => expect(inch(6).toString()).toBe('6"'));
  it("ft uses display ' ft'",  () => expect(ft(6).toString()).toBe("6 ft"));
  it("yd uses display ' yd'",  () => expect(yd(3).toString()).toBe("3 yd"));
  it("mile uses display ' mi'",() => expect(mile(1).toString()).toBe("1 mi"));
});

// ---------------------------------------------------------------------------
// LENGTH_UNITS set
// ---------------------------------------------------------------------------

describe("LENGTH_UNITS", () => {
  it("contains all clean unit keys", () => {
    expect(LENGTH_UNITS.has("μm")).toBe(true);
    expect(LENGTH_UNITS.has("mm")).toBe(true);
    expect(LENGTH_UNITS.has("cm")).toBe(true);
    expect(LENGTH_UNITS.has("m")).toBe(true);
    expect(LENGTH_UNITS.has("km")).toBe(true);
    expect(LENGTH_UNITS.has("inch")).toBe(true);
    expect(LENGTH_UNITS.has("ft")).toBe(true);
    expect(LENGTH_UNITS.has("yd")).toBe(true);
    expect(LENGTH_UNITS.has("mile")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Constructor conversions (replaces toXxx describe blocks)
// ---------------------------------------------------------------------------

describe("mm(length) — convert to mm", () => {
  it("μm → mm", () => expect(mm(μm(1000)).value).toBeCloseTo(1));
  it("cm → mm", () => expect(mm(cm(1)).value).toBeCloseTo(10));
  it("m → mm",  () => expect(mm(m(1)).value).toBeCloseTo(1000));
  it("km → mm", () => expect(mm(km(1)).value).toBeCloseTo(1_000_000));
  it("inch → mm", () => expect(mm(inch(1)).value).toBeCloseTo(25.4));
  it("ft → mm",   () => expect(mm(ft(1)).value).toBeCloseTo(304.8));
  it("mile → mm", () => expect(mm(mile(1)).value).toBeCloseTo(1_609_344));
  it("mm → mm (identity)", () => expect(mm(mm(50)).value).toBe(50));
  it("result unit is 'mm'", () => expect(mm(cm(1)).unit).toBe("mm"));
});

describe("cm(length) — convert to cm", () => {
  it("μm → cm", () => expect(cm(μm(10000)).value).toBeCloseTo(1));
  it("mm → cm", () => expect(cm(mm(100)).value).toBeCloseTo(10));
  it("m → cm",  () => expect(cm(m(1)).value).toBeCloseTo(100));
  it("km → cm", () => expect(cm(km(1)).value).toBeCloseTo(100_000));
  it("inch → cm", () => expect(cm(inch(1)).value).toBeCloseTo(2.54));
  it("ft → cm",   () => expect(cm(ft(1)).value).toBeCloseTo(30.48));
  it("mile → cm", () => expect(cm(mile(1)).value).toBeCloseTo(160_934.4));
  it("cm → cm (identity)", () => expect(cm(cm(50)).value).toBe(50));
});

describe("m(length) — convert to m", () => {
  it("μm → m", () => expect(m(μm(1_000_000)).value).toBeCloseTo(1));
  it("mm → m", () => expect(m(mm(1000)).value).toBeCloseTo(1));
  it("cm → m", () => expect(m(cm(100)).value).toBeCloseTo(1));
  it("km → m", () => expect(m(km(1)).value).toBeCloseTo(1000));
  it("inch → m", () => expect(m(inch(1)).value).toBeCloseTo(0.0254));
  it("ft → m",   () => expect(m(ft(1)).value).toBeCloseTo(0.3048));
  it("mile → m", () => expect(m(mile(1)).value).toBeCloseTo(1609.344));
  it("m → m (identity)", () => expect(m(m(2)).value).toBe(2));
});

describe("km(length) — convert to km", () => {
  it("m → km",   () => expect(km(m(1000)).value).toBeCloseTo(1));
  it("mile → km",() => expect(km(mile(1)).value).toBeCloseTo(1.609344));
  it("km → km (identity)", () => expect(km(km(5)).value).toBe(5));
});

describe("μm(length) — convert to μm", () => {
  it("mm → μm", () => expect(μm(mm(1)).value).toBeCloseTo(1000));
  it("cm → μm", () => expect(μm(cm(1)).value).toBeCloseTo(10_000));
  it("μm → μm (identity)", () => expect(μm(μm(500)).value).toBe(500));
});

describe("inch(length) — convert to inch", () => {
  it("cm → inch", () => expect(inch(cm(2.54)).value).toBeCloseTo(1));
  it("mm → inch", () => expect(inch(mm(25.4)).value).toBeCloseTo(1));
  it("m → inch",  () => expect(inch(m(0.0254)).value).toBeCloseTo(1));
  it("ft → inch", () => expect(inch(ft(1)).value).toBeCloseTo(12));
  it("yd → inch", () => expect(inch(yd(1)).value).toBeCloseTo(36));
  it("inch → inch (identity)", () => expect(inch(inch(6)).value).toBe(6));
});

describe("ft(length) — convert to ft", () => {
  it("inch → ft", () => expect(ft(inch(12)).value).toBeCloseTo(1));
  it("m → ft",    () => expect(ft(m(1)).value).toBeCloseTo(3.28084, 4));
  it("yd → ft",   () => expect(ft(yd(1)).value).toBeCloseTo(3));
  it("ft → ft (identity)", () => expect(ft(ft(3)).value).toBe(3));
});

describe("yd(length) — convert to yd", () => {
  it("ft → yd",   () => expect(yd(ft(3)).value).toBeCloseTo(1));
  it("m → yd",    () => expect(yd(m(0.9144)).value).toBeCloseTo(1));
  it("inch → yd", () => expect(yd(inch(36)).value).toBeCloseTo(1));
  it("mile → yd", () => expect(yd(mile(1)).value).toBeCloseTo(1760));
  it("yd → yd (identity)", () => expect(yd(yd(5)).value).toBe(5));
});

describe("mile(length) — convert to mile", () => {
  it("ft → mile",  () => expect(mile(ft(5280)).value).toBeCloseTo(1));
  it("yd → mile",  () => expect(mile(yd(1760)).value).toBeCloseTo(1));
  it("km → mile",  () => expect(mile(km(1.609344)).value).toBeCloseTo(1));
  it("mile → mile (identity)", () => expect(mile(mile(2)).value).toBe(2));
});

// ---------------------------------------------------------------------------
// Roundtrip conversions
// ---------------------------------------------------------------------------

describe("roundtrip conversions", () => {
  it("cm → mm → cm", () => expect(cm(mm(cm(42))).value).toBeCloseTo(42));
  it("m → cm → m",   () => expect(m(cm(m(2.13))).value).toBeCloseTo(2.13));
  it("ft → inch → ft", () => expect(ft(inch(ft(5))).value).toBeCloseTo(5));
  it("yd → ft → yd",   () => expect(yd(ft(yd(3))).value).toBeCloseTo(3));
});

// ---------------------------------------------------------------------------
// .as() method
// ---------------------------------------------------------------------------

describe(".as()", () => {
  it("mm.as('cm') converts correctly", () => {
    const result = mm(100).as("cm");
    expect(result.value).toBeCloseTo(10);
    expect(result.unit).toBe("cm");
  });

  it("m.as('ft') converts correctly", () => {
    expect(m(1).as("ft").value).toBeCloseTo(3.28084, 4);
  });

  it("roundtrip via .as()", () => {
    expect(cm(42).as("mm").as("cm").value).toBeCloseTo(42);
  });

  it("cross-category .as() throws", () => {
    expect(() => mm(1).as("EUR" as never)).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isLength()", () => {
  it("returns true for all length constructors", () => {
    expect(isLength(μm(100))).toBe(true);
    expect(isLength(mm(5))).toBe(true);
    expect(isLength(cm(10))).toBe(true);
    expect(isLength(m(1))).toBe(true);
    expect(isLength(km(1))).toBe(true);
    expect(isLength(inch(2))).toBe(true);
    expect(isLength(ft(6))).toBe(true);
    expect(isLength(yd(2))).toBe(true);
    expect(isLength(mile(1))).toBe(true);
  });

  it("returns false for plain numbers and non-objects", () => {
    expect(isLength(42)).toBe(false);
    expect(isLength(null)).toBe(false);
    expect(isLength(undefined)).toBe(false);
    expect(isLength("mm")).toBe(false);
  });

  it("returns false for objects without the right shape", () => {
    expect(isLength({ value: 10 })).toBe(false);
    expect(isLength({ unit: "cm" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Standalone add / sub / mul / div
// ---------------------------------------------------------------------------

describe("standalone add()", () => {
  it("same unit", () => {
    const result = add(cm(10), cm(5));
    expect(result.value).toBeCloseTo(15);
    expect(result.unit).toBe("cm");
  });

  it("cross-unit (mm + cm), result in mm", () => {
    const result = add(mm(10), cm(1)); // 10mm + 10mm = 20mm
    expect(result.value).toBeCloseTo(20);
    expect(result.unit).toBe("mm");
  });

  it("adds plain number (treated as same unit)", () => {
    const result = add(cm(5), 3);
    expect(result.value).toBeCloseTo(8);
    expect(result.unit).toBe("cm");
  });
});

describe("standalone sub()", () => {
  it("same unit", () => {
    const result = sub(cm(10), cm(4));
    expect(result.value).toBeCloseTo(6);
    expect(result.unit).toBe("cm");
  });

  it("cross-unit (cm - mm), result in cm", () => {
    const result = sub(cm(5), mm(10)); // 5cm - 1cm = 4cm
    expect(result.value).toBeCloseTo(4);
    expect(result.unit).toBe("cm");
  });
});

describe("standalone mul()", () => {
  it("multiplies value", () => {
    const result = mul(cm(3), 4);
    expect(result.value).toBeCloseTo(12);
    expect(result.unit).toBe("cm");
  });
});

describe("standalone div()", () => {
  it("divides value", () => {
    const result = div(m(6), 2);
    expect(result.value).toBeCloseTo(3);
    expect(result.unit).toBe("m");
  });

  it("throws on divide-by-zero", () => {
    expect(() => div(m(1), 0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Method forms (.add, .sub, .mul, .div)
// ---------------------------------------------------------------------------

describe("method .add()", () => {
  it("same unit", () => {
    const result = mm(10).add(mm(5));
    expect(result.value).toBeCloseTo(15);
    expect(result.unit).toBe("mm");
  });

  it("cross-unit", () => {
    const result = cm(1).add(mm(10)); // 1cm + 1cm = 2cm
    expect(result.value).toBeCloseTo(2);
    expect(result.unit).toBe("cm");
  });
});

describe("method .mul()", () => {
  it("returns same unit", () => {
    const result = ft(3).mul(2);
    expect(result.value).toBeCloseTo(6);
    expect(result.unit).toBe("ft");
  });
});

describe("method .div()", () => {
  it("divides correctly", () => {
    const result = m(10).div(2);
    expect(result.value).toBeCloseTo(5);
    expect(result.unit).toBe("m");
  });

  it("throws on zero", () => {
    expect(() => m(1).div(0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// convertTo
// ---------------------------------------------------------------------------

describe("convertTo()", () => {
  it("converts to target unit", () => {
    const result = convertTo(m(1), "cm");
    expect(result.value).toBeCloseTo(100);
    expect(result.unit).toBe("cm");
  });

  it("converts mm to inch", () => {
    const result = convertTo(mm(25.4), "inch");
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("inch");
  });
});

// ---------------------------------------------------------------------------
// formatMeasure
// ---------------------------------------------------------------------------

describe("formatMeasure()", () => {
  it("returns toString() output", () => {
    expect(formatMeasure(cm(42))).toBe("42 cm");
    expect(formatMeasure(inch(6))).toBe('6"');
    expect(formatMeasure(mile(1))).toBe("1 mi");
  });
});
