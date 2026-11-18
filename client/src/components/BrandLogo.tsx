// The LlamaToaster logo as the browser extension's header shows it: the round
// llama (cut at 1x/2x/3x so the browser never resamples it) and the wordmark
// sticker. "sidebar" fits the 224px sidebar; "compact" the narrow-screen header.

const SIZES = {
  sidebar: { llama: 36, wordmark: 26, gap: "gap-2" },
  compact: { llama: 30, wordmark: 22, gap: "gap-2" },
} as const;

export function BrandLogo({ size = "sidebar" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className={`flex items-center ${s.gap}`}>
      <img
        src="/logo-llama-44.png"
        srcSet="/logo-llama-88.png 2x, /logo-llama-132.png 3x"
        alt=""
        width={s.llama}
        height={s.llama}
        className="block flex-none rounded-full"
      />
      <img src="/logo-wordmark.png" alt="LlamaToaster" height={s.wordmark} style={{ height: s.wordmark, width: "auto" }} className="block" />
    </span>
  );
}
