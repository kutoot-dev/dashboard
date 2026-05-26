import { create } from "zustand";
import type { IncomingTransaction } from "@/lib/hooks/use-transaction-stream";

export interface TransactionAlert {
  id: string;
  transaction: IncomingTransaction;
  receivedAt: number;
}

interface TransactionAlertStore {
  alert: TransactionAlert | null;
  show: (transaction: IncomingTransaction) => void;
  dismiss: () => void;
}

let counter = 0;

export const useTransactionAlertStore = create<TransactionAlertStore>((set) => ({
  alert: null,
  show: (transaction) => {
    const id = `txn-alert-${Date.now()}-${++counter}`;
    set({ alert: { id, transaction, receivedAt: Date.now() } });
  },
  dismiss: () => set({ alert: null }),
}));
