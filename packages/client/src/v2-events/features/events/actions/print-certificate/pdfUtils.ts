/* eslint-disable max-lines */
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
/* eslint-disable no-console */
import { IntlShape, createIntl, createIntlCache } from 'react-intl'
import Handlebars from 'handlebars'
import type { TDocumentDefinitions, TFontFamilyTypes } from 'pdfmake/interfaces'
import pdfMake from 'pdfmake/build/pdfmake'
import { isEqual, isNil } from 'lodash'
import {
  EventState,
  LanguageConfig,
  EventConfig,
  getMixedPath,
  EventMetadata,
  EventStatus,
  DEFAULT_DATE_OF_EVENT_PROPERTY,
  ActionDocument,
  Location,
  UUID,
  AdministrativeArea,
  getActionAnnotationFields,
  FieldUpdateValue,
  FieldConfig,
  UserOrSystemSummary,
  TokenUserType
} from '@opencrvs/commons/client'
import { DateField } from '@client/v2-events/features/events/registered-fields'
import { getHandlebarHelpers } from '@client/forms/handlebarHelpers'
import { isMobileDevice } from '@client/utils/commonUtils'
import { getUsersFullName } from '@client/v2-events/utils'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { LocationSearch } from '@client/v2-events/features/events/registered-fields'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { toFileUrl } from '@client/v2-events/cache'

interface FontFamilyTypes {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type CertificateConfiguration = Partial<{
  fonts: Record<string, FontFamilyTypes>
}>

function pickAnnotationFieldValues(
  annotationFields: FieldConfig[],
  values: Record<string, FieldUpdateValue>
) {
  const fieldsInAnnotation = new Set(annotationFields.map((field) => field.id))
  return Object.keys(values).reduce((acc, fieldId) => {
    if (!fieldsInAnnotation.has(fieldId)) {
      return acc
    }
    return { ...acc, [fieldId]: values[fieldId] }
  }, {})
}

function findUserById(userId: string, users: UserOrSystemSummary[]) {
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return {
      name: '',
      fullHonorificName: ''
    }
  }

  if (user.type === TokenUserType.enum.system) {
    return {
      name: getUsersFullName(user.name)
    }
  }

  return {
    name: getUsersFullName(user.name),
    fullHonorificName: user.fullHonorificName ?? ''
  }
}

