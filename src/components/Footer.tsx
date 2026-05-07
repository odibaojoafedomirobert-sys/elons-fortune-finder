import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ET</span>
              </div>
              <span className="text-xl font-bold gradient-text">ElonTesla</span>
            </div>
            <p className="text-sm text-muted-foreground">Empowering investors with intelligent tools and real-time market insights.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Trading</span></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Portfolio</span></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Analytics</span></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Research</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Careers</span></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Press</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-foreground cursor-pointer transition-colors">Disclosures</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © 2026 ElonTesla. All rights reserved. Investing involves risk.
        </div>
      </div>
    </footer>
  );
}
