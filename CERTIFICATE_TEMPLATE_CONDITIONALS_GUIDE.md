# Certificate Template Conditionals - Simple and Powerful

## Overview for Country Config Teams

We've introduced **certificate template conditionals** - a powerful new feature that allows you to show or hide certificate templates based on print history. Use the intuitive `event.printActions()` helper from the OpenCRVS toolkit library to create dynamic certificate selection experiences.

## How It Works

Certificate templates can now include conditional logic that determines when they should be available for selection. This enables sophisticated workflows like replacement certificates, commemorative copies, and multi-step certificate processes.

### Simple and Intuitive Approach

Use the `event.printActions()` helper to create conditions based on printing history:

```typescript
import { event } from '@opencrvs/commons/client'

conditionals: [
  {
    type: 'SHOW',
    conditional: event.printActions().minCount(1) // Show after any print
  }
]
```

## Common Use Cases

### 1. Replacement Certificate

Show a "replacement" template after the original has been printed:

```typescript
{
  id: 'birth-replacement-certificate',
  event: 'birth',
  label: 'Replacement Birth Certificate',
  conditionals: [
    {
      type: 'SHOW',
      conditional: event.printActions('birth-certificate').minCount(1)
    }
  ]
}
```

### 2. Multiple Copy Certificate

Show a "multiple copy" template after 2+ prints:

```typescript
{
  id: 'birth-multiple-copy-certificate',
  event: 'birth',
  label: 'Birth Certificate (Multiple Copy)',
  conditionals: [
    {
      type: 'SHOW',
      conditional: event.printActions().minCount(2)
    }
  ]
}
```

### 3. Limited Print Certificate

Hide a template after it's been printed once (one-time only):

```typescript
{
  id: 'birth-commemorative-certificate',
  event: 'birth',
  label: 'Commemorative Birth Certificate',
  conditionals: [
    {
      type: 'SHOW',
      conditional: event.printActions('birth-commemorative-certificate').maxCount(0)
    }
  ]
}
```

## Support

This helper is available in:

- `@opencrvs/commons/client` package
- All country config repositories that use OpenCRVS v1.8.0+
- Full TypeScript support with autocomplete
