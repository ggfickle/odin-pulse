"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Globe, 
  Zap, 
  Clock,
  Search,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchMarketQuotes } from "@/lib/api";
import { MarketQuote } from "@odin-pulse/shared";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function MarketsPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetchMarketQuotes();
      setQuotes(res.items);
      setRefreshedAt(res.refreshedAt);
    } catch (err) {
      console.error("Failed to load market quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首次加载 - 延迟执行以避免 React 级联渲染警告
    const initTimer = setTimeout(() => {
      void loadQuotes();
    }, 0);
    
    // 设置定时刷新
    const timer = setInterval(() => {
      void loadQuotes();
    }, 60000); 
    
    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, []);

  return (
    <motion.main 
      className="shell px-4 py-8 md:py-16 md:px-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header Section */}
      <motion.div 
        variants={fadeInUp}
        className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">
               Real-time Active
             </Badge>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
               <Clock className="h-3 w-3" />
               Last Sync: {refreshedAt ? new Date(refreshedAt).toLocaleTimeString() : "..."}
             </span>
          </div>
          <h1 className="headline-sharp text-4xl font-black text-primary md:text-5xl tracking-tighter">
            Markets <span className="text-secondary">Terminal</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void loadQuotes()} disabled={loading} className="rounded-full font-bold h-10 px-5 border-border/60">
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            刷新行情
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-border/60">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Main Market Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <AnimatePresence mode="popLayout">
          {loading && quotes.length === 0 ? (
            [1, 2, 3].map(i => (
              <Card key={i} className="h-48 bg-secondary/20 animate-pulse rounded-[2rem] border-none" />
            ))
          ) : (
            quotes.map((q) => (
              <motion.div key={q.symbol} variants={fadeInUp} layout>
                <MetricCard 
                  label={q.symbol.split('$')[0]} 
                  name={q.name}
                  value={q.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                  change={`${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)} (${q.changePercent.toFixed(2)}%)`} 
                  trend={q.change >= 0 ? 'up' : 'down'} 
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Market Sentiment Overview */}
        <motion.div variants={fadeInUp} className="lg:col-span-8">
          <Card className="bento-card bg-white border-none rounded-[2.5rem] p-8 md:p-12 shadow-xl h-full">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <Activity className="h-3 w-3 text-accent" />
                  Global Pulse
                </p>
                <h3 className="headline-sharp mt-2 text-2xl font-black text-primary">Sentiment Map</h3>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1.5 rounded-full font-bold shadow-none">Bullish 64%</Badge>
                <Badge className="bg-slate-100 text-slate-400 border-slate-200 px-4 py-1.5 rounded-full font-bold shadow-none">Neutral 21%</Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
              <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-10 w-10 text-secondary animate-pulse" />
              </div>
              <h4 className="headline-sharp text-xl font-bold text-primary uppercase">Advanced Charting Coming Soon</h4>
              <p className="mt-2 text-slate-400 font-medium max-w-sm">
                High-frequency data visualization with sentiment correlation is currently in internal testing.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <motion.div variants={fadeInUp}>
             <Card className="p-8 bg-primary text-white rounded-[2.5rem] border-none relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Globe className="h-24 w-24" />
                </div>
                <Badge variant="outline" className="border-white/20 text-white/60 font-black text-[9px] uppercase tracking-widest mb-6">System Integration</Badge>
                <h3 className="headline-sharp text-2xl font-black mb-4">API Documentation</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                  Access our low-latency market data feeds and intelligence endpoints directly via GraphQL or WebSockets.
                </p>
                <Button className="w-full rounded-xl bg-white text-primary hover:bg-slate-100 border-none h-12 font-black uppercase tracking-widest text-[10px]">
                  Request API Key
                </Button>
             </Card>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
             <Card className="p-8 bg-slate-50 border-border/60 rounded-[2.5rem] shadow-none">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary inline-flex mb-6">
                   <Zap className="h-5 w-5" />
                </div>
                <h4 className="headline-sharp text-xl font-black mb-3">iTick Data Core</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                   Powered by iTick real-time quote engine. Low-latency transmission with Redis level-2 caching active.
                </p>
             </Card>
          </motion.div>
        </aside>
      </div>
    </motion.main>
  );
}

function MetricCard({ label, name, value, change, trend }: { label: string, name: string, value: string, change: string, trend: 'up' | 'down' }) {
  return (
    <Card className="bento-card bg-white p-8 rounded-[2rem] hover:border-accent/30 transition-all cursor-default group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          <p className="text-xs font-bold text-primary/40 truncate max-w-[120px]">{name}</p>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
        )}>
          {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {change}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="headline-sharp text-4xl font-black text-primary tracking-tighter">{value}</p>
        <ArrowUpRight className={cn("h-4 w-4 transition-transform", trend === 'down' && "rotate-90", trend === 'up' ? "text-emerald-500" : "text-rose-500")} />
      </div>
    </Card>
  );
}
