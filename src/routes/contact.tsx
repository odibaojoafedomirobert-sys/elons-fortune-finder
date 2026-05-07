import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ElonTesla" },
      { name: "description", content: "Get in touch with the ElonTesla team for support or partnerships." },
      { property: "og:title", content: "Contact — ElonTesla" },
      { property: "og:description", content: "Get in touch with the ElonTesla team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-muted-foreground text-center mb-12">
              Have questions? Our team is here to help you on your investment journey.
            </p>

            <div className="glass-card rounded-xl p-8">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                    <input className="w-full rounded-lg bg-input border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                    <input className="w-full rounded-lg bg-input border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input type="email" className="w-full rounded-lg bg-input border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea rows={5} className="w-full rounded-lg bg-input border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="How can we help?" />
                </div>
                <Button variant="hero" size="lg" className="w-full py-6">
                  Send Message
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { label: "Email", value: "support@elontesla.com" },
                { label: "Phone", value: "+1 (888) 555-0123" },
                { label: "Location", value: "San Francisco, CA" },
              ].map((c) => (
                <div key={c.label} className="glass-card rounded-xl p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
                  <div className="text-sm font-medium text-foreground">{c.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
