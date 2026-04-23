"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound, Settings, Activity, Database, Key } from "lucide-react";
import { motion } from "framer-motion";

import { AccountPanel } from "@/components/account-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AccountPage() {
  return (
    <motion.main 
      className="shell px-4 py-12 md:py-20 md:px-6 min-h-[90vh] flex flex-col justify-center mb-20"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.section 
        variants={fadeInUp}
        className="panel-strong rounded-[3rem] p-10 md:p-20 mb-12 shadow-2xl relative overflow-hidden group border-border/40"
      >
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
            <Link 
              href="/" 
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full bg-background/50 backdrop-blur-md px-6 h-12 shadow-sm hover:shadow-xl hover:border-secondary hover:text-secondary transition-all flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] group border-border/60"
              )}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              返回首页
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-secondary backdrop-blur-sm shadow-inner">
              <Settings className="h-4 w-4" />
              Account Intelligence
            </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="headline text-5xl font-black leading-[1.1] text-primary md:text-8xl tracking-tighter">
              Manage <span className="text-secondary">Intelligence</span>
            </h1>
            <p className="mt-10 text-lg md:text-2xl leading-relaxed text-muted-foreground font-medium max-w-2xl">
              管理您的数字身份、安全凭证与个性化配置。所有个人资料变动均经过加密并与 PostgreSQL 核心集群同步。
            </p>

            <div className="mt-12 flex flex-wrap gap-6">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm">
                <UserRound className="h-4 w-4 text-secondary" />
                Identity Profile
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Security Access
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm">
                <Database className="h-4 w-4 text-emerald-500" />
                Data Persistence
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeInUp} className="relative z-20">
        <AccountPanel />
      </motion.section>
      
      {/* Footer Branding */}
      <motion.div 
        variants={fadeInUp}
        className="mt-20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4 opacity-20">
           <Separator className="w-12 bg-primary" />
           <Key className="h-5 w-5 text-primary" />
           <Separator className="w-12 bg-primary" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          Odin Pulse Platform © 2026 • High-Availability Data Center
        </p>
      </motion.div>
    </motion.main>
  );
}
