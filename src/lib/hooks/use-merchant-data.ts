import { useQuery } from "@tanstack/react-query";
import {
  getMerchant,
  getMerchantScore,
  getMerchantCandlesticks,
  getMerchantVolume,
} from "@/lib/api/services/merchants.service";

export function useMerchant(merchantId: string) {
  return useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => getMerchant(merchantId),
    enabled: !!merchantId,
    select: (res) => res.data,
  });
}

export function useMerchantScore(merchantId: string, periodId?: string) {
  return useQuery({
    queryKey: ["merchantScore", merchantId, periodId],
    queryFn: () => getMerchantScore(merchantId, periodId),
    enabled: !!merchantId,
    select: (res) => res.data,
  });
}

export function useMerchantCandlesticks(merchantId: string) {
  return useQuery({
    queryKey: ["merchantCandlesticks", merchantId],
    queryFn: () => getMerchantCandlesticks(merchantId),
    enabled: !!merchantId,
    select: (res) => res.data,
  });
}

export function useMerchantVolume(merchantId: string) {
  return useQuery({
    queryKey: ["merchantVolume", merchantId],
    queryFn: () => getMerchantVolume(merchantId),
    enabled: !!merchantId,
    select: (res) => res.data,
  });
}
