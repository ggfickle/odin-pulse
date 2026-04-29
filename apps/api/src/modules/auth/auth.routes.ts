import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { RateLimiter } from "../../lib/rate-limit.js";
import { createRequireSession } from "../../lib/require-session.js";
import { AuthService } from "./auth.service.js";
import { sessionService } from "../../lib/require-session.js";

const emailVerifySendSchema = z.object({
  email: z.string().email(),
  type: z.preprocess((value) => {
    if (value === 1 || value === "1") {
      return "login";
    }
    if (value === 2 || value === "2") {
      return "password";
    }
    return value;
  }, z.enum(["login", "password"])).default("login"),
});

const emailCodeLoginSchema = z.object({
  email: z.string().email(),
  verifyCode: z.string().min(4).max(10),
});

const emailPasswordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const oauthCallbackSchema = z.object({
  code: z.string().min(1),
});

const updateUserInfoSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
});

// Rate limiters
const emailSendLimit = new RateLimiter("rl:email-send");
const loginAttemptLimit = new RateLimiter("rl:login-attempt");
const ipLimit = new RateLimiter("rl:ip-send");

function getClientIp(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return request.ip;
}

export async function registerAuthRoutes(app: FastifyInstance) {
  const authService = new AuthService();
  const requireSession = createRequireSession(app);

  app.setErrorHandler((error, request, reply) => {
    const isAuthRoute =
      request.url.startsWith("/api/v1/auth") ||
      request.url.startsWith("/api/v1/user");

    if (!isAuthRoute) {
      reply.send(error);
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      const typedError = error as { statusCode: number; message?: string };
      reply.status(typedError.statusCode).send({
        message: typedError.message ?? "auth request failed",
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : "auth request failed";
    const statusCode =
      message.includes("频繁") || message.includes("锁定") || message.includes("次数过多")
        ? 429
        : message.includes("unauthorized") || message.includes("认证失败")
          ? 401
          : message.includes("SMTP")
            ? 503
            : 400;

    reply.status(statusCode).send({
      message,
    });
  });

  app.get("/api/v1/auth/health", async () => ({ ok: true }));

  // --- Email verify send (with rate limiting) ---
  app.post("/api/v1/auth/email-verify/send", async (request) => {
    const body = emailVerifySendSchema.parse(request.body);

    // Rate limit: same email once per 60s
    await emailSendLimit.check(body.email, 1, 60);
    // Rate limit: same IP max 10 per hour
    await ipLimit.check(getClientIp(request), 10, 3600);

    return {
      success: await authService.sendEmailVerifyCode(body.email, body.type),
    };
  });

  // --- Email code login (with attempt limiting) ---
  app.post("/api/v1/auth/email-verify/login", async (request, reply) => {
    const body = emailCodeLoginSchema.parse(request.body);

    // Check if currently locked out
    await loginAttemptLimit.checkLocked(`code:${body.email}`);

    try {
      const result = await authService.loginByEmailCode(body);
      await loginAttemptLimit.reset(`code:${body.email}`);
      const session = await authService.buildSessionPayload(result.userId);
      await sessionService.createSession(reply, session);
      return result;
    } catch {
      // Count all failures to prevent enumeration
      await loginAttemptLimit.recordFailure(`code:${body.email}`, 5, 900, 900);
      throw new Error("验证码不正确");
    }
  });

  // --- Password login (with attempt limiting) ---
  app.post("/api/v1/auth/email-verify/login-by-password", async (request, reply) => {
    const body = emailPasswordLoginSchema.parse(request.body);

    // Check if currently locked out
    await loginAttemptLimit.checkLocked(`pw:${body.email}`);

    try {
      const result = await authService.loginByPassword(body);
      await loginAttemptLimit.reset(`pw:${body.email}`);
      const session = await authService.buildSessionPayload(result.userId);
      await sessionService.createSession(reply, session);
      return result;
    } catch {
      // Count all failures to prevent enumeration
      await loginAttemptLimit.recordFailure(`pw:${body.email}`, 5, 900, 900);
      throw new Error("密码错误");
    }
  });

  // --- Other auth routes ---

  app.post("/api/v1/auth/change-password", async (request) => {
    const session = await requireSession(request);
    const body = passwordChangeSchema.parse(request.body);
    return {
      success: await authService.changePassword({
        userId: session.userId,
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      }),
    };
  });

  app.get("/api/v1/auth/github-oauth-url", async () => ({
    url: await authService.getOAuthUrl("github"),
  }));

  app.get("/api/v1/auth/google-oauth-url", async () => ({
    url: await authService.getOAuthUrl("google"),
  }));

  app.post("/api/v1/auth/github-callback", async (request, reply) => {
    const body = oauthCallbackSchema.parse(request.body);
    const result = await authService.loginByOAuth("github", body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });

  app.post("/api/v1/auth/google-callback", async (request, reply) => {
    const body = oauthCallbackSchema.parse(request.body);
    const result = await authService.loginByOAuth("google", body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });

  app.get("/api/v1/auth/me", async (request) => {
    const session = await requireSession(request);
    return authService.getCurrentUser(session);
  });

  app.post("/api/v1/auth/logout", async (request, reply) => {
    await sessionService.destroySession(request, reply);
    return { success: true };
  });

  // --- User routes ---

  app.get("/api/v1/user/get-user-info", async (request) => {
    const session = await requireSession(request);
    return authService.getUserInfo(session);
  });

  app.post("/api/v1/user/update-user-info", async (request) => {
    const session = await requireSession(request);
    const body = updateUserInfoSchema.parse(request.body);
    return {
      success: await authService.updateUserInfo(session, body),
    };
  });
}
