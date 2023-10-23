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
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { getOfflineData } from '@client/offline/selectors'
import isValid from 'date-fns/isValid'
import format from 'date-fns/format'

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

  const pdfTemplate: IPDFTemplate = certificateBaseTemplate
  pdfTemplate.definition.pageSize = pageSize
  updatePDFTemplateWithSVGContent(pdfTemplate, svgCode, pageSize)
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