export const stringifyEventMetadata = ({
  metadata,
  intl,
  locations,
  administrativeAreas,
  users,
  adminLevels
}: {
  metadata: NonNullable<
    EventMetadata & {
      modifiedAt: string
      copiesPrintedForTemplate: number | undefined
    }
  >
  intl: IntlShape
  locations: Map<UUID, Location>
  administrativeAreas: Map<UUID, AdministrativeArea>
  users: UserOrSystemSummary[]
  adminLevels: AdminStructureItem[]
}) => {
  return {
    modifiedAt: DateField.toCertificateVariables(metadata.modifiedAt, {
      intl,
      locations,
      administrativeAreas
    }),
    assignedTo: findUserById(metadata.assignedTo ?? '', users),
    dateOfEvent: metadata.dateOfEvent
      ? DateField.toCertificateVariables(metadata.dateOfEvent, {
          intl,
          locations,
          administrativeAreas
        })
      : DateField.toCertificateVariables(
          metadata[DEFAULT_DATE_OF_EVENT_PROPERTY],
          {
            intl,
            locations,
            administrativeAreas
          }
        ),
    createdAt: DateField.toCertificateVariables(metadata.createdAt, {
      intl,
      locations,
      administrativeAreas
    }),
    createdBy: findUserById(metadata.createdBy, users),
    createdAtLocation: LocationSearch.toCertificateVariables(
      metadata.createdAtLocation,
      {
        intl,
        locations,
        administrativeAreas,
        adminLevels
      }
    ),
    updatedAt: DateField.toCertificateVariables(metadata.updatedAt, {
      intl,
      locations,
      administrativeAreas
    }),
    updatedBy: metadata.updatedBy
      ? findUserById(metadata.updatedBy, users)
      : '',
    id: metadata.id,
    type: metadata.type,
    trackingId: metadata.trackingId,
    status: EventStatus.enum.REGISTERED,
    updatedByUserRole: metadata.updatedByUserRole,
    updatedAtLocation: LocationSearch.toCertificateVariables(
      metadata.updatedAtLocation,
      {
        intl,
        locations,
        administrativeAreas,
        adminLevels
      }
    ),
    flags: [],
    legalStatuses: {
      [EventStatus.enum.DECLARED]: metadata.legalStatuses.DECLARED
        ? {
            createdAt: DateField.toCertificateVariables(
              metadata.legalStatuses.DECLARED.createdAt,
              { intl, locations, administrativeAreas }
            ),
            createdBy: findUserById(
              metadata.legalStatuses.DECLARED.createdBy,
              users
            ),
            createdAtLocation: LocationSearch.toCertificateVariables(
              metadata.legalStatuses.DECLARED.createdAtLocation,
              { intl, locations, administrativeAreas, adminLevels }
            ),
            acceptedAt: DateField.toCertificateVariables(
              metadata.legalStatuses.DECLARED.acceptedAt,
              { intl, locations, administrativeAreas }
            ),
            createdByRole: metadata.legalStatuses.DECLARED.createdByRole
          }
        : null,
      [EventStatus.enum.REGISTERED]: metadata.legalStatuses.REGISTERED
        ? {
            createdAt: DateField.toCertificateVariables(
              metadata.legalStatuses.REGISTERED.createdAt,
              { intl, locations, administrativeAreas }
            ),
            createdBy: findUserById(
              metadata.legalStatuses.REGISTERED.createdBy,
              users
            ),
            createdAtLocation: LocationSearch.toCertificateVariables(
              metadata.legalStatuses.REGISTERED.createdAtLocation,
              { intl, locations, administrativeAreas, adminLevels }
            ),
            acceptedAt: DateField.toCertificateVariables(
              metadata.legalStatuses.REGISTERED.acceptedAt,
              { intl, locations, administrativeAreas }
            ),
            createdByRole: metadata.legalStatuses.REGISTERED.createdByRole,
            registrationNumber:
              metadata.legalStatuses.REGISTERED.registrationNumber
          }
        : null
    },
    copiesPrintedForTemplate: metadata.copiesPrintedForTemplate
  }
}

const certificateBaseTemplate = {
  definition: {
    pageMargins: [0, 0, 0, 0] as [number, number, number, number],
    defaultStyle: {
      font: 'notosans'
    },
    content: []
  },
  fonts: {}
}

const cache = createIntlCache()

