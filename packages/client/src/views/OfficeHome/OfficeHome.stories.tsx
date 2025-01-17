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
import { graphql, HttpResponse } from 'msw'
import React from 'react'
import { OfficeHome } from './OfficeHome'
import { RegistrationHomeQuery } from '@client/utils/gateway'

const meta: Meta<typeof OfficeHome> = {
  title: 'OfficeHome',
  component: OfficeHome,
  decorators: [(Story) => <Story />]
}

export default meta

type Story = StoryObj<typeof OfficeHome>

export const WithData: Story = {
  parameters: {
    msw: {
      handlers: {
        registrationHome: [
          graphql.query('registrationHome', () => {
            return HttpResponse.json({
              data: {
                inProgressTab: {
                  totalItems: 1,
                  results: [
                    {
                      id: '54df1180-8eda-4ba2-955e-91511b42924b',
                      type: 'death',
                      registration: {
                        status: 'IN_PROGRESS',
                        contactRelationship: 'GRANDSON',
                        contactNumber: null,
                        trackingId: 'DLK5DGE',
                        eventLocationId: null,
                        registrationNumber: null,
                        registeredLocationId:
                          '028d2c85-ca31-426d-b5d1-2cef545a4902',
                        duplicates: null,
                        createdAt: '1736928593176',
                        modifiedAt: '1736928603287',
                        assignment: {
                          practitionerId:
                            '6eca185f-7ec5-4f20-ae40-d9234a459a73',
                          firstName: 'Felix',
                          lastName: 'Katongo',
                          officeName: 'Ibombo District Office',
                          avatarURL:
                            'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name=Felix Katongo',
                          __typename: 'AssignmentData'
                        },
                        __typename: 'RegistrationSearchSet'
                      },
                      operationHistories: [
                        {
                          operationType: 'IN_PROGRESS',
                          operatedOn: '2025-01-15T08:09:52.768Z',
                          __typename: 'OperationHistorySearchSet'
                        }
                      ],
                      dateOfDeath: null,
                      deceasedName: [
                        {
                          firstNames: 'Joshua',
                          middleName: '',
                          familyName: null,
                          use: 'en',
                          __typename: 'HumanName'
                        },
                        {
                          firstNames: '',
                          middleName: '',
                          familyName: null,
                          use: 'fr',
                          __typename: 'HumanName'
                        }
                      ],
                      __typename: 'DeathEventSearchSet'
                    }
                  ],
                  __typename: 'EventSearchResultSet'
                },
                notificationTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                },
                reviewTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                },
                rejectTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                },
                approvalTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                },
                externalValidationTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                },
                printTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                },
                issueTab: {
                  totalItems: 0,
                  results: [],
                  __typename: 'EventSearchResultSet'
                }
              }
            } satisfies { data: RegistrationHomeQuery })
          })
        ]
      }
    }
  }
}

export const WithoutData: Story = {}
