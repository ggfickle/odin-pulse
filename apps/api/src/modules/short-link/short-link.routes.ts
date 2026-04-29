import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { createRequireSession } from "../../lib/require-session.js";
import { shortLinkService } from "./short-link.service.js";

const createShortLinkSchema = z.object({
  originalUrl: z.string().url(),
  slug: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
});

export async function registerShortLinkRoutes(app: FastifyInstance) {
  const requireSession = createRequireSession(app);

  // Create short link
  app.post("/api/v1/short-links", async (request) => {
    const session = await requireSession(request);
    const body = createShortLinkSchema.parse(request.body);
    return shortLinkService.create(session.userId, body);
  });

  // List short links
  app.get("/api/v1/short-links", async (request) => {
    const session = await requireSession(request);
    return shortLinkService.list(session.userId);
  });

  // Delete short link
  app.delete("/api/v1/short-links/:id", async (request) => {
    const session = await requireSession(request);
    const { id } = request.params as { id: string };
    const success = await shortLinkService.delete(session.userId, id);
    return { success };
  });

  // Public redirection endpoint (used by s.codego.eu.org)
  app.get("/s/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const url = await shortLinkService.resolve(slug);
    if (url) {
      return reply.redirect(url);
    } else {
      return reply.status(404).send({ message: "Short link not found" });
    }
  });
}