export function compileSvg({
  templateString,
  $metadata,
  $declaration,
  $actions,
  locations,
  users,
  review,
  language,
  config,
  administrativeAreas,
  adminLevels
}: {
  templateString: string
  $metadata: EventMetadata & {
    modifiedAt: string
    copiesPrintedForTemplate: number | undefined
  }
  $actions: ActionDocument[]
  $declaration: EventState
  locations: Map<UUID, Location>
  administrativeAreas: Map<UUID, AdministrativeArea>
  users: UserOrSystemSummary[]
  /**
   * Indicates whether certificate is reviewed or actually printed
   * in V1 "preview" was used. In V2, "review" is used to remain consistent with action terminology (review of print action rather than preview of certificate).
   */
  review: boolean
  language: LanguageConfig
  config: EventConfig
  adminLevels: AdminStructureItem[]
}): string {
  const intl = createIntl(
    {
      locale: language.lang,
      messages: language.messages
    },
    cache
  )

  const customHelpers = getHandlebarHelpers()

  const stringifyDeclaration = getFormDataStringifier(
    intl,
    locations,
    administrativeAreas,
    adminLevels
  )
  const fieldConfigs = config.declaration.pages.flatMap((x) => x.fields)
  const resolvedDeclaration = stringifyDeclaration(fieldConfigs, $declaration)

  for (const helperName of Object.keys(customHelpers)) {
    /*
     * Note for anyone adding new context variables to handlebar helpers:
     * Everything you expose to country config's here will become API surface area,
     * This means that countries will become dependant on it and it will be hard to remove or rename later on.
     * If you need to expose the full record, please consider only exposing the specific values you know are needed.
     * Otherwise what happens is that we lose the ability to refactor and remove things later on.
     */
    const helper = customHelpers[helperName]({ intl })
    Handlebars.registerHelper(helperName, helper)
  }

  /**
   * Handlebars helper: $actions
   *
   * Resolves all actions for a specific action type
   *
   * @param actionType - The type of action to look up (e.g., "PRINT_CERTIFICATE")
   * @returns The resolved list of actions
   *
   * @example {{ $actions "PRINT_CERTIFICATE" }}
   */
  function $actionsFn(actionType: string) {
    console.log($actions.filter((a) => a.type === actionType))
    return $actions.filter((a) => a.type === actionType)
  }

  Handlebars.registerHelper('$actions', $actionsFn)

  /**
   * Handlebars helper: $action
   *
   * Finds the latest action data for a specific action type and property path.
   *
   * @param actionType - The type of action to look up (e.g., "PRINT_CERTIFICATE")
   * @returns The resolved value from the action data
   *
   * @example {{ $action "PRINT_CERTIFICATE" }}
   */

  function $action(actionType: string) {
    console.log($actions.findLast((a) => a.type === actionType))
    return $actions.findLast((a) => a.type === actionType)
  }

  Handlebars.registerHelper('$action', $action)

  /**
   * Handlebars helper: $lookup
   *
   * Resolves a value from the given property path within the combined $state and $declaration objects. useful for extracting specific properties from complex structures like `child.address.other`
   * and optionally returns a nested field from the resolved value. e.g. when defaultValue is set to $user.province, it resolves to the matching id.
   *
   * @param obj - Object to look up. This is for providing the same interface as the handlebars 'lookup'. It is not used as is.
   *  @param propertyPath - $declaration or $state property to look up without the top-level property name.
   *  @returns - a nested field from the resolved value.
   *
   * @example {'foo.bar.baz': 'quix' } // $lookup 'foo.bar.baz' => 'quix'
   * @example {'foo': {'bar': {'baz': 'quix'}} } // $lookup 'foo.bar.baz' => 'quix'
   * @example { 'informant.address': { 'other': { 'district': 'quix' } } } // $lookup 'informant.address.other.district' => 'quix'
   */
  function $lookup(obj: EventMetadata | EventState, propertyPath: string) {
    function doLookup() {
      const resolvedMetadata = stringifyEventMetadata({
        metadata: $metadata,
        intl,
        locations,
        administrativeAreas,
        users,
        adminLevels
      })

      if (isEqual($metadata, obj)) {
        return getMixedPath(resolvedMetadata, propertyPath)
      }

      if (isEqual($declaration, obj)) {
        return getMixedPath(resolvedDeclaration, propertyPath)
      }

      const action = ActionDocument.safeParse(obj)
      if (action.success) {
        const actionConfig = config.actions.find(
          (a) => a.type === action.data.type
        )

        const annotationFields = actionConfig
          ? getActionAnnotationFields(actionConfig)
          : []

        const annotation =
          action.data.annotation != null
            ? stringifyDeclaration(
                annotationFields,
                pickAnnotationFieldValues(
                  annotationFields,
                  action.data.annotation
                )
              )
            : {}
        const resolvedAction = {
          id: action.data.id,
          type: action.data.type,
          createdAt: DateField.stringify(action.data.createdAt, {
            intl,
            locations,
            administrativeAreas
          }),
          createdBy: users.find((user) => user.id === action.data.createdBy),
          createdByUserType: action.data.createdByUserType,
          createdBySignature:
            action.data.createdBySignature &&
            toFileUrl(action.data.createdBySignature),
          createdAtLocation: LocationSearch.toCertificateVariables(
            action.data.createdAtLocation,
            {
              intl,
              locations,
              administrativeAreas,
              adminLevels
            }
          ),
          createdByRole: action.data.createdByRole,
          annotation
        }

        return getMixedPath(resolvedAction, propertyPath)
      }
      return obj[propertyPath as keyof typeof obj] ?? ''
    }
    const result = doLookup()
    if (typeof result === 'object') {
      return {
        ...result,
        toString: () => JSON.stringify(result)
      }
    }
    return result
  }

  Handlebars.registerHelper('$lookup', $lookup)

  /**
   * Handlebars helper: $json
   *
   * Converts any value to its JSON string representation.
   *
   * @param value - The value to stringify
   * @returns The JSON string representation of the value
   *
   * @example {{ $json someObject }}
   */
  function $json(value: unknown) {
    return JSON.stringify(value)
  }

  Handlebars.registerHelper('$json', $json)

  /**
   * Handlebars helper: $intl
   *
   * Usage example in SVG template:
   *   <tspan>{{ $intl 'constants' (lookup $declaration "child.gender") }}</tspan>
   *
   * This helper dynamically constructs a translation key by joining multiple string parts
   * (e.g., 'constants.male') and uses `intl.formatMessage` to fetch the localized translation.
   *
   * In the example above, `"child.gender"` resolves to a value like `"male"` which forms
   * part of the translation key: `constants.male`.
   *
   * - If any of the parts is undefined (e.g., gender not provided), it returns an empty string to prevent rendering issues.
   * - If the translation for the constructed ID is missing, it falls back to showing: 'Missing translation for [id]'.
   *
   * This is especially useful in templates where dynamic values (like gender, marital status, etc.)
   * need to be translated using i18n keys constructed from user-provided data.
   */
  Handlebars.registerHelper(
    '$intl',

    function (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this: any,
      ...args: [...(string | undefined)[], Handlebars.HelperOptions]
    ) {
      // If even one of the parts is undefined or null, then return empty string
      const idParts = args.slice(0, -1)
      if (idParts.some((part) => isNil(part))) {
        return ''
      }

      const id = idParts.map((part) => part?.toString()).join('.')

      return intl.formatMessage({
        id,
        defaultMessage: 'Missing translation for ' + id
      })
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any /* This is here because Handlebars typing is insufficient and we can make the function type stricter */
  )

  /**
   * Handlebars helper: $intlWithParams
   *
   * Usage example in SVG template:
   *   <tspan>{{ $intlWithParams 'constants.greeting' 'name' (lookup $declaration "child.name") }}</tspan>
   * This helper allows for dynamic translation with parameters.
   * It takes a translation ID as the first argument, followed by pairs of parameter names and values.
   * The last argument is the Handlebars options object.
   * It constructs a params object from the pairs and uses `intl.formatMessage`
   * to fetch the localized translation with the provided parameters.
   * If any parameter is undefined, it returns an empty string to prevent rendering issues.
   * If the translation for the constructed ID is missing,
   * it falls back to showing: 'Missing translation for [id]'.
   * This is especially useful in templates where dynamic values
   * (like names, dates, etc.)
   * need to be translated using i18n keys with parameters.
   */

  Handlebars.registerHelper(
    '$intlWithParams',

    function (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this: any,
      ...args: [...(string | undefined)[], Handlebars.HelperOptions]
    ) {
      const id = args[0] as string
      const paramPairs = args.slice(1, -1)

      // Build params object from pairs
      const params: Record<string, unknown> = {}
      for (let i = 0; i < paramPairs.length; i += 2) {
        const key = paramPairs[i] as string | undefined
        const value = paramPairs[i + 1]
        if (key == undefined || value == undefined) {
          return ''
        }
        params[key] = value
      }

      return intl.formatMessage(
        {
          id,
          defaultMessage: 'Missing translation for ' + id
        },
        params as Record<string, string | number | boolean>
      )
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any /* This is here because Handlebars typing is insufficient and we can make the function type stricter */
  )

  /**
   * Handlebars helper: $join
   *
   * Joins provided values with the given separator, filtering out any empty or falsy values.
   * Useful for rendering location hierarchies where some admin levels may be absent
   * (e.g. an office registered directly under a province with no district).
   *
   * @param separator - The string to join with (e.g. ", ")
   * @param values - One or more values to filter and join
   * @returns The non-empty values joined by separator
   *
   * @example {{ $join ", " district province country }} // "Ibombo, Central, Farajaland"
   * @example {{ $join ", " "" province country }}      // "Central, Farajaland" (empty district omitted)
   * @example {{ $join ", " "" "" country }}            // "Farajaland" (both empty omitted)
   */
  Handlebars.registerHelper('$join', function (
    ...args: [...(string | undefined | null)[], Handlebars.HelperOptions]
  ) {
    const separator = args[0] as string
    const values = args.slice(1, -1) as Array<string | undefined | null>
    return values.filter(Boolean).join(separator)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } as any)

  /**
   * Handlebars helper: $OR
   * Returns the first truthy value between v1 and v2.
   */
  Handlebars.registerHelper(
    '$or',
    function (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      v1: any,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      v2: any
    ) {
      return !!v1 ? v1 : v2
    }
  )

  /**
   * Handlebars helper: ifCond
   *
   * Usage example in template:
   *   {{#ifCond value1 '===' value2}} ... {{/ifCond}}
   *
   * This helper compares two values (`v1` and `v2`) using the specified operator and
   * conditionally renders a block based on the result of the comparison.
   *
   * Supported operators:
   *   - '===' : strict equality
   *   - '!==' : strict inequality
   *   - '<', '<=', '>', '>=' : numeric/string comparisons
   *   - '&&' : both values must be truthy
   *   - '||' : at least one value must be truthy
   *
   * If the condition is met, it renders the main block (`options.fn(this)`),
   * otherwise it renders the `else` block (`options.inverse(this)`).
   *
   * This helper is useful for adding conditional logic directly within Handlebars templates.
   */
  Handlebars.registerHelper(
    'ifCond',
    function (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      this: any,
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
    }
  )

  const template = Handlebars.compile(templateString)

  const data = {
    $declaration,
    $metadata,
    $review: review,
    $references: {
      locations,
      users
    }
  }

  const output = template(data)
  return output
}

export function addFontsToSvg(
  svgString: string,
  fonts: Record<string, FontFamilyTypes>
) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.documentElement
  const style = document.createElement('style')
  style.innerHTML = Object.entries(fonts)
    .flatMap(([font, families]) =>
      Object.entries(families).map(
        ([family, url]) => `
@font-face {
font-family: "${font}";
font-weight: ${family};
src: url("${url}") format("truetype");
}`
      )
    )
    .join('')
  svg.prepend(style)
  const serializer = new XMLSerializer()
  return serializer.serializeToString(svg)
}

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Inlines all external resources referenced in the SVG as base64 data URIs,
 * handling both resource types in a single DOM pass:
 *  - @font-face url("…") inside <style> elements
 *  - href / xlink:href on <image> elements
 *
 * Font and image fetches run in parallel. This is required before drawing the
 * SVG to a canvas: when loaded via a Blob URL the browser sandboxes the SVG
 * and blocks all external fetches, causing missing fonts and broken images.
 */
async function embedExternalResourcesInSvg(svgString: string): Promise<string> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.documentElement

  const styleTasks = Array.from(svg.getElementsByTagName('style')).map(
    async (styleEl) => {
      const original = styleEl.textContent ?? ''
      const urlRegex = /url\("([^"]+)"\)/g
      const matches = [...original.matchAll(urlRegex)].filter(
        ([, url]) => !url.startsWith('data:')
      )

      // Fetch all font URLs in parallel, then apply replacements sequentially
      // to avoid concurrent writes to the same CSS string.
      const replacements = (
        await Promise.all(
          matches.map(async ([fullMatch, url]) => {
            const base64 = await fetchAsBase64(url)
            if (!base64) {
              console.warn(`Failed to embed font: ${url}`)
              return null
            }
            return { fullMatch, base64 }
          })
        )
      ).filter((r): r is { fullMatch: string; base64: string } => r !== null)

      styleEl.textContent = replacements.reduce(
        (css, { fullMatch, base64 }) =>
          css.replaceAll(fullMatch, `url("${base64}")`),
        original
      )
    }
  )

  const imageTasks = Array.from(svg.getElementsByTagName('image')).map(
    async (imageEl) => {
      const href =
        imageEl.getAttribute('href') || imageEl.getAttribute('xlink:href')
      if (!href || !/^(https?:\/\/|\/)/.test(href)) {
        return
      }

      const base64 = await fetchAsBase64(href)
      if (!base64) {
        console.error('Failed to fetch image:', href)
        console.error(
          'Ensure the URL is correct and image is requested before cache is cleaned.'
        )
        return
      }
      if (imageEl.hasAttribute('href')) {
        imageEl.setAttribute('href', base64)
      }
      if (imageEl.hasAttribute('xlink:href')) {
        imageEl.setAttribute('xlink:href', base64)
      }
    }
  )

  await Promise.all([...styleTasks, ...imageTasks])

  return new XMLSerializer().serializeToString(svg)
}

