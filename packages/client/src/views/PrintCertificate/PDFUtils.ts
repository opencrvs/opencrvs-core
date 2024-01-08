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
import { createPDF, printPDF } from '@client/pdfRenderer'
import { IDeclaration } from '@client/declarations'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import {
  OptionalData,
  IPDFTemplate
} from '@client/pdfRenderer/transformer/types'
import { PageSize } from 'pdfmake/interfaces'
import { certificateBaseTemplate } from '@client/templates/register'
import * as Handlebars from 'handlebars'
import { UserDetails } from '@client/utils/userUtils'
import { EMPTY_STRING, MARRIAGE_SIGNATURE_KEYS } from '@client/utils/constants'
import { IStoreState } from '@client/store'
import getDate from 'date-fns/getDate'
import getMonth from 'date-fns/getMonth'
import getYear from 'date-fns/getYear'
import isValid from 'date-fns/isValid'
import formatDate, { formatLongDate } from '@client/utils/date-formatting'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { constantsMessages } from '@client/i18n/messages'
import { getDefaultLanguage } from '@client/i18n/utils'
import { getOfflineData } from '@client/offline/selectors'
import format from 'date-fns/format'
import { getHandlebarHelpers } from '@client/forms/handlebarHelpers'

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

export function formatAllNonStringValues(
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
/**
 *
 * Formats message with a fallback if key not found
 * @param intl
 * @param key
 */
function formatMessage(intl: IntlShape, key: string) {
  return intl.formatMessage({
    id: key,
    defaultMessage: 'Missing translation for ' + key
  })
}

const getNumberInWords = (
  n: number,
  tenthKey: string,
  unitKey: string,
  intl: IntlShape
) => {
  let word = ''
  let remainder
  if (n < 20) {
    if (n > 0) {
      word = formatMessage(intl, [unitKey, n].join('.'))
    }
  } else if (n < 100) {
    remainder = n % 10
    word = formatMessage(intl, [tenthKey, Math.floor(n / 10)].join('.'))
    // In case of remainder, we need to handle it here to be able to add the “-”
    if (remainder) {
      word += '-' + formatMessage(intl, [unitKey, remainder].join('.'))
    }
  }
  return word
}

export function executeHandlebarsTemplate(
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
    'split',
    function (str: string, separator: string, index: number) {
      if (!str) {
        return ''
      }

      return str.split(separator)[index] || ''
    }
  )

  Handlebars.registerHelper('translateDate', function (date: string) {
    if (date) {
      const longDate = formatLongDate(
        date,
        intl.locale,
        intl.formatMessage(constantsMessages.format)
      )
      if (!longDate) {
        return formatDate(
          new Date(date),
          intl.formatMessage(constantsMessages.format)
        )
      } else {
        return longDate
      }
    }
    return ''
  })

  Handlebars.registerHelper(
    'translateAge',
    function (
      ageOfIndividualInYears: number,
      registrationDate: string,
      ...args
    ) {
      return getYear(new Date(registrationDate)) - ageOfIndividualInYears
    }
  )

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
    'intlVariable',
    function (messageId: string, key: string, value: string) {
      return intl.formatMessage(
        {
          id: messageId,
          defaultMessage: 'Missing translation for ' + messageId
        },
        { [key]: value }
      )
    }
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
    'dateToWords',
    function (
      keys: {
        century: string
        tenth: string
        number: string
        ordinal: string
        month: string
      },
      dateString: string
    ) {
      const translationFileKeys: Array<keyof typeof keys> = [
        'century',
        'tenth',
        'number',
        'ordinal',
        'month'
      ]

      for (const key of translationFileKeys) {
        if (!keys[key as keyof typeof keys]) {
          return (
            'Cannot turn date to words without all translation keys. Missing: ' +
            key
          )
        }
      }

      const date = new Date(dateString)

      if (!isValid(date)) {
        return ''
      }
      const year = getYear(date)
      const month = getMonth(date) + 1
      const dayOfMonth = getDate(date)

      const century = Math.floor(year / 100) * 100
      const centuryYear = year - century

      const yearMessage = `${formatMessage(
        intl,
        [keys.century, century].join('.')
      )} ${getNumberInWords(centuryYear, keys.tenth, keys.number, intl)}`
      const monthMessage = formatMessage(intl, [keys.month, month].join('.'))
      const dayOfMonthMessage = formatMessage(
        intl,
        [keys.ordinal, dayOfMonth].join('.')
      )
      return [dayOfMonthMessage, monthMessage, yearMessage].join(' ')
    }
  )

  Handlebars.registerHelper(
    'keys',
    function (options: Handlebars.HelperOptions) {
      return options.hash
    }
  )

  Handlebars.registerHelper('uppercase', function (str) {
    if (str && typeof str === 'string') {
      return str.toUpperCase()
    }
    return ''
  })

  Handlebars.registerHelper('lowercase', function (str) {
    if (str && typeof str === 'string') {
      return str.toLowerCase()
    }
    return ''
  })

  Handlebars.registerHelper('camelize', function (str: string) {
    if (str && typeof str === 'string') {
      return str.replace(/\W+(.)/g, function (match, chr) {
        return chr.toUpperCase()
      })
    }
    return ''
  })

  Handlebars.registerHelper('concat', function () {
    // eslint-disable-next-line prefer-rest-params
    return Array.prototype.slice.call(arguments, 0, -1).join('')
  })

  Handlebars.registerHelper(
    'getLocalizedLocationName',
    function (office: ILocation) {
      if (intl.locale === getDefaultLanguage()) {
        return office?.name
      } else {
        return office.alias?.toString()
      }
    }
  )

  Handlebars.registerHelper(
    'formatDate',
    function (this: any, dateString: string, formatString: string) {
      const date = new Date(dateString)
      return isValid(date) ? format(date, formatString) : ''
    }
  )

  Handlebars.registerHelper(
    'location',
    function (this: any, locationId: string, key: keyof ILocation) {
      const locations = getOfflineData(state).locations
      return locations[locationId]
        ? locations[locationId][key]
        : `Missing location for id: ${locationId}`
    }
  )

  const template = Handlebars.compile(templateString)
  const formattedTemplateData = formatAllNonStringValues(data, intl)
  const output = template(formattedTemplateData)
  return output
}

