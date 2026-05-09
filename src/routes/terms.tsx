import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ElonTesla" },
      { name: "description", content: "Terms of Service for ElonTesla investment platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-invert">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

          <section className="space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By creating an account on ElonTesla you agree to these Terms. If you do not agree, do not use the service.</p>

            <h2 className="text-xl font-semibold text-foreground">2. Eligibility</h2>
            <p>You must be at least 18 years old and legally able to enter contracts in your jurisdiction.</p>

            <h2 className="text-xl font-semibold text-foreground">3. Investment Risk</h2>
            <p>All investments carry risk of loss, including total loss of capital. Past performance does not guarantee future results. Cryptocurrency markets are highly volatile.</p>

            <h2 className="text-xl font-semibold text-foreground">4. Account & Security</h2>
            <p>You are responsible for safeguarding your password and for any activity under your account. Notify us immediately of any unauthorized use.</p>

            <h2 className="text-xl font-semibold text-foreground">5. Deposits & Withdrawals</h2>
            <p>Deposits are credited after manual verification of payment proof. Withdrawals are processed within 24–72 hours after admin review.</p>

            <h2 className="text-xl font-semibold text-foreground">6. Prohibited Use</h2>
            <p>You may not use the service for money laundering, fraud, or any illegal activity.</p>

            <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, ElonTesla is not liable for any indirect, incidental, or consequential damages.</p>

            <h2 className="text-xl font-semibold text-foreground">8. Changes</h2>
            <p>We may update these Terms at any time. Continued use after changes means you accept the new Terms.</p>

            <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
            <p>Questions? Reach us via the in-app support chat.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
