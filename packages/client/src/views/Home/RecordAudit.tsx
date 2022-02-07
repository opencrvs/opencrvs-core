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
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { ApplicationIcon } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import { goToApplicationDetails } from '@client/navigation'
import { RouteComponentProps, withRouter } from 'react-router'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { IWorkqueue, IApplication } from '@client/applications'
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
import { get } from 'lodash'
import { IFormSectionData, IContactPoint } from '@client/forms'
import { FETCH_APPLICATION_SHORT_INFO } from '@client/views/Home/queries'
import { Query } from '@client/components/Query'
import { Spinner } from '@opencrvs/components/lib/interface'

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
    margin-top: 28px;
  }
`

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
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
  workqueue: IWorkqueue
  resources: IOfflineData
  savedApplications: IApplication[]
}

interface IDispatchProps {
  goToApplicationDetails: typeof goToApplicationDetails
}

type IFullProps = IDispatchProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps & { theme: ITheme } & RouteComponentProps<{
    applicationId: string
  }>

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
  child?: { name: GQLHumanName[] }
  deceased?: { name: GQLHumanName[] }
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
  VALIDATED: 'orange',
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

const getCaptitalizedword = (word: string | undefined): string => {
  console.log(word)
  word = word && word.toUpperCase()[0] + word.toLowerCase().slice(1)
  return word || ''
}

const isBirthApplication = (
  application: GQLEventSearchSet | null
): application is GQLBirthEventSearchSet => {
  return (application && application.type === 'Birth') || false
}

const isDeathApplication = (
  application: GQLEventSearchSet | null
): application is GQLDeathEventSearchSet => {
  return (application && application.type == 'Death') || false
}

const getDraftApplicationName = (application: IApplication): string => {
  let name = ''
  const applicationName = application.data.child || application.data.deceased
  if (applicationName) {
    if (applicationName.firstNamesEng && applicationName.familyNameEng) {
      name = applicationName.firstNamesEng + ' ' + applicationName.familyNameEng
    } else {
      name =
        (applicationName.firstNamesEng as string) ||
        (applicationName.familyNameEng as string) ||
        ''
    }
  }
  return name
}

const getWQApplicationName = (application: GQLEventSearchSet): string => {
  let name = ''
  const applicationName =
    (isBirthApplication(application) &&
      application.childName &&
      application.childName[0]) ||
    (isDeathApplication(application) &&
      application.deceasedName &&
      application.deceasedName[0])

  if (applicationName) {
    if (applicationName.firstNames && applicationName.familyName) {
      name = applicationName.firstNames + ' ' + applicationName.familyName
    } else {
      name = applicationName.familyName || applicationName.firstNames || ''
    }
  }
  return name
}

const getGQLApplicationName = (application: IGQLApplication): string => {
  let name = ''
  const applicationName =
    application && application.child && application.child.name
      ? application.child.name[0]
      : application.deceased &&
        application.deceased.name &&
        application.deceased.name[0]
  if (applicationName) {
    if (
      (applicationName as GQLHumanName).firstNames &&
      (applicationName as GQLHumanName).familyName
    ) {
      name =
        (applicationName as GQLHumanName).firstNames +
        ' ' +
        (applicationName as GQLHumanName).familyName
    } else {
      name =
        (applicationName as GQLHumanName).familyName ||
        (applicationName as GQLHumanName).firstNames ||
        ''
    }
  }
  return name
}

const getLocation = (application: IApplication, props: IFullProps) => {
  let locationType = ''
  let locationId = ''
  let locationDistrict = ''
  let locationPermanent = ''
  if (
    application.event === 'death' &&
    application.data &&
    application.data.deathEvent
  ) {
    locationType =
      (application.data.deathEvent.deathPlaceAddress &&
        application.data.deathEvent.deathPlaceAddress.toString()) ||
      ''
    locationId =
      (application.data.deathEvent.deathLocation &&
        application.data.deathEvent.deathLocation.toString()) ||
      ''
    locationDistrict =
      (application.data.deathEvent.district &&
        application.data.deathEvent.district.toString()) ||
      ''
    locationPermanent =
      (application.data.deceased &&
        application.data.deceased.districtPermanent &&
        application.data.deceased.districtPermanent.toString()) ||
      ''
  } else if (application.data) {
    locationType =
      (application.data.child &&
        application.data.child.placeOfBirth.toString()) ||
      ''
    locationId =
      (application.data.child &&
        application.data.child.birthLocation &&
        application.data.child.birthLocation.toString()) ||
      ''
    locationDistrict =
      (application.data.child &&
        application.data.child.district &&
        application.data.child.district.toString()) ||
      ''
  }

  if (locationType === 'HEALTH_FACILITY') {
    const facility = get(props.resources.facilities, locationId) || ''
    return facility.alias
  }
  if (locationType === 'OTHER' || locationType === 'PRIVATE_HOME') {
    const location = get(props.resources.locations, locationDistrict) || ''
    return location.alias + ' District'
  }
  if (locationType === 'PERMANENT') {
    const district = get(props.resources.locations, locationPermanent) || ''
    return district.alias + ' District'
  }
  return ''
}

const getSavedApplications = (props: IFullProps): IApplicationData => {
  const savedApplications = props.savedApplications
  const applicationId = props.match.params.applicationId

  const applications = savedApplications
    .filter((application: IApplication) => {
      return application.id === applicationId
    })
    .map((application) => {
      const name = getDraftApplicationName(application)
      return {
        id: application.id,
        name: name,
        status:
          (application.submissionStatus &&
            application.submissionStatus.toString()) ||
          (application.registrationStatus &&
            application.registrationStatus.toString()) ||
          '',
        type: application.event || '',
        brnDrn:
          (application.data.registration &&
            application.data.registration.registrationNumber &&
            application.data.registration.registrationNumber.toString()) ||
          '',
        trackingId:
          (application.data.registration &&
            application.data.registration.trackingId &&
            application.data.registration.trackingId.toString()) ||
          '',
        dateOfBirth:
          (application.data.child &&
            application.data.child.childBirthDate &&
            application.data.child.childBirthDate.toString()) ||
          '',
        dateOfDeath:
          (application.data.deathEvent &&
            application.data.deathEvent.deathDate &&
            application.data.deathEvent.deathDate.toString()) ||
          '',
        placeOfBirth: getLocation(application, props) || '',
        placeOfDeath: getLocation(application, props) || '',
        informant:
          (application.data.registration &&
            application.data.registration.contactPoint &&
            (
              application.data.registration.contactPoint as IFormSectionData
            ).value.toString()) ||
          '',
        informantContact:
          (application.data.registration &&
            application.data.registration.contactPoint &&
            ((application.data.registration.contactPoint as IFormSectionData)
              .nestedFields as IContactPoint) &&
            (
              (application.data.registration.contactPoint as IFormSectionData)
                .nestedFields as IContactPoint
            ).registrationPhone.toString()) ||
          ''
      }
    })
  return applications[0]
}

const getWQApplication = (props: IFullProps): IApplicationData | null => {
  const applicationId = props.match.params.applicationId

  const workqueue = props.workqueue.data

  let applications: Array<
    GQLBirthEventSearchSet | GQLDeathEventSearchSet | null
  > = []

  if (workqueue.approvalTab.results)
    applications = applications.concat(workqueue.approvalTab.results)
  if (workqueue.printTab.results)
    applications = applications.concat(workqueue.printTab.results)
  if (workqueue.inProgressTab.results)
    applications = applications.concat(workqueue.inProgressTab.results)
  if (workqueue.externalValidationTab.results)
    applications = applications.concat(workqueue.externalValidationTab.results)
  if (workqueue.rejectTab.results)
    applications = applications.concat(workqueue.rejectTab.results)
  if (workqueue.reviewTab.results)
    applications = applications.concat(workqueue.reviewTab.results)
  if (workqueue.notificationTab.results)
    applications = applications.concat(workqueue.notificationTab.results)

  const specificApplication = applications.filter((application) => {
    return application && application.id === applicationId
  })[0]

  let applicationData: IApplicationData | null = null
  if (specificApplication) {
    const name = getWQApplicationName(specificApplication)

    applicationData = {
      id: specificApplication.id,
      name: name,
      type: (specificApplication.type && specificApplication.type) || '',
      status: specificApplication.registration?.status || '',
      trackingId: specificApplication.registration?.trackingId || '',
      dateOfBirth: '',
      placeOfBirth: '',
      informant: ''
    }
  }

  return applicationData
}

const getGQLApplication = (data: IGQLApplication): IApplicationData => {
  const application: IApplicationData = {
    id: data.id,
    type: data.registration?.type,
    status: data.registration?.status[0].type,
    trackingId: data.registration?.trackingId,
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
  }
  return application
}

const getApplicationInfo = (
  props: IFullProps,
  application: IApplicationData,
  isDownloaded: boolean
) => {
  let informant =
    application.informant && getCaptitalizedword(application.informant)

  const status = getCaptitalizedword(application.status).split('_')
  let finalStatus = status[0]
  if (status[1]) finalStatus += ' ' + status[1]

  if (application.informantContact) {
    informant =
      informant + ' . ' + getCaptitalizedword(application.informantContact)
  }

  let info: ILabel = {
    status: application.status && finalStatus,
    type: application.type && getCaptitalizedword(application.type),
    trackingId: application.trackingId
  }

  if (info.type === 'Birth') {
    if (application.brnDrn) {
      info = {
        ...info,
        brn: application.brnDrn
      }
    }
    info = {
      ...info,
      dateOfBirth: application.dateOfBirth,
      placeOfBirth: application.placeOfBirth,
      informant: informant
    }
  } else if (info.type === 'Death') {
    if (application.brnDrn) {
      info = {
        ...info,
        drn: application.brnDrn
      }
    }
    info = {
      ...info,
      dateOfDeath: application.dateOfDeath,
      placeOfDeath: application.placeOfDeath,
      informant: informant
    }
  }
  return (
    <>
      {Object.entries(info).map(([key, value]) => {
        return (
          <InfoContainer key={key}>
            <KeyContainer>{KEY_LABEL[key]}</KeyContainer>
            <ValueContainer value={value}>
              {value ? (
                key === 'dateOfBirth' || key === 'dateOfDeath' ? (
                  moment(new Date(value)).format('MMMM DD, YYYY')
                ) : (
                  value
                )
              ) : isDownloaded ? (
                NO_DATA_LABEL[key]
              ) : (
                <GreyedInfo />
              )}
            </ValueContainer>
          </InfoContainer>
        )
      })}
    </>
  )
}

export const ShowRecordAudit = (props: IFullProps) => {
  const applicationId = props.match.params.applicationId
  let application: IApplicationData | null
  application = getSavedApplications(props)
  const isDownloaded = application ? true : false
  if (!isDownloaded) {
    application = getWQApplication(props)
  }
  return (
    <div id={'recordAudit'}>
      <Header />
      <Navigation />
      <BodyContainer>
        {application ? (
          <Content
            title={application.name || 'No name provided'}
            titleColor={application.name ? 'copy' : 'grey600'}
            size={'large'}
            icon={() => (
              <ApplicationIcon
                color={
                  STATUSTOCOLOR[(application && application.status) || 'DRAFT']
                }
              />
            )}
          >
            {getApplicationInfo(props, application, isDownloaded)}
          </Content>
        ) : (
          <Query
            query={FETCH_APPLICATION_SHORT_INFO}
            variables={{
              id: applicationId
            }}
          >
            {({
              loading,
              error,
              data
            }: {
              loading: any
              data?: any
              error?: any
            }) => {
              if (error) {
                console.log(error)
              }
              if (loading) {
                return (
                  <StyledSpinner
                    id="field-agent-home-spinner"
                    baseColor={props.theme.colors.background}
                  />
                )
              }
              return (
                <>
                  <Content
                    title={getGQLApplicationName(data.fetchRegistration)}
                    size={'large'}
                    icon={() => (
                      <ApplicationIcon
                        color={
                          STATUSTOCOLOR[
                            getGQLApplication(data.fetchRegistration).status ||
                              'DRAFT'
                          ]
                        }
                      />
                    )}
                  >
                    {getApplicationInfo(
                      props,
                      getGQLApplication(data.fetchRegistration),
                      isDownloaded
                    )}
                  </Content>
                </>
              )
            }}
          </Query>
        )}
      </BodyContainer>
    </div>
  )
}

function mapStateToProps(state: IStoreState): IStateProps {
  return {
    workqueue: state.workqueueState.workqueue,
    resources: getOfflineData(state),
    savedApplications:
      state.applicationsState.applications &&
      state.applicationsState.applications
  }
}

export const RecordAudit = connect<
  IStateProps,
  IDispatchProps,
  {},
  IStoreState
>(mapStateToProps, {
  goToApplicationDetails
})(injectIntl(withTheme(withRouter(ShowRecordAudit))))
