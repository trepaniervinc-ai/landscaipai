import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { PLANS, CREDIT_PACKS, type PlanKey, type CreditPackKey } from "@/lib/stripe/config";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  const body = await request.json();
  const { plan, pack, mode } = body as {
    plan?: PlanKey;
    pack?: CreditPackKey;
    mode: "subscription" | "payment";
  };

  // Ensure Stripe customer exists
  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let priceId: string;

  if (mode === "subscription" && plan) {
    priceId = PLANS[plan].priceId;
  } else if (mode === "payment" && pack) {
    priceId = CREDIT_PACKS[pack].priceId;
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    metadata: { supabase_user_id: user.id, plan: plan ?? "", pack: pack ?? "" },
  });

  return NextResponse.json({ url: session.url });
}
