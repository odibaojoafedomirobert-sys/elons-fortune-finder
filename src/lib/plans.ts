export interface Plan {
  id: string;
  name: string;
  min: number;
  max: number;
  roi: number; // percent
  durationDays: number;
  features: string[];
}

export const PLANS: Plan[] = [
  { id: "starter", name: "Starter", min: 100, max: 999, roi: 8, durationDays: 7,
    features: ["8% ROI in 7 days", "24/7 support", "Withdraw anytime"] },
  { id: "pro", name: "Pro", min: 1000, max: 9999, roi: 18, durationDays: 14,
    features: ["18% ROI in 14 days", "Priority support", "Dedicated manager"] },
  { id: "vip", name: "VIP", min: 10000, max: 100000, roi: 35, durationDays: 30,
    features: ["35% ROI in 30 days", "VIP support", "Tesla referral bonus"] },
];
