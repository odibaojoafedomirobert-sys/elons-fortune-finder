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
  { id: "starter", name: "Starter", min: 100, max: 999, roi: 500, durationDays: 7,
    features: ["Invest $100 → get $600 in 7 days", "24/7 support", "Withdraw anytime"] },
  { id: "pro", name: "Pro", min: 1000, max: 4999, roi: 400, durationDays: 14,
    features: ["Invest $1,000 → get $5,000 in 14 days", "Priority support", "Dedicated manager"] },
  { id: "vip", name: "VIP", min: 5000, max: 100000, roi: 400, durationDays: 30,
    features: ["Invest $5,000 → get $25,000", "Invest $10,000 → get $50,000 in 30 days", "VIP support", "Tesla referral bonus"] },
];
