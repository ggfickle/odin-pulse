"use client";

import { useEffect, useState } from "react";
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check,
  AlertCircle,
  Hash,
  Type,
  ArrowRight,
  TrendingUp,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchShortLinks, createShortLink, deleteShortLink } from "@/lib/api";
import { ShortLink } from "@odin-pulse/shared";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export default function ShortLinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setLoadingCreate] = useState(false);
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetchShortLinks();
      setLinks(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCreate(true);
    setError(null);
    try {
      await createShortLink({ originalUrl: url, slug: slug || undefined, description });
      setUrl("");
      setSlug("");
      setDescription("");
      await loadLinks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "创建失败";
      setError(message);
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个短链吗？")) return;
    try {
      await deleteShortLink(id);
      await loadLinks();
    } catch (err) {
      console.error(err);
    }
  }

  function handleCopy(slug: string, id: string) {
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_LINK_DOMAIN || window.location.origin + "/s"}/${slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredLinks = links.filter(link => 
    link.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background selection:bg-accent/20">
      {/* 💠 Hero Section with Glassy Backdrop */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-20">
           <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container-slim relative">
          <motion.div 
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.03] border border-primary/10 mb-6">
               <span className="mono-tag !bg-transparent !p-0">System Tools</span>
               <div className="h-3 w-[1px] bg-border mx-1" />
               <span className="text-[10px] font-bold text-accent tracking-widest uppercase">Premium Shortner</span>
            </div>
            
            <h1 className="headline-sharp text-5xl md:text-6xl font-black text-primary mb-6">
              Link <span className="text-accent italic font-serif">Intelligence.</span>
            </h1>
            
            <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-8">
              Transform your digital reach with professional, trackable, and branded short links. 
              Designed for high-performance business workflows.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 💠 Workbench Area */}
      <section className="container-slim -mt-8 relative z-10 mb-20">
        <motion.div {...fadeInUp}>
          <Card className="glass-slim border-border/40 p-1 bg-white/40 shadow-2xl rounded-[2rem]">
            <div className="bg-white rounded-[1.8rem] p-8 md:p-10 border border-white shadow-inner">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                   <Plus className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-primary tracking-tight uppercase">Creation Workbench</h3>
                   <p className="text-[11px] font-bold text-muted-foreground opacity-60">Generate a new shortened identifier</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <LinkIcon className="h-3 w-3 text-accent" /> Destination URL
                   </label>
                   <Input 
                    required
                    type="url"
                    placeholder="https://example.com/very/long/path"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="rounded-xl border-border/60 bg-secondary/30 h-12 focus:bg-white focus:ring-accent/20 transition-all shadow-none font-medium"
                   />
                </div>

                <div className="md:col-span-3 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <Hash className="h-3 w-3 text-accent" /> Custom Slug
                   </label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-muted-foreground/30">/s/</span>
                      <Input 
                        placeholder="my-link"
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                        className="rounded-xl border-border/60 bg-secondary/30 h-12 pl-10 focus:bg-white focus:ring-accent/20 transition-all shadow-none font-bold"
                      />
                   </div>
                </div>

                <div className="md:col-span-3 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <Type className="h-3 w-3 text-accent" /> Description
                   </label>
                   <Input 
                    placeholder="Reference name..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="rounded-xl border-border/60 bg-secondary/30 h-12 focus:bg-white focus:ring-accent/20 transition-all shadow-none font-medium"
                   />
                </div>

                <div className="md:col-span-1">
                   <Button
                    type="submit"
                    disabled={creating}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all group"
                   >
                     {creating ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                     )}
                   </Button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:col-span-12 flex items-center gap-2 p-3 rounded-xl bg-destructive/5 text-destructive text-xs font-bold border border-destructive/10"
                  >
                     <AlertCircle className="h-4 w-4" />
                     {error}
                  </motion.div>
                )}
              </form>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* 💠 List Section */}
      <section className="container-slim pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">Existing Links</h2>
              <p className="text-sm font-medium text-muted-foreground">Manage and track your active redirections</p>
           </div>
           
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input 
                placeholder="Search slug or destination..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-2xl border-border/60 bg-white shadow-sm focus:ring-accent/10"
              />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary/30 animate-pulse rounded-[1.5rem]" />)}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
               {filteredLinks.length === 0 ? (
                 <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-[2.5rem] bg-secondary/5">
                    <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                       <LinkIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-black text-muted-foreground/40 tracking-widest uppercase">No records found</p>
                 </div>
               ) : (
                 filteredLinks.map(item => (
                   <motion.div key={item.id} variants={fadeInUp}>
                      <Card className="bento-card group h-full flex flex-col p-0 overflow-hidden bg-white rounded-[1.8rem] border-border/50">
                         <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                               <div className="flex flex-col">
                                  <span 
                                    className="text-lg font-black text-primary hover:text-accent transition-colors cursor-pointer flex items-center gap-1" 
                                    onClick={() => handleCopy(item.slug, item.id)}
                                  >
                                     <span className="text-accent opacity-40 font-serif italic text-sm">s/</span>
                                     {item.slug}
                                  </span>
                                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter mt-1">Short identifier</p>
                               </div>
                               <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 transition-colors py-1 px-2.5 rounded-lg flex items-center gap-1.5 shadow-none">
                                  <TrendingUp className="h-3 w-3" />
                                  <span className="font-black text-[10px]">{item.visitCount}</span>
                                </Badge>
                            </div>

                            <div className="space-y-3">
                               <div className="flex items-center gap-2 group/url">
                                  <div className="h-6 w-6 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
                                     <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <p className="text-[11px] font-bold text-muted-foreground/70 truncate break-all leading-tight pr-4">
                                     {item.originalUrl}
                                  </p>
                               </div>
                               
                               {item.description && (
                                 <div className="pt-2 border-t border-border/40">
                                    <p className="text-[11px] font-black text-primary/40 italic flex items-center gap-2">
                                       <Type className="h-3 w-3" />
                                       “{item.description}”
                                    </p>
                                 </div>
                               )}
                            </div>
                         </div>

                         <div className="px-6 py-4 bg-secondary/20 border-t border-border/30 flex items-center justify-between">
                            <Button 
                              variant="ghost" 
                              onClick={() => handleCopy(item.slug, item.id)}
                              className={cn(
                                "h-9 flex-1 mr-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                copiedId === item.id ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-white border border-border/60 hover:border-accent hover:text-accent shadow-sm"
                              )}
                            >
                               {copiedId === item.id ? (
                                 <><Check className="h-3.5 w-3.5 mr-2" /> Copied</>
                               ) : (
                                 <><Copy className="h-3.5 w-3.5 mr-2" /> Copy Link</>
                               )}
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(item.id)}
                              className="h-9 w-9 rounded-xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </Card>
                   </motion.div>
                 ))
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
