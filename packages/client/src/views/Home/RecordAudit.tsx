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

import React from 'react'
import { Header } from '@client/components/interface/Header/Header'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { Navigation } from '@client/components/interface/Navigation'
import styled from '@client/styledComponents'
import { ApplicationIcon, Edit } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
import { goToCertificateCorrection } from '@client/navigation'
import {
  IApplication,
  SUBMISSION_STATUS,
  clearCorrectionChange
} from '@client/applications'
import { IStoreState } from '@client/store'
import {
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import moment from 'moment'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { IQueryData } from '@client/views/OfficeHome/OfficeHome'
import { generateLocationName } from '@client/utils/locationUtils'
import { Query } from '@client/components/Query'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/Home/queries'
import { Loader } from '@opencrvs/components/lib/interface'
import { HOME } from '@client/navigation/routes'
import { createNamesMap } from '@client/utils/data-formatting'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import {
  IFormSectionData,
  IContactPoint,
  CorrectionSection
} from '@client/forms'
import {
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
    margin-top: 28px;
  }
`

const InfoContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const KeyContainer = styled.div`
  width: 190px;
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.bodyBoldStyle}
`

const ValueContainer = styled.div<{ value: undefined | string }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey500 : theme.colors.grey400};
  ${({ theme }) => theme.fonts.captionBigger};
`

const GreyedInfo = styled.div`
  height: 26px;
  background-color: ${({ theme }) => theme.colors.grey300};
  max-width: 330px;
`

export type IRecordAuditTabs = keyof IQueryData | 'search'

interface IStateProps {
  declarationId: string
  draft: IApplication | null
  language: string
  resources: IOfflineData
  tab: IRecordAuditTabs
  workqueueDeclaration: GQLEventSearchSet | null
}

interface IDispatchProps {
  clearCorrectionChange: typeof clearCorrectionChange
  goToCertificateCorrection: typeof goToCertificateCorrection
}

type RouteProps = RouteComponentProps<{
  tab: IRecordAuditTabs
  declarationId: string
}>

type IFullProps = IDispatchProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps &
  RouteProps

interface ILabel {
  [key: string]: string | undefined
}

interface IDeclarationData {
  id: string
  name?: string
  status?: string
  trackingId?: string
  type?: string
  dateOfBirth?: string
  dateOfDeath?: string
  placeOfBirth?: string
  placeOfDeath?: string
  informant?: string
  informantContact?: string
  brnDrn?: string
}

interface IGQLDeclaration {
  id: string
  child?: { name: Array<GQLHumanName | null> }
  deceased?: { name: Array<GQLHumanName | null> }
  registration?: {
    trackingId: string
    type: string
    status: { type: string }[]
  }
}

const STATUSTOCOLOR: { [key: string]: string } = {
  DRAFT: 'violet',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
  REGISTERED: 'green',
  CERTIFIED: 'green',
  WAITING_VALIDATION: 'teal'
}

const getCaptitalizedWord = (word: string | undefined): string => {
  if (!word) return ''
  return word.toUpperCase()[0] + word.toLowerCase().slice(1)
}

const isBirthDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLBirthEventSearchSet => {
  return (declaration && declaration.type === 'Birth') || false
}

const isDeathDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLDeathEventSearchSet => {
  return (declaration && declaration.type === 'Death') || false
}

const getDraftDeclarationName = (declaration: IApplication) => {
  let name = ''
  let declarationName
  if (declaration.event === 'birth') {
    declarationName = declaration.data?.child
  } else {
    declarationName = declaration.data?.deceased
  }

  if (declarationName) {
    name = [declarationName.firstNamesEng, declarationName.familyNameEng]
      .filter((part) => Boolean(part))
      .join(' ')
  }
  return name
}

function notNull<T>(value: T | null): value is T {
  return value !== null
}

const getName = (name: (GQLHumanName | null)[], language: string) => {
  return createNamesMap(name.filter(notNull))[language]
}

