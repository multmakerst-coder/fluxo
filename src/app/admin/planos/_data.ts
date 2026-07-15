export type DiscountType = "percentagem" | "valor";

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number;
  usedCount: number;
  validUntil: string;
}

export const COUPONS: Coupon[] = [
  { id: "cp-1", code: "BEMVINDO20", discountType: "percentagem", discountValue: 20, maxUses: 200, usedCount: 134, validUntil: "2026-09-30T23:59:00" },
  { id: "cp-2", code: "BLACKFRIDAY", discountType: "percentagem", discountValue: 40, maxUses: 500, usedCount: 489, validUntil: "2026-11-30T23:59:00" },
  { id: "cp-3", code: "PARCEIRO10", discountType: "valor", discountValue: 10, maxUses: 100, usedCount: 22, validUntil: "2026-12-31T23:59:00" },
  { id: "cp-4", code: "VOLTA2026", discountType: "percentagem", discountValue: 15, maxUses: 300, usedCount: 300, validUntil: "2026-06-30T23:59:00" },
];

export const DEFAULT_TRIAL_DAYS = 14;
