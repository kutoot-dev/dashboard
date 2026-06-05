"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listStoreMedia, uploadStoreMedia, type StoreMediaItem } from "@/lib/api/services/merchant.service";
import { useToastStore } from "@/lib/stores/toast.store";

interface StoreMediaGalleryProps {
  branchId: string;
}

export function StoreMediaGallery({ branchId }: StoreMediaGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const [uploading, setUploading] = useState(false);

  const mediaQuery = useQuery({
    queryKey: ["store-media", branchId],
    queryFn: () => listStoreMedia(branchId),
    enabled: Boolean(branchId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadStoreMedia(branchId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["store-media", branchId] });
      pushToast({
        variant: "success",
        title: "Photo uploaded",
        description: "Your image is pending admin approval before it appears on your public store page.",
      });
    },
    onError: () => {
      pushToast({
        variant: "error",
        title: "Upload failed",
        description: "Could not upload the image. Try a JPG, PNG, or WebP under 5 MB.",
      });
    },
  });

  const media: StoreMediaItem[] = mediaQuery.data?.success
    ? (mediaQuery.data.data?.media ?? [])
    : [];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Store media gallery</h2>
          <p className="text-sm text-muted-foreground">
            Upload photos for your public store page. New uploads stay pending until approved by Kutoot.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            loading={uploading || uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Upload photo
          </Button>
        </div>
      </div>

      {mediaQuery.isLoading ? (
        <Card className="p-4 text-sm text-muted-foreground">Loading gallery…</Card>
      ) : media.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">
          No gallery photos yet. Upload images to showcase your store.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumb || item.url}
                alt="Store gallery"
                className="aspect-square w-full object-cover"
              />
              <div className="border-t border-border px-2 py-1.5">
                <p
                  className={`text-xs font-medium ${
                    item.is_approved ? "text-success" : "text-warning"
                  }`}
                >
                  {item.is_approved ? "Approved" : "Pending approval"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
