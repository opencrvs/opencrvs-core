# Certificate Template Conditionals

## Overview

OpenCRVS now supports conditional filtering of certificate templates based on declaration form data and event metadata. This feature allows implementing countries to dynamically show or hide certificate templates based on specific criteria, providing a more flexible and context-aware certificate issuance process.

## Features

### Dynamic Template Filtering

- Certificate templates can be conditionally displayed based on form field values
- Templates can be filtered based on event metadata including action history
- Multiple conditionals can be applied to a single template
- Both form data and event metadata are supported as conditional sources

### Conditional Types

The system supports two main types of conditionals:

1. **Form Data Conditionals**: Filter templates based on values entered in the declaration form
2. **Event Metadata Conditionals**: Filter templates based on event properties including registration status, action history, and other metadata

## Implementation Guide

### Configuration

Certificate templates are configured in your country configuration with optional `conditionals` array:

```typescript
interface CertificateTemplateConfig {
  id: string
  event: string
  label: MessageDescriptor
  isDefault: boolean
  svgUrl: string
  svg: string
  fee: CertificateFee
  conditionals?: ConditionalConfig[]
}

interface ConditionalConfig {
  type: 'SHOW'
  conditional: JSONSchema
}
```

### Form Data Conditionals

To filter templates based on form field values, use the field path as specified in your form configuration:

```typescript
// Example: Show template only for male children
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      'child.gender': {
        type: 'string',
        enum: ['male']
      }
    },
    required: ['child.gender']
  }
}

// Example: Show template for children born before a specific date
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      'child.dob': {
        type: 'string',
        format: 'date',
        formatMaximum: '2023-01-01'
      }
    },
    required: ['child.dob']
  }
}
```

### Event Metadata Conditionals

To filter templates based on event metadata, you need to handle the nested object structure properly. The event metadata is passed as a nested object, so you must use JSON Schema's nested object syntax:

```typescript
// Example: Show template only for registered events
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          registration: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['REGISTERED']
              }
            },
            required: ['status']
          }
        },
        required: ['registration']
      }
    },
    required: ['event']
  }
}

// Example: Show template based on registration number pattern
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          registration: {
            type: 'object',
            properties: {
              registrationNumber: {
                type: 'string',
                pattern: '^BRN'
              }
            },
            required: ['registrationNumber']
          }
        },
        required: ['registration']
      }
    },
    required: ['event']
  }
}
```

### Complex Conditionals

You can combine multiple conditions using JSON Schema logical operators. Note the different syntax needed for form data (flat) vs event metadata (nested):

```typescript
// Example: Show template for male children registered in specific location
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      'child.gender': {
        type: 'string',
        enum: ['male']
      },
      event: {
        type: 'object',
        properties: {
          registration: {
            type: 'object',
            properties: {
              contactPoint: {
                type: 'object',
                properties: {
                  partOf: {
                    type: 'string',
                    enum: ['Location/district-1']
                  }
                },
                required: ['partOf']
              }
            },
            required: ['contactPoint']
          }
        },
        required: ['registration']
      }
    },
    required: ['child.gender', 'event']
  }
}
```

## Data Access Patterns

### Form Data Access

Form data is accessed using flattened field paths as defined in your form configuration:

- `child.firstName`
- `mother.nationality`
- `informant.relationship`

**Form data uses dot notation as literal property names** because the declaration form data is stored as a flattened object where `'child.firstName'` is an actual property key.

### Event Metadata Access

Event metadata is accessed through the `event` property as a nested object within the declaration object. The event object structure includes:

- `event.id` - Event ID
- `event.type` - Event type
- `event.trackingId` - Tracking ID
- `event.createdAt` - Event creation timestamp
- `event.updatedAt` - Last update timestamp
- `event.actions` - Array of action history
- `event.registration` - Registration-related metadata (when available)
- `event.registration.status` - Registration status
- `event.registration.registrationNumber` - Registration number
- `event.registration.contactPoint` - Registration office information

**Important**: Event metadata is accessed as a nested object structure. When writing conditionals for metadata, you must use proper JSON Schema nested object syntax, not dot notation property names. The `event` property contains the full EventDocument structure as a nested object.

## Key Differences in Conditional Syntax

### Form Data Conditionals (Flattened)

Use dot notation as literal property names:

```typescript
{
  type: 'object',
  properties: {
    'child.gender': { // This is a literal property key
      type: 'string',
      enum: ['male']
    }
  },
  required: ['child.gender']
}
```

### Event Metadata Conditionals (Nested)

Use nested object structure:

```typescript
{
  type: 'object',
  properties: {
    event: { // This is an object property
      type: 'object',
      properties: {
        registration: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['REGISTERED']
            }
          },
          required: ['status']
        }
      },
      required: ['registration']
    }
  },
  required: ['event']
}
```

## JSON Schema Support

The conditional system uses standard JSON Schema validation with support for:

- **Type validation**: `string`, `number`, `boolean`, `array`, `object`
- **Enum validation**: Restrict values to specific options
- **Pattern validation**: Regular expression matching
- **Date validation**: Date format with `formatMinimum`/`formatMaximum`
- **Numeric validation**: `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`
- **Array validation**: `minItems`, `maxItems`, `uniqueItems`
- **String validation**: `minLength`, `maxLength`
- **Advanced array contains**: `contains`, `minContains`, `maxContains` for count-based validation
- **Logical operators**: `not`, `anyOf`, `oneOf`, `allOf` for complex conditions