const getLocation = (
  declaration: IApplication,
  resources: IOfflineData,
  intl: IntlShape
) => {
  let locationType = ''
  let locationId = ''
  let locationDistrict = ''
  let locationPermanent = ''
  if (declaration.event === 'death') {
    locationType =
      declaration.data?.deathEvent?.deathPlaceAddress?.toString() || ''
    locationId = declaration.data?.deathEvent?.deathLocation?.toString() || ''
    locationDistrict = declaration.data?.deathEvent?.district?.toString() || ''
    locationPermanent =
      declaration.data?.deceased?.districtPermanent?.toString() || ''
  } else {
    locationType = declaration.data?.child?.placeOfBirth?.toString() || ''
    locationId = declaration.data?.child?.birthLocation?.toString() || ''
    locationDistrict = declaration.data?.child?.district?.toString() || ''
  }

  if (locationType === 'HEALTH_FACILITY') {
    const facility = resources.facilities[locationId]
    return generateLocationName(facility, intl)
  }
  if (locationType === 'OTHER' || locationType === 'PRIVATE_HOME') {
    const location = resources.locations[locationDistrict]
    return generateLocationName(location, intl)
  }
  if (locationType === 'PERMANENT') {
    const district = resources.locations[locationPermanent]
    return generateLocationName(district, intl)
  }
  return ''
}

const getDraftDeclarationData = (
  declaration: IApplication,
  resources: IOfflineData,
  intl: IntlShape
): IDeclarationData => {
  return {
    id: declaration.id,
    name: getDraftDeclarationName(declaration),
    status:
      declaration.submissionStatus?.toString() ||
      declaration.registrationStatus?.toString() ||
      '',
    type: declaration.event || '',
    brnDrn:
      declaration.data?.registration?.registrationNumber?.toString() || '',
    trackingId: declaration.data?.registration?.trackingId?.toString() || '',
    dateOfBirth: declaration.data?.child?.childBirthDate?.toString() || '',
    dateOfDeath: declaration.data?.deathEvent?.deathDate?.toString() || '',
    placeOfBirth: getLocation(declaration, resources, intl) || '',
    placeOfDeath: getLocation(declaration, resources, intl) || '',
    informant:
      (
        declaration.data?.registration?.contactPoint as IFormSectionData
      )?.value.toString() || '',
    informantContact:
      (
        (declaration.data?.registration?.contactPoint as IFormSectionData)
          ?.nestedFields as IContactPoint
      )?.registrationPhone.toString() || ''
  }
}

const getWQDeclarationData = (
  workqueueDeclaration: GQLEventSearchSet,
  language: string
) => {
  let name = ''
  if (
    isBirthDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.childName
  ) {
    name = getName(workqueueDeclaration.childName, language)
  } else if (
    isDeathDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.deceasedName
  ) {
    name = getName(workqueueDeclaration.deceasedName, language)
  }
  return {
    id: workqueueDeclaration.id,
    name,
    type: (workqueueDeclaration.type && workqueueDeclaration.type) || '',
    status: workqueueDeclaration.registration?.status || '',
    trackingId: workqueueDeclaration.registration?.trackingId || '',
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
  }
}

const getGQLDeclaration = (
  data: IGQLDeclaration,
  language: string
): IDeclarationData => {
  let name = ''
  if (data.child) {
    name = getName(data.child.name, language)
  } else if (data.deceased) {
    name = getName(data.deceased.name, language)
  }
  return {
    id: data?.id,
    name,
    type: data?.registration?.type,
    status: data?.registration?.status[0].type,
    trackingId: data?.registration?.trackingId,
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
  }
}

const getDeclarationInfo = (
  declaration: IDeclarationData,
  isDownloaded: boolean,
  intl: IntlShape
) => {
  let informant = getCaptitalizedWord(declaration?.informant)

  const status = getCaptitalizedWord(declaration?.status).split('_')
  let finalStatus = status[0]
  if (status[1]) finalStatus += ' ' + status[1]

  if (declaration?.informantContact) {
    informant = informant + ' . ' + declaration.informantContact
  }

  let info: ILabel = {
    status: declaration?.status && finalStatus,
    type: getCaptitalizedWord(declaration?.type),
    trackingId: declaration?.trackingId
  }

  if (info.type === 'Birth') {
    if (declaration?.brnDrn) {
      info = {
        ...info,
        brn: declaration.brnDrn
      }
    }
    info = {
      ...info,
      dateOfBirth: declaration?.dateOfBirth,
      placeOfBirth: declaration?.placeOfBirth,
      informant: informant
    }
  } else if (info.type === 'Death') {
    if (declaration?.brnDrn) {
      info = {
        ...info,
        drn: declaration.brnDrn
      }
    }
    info = {
      ...info,
      dateOfDeath: declaration?.dateOfDeath,
      placeOfDeath: declaration?.placeOfDeath,
      informant: informant
    }
  }
  return (
    <>
      {Object.entries(info).map(([key, value]) => {
        return (
          <InfoContainer id={'summary'} key={key}>
            <KeyContainer id={`${key}`}>
              <KeyContainer id={`${key}`}>
                {intl.formatMessage(recordAuditMessages[key as string])}
              </KeyContainer>
            </KeyContainer>
            <ValueContainer id={`${key}_value`} value={value}>
              {value ? (
                key === 'dateOfBirth' || key === 'dateOfDeath' ? (
                  moment(new Date(value)).format('MMMM DD, YYYY')
                ) : (
                  value
                )
              ) : isDownloaded ? (
                intl.formatMessage(
                  recordAuditMessages[
                    `no${key[0].toUpperCase()}${key.slice(1)}`
                  ]
                )
              ) : (
                <GreyedInfo id={`${key}_grey`} />
              )}
            </ValueContainer>
          </InfoContainer>
        )
      })}
    </>
  )
}

