/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { DeclarationIcon, Cross } from '@opencrvs/components/lib/icons'
import { IconButton } from '@opencrvs/components/lib/buttons'
import { GetDeclarationInfo } from '@client/views/RecordAudit/DeclarationInfo'
import { useIntl } from 'react-intl'
import gql from 'graphql-tag'
import { Query } from '@client/components/Query'
import { useParams } from 'react-router'
import { gqlToDraftTransformer } from '@client/transformer'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { camelCase } from 'lodash'
import { getDraftDeclarationData } from '@client/views/RecordAudit/utils'
import { IDeclaration } from '@client/declarations'
import {
  Spinner,
  ErrorToastNotification
} from '@opencrvs/components/lib/interface'
import { buttonMessages, errorMessages } from '@client/i18n/messages'

const VERIFY_QUERY = gql`
  query fetchRegistration($id: ID!) {
    fetchRegistration(id: $id) {
      id
      registration {
        id
        type
        informantType
        contactPhoneNumber
        trackingId
        registrationNumber
        status {
          type
          office {
            name
            alias
            address {
              district
              state
            }
          }
        }
      }
      ... on BirthRegistration {
        child {
          id
          name {
            use
            firstNames
            familyName
          }
          birthDate
        }
        mother {
          name {
            use
            firstNames
            familyName
          }
        }
        father {
          name {
            use
            firstNames
            familyName
          }
        }
        informant {
          relationship
          otherRelationship
          individual {
            name {
              use
              firstNames
              familyName
            }
          }
        }
        eventLocation {
          id
          type
          description
          address {
            line
            district
            state
            city
            postalCode
            country
          }
        }
      }
      ... on DeathRegistration {
        deceased {
          id
          name {
            use
            firstNames
            familyName
          }
        }
      }
    }
  }
`
export function VerifyDetails() {
  const intl = useIntl()
  const { id } = useParams()
  const offlineData = useSelector(getOfflineData)
  const registerForm = useSelector(getRegisterForm)

  return (
    <Query query={VERIFY_QUERY} variables={{ id }}>
      {({ data, loading, error, refetch }) => {
        if (loading) {
          return <Spinner id="verify-details-loading" />
        } else if (error) {
          return (
            <ErrorToastNotification
              retryButtonText={intl.formatMessage(buttonMessages.retry)}
              retryButtonHandler={() => refetch()}
            >
              {intl.formatMessage(errorMessages.pageLoadFailed)}
            </ErrorToastNotification>
          )
        } else if (data?.fetchRegistration) {
          const event = data.fetchRegistration.registration?.type ?? 'BIRTH'
          const registerFormForEvent =
            registerForm[camelCase(event) as 'birth' | 'death']
          const draftDeclarationData = gqlToDraftTransformer(
            registerFormForEvent,
            data.fetchRegistration,
            offlineData
          )
          const declarationData = getDraftDeclarationData(
            {
              id,
              data: draftDeclarationData,
              event: camelCase(event)
            } as IDeclaration,
            offlineData,
            intl,
            data.fetchRegistration.registration?.trackingId ?? ''
          )

          return (
            <Content
              title={declarationData.name}
              icon={() => <DeclarationIcon color="green" />}
              size={ContentSize.LARGE}
              topActionButtons={[
                <IconButton
                  icon={() => <Cross />}
                  onClick={() => window.close()}
                />
              ]}
              showTitleOnMobile
            >
              <GetDeclarationInfo
                isDownloaded
                actions={[]}
                intl={intl}
                declaration={{
                  id: declarationData.id,
                  status:
                    data.fetchRegistration.registration?.status[0]?.type ?? '',
                  type: declarationData.type,
                  trackingId: declarationData.trackingId,
                  brnDrn: declarationData.brnDrn,
                  dateOfBirth: declarationData.dateOfBirth,
                  placeOfBirth: declarationData.placeOfBirth,
                  informant: declarationData.informant
                }}
              />
            </Content>
          )
        } else return null
      }}
    </Query>
  )
}
