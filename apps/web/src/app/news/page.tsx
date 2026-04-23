"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  Newspaper,
  Radar,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  Filter
} from "lucide-react";

import { AuthStatus } from "@/components/auth-status";
import { RefreshButton } from "@/components/refresh-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchNews } from "@/lib/api";
import { Suspense, useEffect, useState, ReactNode } from "react";
import { NewsListResponse } from "@odin-pulse/shared";

const quickFilters = [
  { label: "全部资讯", value: "all" },
  { label: "重点关注", value: "important" },
  { label: "实时快讯", value: "flash" },
  { label: "深度新闻", value: "news" },
] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <Radar className="h-12 w-12 animate-pulse text-primary" />
        </div>
      }
    >
      <NewsPageContent />
    </Suspense>
  );
}

function NewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<NewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const page = searchParams.get("page") ?? "1";
  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "";
  const source = searchParams.get("source") ?? "";
  const sentiment = searchParams.get("sentiment") ?? "";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchNews({
        page: Number(page),
        pageSize: 20,
        keyword,
        category,
        source,
        sentiment,
      });
      setData(res);
      setLoading(false);
    }
    loadData();
  }, [page, keyword, category, source, sentiment]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const currentPage = Number(page);

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "none") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/news?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/news");
  };

  return (
    <main className="flex-1 bg-background text-foreground pb-20">
      {/* 🟢 Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden pt-12 pb-10"
      >
        <div className="hero-orb hero-orb-left opacity-10" />
        <div className="shell px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-0.5 w-8 bg-accent" />
                <span className="eyebrow">News Aggregator</span>
              </div>
              <h1 className="headline text-4xl font-black text-primary md:text-6xl tracking-tighter leading-tight">
                新闻聚合中心
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-medium">
                实时同步多源金融资讯，通过 Elasticsearch 毫秒级检索，
                为您在海量信息中过滤出真正有价值的信号。
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <RefreshButton />
              <Button variant="outline" size="sm" className="rounded-full font-bold border-border/60">
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                同步状态: 在线
              </Button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Newspaper className="h-4 w-4" />} label="已索引资讯" value={data?.total.toLocaleString() ?? "..."} />
            <StatCard icon={<DatabaseZap className="h-4 w-4" />} label="活跃数据源" value={data?.sources.length.toString() ?? "..."} />
            <StatCard icon={<CalendarClock className="h-4 w-4" />} label="当前页码" value={`${currentPage} / ${totalPages}`} />
            <StatCard icon={<Radar className="h-4 w-4" />} label="更新时间" value={data?.refreshedAt ? formatTime(data.refreshedAt) : "..."} />
          </div>
        </div>
      </motion.div>

      {/* 🔵 Filter & Search Bar - Shadcn UI Integration */}
      <section className="shell px-4 md:px-6 mb-12">
        <Card className="rounded-[2.5rem] p-8 shadow-2xl border-border/40 bg-background/60 backdrop-blur-xl overflow-visible relative z-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full font-bold transition-all hover:-translate-y-0.5 px-6 border-border/60",
                    (filter.value === "important" && sentiment === "IMPORTANT") ||
                    (filter.value === "flash" && category === "快讯") ||
                    (filter.value === "news" && category === "新闻") ||
                    (filter.value === "all" && !sentiment && !category && !keyword)
                      ? "bg-primary text-white border-primary hover:bg-primary/90"
                      : "bg-background hover:bg-muted"
                  )}
                  onClick={() => {
                    if (filter.value === "important") handleFilter("sentiment", "IMPORTANT");
                    else if (filter.value === "flash") handleFilter("category", "快讯");
                    else if (filter.value === "news") handleFilter("category", "新闻");
                    else clearFilters();
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <AnimatePresence>
              {(keyword || category || source || sentiment) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center"
                >
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5 mr-2" /> 清空所有筛选
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator className="my-8 bg-border/40" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-3 lg:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 flex items-center gap-2">
                <Search className="h-3 w-3 text-accent" />
                关键词搜索
              </label>
              <div className="relative group">
                <Input
                  defaultValue={keyword}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFilter("keyword", (e.target as HTMLInputElement).value);
                  }}
                  placeholder="搜索标题、内容或实体..."
                  className="pl-6 rounded-2xl h-14 border-border/60 bg-background/50 focus:bg-white transition-all shadow-none text-base font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 flex items-center gap-2">
                <Filter className="h-3 w-3 text-accent" />
                分类筛选
              </label>
              <Select value={category || "none"} onValueChange={(v: string | null) => handleFilter("category", v ?? "none")}>
                <SelectTrigger className="h-14 rounded-2xl border-border/60 bg-background/50 focus:bg-white transition-all shadow-none px-6 font-medium">
                  <SelectValue placeholder="全部类别" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/60 shadow-2xl backdrop-blur-xl">
                  <SelectItem value="none" className="font-medium rounded-lg">全部类别</SelectItem>
                  {data?.categories.map((c) => (
                    <SelectItem key={c} value={c} className="font-medium rounded-lg">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 flex items-center gap-2">
                <DatabaseZap className="h-3 w-3 text-accent" />
                数据来源
              </label>
              <Select value={source || "none"} onValueChange={(v: string | null) => handleFilter("source", v ?? "none")}>
                <SelectTrigger className="h-14 rounded-2xl border-border/60 bg-background/50 focus:bg-white transition-all shadow-none px-6 font-medium">
                  <SelectValue placeholder="全部来源" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/60 shadow-2xl backdrop-blur-xl">
                  <SelectItem value="none" className="font-medium rounded-lg">全部来源</SelectItem>
                  {data?.sources.map((s) => (
                    <SelectItem key={s} value={s} className="font-medium rounded-lg">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/40 active:scale-95"
                onClick={() => {
                   const input = document.querySelector('input[placeholder="搜索标题、内容或实体..."]') as HTMLInputElement;
                   if (input) handleFilter("keyword", input.value);
                }}
              >
                立即检索
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* 🟠 Content Area with Motion */}
      <section className="shell px-4 md:px-6">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1 space-y-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                   {[1,2,3].map(i => (
                     <Card key={i} className="rounded-[2.5rem] border-border/40 p-8">
                       <div className="flex gap-4 mb-6">
                         <div className="h-4 w-20 bg-muted animate-pulse rounded-full" />
                         <div className="h-4 w-32 bg-muted animate-pulse rounded-full" />
                       </div>
                       <div className="h-8 w-3/4 bg-muted animate-pulse rounded-xl mb-4" />
                       <div className="h-20 w-full bg-muted animate-pulse rounded-xl" />
                     </Card>
                   ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {data?.items.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-32 rounded-[3rem] bg-muted/20 border-dashed border-2 border-border/60">
                      <Radar className="h-16 w-16 text-muted-foreground/30 animate-pulse mb-6" />
                      <p className="text-xl font-bold text-muted-foreground tracking-tight">未找到匹配的资讯</p>
                      <Button variant="link" onClick={clearFilters} className="mt-4 font-bold text-accent">重置所有筛选条件</Button>
                    </Card>
                  ) : (
                    data?.items.map((item, index) => (
                      <motion.article 
                        key={item.id}
                        variants={fadeInUp}
                        className={`group relative overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                          index === 0 && currentPage === 1 
                            ? "panel-strong border-border/60 p-10 md:p-14 bg-gradient-to-br from-white to-slate-50/50" 
                            : "bg-background/60 border border-border/40 p-8 hover:border-accent/30"
                        }`}
                      >
                        {item.sentiment === "IMPORTANT" && (
                          <div className="absolute top-0 right-0">
                            <Badge className="rounded-none rounded-bl-3xl px-6 py-2 bg-accent text-white border-none font-black uppercase tracking-widest text-[10px] shadow-lg">
                              Significant Signal
                            </Badge>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                          <span className="flex items-center gap-2 text-secondary">
                            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                            {item.source}
                          </span>
                          {item.category && <Badge variant="secondary" className="text-[10px] font-black bg-slate-100 text-slate-600 border-none px-3 py-0.5">{item.category}</Badge>}
                          <span className="flex items-center gap-2 font-bold">
                            <CalendarClock className="h-3.5 w-3.5 opacity-60" />
                            {formatDateTime(item.publishTime)}
                          </span>
                        </div>

                        <Link href={`/news/${item.id}`} className="block group-hover:text-secondary transition-colors text-inherit no-underline">
                          <h2 className={`headline font-black text-primary leading-tight tracking-tight ${
                            index === 0 && currentPage === 1 ? "text-3xl md:text-5xl mb-6" : "text-2xl mb-4"
                          }`}>
                            {item.title}
                          </h2>
                        </Link>

                        <p className={`text-muted-foreground leading-relaxed font-medium line-clamp-3 ${
                          index === 0 && currentPage === 1 ? "text-lg mb-10" : "text-sm mb-8"
                        }`} dangerouslySetInnerHTML={{ __html: item.content }} />

                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/news/${item.id}`}
                              className={cn(
                                buttonVariants({ size: index === 0 && currentPage === 1 ? "lg" : "default" }),
                                "rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl transition-all hover:bg-slate-800 flex items-center"
                              )}
                            >
                              详情分析 <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                            <Link
                              href={`/news?keyword=${encodeURIComponent(item.title.slice(0, 20))}`}
                              className={cn(
                                buttonVariants({ variant: "outline", size: index === 0 && currentPage === 1 ? "lg" : "default" }),
                                "rounded-full font-bold border-border/60 flex items-center bg-transparent"
                              )}
                            >
                              全网关联
                            </Link>
                          </div>

                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors no-underline group/link"
                            >
                              查看原文
                              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                            </a>
                          )}
                        </div>
                      </motion.article>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination Control */}
            {!loading && totalPages > 1 && (
              <motion.nav 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-[2.5rem] border border-border/40 bg-background/60 backdrop-blur-md p-6 shadow-xl"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  disabled={currentPage <= 1}
                  className="rounded-2xl transition-all font-bold px-6"
                  onClick={() => handleFilter("page", String(currentPage - 1))}
                >
                  <ChevronLeft className="h-5 w-5 mr-2" /> 上一页
                </Button>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                       let pageNum = currentPage;
                       if (currentPage <= 3) pageNum = i + 1;
                       else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                       else pageNum = currentPage - 2 + i;
                       
                       if (pageNum <= 0 || pageNum > totalPages) return null;

                       return (
                         <Button
                           key={pageNum}
                           variant={currentPage === pageNum ? "default" : "ghost"}
                           size="sm"
                           className={cn("h-10 w-10 rounded-full font-black", currentPage === pageNum ? "shadow-lg shadow-primary/20" : "")}
                           onClick={() => handleFilter("page", String(pageNum))}
                         >
                           {pageNum}
                         </Button>
                       );
                    })}
                  </div>
                  <Separator orientation="vertical" className="h-6 hidden sm:block" />
                  <span className="text-sm font-black text-primary uppercase tracking-widest">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="lg"
                  disabled={currentPage >= totalPages}
                  className="rounded-2xl transition-all font-bold px-6"
                  onClick={() => handleFilter("page", String(currentPage + 1))}
                >
                  下一页 <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.nav>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[360px]">
             <div className="sticky top-28 space-y-8">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="rounded-[2.5rem] p-8 border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                      <Radar className="h-5 w-5" />
                    </div>
                    <h3 className="headline text-2xl font-black text-primary tracking-tight">情报看板</h3>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">阅读重点</p>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        当前视图展示了最新的市场动态。建议关注标记为 <Badge variant="secondary" className="bg-accent/10 text-accent border-none font-black text-[9px] px-2 py-0">Significant</Badge> 的实时资讯，它们通常包含更强的决策信号。
                      </p>
                    </div>
                    
                    <Separator className="bg-border/40" />
                    
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">热门来源</p>
                      <div className="flex flex-wrap gap-2">
                        {data?.sources.slice(0, 8).map(s => (
                          <Badge 
                            key={s} 
                            variant="outline" 
                            className="text-[10px] font-bold bg-background/50 border-border/60 hover:border-accent/40 cursor-pointer transition-colors px-3 py-1 rounded-lg"
                            onClick={() => handleFilter("source", s)}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10">
                      <p className="text-xs font-black text-primary mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
                        检索贴士
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        URL 参数与筛选状态实时同步，您可以直接复制当前地址分享给团队，所有人看到的视图将完全一致。
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-6 text-white/5 transition-all duration-500 group-hover:text-white/10 group-hover:scale-110 group-hover:rotate-12">
                  <Radar className="h-32 w-32" />
                </div>
                <Badge className="bg-accent text-white font-black uppercase tracking-widest text-[9px] mb-6 border-none px-3 py-1">Upcoming</Badge>
                <h4 className="headline text-2xl font-black relative z-10 mb-4 tracking-tight">需要更深度的研报？</h4>
                <p className="text-sm text-slate-400 leading-relaxed relative z-10 font-medium mb-8">
                  “投研中心”模块正在规划中，后续将接入更多专业机构的深度分析与量化信号。
                </p>
                <Button variant="secondary" className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all">
                  敬请期待
                </Button>
              </motion.div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode, label: string, value: string }) {
  return (
    <Card className="bg-background/40 backdrop-blur-md border-border/40 rounded-3xl p-6 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:border-accent/20 group">
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors mb-4">
        <span className="text-secondary group-hover:text-accent transition-all duration-500 group-hover:scale-110">{icon}</span>
        {label}
      </div>
      <p className="headline text-3xl font-black text-primary tracking-tighter transition-all duration-500 group-hover:scale-105 origin-left">{value}</p>
    </Card>
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

function cn(...inputs: any[]) {
  const { clsx } = require("clsx");
  const { twMerge } = require("tailwind-merge");
  return twMerge(clsx(inputs));
}
