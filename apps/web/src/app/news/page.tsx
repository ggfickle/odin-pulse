import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  Filter,
  Newspaper,
  Radar,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { AuthStatus } from "@/components/auth-status";
import { fetchNews } from "@/lib/api";
import { RefreshButton } from "@/components/refresh-button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const quickFilters = [
  { label: "全部资讯", href: "/news" },
  { label: "重点关注", href: "/news?sentiment=IMPORTANT" },
  { label: "实时快讯", href: "/news?category=%E5%BF%AB%E8%AE%AF" },
  { label: "深度新闻", href: "/news?category=%E6%96%B0%E9%97%BB" },
] as const;

export const dynamic = "force-dynamic";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const page = pickSingle(resolved.page) ?? "1";
  const pageSize = pickSingle(resolved.pageSize) ?? "20";
  const keyword = pickSingle(resolved.keyword) ?? "";
  const category = pickSingle(resolved.category) ?? "";
  const source = pickSingle(resolved.source) ?? "";
  const sentiment = pickSingle(resolved.sentiment) ?? "";

  const data = await fetchNews({
    page: Number(page),
    pageSize: Number(pageSize),
    keyword,
    category,
    source,
    sentiment,
  });

  const currentPage = Number(page);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const startIndex = Math.max(1, (currentPage - 1) * data.pageSize + 1);
  const endIndex = Math.min(data.total, currentPage * data.pageSize);
  
  const prevHref = buildPageHref(currentPage - 1, resolved);
  const nextHref = buildPageHref(currentPage + 1, resolved);
  
  const activeFilters = [
    keyword ? { label: `关键词: ${keyword}`, key: 'keyword' } : null,
    category ? { label: `分类: ${category}`, key: 'category' } : null,
    source ? { label: `来源: ${source}`, key: 'source' } : null,
    sentiment === "IMPORTANT" ? { label: "重点关注", key: 'sentiment' } : null,
  ].filter(Boolean) as { label: string, key: string }[];

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* 🟢 Navigation & Header Section */}
      <div className="relative overflow-hidden pt-12 pb-10">
        <div className="hero-orb hero-orb-left opacity-20" />
        <div className="shell px-4 md:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回首页门户
            </Link>
            <div className="flex items-center gap-4">
              <AuthStatus />
              <RefreshButton />
            </div>
          </div>

          <div className="mt-10">
            <span className="eyebrow">News Aggregator</span>
            <h1 className="headline mt-4 text-4xl font-extrabold text-primary md:text-6xl">
              新闻聚合中心
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              实时同步多源金融资讯，通过 Elasticsearch 毫秒级检索，
              为您在海量信息中过滤出真正有价值的信号。
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Newspaper className="h-4 w-4" />} label="已索引资讯" value={data.total.toLocaleString()} />
            <StatCard icon={<DatabaseZap className="h-4 w-4" />} label="活跃数据源" value={data.sources.length.toString()} />
            <StatCard icon={<CalendarClock className="h-4 w-4" />} label="当前页码" value={`${currentPage} / ${totalPages}`} />
            <StatCard icon={<Radar className="h-4 w-4" />} label="同步状态" value={data.refreshedAt ? formatTime(data.refreshedAt) : "在线"} />
          </div>
        </div>
      </div>

      {/* 🔵 Filter & Search Bar */}
      <section className="shell px-4 md:px-6 mb-10">
        <div className="panel rounded-[2.5rem] p-6 shadow-xl border-slate-200/60">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-slate-200 bg-white/50 px-5 py-2 text-sm font-bold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                  <span key={filter.key} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft/20 px-3 py-1.5 text-xs font-bold text-accent border border-accent-soft/30">
                    {filter.label}
                  </span>
                ))}
                <Link href="/news" className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 ml-2">
                  <X className="h-3 w-3" />
                  重置筛选
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 fade-divider" />

          <form action="/news" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">关键词搜索</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  name="keyword"
                  defaultValue={keyword}
                  placeholder="搜索标题、内容或实体..."
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">分类筛选</label>
              <select
                name="category"
                defaultValue={category}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white appearance-none cursor-pointer"
              >
                <option value="">全部类别</option>
                {data.categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">数据来源</label>
              <select
                name="source"
                defaultValue={source}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white appearance-none cursor-pointer"
              >
                <option value="">全部来源</option>
                {data.sources.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <input type="hidden" name="page" value="1" />
              <button className="w-full h-12 rounded-2xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-slate-800">
                立即检索
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 🟠 Content Area */}
      <section className="shell px-4 md:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Main List */}
          <div className="flex-1 space-y-6">
            {data.items.length === 0 ? (
              <div className="panel-muted rounded-[2rem] py-20 text-center">
                <Radar className="mx-auto h-12 w-12 text-slate-300 animate-pulse" />
                <p className="mt-4 text-slate-500 font-medium">未找到匹配的资讯，尝试调整筛选条件</p>
              </div>
            ) : (
              data.items.map((item, index) => (
                <article 
                  key={item.id} 
                  className={`group relative overflow-hidden rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 ${
                    index === 0 && currentPage === 1 
                      ? "panel-strong border-slate-200/60 p-8 md:p-10" 
                      : "bg-white border-transparent p-6 md:p-8 hover:border-slate-200"
                  }`}
                >
                  {item.sentiment === "IMPORTANT" && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-accent text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">
                        Significant
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-secondary">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      {item.source}
                    </span>
                    {item.category && <span className="bg-slate-100 px-2 py-0.5 rounded-md">{item.category}</span>}
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDateTime(item.publishTime)}
                    </span>
                  </div>

                  <Link href={`/news/${item.id}`} className="block mt-5 group-hover:text-secondary transition-colors">
                    <h2 className={`headline font-extrabold text-primary leading-tight ${
                      index === 0 && currentPage === 1 ? "text-3xl md:text-4xl" : "text-2xl"
                    }`}>
                      {item.title}
                    </h2>
                  </Link>

                  <p className={`mt-5 text-slate-600 leading-relaxed line-clamp-3 ${
                    index === 0 && currentPage === 1 ? "text-base" : "text-sm"
                  }`} dangerouslySetInnerHTML={{ __html: item.content }} />

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/news/${item.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800"
                      >
                        详情分析
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={buildKeywordHref(item.title)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-primary hover:text-primary"
                      >
                        全网关联
                      </Link>
                    </div>

                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-secondary transition-colors"
                      >
                        查看原文
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}

            {/* Pagination Control */}
            <nav className="flex items-center justify-between rounded-[2rem] border border-slate-200/60 bg-white/60 backdrop-blur-md p-4 shadow-sm">
              <Link
                href={prevHref}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                  currentPage <= 1 
                    ? "pointer-events-none text-slate-200" 
                    : "text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/5"
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">第 {currentPage} 页</span>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-sm font-bold text-slate-400">共 {totalPages} 页</span>
              </div>

              <Link
                href={nextHref}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                  currentPage >= totalPages 
                    ? "pointer-events-none text-slate-200" 
                    : "text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/5"
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </Link>
            </nav>
          </div>

          {/* Right Sidebar - Sticky Insights */}
          <aside className="w-full lg:w-[320px]">
            <div className="sticky top-28 space-y-6">
              <div className="panel rounded-[2rem] p-6 border-slate-200/60">
                <div className="flex items-center gap-2 mb-6">
                  <Radar className="h-5 w-5 text-secondary" />
                  <h3 className="headline font-bold text-primary">情报看板</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">阅读重点</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      当前视图展示了最新的市场动态。建议关注标记为 <span className="text-accent font-bold">Significant</span> 的资讯。
                    </p>
                  </div>
                  
                  <div className="fade-divider" />
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">热门来源</p>
                    <div className="flex flex-wrap gap-2">
                      {data.sources.slice(0, 5).map(s => (
                        <span key={s} className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fade-divider" />

                  <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3 w-3" />
                      检索贴士
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      URL 参数与筛选状态实时同步，您可以直接复制当前地址分享给团队。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <Radar className="h-20 w-20" />
                </div>
                <h4 className="headline text-xl font-bold relative z-10">需要更深度的研报？</h4>
                <p className="mt-4 text-xs text-white/70 leading-relaxed relative z-10">
                  “投研中心”模块正在规划中，后续将接入更多专业机构的深度分析。
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-full border border-white/20 relative z-10">
                  敬请期待
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-5 transition-all hover:bg-white hover:shadow-lg">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span className="text-secondary">{icon}</span>
        {label}
      </div>
      <p className="headline mt-3 text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

function pickSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(
  page: number,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const next = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    const resolved = pickSingle(value);
    if (resolved) {
      next.set(key, resolved);
    }
  });
  next.set("page", String(Math.max(1, page)));
  return `/news?${next.toString()}`;
}

function buildKeywordHref(title: string) {
  return `/news?keyword=${encodeURIComponent(title.slice(0, 20))}`;
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
