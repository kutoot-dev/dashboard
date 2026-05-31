"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface MultiPhotoCaptureProps {
  label: string;
  values: string[];
  onChange: (dataUrls: string[]) => void;
  onLocationCaptured?: (coords: { lat: number; long: number; accuracy: number }) => void;
  maxPhotos?: number;
  required?: boolean;
  requireGps?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  /** Use rear-facing device camera (native camera app) instead of in-browser webcam */
  useDeviceCamera?: boolean;
}

const DEFAULT_MAX_PHOTOS = 5;

/**
 * Capture or upload multiple storefront photos with optional GPS watermark.
 * Images are sent as base64 data URLs and persisted to S3 on the backend.
 */
export function MultiPhotoCapture({
  label,
  values,
  onChange,
  onLocationCaptured,
  maxPhotos = DEFAULT_MAX_PHOTOS,
  required,
  requireGps = false,
  error,
  hint,
  className,
  useDeviceCamera = true,
}: MultiPhotoCaptureProps) {
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [gpsError, setGpsError] = useState<string>("");
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  function openDeviceCamera() {
    cameraInputRef.current?.click();
  }

  function openFilePicker() {
    uploadInputRef.current?.click();
  }

  function onCameraInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      void handleFiles([file]);
    }
  }

  function onUploadInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) {
      void handleFiles(files);
    }
  }

  async function handleFiles(files: File[]) {
    const remaining = maxPhotos - values.length;
    if (remaining <= 0) {
      return;
    }

    const accepted = files
      .filter((file) => file.size >= 1024 && file.size <= 10 * 1024 * 1024)
      .slice(0, remaining);

    if (accepted.length === 0) {
      return;
    }

    const watermarked = await Promise.all(
      accepted.map((file) => readAndWatermarkFile(file)),
    );

    const next = [...values, ...watermarked.filter(Boolean) as string[]];
    onChange(next.slice(0, maxPhotos));
  }

  function readAndWatermarkFile(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          resolve(null);
          return;
        }
        addWatermark(reader.result).then(resolve);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  function addWatermark(dataUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        setGpsStatus("Getting location...");
        setGpsError("");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsStatus("");
            const coords = {
              lat: Number(pos.coords.latitude.toFixed(6)),
              long: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Number(pos.coords.accuracy.toFixed(2)),
            };
            onLocationCaptured?.(coords);
            const watermarkText = `${new Date().toLocaleString("en-IN")} | ${coords.lat}, ${coords.long}`;
            applyWatermark(dataUrl, watermarkText).then(resolve);
          },
          () => {
            setGpsStatus("");
            const message = "Location access is required. Enable GPS and try again.";
            setGpsError(message);
            if (!requireGps) {
              const watermarkText = `${new Date().toLocaleString("en-IN")} | GPS unavailable`;
              applyWatermark(dataUrl, watermarkText).then(resolve);
            } else {
              resolve(null);
            }
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } else {
        const message = "Geolocation is not supported on this device.";
        setGpsError(message);
        if (!requireGps) {
          applyWatermark(dataUrl, new Date().toLocaleString("en-IN")).then(resolve);
        } else {
          resolve(null);
        }
      }
    });
  }

  function applyWatermark(dataUrl: string, text: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);

        const barHeight = Math.max(40, Math.round(img.height * 0.06));
        const fontSize = Math.max(14, Math.round(img.width * 0.028));
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, img.height - barHeight, img.width, barHeight);
        ctx.fillStyle = "#ffffff";
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(text, 10, img.height - Math.round(barHeight * 0.35));

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  }

  function removeImage(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  const canAddMore = values.length < maxPhotos;
  const takePhotoLabel = useDeviceCamera ? "Take Photo" : "Open Camera";

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture={useDeviceCamera ? "environment" : undefined}
        className="hidden"
        onChange={onCameraInputChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onUploadInputChange}
      />

      <p className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </p>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Upload up to {maxPhotos} photos of your shop front. Location and timestamp are stamped on each photo.
        </p>
      )}

      {values.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {values.map((url, index) => (
            <div key={`${index}-${url.slice(0, 32)}`} className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Storefront ${index + 1}`}
                className="aspect-square w-full rounded-lg border border-border object-cover"
              />
              <Button variant="ghost" size="sm" onClick={() => removeImage(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={openDeviceCamera}>
            {values.length === 0 ? takePhotoLabel : "Add Photo"}
          </Button>
          <Button variant="secondary" size="sm" onClick={openFilePicker}>
            Upload Images
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {values.length}/{maxPhotos} photos added
      </p>

      {gpsStatus && <p className="text-xs text-muted-foreground">{gpsStatus}</p>}
      {gpsError && <p className="text-xs text-error">{gpsError}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
