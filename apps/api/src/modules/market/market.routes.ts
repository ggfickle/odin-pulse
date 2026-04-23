import type { FastifyInstance, FastifyRequest } from "fastify";
import { marketService } from "./market.service.js";
import { AuthSessionService } from "../auth/session.service.js";

export async function registerMarketRoutes(app: FastifyInstance) {
  const sessionService = new AuthSessionService();

  const requireSession = async (request: FastifyRequest) => {
    const session = await sessionService.getSession(request);
    if (!session) {
      throw app.httpErrors.unauthorized("认证失败，请重新登录");
    }
    return session;
  };

  app.get("/api/v1/market/quotes", async (request) => {
    await requireSession(request);
    
    // Default list of symbols if none provided
    const defaultSymbols = ["AAPL$US", "TSLA$US", "NVDA$US"];
    const { symbols } = request.query as { symbols?: string };
    const symbolList = symbols ? symbols.split(",") : defaultSymbols;

    const items = await marketService.getQuotes(symbolList);
    return {
      items,
      refreshedAt: new Date().toISOString(),
    };
  });
}
