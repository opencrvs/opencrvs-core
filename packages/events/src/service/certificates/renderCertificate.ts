/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

/**
 * Server-side certificate rendering engine.
 *
 * This is a Node port of the browser pipeline in
 * `packages/client/src/v2-events/features/events/actions/print-certificate/pdfUtils.ts`.
 * The stages are identical — Handlebars compiles the SVG template, the SVG is
 * turned into a pdfmake document definition, and pdfmake renders the PDF — but
 * the browser-only glue (`DOMParser`, `XMLSerializer`, `window.print`, URL-based
 * font loading) is replaced with Node equivalents:
 *
 *   - DOM operations run against a `jsdom` window instead of the real DOM.
 *   - Fonts are embedded as `Buffer`s via pdfmake's server-side `PdfPrinter`
 *     API rather than fetched by URL by the browser pdfmake build.
 *   - The output is a `Buffer` returned to the caller instead of being printed.
 *
 * KNOWN PARITY GAP (deliberate, first cut): the client resolves every
 * declaration/metadata field through react-intl + `DateField`/`LocationSearch`/
 * `getFormDataStringifier` (all client-package code). That rich field
 * stringification is NOT ported here, so field values render in raw form (ISO
 * dates, location UUIDs) rather than fully localized names. Reaching byte-for-byte
 * parity means extracting those resolvers into a shared isomorphic package that
 * both client and server import — see the accompanying design notes.
 */
import Handlebars from 'handlebars'
import htmlToPdfmake from 'html-to-pdfmake'
import { JSDOM } from 'jsdom'
import { isEqual, isNil } from 'lodash'
import type {
  Content,
  TDocumentDefinitions,
  TFontDictionary
} from 'pdfmake/interfaces'
// pdfmake's Node entry point exports the `PdfPrinter` class. The published types
// only describe the browser `createPdf` API, so we type the constructor locally.
import PdfPrinterImport from 'pdfmake'
import {
  ActionDocument,
  EventMetadata,
  EventState,
  getMixedPath
} from '@opencrvs/commons/events'

/** Font family as consumed by pdfmake — one file (Buffer) per weight/style. */
export interface FontFamilyBuffers {
  normal: Buffer
  bold: Buffer
  italics: Buffer
  bolditalics: Buffer
}

/** `family name -> per-weight font buffers`, ready for pdfmake. */
export type FontDictionary = Record<string, FontFamilyBuffers>

interface PdfPrinterInstance {
  createPdfKitDocument(definition: TDocumentDefinitions): NodeJS.ReadableStream & {
    end(): void
  }
}
const PdfPrinter = PdfPrinterImport as unknown as new (
  fonts: TFontDictionary
) => PdfPrinterInstance

/**
 * Metadata exposed to the template. Mirrors what the client passes as
 * `$metadata` — the event's current metadata plus the two synthetic fields the
 * print flow adds.
 */
export type CertificateMetadata = EventMetadata & {
  modifiedAt: string
  copiesPrintedForTemplate: number | undefined
}

/**
 * Minimal react-intl-compatible `formatMessage`. The template i18n helpers only
 * need `formatMessage({ id, defaultMessage }, values?)`; this covers that
 * surface (key lookup + `{param}` interpolation) without pulling react-intl —
 * and therefore React — into the events service. ICU plural/select syntax is
 * NOT supported (parity gap noted at the top of the file).
 */
function createMiniIntl(messages: Record<string, string>) {
  return {
    formatMessage(
      descriptor: { id: string; defaultMessage?: string },
      values?: Record<string, unknown>
    ): string {
      const template =
        messages[descriptor.id] ?? descriptor.defaultMessage ?? ''
      if (!values) {
        return template
      }
      return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
        key in values ? String(values[key]) : `{${key}}`
      )
    }
  }
}

/**
 * Compile an SVG certificate template with Handlebars against a record's state.
 *
 * Uses an isolated `Handlebars.create()` environment rather than the global
 * singleton the browser code mutates: the helpers close over per-request data,
 * so registering them on a shared instance would let concurrent requests read
 * each other's records. Each render therefore gets its own environment.
 */
