export type LicenseKey = {
  code: string;
  plan: "studio" | "scale" | "enterprise";
  type: "free_pass" | "coupon";
  discountPercent: number; // 100 for 1 month free, 50 for 50% off, etc.
  description: string;
  createdAt: string;
  expiresAt?: string;
  usesCount: number;
  maxUses: number;
  active: boolean;
};

const DEFAULT_KEYS: LicenseKey[] = [
  {
    code: "VEXORA-VIP-FREE",
    plan: "studio",
    type: "free_pass",
    discountPercent: 100,
    description: "Llave de acceso gratuito de por vida al Plan Studio",
    createdAt: new Date().toISOString(),
    usesCount: 0,
    maxUses: 100,
    active: true,
  },
  {
    code: "VEXORA1MONTH",
    plan: "studio",
    type: "coupon",
    discountPercent: 100,
    description: "1 Mes Gratis en cualquier plan Vexora",
    createdAt: new Date().toISOString(),
    usesCount: 0,
    maxUses: 50,
    active: true,
  },
  {
    code: "ESTUDIO50",
    plan: "studio",
    type: "coupon",
    discountPercent: 50,
    description: "50% de Descuento en Plan Studio",
    createdAt: new Date().toISOString(),
    usesCount: 0,
    maxUses: 200,
    active: true,
  },
];

export function getStoredKeys(): LicenseKey[] {
  if (typeof window === "undefined") return DEFAULT_KEYS;
  try {
    const raw = localStorage.getItem("vexora-licenses");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_KEYS;
}

export function saveStoredKeys(keys: LicenseKey[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("vexora-licenses", JSON.stringify(keys));
  } catch {}
}

export function validateLicenseOrCoupon(code: string): {
  valid: boolean;
  item?: LicenseKey;
  message?: string;
} {
  const cleanCode = code.trim().toUpperCase();
  const keys = getStoredKeys();
  const found = keys.find((k) => k.code.toUpperCase() === cleanCode && k.active);

  if (!found) {
    return { valid: false, message: "Código de llave o cupón no válido o expirado." };
  }

  if (found.usesCount >= found.maxUses) {
    return { valid: false, message: "Este código ha alcanzado el límite máximo de canjes." };
  }

  return { valid: true, item: found };
}

export function redeemLicenseOrCoupon(code: string): boolean {
  const cleanCode = code.trim().toUpperCase();
  const keys = getStoredKeys();
  const foundIndex = keys.findIndex((k) => k.code.toUpperCase() === cleanCode && k.active);

  if (foundIndex >= 0) {
    keys[foundIndex].usesCount += 1;
    saveStoredKeys(keys);
    return true;
  }
  return false;
}
