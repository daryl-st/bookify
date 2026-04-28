"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

type MeUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
};

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // still navigate away
    }
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
            <BookOpen className="h-4 w-4 text-foreground" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Bookify
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {!loading && user && (
            <>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <User className="h-4 w-4 shrink-0" />
                <span className="max-w-[160px] truncate">
                  {user.name || user.email}
                </span>
                {user.role === "ADMIN" && (
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    Admin
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          )}
          {!loading && !user && (
            <Button size="sm" variant="secondary" onClick={() => router.push("/auth/login")}>
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
