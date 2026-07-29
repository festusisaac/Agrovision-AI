"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { getCroppedImage } from "@/lib/image";

interface ImageCropperProps {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onSkip: () => void;
}

export default function ImageCropper({ imageSrc, onConfirm, onSkip }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const cropped = await getCroppedImage(imageSrc, croppedAreaPixels);
      onConfirm(cropped);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="mb-4">
      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>
      <p className="mt-2 text-center text-xs text-foreground/60">
        Drag to position, scroll or pinch to zoom — crop to just the diseased spot for the most
        accurate result.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-muted)]"
        >
          Use Full Photo
        </button>
        <button
          onClick={handleApply}
          disabled={applying || !croppedAreaPixels}
          className="flex-1 rounded-lg bg-leaf px-4 py-2.5 text-sm font-medium text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {applying ? "Cropping…" : "Apply Crop"}
        </button>
      </div>
    </div>
  );
}
