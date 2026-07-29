"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mic, Upload } from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import { setPendingCapture } from "@/lib/pendingCapture";
import { useAppPrefs } from "@/lib/appPrefs";
import { getProfileSnapshot } from "@/lib/profile";

const CROPS = [
  "Maize",
  "Rice",
  "Cassava",
  "Yam",
  "Tomato",
  "Pepper",
  "Onion",
  "Cowpea",
  "Groundnut",
  "Soybean",
  "Sorghum",
  "Millet",
  "Plantain",
  "Okra",
];

export default function ScanPage() {
  const router = useRouter();
  const { t, edge, engineLabel } = useAppPrefs();

  const captureInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [rawImageDataUrl, setRawImageDataUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(() => getProfileSnapshot()?.crop || "Maize");
  const [customCropMode, setCustomCropMode] = useState(() => !CROPS.includes(getProfileSnapshot()?.crop || "Maize"));

  const tips = [t.scanTip1, t.scanTip2, t.scanTip3];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageDataUrl(null);
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageDataUrl(reader.result as string);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  }

  function proceedToClarify(finalImage: string) {
    setImageDataUrl(finalImage);
    setCropping(false);
    setPendingCapture(finalImage, selectedCrop);
    router.push("/app/scan/clarify");
  }

  return (
    <div className="animate-agv-rise max-w-[1100px]">
      <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">{t.stepOneOfTwo}</div>
      <h1 className="font-heading mt-2.5 mb-[26px] text-[38px] font-semibold tracking-[-0.03em]">{t.scanTitle}</h1>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1.45fr_1fr]">
        <div>
          <input ref={captureInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {cropping && rawImageDataUrl ? (
            <ImageCropper
              imageSrc={rawImageDataUrl}
              onConfirm={(cropped) => proceedToClarify(cropped)}
              onSkip={() => proceedToClarify(rawImageDataUrl)}
            />
          ) : (
            <div className="relative h-[440px] overflow-hidden rounded-[20px] border border-[var(--color-border)]" style={{ background: "#16211a" }}>
              {imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageDataUrl} alt="Selected leaf" className="h-full w-full object-cover" style={{ objectPosition: "50% 45%" }} />
              ) : (
                <Image src="/images/pic1.jpg" alt="Hands holding a young seedling in soil" fill className="object-cover" style={{ objectPosition: "50% 45%" }} />
              )}
              <div className="pointer-events-none absolute inset-[34px] rounded-[14px] border-[1.5px]" style={{ borderColor: "rgba(163,230,53,0.65)" }} />
              <div
                className="absolute bottom-[44px] left-[44px] rounded-[7px] px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.08em] text-leaf-dark"
                style={{ background: "rgba(10,15,12,0.72)" }}
              >
                {t.liveHoldSteady}
              </div>
            </div>
          )}

          {!cropping && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => captureInputRef.current?.click()}
                className="flex-[2] rounded-[13px] bg-leaf py-4 font-medium text-[15px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                {t.captureAndDiagnose}
              </button>
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[13px] border border-[var(--color-border)] py-4 text-[14px] hover:bg-[var(--color-surface)]"
              >
                <Upload className="h-4 w-4" /> {t.uploadPhoto}
              </button>
              <button
                onClick={() => router.push("/app/assistant")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[13px] border border-[var(--color-border)] py-4 text-[14px] hover:bg-[var(--color-surface)]"
              >
                <Mic className="h-4 w-4" /> {t.describeByVoice}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="rounded-2xl border border-[var(--color-border)] p-5">
            <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.whichCrop}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CROPS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCrop(c);
                    setCustomCropMode(false);
                  }}
                  className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                    !customCropMode && selectedCrop === c
                      ? "bg-leaf text-[#0A0F0C]"
                      : "border border-[var(--color-border)] text-fg-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                onClick={() => {
                  setCustomCropMode(true);
                  setSelectedCrop((prev) => (CROPS.includes(prev) ? "" : prev));
                }}
                className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                  customCropMode ? "bg-leaf text-[#0A0F0C]" : "border border-[var(--color-border)] text-fg-muted"
                }`}
              >
                {t.otherOption}
              </button>
            </div>
            {customCropMode && (
              <input
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                placeholder={t.customCropPlaceholder}
                autoFocus
                className="mt-2.5 w-full rounded-[11px] border px-3 py-2 text-[13px] outline-none"
                style={{ background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.14)" }}
              />
            )}
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] p-5">
            <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.forAGoodPhoto}</div>
            <div className="mt-3 flex flex-col gap-2.5 text-[13.5px] leading-[1.5] text-fg-muted">
              {tips.map((tip, i) => (
                <div key={tip} className="flex gap-2.5">
                  <span className="font-mono text-[11.5px] text-leaf">{String(i + 1).padStart(2, "0")}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "rgba(163,230,53,0.07)", borderColor: "rgba(163,230,53,0.22)" }}
          >
            <p className="text-[13.5px] leading-[1.55] text-fg-muted">
              {engineLabel} — {edge ? t.edgeOfflineNote : t.edgeCloudNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
