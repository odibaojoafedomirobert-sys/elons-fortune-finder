import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ET</span>
            </div>
            <span className="text-xl font-bold gradient-text">ElonTesla</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/markets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Markets</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button variant="hero" size="sm">Get Started</Button>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/markets" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Markets</Link>
            <Link to="/about" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/contact" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Contact</Link>
            <div className="pt-2 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">Sign In</Button>
              <Button variant="hero" size="sm" className="flex-1">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
