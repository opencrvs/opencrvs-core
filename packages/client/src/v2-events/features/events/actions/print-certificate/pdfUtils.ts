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
import htmlToPdfmake from 'html-to-pdfmake'
import type {
  Content,
  TDocumentDefinitions,
  TFontFamilyTypes
} from 'pdfmake/interfaces'
import pdfMake from 'pdfmake/build/pdfmake'
import { isEqual, isNil } from 'lodash'
import {
  EventState,
  User,
  LanguageConfig,
  EventConfig,
  getMixedPath,
  EventMetadata,
  EventStatus,
  DEFAULT_DATE_OF_EVENT_PROPERTY,
  ActionDocument,
  ActionStatus,
  Location,
  UserOrSystem
} from '@opencrvs/commons/client'
import { DateField } from '@client/v2-events/features/events/registered-fields'
import { getHandlebarHelpers } from '@client/forms/handlebarHelpers'
import { isMobileDevice } from '@client/utils/commonUtils'
import { getUsersFullName } from '@client/v2-events/utils'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { LocationSearch } from '@client/v2-events/features/events/registered-fields'
import { AdminStructureItem } from '@client/utils/referenceApi'

interface FontFamilyTypes {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type CertificateConfiguration = Partial<{
  fonts: Record<string, FontFamilyTypes>
}>

function findUserById(userId: string, users: UserOrSystem[]) {
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return {
      name: '',
      signature: '',
      fullHonorificName: ''
    }
  }

  return {
    name: getUsersFullName(user.name, 'en'),
    signature: user.signature ?? '',
    fullHonorificName: user.fullHonorificName ?? ''
  }
}

