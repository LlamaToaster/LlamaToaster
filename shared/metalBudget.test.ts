import { describe, expect, it } from "vitest";
import { estimateMetalWorkingSetMib, resolveMetalBudget } from "./metalBudget";

const GIB = 1024;

describe("estimateMetalWorkingSetMib", () => {
  it("is two thirds of RAM up to 36 GiB", () => {
    expect(estimateMetalWorkingSetMib(16 * GIB)).toBe(Math.round((16 * GIB * 2) / 3));
    expect(estimateMetalWorkingSetMib(32 * GIB)).toBe(Math.round((32 * GIB * 2) / 3));
  });
  it("is three quarters above 36 GiB", () => {
    expect(estimateMetalWorkingSetMib(64 * GIB)).toBe(48 * GIB);
    expect(estimateMetalWorkingSetMib(96 * GIB)).toBe(72 * GIB);
  });
  it("is 0 for no memory", () => {
    expect(estimateMetalWorkingSetMib(0)).toBe(0);
  });
});

describe("resolveMetalBudget", () => {
  it("prefers what llama.cpp listed", () => {
    expect(resolveMetalBudget({ totalMib: 32 * GIB, listedMib: 21845, wiredLimitMib: 28000 })).toEqual({ mib: 21845, source: "listed" });
  });
  it("uses a non-zero iogpu.wired_limit_mb next, capped at the installed RAM", () => {
    expect(resolveMetalBudget({ totalMib: 32 * GIB, wiredLimitMib: 28000 })).toEqual({ mib: 28000, source: "sysctl" });
    expect(resolveMetalBudget({ totalMib: 16 * GIB, wiredLimitMib: 99999 })).toEqual({ mib: 16 * GIB, source: "sysctl" });
  });
  it("treats a zero sysctl as the default and falls back to the estimate", () => {
    expect(resolveMetalBudget({ totalMib: 64 * GIB, wiredLimitMib: 0 })).toEqual({ mib: 48 * GIB, source: "estimate" });
  });
  it("is null without a RAM total", () => {
    expect(resolveMetalBudget({ totalMib: 0 })).toBeNull();
  });
});
