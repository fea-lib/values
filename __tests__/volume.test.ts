import { describe, it, expect } from "vitest";
import {
  mm, cm, m,
  μl, ml, cl, dl, l, cm3, m3, in3, ft3, floz, pint, qt, gal,
  isVolume,
  VOLUME_UNITS,
} from "../src/index.js";
import * as volume from "../src/volume.js";

// ---------------------------------------------------------------------------
// Constructors — plain number
// ---------------------------------------------------------------------------

describe("volume constructors (number)", () => {
  it("μl(n) stores value and unit", () => {
    expect(μl(500).value).toBe(500);
    expect(μl(500).unit).toBe("μl");
  });

  it("ml(n) stores value and unit", () => {
    expect(ml(250).value).toBe(250);
    expect(ml(250).unit).toBe("ml");
  });

  it("cl(n)", () => expect(cl(33).unit).toBe("cl"));
  it("dl(n)", () => expect(dl(3).unit).toBe("dl"));
  it("l(n)",  () => expect(l(1).unit).toBe("l"));
  it("cm3(n)",() => expect(cm3(1000).unit).toBe("cm3"));
  it("m3(n)", () => expect(m3(1).unit).toBe("m3"));
  it("in3(n)", () => expect(in3(61).unit).toBe("in3"));
  it("ft3(n)", () => expect(ft3(1).unit).toBe("ft3"));
  it("floz(n)",() => expect(floz(8).unit).toBe("floz"));
  it("pint(n)",() => expect(pint(2).unit).toBe("pint"));
  it("qt(n)",  () => expect(qt(1).unit).toBe("qt"));
  it("gal(n)", () => expect(gal(1).unit).toBe("gal"));
});

// ---------------------------------------------------------------------------
// toString()
// ---------------------------------------------------------------------------

describe("toString()", () => {
  it("μl uses ' μl'",   () => expect(μl(1).toString()).toBe("1 μl"));
  it("ml uses ' ml'",   () => expect(ml(1).toString()).toBe("1 ml"));
  it("cl uses ' cl'",   () => expect(cl(1).toString()).toBe("1 cl"));
  it("dl uses ' dl'",   () => expect(dl(1).toString()).toBe("1 dl"));
  it("l uses ' l'",     () => expect(l(1).toString()).toBe("1 l"));
  it("cm3 uses ' cm³'", () => expect(cm3(1).toString()).toBe("1 cm³"));
  it("m3 uses ' m³'",   () => expect(m3(1).toString()).toBe("1 m³"));
  it("in3 uses ' in³'", () => expect(in3(1).toString()).toBe("1 in³"));
  it("ft3 uses ' ft³'", () => expect(ft3(1).toString()).toBe("1 ft³"));
  it("floz uses ' fl oz'", () => expect(floz(1).toString()).toBe("1 fl oz"));
  it("pint uses ' pint'",  () => expect(pint(1).toString()).toBe("1 pint"));
  it("qt uses ' qt'",   () => expect(qt(1).toString()).toBe("1 qt"));
  it("gal uses ' gal'", () => expect(gal(1).toString()).toBe("1 gal"));
});

// ---------------------------------------------------------------------------
// VOLUME_UNITS set
// ---------------------------------------------------------------------------

