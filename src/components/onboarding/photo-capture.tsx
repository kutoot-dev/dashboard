"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface PhotoCaptureProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

/**
 * Camera-based photo capture with GPS + timestamp watermark.
 * Falls back to file input if camera API is unavailable.
 */
export function PhotoCapture({
  label,
  value,
  onChange,
  required,
  error,
  className,
}: PhotoCaptureProps) {
  const [capturing, setCapturing] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCapturing(false);
      // Fallback to file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileSelect(file);
      };
      input.click();
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.size < 100 * 1024 || file.size > 10 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        addWatermark(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Stop camera
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCapturing(false);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    addWatermark(dataUrl);
  }, []);

  const addWatermark = (dataUrl: string) => {
    // Get GPS for watermark
    if (navigator.geolocation) {
      setGpsStatus("Getting location...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsStatus("");
          const now = new Date();
          const watermarkText = `${now.toLocaleString("en-IN")} | ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          applyWatermark(dataUrl, watermarkText);
        },
        () => {
          setGpsStatus("GPS unavailable");
          const watermarkText = `${new Date().toLocaleString("en-IN")} | GPS unavailable`;
          applyWatermark(dataUrl, watermarkText);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      const watermarkText = `${new Date().toLocaleString("en-IN")}`;
      applyWatermark(dataUrl, watermarkText);
    }
  };

  const applyWatermark = (dataUrl: string, text: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      // Watermark bar
      const barHeight = 40;
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, img.height - barHeight, img.width, barHeight);
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(text, 10, img.height - 14);

      onChange(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  };

  const cancelCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCapturing(false);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </p>

      {capturing ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            className="w-full max-w-md rounded-lg border border-border"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={capturePhoto}>
              Capture
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelCamera}>
              Cancel
            </Button>
          </div>
        </div>
      ) : value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Captured"
            className="w-full max-w-md rounded-lg border border-border"
          />
          <Button variant="secondary" size="sm" onClick={startCamera}>
            Retake Photo
          </Button>
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
                No photo captured yet
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={startCamera}>
            Take Photo
          </Button>
        </div>
      )}
      {gpsStatus && (
        <p className="text-xs text-muted-foreground">{gpsStatus}</p>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
