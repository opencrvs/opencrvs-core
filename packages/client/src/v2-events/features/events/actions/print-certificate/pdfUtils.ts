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
import {
  IntlShape,
  MessageDescriptor,
  createIntl,
  createIntlCache
} from 'react-intl'
import Handlebars from 'handlebars'
import htmlToPdfmake from 'html-to-pdfmake'
import type {
  Content,
  TDocumentDefinitions,
  TFontFamilyTypes
} from 'pdfmake/interfaces'
import pdfMake from 'pdfmake/build/pdfmake'
import { Location } from '@events/service/locations/locations'
import { isEqual } from 'lodash'
import _ from 'lodash'
import {
  EventState,
  User,
  LanguageConfig,
  FieldValue,
  EventConfig,
  getMixedPath,
  EventMetadata,
  EventStatus,
  DEFAULT_DATE_OF_EVENT_PROPERTY,
  FieldConfig,
  isFacilityFieldType
} from '@opencrvs/commons/client'
import { DateField } from '@client/v2-events/features/events/registered-fields'
import { getHandlebarHelpers } from '@client/forms/handlebarHelpers'
import { isMobileDevice } from '@client/utils/commonUtils'
import {
  getUsersFullName,
  useResolveLocationToObject
} from '@client/v2-events/utils'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'

interface FontFamilyTypes {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type CertificateConfiguration = Partial<{
  fonts: Record<string, FontFamilyTypes>
}>

function findLocationById(
  intl: IntlShape,
  locationId: string | null | undefined,
  locations: Location[]
) {
  const country = intl.formatMessage({
    id: `countries.${window.config.COUNTRY}`,
    defaultMessage: 'Farajaland',
    description: 'Country name'
  })

  if (!locationId) {
    return {
      location: '',
      district: '',
      province: '',
      country
    }
  }

  const location = locations.find((loc) => loc.id === locationId)
  const district = locations.find((loc) => loc.id === location?.partOf)
  const province = locations.find((loc) => loc.id === district?.partOf)

  return {
    location: location?.name || '',
    district: district?.name || '',
    province: province?.name || '',
    country: country
  }
}

function findUserById(userId: string, users: User[]) {
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return {
      name: '',
      signature: ''
    }
  }

  return {
    name: getUsersFullName(user.name, 'en'),
    signature: user.signatureFilename ?? ''
  }
}

