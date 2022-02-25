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
import { Archive, ApplicationIcon, Edit } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
import {
  goToCertificateCorrection,
  goToRegistrarHomeTab
} from '@client/navigation'
import {
  archiveDeclaration,
  clearCorrectionChange,
  IApplication,
  SUBMISSION_STATUS
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
import { ResponsiveModal, Loader } from '@opencrvs/components/lib/interface'
import { getScope } from '@client/profile/profileSelectors'
import { Scope } from '@client/utils/authUtils'
import {
  TertiaryButton,
  ICON_ALIGNMENT,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages/buttons'
import {
  ARCHIVED,
  DECLARED,
  VALIDATED,
  REJECTED
} from '@client/utils/constants'
import { IQueryData } from '@client/views/OfficeHome/OfficeHome'
import { generateLocationName } from '@client/utils/locationUtils'
import { Query } from '@client/components/Query'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/Home/queries'
import { HOME } from '@client/navigation/routes'
import { createNamesMap } from '@client/utils/data-formatting'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import {
  IFormSectionData,
  IContactPoint,
  CorrectionSection
} from '@client/forms'
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
  color: ${({ theme }) => theme.colors.grey};
  ${({ theme }) => theme.fonts.bodyBoldStyle}
`

const ValueContainer = styled.div<{ value: undefined | string }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey : theme.colors.grey600};
  ${({ theme }) => theme.fonts.captionBigger};
`

const GreyedInfo = styled.div`
  height: 26px;
  background-color: ${({ theme }) => theme.colors.greyInfo};
  max-width: 330px;
`

export type IRecordAuditTabs = keyof IQueryData | 'search'

interface IStateProps {
  declarationId: string
  draft: IApplication | null
  language: string
  resources: IOfflineData
  scope: Scope | null
  tab: IRecordAuditTabs
  workqueueDeclaration: GQLEventSearchSet | null
}

interface IDispatchProps {
  archiveDeclaration: typeof archiveDeclaration
  clearCorrectionChange: typeof clearCorrectionChange
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
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
  ARCHIVED: 'grey',
  DRAFT: 'violet',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
  REGISTERED: 'green',
  CERTIFIED: 'green',
  WAITING_VALIDATION: 'teal'
}

const ARCHIVABLE_STATUSES = [DECLARED, VALIDATED, REJECTED]

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
  const finalStatus = status.reduce(
    (accum, cur, idx) => (idx > 0 ? accum + ' ' + cur : cur),
    ''
  )

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
                {intl.formatMessage(recordAuditMessages[key])}
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
  scope,
  archiveDeclaration,
  goToCertificateCorrection,
  goToRegistrarHomeTab
}: {
  declaration: IDeclarationData
  isDownloaded?: boolean
  intl: IntlShape
  scope: Scope | null
} & IDispatchProps) {
  const [showDialog, setShowDialog] = React.useState(false)

  const toggleDisplayDialog = () => setShowDialog((prevValue) => !prevValue)

  const userHasRegisterScope = scope && scope.includes('register')
  const userHasValidateScope = scope && scope.includes('validate')

  const actions: React.ReactElement[] = []

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

  if (
    isDownloaded &&
    (userHasValidateScope || userHasRegisterScope) &&
    declaration.status &&
    ARCHIVABLE_STATUSES.includes(declaration.status)
  ) {
    actions.push(
      <TertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        id="archive_button"
        key="archive_button"
        icon={() => <Archive />}
        onClick={toggleDisplayDialog}
      >
        {intl.formatMessage(buttonMessages.archive)}
      </TertiaryButton>
    )
  }

  return (
    <>
      <Content
        title={
          declaration.name || intl.formatMessage(recordAuditMessages.noName)
        }
        titleColor={declaration.name ? 'copy' : 'grey600'}
        size={ContentSize.LARGE}
        topActionButtons={actions}
        icon={() => (
          <ApplicationIcon
            isArchive={declaration?.status === ARCHIVED}
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
      <ResponsiveModal
        title={intl.formatMessage(recordAuditMessages.confirmationTitle)}
        contentHeight={96}
        responsive={false}
        actions={[
          <TertiaryButton
            id="archive_cancel"
            key="archive_cancel"
            onClick={toggleDisplayDialog}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          <DangerButton
            id="archive_confirm"
            key="archive_confirm"
            onClick={() => {
              archiveDeclaration(declaration.id)
              toggleDisplayDialog()
              goToRegistrarHomeTab('review')
            }}
          >
            {intl.formatMessage(buttonMessages.archive)}
          </DangerButton>
        ]}
        show={showDialog}
        handleClose={toggleDisplayDialog}
      >
        {intl.formatMessage(recordAuditMessages.confirmationBody)}
      </ResponsiveModal>
    </>
  )
}

function getBodyContent({
  archiveDeclaration,
  clearCorrectionChange,
  declarationId,
  draft,
  intl,
  language,
  goToCertificateCorrection,
  goToRegistrarHomeTab,
  scope,
  tab,
  resources,
  workqueueDeclaration
}: IFullProps) {
  const actionProps = {
    archiveDeclaration,
    clearCorrectionChange,
    goToCertificateCorrection,
    goToRegistrarHomeTab
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
                scope={scope}
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
      scope={scope}
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
    scope: getScope(state),
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
  archiveDeclaration,
  clearCorrectionChange,
  goToCertificateCorrection,
  goToRegistrarHomeTab
})(injectIntl(ShowRecordAudit))
