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

## Development practices

- Do not import components outside v2-events. If you need a component, copy it in and refactor it.
- When building new features, aim to have a separate component that handles interaction with router and data fetching when it makes sense. Features should be route independent, and necessary information (ids and such) should be passed in as props or similar. See (`features/events/actions/register` or `features/events/actions/declare`)
- Use constants through object pattern. e.g.`ActionType.CREATE` over `'CREATE'`. In most situations, it does not matter. However, changing the names will get much easier.
- When building new features, prefer to import them through `index.ts`. Managing imports will be cleaner and easier that way. See (`/layouts`)
