import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { deleteUserStorage } from "@/lib/supabase/storage-cleanup";

const CANCELABLE_STATUSES = ["active", "trialing", "past_due"];

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body.confirmEmail !== user.email) {
    return NextResponse.json({ error: "Email confirmation does not match" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  // Stripe cancellation must succeed before we touch anything else — the
  // customer id lives on `profiles`, which cascades away with the auth user.
  if (profile?.stripe_customer_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "all",
      });
      for (const sub of subscriptions.data) {
        if (CANCELABLE_STATUSES.includes(sub.status)) {
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    } catch (err) {
      console.error("Failed to cancel Stripe subscription during account deletion", err);
      return NextResponse.json({ error: "Could not cancel your subscription. Try again." }, { status: 500 });
    }
  }

  // Storage cleanup is best-effort — orphaned blobs are a cleanup cost, not a
  // security/billing risk, and should never block honoring the delete request.
  const uploadsResult = await deleteUserStorage("landscaip-uploads", `uploads/${user.id}`);
  if (uploadsResult.error) {
    console.error("Failed to clean up landscaip-uploads for", user.id, uploadsResult.error);
  }
  const generationsResult = await deleteUserStorage("landscaip-generations", user.id);
  if (generationsResult.error) {
    console.error("Failed to clean up landscaip-generations for", user.id, generationsResult.error);
  }

  // Deletes the auth.users row; ON DELETE CASCADE removes profiles, projects,
  // images, generations, credit_transactions, and subscriptions automatically.
  const { error: deleteError } = await getAdminClient().auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: "Could not delete account. Try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
