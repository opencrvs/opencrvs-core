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
import { TableView } from '@opencrvs/components/lib/interface/TableView'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { Navigation } from '@client/components/interface/Navigation'
import { AvatarSmall } from '@client/components/Avatar'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { ApplicationIcon, Edit } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import {
  goToApplicationDetails,
  goBack as goBackAction,
  goToRegistrarHomeTab,
  goToPage,
  goToCertificateCorrection,
  goToPrintCertificate
} from '@client/navigation'
import { RouteComponentProps } from 'react-router'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor
} from 'react-intl'
import {
  IWorkqueue,
  IApplication,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS,
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
import { Spinner } from '@opencrvs/components/lib/interface'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import {
  PrimaryButton,
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import {
  constantsMessages,
  userMessages,
  buttonMessages
} from '@client/i18n/messages'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { getLanguage } from '@client/i18n/selectors'
import {
  getIndividualNameObj,
  IAvatar,
  IUserDetails
} from '@client/utils/userUtils'
import {
  IFormSectionData,
  IContactPoint,
  CorrectionSection,
  Action
} from '@client/forms'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'

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

const LargeGreyedInfo = styled.div`
  height: 231px;
  background-color: ${({ theme }) => theme.colors.greyInfo};
  max-width: 100%;
  border-radius: 4px;
  margin: 15px 0px;
`

const ReviewButton = styled(PrimaryButton)`
  height: 40px;
`

const NameAvatar = styled.span`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

const Heading = styled.h4`
  margin-bottom: 0px !important;
`

interface IStateProps {
  userDetails: IUserDetails | null
  language: string
  workqueue: IWorkqueue
  resources: IOfflineData
  savedApplications: IApplication[]
  outboxApplications: IApplication[]
}

interface IDispatchProps {
  goToApplicationDetails: typeof goToApplicationDetails
  goBack: typeof goBackAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToPage: typeof goToPage
  clearCorrectionChange: typeof clearCorrectionChange
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToPrintCertificate: typeof goToPrintCertificate
}

type IFullProps = IDispatchProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps & { theme: ITheme } & RouteComponentProps<
    {
      applicationId: string
    },
    {},
    { isNavigatedInsideApp: boolean }
  >

interface ILabel {
  [key: string]: string | undefined
}

interface IStatus {
  [key: string]: MessageDescriptor
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

const APPLICATION_STATUS_LABEL: IStatus = {
  IN_PROGRESS: {
    defaultMessage: 'In progress',
    description: 'The title of In progress',
    id: 'regHome.inProgress'
  },
  DECLARED: {
    defaultMessage: 'Application started',
    description: 'Label for table header column Application started',
    id: 'constants.applicationStarted'
  },
  WAITING_VALIDATION: {
    defaultMessage: 'Waiting for validation',
    description: 'A label for waitingValidated',
    id: 'constants.waitingValidated'
  },
  VALIDATED: {
    id: 'constants.validated',
    defaultMessage: 'Validated',
    description: 'A label for validated'
  },
  REGISTERED: {
    defaultMessage: 'Application registered',
    description: 'Label for date of registration in work queue list item',
    id: 'regHome.table.label.registeredDate'
  },
  CERTIFIED: {
    defaultMessage: 'Certified',
    description: 'Label for registration status certified',
    id: 'regHome.certified'
  },
  REJECTED: {
    id: 'constants.rejected',
    defaultMessage: 'Rejected',
    description: 'A label for rejected'
  },
  DOWNLOADED: {
    defaultMessage: 'Downloaded',
    description: 'Label for application download status Downloaded',
    id: 'constants.downloaded'
  },
  REQUESTED_CORRECTION: {
    id: 'correction.request',
    defaultMessage: 'Requested correction',
    description: 'Status for application being requested for correction'
  },
  DECLARATION_UPDATED: {
    defaultMessage: 'Updated',
    description: 'Application has been updated',
    id: 'constants.updated'
  },
  ARCHIVE_DECLARATION: {
    defaultMessage: 'Archived',
    description: 'Application has been archived',
    id: 'constants.archived_declaration'
  }
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

const getDraftApplicationName = (application: IApplication): string => {
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
    name = [applicationName.firstNames, applicationName.familyName]
      .filter((part) => Boolean(part))
      .join(' ')
  }
  return name
}

const getLocation = (application: IApplication, props: IFullProps) => {
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
    const facility = props.resources.facilities[locationId] || ''
    return facility?.alias + ' District'
  }
  if (locationType === 'OTHER' || locationType === 'PRIVATE_HOME') {
    const location = props.resources.locations[locationDistrict] || ''
    return location?.alias + ' District'
  }
  if (locationType === 'PERMANENT') {
    const district = props.resources.locations[locationPermanent] || ''
    return district?.alias + ' District'
  }
  return ''
}

const getSavedApplications = (props: IFullProps): IApplicationData => {
  const savedApplications = props.savedApplications
  const applicationId = props.match.params.applicationId

  const applications = savedApplications
    .filter((application: IApplication) => {
      return (
        application.id === applicationId ||
        application.compositionId === applicationId
      )
    })
    .map((application) => {
      const name = getDraftApplicationName(application)
      return {
        id: application.id,
        name: name,
        status:
          application.submissionStatus?.toString() ||
          application.registrationStatus?.toString() ||
          '',
        type: application.event || '',
        brnDrn:
          application.data?.registration?.registrationNumber?.toString() || '',
        trackingId:
          application.data?.registration?.trackingId?.toString() || '',
        dateOfBirth: application.data?.child?.childBirthDate?.toString() || '',
        dateOfDeath: application.data?.deathEvent?.deathDate?.toString() || '',
        placeOfBirth: getLocation(application, props) || '',
        placeOfDeath: getLocation(application, props) || '',
        informant:
          ((application.data?.registration?.contactPoint as IFormSectionData)
            ?.value as string) || '',
        informantContact:
          ((
            (application.data?.registration?.contactPoint as IFormSectionData)
              ?.nestedFields as IContactPoint
          )?.registrationPhone as string) || ''
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

  if (workqueue.approvalTab.results) {
    applications = applications.concat(workqueue.approvalTab.results)
  }
  if (workqueue.printTab.results) {
    applications = applications.concat(workqueue.printTab.results)
  }
  if (workqueue.inProgressTab.results) {
    applications = applications.concat(workqueue.inProgressTab.results)
  }
  if (workqueue.externalValidationTab.results) {
    applications = applications.concat(workqueue.externalValidationTab.results)
  }
  if (workqueue.rejectTab.results) {
    applications = applications.concat(workqueue.rejectTab.results)
  }
  if (workqueue.reviewTab.results) {
    applications = applications.concat(workqueue.reviewTab.results)
  }
  if (workqueue.notificationTab.results) {
    applications = applications.concat(workqueue.notificationTab.results)
  }

  const specificApplication = applications.find((application) => {
    return application && application.id === applicationId
  })

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

const getApplicationInfo = (
  props: IFullProps,
  application: IApplicationData,
  isDownloaded: boolean
) => {
  let informant = getCaptitalizedWord(application?.informant)

  const status = getCaptitalizedWord(application?.status).split('_')
  let finalStatus = status[0]
  if (status[1]) finalStatus += ' ' + status[1]

  if (application?.informantContact) {
    informant =
      informant + ' . ' + getCaptitalizedWord(application.informantContact)
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

const showReviewButton = (application: IApplicationData, props: IFullProps) => {
  const { id, type } = application || {}
  const { intl, userDetails } = props

  const foundApplication = props.outboxApplications.find(
    (app) => app.id === application.id
  )
  const isDownloaded =
    foundApplication?.downloadStatus == DOWNLOAD_STATUS.DOWNLOADED

  if (!userDetails || !userDetails.role || !type || !isDownloaded) return <></>
  const { role } = userDetails

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [EVENT_STATUS.REJECTED],
    REGISTRATION_AGENT: [EVENT_STATUS.DECLARED],
    DISTRICT_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED],
    LOCAL_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED]
  }

  if (reviewButtonRoleStatusMap[role].includes(application?.status as string))
    return (
      <ReviewButton
        key={id}
        id="myButton"
        onClick={() => {
          props.goToPage(REVIEW_EVENT_PARENT_FORM_PAGE, id, 'review', type)
        }}
      >
        {intl.formatMessage(constantsMessages.review)}
      </ReviewButton>
    )
  return <></>
}

const shouldShowUpdateButton = (
  application: IApplicationData,
  props: IFullProps
) => {
  const { id, type } = application || {}
  const { intl, userDetails } = props

  const foundApplication = props.outboxApplications.find(
    (app) => app.id === application.id
  )
  const isDownloaded =
    foundApplication?.downloadStatus == DOWNLOAD_STATUS.DOWNLOADED ||
    foundApplication?.submissionStatus == SUBMISSION_STATUS.DRAFT

  if (!userDetails || !userDetails.role || !type || !isDownloaded) return <></>
  const { role } = userDetails

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [SUBMISSION_STATUS.DRAFT],
    REGISTRATION_AGENT: [SUBMISSION_STATUS.DRAFT, EVENT_STATUS.REJECTED],
    DISTRICT_REGISTRAR: [SUBMISSION_STATUS.DRAFT, EVENT_STATUS.REJECTED],
    LOCAL_REGISTRAR: [SUBMISSION_STATUS.DRAFT, EVENT_STATUS.REJECTED]
  }

  if (reviewButtonRoleStatusMap[role].includes(application?.status as string)) {
    let PAGE_ROUTE: string, PAGE_ID: string

    if (application?.status === SUBMISSION_STATUS.DRAFT) {
      PAGE_ID = 'preview'
      if (type.toString() === 'birth') {
        PAGE_ROUTE = DRAFT_BIRTH_PARENT_FORM_PAGE
      } else if (type.toString() === 'death') {
        PAGE_ROUTE = DRAFT_DEATH_FORM_PAGE
      }
    } else {
      PAGE_ROUTE = REVIEW_EVENT_PARENT_FORM_PAGE
      PAGE_ID = 'review'
    }
    return (
      <ReviewButton
        key={id}
        id={`update-application-${id}`}
        onClick={() => {
          props.goToPage(PAGE_ROUTE, id, PAGE_ID, type)
        }}
      >
        {intl.formatMessage(buttonMessages.update)}
      </ReviewButton>
    )
  }

  return <></>
}

const showDownloadButton = (
  application: IApplicationData,
  props: IFullProps
) => {
  const { id, type } = application || {}

  if (application == null || id == null || type == null) return <></>

  const foundApplication = props.outboxApplications.find(
    (app) => app.id === application.id
  )

  const downloadStatus =
    (foundApplication && foundApplication.downloadStatus) || undefined

  if (
    props.userDetails?.role == 'FIELD_AGENT' &&
    foundApplication?.submissionStatus == SUBMISSION_STATUS.DECLARED
  )
    return <></>
  if (
    foundApplication?.submissionStatus != SUBMISSION_STATUS.DRAFT &&
    downloadStatus != DOWNLOAD_STATUS.DOWNLOADED
  ) {
    const downLoadConfig = {
      event: type,
      compositionId: id,
      action: Action.LOAD_REVIEW_APPLICATION
    }
    return (
      <DownloadButton
        key={id}
        downloadConfigs={downLoadConfig}
        status={downloadStatus as DOWNLOAD_STATUS}
      />
    )
  }

  return <></>
}

const showPrintButton = (application: IApplicationData, props: IFullProps) => {
  const { id, type } = application || {}
  const { intl, userDetails } = props

  const foundApplication = props.outboxApplications.find(
    (app) => app.id === application.id
  )
  const isDownloaded =
    foundApplication?.downloadStatus == DOWNLOAD_STATUS.DOWNLOADED ||
    foundApplication?.submissionStatus == SUBMISSION_STATUS.DRAFT

  if (!userDetails || !userDetails.role || !type || !isDownloaded) return <></>
  const { role } = userDetails

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    REGISTRATION_AGENT: [SUBMISSION_STATUS.REGISTERED],
    DISTRICT_REGISTRAR: [SUBMISSION_STATUS.REGISTERED],
    LOCAL_REGISTRAR: [SUBMISSION_STATUS.REGISTERED]
  }

  const downloadStatus =
    (foundApplication && foundApplication.downloadStatus) || undefined
  if (
    role in reviewButtonRoleStatusMap &&
    reviewButtonRoleStatusMap[role].includes(application?.status as string)
  )
    return (
      <ReviewButton
        key={id}
        id={`print-${id}`}
        onClick={() => {
          props.goToPrintCertificate(id, type.toLocaleLowerCase())
        }}
      >
        {intl.formatMessage(buttonMessages.print)}
      </ReviewButton>
    )
  return <></>
}

const getName = (
  nameObject: Array<GQLHumanName | null>,
  avatar: IAvatar,
  language: string
) => {
  const nameObj = getIndividualNameObj(nameObject, language)
  const userName = nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''

  return (
    <NameAvatar>
      <AvatarSmall avatar={avatar} name={userName} />
      <span>{userName}</span>
    </NameAvatar>
  )
}

const getStatusLabel = (status: string, intl: IntlShape) => {
  if (status in APPLICATION_STATUS_LABEL)
    return intl.formatMessage(APPLICATION_STATUS_LABEL[status])
  return ''
}

const getHistory = (
  application: IApplicationData,
  props: IFullProps,
  isDownloaded: boolean
) => {
  const { language, intl } = props
  const savedApplication = props.outboxApplications.find(
    (app) => app.id === application.id
  )

  if (!savedApplication?.data?.history?.length)
    return (
      <>
        <hr />
        <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
        <LargeGreyedInfo />
      </>
    )

  const historyData = (
    savedApplication.data.history as unknown as { [key: string]: any }[]
  )
    .sort((fe, se) => {
      return new Date(fe.date).getTime() - new Date(se.date).getTime()
    })
    .map((item) => ({
      date: moment(item?.date).format('MMM DD, YYYY. hh:mm a'),
      action: getStatusLabel(item?.action, intl),
      user: getName(item.user.name, item.user?.avatar, language),
      type: intl.formatMessage(userMessages[item.user.role as string]),
      location: item.location.name
    }))

  const columns = [
    {
      label: 'Action',
      width: 15,
      key: 'action'
    },
    {
      label: 'Date',
      width: 20,
      key: 'date'
    },
    { label: 'By', width: 25, key: 'user', isIconColumn: true },
    { label: 'Type', width: 20, key: 'type' },
    { label: 'Location', width: 20, key: 'location' }
  ]
  return (
    <>
      <hr />
      <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
      <TableView
        id="task-history"
        noResultText=""
        hideBoxShadow={true}
        columns={columns}
        content={historyData}
        alignItemCenter={true}
        pageSize={100}
      />
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

  const actions = []
  if (
    isDownloaded &&
    application &&
    application.status === SUBMISSION_STATUS.REGISTERED
  ) {
    actions.push(
      <TertiaryButton
        id="btn-correct-record"
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <Edit />}
        onClick={() => {
          props.clearCorrectionChange(applicationId)
          props.goToCertificateCorrection(
            applicationId,
            CorrectionSection.Corrector
          )
        }}
      >
        {props.intl.formatMessage(correctionMessages.title)}
      </TertiaryButton>
    )
  }

  application && actions.push(showDownloadButton(application, props))
  application && actions.push(showReviewButton(application, props))
  application && actions.push(shouldShowUpdateButton(application, props))
  application && actions.push(showPrintButton(application, props))

  return (
    <div id={'recordAudit'}>
      <Header />
      <Navigation deselectAllTabs={true} />
      <BodyContainer>
        {application && (
          <Content
            title={application.name || 'No name provided'}
            titleColor={application.name ? 'copy' : 'grey600'}
            size={ContentSize.LARGE}
            topActionButtons={actions}
            icon={() => (
              <ApplicationIcon
                color={
                  STATUSTOCOLOR[(application && application.status) || 'DRAFT']
                }
              />
            )}
          >
            {getApplicationInfo(props, application, isDownloaded)}
            {getHistory(application, props, isDownloaded)}
          </Content>
        )}
      </BodyContainer>
    </div>
  )
}

function mapStateToProps(state: IStoreState): IStateProps {
  return {
    userDetails: state.profile.userDetails,
    language: getLanguage(state),
    workqueue: state.workqueueState.workqueue,
    resources: getOfflineData(state),
    savedApplications:
      state.applicationsState.applications &&
      state.applicationsState.applications,
    outboxApplications: state.applicationsState.applications
  }
}

export const RecordAudit = connect<
  IStateProps,
  IDispatchProps,
  RouteComponentProps<{ applicationId: string }>,
  IStoreState
>(mapStateToProps, {
  goToApplicationDetails,
  goBack: goBackAction,
  goToRegistrarHomeTab,
  goToPage,
  clearCorrectionChange,
  goToCertificateCorrection,
  goToPrintCertificate
})(injectIntl(withTheme(ShowRecordAudit)))