describe("VOLUME_UNITS", () => {
  it("contains all clean unit keys", () => {
    for (const u of ["μl", "ml", "cl", "dl", "l", "cm3", "m3", "in3", "ft3", "floz", "pint", "qt", "gal"]) {
      expect(VOLUME_UNITS.has(u)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Overloaded constructors — from three lengths
// ---------------------------------------------------------------------------

describe("volume constructors (three lengths)", () => {
  it("m3(m, m, m)", () => {
    const result = m3(m(2), m(3), m(4));
    expect(result.value).toBeCloseTo(24);
    expect(result.unit).toBe("m3");
  });

  it("l(m, m, m) — 1m³ = 1000l", () => {
    const result = l(m(1), m(1), m(1));
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("l");
  });

  it("cm3(cm, cm, cm)", () => {
    // 10cm * 10cm * 10cm = 1000cm³
    const result = cm3(cm(10), cm(10), cm(10));
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("cm3");
  });

  it("ml(cm, cm, cm) — 10cm * 10cm * 10cm = 1000ml", () => {
    // 0.1m * 0.1m * 0.1m = 0.001m³ = 1000ml
    const result = ml(cm(10), cm(10), cm(10));
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("ml");
  });

  it("cross-unit lengths", () => {
    // 1m * 1m * 100cm = 1m * 1m * 1m = 1m³
    const result = m3(m(1), m(1), cm(100));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("m3");
  });
});

// ---------------------------------------------------------------------------
// Overloaded constructors — from existing volume
// ---------------------------------------------------------------------------

describe("volume constructors (from volume)", () => {
  it("ml(l(1)) converts l → ml", () => {
    const result = ml(l(1));
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("ml");
  });

  it("l(ml(500)) converts ml → l", () => {
    const result = l(ml(500));
    expect(result.value).toBeCloseTo(0.5);
    expect(result.unit).toBe("l");
  });

  it("m3(l(1000)) converts l → m3", () => {
    const result = m3(l(1000));
    expect(result.value).toBeCloseTo(1);
    expect(result.unit).toBe("m3");
  });

  it("m3(μl(1_000_000_000)) converts μl → m3", () => {
    expect(m3(μl(1_000_000_000)).value).toBeCloseTo(1);
  });

  it("m3(ml(1_000_000)) converts ml → m3", () => {
    expect(m3(ml(1_000_000)).value).toBeCloseTo(1);
  });

  it("m3(cl(100_000)) converts cl → m3", () => {
    expect(m3(cl(100_000)).value).toBeCloseTo(1);
  });

  it("m3(dl(10_000)) converts dl → m3", () => {
    expect(m3(dl(10_000)).value).toBeCloseTo(1);
  });

  it("m3(cm3(1_000_000)) converts cm3 → m3", () => {
    expect(m3(cm3(1_000_000)).value).toBeCloseTo(1);
  });

  it("m3(in3(1)) converts in3 → m3", () => {
    expect(m3(in3(1)).value).toBeCloseTo(0.000_016_387_064);
  });

  it("m3(ft3(1)) converts ft3 → m3", () => {
    expect(m3(ft3(1)).value).toBeCloseTo(0.028_316_846_592);
  });

  it("m3(floz(1)) converts floz → m3", () => {
    expect(m3(floz(1)).value).toBeCloseTo(0.000_029_573_529_6);
  });

  it("m3(pint(1)) converts pint → m3", () => {
    expect(m3(pint(1)).value).toBeCloseTo(0.000_473_176_473);
  });

  it("m3(qt(1)) converts qt → m3", () => {
    expect(m3(qt(1)).value).toBeCloseTo(0.000_946_352_946);
  });

  it("m3(gal(1)) converts gal → m3", () => {
    expect(m3(gal(1)).value).toBeCloseTo(0.003_785_411_784);
  });

  it("m3(m3(2)) identity", () => {
    expect(m3(m3(2)).value).toBe(2);
  });

  it("l(m3(1)) converts m3 → l", () => {
    expect(l(m3(1)).value).toBeCloseTo(1000);
  });

  it("ml(l(1)) converts l → ml (identity check)", () => {
    expect(ml(ml(250)).value).toBeCloseTo(250);
  });

  it("cm3(m3(1)) converts m3 → cm3", () => {
    expect(cm3(m3(1)).value).toBeCloseTo(1_000_000);
  });

  it("μl(ml(1)) converts ml → μl", () => {
    expect(μl(ml(1)).value).toBeCloseTo(1000);
  });

  it("cl(l(1)) converts l → cl", () => {
    expect(cl(l(1)).value).toBeCloseTo(100);
  });

  it("dl(l(1)) converts l → dl", () => {
    expect(dl(l(1)).value).toBeCloseTo(10);
  });

  it("in3(m3(x)) converts m3 → in3", () => {
    expect(in3(m3(0.000_016_387_064)).value).toBeCloseTo(1);
  });

  it("ft3(m3(x)) converts m3 → ft3", () => {
    expect(ft3(m3(0.028_316_846_592)).value).toBeCloseTo(1);
  });

  it("floz(m3(x)) converts m3 → floz", () => {
    expect(floz(m3(0.000_029_573_529_6)).value).toBeCloseTo(1);
  });

  it("pint(m3(x)) converts m3 → pint", () => {
    expect(pint(m3(0.000_473_176_473)).value).toBeCloseTo(1);
  });

  it("qt(m3(x)) converts m3 → qt", () => {
    expect(qt(m3(0.000_946_352_946)).value).toBeCloseTo(1);
  });

  it("gal(m3(x)) converts m3 → gal", () => {
    expect(gal(m3(0.003_785_411_784)).value).toBeCloseTo(1);
  });
});

// ---------------------------------------------------------------------------
// Roundtrip conversions
// ---------------------------------------------------------------------------

describe("roundtrip conversions", () => {
  it("l → ml → l", () => expect(l(ml(l(3))).value).toBeCloseTo(3));
  it("m3 → cm3 → m3", () => expect(m3(cm3(m3(2))).value).toBeCloseTo(2));
  it("l → gal → l", () => expect(l(gal(l(3.785411784))).value).toBeCloseTo(3.785411784));
});

// ---------------------------------------------------------------------------
// .as()
// ---------------------------------------------------------------------------

describe(".as()", () => {
  it("l.as('ml')", () => {
    const result = l(1).as("ml");
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("ml");
  });

  it("m3.as('l')", () => {
    const result = m3(1).as("l");
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("l");
  });

  it("cross-category .as() throws", () => {
    expect(() => l(1).as("mm" as never)).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isVolume()", () => {
  it("returns true for all volume constructors", () => {
    expect(isVolume(μl(1))).toBe(true);
    expect(isVolume(ml(1))).toBe(true);
    expect(isVolume(cl(1))).toBe(true);
    expect(isVolume(dl(1))).toBe(true);
    expect(isVolume(l(1))).toBe(true);
    expect(isVolume(cm3(1))).toBe(true);
    expect(isVolume(m3(1))).toBe(true);
    expect(isVolume(in3(1))).toBe(true);
    expect(isVolume(ft3(1))).toBe(true);
    expect(isVolume(floz(1))).toBe(true);
    expect(isVolume(pint(1))).toBe(true);
    expect(isVolume(qt(1))).toBe(true);
    expect(isVolume(gal(1))).toBe(true);
  });

  it("returns false for lengths", () => {
    expect(isVolume(m(1))).toBe(false);
    expect(isVolume(mm(1))).toBe(false);
  });

  it("returns false for plain values", () => {
    expect(isVolume(42)).toBe(false);
    expect(isVolume(null)).toBe(false);
    expect(isVolume(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Standalone arithmetic
// ---------------------------------------------------------------------------

describe("standalone add()", () => {
  it("same unit", () => {
    const result = volume.add(l(2), l(3));
    expect(result.value).toBeCloseTo(5);
    expect(result.unit).toBe("l");
  });

  it("cross-unit (l + ml), result in l", () => {
    // 1l + 500ml = 1l + 0.5l = 1.5l
    const result = volume.add(l(1), ml(500));
    expect(result.value).toBeCloseTo(1.5);
    expect(result.unit).toBe("l");
  });

  it("plain number (treated as same unit)", () => {
    const result = volume.add(l(3), 2);
    expect(result.value).toBeCloseTo(5);
    expect(result.unit).toBe("l");
  });
});

describe("standalone sub()", () => {
  it("same unit", () => {
    const result = volume.sub(l(5), l(2));
    expect(result.value).toBeCloseTo(3);
    expect(result.unit).toBe("l");
  });

  it("cross-unit", () => {
    const result = volume.sub(l(2), ml(500)); // 2l - 0.5l = 1.5l
    expect(result.value).toBeCloseTo(1.5);
    expect(result.unit).toBe("l");
  });
});

describe("standalone mul()", () => {
  it("scales the value", () => {
    const result = volume.mul(l(3), 4);
    expect(result.value).toBeCloseTo(12);
    expect(result.unit).toBe("l");
  });
});

describe("standalone div()", () => {
  it("divides the value", () => {
    const result = volume.div(m3(8), 2);
    expect(result.value).toBeCloseTo(4);
    expect(result.unit).toBe("m3");
  });

  it("throws on zero", () => {
    expect(() => volume.div(l(1), 0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Method forms
// ---------------------------------------------------------------------------

describe("method .add()", () => {
  it("same unit", () => {
    const result = ml(500).add(ml(250));
    expect(result.value).toBeCloseTo(750);
    expect(result.unit).toBe("ml");
  });
});

describe("method .mul() / .div()", () => {
  it(".mul()", () => {
    const result = l(2).mul(3);
    expect(result.value).toBeCloseTo(6);
    expect(result.unit).toBe("l");
  });

  it(".div()", () => {
    const result = l(6).div(3);
    expect(result.value).toBeCloseTo(2);
    expect(result.unit).toBe("l");
  });

  it(".div() throws on zero", () => {
    expect(() => l(1).div(0)).toThrow(RangeError);
  });
});
