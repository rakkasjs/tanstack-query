# Rakkas Tanstack Query Integration

This repo contains an example of using [Tanstack Query](https://tanstack.com/query) (formerly known as React Query) with [Rakkas](https://rakkasjs.org).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/rakkasjs/tanstack-query)

## How does it work?

In short, we bypass Tanstack Query's own dehydration/hydration mechanism and do the serialization/deserialization ourselves by injecting scripts that call `queryClient.setQueryData` on the client side.

The file [`entry-hattip.tsx`](./src/entry-hattip.tsx) is Rakkas's server entry point and it contains Rakkas's [server-side customization hooks](https://rakkasjs.org/guide/hattip-entry). We use these hooks to serialize Tanstack Query's data into React's SSR stream.

The `wrapApp` hook is used to wrap the React app into a `QueryClientProvider`. A new query client is created for each request and its `onSuccess` hook is used to collect the data from each successful query.

The `emitToDocumentHead` hook is used to insert a small script into the document's head that contains the following:

```js
$TQD = Object.create(null);
$TQS = (data) => Object.assign($TQD, data);
```

This defines a global object called `$TQD` (as in "Tanstack Query data") and a function called `$TQS` (as in "Tanstack Query set"). When `$TQS` is called with some data, it's merged into `$TQD`.

The `emitBeforeSsrChunk` is for injecting markup into React's SSR stream before each time React emits a chunk of HTML. We use it to inject a script that calls the `$TQS` function with the new data since the last time. The data is serialized with [`devalue`](https://github.com/Rich-Harris/devalue), but `JSON.stringify` + some escaping would also work depending on your needs.

In [`entry-client.tsx`](./src/entry-client.tsx), which is the client entry point of Rakkas, we take the data accumulated in `$TQD` and use `queryClient.setQueryData` to make it available to the client-side queries. We also overwrite the `$TQS` function to call `queryClient.setQueryData` from then on instead of stuffing the data into `$TQD`. We also delete the `$TQD` object to free up some memory.

We pass `Date.now()` to `queryClient.setQueryData`'s `updatedAt` option. This is not really accurate but synchronizing clocks between the server and the client is not realistically feasible.

Finally, we use `suspense: true` when creating the query client to make sure all queries use Suspense by default. We also set less aggressive defaults to make debugging and observing the behavior easier.

You can uncomment the last few lines of [`layout.tsx`](./src/routes/layout.tsx) to disable streaming and force React to wait until all suspense boundaries are resolved before emitting the HTML. This can make it easier to see what's going on.

## TODO

- Use Tanstack Query with [`useServerSideQuery`](https://rakkasjs.org/guide/use-server-side-query)
- Create an "integration plugin" system for Rakkas to make this type of integration easier on the en user
