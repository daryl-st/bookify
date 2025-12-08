import Link from "next/link";
import { BookOpen, Sparkles, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-border bg-gradient-to-b from-background to-muted/20 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/3 blur-3xl"></div>
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/3 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Bookify
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Professional booking and reservation system for modern businesses. 
              Transform how you manage appointments.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <Mail className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 font-bold text-foreground">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#demo"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-bold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 font-bold text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bookify. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Made with care for your business</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