export const stringifyEventMetadata = ({
  metadata,
  intl,
  locations,
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
  locations: Location[]
  users: UserOrSystem[]
  adminLevels: AdminStructureItem[]
}) => {
  return {
    modifiedAt: DateField.toCertificateVariables(metadata.modifiedAt, {
      intl,
      locations
    }),
    assignedTo: findUserById(metadata.assignedTo ?? '', users),
    // @TODO: DATE_OF_EVENT config needs to be defined some other way and bake it in.
    dateOfEvent: metadata.dateOfEvent
      ? DateField.toCertificateVariables(metadata.dateOfEvent, {
          intl,
          locations
        })
      : DateField.toCertificateVariables(
          metadata[DEFAULT_DATE_OF_EVENT_PROPERTY],
          {
            intl,
            locations
          }
        ),
    createdAt: DateField.toCertificateVariables(metadata.createdAt, {
      intl,
      locations
    }),
    createdBy: findUserById(metadata.createdBy, users),
    createdAtLocation: LocationSearch.toCertificateVariables(
      metadata.createdAtLocation,
      {
        intl,
        locations,
        adminLevels
      }
    ),
    updatedAt: DateField.toCertificateVariables(metadata.updatedAt, {
      intl,
      locations
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
        adminLevels
      }
    ),
    flags: [],
    legalStatuses: {
      [EventStatus.enum.DECLARED]: metadata.legalStatuses.DECLARED
        ? {
            createdAt: DateField.toCertificateVariables(
              metadata.legalStatuses.DECLARED.createdAt,
              { intl, locations }
            ),
            createdBy: findUserById(
              metadata.legalStatuses.DECLARED.createdBy,
              users
            ),
            createdAtLocation: LocationSearch.toCertificateVariables(
              metadata.legalStatuses.DECLARED.createdAtLocation,
              { intl, locations, adminLevels }
            ),
            acceptedAt: DateField.toCertificateVariables(
              metadata.legalStatuses.DECLARED.acceptedAt,
              { intl, locations }
            ),
            createdByRole: metadata.legalStatuses.DECLARED.createdByRole,
            createdBySignature:
              metadata.legalStatuses.DECLARED.createdBySignature
          }
        : null,
      [EventStatus.enum.REGISTERED]: metadata.legalStatuses.REGISTERED
        ? {
            createdAt: DateField.toCertificateVariables(
              metadata.legalStatuses.REGISTERED.createdAt,
              { intl, locations }
            ),
            createdBy: findUserById(
              metadata.legalStatuses.REGISTERED.createdBy,
              users
            ),
            createdAtLocation: LocationSearch.toCertificateVariables(
              metadata.legalStatuses.REGISTERED.createdAtLocation,
              { intl, locations, adminLevels }
            ),
            acceptedAt: DateField.toCertificateVariables(
              metadata.legalStatuses.REGISTERED.acceptedAt,
              { intl, locations }
            ),
            createdByRole: metadata.legalStatuses.REGISTERED.createdByRole,
            registrationNumber:
              metadata.legalStatuses.REGISTERED.registrationNumber,
            createdBySignature: metadata.legalStatuses.REGISTERED
              .createdBySignature
              ? new URL(
                  metadata.legalStatuses.REGISTERED.createdBySignature,
                  window.config.MINIO_BASE_URL
                ).href
              : undefined
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
  adminLevels
}: {
  templateString: string
  $metadata: EventMetadata & {
    modifiedAt: string
    copiesPrintedForTemplate: number | undefined
  }
  $actions: ActionDocument[]
  $declaration: EventState
  locations: Location[]
  users: UserOrSystem[]
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
    return $actions
      .filter((a) => a.status === ActionStatus.Accepted)
      .filter((a) => a.type === actionType)
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
    return $actions
      .filter((a) => a.status === ActionStatus.Accepted)
      .findLast((a) => a.type === actionType)
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
        const resolvedAction = {
          id: action.data.id,
          type: action.data.type,
          createdAt: DateField.stringify(action.data.createdAt, {
            intl,
            locations
          }),
          createdBy: users.find((user) => user.id === action.data.createdBy),
          createdByUserType: action.data.createdByUserType,
          createdBySignature: action.data.createdBySignature,
          createdAtLocation: LocationSearch.toCertificateVariables(
            action.data.createdAtLocation,
            {
              intl,
              locations,
              adminLevels
            }
          ),
          createdByRole: action.data.createdByRole,
          annotation: action.data.annotation
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

async function downloadAndEmbedImages(svgString: string): Promise<string> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.documentElement
  const imageElements = svg.getElementsByTagName('image')

  const imagePromises: Promise<void>[] = Array.from(imageElements).map(
    async (imageElement) => {
      const href =
        imageElement.getAttribute('href') ||
        imageElement.getAttribute('xlink:href')

      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const response = await fetch(href)
        const blob = await response.blob()

        if (!response.ok) {
          console.error('Failed to fetch image:', href)
          console.error(
            'Ensure the URL is correct and image is requested before cache is cleaned.'
          )
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        if (imageElement.hasAttribute('href')) {
          imageElement.setAttribute('href', base64)
        }

        if (imageElement.hasAttribute('xlink:href')) {
          imageElement.setAttribute('xlink:href', base64)
        }
      }
    }
  )

  await Promise.all(imagePromises)

  const serializer = new XMLSerializer()
  return serializer.serializeToString(svg)
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
  /*
   * Download and inline all image files before creating a PDF.
   * If this is not done, the PDF will not render images correctly.
   * Images should always already be cached in the browser, so this also works offline
   */
  const svgWithInlineImages = await downloadAndEmbedImages(svg)

  const parser = new DOMParser()
  const svgElement = parser.parseFromString(
    svgWithInlineImages,
    'image/svg+xml'
  ).documentElement

  const widthValue = svgElement.getAttribute('width')
  const heightValue = svgElement.getAttribute('height')

  if (widthValue && heightValue) {
    const width = Number.parseInt(widthValue)
    const height = Number.parseInt(heightValue)
    pdfTemplate.definition.pageSize = {
      width,
      height
    }
    if (width > height) {
      pdfTemplate.definition.pageOrientation = 'landscape'
    }
  }

  const foreignObjects = svgElement.getElementsByTagName('foreignObject')
  const absolutelyPositionedHTMLs: Content[] = []
  for (const foreignObject of foreignObjects) {
    const width = Number.parseInt(foreignObject.getAttribute('width') ?? '0')
    const x = Number.parseInt(foreignObject.getAttribute('x') ?? '0')
    const y = Number.parseInt(foreignObject.getAttribute('y') ?? '0')
    const htmlContent = foreignObject.innerHTML
    const pdfmakeContent = htmlToPdfmake(htmlContent, {
      ignoreStyles: ['font-family']
    })
    absolutelyPositionedHTMLs.push({
      columns: [
        {
          width,
          stack: pdfmakeContent
        }
      ],
      absolutePosition: { x, y }
    } as Content)
  }

  pdfTemplate.definition.content = [
    {
      svg: svgWithInlineImages
    },
    ...absolutelyPositionedHTMLs
  ]

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
