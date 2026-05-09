import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ElonTesla" },
      { name: "description", content: "How ElonTesla collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

          <section className="space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>When you sign up we collect your full name, email address, and phone number. When you deposit, we collect payment proof images and transaction notes.</p>

            <h2 className="text-xl font-semibold text-foreground">2. How We Use It</h2>
            <p>We use your information to operate your account, verify deposits/withdrawals, prevent fraud, and provide customer support.</p>

            <h2 className="text-xl font-semibold text-foreground">3. Data Sharing</h2>
            <p>We do not sell your data. We share information only with service providers strictly necessary to operate the platform (e.g. cloud hosting), or when required by law.</p>

            <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
            <p>Passwords are hashed and never visible to staff. Data is stored on encrypted servers and protected by row-level security.</p>

            <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
            <p>You can request access, correction, or deletion of your personal data at any time by contacting support.</p>

            <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
            <p>We use essential cookies to keep you signed in. We do not use advertising trackers.</p>

            <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
            <p>Privacy questions? Reach us via the in-app support chat.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
