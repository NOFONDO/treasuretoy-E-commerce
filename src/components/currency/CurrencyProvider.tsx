"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { currencies } from "@/config/site";
import { formatMoney } from "@/lib/money";
import type { CurrencyCode } from "@/types";

const STORAGE_KEY = "tt-currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Format a GBP minor-unit amount in the selected currency. */
  format: (gbpMinor: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("GBP");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (currencies.some((c) => c.code === stored)) setCurrencyState(stored as CurrencyCode);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, format: (minor) => formatMoney(minor, currency) }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
