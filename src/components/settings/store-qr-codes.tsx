"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  downloadMerchantQrCode,
  fetchMerchantQrSticker,
  getMerchantQrCodes,
} from "@/lib/api/services/merchant.service";
import { ApiError } from "@/lib/api/client";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { useToastStore } from "@/lib/stores/toast.store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileRowsSkeleton } from "@/components/ui/loading-skeletons";

function parseFileName(response: AxiosResponse<Blob>, fallback: string): string {
  const disposition = response.headers["content-disposition"];
  if (!disposition || typeof disposition !== "string") {
    return fallback;
  }

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallback;
}

function triggerDownload(response: AxiosResponse<Blob>, fallbackName: string): string {
  const fileName = parseFileName(response, fallbackName);
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return fileName;
}

function QrStickerPreview({
  branchId,
  qrCodeId,
  uniqueCode,
  alt,
}: {
  branchId: string;
  qrCodeId: number;
  uniqueCode: string;
  alt: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    setFailed(false);
    setPreviewUrl(null);

    fetchMerchantQrSticker(branchId, qrCodeId, "preview")
      .then((response) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [branchId, qrCodeId]);

  if (failed) {
    return (
      <div className="flex h-[300px] w-[200px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 text-center text-xs text-muted-foreground">
        Preview unavailable
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div
        className="h-[300px] w-[200px] animate-pulse rounded-xl bg-muted/50"
        aria-label={`Loading preview for ${uniqueCode}`}
      />
    );
  }

  return (
    <img
      src={previewUrl}
      alt={alt}
      className="h-auto w-[200px] rounded-xl border border-border/60 shadow-sm"
      width={200}
      height={300}
    />
  );
}

interface StoreQrCodesProps {
  branchId: string;
}

export function StoreQrCodes({ branchId }: StoreQrCodesProps) {
  const pushToast = useToastStore((s) => s.push);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const qrQuery = useQuery({
    queryKey: ["merchant-qr-codes", branchId],
    queryFn: () => getMerchantQrCodes(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const showSkeleton = useQuerySkeleton(qrQuery);
  const qrCodes = qrQuery.data?.success ? qrQuery.data.data.qr_codes : [];

  async function handleDownload(qrCodeId: number, uniqueCode: string) {
    setDownloadingId(qrCodeId);
    try {
      const response = await downloadMerchantQrCode(branchId, qrCodeId);
      const fileName = triggerDownload(response, `kutoot-qr-${uniqueCode}.png`);
      pushToast({
        title: "QR sticker downloaded",
        description: fileName,
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "QR download failed";
      pushToast({ title: "Download failed", description: message, variant: "error" });
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Store QR codes</h2>
        <p className="text-sm text-muted-foreground">
          Preview and download your Kutoot QR stickers (same layout as the printed standee) for
          display in your store.
        </p>
      </div>

      <div className="space-y-4">
        {showSkeleton && (
          <Card className="p-4">
            <ProfileRowsSkeleton rows={2} />
          </Card>
        )}

        {!showSkeleton && qrQuery.isError && (
          <Card className="p-4 text-sm text-muted-foreground">
            Unable to load QR codes right now. Please refresh the page.
          </Card>
        )}

        {!showSkeleton && !qrQuery.isError && qrCodes.length === 0 && (
          <Card className="p-4 text-sm text-muted-foreground">
            No QR codes are linked to this store yet. Contact Kutoot support if you need a QR
            assigned.
          </Card>
        )}

        {!showSkeleton &&
          qrCodes.map((qr) => (
            <Card key={qr.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                  <QrStickerPreview
                    branchId={branchId}
                    qrCodeId={qr.id}
                    uniqueCode={qr.unique_code}
                    alt={`QR sticker ${qr.unique_code}`}
                  />
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {qr.unique_code}
                      {qr.is_primary ? (
                        <span className="ml-2 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                          Primary
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Print-quality download includes the Kutoot background and centered QR.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0 self-center lg:self-start"
                  loading={downloadingId === qr.id}
                  onClick={() => handleDownload(qr.id, qr.unique_code)}
                >
                  Download sticker
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </section>
  );
}