export const stringifyEventMetadata = ({
  metadata,
  intl,
  locations,
  users
}: {
  metadata: NonNullable<EventMetadata & { modifiedAt: string }>
  intl: IntlShape
  locations: Location[]
  users: User[]
}) => {
  return {
    modifiedAt: DateField.stringify(intl, metadata.modifiedAt),
    assignedTo: findUserById(metadata.assignedTo ?? '', users),
    // @TODO: DATE_OF_EVENT config needs to be defined some other way and bake it in.
    dateOfEvent: metadata.dateOfEvent
      ? DateField.stringify(intl, metadata.dateOfEvent)
      : DateField.stringify(intl, metadata[DEFAULT_DATE_OF_EVENT_PROPERTY]),
    createdAt: DateField.stringify(intl, metadata.createdAt),
    createdBy: findUserById(metadata.createdBy, users),
    createdAtLocation: findLocationById(
      intl,
      metadata.createdAtLocation,
      locations
    ),
    updatedAt: DateField.stringify(intl, metadata.updatedAt),
    updatedBy: metadata.updatedBy
      ? findUserById(metadata.updatedBy, users)
      : '',
    id: metadata.id,
    type: metadata.type,
    trackingId: metadata.trackingId,
    status: EventStatus.REGISTERED,
    updatedByUserRole: metadata.updatedByUserRole,
    updatedAtLocation: findLocationById(
      intl,
      metadata.updatedAtLocation,
      locations
    ),
    flags: [],
    legalStatuses: {
      [EventStatus.DECLARED]: metadata.legalStatuses.DECLARED
        ? {
            createdAt: DateField.stringify(
              intl,
              metadata.legalStatuses.DECLARED.createdAt
            ),
            createdBy: findUserById(
              metadata.legalStatuses.DECLARED.createdBy,
              users
            ),
            createdAtLocation: findLocationById(
              intl,
              metadata.legalStatuses.DECLARED.createdAtLocation,
              locations
            ),
            acceptedAt: DateField.stringify(
              intl,
              metadata.legalStatuses.DECLARED.acceptedAt
            ),
            createdByRole: metadata.legalStatuses.DECLARED.createdByRole
          }
        : null,
      [EventStatus.REGISTERED]: metadata.legalStatuses.REGISTERED
        ? {
            createdAt: DateField.stringify(
              intl,
              metadata.legalStatuses.REGISTERED.createdAt
            ),
            createdBy: findUserById(
              metadata.legalStatuses.REGISTERED.createdBy,
              users
            ),
            createdAtLocation: findLocationById(
              intl,
              metadata.legalStatuses.REGISTERED.createdAtLocation,
              locations
            ),
            acceptedAt: DateField.stringify(
              intl,
              metadata.legalStatuses.REGISTERED.acceptedAt
            ),
            createdByRole: metadata.legalStatuses.REGISTERED.createdByRole,
            registrationNumber:
              metadata.legalStatuses.REGISTERED.registrationNumber
          }
        : null
    }
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

function isMessageDescriptor(obj: unknown): obj is MessageDescriptor {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'defaultMessage' in obj &&
    typeof (obj as MessageDescriptor).id === 'string' &&
    typeof (obj as MessageDescriptor).defaultMessage === 'string'
  )
}

function formatAllNonStringValues(
  templateData: EventState,
  intl: IntlShape
): Record<string, FieldValue> {
  const formattedData: Record<string, FieldValue> = {}

  for (const key of Object.keys(templateData)) {
    const value = templateData[key]

    if (isMessageDescriptor(value)) {
      formattedData[key] = intl.formatMessage(value)
    } else if (Array.isArray(value)) {
      // Address field: country label is a MessageDescriptor but others are strings
      formattedData[key] = value
        .filter(Boolean)
        .map((item) =>
          isMessageDescriptor(item) ? intl.formatMessage(item) : item
        )
        .join(', ')
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (typeof value === 'object' && value !== null) {
      formattedData[key] = formatAllNonStringValues(
        value satisfies EventState,
        intl
      ) as FieldValue
    } else {
      formattedData[key] = String(value)
    }
  }

  return formattedData
}

const cache = createIntlCache()

/*
 * Turns certain field values into objects which we can access in the template.
 * For example, we want to access facility location fields with specific object keys instead of plain strings.
 */
function objectifyFormData(formFields: FieldConfig[], values: EventState) {
  return Object.keys(values).reduce((acc: Record<string, unknown>, key) => {
    const fieldConfig = formFields.find((field) => field.id === key)
    if (!fieldConfig) {
      throw new Error(`Field ${key} not found in form config`)
    }

    const value = values[key]
    const field = { config: fieldConfig, value }

    if (isFacilityFieldType(field)) {
      acc[key] = useResolveLocationToObject(value?.toString())
    }

    return acc
  }, {})
}

export function compileSvg({
  templateString,
  $metadata,
  $declaration,
  locations,
  users,
  language,
  config
}: {
  templateString: string
  $metadata: EventMetadata & { modifiedAt: string }
  $declaration: EventState
  locations: Location[]
  users: User[]
  language: LanguageConfig
  config: EventConfig
}): string {
  const intl = createIntl(
    {
      locale: language.lang,
      messages: language.messages
    },
    cache
  )

  const customHelpers = getHandlebarHelpers()

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
    const stringifyDeclaration = getFormDataStringifier(intl, locations)
    const fieldConfigs = config.declaration.pages.flatMap((x) => x.fields)

    // Sometimes we want to access certain fields as specific object keys instead of plain strings.
    // For example, we want to access birthLocation as an object with keys FACILITY, DISTRICT, STATE, COUNTRY.
    const asObjects = objectifyFormData(fieldConfigs, $declaration)

    const resolvedDeclaration = {
      ...stringifyDeclaration(fieldConfigs, $declaration),
      asObjects
    }

    const resolvedMetadata = stringifyEventMetadata({
      metadata: $metadata,
      intl,
      locations,
      users
    })

    if (isEqual($metadata, obj)) {
      return getMixedPath(resolvedMetadata, propertyPath)
    }
    return getMixedPath(resolvedDeclaration, propertyPath)
  }

  Handlebars.registerHelper('$lookup', $lookup)

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
      // If even one of the parts is undefined, then return empty string
      const idParts = args.slice(0, -1)
      if (idParts.some((part) => part === undefined)) {
        return ''
      }

      const id = idParts.join('.')

      return intl.formatMessage({
        id,
        defaultMessage: 'Missing translation for ' + id
      })
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
  $declaration = formatAllNonStringValues($declaration, intl)
  const data = {
    $declaration,
    $metadata,
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

export function svgToPdfTemplate(
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

  const parser = new DOMParser()
  const svgElement = parser.parseFromString(
    svg,
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
      svg
    },
    ...absolutelyPositionedHTMLs
  ]

  return pdfTemplate
}

interface PdfTemplate {
  definition: TDocumentDefinitions
  fonts: Record<string, TFontFamilyTypes>
}

export function printAndDownloadPdf(
  template: PdfTemplate,
  declarationId: string
) {
  const pdf = pdfMake.createPdf(template.definition, undefined, template.fonts)
  if (isMobileDevice()) {
    pdf.download(`${declarationId}`)
  } else {
    pdf.print()
  }
}
