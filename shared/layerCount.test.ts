import { describe, expect, it } from "vitest";
import { fileLayerLabel, transformerLayerCount } from "./layerCount";

// Qwen3.8-27B as its GGUF headers say: a quant that keeps the MTP head (65 blocks)
// and one that drops it (64 blocks). Both are the same 64-layer model.
const keepsMtp = { n_layer: 65, mtp_layers: 1 };
const dropsMtp = { n_layer: 64, mtp_layers: 0 };

describe("model layer counts", () => {
  it("counts the same transformer layers whether or not the quant keeps the MTP head", () => {
    expect(transformerLayerCount(keepsMtp)).toBe(64);
    expect(transformerLayerCount(dropsMtp)).toBe(64);
  });

  it("treats a missing mtp_layers as no MTP head", () => {
    expect(transformerLayerCount({ n_layer: 64 })).toBe(64);
    expect(fileLayerLabel({ n_layer: 64, mtp_layers: null })).toBe("64 layers");
  });

  it("names the MTP head only for a file that keeps one", () => {
    expect(fileLayerLabel(keepsMtp)).toBe("64 layers + MTP head");
    expect(fileLayerLabel(dropsMtp)).toBe("64 layers");
  });

  it("never reports a negative count", () => {
    expect(transformerLayerCount({ n_layer: 0, mtp_layers: 1 })).toBe(0);
  });
});
