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
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within
} from '@storybook/test'
import { http, HttpResponse } from 'msw'
import React from 'react'
import styled from 'styled-components'
import {
  defineConditional,
  field,
  FieldType,
  FieldConfig
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

const searchFields: FieldConfig[] = [
  {
    id: 'child.brn-search',
    type: FieldType.SEARCH,
    label: {
      defaultMessage: 'Birth registration number',
      description: 'BRN for child',
      id: 'event.birth.child.brn.label'
    },
    placeholder: {
      defaultMessage: 'Enter birth registration number',
      description: 'Placeholder for BRN search',
      id: 'event.birth.child.brn.placeholder'
    },
    helperText: {
      defaultMessage: 'Enter a 10-digit birth registration number',
      description: 'Helper text for BRN search',
      id: 'event.birth.child.brn.helper'
    },
    configuration: {
      validation: {
        validator: defineConditional({
          type: 'string',
          pattern: '^[0-9]{10}$',
          description: 'Must be numeric and 10 digits long'
        }),
        message: {
          defaultMessage: 'Invalid value',
          description: 'Error message for invalid value',
          id: 'form.validation.invalid'
        }
      },
      indicators: {
        loading: {
          defaultMessage: 'Validating...',
          description: 'Loading indicator',
          id: 'story.searchField.indicators.loading'
        },
        confirmButton: {
          defaultMessage: 'Confirm',
          description: 'Confirm button text',
          id: 'story.searchField.indicators.confirmButton'
        }
      },
      query: {
        type: 'or' as const,
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
  },
  {
    id: 'child.name',
    type: FieldType.NAME,
    required: true,
    parent: field('child.brn-search'),
    value: field('child.brn-search').getByPath([
      'data',
      'firstResult',
      'declaration',
      'child.name'
    ]),
    hideLabel: true,
    label: {
      defaultMessage: "child's name",
      description: 'This is the label for the field',
      id: 'story.child.field.name.label'
    }
  }
]

export const InvalidValue_NoRecordsFound: StoryObj<typeof FormFieldGenerator> =
  {
    name: 'Invalid value - No records found',
    parameters: {
      chromatic: {
        disableSnapshot: true
      },
      layout: 'centered',
      msw: {
        handlers: {
          nidApi: [
            http.post('/api/events/events/search', async () => {
              await new Promise((resolve) => setTimeout(resolve, 2000))
              return HttpResponse.json({
                results: [],
                total: 0
              })
            })
          ]
        }
      }
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)

      await userEvent.type(
        await canvas.findByTestId('text__firstname'),
        'firstname'
      )

      await userEvent.type(
        await canvas.findByTestId('text__surname'),
        'surname'
      )

      await userEvent.type(
        await canvas.findByTestId('search-input'),
        '456988542'
      )

      await canvas.findByTestId('search-input-error')

      await userEvent.type(await canvas.findByTestId('search-input'), '1')
      await waitFor(async () =>
        expect(
          canvas.queryByTestId('search-input-error')
        ).not.toBeInTheDocument()
      )
      await userEvent.click(
        await canvas.findByRole('button', { name: /Confirm/i })
      )
      await expect(canvas.getByText('Validating...')).toBeInTheDocument()

      await waitFor(
        async () =>
          expect(canvas.getByText('No record found')).toBeInTheDocument(),
        { timeout: 3000 }
      )

      // names should not clear because search was not successfull
      await expect(await canvas.findByTestId('text__firstname')).toHaveValue(
        'firstname'
      )
      await expect(await canvas.findByTestId('text__surname')).toHaveValue(
        'surname'
      )
    },
    render: function Component(args) {
      return (
        <StyledFormFieldGenerator
          fields={searchFields}
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
            http.post('/api/events/events/search', async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000 * 2))
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
        await canvas.findByTestId('text__firstname'),
        'firstname'
      )

      await userEvent.type(
        await canvas.findByTestId('text__surname'),
        'surname'
      )

      await userEvent.type(
        await canvas.findByTestId('search-input'),
        '6097821229'
      )
      await userEvent.click(
        await canvas.findByRole('button', { name: /Confirm/i })
      )

      await waitFor(
        async () =>
          expect(canvas.getByText('Found 1 results')).toBeInTheDocument(),
        { timeout: 3000 }
      )

      // names should clear because search was successfull
      await expect(await canvas.findByTestId('text__firstname')).toHaveValue(
        'Royal'
      )
      await expect(await canvas.findByTestId('text__surname')).toHaveValue(
        'Dietrich'
      )

      await expect(await canvas.findByTestId('search-input')).toBeDisabled()

      await fireEvent.click(await canvas.findByText('Clear'))

      await expect(
        await canvas.findByText('Clear search results?')
      ).toBeInTheDocument()
      await expect(
        await canvas.findByText('This will remove the current search results.')
      ).toBeInTheDocument()

      await fireEvent.click(await canvas.findByText('Confirm'))

      // names should clear because of the clear button
      await waitFor(
        async () =>
          expect(await canvas.findByTestId('text__firstname')).toHaveValue(''),
        { timeout: 3000 }
      )
      await expect(await canvas.findByTestId('text__surname')).toHaveValue('')
    },
    render: function Component(args) {
      return (
        <StyledFormFieldGenerator
          fields={searchFields}
          id="my-form"
          validatorContext={{}}
          onChange={(data) => {
            args.onChange(data)
          }}
        />
      )
    }
  }

export const TimeOut: StoryObj<typeof FormFieldGenerator> = {
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    msw: {
      handlers: {
        nidApi: [
          http.post('/api/events/events/search', async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000 * 100))
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

    await waitFor(
      async () => expect(canvas.getByText('Timed out')).toBeInTheDocument(),
      { timeout: 20000 }
    )
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={searchFields}
        id="my-form"
        validatorContext={{}}
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}
export const HttpError: StoryObj<typeof FormFieldGenerator> = {
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    msw: {
      handlers: {
        nidApi: [
          http.post('/api/events/events/search', () => {
            return HttpResponse.text('Internal Server Error', { status: 500 })
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

    await waitFor(
      async () =>
        expect(
          canvas.getByText('An error occurred while fetching data')
        ).toBeInTheDocument(),
      { timeout: 5000 }
    )
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={searchFields}
        id="my-form"
        validatorContext={{}}
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}
