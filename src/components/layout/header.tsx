"use client";

import Link from "next/link";
import { Database, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Xandeum pNode Analytics
            </span>
            <span className="font-bold sm:hidden">Xandeum</span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/pnodes"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            pNodes
          </Link>
          <Link
            href="/network"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Network
          </Link>
          <Link
            href="/storage"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Storage
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t p-4 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/pnodes"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              pNodes
            </Link>
            <Link
              href="/network"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Network
            </Link>
            <Link
              href="/storage"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Storage
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
