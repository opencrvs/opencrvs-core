# V2 Events

Client for managing custom events.

## Directory structure

```
# Reusable components used by features.
/components
# Features used by routes
/features
  /events
    # Each action has 'review' and 'pages' definitions to match configuration
    /actions
      [Action]/
        Pages.tsx
        Review.tsx
        # exports Pages and Review
        index.ts
# Reusable layouts used between features
/layouts
# Route definitions and application structure
/routes
    # Route definitions
    routes.ts
    # Structured route configuration
    config.tsx
```

We will be iterating over the structure during the project. Treat it as a starting point. Many times the important thing is to have any structure.

## Route structure

By default, Events V2 is accessible via the /v2 route, allowing the application’s normal operations to continue alongside its development. When Events V2 needs to be deployed to a live environment as the primary event type, the environment variable V2_EVENTS=true can be set in the country config package. This hides the old event views completely and replaces them with Events V2. Once Events V2 is officially released, it will become the default event view.

## Development practices

- Do not import components outside v2-events. If you need a component, copy it in and refactor it.
- When building new features, aim to have a separate component that handles interaction with router and data fetching when it makes sense. Features should be route independent, and necessary information (ids and such) should be passed in as props or similar. See (`features/events/actions/register` or `features/events/actions/declare`)
- Use constants through object pattern. e.g.`ActionType.CREATE` over `'CREATE'`. In most situations, it does not matter. However, changing the names will get much easier.
- When building new features, prefer to import them through `index.ts`. Managing imports will be cleaner and easier that way. See (`/layouts`)

### Fetching data from backend

- All data should be fetched using useMutation or useSuspenseQuery from TanStack Query. If you define a completely new (non-tRPC) query or mutation, use `queryClient.setMutationDefaults({ mutationFn: <operation> })` or `queryClient.setQueryDefaults({ queryFn: <operation> })` to define the data fetcher method. This ensures that TanStack Query knows how to call your function even
  when the request is first serialized into the local cache and executed later.

- Whenever possible, mutation operations should follow a “fire-and-forget” approach to maintain a snappy UI, even with poor or no internet connection. Perform the query and let it process in the background.
