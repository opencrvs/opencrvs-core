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
import { Content } from '@opencrvs/components/lib/interface/Content'
import { Navigation } from '@client/components/interface/Navigation'
import styled from '@client/styledComponents'
import { ApplicationIcon } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import {
  goToApplicationDetails,
  goBack as goBackAction,
  goToRegistrarHomeTab
} from '@client/navigation'
import { RouteComponentProps, Redirect } from 'react-router'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
import { IApplication } from '@client/applications'
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
import { IFormSectionData, IContactPoint } from '@client/forms'
import { IQueryData } from '@client/views/OfficeHome/OfficeHome'
import { generateLocationName } from '@client/utils/locationUtils'
import { Query } from '@client/components/Query'
import { FETCH_APPLICATION_SHORT_INFO } from '@client/views/Home/queries'
import { Loader } from '@opencrvs/components/lib/interface'
import { HOME } from '@client/navigation/routes'
import { createNamesMap } from '@client/utils/data-formatting'

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
  &:last-child {
    margin-bottom: 0px;
  }
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

interface IStateProps {
  applicationId: string
  draft: IApplication | null
  language: string
  resources: IOfflineData
  tab: keyof IQueryData | 'search'
  workqueueApplication: GQLEventSearchSet | null
}

interface IDispatchProps {
  goToApplicationDetails: typeof goToApplicationDetails
  goBack: typeof goBackAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
}

type RouteProps = RouteComponentProps<{
  tab: keyof IQueryData | 'search'
  applicationId: string
}>

type IFullProps = IDispatchProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps &
  RouteProps

interface ILabel {
  [key: string]: string | undefined
}

