import { describe, expect, it } from "vitest";
import { auxKind, auxTags, hfAuxKind, hfAuxRole } from "./hfAuxFiles";

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

describe("auxKind", () => {
  it("adds EAGLE3, which Hugging Face does not tag", () => {
    expect(hfAuxKind("Qwen3-8B-speculator.eagle3-F16.gguf")).toBeUndefined();
    expect(auxKind("Qwen3-8B-speculator.eagle3-F16.gguf")).toBe("eagle3");
    expect(auxKind("RedHatAI-gemma-4-31B-it-speculator-eagle3-GGUF-Q4_K_M.gguf")).toBe("eagle3");
    expect(auxKind("eagle-3b-preview.Q5_K_M.gguf")).toBeUndefined();
  });
});

describe("auxTags", () => {
  it("measures against the largest untagged file of the same level, else the smallest untagged one", () => {
    const tags = auxTags([
      { path: "m-Q8_0.gguf", sizeBytes: 1000, level: "8" },
      { path: "m-Q4_K_M.gguf", sizeBytes: 500, level: "4" },
      { path: "MTP/mtp-m-Q8_0.gguf", sizeBytes: 100, level: "8" },
      { path: "m-MTP-Q8_0.gguf", sizeBytes: 900, level: "8" },
      { path: "MTP/mtp-m-BF16.gguf", sizeBytes: 200, level: "16" },
    ]);
    expect(tags.get("MTP/mtp-m-Q8_0.gguf")?.role).toBe("standalone");
    expect(tags.get("m-MTP-Q8_0.gguf")?.role).toBe("model");
    expect(tags.get("MTP/mtp-m-BF16.gguf")?.role).toBe("neutral"); // 200 of the smallest model, 500
    expect(tags.get("MTP/mtp-m-Q8_0.gguf")?.byHf).toBe(true);
    expect(tags.has("m-Q8_0.gguf")).toBe(false);
  });

  it("tags EAGLE3 drafts itself, as standalone", () => {
    const tags = auxTags([
      { path: "m-Q8_0.gguf", sizeBytes: 1000, level: "8" },
      { path: "m-speculator.eagle3-Q8_0.gguf", sizeBytes: 900, level: "8" },
    ]);
    expect(tags.get("m-speculator.eagle3-Q8_0.gguf")).toMatchObject({ label: "EAGLE3", role: "standalone", byHf: false });
    expect(auxTags([{ path: "x-speculator.eagle3-F16.gguf", sizeBytes: 1, level: "16" }]).get("x-speculator.eagle3-F16.gguf")?.byHf).toBe(false);
  });

  it("a repo of drafts only, where Hugging Face shows no badge, gets ours; models named -MTP- stay models", () => {
    const drafts = auxTags([{ path: "dspark-a-Q4_0.gguf", sizeBytes: 1, level: "4" }, { path: "MTP/mtp-a-Q8_0.gguf", sizeBytes: 1, level: "8" }]);
    expect(drafts.get("dspark-a-Q4_0.gguf")).toMatchObject({ label: "DSPARK", role: "standalone", byHf: false });
    expect(drafts.get("MTP/mtp-a-Q8_0.gguf")).toMatchObject({ label: "MTP", byHf: false });
    expect(auxTags([{ path: "Qwen3.6-27B-MTP-Q4_K_M.gguf", sizeBytes: 1, level: "4" }]).size).toBe(0);
  });
});
