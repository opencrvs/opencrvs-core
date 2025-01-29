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

# Coding conventions, definition of done

- When introducing a new `MessageDescriptor` create a new row in `client.csv`
- They should all have `v2.`-prefix

## Naming, abbreviation

When naming things with known abbreviations use camel case format despite of it.

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
export interface SVGTemplate {
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

[Tech task]

- Figure out how to distinguish the ones already added without
