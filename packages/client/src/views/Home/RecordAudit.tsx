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
import styled, { ITheme, withTheme } from '@client/styledComponents'
import {
  RotateLeft,
  Archive,
  ApplicationIcon,
  Edit
} from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import {
  goToRegistrarHomeTab,
  goToPage,
  goToCertificateCorrection,
  goToPrintCertificate
} from '@client/navigation'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor
} from 'react-intl'
import {
  archiveDeclaration,
  reinstateApplication,
  clearCorrectionChange,
  IApplication,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS
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
  LinkButton,
  PrimaryButton,
  TertiaryButton,
  ICON_ALIGNMENT,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import {
  ARCHIVED,
  DECLARED,
  VALIDATED,
  REJECTED
} from '@client/utils/constants'
import { IQueryData, EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { generateLocationName } from '@client/utils/locationUtils'
import { Query } from '@client/components/Query'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/Home/queries'
import {
  HOME,
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { createNamesMap } from '@client/utils/data-formatting'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import {
  IFormSectionData,
  IContactPoint,
  CorrectionSection,
  Action
} from '@client/forms'
import {
  constantsMessages,
  userMessages,
  buttonMessages
} from '@client/i18n/messages'
import { getLanguage } from '@client/i18n/selectors'
import {
  getIndividualNameObj,
  IAvatar,
  IUserDetails
} from '@client/utils/userUtils'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
    margin-top: 28px;
  }
`

const StyledTertiaryButton = styled(TertiaryButton)`
  align-self: center;
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
  resources: IOfflineData
  scope: Scope | null
  declarationId: string
  draft: IApplication | null
  tab: IRecordAuditTabs
  workqueueDeclaration: GQLEventSearchSet | null
}

interface IDispatchProps {
  archiveDeclaration: typeof archiveDeclaration
  reinstateApplication: typeof reinstateApplication
  clearCorrectionChange: typeof clearCorrectionChange
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
}

export type IRecordAuditTabs = keyof IQueryData | 'search'

type CMethodParams = {
  declaration: IDeclarationData
  intl: IntlShape
  userDetails: IUserDetails | null
  draft: IApplication | null
  goToPage?: typeof goToPage
  goToPrintCertificate?: typeof goToPrintCertificate
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

interface IStatus {
  [key: string]: MessageDescriptor
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
const ARCHIVABLE_STATUSES = [DECLARED, VALIDATED, REJECTED]

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
      ((declaration.data?.registration?.contactPoint as IFormSectionData)
        ?.value as string) || '',
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

const showReviewButton = ({
  declaration,
  intl,
  userDetails,
  draft,
  goToPage
}: CMethodParams) => {
  const { id, type } = declaration || {}

  const isDownloaded = draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED

  if (!userDetails || !userDetails.role || !type || !isDownloaded) return <></>
  const { role } = userDetails

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [EVENT_STATUS.REJECTED],
    REGISTRATION_AGENT: [EVENT_STATUS.DECLARED],
    DISTRICT_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED],
    LOCAL_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED]
  }

  if (reviewButtonRoleStatusMap[role].includes(declaration?.status as string))
    return (
      <ReviewButton
        key={id}
        id={`review-btn-${id}`}
        onClick={() => {
          goToPage &&
            goToPage(REVIEW_EVENT_PARENT_FORM_PAGE, id, 'review', type)
        }}
      >
        {intl.formatMessage(constantsMessages.review)}
      </ReviewButton>
    )
  return <></>
}

const shouldShowUpdateButton = ({
  declaration,
  intl,
  userDetails,
  draft,
  goToPage
}: CMethodParams) => {
  const { id, type } = declaration || {}

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  if (!userDetails || !userDetails.role || !type || !isDownloaded) return <></>
  const { role } = userDetails

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [SUBMISSION_STATUS.DRAFT],
    REGISTRATION_AGENT: [SUBMISSION_STATUS.DRAFT, EVENT_STATUS.REJECTED],
    DISTRICT_REGISTRAR: [SUBMISSION_STATUS.DRAFT, EVENT_STATUS.REJECTED],
    LOCAL_REGISTRAR: [SUBMISSION_STATUS.DRAFT, EVENT_STATUS.REJECTED]
  }

  if (reviewButtonRoleStatusMap[role].includes(declaration?.status as string)) {
    let PAGE_ROUTE: string, PAGE_ID: string

    if (declaration?.status === SUBMISSION_STATUS.DRAFT) {
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
          goToPage && goToPage(PAGE_ROUTE, id, PAGE_ID, type)
        }}
      >
        {intl.formatMessage(buttonMessages.update)}
      </ReviewButton>
    )
  }

  return <></>
}

