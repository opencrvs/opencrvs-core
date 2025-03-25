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
import { AdminStructure, ILocation } from '@client/offline/reducer'
import { IPDFTemplate } from '@client/pdfRenderer'
import { certificateBaseTemplate } from '@client/templates/register'
import * as Handlebars from 'handlebars'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import isValid from 'date-fns/isValid'
import format from 'date-fns/format'
import { getHandlebarHelpers } from '@client/forms/handlebarHelpers'
import {
  CertificateConfiguration,
  FontFamilyTypes
} from '@client/utils/referenceApi'
import htmlToPdfmake from 'html-to-pdfmake'
import { Content } from 'pdfmake/interfaces'
import {
  formatPlainDate,
  isValidPlainDate
} from '@client/utils/date-formatting'

type TemplateDataType = string | MessageDescriptor | Array<string>
function isMessageDescriptor(
  obj: Record<string, unknown>
): obj is MessageDescriptor & Record<string, string> {
  return (
    obj !== null &&
    obj.hasOwnProperty('id') &&
    obj.hasOwnProperty('defaultMessage') &&
    typeof (obj as MessageDescriptor).id === 'string' &&
    typeof (obj as MessageDescriptor).defaultMessage === 'string'
  )
}

function formatAllNonStringValues(
  templateData: Record<string, TemplateDataType>,
  intl: IntlShape
): Record<string, string> {
  for (const key of Object.keys(templateData)) {
    if (
      typeof templateData[key] === 'object' &&
      isMessageDescriptor(templateData[key] as Record<string, unknown>)
    ) {
      templateData[key] = intl.formatMessage(
        templateData[key] as MessageDescriptor
      )
    } else if (Array.isArray(templateData[key])) {
      // For address field, country label is a MessageDescriptor
      // but state, province is string
      templateData[key] = (
        templateData[key] as Array<string | MessageDescriptor>
      )
        .filter(Boolean)
        .map((item) =>
          isMessageDescriptor(item as Record<string, unknown>)
            ? intl.formatMessage(item as MessageDescriptor)
            : item
        )
        .join(', ')
    } else if (
      typeof templateData[key] === 'object' &&
      templateData[key] !== null
    ) {
      templateData[key] = formatAllNonStringValues(
        templateData[key] as Record<string, TemplateDataType>,
        intl
      )
    }
  }
  return templateData as Record<string, string>
}

const cache = createIntlCache()

export function compileSvg(
  templateString: string,
  data: Record<string, any> = {},
  state: IStoreState
): string {
  const intl = createIntl(
    {
      locale: state.i18n.language,
      messages: state.i18n.messages
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
    'intl',
    function (this: any, ...args: [...string[], Handlebars.HelperOptions]) {
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
    } as any /* This is here because Handlebars typing is insufficient and we can make the function type stricter */
  )

  Handlebars.registerHelper(
    'ifCond',
    function (
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

  Handlebars.registerHelper(
    'formatDate',
    function (this: any, dateString: string, formatString: string) {
      if (isValidPlainDate(dateString)) {
        return formatPlainDate(dateString, formatString)
      }
      const date = new Date(dateString)
      return isValid(date) ? format(date, formatString) : ''
    }
  )

  Handlebars.registerHelper(
    'location',
    function (this: any, locationId: string | undefined, key: keyof ILocation) {
      const offlineData = getOfflineData(state)

      if (!locationId) {
        return ''
      }

      if (!['name', 'alias'].includes(key)) {
        return `Unknown property ${key}`
      }

      const location: AdminStructure | undefined =
        offlineData.locations[locationId] ??
        offlineData.facilities[locationId] ??
        offlineData.offices[locationId]

      const fallback = import.meta.env.DEV
        ? `Missing location for id: ${locationId}`
        : locationId

      return location?.[key] ?? fallback
    }
  )

  const template = Handlebars.compile(templateString)
  const formattedTemplateData = formatAllNonStringValues(data, intl)
  const output = template(formattedTemplateData)
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
  const pdfTemplate: IPDFTemplate = {
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
    const width = Number.parseInt(foreignObject.getAttribute('width')!)
    const x = Number.parseInt(foreignObject.getAttribute('x')!)
    const y = Number.parseInt(foreignObject.getAttribute('y')!)
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

export function downloadFile(
  contentType: string,
  data: string,
  fileName: string
) {
  const linkSource = `data:${contentType};base64,${window.btoa(data)}`
  const downloadLink = document.createElement('a')
  downloadLink.setAttribute('href', linkSource)
  downloadLink.setAttribute('download', fileName)
  downloadLink.click()
}
