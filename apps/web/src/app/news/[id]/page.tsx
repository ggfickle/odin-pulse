"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Clock3,
  Newspaper,
  Radar,
  ScanSearch,
  Share2,
  ChevronRight,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { fetchNewsDetail } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type NewsDetail = {
  item: {
    id: string;
    title: string;
    content: string;
    source: string;
    sourceUrl: string | null;
    publishTime: string;
    category?: string;
    sentiment?: string;
  };
  related: Array<{
    id: string;
    title: string;
    source: string;
    publishTime: string;
    sentiment?: string;
  }>;
  refreshedAt: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function NewsDetailPage() {
  const { id } = useParams() as { id: string };
  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await fetchNewsDetail(id);
        // @ts-expect-error detail structure mismatch
        setDetail(data);
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="shell flex min-h-[70vh] items-center justify-center px-4 py-12 md:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-slate-400"
        >
          <div className="relative">
            <Radar className="h-12 w-12 animate-pulse text-primary" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/10" />
          </div>
          <span className="text-sm font-black tracking-[0.3em] uppercase opacity-50">Decoding Intelligence...</span>
        </motion.div>
      </main>
    );
  }

  if (!detail) {
    notFound();
  }

  const { item, related, refreshedAt } = detail;
  const keywordHref = `/news?keyword=${encodeURIComponent(item.title.slice(0, 20))}`;
  const sourceHref = `/news?source=${encodeURIComponent(item.source)}`;
  
  return (
    <motion.main 
      className="shell px-4 py-6 md:py-12 md:px-6 mb-20"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Top Navigation & Status */}
      <motion.div 
        variants={fadeInUp}
        className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link 
            href="/news" 
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all h-10 px-6 flex items-center gap-2 border-border/60 group"
            )}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">返回新闻中心</span>
          </Link>
          <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/10 px-4 py-1.5 h-10 rounded-full font-bold uppercase tracking-widest text-[9px]">
            <Clock3 className="h-3.5 w-3.5 mr-2 opacity-60" />
            最近同步: {refreshedAt ? formatDateTime(refreshedAt) : "暂无"}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Article Header */}
          <motion.article 
            variants={fadeInUp}
            className="relative overflow-hidden rounded-[3rem] bg-primary p-10 md:p-16 text-white shadow-2xl shadow-primary/30"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-80 w-80 rounded-full bg-white/5 blur-[100px]" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-10">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
                  <Newspaper className="h-3.5 w-3.5" />
                  {item.source}
                </span>
                {item.category && (
                  <Badge className="bg-accent text-white border-none px-3 py-1 font-black tracking-widest shadow-lg">
                    {item.category}
                  </Badge>
                )}
                <span className="flex items-center gap-2 font-bold opacity-80">
                   <Clock3 className="h-3.5 w-3.5" />
                   {formatDateTime(item.publishTime)}
                </span>
              </div>

              <h1 className="headline text-4xl font-black leading-[1.1] text-white md:text-5xl lg:text-6xl tracking-tighter">
                {item.title}
              </h1>

              <div className="mt-14 flex flex-wrap gap-4">
                {item.sourceUrl && (
                  <Link 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "rounded-full bg-white text-primary hover:bg-slate-100 shadow-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] group transition-all hover:-translate-y-1 flex items-center"
                    )}
                  >
                    查看原文
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}
                <Link 
                  href={sourceHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm px-10 h-14 font-black uppercase tracking-widest text-[10px] transition-all hover:-translate-y-1 flex items-center"
                  )}
                >
                  同源追踪
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 h-14 w-14 transition-all hover:-translate-y-1">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Article Body */}
          <motion.section variants={fadeInUp}>
            <Card className="panel-strong border-border/40 rounded-[3rem] p-10 md:p-16 overflow-hidden shadow-2xl bg-gradient-to-br from-white to-slate-50/50">
              <div className="relative">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-1 bg-accent rounded-full" />
                    <h2 className="headline text-2xl font-black text-primary uppercase tracking-tighter">
                      Intelligence Report
                    </h2>
                  </div>
                  <div className="hidden sm:block">
                     <Badge variant="outline" className="border-border/60 text-muted-foreground font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] shadow-none">
                       Ref ID: {item.id.slice(0, 8)}
                     </Badge>
                  </div>
                </div>

                <div
                  className="article-content prose prose-slate max-w-none 
                    text-lg md:text-xl leading-[1.8] text-slate-700 font-medium
                    [&>p]:mb-8 [&>p:last-child]:mb-0
                    [&>h2]:text-3xl [&>h2]:font-black [&>h2]:text-primary [&>h2]:mt-12 [&>h2]:mb-6
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8
                    first-letter:text-6xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:leading-[1]"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                <Separator className="my-16 bg-border/40" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Metadata Context</span>
                     <Badge variant="outline" className="rounded-lg border-border/60 text-slate-600 bg-slate-50 font-black px-3 py-1 text-[10px] uppercase">
                       {item.source}
                     </Badge>
                     {item.category && (
                       <Badge variant="outline" className="rounded-lg border-border/60 text-slate-600 bg-slate-50 font-black px-3 py-1 text-[10px] uppercase">
                         {item.category}
                       </Badge>
                     )}
                  </div>
                  <Link 
                    href={keywordHref}
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "font-black text-secondary hover:text-primary transition-all p-0 group uppercase tracking-widest text-xs flex items-center"
                    )}
                  >
                    继续回查这条主线
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.section>
        </div>

        {/* Sidebar / Contextual Data */}
        <aside className="lg:col-span-4 space-y-10">
          <motion.div variants={fadeInUp}>
            <Card className="rounded-[2.5rem] p-10 shadow-2xl bg-background/60 backdrop-blur-xl border-border/40 overflow-visible relative">
              <CardHeader className="p-0 mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Radar className="h-4 w-4 text-accent" />
                  <span className="eyebrow">Contextual Matrix</span>
                </div>
                <CardTitle className="headline text-3xl font-black text-primary tracking-tight">深度追踪</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <TrackCard
                  icon={<Newspaper className="h-4 w-4" />}
                  title="来源维度"
                  body={`来自 ${item.source}，适合追查该机构的后续研报与实时动态。`}
                  href={sourceHref}
                  action="查看同源"
                />
                <TrackCard
                  icon={<ScanSearch className="h-4 w-4" />}
                  title="主线关联"
                  body="通过核心关键词回溯本条资讯的发展脉络与历史背景。"
                  href={keywordHref}
                  action="回查主线"
                />
                {item.sentiment === "IMPORTANT" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl bg-accent/5 border border-accent/20 p-8 shadow-inner"
                  >
                    <div className="flex items-center gap-3 text-accent mb-4">
                      <BellRing className="h-5 w-5 animate-bounce" />
                      <span className="font-black uppercase tracking-widest text-xs">Critical Alert</span>
                    </div>
                    <p className="text-sm text-accent/80 leading-relaxed font-bold">
                      此项资讯已被标记为重点。建议密切关注其对二级市场的潜在波动影响。
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="rounded-[2.5rem] p-10 shadow-2xl bg-background/60 backdrop-blur-xl border-border/40 overflow-visible">
              <CardHeader className="p-0 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-1 rounded-full bg-accent" />
                  <span className="eyebrow">Related News</span>
                </div>
                <CardTitle className="headline text-3xl font-black text-primary tracking-tight">关联阅读</CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="flex flex-col gap-4">
                  {related.map((relatedItem) => (
                    <Link
                      key={relatedItem.id}
                      href={`/news/${relatedItem.id}`}
                      className="group block no-underline"
                    >
                      <Card className="bg-background/40 rounded-[1.5rem] p-6 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:bg-white group-hover:shadow-2xl border-transparent group-hover:border-accent/20 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                           <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-0.5 border-none">
                             {relatedItem.source}
                           </Badge>
                           <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                             {formatDateTime(relatedItem.publishTime)}
                           </span>
                        </div>
                        <p className="headline text-lg font-black leading-tight text-primary group-hover:text-secondary transition-colors line-clamp-2">
                          {relatedItem.title}
                        </p>
                      </Card>
                    </Link>
                  ))}
                  {related.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-[2rem] border-dashed border-2 border-border/40">
                      <p className="text-sm font-black uppercase tracking-widest opacity-30">No Related Signals</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-0 mt-10 pt-8 border-t border-border/40 flex justify-center">
                <Link href="/news" className="text-xs font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-[0.2em] group">
                   查看全部资讯中心
                   <ChevronRight className="h-3 w-3 ml-2 inline transition-transform group-hover:translate-x-1" />
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </aside>
      </div>
    </motion.main>
  );
}

function TrackCard({
  icon,
  title,
  body,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="p-8 rounded-[2rem] bg-muted/20 border border-transparent transition-all duration-500 hover:bg-white hover:shadow-2xl hover:border-accent/10 group">
      <div className="flex items-center gap-4 text-secondary mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
          {icon}
        </div>
        <p className="headline text-xl font-black text-primary tracking-tight">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 font-medium mb-8">{body}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary transition-all hover:gap-4 group/link no-underline"
      >
        {action}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
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