const showDownloadButton = (
  application: IDeclarationData,
  draft: IApplication | null,
  userDetails: IUserDetails | null
) => {
  const { id, type } = application || {}

  if (application == null || id == null || type == null) return <></>

  const downloadStatus = draft?.downloadStatus || undefined

  if (
    userDetails?.role === 'FIELD_AGENT' &&
    draft?.submissionStatus === SUBMISSION_STATUS.DECLARED
  )
    return <></>
  if (
    draft?.submissionStatus !== SUBMISSION_STATUS.DRAFT &&
    downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
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

const showPrintButton = ({
  declaration,
  intl,
  userDetails,
  draft,
  goToPrintCertificate
}: CMethodParams) => {
  const { id, type } = declaration || {}

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  if (!userDetails || !userDetails.role || !type || !isDownloaded) return <></>
  const { role } = userDetails

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    REGISTRATION_AGENT: [SUBMISSION_STATUS.REGISTERED],
    DISTRICT_REGISTRAR: [SUBMISSION_STATUS.REGISTERED],
    LOCAL_REGISTRAR: [SUBMISSION_STATUS.REGISTERED]
  }

  if (
    role in reviewButtonRoleStatusMap &&
    reviewButtonRoleStatusMap[role].includes(declaration?.status as string)
  )
    return (
      <ReviewButton
        key={id}
        id={`print-${id}`}
        onClick={() => {
          goToPrintCertificate &&
            goToPrintCertificate(id, type.toLocaleLowerCase())
        }}
      >
        {intl.formatMessage(buttonMessages.print)}
      </ReviewButton>
    )
  return <></>
}

const getNameWithAvatar = (
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
      <span>
        <LinkButton
          id={'username-link'}
          onClick={() => alert('username clicked')}
          textDecoration="none"
        >
          {userName}
        </LinkButton>
      </span>
    </NameAvatar>
  )
}

const getStatusLabel = (status: string, intl: IntlShape) => {
  if (status in APPLICATION_STATUS_LABEL)
    return intl.formatMessage(APPLICATION_STATUS_LABEL[status])
  return ''
}

const getLink = (status: string) => {
  return (
    <LinkButton textDecoration="none" onClick={() => alert('link clicked')}>
      {status}
    </LinkButton>
  )
}

const getFormattedDate = (date: Date) => {
  const momentDate = moment(date)
  return (
    <>
      {momentDate.format('MMMM DD, YYYY')} &middot;{' '}
      {momentDate.format('hh.mm A')}
    </>
  )
}

const getHistory = ({ intl, draft }: CMethodParams) => {
  if (!draft?.data?.history?.length)
    return (
      <>
        <hr />
        <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
        <LargeGreyedInfo />
      </>
    )

  const historyData = (
    draft.data.history as unknown as { [key: string]: any }[]
  )
    // TODO: We need to figure out a way to sort the history in backend
    .sort((fe, se) => {
      return new Date(fe.date).getTime() - new Date(se.date).getTime()
    })
    .map((item) => ({
      date: getFormattedDate(item?.date),
      action: getLink(getStatusLabel(item?.action, intl)),
      user: getNameWithAvatar(
        item.user.name,
        item.user?.avatar,
        window.config.LANGUAGES
      ),
      type: intl.formatMessage(userMessages[item.user.role as string]),
      location: getLink(item.office.name)
    }))

  const columns = [
    {
      label: 'Action',
      width: 20,
      key: 'action'
    },
    {
      label: 'Date',
      width: 20,
      key: 'date'
    },
    { label: 'By', width: 20, key: 'user', isIconColumn: true },
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
        hideTableHeaderBorder={true}
      />
    </>
  )
}

