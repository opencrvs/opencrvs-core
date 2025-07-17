# Styleguide

## Zod Schemas and types

good:

```
// This way we can import both the type and validator under same alias.
const FontFamily = z.object({
  normal: z.string(),
  bold: z.string(),
  italics: z.string(),
  bolditalics: z.string()
})

type FontFamily = z.infer<typeof FontFamily>
```

- Use the same name for file and the main export
- Prefer variable names without postfix (e.g. schema, data)

## Naming files

good:

```
- ZodInterfacePascalCase.ts
- ReactComponentPascalCase.tsx
- useHookCamelCase.ts
- anything-else-in-kebab-case.ts
```

## Naming interfaces

good:

```
interface ApplicationConfig {
  certificateTemplates: CertificateTemplateConfig[]
  language?: LanguageConfig
}
```

not-so-good:

```
interface IApplicationConfig {
  certificateTemplates: ICertificateTemplateConfig[]
  language?: ILanguageConfig
}
```

## Naming functions

- Use find\* when you might return undefined

good:

```
async function findEventConfigurationById({
  token,
  eventType
}: {
  token: string
  eventType: string
}) {
  const configurations = await getEventConfigurations(token)

  return configurations.find((config) => config.id === eventType)
}
```

- Use get\* when you can guarantee the result

good:

```

async function getEventConfigurationById({
token,
eventType
}: {
token: string
eventType: string
}) {
const configurations = await getEventConfigurations(token)

const configuration = configurations.find((config) => config.id === eventType)

return getOrThrow(configuration), `No configuration found for event type: ${eventType}`)
}

```

## Naming, abbreviation

When naming things with known abbreviations use camelCase format

good:

```
export interface SvgTemplate {
  definition: string
}

export function printPdf(template: PdfTemplate, declarationId: string) {
  const pdf = pdfMake.createPdf(template.definition, undefined, template.fonts)
  if (isMobileDevice()) {
    pdf.download(`${declarationId}`)
  } else {
    pdf.print()
  }
}
```

not-so-good:

```
export interface ISVGTemplate {
  definition: string
}

export function printPDF(template: PDFTemplate, declarationId: string) {
 // note: example uses external lib with the same convention.
  const PDF = pdfMake.createPdf(template.definition, undefined, template.fonts)
  if (isMobileDevice()) {
    PDF.download(`${declarationId}`)
  } else {
    PDF.print()
  }
}
```

## Naming HTML attributes

Use kebab-case for HTML attributes such as `id`, `data-testid`, etc.

good:

```
<div id="event-menu" />
```

# Coding conventions, definition of done

- When introducing a new `MessageDescriptor` create a new row in `client.csv`
- Each message used under events should have `v2.`-prefix

# Input / Output Components

Every form input is defined as a set of three functions:

- **Input**
  Defines how a `FieldConfig` is rendered as a React input component inside the form.

- **Output**
  Defines how the value produced by this input should be as a React component (e.g. review page).

- **useStringifier**
  Defines how the value produced by this component can be represented as a string. This is required for certificates and internationalized messages.

## Grouped Inputs (e.g., Address)

In some cases, an input component may consist of a collection of other inputs. A good approach for building such a component is to use `<FormFieldGenerator />` internally.

### useStringifier

For grouped inputs, it's often best to create a stringifier that simply redirects the input value back to the form stringifier. This ensures that individual field stringifiers can handle their own values appropriately.