export function compileSvg({
  templateString,
  $declaration,
  $metadata,
  $actions,
  messages,
  review
}: {
  templateString: string
  $declaration: EventState
  $metadata: CertificateMetadata
  $actions: ActionDocument[]
  /** `translation id -> message`, as served by country-config `/content`. */
  messages: Record<string, string>
  review: boolean
}): string {
  const intl = createMiniIntl(messages)
  const hbs = Handlebars.create()

  /** {{ $actions "PRINT_CERTIFICATE" }} — all actions of a type. */
  hbs.registerHelper('$actions', (actionType: string) =>
    $actions.filter((a) => a.type === actionType)
  )

  /** {{ $action "REGISTER" }} — the latest action of a type. */
  hbs.registerHelper('$action', (actionType: string) =>
    [...$actions].reverse().find((a) => a.type === actionType)
  )

  /**
   * {{ $lookup $declaration "child.name.firstname" }} — resolve a dotted path
   * within $declaration / $metadata / an action's data.
   *
   * First cut: values are returned raw (see the parity gap note). Objects get a
   * `toString` so templates that interpolate them directly get JSON rather than
   * "[object Object]".
   */
  function $lookup(
    obj: EventMetadata | EventState | ActionDocument | undefined,
    propertyPath: string
  ) {
    function doLookup() {
      if (obj == null) {
        return undefined
      }
      if (isEqual(obj, $metadata)) {
        return getMixedPath($metadata, propertyPath)
      }
      if (isEqual(obj, $declaration)) {
        return getMixedPath($declaration, propertyPath)
      }
      const action = ActionDocument.safeParse(obj)
      if (action.success) {
        return getMixedPath(action.data, propertyPath)
      }
      return obj[propertyPath as keyof typeof obj] ?? ''
    }
    const result = doLookup()
    if (result !== null && typeof result === 'object') {
      return { ...result, toString: () => JSON.stringify(result) }
    }
    return result
  }
  hbs.registerHelper('$lookup', $lookup)

  /** {{ $json someValue }} */
  hbs.registerHelper('$json', (value: unknown) => JSON.stringify(value))

  /**
   * {{ $intl "constants" (lookup $declaration "child.gender") }} — join the
   * string parts into a translation id and format it. Any nil part yields "".
   */
  hbs.registerHelper('$intl', function (
    ...args: [...(string | undefined)[], Handlebars.HelperOptions]
  ) {
    const idParts = args.slice(0, -1) as (string | undefined)[]
    if (idParts.some((part) => isNil(part))) {
      return ''
    }
    const id = idParts.map((part) => part?.toString()).join('.')
    return intl.formatMessage({
      id,
      defaultMessage: 'Missing translation for ' + id
    })
  } as unknown as Handlebars.HelperDelegate)

  /**
   * {{ $intlWithParams "constants.greeting" "name" (lookup $declaration "child.name") }}
   * — like $intl but the trailing args are name/value pairs for interpolation.
   */
  hbs.registerHelper('$intlWithParams', function (
    ...args: [...(string | undefined)[], Handlebars.HelperOptions]
  ) {
    const id = args[0] as string
    const paramPairs = args.slice(1, -1)
    const params: Record<string, unknown> = {}
    for (let i = 0; i < paramPairs.length; i += 2) {
      const key = paramPairs[i] as string | undefined
      const value = paramPairs[i + 1]
      if (key === undefined || value === undefined) {
        return ''
      }
      params[key] = value
    }
    return intl.formatMessage(
      { id, defaultMessage: 'Missing translation for ' + id },
      params
    )
  } as unknown as Handlebars.HelperDelegate)

  /** {{ $join ", " district province country }} — join non-empty values. */
  hbs.registerHelper('$join', function (
    ...args: [...(string | undefined | null)[], Handlebars.HelperOptions]
  ) {
    const separator = args[0] as string
    const values = args.slice(1, -1) as Array<string | undefined | null>
    return values.filter(Boolean).join(separator)
  } as unknown as Handlebars.HelperDelegate)

  /** {{ $or a b }} — first truthy value. */
  hbs.registerHelper('$or', (v1: unknown, v2: unknown) => (v1 ? v1 : v2))

  /** {{#ifCond a '===' b}}...{{else}}...{{/ifCond}} */
  hbs.registerHelper('ifCond', function (
    this: unknown,
    v1: string,
    operator: string,
    v2: string,
    options: Handlebars.HelperOptions
  ) {
    switch (operator) {
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this)
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this)
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this)
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this)
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this)
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this)
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this)
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this)
      default:
        return options.inverse(this)
    }
  })

  const template = hbs.compile(templateString)
  return template({
    $declaration,
    $metadata,
    $review: review
  })
}

function isFetchableHref(href: string): boolean {
  return /^https?:\/\//.test(href)
}

/**
 * Inline every fetchable `<image>` href as a base64 data URI. pdfmake cannot
 * fetch remote resources server-side, so images (logos, signatures) must be
 * embedded before rendering. Non-http hrefs (already data URIs) are left as-is.
 */
