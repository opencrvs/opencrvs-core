# EXPLORATION NOTES - Issue #11653

## Session 1: Environment Setup & Codebase Exploration
**Date:** 2026-02-10  
**Branch:** ocrvs-11653-custom-client-evaluation  
**Status:** Partial (need to complete remaining questions)

---

## 1. What does field('id') return? What type? What methods exist on it?

**Answer:** `field('id')` is implemented as `createFieldConditionals('id')` in `packages/commons/src/conditionals/conditionals.ts` (line ~443).

**Return Type:** Object with FieldReference-like methods that build JSON Schema validators:

```typescript
{
  // Internal tracking
  $$field: string              // The field ID
  $$subfield: string[]         // Nested path (for composite fields)
  
  // Path navigation
  get(fieldPath: string)                    // Navigate to nested property
  getByPath(fieldPath: string[])            // Navigate using array path
  asDob()                                   // Shortcut for .get('dob')
  asAge()                                   // Shortcut for .get('age')
  
  // Comparison operators (return JSONSchema)
  isEqualTo(value: string | boolean | number | FieldReference)
  isGreaterThan(value: number | FieldReference)
  isLessThan(value: number | FieldReference)
  isBetween(min: number, max: number)
  
  // Date/time comparisons (return builder objects)
  isAfter()    // → { days: (n) => {...}, date: (d) => {...}, now: () => {...} }
  isBefore()   // → { days: (n) => {...}, date: (d) => {...}, now: () => {...} }
  
  // State checks (return JSONSchema)
  isUndefined()
  isFalsy()
  inArray(values: string[])
  
  // Validation helpers (return JSONSchema)
  isValidEnglishName()
  isValidAdministrativeLeafLevel()
  matches(pattern: string)
  
  // Utility
  getId()                                   // Returns { fieldId }
  object(options)                           // @deprecated
}
```

**Key Pattern:** Every method returns either:
- A `JSONSchema` object (type: `{ $id: string, __nominal__type: 'JSONSchema' }`)
- A builder object (for fluent date/time APIs)

---

## 2. How does an existing validator (e.g. required()) produce a JSON Schema? Trace the full chain.

**Answer:** The `required()` pattern doesn't exist as a method on `field()`. Instead, `required` is a **field configuration property** (not a validator method).

**Validation flow:**
1. **Field config** defines `required: true | { message: TranslationConfig }`
2. **Zod validation** (`mapFieldTypeToZod()` in `FieldTypeMapping.ts`) applies type-level requirements
3. **Custom validators** defined in `field.validation[]` run via `runCustomFieldValidations()`
4. **JSON Schema** produced via `defineFormConditional()`:
   ```typescript
   defineFormConditional(schema) 
     → omitKeyDeep(schema, '$id')  // Remove nested $ids
     → { $id: hash(schema), ...schema }  // Add top-level hash-based $id
   ```

**Chain for field('id').isEqualTo('value'):**
```
createFieldConditionals('id')
  → { ...methods, $$field: 'id', $$subfield: [] }
  → .isEqualTo('value')
  → defineFormConditional({
      type: 'object',
      properties: {
        $form: {
          type: 'object',
          properties: {
            id: { type: ['string','boolean','number'], const: 'value' }
          },
          required: ['id']
        }
      },
      required: ['$form']
    })
  → { $id: 'https://opencrvs.org/conditionals/SHA1_HASH', ...schema }
```

---

## 3. How does validate() in validate.ts work? What AJV instance? What custom keywords exist?

**Location:** `packages/commons/src/conditionals/validate.ts`

**AJV Instance:**
```typescript
const ajv = new Ajv({
  $data: true,              // Enable $data references (cross-field validation)
  allowUnionTypes: true,
  strict: false            // Allow newer JSON Schema features
})
addFormats(ajv)           // Date, email, etc. formats
```

**Custom Keywords:**
1. **`daysFromDate`** (line ~95)
   - Purpose: Dynamic date validation (e.g., "30 days before/after reference date")
   - Schema: `{ days: number, clause: 'after'|'before', referenceDate?: string | {$data: string} }`
   - Uses `resolveDataPath()` for $data references

2. **`isLeafLevelLocation`** (line ~163)
   - Purpose: Check if location ID is a leaf-level admin location
   - Schema: `{ type: 'string', isLeafLevelLocation: true }`
   - Compares against `dataContext.rootData.$leafAdminStructureLocationIds`

**validate() function:**
```typescript
validate(schema: JSONSchema, data: ConditionalParameters)
  → ajv.getSchema(schema.$id) || ajv.compile(schema)  // Cache or compile
  → Transform AgeValue → { age, dob } if present
  → validator(data) → boolean
```

**Context passed to validators:**
- `$form`: EventState | ActionUpdate
- `$now`: ISO date string (today)
- `$online`: boolean (navigator.onLine)
- `$user`: ITokenPayload
- `$leafAdminStructureLocationIds`: Array<{id: UUID}>
- `$flags`: string[] (optional)
- `$status`: EventStatus (optional)
- `$event`: EventDocument (optional)

