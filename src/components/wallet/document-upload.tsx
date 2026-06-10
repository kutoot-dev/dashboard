"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  isAllowedMerchantMediaFile,
  isAudioValue,
  isImageValue,
  isPdfValue,
  MERCHANT_MEDIA_ACCEPT,
} from "@/lib/utils/media-upload";

const MAX_BYTES = 10 * 1024 * 1024;

interface DocumentUploadProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export function DocumentUpload({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  className,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!isAllowedMerchantMediaFile(file) || file.size < 1024 || file.size > MAX_BYTES) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      handleFile(file);
    }
  }

  const defaultHint =
    "Upload images, audio, or PDF documents up to 10 MB. Video files are not allowed.";

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={MERCHANT_MEDIA_ACCEPT}
        className="hidden"
        onChange={onInputChange}
      />
      <p className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-error">*</span> : null}
      </p>
      <p className="text-xs text-muted-foreground">{hint ?? defaultHint}</p>

      {value ? (
        <div className="space-y-2">
          {isImageValue(value) && !isPdfValue(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Uploaded document"
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
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Replace file
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <div className="flex h-32 w-full max-w-md items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
            <p className="px-4 text-center text-xs text-muted-foreground">
              No file uploaded yet
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Upload file
          </Button>
        </div>
      )}
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
