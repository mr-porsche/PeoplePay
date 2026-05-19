import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const FALLBACK_CURRENCY = "USD";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isValidCurrency(code?: string): boolean {
  if (!code) return false;

  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    });
    return true;
  } catch {
    return false;
  }
}

export function formatCurrency(amount: number, currency?: string): string {
  const safeCurrency =
    currency && isValidCurrency(currency) ? currency : FALLBACK_CURRENCY;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
