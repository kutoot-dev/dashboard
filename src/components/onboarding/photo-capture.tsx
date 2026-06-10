"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  isAllowedMerchantMediaFile,
  isAudioValue,
  isImageFile,
  isImageValue,
  isPdfValue,
  MERCHANT_MEDIA_ACCEPT,
  MERCHANT_MEDIA_TYPE_ERROR,
} from "@/lib/utils/media-upload";

interface PhotoCaptureProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  onLocationCaptured?: (coords: { lat: number; long: number; accuracy: number }) => void;
  required?: boolean;
  requireGps?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  hideUpload?: boolean;
  /** Use rear-facing device camera (native camera app) instead of in-browser webcam */
  useDeviceCamera?: boolean;
}

/**
 * Capture or upload merchant media (images, audio, documents) with optional GPS watermark on images.
 */
export function PhotoCapture({
  label,
  value,
  onChange,
  onLocationCaptured,
  required,
  requireGps = false,
  error,
  hint,
  className,
  hideUpload = false,
  useDeviceCamera = true,
}: PhotoCaptureProps) {
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [gpsError, setGpsError] = useState<string>("");
  const [typeError, setTypeError] = useState<string>("");
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(file: File) {
    if (!isAllowedMerchantMediaFile(file)) {
      setTypeError(MERCHANT_MEDIA_TYPE_ERROR);
      return;
    }

    setTypeError("");

    if (file.size < 1 * 1024 || file.size > 10 * 1024 * 1024) {
      return;
    }

    if (!isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        addWatermark(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function openDeviceCamera() {
    cameraInputRef.current?.click();
  }

  function openFilePicker() {
    uploadInputRef.current?.click();
  }

  function onCameraInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleFileSelect(file);
  }

  function onUploadInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleFileSelect(file);
  }

  function addWatermark(dataUrl: string) {
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
          const now = new Date();
          const watermarkText = `${now.toLocaleString("en-IN")} | ${coords.lat}, ${coords.long}`;
          applyWatermark(dataUrl, watermarkText);
        },
        () => {
          setGpsStatus("");
          const message = "Location access is required. Enable GPS and try again.";
          setGpsError(message);
          if (!requireGps) {
            const watermarkText = `${new Date().toLocaleString("en-IN")} | GPS unavailable`;
            applyWatermark(dataUrl, watermarkText);
          }
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      const message = "Geolocation is not supported on this device.";
      setGpsError(message);
      if (!requireGps) {
        const watermarkText = `${new Date().toLocaleString("en-IN")}`;
        applyWatermark(dataUrl, watermarkText);
      }
    }
  }

  function applyWatermark(dataUrl: string, text: string) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const barHeight = Math.max(40, Math.round(img.height * 0.06));
      const fontSize = Math.max(14, Math.round(img.width * 0.028));
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, img.height - barHeight, img.width, barHeight);
      ctx.fillStyle = "#ffffff";
      ctx.font = `${fontSize}px monospace`;
      ctx.fillText(text, 10, img.height - Math.round(barHeight * 0.35));

      onChange(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  }

  function removeImage() {
    onChange(null);
    setGpsStatus("");
    setGpsError("");
    setTypeError("");
  }

  const takePhotoLabel = useDeviceCamera ? "Take Photo" : "Open Camera";
  const retakeLabel = useDeviceCamera ? "Retake Photo" : "Capture Again";

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
      {!hideUpload && (
        <input
          ref={uploadInputRef}
          type="file"
          accept={MERCHANT_MEDIA_ACCEPT}
          className="hidden"
          onChange={onUploadInputChange}
        />
      )}
      <p className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </p>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : useDeviceCamera ? (
        <p className="text-xs text-muted-foreground">
          Opens your device camera for photos. You can also upload images, audio, or documents (no video).
        </p>
      ) : null}

      {value ? (
        <div className="space-y-2">
          {isImageValue(value) && !isPdfValue(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Captured"
              className="w-full max-w-md rounded-lg border border-border"
            />
          ) : isPdfValue(value) ? (
            <div className="flex max-w-md items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                PDF
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">PDF uploaded</p>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  View file
                </a>
              </div>
            </div>
          ) : isAudioValue(value) ? (
            <div className="flex max-w-md items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                AUDIO
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Audio uploaded</p>
                <audio controls src={value} className="mt-2 w-full" />
              </div>
            </div>
          ) : (
            <div className="flex max-w-md items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">File uploaded</p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline underline-offset-2"
              >
                View file
              </a>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={openDeviceCamera}>
              {retakeLabel}
            </Button>
            {!hideUpload && (
              <Button variant="ghost" size="sm" onClick={openFilePicker}>
                Upload from Device
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={removeImage}>
              Remove File
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center justify-center w-full max-w-md h-40 rounded-lg border-2 border-dashed border-border bg-card">
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-xs text-muted-foreground mt-1">
                No file uploaded yet
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={openDeviceCamera}>
              {takePhotoLabel}
            </Button>
            {!hideUpload && (
              <Button variant="secondary" size="sm" onClick={openFilePicker}>
                Upload from Device
              </Button>
            )}
          </div>
        </div>
      )}
      {gpsStatus && (
        <p className="text-xs text-muted-foreground">{gpsStatus}</p>
      )}
      {gpsError && <p className="text-xs text-error">{gpsError}</p>}
      {typeError && <p className="text-xs text-error">{typeError}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
