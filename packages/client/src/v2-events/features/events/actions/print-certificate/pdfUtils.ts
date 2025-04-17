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
import { Location } from '@events/service/locations/locations'
import pdfMake from 'pdfmake/build/pdfmake'
import format from 'date-fns/format'
import isValid from 'date-fns/isValid'
import {
  EventIndex,
  EventState,
  User,
  LanguageConfig,
  FieldValue,
  EventConfig
} from '@opencrvs/commons/client'

import { getHandlebarHelpers } from '@client/forms/handlebarHelpers'
import { isMobileDevice } from '@client/utils/commonUtils'
import { getUsersFullName } from '@client/v2-events/utils'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'

interface FontFamilyTypes {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type CertificateConfiguration = Partial<{
  fonts: Record<string, FontFamilyTypes>
}>

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

export function compileSvg({
  templateString,
  $state,
  $declaration,
  locations,
  users,
  language,
  config
}: {
  templateString: string
  $state: EventIndex
  $declaration: EventState
  locations: Location[]
  users: User[]
  language: LanguageConfig
  config: EventConfig
}): string {
  const intl: IntlShape = createIntl(
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

  Handlebars.registerHelper(
    'formatDate',
    function (dateString: string, formatString: string) {
      const date = new Date(dateString)
      return isValid(date) ? format(date, formatString) : ''
    }
  )

  Handlebars.registerHelper(
    'findUserById',
    function (id: string, propertyName: keyof User) {
      const user = users.find((usr) => usr.id === id)
      if (!user) {
        return ''
      } else if (propertyName === 'name') {
        return getUsersFullName(user.name, 'en')
      }
      return user[propertyName]
    }
  )

  /**
   * Handlebars helper: modifiedLookup
   *
   * Usage: {{modifiedLookup 'child.address.other' 'district'}}
   *
   * Resolves a value from the declaration using a property path,
   * then optionally returns a nested field from the resolved object.
   *
   * Behavior:
   * 1. Resolves the full object/value from the declaration using `propertyPath`.
   * 2. If the resolved value is an object and `finalNode` is provided, it returns the value at that key.
   * 3. If not, it falls back to returning the raw resolved value.
   *
   * Useful for dereferencing fields like `locationId` or `address.districtId`
   * when you want to extract a specific sub-property (e.g., 'district', 'town').
   */
  Handlebars.registerHelper(
    'modifiedLookup',
    function (propertyPath: string, finalNode: string) {
      const stringify = useFormDataStringifier()
      const formFieldWithResolvedValue = stringify(
        config.declaration.pages.flatMap((x) => x.fields),
        $declaration
      )

      if (
        typeof formFieldWithResolvedValue[propertyPath] === 'object' &&
        finalNode
      ) {
        return formFieldWithResolvedValue[propertyPath][finalNode]
      }
      return formFieldWithResolvedValue[propertyPath]
    }
  )

  /**
   * Handlebars helper: location
   *
   * Usage: {{location locationId propName}}
   *
   * This helper retrieves a specific part of an address (location, district, province, or country)
   * based on the provided location ID.
   *
   * It uses the `useStringifier` function from `LocationSearch` to resolve the full address object,
   * and returns the value of the requested property.
   *
   * Parameters:
   * - locationId (string): ID of the target location
   * - propName (string): One of 'location', 'district', 'province', or 'country'
   *
   * Returns:
   * - The name corresponding to the requested property, or undefined if not available.
   */
  Handlebars.registerHelper(
    'location',
    function (
      locationId: string,
      propName: 'location' | 'district' | 'province' | 'country'
    ) {
      const location = locations.find((loc) => loc.id === locationId)
      const district = locations.find((loc) => loc.id === location?.partOf)
      const province = locations.find((loc) => loc.id === district?.partOf)

      const country = intl.formatMessage({
        id: `countries.${window.config.COUNTRY}`,
        defaultMessage: 'Farajaland',
        description: 'Country name'
      })

      const address = {
        location: location?.name || '',
        district: district?.name || '',
        province: province?.name || '',
        country: country
      }

      return address[propName]
    }
  )

  /**
   * Handlebars helper: intl
   *
   * Usage example in SVG template:
   *   <tspan>{{ intl 'constants' (lookup $declaration "child.gender") }}</tspan>
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
    'intl',

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
   * Handlebars helper: OR
   * Returns the first truthy value between v1 and v2.
   */
  Handlebars.registerHelper(
    'OR',
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
    $state,
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
