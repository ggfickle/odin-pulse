"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LoginMode = "password" | "code";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const submitLabel = useMemo(() => {
    return mode === "password" ? "邮箱密码登录" : "验证码登录";
  }, [mode]);

  async function handlePasswordLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/email-verify/login-by-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("登录成功，正在跳转。");
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(normalizeError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/email-verify/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          verifyCode,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("登录成功，正在跳转。");
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(normalizeError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function sendCode() {
    setSendingCode(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/email-verify/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: "login",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("验证码已发送。");
    } catch (requestError) {
      setError(normalizeError(requestError));
    } finally {
      setSendingCode(false);
    }
  }

  async function redirectToProvider(provider: "github" | "google") {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/auth/${provider}-oauth-url`);
      const payload = (await response.json()) as { url: string | null };
      if (!payload.url) {
        throw new Error(`${provider} oauth not configured`);
      }
      window.location.href = payload.url;
    } catch (requestError) {
      setError(normalizeError(requestError));
      setLoading(false);
    }
  }

  return (
    <motion.div 
      className="grid gap-8 xl:grid-cols-[1fr_360px]"
      initial="initial"
      animate="animate"
      variants={{
        animate: { transition: { staggerChildren: 0.1 } }
      }}
    >
      <motion.section variants={fadeInUp} className="panel-strong rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={mode === "password" ? "default" : "outline"}
            onClick={() => setMode("password")}
            className="rounded-full px-8 py-6 h-auto font-bold text-base shadow-lg"
          >
            邮箱密码
          </Button>
          <Button
            variant={mode === "code" ? "default" : "outline"}
            onClick={() => setMode("code")}
            className="rounded-full px-8 py-6 h-auto font-bold text-base shadow-lg"
          >
            邮箱验证码
          </Button>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleCodeLogin}
          className="grid gap-6"
        >
          <div className="grid gap-2">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
              邮箱地址
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
              placeholder="you@example.com"
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {mode === "password" ? (
              <motion.div
                key="password-field"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid gap-2"
              >
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
                  安全密码
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
                  placeholder="请输入密码"
                  required
                />
              </motion.div>
            ) : (
              <motion.div
                key="code-field"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid gap-4 sm:grid-cols-[1fr_auto]"
              >
                <div className="grid gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
                    验证码
                  </label>
                  <Input
                    value={verifyCode}
                    onChange={(event) => setVerifyCode(event.target.value)}
                    className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-base shadow-sm focus-visible:ring-primary/20"
                    placeholder="6 位验证码"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendCode}
                  disabled={sendingCode || !email}
                  className="mt-7 h-14 rounded-2xl border-slate-200 bg-white px-8 font-bold text-slate-700 shadow-sm"
                >
                  {sendingCode ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "获取验证码"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={loading}
            className="mt-4 h-14 rounded-2xl bg-primary px-10 text-lg font-bold text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-70"
          >
            {loading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            {submitLabel}
          </Button>
        </form>

        {message && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 border border-emerald-100"
          >
            {message}
          </motion.p>
        )}
        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 border border-rose-100"
          >
            {error}
          </motion.p>
        )}
      </motion.section>

      <motion.aside variants={fadeInUp} className="flex flex-col gap-8">
        <Card className="panel border-none rounded-[2.5rem] p-6 shadow-xl">
          <CardHeader className="p-0 mb-6">
            <p className="eyebrow">OAuth Access</p>
            <CardTitle className="headline mt-2 text-2xl font-bold text-primary">第三方登录</CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid gap-4">
            <Button
              variant="outline"
              onClick={() => redirectToProvider("github")}
              className="h-14 w-full rounded-2xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all"
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub 登录
            </Button>
            <Button
              variant="outline"
              onClick={() => redirectToProvider("google")}
              className="h-14 w-full rounded-2xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all"
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              Google 登录
            </Button>
            
            <p className="mt-4 text-sm leading-relaxed text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
              "工业级认证基建，GitHub / Google 授权受控于后端环境变量，确保数据主权。"
            </p>
            
            <Button variant="link" asChild className="mt-4 font-bold text-secondary hover:text-primary">
              <Link href="/account" className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                已登录？进入账户中心
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.aside>
    </motion.div>
  );
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败";
}
