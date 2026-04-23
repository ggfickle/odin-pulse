import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BellRing,
  BookOpenText,
  ChartNoAxesCombined,
  Clock3,
  DatabaseZap,
  LayoutDashboard,
  Newspaper,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import * as motion from "framer-motion/client";

import { FUTURE_MODULES } from "@odin-pulse/shared";

import { fetchNews, fetchNewsStats } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default async function HomePage() {
  const [preview, stats] = await Promise.all([
    fetchNews({ page: 1, pageSize: 5 }),
    fetchNewsStats(),
  ]);

  const leadStory = preview.items[0];
  const secondaryStories = preview.items.slice(1, 4);

  return (
    <main className="flex-1 text-foreground selection:bg-accent-soft selection:text-accent pb-20">
      {/* 🔵 Hero Section - Focused & Premium */}
      <motion.section 
        className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="hero-orb hero-orb-left opacity-30" />
        <div className="hero-orb hero-orb-right opacity-20" />
        
        <div className="shell px-4 text-center md:px-6">
          <motion.div variants={fadeInUp} className="flex justify-center">
            <Badge variant="outline" className="gap-2 rounded-full border-accent-soft bg-accent-soft/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              One-Stop Business Portal
            </Badge>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="headline mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.15] text-primary md:text-7xl lg:text-8xl">
            资讯聚合只是开始，<br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              业务决策由此律动。
            </span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Odin Pulse 是面向未来的可扩展业务门户。一期深度整合多源实时资讯流，
            复用高性能数据基建，为您提供精准、敏捷的决策信号。
          </motion.p>
          
          <motion.div variants={fadeInUp} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/news"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-10 py-8 text-lg font-black shadow-2xl shadow-primary/25 transition-all hover:-translate-y-1 hover:shadow-primary/40 active:scale-95 flex items-center"
              )}
            >
              进入新闻中心
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#modules"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full px-10 py-8 text-lg font-bold bg-background/50 backdrop-blur-sm border-border/60 transition-all hover:-translate-y-1 hover:bg-background/80 active:scale-95 flex items-center"
              )}
            >
              查看后续模块
            </Link>
          </motion.div>

          {/* Live Status Bar */}
          <motion.div variants={fadeInUp} className="mx-auto mt-24 max-w-5xl">
            <Card className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border-border/40 bg-border/40 shadow-2xl md:grid-cols-4">
              <LiveMetric
                label="已索引新闻"
                value={stats.total.toLocaleString()}
                icon={<Newspaper className="h-4 w-4" />}
              />
              <LiveMetric
                label="重点资讯"
                value={stats.importantCount.toLocaleString()}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <LiveMetric
                label="覆盖来源"
                value={stats.sources.toLocaleString()}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
              <LiveMetric
                label="最新同步"
                value={stats.latestPublishTime ? formatTime(stats.latestPublishTime) : "暂无"}
                icon={<Activity className="h-4 w-4" />}
              />
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* 🟠 Pulse Center - Featured News & Signal */}
      <section className="shell py-20 px-4 md:px-6">
        <motion.div 
          className="flex flex-col gap-12 lg:flex-row"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="flex-1">
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-0.5 w-8 bg-accent" />
                <span className="eyebrow">Real-time Pulse</span>
              </div>
              <h2 className="headline text-4xl font-black text-primary">当前市场脉动</h2>
            </motion.div>

            {leadStory ? (
              <motion.div variants={fadeInUp}>
                <Link href={`/news/${leadStory.id}`} className="group block">
                  <Card className="panel-strong relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 hover:shadow-2xl hover:border-primary/20 bg-gradient-to-br from-white to-slate-50/50">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 transition-all duration-500 group-hover:text-primary/10 group-hover:scale-110">
                      <Radar className="h-32 w-32" />
                    </div>
                    
                    <div className="relative">
                      <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-secondary">
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none px-3 py-1">{leadStory.source}</Badge>
                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDateTime(leadStory.publishTime)}
                        </span>
                      </div>
                      
                      <h3 className="headline mt-8 text-3xl font-black leading-tight text-primary transition-colors group-hover:text-secondary md:text-4xl lg:text-5xl">
                        {leadStory.title}
                      </h3>
                      
                      <p className="mt-8 line-clamp-4 text-lg leading-relaxed text-muted-foreground font-medium">
                        {leadStory.content}
                      </p>
                      
                      <div className="mt-10 inline-flex items-center gap-2 text-base font-black text-primary group-hover:translate-x-2 transition-transform">
                        阅读全文
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp}>
                <Card className="flex h-64 items-center justify-center rounded-[2.5rem] bg-muted/30 border-dashed border-2 border-border/60">
                  <p className="text-muted-foreground font-medium">暂无实时主线新闻</p>
                </Card>
              </motion.div>
            )}
          </div>

          <aside className="w-full lg:w-[380px]">
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-0.5 w-8 bg-accent" />
                <span className="eyebrow">Recent Signals</span>
              </div>
              <h2 className="headline text-4xl font-bold text-primary">信号带</h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="space-y-4">
              {secondaryStories.map((item) => (
                <motion.div key={item.id} variants={fadeInUp}>
                  <Link
                    href={`/news/${item.id}`}
                    className="group block"
                  >
                    <Card className="rounded-3xl border-border/40 bg-background/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:bg-background hover:shadow-xl group-hover:translate-x-1">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          {item.source}
                        </span>
                        <span>{formatDateTime(item.publishTime)}</span>
                      </div>
                      <h4 className="headline text-lg font-bold leading-snug text-primary group-hover:text-secondary transition-colors">
                        {item.title}
                      </h4>
                      {item.sentiment === "IMPORTANT" && (
                        <Badge className="mt-4 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 text-[10px] uppercase font-black tracking-widest px-2 py-0.5">
                          Significant Signal
                        </Badge>
                      )}
                    </Card>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div variants={fadeInUp}>
                <Link 
                  href="/news"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border/60 py-10 text-sm font-black uppercase tracking-widest text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5 bg-transparent"
                  )}
                >
                  查看完整流
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </aside>
        </motion.div>
      </section>

      {/* 🟣 Future Modules - Clean & Structured */}
      <section id="modules" className="bg-primary py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(30,58,138,0.2),transparent_50%)]" />
        <div className="shell px-4 md:px-6 relative z-10">
          <motion.div 
            className="mb-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="rounded-full border-accent/30 text-accent font-black uppercase tracking-[0.3em] px-5 py-1.5 mb-6 bg-accent/5">Scalable Architecture</Badge>
            <h2 className="headline mt-4 text-5xl font-black md:text-6xl tracking-tighter">多业务入口已就绪</h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400 font-medium leading-relaxed">
              采用统一的信息架构，支持模块化平滑接入，为您构建一个持续生长的业务门户。
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {FUTURE_MODULES.map((module) => (
              <motion.div key={module.key} variants={fadeInUp}>
                <Card className="group relative overflow-hidden rounded-[2.5rem] bg-white/5 border-white/10 p-10 transition-all duration-500 hover:bg-white/10 hover:shadow-2xl hover:-translate-y-2 hover:border-accent/40">
                  <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors" />
                  
                  <div className="relative">
                    <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                      {module.key === 'markets' && <ChartNoAxesCombined className="h-7 w-7" />}
                      {module.key === 'research' && <BookOpenText className="h-7 w-7" />}
                      {module.key === 'alerts' && <BellRing className="h-7 w-7" />}
                      {module.key === 'knowledge' && <LayoutDashboard className="h-7 w-7" />}
                    </div>
                    
                    <div className="mb-4">
                      <Badge variant="outline" className="border-white/20 text-white/40 text-[10px] font-black uppercase tracking-widest">{module.status}</Badge>
                    </div>
                    
                    <h3 className="headline text-2xl font-bold text-white mb-4">{module.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400 font-medium">
                      {module.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🟡 Infrastructure - Technical Credibility */}
      <section id="infrastructure" className="shell py-24 px-4 md:px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-0.5 w-10 bg-accent" />
              <span className="eyebrow">Enterprise Core</span>
            </div>
            <h2 className="headline text-5xl font-black text-primary md:text-6xl tracking-tighter leading-tight">
              工业级抓取与检索架构
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground font-medium">
              复用 Odin 系统的成熟逻辑，整合 Fastify 高性能后端与 Elasticsearch 实时索引。
              每 120 秒自动执行多源抓取，确保您获取的每一条资讯都是新鲜的。
            </p>
            
            <div className="mt-12 space-y-8">
              <FeatureItem
                icon={<Clock3 className="h-6 w-6 text-accent" />}
                title="120s 自动同步"
                description="对齐生产级 FinanceNewsService 调度逻辑"
              />
              <FeatureItem
                icon={<DatabaseZap className="h-6 w-6 text-accent" />}
                iconBg="bg-accent-soft/20"
                title="同源基建复用"
                description="统一 PostgreSQL + Redis + ES 存储体系"
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="relative lg:pl-12"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="panel-strong relative z-10 rounded-[3rem] p-6 shadow-2xl overflow-hidden border-border/40 bg-background/80 backdrop-blur-xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-slate-950 p-8 text-sm font-mono text-emerald-400 shadow-inner border border-white/5">
                <div className="mb-4 text-slate-500 font-bold">{"// Odin Pulse Sync Log"}</div>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <span className="text-slate-600 font-bold">[10:24:01]</span>
                    <span>Fetching wallstreet-cn...</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600 font-bold">[10:24:03]</span>
                    <span className="text-blue-400 font-bold">Indexed 12 new items to ES.</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600 font-bold">[10:26:01]</span>
                    <span>Pulse check: <span className="text-accent font-black">OK</span>. Memory: 142MB.</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="animate-pulse text-accent font-black">SYSTEM_ACTIVE</span>
                  <span className="text-slate-700 ml-auto">v0.1.0-alpha</span>
                </div>
              </div>
            </Card>
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-accent/10 blur-[100px]" />
          </motion.div>
        </div>
      </section>

      {/* 🟢 Footer - Professional & Simple */}
      <footer className="shell py-16 border-t border-border/60">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <span className="headline text-2xl font-black text-primary tracking-tighter">Odin Pulse</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Enterprise Portal</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">资源</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/news" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">新闻流</Link>
                <Link href="/markets" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">行情中心</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">账户</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">安全登录</Link>
                <Link href="/account" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">账户设置</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">关于</h4>
              <nav className="flex flex-col gap-2">
                <a href="https://codego.eu.org" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">平台说明</a>
                <span className="text-sm font-bold text-muted-foreground opacity-40 cursor-not-allowed">服务协议</span>
              </nav>
            </div>
          </div>
        </div>
        
        <Separator className="my-10 bg-border/40" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">
            © 2026 Odin Pulse. All signals reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Status: Operational</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function LiveMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="bg-background/80 p-8 transition-all duration-500 hover:bg-white md:p-10 group relative overflow-hidden">
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors mb-4">
        <span className="text-secondary group-hover:text-accent transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">{icon}</span>
        {label}
      </div>
      <div className="headline text-4xl font-black text-primary tracking-tighter transition-all duration-500 group-hover:scale-105 origin-left">{value}</div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-700 ease-in-out group-hover:w-full" />
    </div>
  );
}

function FeatureItem({
  icon,
  iconBg = "bg-white shadow-lg shadow-black/5 border border-border/40",
  title,
  description,
}: {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 group">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl group-hover:border-accent/40 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h4 className="headline text-xl font-black text-primary mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
