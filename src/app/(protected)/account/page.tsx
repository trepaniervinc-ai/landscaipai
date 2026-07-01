import type { Metadata } from "next";
import { getAuthenticatedProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import ChangePasswordForm from "@/components/account/change-password-form";
import ChangeEmailForm from "@/components/account/change-email-form";
import SignOutOthersButton from "@/components/account/sign-out-others-button";
import ResendVerificationBanner from "@/components/account/resend-verification-banner";
import DeleteAccountSection from "@/components/account/delete-account-section";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const profile = await getAuthenticatedProfile();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasPassword = user?.identities?.some((i) => i.provider === "email") ?? false;
  const emailConfirmed = !!user?.email_confirmed_at;
  const pendingEmail = user?.new_email ?? null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", profile!.id)
    .eq("status", "active")
    .single();

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-8">Account</h1>

      {!emailConfirmed && profile?.email && (
        <ResendVerificationBanner email={profile.email} />
      )}

      {/* Profile */}
      <section className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground">{profile?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account type</span>
            <span className="text-foreground capitalize">
              {profile?.user_type ?? "homeowner"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credits balance</span>
            <span className="text-foreground font-medium">
              {profile?.credits_balance ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span className="text-foreground">
              {profile ? formatDate(profile.created_at) : "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-card border border-border rounded-lg p-6 mb-6 space-y-6">
        <h2 className="font-semibold text-foreground">Security</h2>
        <ChangePasswordForm hasPassword={hasPassword} />
        <ChangeEmailForm currentEmail={profile!.email} pendingEmail={pendingEmail} />
        <SignOutOthersButton />
      </section>

      {/* Subscription */}
      <section className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Subscription</h2>
        {subscription ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="text-foreground capitalize">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground capitalize">{subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renews</span>
              <span className="text-foreground">
                {subscription.current_period_end
                  ? formatDate(subscription.current_period_end)
                  : "—"}
              </span>
            </div>
            <button className="mt-2 text-sm text-muted-foreground hover:text-foreground underline">
              Manage subscription →
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              You&apos;re on the free tier.
            </p>
            <a
              href="/pricing"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Upgrade plan
            </a>
          </div>
        )}
      </section>

      {/* Credit history */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-semibold text-foreground mb-4">Credit history</h2>
        {!transactions?.length ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tx.description ?? tx.type}
                </span>
                <span
                  className={
                    tx.amount > 0 ? "text-primary" : "text-destructive"
                  }
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6">
        <DeleteAccountSection currentEmail={profile!.email} />
      </div>
    </div>
  );
}
