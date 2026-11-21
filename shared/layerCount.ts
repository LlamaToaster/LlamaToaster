// The layer count a model file shows on the Optimize and Models pages.
//
// GGUF's block_count (ModelMetadata.n_layer) counts the MTP (multi-token-
// prediction) head as one more block when a quant keeps it, so one 64-layer
// model reads 65 in one quant and 64 in another: on Qwen3.8-27B, 21 quants keep
// the head (block_count 65, nextn_predict_layers 1) and the five UD-IQ1/IQ2
// quants drop it (block_count 64). The transformer count, n_layer minus the
// head, is the same in every quant. llama.cpp's own "offloaded X/Y layers" total
// is n_layer + 1 (the output layer), see ResultRow.total_model_layers.

export interface LayerCountFields {
  n_layer: number;
  mtp_layers?: number | null;
}

/** The model's transformer layers: the same in every quant of one model. */
export function transformerLayerCount(m: LayerCountFields): number {
  return Math.max(0, m.n_layer - (m.mtp_layers ?? 0));
}

/** "64 layers", or "64 layers + MTP head" for a file that keeps the head. */
export function fileLayerLabel(m: LayerCountFields): string {
  const n = transformerLayerCount(m);
  return m.mtp_layers ? `${n} layers + MTP head` : `${n} layers`;
}
