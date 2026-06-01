"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { downloadMerchantQrCode, getMerchantQrCodes } from "@/lib/api/services/merchant.service";
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
        title: "QR code downloaded",
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
          Download the QR codes linked to this branch for printing or display in your store.
        </p>
      </div>

      <Card className="space-y-3">
        {showSkeleton && <ProfileRowsSkeleton rows={2} />}

        {!showSkeleton && qrQuery.isError && (
          <p className="text-sm text-muted-foreground">
            Unable to load QR codes right now. Please refresh the page.
          </p>
        )}

        {!showSkeleton && !qrQuery.isError && qrCodes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No QR codes are linked to this store yet. Contact Kutoot support if you need a QR
            assigned.
          </p>
        )}

        {!showSkeleton &&
          qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="flex flex-col gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1 text-sm">
                <p className="font-medium text-foreground">
                  {qr.unique_code}
                  {qr.is_primary ? (
                    <span className="ml-2 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      Primary
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-muted-foreground">{qr.short_url}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                loading={downloadingId === qr.id}
                onClick={() => handleDownload(qr.id, qr.unique_code)}
              >
                Download PNG
              </Button>
            </div>
          ))}
      </Card>
    </section>
  );
}