**Note**: OpenCRVS uses JSON Schema Draft 2019-09 which provides enhanced array validation capabilities including precise count-based matching with `minContains` and `maxContains`.

## Best Practices

### Performance Considerations

1. Keep conditionals simple and focused
2. Avoid deeply nested object checks when possible
3. Use specific field paths rather than broad object validation

### Maintainability

1. Document complex conditionals in your country configuration
2. Use descriptive template IDs and labels
3. Test conditionals thoroughly with various data combinations

### Error Handling

1. The system gracefully handles missing data - conditionals fail if required data is unavailable
2. Invalid conditionals will cause templates to be excluded from selection
3. Always provide at least one template without conditionals as a fallback

## Example Use Cases

### Regional Templates

Show different certificate templates based on the registration location:

```typescript
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          registration: {
            type: 'object',
            properties: {
              contactPoint: {
                type: 'object',
                properties: {
                  partOf: {
                    type: 'string',
                    enum: ['Location/rural-district']
                  }
                },
                required: ['partOf']
              }
            },
            required: ['contactPoint']
          }
        },
        required: ['registration']
      }
    },
    required: ['event']
  }
}
```

### Age-Based Templates

Show child-specific templates for young applicants:

```typescript
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      'child.dob': {
        type: 'string',
        format: 'date',
        formatMinimum: '2020-01-01'
      }
    },
    required: ['child.dob']
  }
}
```

### Status-Based Templates

Show special templates for already-registered events:

```typescript
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          registration: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['REGISTERED', 'CERTIFIED']
              }
            },
            required: ['status']
          }
        },
        required: ['registration']
      }
    },
    required: ['event']
  }
}
```

### Action History-Based Templates

Show templates based on specific actions that have occurred in the event's history:

```typescript
// Example: Show template only if event has been validated
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            contains: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  const: 'VALIDATE'
                },
                status: {
                  type: 'string',
                  const: 'ACCEPTED'
                }
              },
              required: ['type', 'status']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}

// Example: Show template if event was registered by specific role
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            contains: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  const: 'REGISTER'
                },
                createdByRole: {
                  type: 'string',
                  enum: ['LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR']
                }
              },
              required: ['type', 'createdByRole']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}
```

### Certificate Print Count-Based Templates

Show templates based on action history for print tracking (useful for replacement certificates):

```typescript
// Example: Show "Replacement Certificate" template if any print actions exist
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            contains: {
              type: 'object',
              properties: {
                type: { const: 'PRINT_CERTIFICATE' }
              },
              required: ['type']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}

// Example: Show "First Issue" template only when no print actions exist
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            not: {
              contains: {
                type: 'object',
                properties: {
                  type: { const: 'PRINT_CERTIFICATE' }
                },
                required: ['type']
              }
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}

// Example: Show template based on multiple different action types
{
  type: 'SHOW',
  conditional: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            contains: {
              type: 'object',
              properties: {
                type: {
                  enum: ['PRINT_CERTIFICATE', 'CERTIFY']
                }
              },
              required: ['type']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}
```

// Example: Show template only when at least 2 print actions exist (minContains)

```typescript
{
  "type": "SHOW",
  "conditional": {
    "type": "object",
    "properties": {
      "event": {
        "type": "object",
        "properties": {
          "actions": {
            "type": "array",
            "minContains": 2,
            "contains": {
              "type": "object",
              "properties": {
                "type": { "const": "PRINT_CERTIFICATE" }
              },
              "required": ["type"]
            }
          }
        },
        "required": ["actions"]
      }
    },
    "required": ["event"]
  }
}
```

// Example: Show template only when exactly 2 print actions exist (minContains + maxContains)

```typescript
{
  "type": "SHOW",
  "conditional": {
    "type": "object",
    "properties": {
      "event": {
        "type": "object",
        "properties": {
          "actions": {
            "type": "array",
            "minContains": 2,
            "maxContains": 2,
            "contains": {
              "type": "object",
              "properties": {
                "type": { "const": "PRINT_CERTIFICATE" }
              },
              "required": ["type"]
            }
          }
        },
        "required": ["actions"]
      }
    },
    "required": ["event"]
  }
}
```

// Example: Show template when at most 1 print action exists (maxContains)

```typescript
{
  "type": "SHOW",
  "conditional": {
    "type": "object",
    "properties": {
      "event": {
        "type": "object",
        "properties": {
          "actions": {
            "type": "array",
            "maxContains": 1,
            "contains": {
              "type": "object",
              "properties": {
                "type": { "const": "PRINT_CERTIFICATE" }
              },
              "required": ["type"]
            }
          }
        },
        "required": ["actions"]
      }
    },
    "required": ["event"]
  }
}
```

**Advanced Count-Based Validation**: OpenCRVS now supports sophisticated count-based conditionals using JSON Schema Draft 2019-09 features:

- **`minContains`**: Minimum number of matching items required
- **`maxContains`**: Maximum number of matching items allowed
- **Combined**: Use both together for exact count matching (e.g., exactly 2 prints)

This enables precise control over certificate template visibility based on action history counts, making it ideal for replacement certificate workflows and audit requirements.

## Testing

The system includes comprehensive test coverage for:

- Basic conditional evaluation
- Form data conditionals
- Event metadata conditionals
- Complex multi-field conditionals
- Edge cases and error handling

See `useCertificateTemplateSelectorFieldConfig.test.ts` for implementation examples and test patterns.

```

```