/**
 * Renders a fully self-contained SVG string (all fonts and images embedded as
 * base64) onto an off-screen canvas using the browser's own SVG renderer and
 * returns the result as a PNG data URL.
 *
 * Using the browser renderer here is what makes the PDF visually identical to
 * the on-screen preview: font shaping, glyph metrics, and clip-path behaviour
 * are all handled by the same engine.
 *
 * Canvas pixel dimensions are derived from the SVG's declared size (in PDF
 * points, 72 pts/inch) scaled up to TARGET_PRINT_DPI (300 DPI), so the
 * formula SCALE = 300/72 ≈ 4.17 is a fixed unit-conversion constant, not a
 * magic number — changing the SVG page size has no effect on print quality.
 */
async function renderSvgToDataUrl(
  svgString: string,
  width: number,
  height: number
): Promise<string> {
  // SVG units map 1:1 to PDF points (72 pts/inch).  To hit standard print
  // quality (300 DPI) each point must produce 300/72 ≈ 4.17 canvas pixels.
  const PDF_POINTS_PER_INCH = 72
  const TARGET_PRINT_DPI = 300
  const SCALE = TARGET_PRINT_DPI / PDF_POINTS_PER_INCH

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const blobUrl = URL.createObjectURL(blob)

  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = async () => {
        // Await any pending font decoding before drawing. @font-face with
        // base64 data URIs decodes synchronously in all major browsers, but
        // this guard ensures fonts are settled before drawImage regardless.
        await document.fonts.ready

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(width * SCALE)
        canvas.height = Math.round(height * SCALE)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'))
          return
        }
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to render SVG to canvas'))
      img.src = blobUrl
    })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

