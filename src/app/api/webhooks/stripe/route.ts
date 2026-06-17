import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanKey } from "@/lib/stripe/config";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check
  const { data: existing } = await adminClient
    .from("processed_stripe_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existing) return NextResponse.json({ received: true });

  // Record event before processing (prevents TOCTOU races)
  await adminClient.from("processed_stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId) break;

      if (session.mode === "subscription") {
        const planKey = session.metadata?.plan as PlanKey;
        const plan = PLANS[planKey];
        if (plan) {
          await adminClient.rpc("add_credits", {
            p_user_id: userId,
            p_amount: plan.credits,
            p_type: "subscription",
            p_description: `${plan.name} plan — initial credits`,
          });
        }
      } else if (session.mode === "payment") {
        // Credit packs are handled via invoice.paid for consistency; skip here
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const { data: profile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (!profile) break;

      const { data: sub } = await adminClient
        .from("subscriptions")
        .select("plan")
        .eq("stripe_customer_id", customerId)
        .eq("status", "active")
        .single();

      if (sub?.plan) {
        const plan = PLANS[sub.plan as PlanKey];
        if (plan) {
          await adminClient.rpc("add_credits", {
            p_user_id: profile.id,
            p_amount: plan.credits,
            p_type: "subscription",
            p_description: `${plan.name} plan — monthly refresh`,
          });
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const { data: profile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (!profile) break;

      // Use type cast since billing period fields vary by Stripe API version
      const sub = subscription as unknown as Record<string, unknown>;
      await adminClient.from("subscriptions").upsert(
        {
          user_id: profile.id,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price.id ?? "",
          plan: subscription.metadata?.plan ?? "starter",
          status: subscription.status,
          current_period_start: sub.current_period_start
            ? new Date((sub.current_period_start as number) * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date((sub.current_period_end as number) * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" }
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await adminClient
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