function RecordAuditBody({
  clearCorrectionChange,
  declaration,
  isDownloaded = false,
  intl,
  goToCertificateCorrection
}: {
  declaration: IDeclarationData
  isDownloaded?: boolean
  intl: IntlShape
} & IDispatchProps) {
  const actions = []
  if (
    isDownloaded &&
    (declaration.status === SUBMISSION_STATUS.REGISTERED ||
      declaration.status === SUBMISSION_STATUS.CERTIFIED)
  ) {
    actions.push(
      <TertiaryButton
        id="btn-correct-record"
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <Edit />}
        onClick={() => {
          clearCorrectionChange(declaration.id)
          goToCertificateCorrection(declaration.id, CorrectionSection.Corrector)
        }}
      >
        {intl.formatMessage(correctionMessages.title)}
      </TertiaryButton>
    )
  }
  return (
    <Content
      title={declaration.name || intl.formatMessage(recordAuditMessages.noName)}
      titleColor={declaration.name ? 'copy' : 'grey600'}
      size={ContentSize.LARGE}
      topActionButtons={actions}
      icon={() => (
        <ApplicationIcon
          color={
            STATUSTOCOLOR[
              (declaration && declaration.status) || SUBMISSION_STATUS.DRAFT
            ]
          }
        />
      )}
    >
      {getDeclarationInfo(declaration, isDownloaded, intl)}
    </Content>
  )
}

function getBodyContent({
  clearCorrectionChange,
  declarationId,
  draft,
  goToCertificateCorrection,
  language,
  tab,
  intl,
  resources,
  workqueueDeclaration
}: IFullProps) {
  const actionProps = {
    clearCorrectionChange,
    goToCertificateCorrection
  }
  if (!draft && tab === 'search') {
    return (
      <>
        <Query
          query={FETCH_DECLARATION_SHORT_INFO}
          variables={{
            id: declarationId
          }}
          fetchPolicy="no-cache"
        >
          {({ loading, error, data }) => {
            if (loading) {
              return <Loader id="search_loader" marginPercent={35} />
            } else if (error) {
              return <Redirect to={HOME} />
            }
            return (
              <RecordAuditBody
                declaration={getGQLDeclaration(
                  data.fetchRegistration,
                  language
                )}
                intl={intl}
                {...actionProps}
              />
            )
          }}
        </Query>
      </>
    )
  }
  const declaration = draft
    ? getDraftDeclarationData(draft, resources, intl)
    : getWQDeclarationData(
        workqueueDeclaration as NonNullable<typeof workqueueDeclaration>,
        language
      )
  return (
    <RecordAuditBody
      declaration={declaration}
      isDownloaded={!!draft}
      intl={intl}
      {...actionProps}
    />
  )
}

const ShowRecordAudit = (props: IFullProps) => {
  return (
    <>
      <Header />
      <Navigation deselectAllTabs={true} />
      <BodyContainer>{getBodyContent(props)}</BodyContainer>
    </>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { declarationId, tab } = props.match.params
  return {
    declarationId,
    draft:
      state.applicationsState.applications.find(
        (declaration) =>
          declaration.id === declarationId ||
          declaration.compositionId === declarationId
      ) || null,
    language: state.i18n.language,
    resources: getOfflineData(state),
    tab,
    workqueueDeclaration:
      (tab !== 'search' &&
        state.workqueueState.workqueue.data[tab].results?.find(
          (gqlSearchSet) => gqlSearchSet?.id === declarationId
        )) ||
      null
  }
}

export const RecordAudit = connect<
  IStateProps,
  IDispatchProps,
  RouteProps,
  IStoreState
>(mapStateToProps, {
  clearCorrectionChange,
  goToCertificateCorrection
})(injectIntl(ShowRecordAudit))
