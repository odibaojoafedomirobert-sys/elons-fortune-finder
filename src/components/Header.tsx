import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
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
            {user && <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>}
            {user && <Link to="/deposit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deposit</Link>}
            {user && <Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link>}
            {isAdmin && <Link to="/admin" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">Admin</Link>}
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
            ) : (
              <>
                <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/auth"><Button variant="hero" size="sm">Get Started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            <Link to="/" onClick={() => setOpen(false)} className="block py-2 text-sm">Home</Link>
            <Link to="/markets" onClick={() => setOpen(false)} className="block py-2 text-sm">Markets</Link>
            {user && <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-sm">Dashboard</Link>}
            {user && <Link to="/deposit" onClick={() => setOpen(false)} className="block py-2 text-sm">Deposit</Link>}
            {user && <Link to="/chat" onClick={() => setOpen(false)} className="block py-2 text-sm">Support</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 text-sm text-primary font-medium">Admin</Link>}
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2 text-sm">About</Link>
            <div className="pt-2">
              {user ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>Sign Out</Button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)}><Button variant="hero" size="sm" className="w-full">Sign In</Button></Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
