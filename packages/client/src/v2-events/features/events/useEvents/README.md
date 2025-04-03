useEvents acts as the component facing layer for API connections.

**Known issues**

- Offline support requires mutationFn to be defined (https://tanstack.com/query/latest/docs/framework/react/guides/mutations#persisting-offline-mutations)
- Because of the offline requirement, **the order in which files and functions are executed matters**.
  - You might face issues with error `No mutationFn found.`. In this scenario, it is easiest to define items in same file (e.g. persisting hooks with mutation default definitions)
- We need to define clear file and import structure in order to get rid of the flakiness.

**Directory structure**

```
useEvents.ts # Exposes configured API methods
api.ts # Manual api client management (cache invalidation, response modification)
outbox.ts #
/procedures # Static configurations for event queries and mutations (Needed for offline use). With appropriate hook*
  /actions # Configuration related to event actions (e.g. declare, validate)

```

**Creating new procedures**

This is a simplified example. See the up to date code for specific implementation.

0. TRPC setup

```
// packages/client/src/v2-events/trpc.tsx

export const trpcClient = getTrpcClient() // API client. Can be used to make direct api calls.
export const queryClient = getQueryClient() // Query client. Can be used to interact with the cache.

// Combines trpc and query client into one proxy. Options are then passed to procedure hooks.
export const trpcOptionsProxy = createTRPCOptionsProxy({
  queryClient,
  client: trpcClient
})

```

1. Add procedure defaults (`/procedures`)

```
// Defining a mutation for events TRPC method:

function setMutationDefaults(mutation, options) {
  queryClient.setMutationDefaults(mutation.mutationKey(), options)
}

setMutationDefaults(trpcOptionsProxy.event.actions.register, {
  // For offline functionality, mutations must have a default function set up.
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.register
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REGISTER
  }
})
```

2. Wrap procedure to a hook

```
function useEventAction(trpcProcedure) {
    const allOptions = {
    ...trpcProcedure.mutationOptions(),
    ...queryClient.getMutationDefaults(trpcProcedure.mutationKey())
  }

  // mutationFn will be removed at this stage to ensure it has been specified in a serializable manner under /procedures. This ensures early error detection
  // without explicitly testing offline functionality.
  const { mutationFn, ...mutationOptions } = allOptions

  return useMutation(mutationOptions)

}

export function useEvents() {
  const trpc = useTRPC()

  return {
    register: useEventAction(trpc.event.actions.register),
  }
```

4. Use the hook

```
function Component() {
  const events = useEvents()

const onSubmit = (form, eventId) => events.actions.register.request.mutate({
          eventId: eventId,
          data: form,
          transactionId: uuid(),
        })


}

```
