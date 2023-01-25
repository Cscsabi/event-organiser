import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "event-organiser-api-server";
import superjson from "superjson";

export const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "http://localhost:8000/api/trpc",
      maxURLLength: 2083,
    }),
  ],
});
