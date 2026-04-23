"use client";

import Link from "next/link";
import { Radar } from "lucide-react";
import { motion } from "framer-motion";
import { AuthStatus } from "@/components/auth-status";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "首页", href: "/" },
  { name: "新闻中心", href: "/news" },
  { name: "市场看板", href: "/markets" },
  { name: "账户中心", href: "/account" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.div 
      className="sticky top-6 z-50 px-4 md:px-0 mx-auto w-full max-w-5xl"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="flex items-center justify-between rounded-full px-6 py-2 shadow-xl border-border/40 bg-background/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Radar className="h-6 w-6" />
            </div>
            <span className="headline text-xl font-bold tracking-tight text-primary">
              Odin Pulse
            </span>
          </Link>
        </div>
        
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "text-sm font-semibold px-4 py-2 rounded-full transition-all relative",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-1 left-4 right-4 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <AuthStatus />
        </div>
      </Card>
    </motion.div>
  );
}
