import type { FastifyInstance, FastifyRequest } from "fastify";

import { AuthSessionService } from "../modules/auth/session.service.js";
import type { AuthSession } from "../modules/auth/auth.types.js";

const sessionService = new AuthSessionService();

export function createRequireSession(app: FastifyInstance) {
  return async (request: FastifyRequest): Promise<AuthSession> => {
    const session = await sessionService.getSession(request);
    if (!session) {
      throw app.httpErrors.unauthorized("认证失败，请重新登录");
    }
    return session;
  };
}

export { sessionService };