export async function previewCertificate(
  intl: IntlShape,
  declaration: IDeclaration,
  userDetails: UserDetails | null,
  offlineResource: IOfflineData,
  callBack: (pdf: string) => void,
  state: IStoreState,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }

  createPDF(
    await getPDFTemplateWithSVG(offlineResource, declaration, pageSize, state),
    declaration,
    userDetails,
    offlineResource,
    intl,
    optionalData
  ).getDataUrl((pdf: string) => {
    callBack(pdf)
  })
}

export async function printCertificate(
  intl: IntlShape,
  declaration: IDeclaration,
  userDetails: UserDetails | null,
  offlineResource: IOfflineData,
  state: IStoreState,
  optionalData?: OptionalData,
  pageSize: PageSize = 'A4'
) {
  if (!userDetails) {
    throw new Error('No user details found')
  }
  printPDF(
    await getPDFTemplateWithSVG(offlineResource, declaration, pageSize, state),
    declaration,
    userDetails,
    offlineResource,
    intl,
    optionalData
  )
}

async function getPDFTemplateWithSVG(
  offlineResource: IOfflineData,
  declaration: IDeclaration,
  pageSize: PageSize,
  state: IStoreState
): Promise<IPDFTemplate> {
  const svgTemplate =
    offlineResource.templates.certificates![declaration.event]?.definition ||
    EMPTY_STRING

  const resolvedSignatures = await Promise.all(
    MARRIAGE_SIGNATURE_KEYS.map((k) => ({
      signatureKey: k,
      url: declaration.data.template[k]
    }))
      .filter(({ url }) => Boolean(url))
      .map(({ signatureKey, url }) =>
        fetchImageAsBase64(url as string).then((value) => ({
          [signatureKey]: value
        }))
      )
  ).then((res) => res.reduce((acc, cur) => ({ ...acc, ...cur }), {}))

  const declarationTemplate = {
    ...declaration.data.template,
    ...resolvedSignatures
  }
  const svgCode = executeHandlebarsTemplate(
    svgTemplate,
    declarationTemplate,
    state
  )

  const pdfTemplate: IPDFTemplate = {
    ...certificateBaseTemplate,
    fonts: {
      ...certificateBaseTemplate.fonts,
      ...offlineResource.templates.fonts
    }
  }
  pdfTemplate.definition.pageSize = pageSize
  updatePDFTemplateWithSVGContent(pdfTemplate, svgCode, pageSize)
  return pdfTemplate
}

