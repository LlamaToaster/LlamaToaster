import { describe, expect, it } from "vitest";
import { hfAuxKind, hfAuxRole, hfAuxTags } from "./hfAuxFiles";

describe("hfAuxKind (Hugging Face's name test)", () => {
  it("finds the word between separators only", () => {
    expect(hfAuxKind("MTP/mtp-gemma-4-12b-it-Q8_0.gguf")).toBe("mtp");
    expect(hfAuxKind("dspark-MiniCPM-V-4_7-35B-A3B-Q4_0.gguf")).toBe("dspark");
    expect(hfAuxKind("dspark_qwen3_8b_block7.q4_k_m.gguf")).toBe("dspark");
    expect(hfAuxKind("DeepSeek-V4.1-Flash-DSpark.gguf")).toBe("dspark");
    expect(hfAuxKind("gemma4-31b-it-dflash-Q4_K_M.gguf")).toBe("dflash");
    expect(hfAuxKind("Qwen3.8-27B-DFlash2-Q4_K_M.gguf")).toBeUndefined();
    expect(hfAuxKind("gemma-4-12b-it-Q4_K_M.gguf")).toBeUndefined();
  });
});

describe("hfAuxRole", () => {
  it("splits at 30% and 70% of the reference", () => {
    expect(hfAuxRole(29, 100)).toBe("standalone");
    expect(hfAuxRole(30, 100)).toBe("neutral");
    expect(hfAuxRole(70, 100)).toBe("model");
    expect(hfAuxRole(10, undefined)).toBe("neutral");
  });
});

describe("hfAuxTags", () => {
  it("measures against the largest untagged file of the same level, else the smallest untagged one", () => {
    const tags = hfAuxTags([
      { path: "m-Q8_0.gguf", sizeBytes: 1000, level: "8" },
      { path: "m-Q4_K_M.gguf", sizeBytes: 500, level: "4" },
      { path: "MTP/mtp-m-Q8_0.gguf", sizeBytes: 100, level: "8" },
      { path: "m-MTP-Q8_0.gguf", sizeBytes: 900, level: "8" },
      { path: "MTP/mtp-m-BF16.gguf", sizeBytes: 200, level: "16" },
    ]);
    expect(tags.get("MTP/mtp-m-Q8_0.gguf")?.role).toBe("standalone");
    expect(tags.get("m-MTP-Q8_0.gguf")?.role).toBe("model");
    expect(tags.get("MTP/mtp-m-BF16.gguf")?.role).toBe("neutral"); // 200 of the smallest model, 500
    expect(tags.has("m-Q8_0.gguf")).toBe(false);
  });

  it("tags nothing when every file is tagged by name", () => {
    expect(hfAuxTags([{ path: "dspark-a-Q4_0.gguf", sizeBytes: 1, level: "4" }]).size).toBe(0);
  });
});
