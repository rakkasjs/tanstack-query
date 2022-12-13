import { createRequestHandler } from "rakkasjs";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { uneval } from "devalue";

export default createRequestHandler({
  createPageHooks() {
    let queries = Object.create(null);

    return {
      emitBeforeSsrChunk() {
        if (Object.keys(queries).length === 0) return "";

        // Emit a script that calls the global $rqh function with the
        // newly fetched query data.

        const queriesString = uneval(queries);
        queries = Object.create(null);
        return `<script>$rqh(${queriesString})</script>`;
      },

      wrapApp(app) {
        const queryCache = new QueryCache({
          onSuccess(data, query) {
            // Store newly fetched data
            queries[query.queryHash] = data;
          },
        });

        const queryClient = new QueryClient({
          queryCache,
          defaultOptions: {
            queries: {
              suspense: true,
              staleTime: Infinity,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
            },
          },
        });

        return (
          <QueryClientProvider client={queryClient}>{app}</QueryClientProvider>
        );
      },
    };
  },
});