---

## 4. What is FieldReference? Type signature? Where is it resolved? List every file.

**Type Definition:**
```typescript
type FieldReference = { 
  $$field: string
  $$subfield: string[] 
}
```

**Purpose:** Internal marker object used to distinguish field references from literal values in conditional builders.

**Type guard:**
```typescript
function isFieldReference(value: unknown): value is FieldReference {
  return typeof value === 'object' && value !== null && '$$field' in value
}
```

**Used in:** (within conditionals.ts)
- `isEqualTo()` - compare two fields
- `isGreaterThan()` / `isLessThan()` - numeric field comparisons
- `isAfter()` / `isBefore()` - date field comparisons (via `.fromDate(fieldRef)`)

**Resolution:** FieldReferences are NOT resolved in commons—they're serialized into JSON Schema `$data` references:
```typescript
// Example: field('mother.dob').isAfter().date(field('child.dob'))
// Produces:
{
  properties: {
    'mother.dob': {
      type: 'string',
      format: 'date',
      formatMinimum: { $data: '1/child.dob' }  // ← $data reference to other field
    }
  }
}
```

**Client-side resolution:** `packages/client/src/v2-events/components/forms/FormFieldGenerator/utils.ts`

**Key Functions:**
1. **`parseFieldReferenceToValue(fieldReference, fieldValues)`**
   - Resolves a FieldReference to its actual value from form data
   - Uses lodash `get()` for nested path traversal
   - Implementation:
     ```typescript
     return fieldReference.$$subfield && fieldReference.$$subfield.length > 0
       ? get(fieldValues[fieldReference.$$field], fieldReference.$$subfield)
       : fieldValues[fieldReference.$$field]
     ```

2. **`parseFieldReferencesInConfiguration(configuration, form)`**
   - Resolves FieldReferences within HTTP field configurations
   - Iterates through `params` object, replacing FieldReferences with actual values

**Usage Locations (8 files found):**
1. **`packages/client/src/v2-events/components/forms/FormFieldGenerator/utils.ts`**
   - Main resolution logic

2. **`packages/client/src/v2-events/components/forms/FormFieldGenerator/GeneratedInputField.tsx`**
   - Calls `parseFieldReferencesInConfiguration()` for HTTP fields (line 730)

3. **`packages/client/src/v2-events/features/events/registered-fields/Http.tsx`**
   - Uses `parseFieldReferenceToValue()` to resolve HTTP body params (line 75)

4. **`packages/client/src/v2-events/features/events/registered-fields/Data.tsx`**
   - Local `isFieldReference()` type guard (line 34)
   - Resolves FieldReferences in static data entries (lines 57, 156)

5. **`packages/client/src/v2-events/components/forms/FormFieldGenerator/FormSectionComponent.tsx`**
   - (Import/usage context)

6-8. **Story/test files:**
   - `FormFieldGenerator-2.interaction.stories.tsx`
   - `Pages.interaction.stories.tsx`
   - `AgeField.interaction.stories.tsx`

**Resolution Pattern:**
- FieldReferences are **NOT resolved during JSON Schema generation**
- They remain as `{ $$field: string, $$subfield: string[] }` objects in the transmitted config
- Resolution happens **just-in-time in React components** when rendering fields or executing HTTP requests
- Uses form state snapshot at render time
---

## 5. How does form config travel from countryconfig to core? Endpoint?

**Flow:**
1. **Countryconfig service** exports form definitions at `/forms` endpoint
   - Returns: `{ version: string, birth: string, death: string, marriage: string }`
   - Each event type is a JSON-stringified form configuration

2. **Config service** (`packages/config/src/handlers/forms/formsHandler.ts`)
   - Fetches from `COUNTRY_CONFIG_URL/forms` on each request
   - Validates against Zod schema `registrationForms` (dev mode only)
   - Caches in MongoDB `FormVersions` collection by version
   - Returns cached or fresh form config

3. **Gateway** routes `/forms` requests to config service

4. **Client/Events** service fetch via Gateway when needed

**Key handler:** `packages/config/src/handlers/forms/formsHandler.ts`  
**Route:** `/forms` (GET, requires Authorization header)  
**Model:** `packages/config/src/models/formVersions.ts`

---

## 6. What's CommonConditionalParameters? What's EventState?

**CommonConditionalParameters:**
```typescript
type CommonConditionalParameters = {
  $now: string      // ISO date string (formatISO from date-fns)
  $online: boolean  // navigator.onLine (client) or true (server)
}
```

**EventState:**
```typescript
// Location: packages/commons/src/events/ActionDocument.ts
type EventState = Record<string, FieldValue>
```
Where `FieldValue` can be:
- Primitive: `string | number | boolean | null`
- Date: `{ date: string }`
- Age: `{ age: number, asOfDateRef?: string }`
- Composite: nested objects (e.g., name, address)