function parseDataURL(dataURL: string) {
  if (!dataURL.startsWith('data:')) return
  const contentAndType = dataURL.split(':')[1]
  const [type, content] = contentAndType.split(';')
  let ext = ''
  let data = ''
  if (type) {
    ext = type.split('/')[1]
  }
  if (content) {
    data = content.split(',')[1]
  }
  return {
    ext,
    data
  }
}

interface IFont {
  fontFamily: string
  ext: string
  data: string
  fontStyle: string
}
/**
 *
 * @param fontFamily
 * This function assumes that fontFamily
 * is set by a convention: Name-Style
 * i.e. Roboto-Italic, Roboto-Bold
 *
 */

function getPDFMakeFontStyle(fontFamily: string) {
  const style = fontFamily.split('-')[1]?.toLowerCase()
  if (style === 'bold') return 'bold'
  else if (style === 'italic') return 'italics'
  else if (style === 'bolditalic') return 'bolditalics'
  else return 'normal'
}

function getFontsFromSVG(svgCode: string) {
  const parser = new DOMParser()
  const svg = parser.parseFromString(svgCode, 'image/svg+xml')
  const style = svg.querySelector('style')
  const fontFaceRules = Array.from(style?.sheet?.cssRules || []).filter(
    isCSSFontFaceRule
  )

  return fontFaceRules.reduce<IFont[]>((fonts, rule) => {
    // @ts-ignore
    const dataurl = rule.style.src.split('"')[1].slice(0, -1)
    const parsed = parseDataURL(dataurl)

    if (parsed) {
      const { ext, data } = parsed
      const fontFamily = rule.style.fontFamily.replaceAll('"', '')
      return [
        ...fonts,
        {
          fontFamily,
          ext,
          data,
          fontStyle: getPDFMakeFontStyle(fontFamily)
        }
      ]
    }
    return fonts
  }, [])
}

function getVFSFromFonts(fonts: IFont[]) {
  return fonts.reduce(
    (vfs, font) => ({
      ...vfs,
      [`${font.fontFamily}.${font.ext}`]: font.data
    }),
    {}
  )
}

function getTemplateFonts(fonts: IFont[]) {
  const name = fonts.find((font) => font.fontStyle === 'normal')?.fontFamily
  if (!name) return {}
  return {
    [name]: fonts.reduce(
      (style, font) => ({
        ...style,
        [font.fontStyle]: `${font.fontFamily}.${font.ext}`
      }),
      {}
    )
  }
}

function isCSSFontFaceRule(cssRule: CSSRule): cssRule is CSSFontFaceRule {
  return cssRule instanceof CSSFontFaceRule
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

function updatePDFTemplateWithSVGContent(
  template: IPDFTemplate,
  svg: string,
  pageSize: PageSize
) {
  template.definition['content'] = {
    svg,
    fit: getPageDimensions(pageSize)
  }
}

const standardPageSizes: Record<string, [number, number]> = {
  A2: [1190.55, 1683.78],
  A3: [841.89, 1190.55],
  A4: [595.28, 841.89],
  A5: [419.53, 595.28]
}

function getPageDimensions(pageSize: PageSize) {
  if (
    typeof pageSize === 'string' &&
    standardPageSizes.hasOwnProperty(pageSize)
  ) {
    return standardPageSizes[pageSize]
  } else {
    throw new Error(
      `Pagesize ${pageSize} is not found in standardPageSizes map`
    )
  }
}
