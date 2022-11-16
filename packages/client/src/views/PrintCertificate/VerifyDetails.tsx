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
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import { GetDeclarationInfo } from '@client/views/PrintCertificate/DeclarationInfo'
import { useIntl } from 'react-intl'
import gql from 'graphql-tag'
import { Query } from '@client/components/Query'
import { useParams } from 'react-router'
import { gqlToDraftTransformer } from '@client/transformer'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getDraftDeclarationData } from '@client/views/RecordAudit/utils'
import { IDeclaration } from '@client/declarations'
import {
  Spinner,
  ErrorToastNotification
} from '@opencrvs/components/lib/interface'
import { buttonMessages, errorMessages } from '@client/i18n/messages'
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import styled from '@client/styledComponents'
import { Event } from '@client/utils/gateway'
import { IFormFieldValue, IFormSectionData } from '@client/forms'

const FullPageCenter = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};

  & > :only-child {
    margin-top: -36px;
  }
`
function toString(delimiter = '', ...values: IFormFieldValue[]): string {
  return values.map((v) => v.toString()).join(delimiter)
}

function getEvent(event: string): Event {
  switch (event) {
    case 'DEATH':
      return Event.Death
    case 'BIRTH':
    default:
      return Event.Birth
  }
}
const VERIFY_QUERY = gql`
  query fetchRegistration($id: ID!) {
    fetchRegistration(id: $id) {
      id
      history {
        action
        date
        user {
          name {
            use
            firstNames
            familyName
          }
        }
      }
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
          gender
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
          return (
            <FullPageCenter>
              <Spinner id="verify-details-loading" />
            </FullPageCenter>
          )
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
          const registerFormForEvent = registerForm[getEvent(event)]
          const regStatus = data.fetchRegistration.registration?.status[0]?.type
          const draftDeclarationData = gqlToDraftTransformer(
            registerFormForEvent,
            data.fetchRegistration,
            offlineData
          )
          const declarationData = {
            ...getDraftDeclarationData(
              {
                id,
                data: draftDeclarationData,
                event: getEvent(event),
                registrationStatus: regStatus
              } as IDeclaration,
              offlineData,
              intl,
              data.fetchRegistration.registration?.trackingId ?? ''
            ),
            status: regStatus
          }

          const templateInfo = {
            registrationLocation: toString(
              ', ',
              draftDeclarationData.template?.registrationCentre,
              draftDeclarationData.template?.registrationLGA,
              draftDeclarationData.template?.registrationState
            ),
            registrationDate:
              draftDeclarationData.template?.registrationDate?.toString(),
            certificateDate:
              draftDeclarationData.template?.certificateDate?.toString(),
            registrar: draftDeclarationData.template?.registrarName?.toString(),
            childGender: (
              draftDeclarationData.template?.informantGender as IFormSectionData
            )?.defaultMessage?.toString()
          }

          return (
            <Content
              title={declarationData.name}
              icon={() => (
                <DeclarationIcon color={STATUSTOCOLOR[regStatus] || 'green'} />
              )}
              size={ContentSize.LARGE}
              topActionButtons={[]}
              showTitleOnMobile
            >
              <GetDeclarationInfo
                isDownloaded
                actions={[]}
                intl={intl}
                declaration={declarationData}
                additionalInfo={templateInfo}
                order={[
                  'status',
                  'type',
                  'trackingId',
                  getEvent(event) === Event.Death ? 'drn' : 'brn',
                  'registrationLocation',
                  'registrationDate',
                  'childGender',
                  'dateOfBirth',
                  'placeOfBirth',
                  'registrar',
                  'certificateDate'
                ]}
              />
            </Content>
          )
        } else return null
      }}
    </Query>
  )
}