**ConditionalParameters (union type):**
```typescript
type ConditionalParameters =
  | UserConditionalParameters           // + $user
  | EventConditionalParameters          // + $event
  | FormConditionalParameters           // + $form, $leafAdminStructureLocationIds
  | EventStateConditionalParameters     // + $flags, $status
```

---

## 7. What's the exact return type pattern for validator methods on field()?

**Pattern:** All validator methods return `JSONSchema`:

```typescript
type JSONSchema = {
  $id: string                           // Hash-based unique ID
  readonly __nominal__type: 'JSONSchema'  // Nominal typing (never actually exists at runtime)
}
```

**Produced by:**
```typescript
defineConditional(schema: any): JSONSchema
defineFormConditional(schema: Record<string, unknown>): JSONSchema
```

**Runtime structure** (not exposed via type):
```typescript
{
  $id: 'https://opencrvs.org/conditionals/<SHA1_HASH>',
  type: 'object',
  properties: { ... },
  required: [ ... ],
  // ... other JSON Schema keywords
}
```

**Key insight:** The `JSONSchema` type is a **nominal type** (branded type). The `__nominal__type` property doesn't exist at runtime—it's purely for TypeScript to prevent mixing JSONSchema with plain objects.

---

## 8. What test utilities/helpers are used in existing tests?

**Location:** `packages/commons/src/events/test.utils.ts`

**Key Utilities:**
- `pickRandom<T>(rng, items)` - Random selection from array
- `generateRandomName(rng)` - Mock name generator
- `generateActionDocument()` - Create ActionDocument test fixtures
- `generateActionDeclarationInput()` - Mock action inputs
- Event fixtures from `../fixtures` (e.g., `tennisClubMembershipEvent`)

**Test Data Helpers:**
- `TestUserRole` - Zod enum of user roles for mocking
- `TEST_SYSTEM_IANA_TIMEZONE = 'Asia/Dhaka'` - Consistent timezone for tests
- Mock generators use `rng: () => number` for deterministic random data

**Validation Helpers:**
- `omitHiddenFields()` - Filter fields based on conditionals
- `getVisibleVerificationPageIds()` - Compute visible pages
- `findRecordActionPages()` - Find action-specific form pages

**Pattern:** Tests use factory functions that accept a random number generator for reproducible test data.

---

## 9. What's the Storybook pattern — how are validation stories structured?

**Location:** `packages/client/src/v2-events/components/forms/inputs/*.stories.tsx`

**Pattern (CSF 3.0 format):**
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'Inputs/Select',           // Sidebar organization
  component: Select,
  args: {},                         // Default args for all stories
  decorators: [                     // Wrap stories with providers
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

export const EmptySelect: StoryObj<typeof Select> = {
  args: {
    value: undefined,
    options: [{ value: '', label: 'Select an option' }]
  }
}
```

**Key Patterns:**
- **Meta object** defines component-level config (title, decorators, default args)
- **StoryObj** for each variation (args override meta.args)
- **Decorators** wrap stories with context providers (TRPCProvider, etc.)
- **Interaction tests** use `.interaction.stories.tsx` suffix

**No explicit validation stories found** — validation is likely demonstrated through input component stories with different field configs.

---

## 10. What commit message convention do they use?

**Convention:** Conventional Commits with semantic prefixes + PR merge commits

**Recent examples:**
```
feat: Add new feature
fix: Bug fix description  
chore: Maintenance task
```

**Common patterns:**
- `fix:` — Bug fixes
- `feat:` — New features (though rare in logs—more "fix" and "Merge PR")
- PR merges: `Merge pull request #XXXXX from opencrvs/branch-name`
- Branch naming: `ocrvs-ISSUE_NUMBER-description` (e.g., `ocrvs-11657`)

**For this issue:** 
```
feat: implement customClientValidator and customClientEvaluation methods (#11653)
```

or incremental commits:
```
chore: add exploration notes for #11653
feat(toolkit): add customClientValidator to field() API
feat(commons): implement client evaluation deserializer
test(toolkit): add tests for custom validation methods
docs: update CHANGELOG for #11653
```

---

## Environment Setup Status

✅ **Completed:**
- NVM + Node 22.15.1 installed
- Yarn installed globally
- opencrvs-core cloned from upstream
- Git configured (Keith de Alwis)
- Feature branch created: `ocrvs-11653-custom-client-evaluation`
- `yarn install` completed (284s)
- `packages/events` built successfully
- `packages/toolkit` built successfully  
- `packages/commons` tests passed

❌ **Issues identified:**
- Fork `github.com/keithdealwis-ui/opencrvs-core` does not exist yet
- Toolkit package has no test script (no tests to run)

---

## Next Steps (Session 2)

1. Complete remaining exploration questions (5, 8, 9, 10)
2. Find where client-side FieldReference resolution happens
3. Identify insertion points for customClientValidator/customClientEvaluation
4. Create fork on GitHub before pushing branch
5. Finalize and commit EXPLORATION-NOTES.md
