export const PLANS = {
  starter: {
    name: "Starter",
    price: 29,
    credits: 50,
    priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    features: [
      "50 credits / month",
      "All 16 style presets",
      "In-painting canvas",
      "Project sharing",
    ],
  },
  pro: {
    name: "Pro",
    price: 79,
    credits: 200,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    features: [
      "200 credits / month",
      "Everything in Starter",
      "Priority processing",
      "Commercial use license",
    ],
  },
  business: {
    name: "Business",
    price: 199,
    credits: 600,
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
    features: [
      "600 credits / month",
      "Everything in Pro",
      "Team access",
      "API access",
    ],
  },
} as const;

export const CREDIT_PACKS = {
  "project-pack": {
    name: "Project Pack",
    price: 9,
    credits: 10,
    priceId: process.env.STRIPE_PRICE_PACK_PROJECT!,
    description: "Perfect for a single project",
  },
  "power-pack": {
    name: "Power Pack",
    price: 39,
    credits: 50,
    priceId: process.env.STRIPE_PRICE_PACK_POWER!,
    description: "Best value for occasional use",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type CreditPackKey = keyof typeof CREDIT_PACKS;