export async function svgToPdfTemplate(
  svg: string,
  certificateFonts: CertificateConfiguration
) {
  const pdfTemplate: PdfTemplate = {
    ...certificateBaseTemplate,
    definition: {
      ...certificateBaseTemplate.definition,
      defaultStyle: {
        font:
          Object.keys(certificateFonts)[0] ||
          certificateBaseTemplate.definition.defaultStyle.font
      }
    },
    fonts: {
      ...certificateBaseTemplate.fonts,
      ...certificateFonts
    }
  }

  // Inline all external resources (fonts + images) as base64 in one DOM pass.
  const svgFullyEmbedded = await embedExternalResourcesInSvg(svg)

  const parser = new DOMParser()
  const svgElement = parser.parseFromString(
    svgFullyEmbedded,
    'image/svg+xml'
  ).documentElement

  const $sections = svgElement.querySelectorAll('[data-page]')
  const widthValue = svgElement.getAttribute('width')
  const heightValue = svgElement.getAttribute('height')

  const pageWidth = widthValue ? Number.parseInt(widthValue) : 583
  const fullHeight = heightValue ? Number.parseInt(heightValue) : 842
  const pageHeight = $sections.length
    ? fullHeight / $sections.length
    : fullHeight

  pdfTemplate.definition.pageSize = { width: pageWidth, height: pageHeight }
  if (pageWidth > pageHeight) {
    pdfTemplate.definition.pageOrientation = 'landscape'
  }

  if ($sections.length > 0) {
    const pageDataUrls = await Promise.all(
      Array.from($sections).map(($section) => {
        const $svgWrapper = document.createElement('svg')
        ;[...svgElement.attributes].forEach((attr) => {
          $svgWrapper.setAttribute(attr.name, attr.value)
        })
        $svgWrapper.setAttribute('height', String(pageHeight))
        $section.removeAttribute('transform')
        $svgWrapper.appendChild($section.cloneNode(true))
        return renderSvgToDataUrl($svgWrapper.outerHTML, pageWidth, pageHeight)
      })
    )
    pdfTemplate.definition.content = pageDataUrls.map((dataUrl) => ({
      image: dataUrl,
      width: pageWidth,
      height: pageHeight
    }))
  } else {
    const dataUrl = await renderSvgToDataUrl(
      svgFullyEmbedded,
      pageWidth,
      pageHeight
    )
    pdfTemplate.definition.content = [
      {
        image: dataUrl,
        width: pageWidth,
        height: pageHeight
      }
    ]
  }

  return pdfTemplate
}

interface PdfTemplate {
  definition: TDocumentDefinitions
  fonts: Record<string, TFontFamilyTypes>
}

function createPdf(template: PdfTemplate): pdfMake.TCreatedPdf {
  return pdfMake.createPdf(template.definition, undefined, template.fonts)
}

export function printAndDownloadPdf(
  template: PdfTemplate,
  declarationId: string
) {
  const pdf = createPdf(template)
  if (isMobileDevice()) {
    pdf.download(`${declarationId}`)
  } else {
    pdf.print()
  }
}