async function downloadAndEmbedImages(
  svg: Element,
  document: Document
): Promise<void> {
  const imageElements = Array.from(svg.getElementsByTagName('image'))
  await Promise.all(
    imageElements.map(async (imageElement) => {
      const href =
        imageElement.getAttribute('href') ??
        imageElement.getAttribute('xlink:href')
      if (!href || !isFetchableHref(href)) {
        return
      }
      const response = await fetch(href)
      if (!response.ok) {
        throw new Error(`Failed to fetch certificate image: ${href}`)
      }
      const contentType =
        response.headers.get('content-type') ?? 'application/octet-stream'
      const buffer = Buffer.from(await response.arrayBuffer())
      const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`
      if (imageElement.hasAttribute('href')) {
        imageElement.setAttribute('href', dataUri)
      }
      if (imageElement.hasAttribute('xlink:href')) {
        imageElement.setAttribute('xlink:href', dataUri)
      }
    })
  )
  // Reference the document so unused-parameter lint stays quiet; jsdom mutations
  // above operate on live nodes owned by `document`.
  void document
}

/**
 * Convert a compiled SVG string into a pdfmake document definition. Direct Node
 * port of the browser `svgToPdfTemplate`: multi-page `[data-page]` sections
 * become one page each, and `<foreignObject>` HTML is overlaid via
 * `html-to-pdfmake` at its absolute position.
 */
export async function svgToPdfDefinition(
  svg: string,
  defaultFontFamily: string
): Promise<TDocumentDefinitions> {
  const dom = new JSDOM('')
  const { window } = dom
  const { document, DOMParser, XMLSerializer } = window

  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const svgElement = parsed.documentElement

  await downloadAndEmbedImages(svgElement, document)
  const svgWithInlineImages = new XMLSerializer().serializeToString(svgElement)

  const definition: TDocumentDefinitions = {
    pageMargins: [0, 0, 0, 0],
    defaultStyle: { font: defaultFontFamily },
    content: []
  }

  const $sections = svgElement.querySelectorAll('[data-page]')
  const widthValue = svgElement.getAttribute('width')
  const heightValue = svgElement.getAttribute('height')

  if (widthValue && heightValue) {
    const width = Number.parseInt(widthValue, 10)
    const height = $sections.length
      ? Number.parseInt(heightValue, 10) / $sections.length
      : Number.parseInt(heightValue, 10)
    definition.pageSize = { width, height }
    if (width > height) {
      definition.pageOrientation = 'landscape'
    }
  }

  const foreignObjects = svgElement.getElementsByTagName('foreignObject')
  const absolutelyPositionedHTMLs: Content[] = []
  for (const foreignObject of Array.from(foreignObjects)) {
    const width = Number.parseInt(foreignObject.getAttribute('width') ?? '0', 10)
    const x = Number.parseInt(foreignObject.getAttribute('x') ?? '0', 10)
    const y = Number.parseInt(foreignObject.getAttribute('y') ?? '0', 10)
    const pdfmakeContent = htmlToPdfmake(foreignObject.innerHTML, {
      window,
      ignoreStyles: ['font-family']
    })
    absolutelyPositionedHTMLs.push({
      columns: [{ width, stack: pdfmakeContent as Content[] }],
      absolutePosition: { x, y }
    } as Content)
  }

  if ($sections.length > 0) {
    definition.content = [
      ...Array.from($sections).map(($section) => {
        const $svgWrapper = document.createElement('svg')
        Array.from(svgElement.attributes).forEach((attr) => {
          $svgWrapper.setAttribute(attr.name, attr.value)
        })
        $section.removeAttribute('transform')
        $svgWrapper.appendChild($section.cloneNode(true))
        return { svg: $svgWrapper.outerHTML }
      }),
      ...absolutelyPositionedHTMLs
    ]
  } else {
    definition.content = [
      { svg: svgWithInlineImages },
      ...absolutelyPositionedHTMLs
    ]
  }

  dom.window.close()
  return definition
}

/**
 * Render a pdfmake document definition to a PDF `Buffer` using the server-side
 * `PdfPrinter`, with fonts supplied as in-memory buffers.
 */
export async function renderPdfBuffer(
  definition: TDocumentDefinitions,
  fonts: FontDictionary
): Promise<Buffer> {
  const printer = new PdfPrinter(fonts as unknown as TFontDictionary)
  const doc = printer.createPdfKitDocument(definition)
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}
