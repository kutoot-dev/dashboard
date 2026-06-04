"use client";

import type { Icon } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

type SelectedLocation = {
  lat: number;
  long: number;
};

interface MapLocationPickerProps {
  value: SelectedLocation | null;
  onSelect: (coords: SelectedLocation) => void;
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const MapClickHandler = dynamic(
  () =>
    import("react-leaflet").then((m) => {
      function ClickHandler({ onSelect }: { onSelect: (coords: SelectedLocation) => void }) {
        m.useMapEvents({
          click(event) {
            onSelect({
              lat: Number(event.latlng.lat.toFixed(6)),
              long: Number(event.latlng.lng.toFixed(6)),
            });
          },
        });
        return null;
      }
      return ClickHandler;
    }),
  { ssr: false },
);

export function MapLocationPicker({ value, onSelect }: MapLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [markerIcon, setMarkerIcon] = useState<Icon | null>(null);

  useEffect(() => {
    if (!open || markerIcon) return;
    void import("@/lib/leaflet-marker-icon").then((mod) => {
      setMarkerIcon(mod.leafletMarkerIcon);
    });
  }, [open, markerIcon]);

  const center = useMemo<[number, number]>(() => {
    if (value) return [value.lat, value.long];
    return [20.5937, 78.9629]; // India center
  }, [value]);

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Hide Map Picker" : "Pick from Map"}
      </Button>
      {open && (
        <div className="space-y-2">
          <div className="h-72 w-full overflow-hidden rounded-lg border border-border">
            <MapContainer
              center={center}
              zoom={value ? 15 : 5}
              className="h-full w-full"
            >
              <MapClickHandler onSelect={onSelect} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {value && markerIcon && (
                <Marker position={[value.lat, value.long]} icon={markerIcon} />
              )}
            </MapContainer>
          </div>
          <p className="text-xs text-muted-foreground">
            Click anywhere on the map to set latitude and longitude.
          </p>
        </div>
      )}
    </div>
  );
}
