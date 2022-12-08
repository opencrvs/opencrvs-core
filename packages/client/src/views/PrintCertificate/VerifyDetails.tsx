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
import { Warning } from '@opencrvs/components/lib/icons'
import { CertificateInfo } from '@client/views/PrintCertificate/CertificateInfo'
import { useIntl, MessageDescriptor } from 'react-intl'
import gql from 'graphql-tag'
import { Query } from '@client/components/Query'
import { useParams } from 'react-router'
import { gqlToDraftTransformer } from '@client/transformer'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getName } from '@client/views/RecordAudit/utils'
import {
  Spinner,
  ErrorToastNotification,
  Box
} from '@opencrvs/components/lib/interface'
import {
  buttonMessages,
  errorMessages,
  constantsMessages
} from '@client/i18n/messages'
import styled from '@client/styledComponents'
import { Event } from '@client/utils/gateway'
import { startCase } from 'lodash'
import { formatAllNonStringValues } from './PDFUtils'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { formatName } from '@client/utils/name'

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
const Heading = styled.h2`
  ${({ theme }) => theme.fonts.h1};
  padding-bottom: 16px;
  border-bottom: solid 1px ${({ theme }) => theme.colors.grey200};
`
const StyledBox = styled(Box)`
  display: flex;
  margin-bottom: 16px;
  align-items: center;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
`
const GreyInfo = styled(Warning)`
  transform: rotate(0.5turn);
  path {
    fill: ${({ theme }) => theme.colors.grey500};
  }
`
const Footer = styled.div`
  border-top: 2px solid ${({ theme }) => theme.colors.grey200};
  ${({ theme }) => theme.fonts.reg14}
  font-style:italic;
  padding-top: 16px;
`

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
            middleNames
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
          timestamp
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
            middleNames
            familyName
          }
          birthDate
          gender
        }
        mother {
          name {
            use
            firstNames
            middleNames
            familyName
          }
        }
        father {
          name {
            use
            firstNames
            middleNames
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
              middleNames
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
            middleNames
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
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  let bottomActionButtons: JSX.Element[] | undefined = []
  let footer: null | JSX.Element = null
  if (isStandalone) {
    bottomActionButtons = [
      <PrimaryButton onClick={() => (window.location.href = '/')}>
        {intl.formatMessage(buttonMessages.close)}
      </PrimaryButton>
    ]
  } else {
    footer = (
      <Footer>
        {intl.formatMessage(constantsMessages.verfiyQrCodeBrowserInstruction)}
      </Footer>
    )
  }

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
          const declaration = gqlToDraftTransformer(
            registerFormForEvent,
            data.fetchRegistration,
            offlineData
          )

          return (
            <Content
              size={ContentSize.LARGE}
              showTitleOnMobile
              bottomActionButtons={bottomActionButtons}
            >
              <StyledBox>
                <IconContainer>
                  <GreyInfo />
                </IconContainer>
                <span>
                  {intl.formatMessage(constantsMessages.verifyQrCodeInfo, {
                    event
                  })}
                </span>
              </StyledBox>
              <Heading>
                {formatName(
                  getName(data.fetchRegistration.child.name, intl.locale)
                )}
              </Heading>
              <CertificateInfo
                data={formatAllNonStringValues(
                  declaration.template as Record<
                    string,
                    string | MessageDescriptor | Array<string>
                  >
                )}
              />
              {footer}
            </Content>
          )
        } else return null
      }}
    </Query>
  )
}
