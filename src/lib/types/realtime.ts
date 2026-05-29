/**
 * Reverb connection details returned by kutoot in seller.realtime (login / me).
 */
export interface MerchantRealtimeConfig {
  driver: string;
  app_key: string;
  host: string;
  port: number;
  scheme: "http" | "https";
  use_tls: boolean;
  auth_endpoint: string;
  channel: string;
  channel_name: string;
  event: string;
}
