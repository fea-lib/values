import { describe, it, expect } from "vitest";
import {
  deg, rad,
  isAngle,
  ANGLE_UNITS,
} from "../src/index.js";
import * as angle from "../src/angle.js";

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

describe("unit constructors", () => {
  it("deg() stores value and unit", () => {
    const v = deg(90);
    expect(v.value).toBe(90);
    expect(v.unit).toBe("deg");
  });

  it("rad() stores value and unit", () => {
    const v = rad(Math.PI);
    expect(v.value).toBeCloseTo(Math.PI);
    expect(v.unit).toBe("rad");
  });
});

// ---------------------------------------------------------------------------
// toString()
// ---------------------------------------------------------------------------

describe("toString()", () => {
  it("deg uses '°' display", () => expect(deg(90).toString()).toBe("90°"));
  it("rad uses ' rad' display", () => expect(rad(Math.PI).toString()).toBe(`${Math.PI} rad`));
  it("deg(0) toString", () => expect(deg(0).toString()).toBe("0°"));
});

// ---------------------------------------------------------------------------
// ANGLE_UNITS set
// ---------------------------------------------------------------------------

describe("ANGLE_UNITS", () => {
  it("contains 'deg' and 'rad'", () => {
    expect(ANGLE_UNITS.has("deg")).toBe(true);
    expect(ANGLE_UNITS.has("rad")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Constructors accepting the other angle type
// ---------------------------------------------------------------------------

describe("rad(deg(x))", () => {
  it("deg(180) → π rad", () => expect(rad(deg(180)).value).toBeCloseTo(Math.PI));
  it("deg(90) → π/2 rad", () => expect(rad(deg(90)).value).toBeCloseTo(Math.PI / 2));
  it("deg(0) → 0 rad", () => expect(rad(deg(0)).value).toBeCloseTo(0));
  it("rad(rad(x)) identity", () => expect(rad(rad(Math.PI)).value).toBeCloseTo(Math.PI));
  it("result unit is 'rad'", () => expect(rad(deg(90)).unit).toBe("rad"));
});

describe("deg(rad(x))", () => {
  it("rad(π) → 180°", () => expect(deg(rad(Math.PI)).value).toBeCloseTo(180));
  it("rad(π/2) → 90°", () => expect(deg(rad(Math.PI / 2)).value).toBeCloseTo(90));
  it("deg(deg(x)) identity", () => expect(deg(deg(45)).value).toBeCloseTo(45));
  it("result unit is 'deg'", () => expect(deg(rad(Math.PI)).unit).toBe("deg"));
});

// ---------------------------------------------------------------------------
// Roundtrip conversions
// ---------------------------------------------------------------------------

describe("roundtrip conversions", () => {
  it("deg → rad → deg", () => expect(deg(rad(rad(deg(270)))).value).toBeCloseTo(270));
  it("rad → deg → rad", () => expect(rad(deg(deg(rad(1)))).value).toBeCloseTo(1));
});

// ---------------------------------------------------------------------------
// .as()
// ---------------------------------------------------------------------------

describe(".as()", () => {
  it("deg.as('rad')", () => {
    const result = deg(180).as("rad");
    expect(result.value).toBeCloseTo(Math.PI);
    expect(result.unit).toBe("rad");
  });

  it("rad.as('deg')", () => {
    const result = rad(Math.PI).as("deg");
    expect(result.value).toBeCloseTo(180);
    expect(result.unit).toBe("deg");
  });

  it("cross-category .as() throws", () => {
    expect(() => deg(90).as("mm" as never)).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isAngle()", () => {
  it("returns true for deg and rad", () => {
    expect(isAngle(deg(90))).toBe(true);
    expect(isAngle(rad(Math.PI))).toBe(true);
  });

  it("returns false for plain numbers", () => {
    expect(isAngle(42)).toBe(false);
    expect(isAngle(null)).toBe(false);
    expect(isAngle(undefined)).toBe(false);
  });

  it("returns false for objects without the right shape", () => {
    expect(isAngle({ value: 90 })).toBe(false);
    expect(isAngle({ unit: "deg" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Standalone arithmetic
// ---------------------------------------------------------------------------

describe("standalone add()", () => {
  it("same unit (deg + deg)", () => {
    const result = angle.add(deg(90), deg(90));
    expect(result.value).toBeCloseTo(180);
    expect(result.unit).toBe("deg");
  });

  it("cross-unit (deg + rad), result in deg", () => {
    // deg(180) + rad(π) = 360°
    const result = angle.add(deg(180), rad(Math.PI));
    expect(result.value).toBeCloseTo(360);
    expect(result.unit).toBe("deg");
  });

  it("adds plain number (treated as same unit)", () => {
    const result = angle.add(deg(45), 45);
    expect(result.value).toBeCloseTo(90);
    expect(result.unit).toBe("deg");
  });
});

describe("standalone sub()", () => {
  it("same unit", () => {
    const result = angle.sub(deg(180), deg(90));
    expect(result.value).toBeCloseTo(90);
    expect(result.unit).toBe("deg");
  });

  it("cross-unit", () => {
    const result = angle.sub(deg(360), rad(Math.PI)); // 360° - 180° = 180°
    expect(result.value).toBeCloseTo(180);
    expect(result.unit).toBe("deg");
  });
});

describe("standalone mul()", () => {
  it("scales the value", () => {
    const result = angle.mul(deg(45), 2);
    expect(result.value).toBeCloseTo(90);
    expect(result.unit).toBe("deg");
  });
});

describe("standalone div()", () => {
  it("divides the value", () => {
    const result = angle.div(rad(Math.PI), 2);
    expect(result.value).toBeCloseTo(Math.PI / 2);
    expect(result.unit).toBe("rad");
  });

  it("throws on zero", () => {
    expect(() => angle.div(deg(90), 0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Method forms
// ---------------------------------------------------------------------------

describe("method .add()", () => {
  it("same unit", () => {
    const result = rad(1).add(rad(1));
    expect(result.value).toBeCloseTo(2);
    expect(result.unit).toBe("rad");
  });
});

describe("method .mul()", () => {
  it("returns same unit", () => {
    const result = deg(30).mul(3);
    expect(result.value).toBeCloseTo(90);
    expect(result.unit).toBe("deg");
  });
});

describe("method .div()", () => {
  it("divides correctly", () => {
    const result = deg(180).div(2);
    expect(result.value).toBeCloseTo(90);
    expect(result.unit).toBe("deg");
  });

  it("throws on zero", () => {
    expect(() => deg(90).div(0)).toThrow(RangeError);
  });
});
