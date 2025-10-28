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
import { expect, fn, userEvent, waitFor, within } from '@storybook/test'
import { http, HttpResponse } from 'msw'
import React from 'react'
import styled from 'styled-components'
import {
  defineConditional,
  defineFormConditional,
  field,
  FieldType
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

interface Args {
  onChange: (val: unknown) => void
}

const meta: Meta<Args> = {
  title: 'Inputs/Search',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const SearchWithInvalidValue: StoryObj<typeof FormFieldGenerator> = {
  name: 'Search with invalid value',
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    msw: {
      handlers: {
        nidApi: [
          http.post('/api/events/search', async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return HttpResponse.json({
              results: [
                {
                  id: 'd65a1ecd-b26a-4520-b51c-bfdd43785471',
                  type: 'birth',
                  status: 'REGISTERED',
                  legalStatuses: {
                    DECLARED: {
                      createdAt: '2025-09-10T07:08:48.495Z',
                      createdBy: '68c122bc28f080e722d4927c',
                      createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                      createdByUserType: 'user',
                      acceptedAt: '2025-09-10T07:08:48.959Z',
                      createdByRole: 'LOCAL_REGISTRAR'
                    },
                    REGISTERED: {
                      createdAt: '2025-09-10T07:08:51.963Z',
                      createdBy: '68c122bc28f080e722d4927c',
                      createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                      createdByUserType: 'user',
                      acceptedAt: '2025-09-10T07:08:52.195Z',
                      createdByRole: 'LOCAL_REGISTRAR',
                      registrationNumber: 'I3G2AIUXF4SU'
                    }
                  },
                  createdAt: '2025-09-10T07:08:47.987Z',
                  dateOfEvent: '2025-09-09',
                  createdBy: '68c122bc28f080e722d4927c',
                  createdByUserType: 'user',
                  updatedByUserRole: 'LOCAL_REGISTRAR',
                  createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                  updatedAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                  updatedAt: '2025-09-10T07:08:52.195Z',
                  updatedBy: '68c122bc28f080e722d4927c',
                  trackingId: 'TFY9FK',
                  potentialDuplicates: [],
                  flags: ['pending-certification'],
                  declaration: {
                    'child.name': {
                      surname: 'Dietrich',
                      firstname: 'Royal'
                    },
                    'child.gender': 'female',
                    'informant.relation': 'MOTHER',
                    'mother.name': {
                      surname: 'Schaden',
                      firstname: 'Jayce'
                    },
                    'mother.nationality': 'FAR',
                    'mother.idType': 'NATIONAL_ID',
                    'mother.nid': '6097821229',
                    'father.detailsNotAvailable': true,
                    'father.reason': 'Father is missing.'
                  }
                }
              ],
              total: 1
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByTestId('search-input'), '456988542')

    await canvas.findByTestId('search-input-error')

    await userEvent.type(await canvas.findByTestId('search-input'), '1')
    await waitFor(async () =>
      expect(canvas.queryByTestId('search-input-error')).not.toBeInTheDocument()
    )
    await userEvent.click(
      await canvas.findByRole('button', { name: /Confirm/i })
    )
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'child.brn-search',
            type: FieldType.SEARCH,
            label: {
              defaultMessage: 'Birth registration number',
              description: 'BRN for child',
              id: 'event.birth.child.brn.label'
            },
            configuration: {
              validation: {
                validator: defineConditional({
                  type: 'string',
                  pattern: '^[0-9]{10}$',
                  description: 'Must be numeric and 10 digits long.'
                }),
                message: {
                  defaultMessage: 'Invalid value',
                  description: 'Error message for invalid value',
                  id: 'form.validation.invalid'
                }
              },
              query: {
                type: 'or',
                clauses: [
                  {
                    'legalStatuses.REGISTERED.registrationNumber': {
                      term: '{term}',
                      type: 'exact'
                    }
                  }
                ]
              },
              limit: 10,
              offset: 0
            }
          },
          {
            id: 'child.result',
            type: FieldType.DATA,
            label: {
              defaultMessage: 'Search results',
              description: 'BRN for child',
              id: 'event.birth.child.brn.label'
            },
            configuration: {
              data: [
                {
                  label: {
                    defaultMessage: 'Total results',
                    id: 'event.birth.child.brn.totalResults.label',
                    description: 'Total results from BRN search'
                  },
                  value: field('child.brn-search').get('data.total'),
                  id: 'total-results'
                }
              ]
            }
          }
        ]}
        id="my-form"
        validatorContext={{}}
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}
export const SearchWithRegistrationNumber: StoryObj<typeof FormFieldGenerator> =
  {
    name: 'Search with registration number',
    parameters: {
      chromatic: {
        disableSnapshot: true
      },
      layout: 'centered',
      msw: {
        handlers: {
          nidApi: [
            http.post('/api/events/search', async () => {
              await new Promise((resolve) => setTimeout(resolve, 2000))
              return HttpResponse.json({
                results: [
                  {
                    id: 'd65a1ecd-b26a-4520-b51c-bfdd43785471',
                    type: 'birth',
                    status: 'REGISTERED',
                    legalStatuses: {
                      DECLARED: {
                        createdAt: '2025-09-10T07:08:48.495Z',
                        createdBy: '68c122bc28f080e722d4927c',
                        createdAtLocation:
                          'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                        createdByUserType: 'user',
                        acceptedAt: '2025-09-10T07:08:48.959Z',
                        createdByRole: 'LOCAL_REGISTRAR'
                      },
                      REGISTERED: {
                        createdAt: '2025-09-10T07:08:51.963Z',
                        createdBy: '68c122bc28f080e722d4927c',
                        createdAtLocation:
                          'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                        createdByUserType: 'user',
                        acceptedAt: '2025-09-10T07:08:52.195Z',
                        createdByRole: 'LOCAL_REGISTRAR',
                        registrationNumber: 'I3G2AIUXF4SU'
                      }
                    },
                    createdAt: '2025-09-10T07:08:47.987Z',
                    dateOfEvent: '2025-09-09',
                    createdBy: '68c122bc28f080e722d4927c',
                    createdByUserType: 'user',
                    updatedByUserRole: 'LOCAL_REGISTRAR',
                    createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                    updatedAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
                    updatedAt: '2025-09-10T07:08:52.195Z',
                    updatedBy: '68c122bc28f080e722d4927c',
                    trackingId: 'TFY9FK',
                    potentialDuplicates: [],
                    flags: ['pending-certification'],
                    declaration: {
                      'child.name': {
                        surname: 'Dietrich',
                        firstname: 'Royal'
                      },
                      'child.gender': 'female',
                      'informant.relation': 'MOTHER',
                      'mother.name': {
                        surname: 'Schaden',
                        firstname: 'Jayce'
                      },
                      'mother.nationality': 'FAR',
                      'mother.idType': 'NATIONAL_ID',
                      'mother.nid': '6097821229',
                      'father.detailsNotAvailable': true,
                      'father.reason': 'Father is missing.'
                    }
                  }
                ],
                total: 1
              })
            })
          ]
        }
      }
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await userEvent.type(
        await canvas.findByTestId('search-input'),
        '6097821229'
      )
      await userEvent.click(
        await canvas.findByRole('button', { name: /Confirm/i })
      )
    },
    render: function Component(args) {
      return (
        <StyledFormFieldGenerator
          fields={[
            {
              id: 'child.brn-search',
              type: FieldType.SEARCH,
              label: {
                defaultMessage: 'Birth registration number',
                description: 'BRN for child',
                id: 'event.birth.child.brn.label'
              },
              configuration: {
                validation: {
                  validator: defineConditional({
                    type: 'string',
                    pattern: '^[0-9]{10}$',
                    description: 'Must be numeric and 10 digits long.'
                  }),
                  message: {
                    defaultMessage: 'Invalid value',
                    description: 'Error message for invalid value',
                    id: 'form.validation.invalid'
                  }
                },
                query: {
                  type: 'or',
                  clauses: [
                    {
                      'legalStatuses.REGISTERED.registrationNumber': {
                        term: '{term}',
                        type: 'exact'
                      }
                    }
                  ]
                },
                limit: 10,
                offset: 0
              }
            },
            {
              id: 'child.result',
              type: FieldType.DATA,
              label: {
                defaultMessage: 'Search results',
                description: 'BRN for child',
                id: 'event.birth.child.brn.label'
              },
              configuration: {
                data: [
                  {
                    id: 'total-results',
                    label: {
                      defaultMessage: 'Total results',
                      id: 'event.birth.child.brn.totalResults.label',
                      description: 'Total results from BRN search'
                    },
                    value: field('child.brn-search').get('data.total')
                  }
                ]
              }
            }
          ]}
          id="my-form"
          validatorContext={{}}
          onChange={(data) => {
            args.onChange(data)
          }}
        />
      )
    }
  }
