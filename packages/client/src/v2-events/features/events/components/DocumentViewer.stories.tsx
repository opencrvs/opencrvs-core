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

import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { noop } from 'lodash'
import {
  tennisClubMembershipEvent,
  generateTranslationConfig,
  FieldType,
  defineActionForm,
  getDeclaration,
  PageTypes,
  FullDocumentPath
} from '@opencrvs/commons/client'
import { DocumentViewer } from './DocumentViewer'

const meta: Meta<typeof DocumentViewer> = {
  title: 'Review/DocumentViewer'
}

export default meta

export const EmptyDocumentViewer: StoryObj<typeof DocumentViewer> = {
  parameters: {
    layout: 'center'
  },
  render: function Component() {
    return (
      <DocumentViewer
        form={{}}
        formConfig={getDeclaration(tennisClubMembershipEvent)}
        onEdit={noop}
      />
    )
  }
}

const form = {
  'documents.one': {
    path: '/ocrvs/tree.svg' as FullDocumentPath,
    originalFilename: 'tree.svg',
    type: 'image/svg+xml'
  },
  'documents.two': [
    {
      path: '/ocrvs/fish.svg' as FullDocumentPath,
      originalFilename: 'fish.svg',
      type: 'image/svg+xml',
      option: 'NATIONAL_ID'
    },
    {
      path: '/ocrvs/mountain.svg' as FullDocumentPath,
      originalFilename: 'mountain.svg',
      type: 'image/svg+xml',
      option: 'PASSPORT'
    },
    {
      path: '/ocrvs/tree.svg' as FullDocumentPath,
      originalFilename: 'tree.svg',
      type: 'image/svg+xml',
      option: 'BIRTH_REGISTRATION_NUMBER'
    },
    {
      path: '/ocrvs/fish.svg' as FullDocumentPath,
      originalFilename: 'fish.svg',
      type: 'image/svg+xml',
      option: 'NONE'
    }
  ],
  'documents.three': {
    path: '/ocrvs/tree.svg' as FullDocumentPath,
    originalFilename: 'tree.svg',
    type: 'image/svg+xml'
  }
}

export const DocumentViewerWithFiles: StoryObj<typeof DocumentViewer> = {
  name: 'Review output',
  parameters: {
    layout: 'center'
  },
  render: function Component() {
    return (
      <DocumentViewer
        form={form}
        formConfig={defineActionForm({
          pages: [
            {
              type: 'FORM',
              fields: [
                {
                  id: 'documents.one',
                  label: generateTranslationConfig('FILE'),
                  type: FieldType.FILE
                },
                {
                  id: 'documents.two',
                  label: generateTranslationConfig('File with options'),
                  type: FieldType.FILE_WITH_OPTIONS,
                  options: [
                    {
                      value: 'NATIONAL_ID',
                      label: generateTranslationConfig('NATIONAL_ID')
                    },
                    {
                      value: 'PASSPORT',
                      label: generateTranslationConfig('PASSPORT')
                    },
                    {
                      value: 'BIRTH_REGISTRATION_NUMBER',
                      label: generateTranslationConfig(
                        'BIRTH_REGISTRATION_NUMBER'
                      )
                    },
                    {
                      value: 'OTHER',
                      label: generateTranslationConfig('OTHER')
                    }
                  ]
                }
              ],
              id: '1',
              title: generateTranslationConfig('field title')
            }
          ],
          label: generateTranslationConfig('form label')
        })}
        onEdit={noop}
      />
    )
  }
}

export const SameOptionsForDifferentFields: StoryObj<typeof DocumentViewer> = {
  name: 'Same options for different fields',
  parameters: {
    layout: 'center'
  },
  render: function Component() {
    const options = [
      {
        value: 'NATIONAL_ID',
        label: generateTranslationConfig('NATIONAL_ID')
      },
      {
        value: 'PASSPORT',
        label: generateTranslationConfig('PASSPORT')
      },
      {
        value: 'BIRTH_REGISTRATION_NUMBER',
        label: generateTranslationConfig('BIRTH_REGISTRATION_NUMBER')
      },
      {
        value: 'OTHER',
        label: generateTranslationConfig('OTHER')
      }
    ]

    const duplicateDocuments = [
      {
        path: '/ocrvs/fish.svg' as FullDocumentPath,
        originalFilename: 'fish.svg',
        type: 'image/svg+xml',
        option: 'NATIONAL_ID'
      },
      {
        path: '/ocrvs/mountain.svg' as FullDocumentPath,
        originalFilename: 'mountain.svg',
        type: 'image/svg+xml',
        option: 'PASSPORT'
      },
      {
        path: '/ocrvs/tree.svg' as FullDocumentPath,
        originalFilename: 'tree.svg',
        type: 'image/svg+xml',
        option: 'BIRTH_REGISTRATION_NUMBER'
      },
      {
        path: '/ocrvs/fish.svg' as FullDocumentPath,
        originalFilename: 'fish.svg',
        type: 'image/svg+xml',
        option: 'NONE'
      }
    ]

    const formWithDuplicates = {
      'documents.one': duplicateDocuments,
      'documents.two': duplicateDocuments,
      'documents.three': {
        path: '/ocrvs/tree.svg' as FullDocumentPath,
        originalFilename: 'tree.svg',
        type: 'image/svg+xml'
      }
    }

    return (
      <DocumentViewer
        form={formWithDuplicates}
        formConfig={defineActionForm({
          pages: [
            {
              type: PageTypes.Enum.FORM,
              fields: [
                {
                  id: 'documents.one',
                  label: generateTranslationConfig('File with options 1'),
                  type: FieldType.FILE_WITH_OPTIONS,
                  options
                },
                {
                  id: 'documents.two',
                  label: generateTranslationConfig('File with options 2'),
                  type: FieldType.FILE_WITH_OPTIONS,
                  options
                },
                {
                  id: 'documents.three',
                  label: generateTranslationConfig('File 3'),
                  type: FieldType.FILE,
                  configuration: {
                    fileName: generateTranslationConfig('custom file name')
                  }
                },
                {
                  id: 'documents.four',
                  label: generateTranslationConfig('File 4'),
                  type: FieldType.FILE
                }
              ],
              id: '1',
              title: generateTranslationConfig('field title')
            }
          ],
          label: generateTranslationConfig('form label')
        })}
        onEdit={noop}
      />
    )
  }
}
