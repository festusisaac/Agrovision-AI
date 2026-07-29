"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DEMO_PROFILE, buildContextPreview, getProfileSnapshot, saveProfile, type FarmProfile } from "@/lib/profile";

const STEP_NAMES = ["Farmer", "Farmer", "Farm", "Crop stage", "Conditions"];
const CROP_OPTIONS = [
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
const SIZE_OPTIONS = ["Under 1 hectare", "1–5 hectares", "5–20 hectares", "20+ hectares"];
const RAIN_OPTIONS = ["Today", "2–3 days ago", "Over a week ago", "Not sure"];
const IRRIGATED_OPTIONS = ["Yes", "No"];
const DISEASE_OPTIONS = ["None", "Armyworm", "Leaf blight", "Rust"];
const STAGE_OPTIONS: { label: string; note: string }[] = [
  { label: "Seedling", note: "Just emerged, first leaves opening." },
  { label: "Vegetative", note: "Growing leaves and height, before flowering." },
  { label: "Flowering", note: "Tasselling or silking — the most vulnerable window." },
  { label: "Fruiting", note: "Grain or fruit filling out." },
  { label: "Harvest", note: "Drying down, ready to bring in." },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-[18px] py-[11px] text-[14px] transition-colors ${
        active ? "bg-leaf font-semibold text-[#0A0F0C]" : "border text-fg-muted"
      }`}
      style={active ? undefined : { background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.14)" }}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-[7px] text-[12.5px] text-fg-dim">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[11px] border px-[15px] py-[13px] text-[15px] outline-none"
        style={{ background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.14)" }}
      />
    </div>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => (searchParams.get("step") === "1" ? 1 : 0));
  const [profile, setProfile] = useState<FarmProfile>(() => getProfileSnapshot() ?? DEMO_PROFILE);
  const [customCropMode, setCustomCropMode] = useState(() => !CROP_OPTIONS.includes((getProfileSnapshot() ?? DEMO_PROFILE).crop));
  const [customDiseaseMode, setCustomDiseaseMode] = useState(
    () => !DISEASE_OPTIONS.includes((getProfileSnapshot() ?? DEMO_PROFILE).disease)
  );

  function set<K extends keyof FarmProfile>(key: K, value: FarmProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleSkip() {
    saveProfile(profile);
    router.push("/app/dashboard");
  }

  function handleNext() {
    if (step >= 4) {
      saveProfile(profile);
      router.push("/app/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  }

  const stepNum = Math.max(1, step);
  const stepName = STEP_NAMES[stepNum];
  const progress = (stepNum / 4) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 pb-20">
      <div className="flex w-full max-w-[1280px] items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="AgroVision AI" width={32} height={32} className="object-contain" />
          <span className="font-heading text-[16px] font-semibold tracking-[-0.01em]">AgroVision AI</span>
        </Link>
        <button onClick={handleSkip} className="p-1.5 text-[13px] text-fg-faint hover:text-fg-dim">
          Skip and use the demo farm →
        </button>
      </div>

      <div className="mt-[34px] w-full max-w-[660px]">
        {step === 0 ? (
          <div className="animate-agv-rise text-center">
            <div className="relative h-[230px] overflow-hidden rounded-[20px] border border-[var(--color-border)]">
              <Image
                src="/images/background2.jpg"
                alt="Farmers planting together"
                fill
                className="object-cover"
                style={{ objectPosition: "45% 45%", opacity: 0.7 }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(12,19,15,0.25), rgba(12,19,15,0.95))" }} />
            </div>
            <h1 className="font-heading mt-7 text-[40px] font-semibold leading-[1.08] tracking-[-0.03em]">Welcome to AgroVision AI</h1>
            <p className="mx-auto mt-4 max-w-[44ch] text-[17px] leading-[1.6] text-fg-muted" style={{ textWrap: "pretty" }}>
              Let&apos;s personalise the assistant around your farm — the crop, the stage it is in and where you are.
              Gemma 4 uses that context in every diagnosis.
            </p>
            <div className="mt-[18px] font-mono text-[11px] tracking-[0.08em] text-fg-faint">
              4 STEPS · UNDER A MINUTE · STORED ON THIS DEVICE ONLY
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-7 rounded-xl bg-leaf px-[30px] py-3.5 font-medium text-[15px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Get started
            </button>
          </div>
        ) : (
          <div className="animate-agv-rise">
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">Step {stepNum} of 4</div>
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{stepName}</div>
            </div>
            <div className="mt-[11px] h-1 overflow-hidden rounded-full" style={{ background: "rgba(242,240,230,0.1)" }}>
              <div className="h-full rounded-full bg-leaf transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>

            {step === 1 && (
              <div className="mt-[30px]">
                <h1 className="font-heading text-[32px] font-semibold tracking-[-0.03em]">Who are we working with?</h1>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Your name" value={profile.name} onChange={(v) => set("name", v)} placeholder="Amina Musa" />
                  <Field label="Farm name" value={profile.farm} onChange={(v) => set("farm", v)} placeholder="Kwakwaba Farm" />
                  <Field label="Country" value={profile.country} onChange={(v) => set("country", v)} placeholder="Nigeria" />
                  <Field label="State" value={profile.state} onChange={(v) => set("state", v)} placeholder="Niger" />
                  <Field
                    label="Local government area"
                    value={profile.lga}
                    onChange={(v) => set("lga", v)}
                    placeholder="Bosso"
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-[30px]">
                <h1 className="font-heading text-[32px] font-semibold tracking-[-0.03em]">What do you grow?</h1>
                <div className="mt-[26px] mb-[7px] text-[12.5px] text-fg-dim">Primary crop</div>
                <div className="flex flex-wrap gap-2.5">
                  {CROP_OPTIONS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={!customCropMode && profile.crop === c}
                      onClick={() => {
                        setCustomCropMode(false);
                        set("crop", c);
                      }}
                    />
                  ))}
                  <Chip
                    label="Other"
                    active={customCropMode}
                    onClick={() => {
                      setCustomCropMode(true);
                      if (CROP_OPTIONS.includes(profile.crop)) set("crop", "");
                    }}
                  />
                </div>
                {customCropMode && (
                  <input
                    value={profile.crop}
                    onChange={(e) => set("crop", e.target.value)}
                    placeholder="Type your crop's name…"
                    autoFocus
                    className="mt-2.5 w-full max-w-xs rounded-[11px] border px-[15px] py-[10px] text-[14px] outline-none"
                    style={{ background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.14)" }}
                  />
                )}
                <div className="mt-[26px] mb-[7px] text-[12.5px] text-fg-dim">Farm size</div>
                <div className="flex flex-wrap gap-2.5">
                  {SIZE_OPTIONS.map((s) => (
                    <Chip key={s} label={s} active={profile.size === s} onClick={() => set("size", s)} />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-[30px]">
                <h1 className="font-heading text-[32px] font-semibold tracking-[-0.03em]">What stage is the crop in?</h1>
                <p className="mt-3 max-w-[52ch] text-[14.5px] leading-[1.6] text-fg-dim">
                  Many pests and diseases only appear at particular growth stages — this is the single most useful thing
                  you can tell the model.
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  {STAGE_OPTIONS.map((s) => {
                    const active = profile.stage === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => set("stage", s.label)}
                        className="rounded-[14px] border px-[18px] py-4 text-left"
                        style={
                          active
                            ? { background: "rgba(163,230,53,0.09)", borderColor: "rgba(163,230,53,0.4)" }
                            : { background: "rgba(242,240,230,0.04)", borderColor: "rgba(242,240,230,0.1)" }
                        }
                      >
                        <div
                          className="font-heading text-[16px] font-semibold"
                          style={{ color: active ? "var(--color-leaf)" : "var(--color-foreground)" }}
                        >
                          {s.label}
                        </div>
                        <div
                          className="mt-1 text-[13px] leading-[1.5]"
                          style={{ color: active ? "var(--color-fg-muted)" : "var(--color-fg-dim)" }}
                        >
                          {s.note}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mt-[30px]">
                <h1 className="font-heading text-[32px] font-semibold tracking-[-0.03em]">
                  Anything else? <span className="text-[20px] font-normal text-fg-faint">Optional</span>
                </h1>
                <div className="mt-[26px] mb-[7px] text-[12.5px] text-fg-dim">Last rainfall</div>
                <div className="flex flex-wrap gap-2.5">
                  {RAIN_OPTIONS.map((r) => (
                    <Chip key={r} label={r} active={profile.rainfall === r} onClick={() => set("rainfall", r)} />
                  ))}
                </div>
                <div className="mt-6 mb-[7px] text-[12.5px] text-fg-dim">Do you irrigate?</div>
                <div className="flex flex-wrap gap-2.5">
                  {IRRIGATED_OPTIONS.map((o) => (
                    <Chip key={o} label={o} active={profile.irrigated === o} onClick={() => set("irrigated", o)} />
                  ))}
                </div>
                <div className="mt-6 mb-[7px] text-[12.5px] text-fg-dim">Diseases or pests you have had before</div>
                <div className="flex flex-wrap gap-2.5">
                  {DISEASE_OPTIONS.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      active={!customDiseaseMode && profile.disease === d}
                      onClick={() => {
                        setCustomDiseaseMode(false);
                        set("disease", d);
                      }}
                    />
                  ))}
                  <Chip
                    label="Other"
                    active={customDiseaseMode}
                    onClick={() => {
                      setCustomDiseaseMode(true);
                      if (DISEASE_OPTIONS.includes(profile.disease)) set("disease", "");
                    }}
                  />
                </div>
                {customDiseaseMode && (
                  <input
                    value={profile.disease}
                    onChange={(e) => set("disease", e.target.value)}
                    placeholder="Name the disease or pest…"
                    className="mt-2.5 w-full max-w-xs rounded-[11px] border px-[15px] py-[10px] text-[14px] outline-none"
                    style={{ background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.14)" }}
                  />
                )}

                <div className="mt-6 mb-[7px] text-[12.5px] text-fg-dim">Share scans with nearby farms (Village Watch)?</div>
                <div className="flex flex-wrap gap-2.5">
                  <Chip label="Yes" active={profile.shareToVillageWatch} onClick={() => set("shareToVillageWatch", true)} />
                  <Chip label="No" active={!profile.shareToVillageWatch} onClick={() => set("shareToVillageWatch", false)} />
                </div>
                <p className="mt-2 max-w-[52ch] text-[12.5px] leading-[1.5] text-fg-faint">
                  When you save a diagnosis, your crop, severity and a location rounded to 500 m are added to a shared
                  map so nearby farms get early warning of outbreaks. Off by default — you can change this later in
                  Village Watch. Never shared: your name, farm name, or exact location.
                </p>

                <div
                  className="mt-[26px] rounded-[14px] border p-5"
                  style={{ borderColor: "rgba(163,230,53,0.22)", background: "rgba(163,230,53,0.06)" }}
                >
                  <div className="font-mono text-[10.5px] tracking-[0.12em] text-leaf uppercase">What Gemma will now say</div>
                  <div className="mt-2.5 text-[14.5px] leading-[1.6] text-fg-muted">{buildContextPreview(profile)}</div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3.5">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-xl border border-[var(--color-border)] px-[22px] py-3.5 text-[14.5px] hover:bg-[var(--color-surface)]"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="rounded-xl bg-leaf px-[30px] py-3.5 font-medium text-[15px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                {step >= 4 ? "Open my dashboard" : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