interface IApplicationData {
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

interface IGQLApplication {
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

const KEY_LABEL: ILabel = {
  status: 'Status',
  type: 'Event',
  trackingId: 'Tracking ID',
  dateOfBirth: 'Date of birth',
  dateOfDeath: 'Date of death',
  placeOfBirth: 'Place of birth',
  placeOfDeath: 'Place of death',
  informant: 'Informant',
  brn: 'BRN',
  drn: 'DRN'
}

const NO_DATA_LABEL: ILabel = {
  status: 'No status',
  type: 'No event',
  trackingId: 'No tracking id',
  dateOfBirth: 'No date of birth',
  dateOfDeath: 'No date of death',
  placeOfBirth: 'No place of birth',
  placeOfDeath: 'No place of death',
  informant: 'No informant'
}

const getCaptitalizedWord = (word: string | undefined): string => {
  if (!word) return ''
  return word.toUpperCase()[0] + word.toLowerCase().slice(1)
}

const isBirthApplication = (
  application: GQLEventSearchSet | null
): application is GQLBirthEventSearchSet => {
  return (application && application.type === 'Birth') || false
}

const isDeathApplication = (
  application: GQLEventSearchSet | null
): application is GQLDeathEventSearchSet => {
  return (application && application.type === 'Death') || false
}

const getDraftApplicationName = (application: IApplication) => {
  let name = ''
  let applicationName
  if (application.event === 'birth') {
    applicationName = application.data?.child
  } else {
    applicationName = application.data?.deceased
  }

  if (applicationName) {
    name = [applicationName.firstNamesEng, applicationName.familyNameEng]
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
  application: IApplication,
  resources: IOfflineData,
  intl: IntlShape
) => {
  let locationType = ''
  let locationId = ''
  let locationDistrict = ''
  let locationPermanent = ''
  if (application.event === 'death') {
    locationType =
      application.data?.deathEvent?.deathPlaceAddress?.toString() || ''
    locationId = application.data?.deathEvent?.deathLocation?.toString() || ''
    locationDistrict = application.data?.deathEvent?.district?.toString() || ''
    locationPermanent =
      application.data?.deceased?.districtPermanent?.toString() || ''
  } else {
    locationType = application.data?.child?.placeOfBirth?.toString() || ''
    locationId = application.data?.child?.birthLocation?.toString() || ''
    locationDistrict = application.data?.child?.district?.toString() || ''
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

const getDraftApplicationData = (
  application: IApplication,
  resources: IOfflineData,
  intl: IntlShape
): IApplicationData => {
  return {
    id: application.id,
    name: getDraftApplicationName(application),
    status:
      application.submissionStatus?.toString() ||
      application.registrationStatus?.toString() ||
      '',
    type: application.event || '',
    brnDrn:
      application.data?.registration?.registrationNumber?.toString() || '',
    trackingId: application.data?.registration?.trackingId?.toString() || '',
    dateOfBirth: application.data?.child?.childBirthDate?.toString() || '',
    dateOfDeath: application.data?.deathEvent?.deathDate?.toString() || '',
    placeOfBirth: getLocation(application, resources, intl) || '',
    placeOfDeath: getLocation(application, resources, intl) || '',
    informant:
      (
        application.data?.registration?.contactPoint as IFormSectionData
      )?.value.toString() || '',
    informantContact:
      (
        (application.data?.registration?.contactPoint as IFormSectionData)
          ?.nestedFields as IContactPoint
      )?.registrationPhone.toString() || ''
  }
}

const getWQApplicationData = (
  workqueueApplication: GQLEventSearchSet,
  language: string
) => {
  let name = ''
  if (
    isBirthApplication(workqueueApplication) &&
    workqueueApplication.childName
  ) {
    name = getName(workqueueApplication.childName, language)
  } else if (
    isDeathApplication(workqueueApplication) &&
    workqueueApplication.deceasedName
  ) {
    name = getName(workqueueApplication.deceasedName, language)
  }
  return {
    id: workqueueApplication.id,
    name,
    type: (workqueueApplication.type && workqueueApplication.type) || '',
    status: workqueueApplication.registration?.status || '',
    trackingId: workqueueApplication.registration?.trackingId || '',
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
  }
}

const getGQLApplication = (
  data: IGQLApplication,
  language: string
): IApplicationData => {
  let name = ''
  if (data.child) {
    name = getName(data.child.name, language)
  } else if (data.deceased) {
    name = getName(data.deceased.name, language)
  }
  const application: IApplicationData = {
    id: data?.id,
    name,
    type: data?.registration?.type,
    status: data?.registration?.status[0].type,
    trackingId: data?.registration?.trackingId,
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
  }
  return application
}

const getApplicationInfo = (
  application: IApplicationData,
  isDownloaded: boolean
) => {
  let informant = getCaptitalizedWord(application?.informant)

  const status = getCaptitalizedWord(application?.status).split('_')
  let finalStatus = status[0]
  if (status[1]) finalStatus += ' ' + status[1]

  if (application?.informantContact) {
    informant = informant + ' . ' + application.informantContact
  }

  let info: ILabel = {
    status: application?.status && finalStatus,
    type: getCaptitalizedWord(application?.type),
    trackingId: application?.trackingId
  }

  if (info.type === 'Birth') {
    if (application?.brnDrn) {
      info = {
        ...info,
        brn: application.brnDrn
      }
    }
    info = {
      ...info,
      dateOfBirth: application?.dateOfBirth,
      placeOfBirth: application?.placeOfBirth,
      informant: informant
    }
  } else if (info.type === 'Death') {
    if (application?.brnDrn) {
      info = {
        ...info,
        drn: application.brnDrn
      }
    }
    info = {
      ...info,
      dateOfDeath: application?.dateOfDeath,
      placeOfDeath: application?.placeOfDeath,
      informant: informant
    }
  }
  return (
    <>
      {Object.entries(info).map(([key, value]) => {
        return (
          <InfoContainer id={'summary'} key={key}>
            <KeyContainer id={`${key}`}>{KEY_LABEL[key]}</KeyContainer>
            <ValueContainer id={`${key}_value`} value={value}>
              {value ? (
                key === 'dateOfBirth' || key === 'dateOfDeath' ? (
                  moment(new Date(value)).format('MMMM DD, YYYY')
                ) : (
                  value
                )
              ) : isDownloaded ? (
                NO_DATA_LABEL[key]
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

function RecordAuditBody(application: IApplicationData, isDownloaded = false) {
  return (
    <Content
      title={application.name || 'No name provided'}
      titleColor={application.name ? 'copy' : 'grey600'}
      size={'large'}
      icon={() => (
        <ApplicationIcon
          color={STATUSTOCOLOR[(application && application.status) || 'DRAFT']}
        />
      )}
    >
      {getApplicationInfo(application, isDownloaded)}
    </Content>
  )
}

function getBodyContent({
  applicationId,
  draft,
  language,
  tab,
  intl,
  resources,
  workqueueApplication
}: IFullProps) {
  if (!draft && tab === 'search') {
    return (
      <>
        <Query
          query={FETCH_APPLICATION_SHORT_INFO}
          variables={{
            id: applicationId
          }}
          fetchPolicy="no-cache"
        >
          {({
            loading,
            error,
            data
          }: {
            loading: any
            error?: any
            data: any
          }) => {
            if (loading) {
              return <Loader id="search_loader" marginPercent={35} />
            } else if (error) {
              return <Redirect to={HOME} />
            }
            return RecordAuditBody(
              getGQLApplication(data.fetchRegistration, language)
            )
          }}
        </Query>
      </>
    )
  }
  const application = draft
    ? getDraftApplicationData(draft, resources, intl)
    : getWQApplicationData(
        workqueueApplication as NonNullable<typeof workqueueApplication>,
        language
      )
  return RecordAuditBody(application, !!draft)
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
  const { applicationId, tab } = props.match.params
  return {
    applicationId,
    draft:
      state.applicationsState.applications.find(
        (application) =>
          application.id === applicationId ||
          application.compositionId === applicationId
      ) || null,
    language: state.i18n.language,
    resources: getOfflineData(state),
    tab,
    workqueueApplication:
      (tab !== 'search' &&
        state.workqueueState.workqueue.data[tab].results?.find(
          (gqlSearchSet) => gqlSearchSet?.id === applicationId
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
  goToApplicationDetails,
  goBack: goBackAction,
  goToRegistrarHomeTab
})(injectIntl(ShowRecordAudit))