function RecordAuditBody({
  archiveDeclaration,
  reinstateApplication,
  clearCorrectionChange,
  declaration,
  draft,
  intl,
  goToCertificateCorrection,
  goToPage,
  goToRegistrarHomeTab,
  scope,
  userDetails
}: {
  declaration: IDeclarationData
  draft: IApplication | null
  intl: IntlShape
  scope: Scope | null
  userDetails: IUserDetails | null
} & IDispatchProps) {
  const [showDialog, setShowDialog] = React.useState(false)

  const toggleDisplayDialog = () => setShowDialog((prevValue) => !prevValue)

  const userHasRegisterScope = scope && scope.includes('register')
  const userHasValidateScope = scope && scope.includes('validate')

  const actions: React.ReactElement[] = []

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  if (
    isDownloaded &&
    (userHasValidateScope || userHasRegisterScope) &&
    (declaration.status === SUBMISSION_STATUS.REGISTERED ||
      declaration.status === SUBMISSION_STATUS.CERTIFIED)
  ) {
    actions.push(
      <StyledTertiaryButton
        id="btn-correct-record"
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <Edit />}
        onClick={() => {
          clearCorrectionChange(declaration.id)
          goToCertificateCorrection(declaration.id, CorrectionSection.Corrector)
        }}
      >
        {intl.formatMessage(correctionMessages.title)}
      </StyledTertiaryButton>
    )
  }

  if (
    isDownloaded &&
    (userHasValidateScope || userHasRegisterScope) &&
    declaration.status &&
    ARCHIVABLE_STATUSES.includes(declaration.status)
  ) {
    actions.push(
      <StyledTertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        id="archive_button"
        key="archive_button"
        icon={() => <Archive />}
        onClick={toggleDisplayDialog}
      >
        {intl.formatMessage(buttonMessages.archive)}
      </StyledTertiaryButton>
    )
  }

  if (
    isDownloaded &&
    (userHasValidateScope || userHasRegisterScope) &&
    declaration.status &&
    ARCHIVED.includes(declaration.status)
  ) {
    actions.push(
      <TertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        id="reinstate_button"
        key="reinstate_button"
        icon={() => <RotateLeft />}
        onClick={toggleDisplayDialog}
      >
        {intl.formatMessage(buttonMessages.reinstate)}
      </TertiaryButton>
    )
  }

  if (!isDownloaded) {
    actions.push(showDownloadButton(declaration, draft, userDetails))
  }

  actions.push(
    showReviewButton({
      declaration,
      intl,
      userDetails,
      draft,
      goToPage
    })
  )

  actions.push(
    shouldShowUpdateButton({
      declaration,
      intl,
      userDetails,
      draft,
      goToPage
    })
  )
  actions.push(
    showPrintButton({
      declaration,
      intl,
      userDetails,
      draft,
      goToPrintCertificate
    })
  )

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
        {getHistory({ declaration, intl, draft, userDetails })}
      </Content>

      <ResponsiveModal
        title={
          declaration.status && ARCHIVED.includes(declaration.status)
            ? intl.formatMessage(
                recordAuditMessages.reinstateDeclarationDialogTitle
              )
            : intl.formatMessage(recordAuditMessages.confirmationTitle)
        }
        contentHeight={96}
        responsive={false}
        actions={[
          <TertiaryButton
            id="cancel-btn"
            key="cancel"
            onClick={toggleDisplayDialog}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          declaration.status && ARCHIVED.includes(declaration.status) ? (
            <PrimaryButton
              id="continue"
              key="continue"
              onClick={() => {
                reinstateApplication(declaration.id)
                toggleDisplayDialog()
              }}
            >
              {intl.formatMessage(
                recordAuditMessages.reinstateDeclarationDialogConfirm
              )}
            </PrimaryButton>
          ) : (
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
          )
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
  declarationId,
  draft,
  intl,
  language,
  scope,
  resources,
  tab,
  userDetails,
  workqueueDeclaration,
  ...actionProps
}: IFullProps) {
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
                {...actionProps}
                declaration={getGQLDeclaration(
                  data.fetchRegistration,
                  language
                )}
                draft={draft}
                intl={intl}
                scope={scope}
                userDetails={userDetails}
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
      {...actionProps}
      declaration={declaration}
      draft={draft}
      intl={intl}
      scope={scope}
      userDetails={userDetails}
    />
  )
}

const RecordAuditComp = (props: IFullProps) => {
  return (
    <>
      <Header />
      <Navigation deselectAllTabs={true} />
      <BodyContainer>{getBodyContent(props)}</BodyContainer>
      <NotificationToast />
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
    language: getLanguage(state),
    resources: getOfflineData(state),
    scope: getScope(state),
    tab,
    userDetails: state.profile.userDetails,
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
  reinstateApplication,
  clearCorrectionChange,
  goToCertificateCorrection,
  goToPage,
  goToPrintCertificate,
  goToRegistrarHomeTab
})(injectIntl(RecordAuditComp))
