"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle, LogIn, Mail, ShieldCheck, UserRound, Sparkles, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserInfo = {
  openId: string;
  unionId: string;
  platformId: string;
  openUserNickname: string;
  openUsername: string;
  email: string | null;
  uniUserNickname: string;
  avatar: string | null;
  isAdmin: boolean;
};

type LoadState = "loading" | "ready" | "unauthorized" | "error";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function AccountPanel() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/v1/user/get-user-info", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          if (active) {
            setLoadState("unauthorized");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const payload = (await response.json()) as UserInfo;
        if (!active) {
          return;
        }

        setUser(payload);
        setNickname(payload.openUserNickname || payload.uniUserNickname || "");
        setAvatar(payload.avatar || "");
        setLoadState("ready");
      } catch (error) {
        if (active) {
          setLoadState("error");
          setProfileError(normalizeError(error));
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) {
      return "";
    }
    return user.openUserNickname || user.uniUserNickname || user.openUsername || user.email || user.openId;
  }, [user]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/v1/user/update-user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nickname: nickname.trim(),
          avatar: avatar.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const nextUser = user
        ? {
            ...user,
            openUserNickname: nickname.trim(),
            uniUserNickname: nickname.trim() || user.uniUserNickname,
            avatar: avatar.trim() || null,
          }
        : user;
      setUser(nextUser);
      setProfileMessage("资料已更新。");
    } catch (error) {
      setProfileError(normalizeError(error));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setOldPassword("");
      setNewPassword("");
      setPasswordMessage("密码已更新。");
    } catch (error) {
      setPasswordError(normalizeError(error));
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loadState === "loading") {
    return (
      <section className="panel rounded-[2.5rem] p-12 text-center shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <p className="headline font-bold">正在读取账户基建...</p>
        </div>
      </section>
    );
  }

  if (loadState === "unauthorized") {
    return (
      <section className="panel rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl" />
        <div className="relative">
          <p className="eyebrow !text-rose-500">Access Denied</p>
          <h2 className="headline mt-4 text-3xl font-extrabold text-primary md:text-4xl">您尚未获得访问授权</h2>
          <p className="mt-4 mx-auto max-w-lg text-slate-600">
            账户中心仅对已认证用户开放。请先通过统一入口登录。
          </p>
          <Link 
            href="/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 rounded-full bg-primary px-10 shadow-xl shadow-primary/20 flex items-center"
            )}
          >
            <LogIn className="h-5 w-5 mr-2" />
            立即认证
          </Link>
        </div>
      </section>
    );
  }

  if (loadState === "error" || !user) {
    return (
      <section className="panel rounded-[2.5rem] p-12 text-center shadow-2xl">
        <p className="eyebrow !text-rose-500">System Error</p>
        <h2 className="headline mt-4 text-3xl font-extrabold text-primary">账户状态同步失败</h2>
        <p className="mt-4 text-rose-700 font-bold bg-rose-50 p-4 rounded-2xl inline-block border border-rose-100">
          {profileError || "请检查网络环境或重新登录。"}
        </p>
      </section>
    );
  }

  return (
    <motion.div 
      className="grid gap-8 xl:grid-cols-[1fr_400px]"
      initial="initial"
      animate="animate"
      variants={{
        animate: { transition: { staggerChildren: 0.1 } }
      }}
    >
      <motion.section variants={fadeInUp} className="panel-strong rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-primary opacity-5">
          <UserRound className="h-48 w-48" />
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-6">
              {user.avatar ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <Image
                    src={user.avatar}
                    alt={displayName}
                    width={100}
                    height={100}
                    className="relative h-24 w-24 rounded-full border-2 border-white object-cover shadow-2xl"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-100 bg-white text-slate-300 shadow-inner">
                  <UserRound className="h-12 w-12" />
                </div>
              )}
              <div>
                <p className="eyebrow">Authenticated Operator</p>
                <h2 className="headline mt-2 text-4xl font-extrabold text-primary">{displayName}</h2>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 font-bold">
                    {user.isAdmin ? "Core Admin" : "Premium Member"}
                  </Badge>
                  <Badge variant="outline" className="text-slate-500 px-3 font-bold">
                    ID: {user.platformId}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-12">
            <InfoCard icon={<Mail className="h-4 w-4 text-secondary" />} label="认证邮箱" value={user.email || "未绑定"} />
            <InfoCard icon={<UserRound className="h-4 w-4 text-secondary" />} label="系统账户" value={user.openUsername || "N/A"} />
          </div>

          <form onSubmit={handleProfileSubmit} className="grid gap-8 pt-10 border-t border-slate-100">
            <div>
              <p className="eyebrow">Operator Settings</p>
              <h3 className="headline mt-2 text-2xl font-bold text-primary">更新身份信息</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
                  展示昵称
                </label>
                <Input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
                  placeholder="输入新的展示昵称"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
                  头像资源 (URL)
                </label>
                <Input
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="h-14 rounded-2xl bg-primary px-10 text-lg font-bold text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-70"
            >
              {profileLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              保存资料更改
            </Button>

            <AnimatePresence>
              {profileMessage && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 border border-emerald-100"
                >
                  {profileMessage}
                </motion.p>
              )}
              {profileError && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 border border-rose-100"
                >
                  {profileError}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.section>

      <motion.aside variants={fadeInUp} className="flex flex-col gap-8">
        <Card className="panel border-none rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
          
          <CardHeader className="p-0 mb-8">
            <p className="eyebrow">Security Protocol</p>
            <CardTitle className="headline mt-2 text-2xl font-bold text-primary">修改访问凭据</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <form onSubmit={handlePasswordSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
                  当前凭据
                </label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
                  placeholder="请输入当前密码"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
                  新设凭据
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
                  placeholder="建议 8 位以上复杂密码"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={passwordLoading}
                className="h-14 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all"
              >
                {passwordLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                更新安全凭据
              </Button>

              <AnimatePresence>
                {passwordMessage && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 border border-emerald-100"
                  >
                    {passwordMessage}
                  </motion.p>
                )}
                {passwordError && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 border border-rose-100"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>

        <Card className="panel border-none rounded-[2.5rem] p-8 shadow-xl bg-primary text-white">
          <CardHeader className="p-0 mb-6">
            <p className="eyebrow !text-accent-soft">Session Policy</p>
            <CardTitle className="headline mt-2 text-2xl font-bold">会话安全说明</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-4 text-sm leading-relaxed text-slate-300">
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>所有敏感数据均通过加密的 Redis Session 管理，本地不存储任何 JWT。</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>更新昵称后，全平台门户组件将实时同步显示。</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>OAuth 授权关联受限于 Odin 基建的安全策略。</span>
              </li>
            </ul>
            
            <Link 
              href="/api/v1/auth/logout"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-8 w-full rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white border-none shadow-2xl flex items-center justify-center gap-2"
              )}
            >
              <LogOut className="h-4 w-4" />
              终止当前会话
            </Link>
          </CardContent>
        </Card>
      </motion.aside>
    </motion.div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="panel-muted rounded-2xl p-5 border border-transparent transition-all hover:bg-white hover:shadow-md hover:border-slate-100">
      <div className="flex items-center gap-3 text-slate-500 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="headline text-lg font-bold text-primary break-all">{value}</p>
    </div>
  );
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败";
}
