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
import styled from '@client/styledComponents'
import {
  RotateLeft,
  Archive,
  DeclarationIcon,
  Edit,
  BackArrow
} from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import {
  goToRegistrarHomeTab,
  goToPage,
  goToCertificateCorrection,
  goToPrintCertificate,
  goToUserProfile,
  goToTeamUserList,
  IDynamicValues
} from '@client/navigation'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor
} from 'react-intl'
import {
  archiveDeclaration,
  reinstateDeclaration,
  clearCorrectionChange,
  IDeclaration,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { IStoreState } from '@client/store'
import {
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData, ILocation } from '@client/offline/reducer'
import {
  ResponsiveModal,
  Loader,
  ISearchLocation,
  ListTable,
  ColumnContentAlignment,
  PageHeader,
  IPageHeaderProps
} from '@opencrvs/components/lib/interface'
import { getScope } from '@client/profile/profileSelectors'
import { Scope } from '@client/utils/authUtils'
import {
  LinkButton,
  PrimaryButton,
  TertiaryButton,
  ICON_ALIGNMENT,
  DangerButton,
  CircleButton
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
  Action,
  IForm,
  IFormSection,
  IFormSectionGroup,
  IFormField
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
import {
  messages as correctionMessages,
  messages
} from '@client/i18n/messages/views/correction'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
import { isEmpty, get, find, has, flatten, values } from 'lodash'
import { IRegisterFormState } from '@client/forms/register/reducer'
import { goBack } from 'connected-react-router'
import { getFieldValue } from './utils'
import { CollectorRelationLabelArray } from '@client/forms/correction/corrector'
import format, { formatLongDate } from '@client/utils/date-formatting'

const DesktopHeader = styled(Header)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const MobileHeader = styled(PageHeader)`
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
  }
`

const StyledTertiaryButton = styled(TertiaryButton)`
  align-self: center;
`

const InfoContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  flex-flow: row;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-flow: column;
  }
`
const IconDiv = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const BackButtonDiv = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: inline;
  }
`

const BackButton = styled(CircleButton)`
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  margin-left: -8px;
`

const KeyContainer = styled.div`
  width: 190px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold16}
`

const ValueContainer = styled.div<{ value: undefined | string }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey600 : theme.colors.grey400};
  ${({ theme }) => theme.fonts.reg16};
`

const GreyedInfo = styled.div`
  height: 26px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 330px;
`

const LargeGreyedInfo = styled.div`
  height: 231px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 100%;
  border-radius: 4px;
  margin: 15px 0px;
`

const DesktopDiv = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const MobileDiv = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: inline;
  }
`

const ShowOnMobile = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: flex;
    margin-left: auto;
    margin-bottom: 32px;
    margin-top: 32px;
  }
`

const NameAvatar = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

const Heading = styled.h4`
  margin-bottom: 0px !important;
`

const CLinkButton = styled(LinkButton)`
  width: fit-content;
  display: inline-block;
`

interface IOutputInput {
  item: string
  original: string
  edit: string
}
interface IActionDetailsData {
  [key: string]: any
}
interface IStateProps {
  userDetails: IUserDetails | null
  language: string
  resources: IOfflineData
  scope: Scope | null
  declarationId: string
  draft: IDeclaration | null
  tab: IRecordAuditTabs
  workqueueDeclaration: GQLEventSearchSet | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
}

interface IDispatchProps {
  archiveDeclaration: typeof archiveDeclaration
  reinstateDeclaration: typeof reinstateDeclaration
  clearCorrectionChange: typeof clearCorrectionChange
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToUserProfile: typeof goToUserProfile
  goToTeamUserList: typeof goToTeamUserList
  goBack: typeof goBack
}

export type IRecordAuditTabs = keyof IQueryData | 'search'

type CMethodParams = {
  declaration: IDeclarationData
  intl: IntlShape
  userDetails: IUserDetails | null
  draft: IDeclaration | null
  goToPage?: typeof goToPage
  goToPrintCertificate?: typeof goToPrintCertificate
  goToUserProfile?: typeof goToUserProfile
  goToTeamUserList?: typeof goToTeamUserList
}

type RouteProps = RouteComponentProps<{
  tab: IRecordAuditTabs
  declarationId: string
}>

type IFullProps = IDispatchProps & IStateProps & IntlShapeProps & RouteProps

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

export const STATUSTOCOLOR: { [key: string]: string } = {
  ARCHIVED: 'grey',
  DRAFT: 'purple',
  IN_PROGRESS: 'purple',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
  REGISTERED: 'green',
  CERTIFIED: 'green',
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange'
}

const ARCHIVABLE_STATUSES = [DECLARED, VALIDATED, REJECTED]

const DECLARATION_STATUS_LABEL: IStatus = {
  REINSTATED: {
    defaultMessage: 'Reinstated to ',
    description: 'The prefix for reinstated declaration',
    id: 'recordAudit.history.reinstated.prefix'
  },
  ARCHIVED: {
    defaultMessage: 'Archived',
    description: 'Label for registration status archived',
    id: 'recordAudit.history.archived'
  },
  IN_PROGRESS: {
    defaultMessage: 'Sent incomplete',
    description: 'Declaration submitted without completing the required fields',
    id: 'constants.sent_incomplete'
  },
  DECLARED: {
    defaultMessage: 'Declaration started',
    description: 'Label for registration status declared',
    id: 'recordAudit.history.declared'
  },
  WAITING_VALIDATION: {
    defaultMessage: 'Waiting for validation',
    description: 'Label for registration status waitingValidation',
    id: 'recordAudit.history.waitingValidation'
  },
  VALIDATED: {
    defaultMessage: 'Sent for approval',
    description: 'The title of sent for approvals tab',
    id: 'regHome.sentForApprovals'
  },
  REGISTERED: {
    defaultMessage: 'Declaration registered',
    description: 'Label for registration status registered',
    id: 'recordAudit.history.registered'
  },
  CERTIFIED: {
    defaultMessage: 'Certified',
    description: 'Label for registration status certified',
    id: 'recordAudit.history.certified'
  },
  REJECTED: {
    defaultMessage: 'Rejected',
    description: 'A label for registration status rejected',
    id: 'recordAudit.history.rejected'
  },
  DOWNLOADED: {
    defaultMessage: 'Downloaded',
    description: 'Label for declaration download status Downloaded',
    id: 'recordAudit.history.downloaded'
  },
  REQUESTED_CORRECTION: {
    defaultMessage: 'Requested correction',
    description: 'Status for declaration being requested for correction',
    id: 'recordAudit.history.requestedCorrection'
  },
  DECLARATION_UPDATED: {
    defaultMessage: 'Updated declaration',
    description: 'Declaration has been updated',
    id: 'updated_declaration'
  }
}

const getCaptitalizedWord = (word: string | undefined): string => {
  if (!word) return ''
  return word.toUpperCase()[0] + word.toLowerCase().slice(1)
}

const removeUnderscore = (word: string): string => {
  const wordArray = word.split('_')
  const finalWord = wordArray.reduce(
    (accum, cur, idx) => (idx > 0 ? accum + ' ' + cur : cur),
    ''
  )
  return finalWord
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

const getDraftDeclarationName = (declaration: IDeclaration) => {
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
  declaration: IDeclaration,
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
  declaration: IDeclaration,
  resources: IOfflineData,
  intl: IntlShape,
  trackingId: string
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
    trackingId: trackingId,
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
  language: string,
  trackingId: string
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
    id: workqueueDeclaration?.id,
    name,
    type: (workqueueDeclaration?.type && workqueueDeclaration.type) || '',
    status: workqueueDeclaration?.registration?.status || '',
    trackingId: trackingId,
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
  intl: IntlShape,
  actions: React.ReactElement[]
) => {
  let informant = getCaptitalizedWord(declaration?.informant)

  const finalStatus = removeUnderscore(getCaptitalizedWord(declaration?.status))

  if (declaration?.informantContact && informant) {
    informant = informant + ' · ' + declaration.informantContact
  }

  let info: ILabel = {
    status: declaration?.status && finalStatus,
    type: getCaptitalizedWord(declaration?.type),
    trackingId: declaration?.trackingId
  }

  if (info.type === 'Birth') {
    if (declaration?.brnDrn) {
      info.brn = declaration.brnDrn
    } else if (!isDownloaded) {
      info.brn = ''
    }
    info = {
      ...info,
      dateOfBirth: declaration?.dateOfBirth,
      placeOfBirth: declaration?.placeOfBirth,
      informant: removeUnderscore(informant)
    }
  } else if (info.type === 'Death') {
    if (declaration?.brnDrn) {
      info.drn = declaration.brnDrn
    } else if (!isDownloaded) {
      info.drn = ''
    }
    info = {
      ...info,
      dateOfDeath: declaration?.dateOfDeath,
      placeOfDeath: declaration?.placeOfDeath,
      informant: removeUnderscore(informant)
    }
  }
  const mobileActions = actions.map((action, index) => (
    <MobileDiv key={index}>{action}</MobileDiv>
  ))
  return (
    <>
      <div>
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
                    format(new Date(value), 'MMMM dd, yyyy')
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
      </div>
      <ShowOnMobile>{mobileActions.map((action) => action)}</ShowOnMobile>
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
    FIELD_AGENT: [],
    REGISTRATION_AGENT: [EVENT_STATUS.DECLARED],
    DISTRICT_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED],
    LOCAL_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED]
  }

  if (reviewButtonRoleStatusMap[role].includes(declaration?.status as string))
    return (
      <PrimaryButton
        key={id}
        id={`review-btn-${id}`}
        onClick={() => {
          goToPage &&
            goToPage(REVIEW_EVENT_PARENT_FORM_PAGE, id, 'review', type)
        }}
      >
        {intl.formatMessage(constantsMessages.review)}
      </PrimaryButton>
    )
  return <></>
}

const showUpdateButton = ({
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

  const updateButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [SUBMISSION_STATUS.DRAFT],
    REGISTRATION_AGENT: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ],
    DISTRICT_REGISTRAR: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ],
    LOCAL_REGISTRAR: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ]
  }

  if (updateButtonRoleStatusMap[role].includes(declaration?.status as string)) {
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
      <PrimaryButton
        key={id}
        id={`update-application-${id}`}
        size={'medium'}
        onClick={() => {
          goToPage && goToPage(PAGE_ROUTE, id, PAGE_ID, type)
        }}
      >
        {intl.formatMessage(buttonMessages.update)}
      </PrimaryButton>
    )
  }

  return <></>
}

const showDownloadButton = (
  declaration: IDeclarationData,
  draft: IDeclaration | null,
  userDetails: IUserDetails | null
) => {
  const { id, type } = declaration || {}

  if (declaration === null || id === null || type === null) return <></>

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
      event: type as string,
      compositionId: id,
      action: Action.LOAD_REVIEW_DECLARATION
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

  const printButtonRoleStatusMap: { [key: string]: string[] } = {
    REGISTRATION_AGENT: [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED
    ],
    DISTRICT_REGISTRAR: [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED
    ],
    LOCAL_REGISTRAR: [SUBMISSION_STATUS.REGISTERED, SUBMISSION_STATUS.CERTIFIED]
  }

  if (
    role in printButtonRoleStatusMap &&
    printButtonRoleStatusMap[role].includes(declaration?.status as string)
  )
    return (
      <PrimaryButton
        key={id}
        id={`print-${id}`}
        onClick={() => {
          goToPrintCertificate &&
            goToPrintCertificate(id, type.toLocaleLowerCase())
        }}
      >
        {intl.formatMessage(buttonMessages.print)}
      </PrimaryButton>
    )
  return <></>
}

const getNameWithAvatar = (
  id: string,
  nameObject: Array<GQLHumanName | null>,
  avatar: IAvatar,
  language: string,
  goToUser?: typeof goToUserProfile
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
          onClick={() => {
            goToUser && goToUser(id)
          }}
        >
          {userName}
        </LinkButton>
      </span>
    </NameAvatar>
  )
}

const getStatusLabel = (
  status: string,
  reinstated: boolean,
  intl: IntlShape
) => {
  if (status in DECLARATION_STATUS_LABEL)
    return (
      (reinstated
        ? intl.formatMessage(DECLARATION_STATUS_LABEL['REINSTATED'])
        : '') + intl.formatMessage(DECLARATION_STATUS_LABEL[status])
    )
  return ''
}

const getLink = (status: string, onClick: () => void) => {
  return (
    <LinkButton style={{ textAlign: 'left' }} onClick={onClick}>
      {status}
    </LinkButton>
  )
}

const getFormattedDate = (date: Date) => {
  return formatLongDate(
    date.toLocaleString(),
    window.config.LANGUAGES,
    'MMMM dd, yyyy · hh.mm a'
  )
}

const GetHistory = ({
  intl,
  draft,
  goToUserProfile,
  goToTeamUserList,
  toggleActionDetails
}: CMethodParams & {
  toggleActionDetails: (actionItem: IActionDetailsData) => void
}) => {
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
      action: getLink(getStatusLabel(item?.action, item.reinstated, intl), () =>
        toggleActionDetails(item)
      ),
      user: getNameWithAvatar(
        item.user.id,
        item.user.name,
        item.user?.avatar,
        window.config.LANGUAGES,
        goToUserProfile
      ),
      type: intl.formatMessage(userMessages[item.user.role as string]),
      location: getLink(item.office.name, () => {
        goToTeamUserList &&
          goToTeamUserList({
            id: item.office.id,
            searchableText: item.office.name,
            displayLabel: item.office.name
          } as ISearchLocation)
      })
    }))

  const columns = [
    {
      label: 'Action',
      width: 22,
      key: 'action'
    },
    {
      label: 'Date',
      width: 22,
      key: 'date'
    },
    {
      label: 'By',
      width: 22,
      key: 'user',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    { label: 'Type', width: 15, key: 'type' },
    { label: 'Location', width: 20, key: 'location' }
  ]
  return (
    <>
      <hr />
      <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
      <TableView
        id="task-history"
        fixedWidth={1065}
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

const ActionDetailsModalListTable = (
  actionDetailsData: IActionDetailsData,
  registerForm: IForm,
  intl: IntlShape,
  offlineData: Partial<IOfflineData>
) => {
  const [currentPage, setCurrentPage] = React.useState(1)
  if (registerForm === undefined) return []

  const sections = registerForm?.sections || []
  const commentsColumn = [
    {
      key: 'comment',
      label: intl.formatMessage(constantsMessages.comment),
      width: 100
    }
  ]
  const reasonColumn = [
    {
      key: 'text',
      label: intl.formatMessage(constantsMessages.reason),
      width: 100
    }
  ]
  const declarationUpdatedColumns = [
    {
      key: 'item',
      label: intl.formatMessage(messages.correctionSummaryItem),
      width: 33.33
    },
    {
      key: 'original',
      label: intl.formatMessage(messages.correctionSummaryOriginal),
      width: 33.33
    },
    { key: 'edit', label: 'Edit', width: 33.33 }
  ]
  const certificateCollector = [
    {
      key: 'collector',
      label: intl.formatMessage(certificateMessages.printedOnCollection),
      width: 100
    }
  ]
  const certificateCollectorVerified = [
    {
      key: 'hasShowedVerifiedDocument',
      label: intl.formatMessage(certificateMessages.collectorIDCheck),
      width: 100
    }
  ]

  const dataChange = (
    actionDetailsData: IActionDetailsData
  ): IDynamicValues[] => {
    const result: IDynamicValues[] = []
    actionDetailsData.input.forEach((item: { [key: string]: any }) => {
      const editedValue = actionDetailsData.output.find(
        (oi: { valueId: string }) => oi.valueId === item.valueId
      )

      const section = find(
        sections,
        (section) => section.id === item.valueCode
      ) as IFormSection

      const indexes: string[] = item.valueId.split('.')

      if (indexes.length > 1) {
        const [parentField, , nestedField] = indexes

        const nestedFields = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField)

        const fieldObj = flatten(values(nestedFields?.nestedFields)).find(
          (field) => field.name === nestedField
        ) as IFormField

        result.push({
          item: intl.formatMessage(fieldObj.label) || 'Not Found',
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      } else {
        const [parentField] = indexes

        const fieldObj = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField) as IFormField

        result.push({
          item: intl.formatMessage(fieldObj.label) || 'Not Found',
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      }
    })

    return result
  }
  const certificateCollectorData = (
    actionDetailsData: IActionDetailsData
  ): IDynamicValues[] => {
    if (!actionDetailsData.certificates) return []
    return actionDetailsData.certificates
      .map((certificate: IDynamicValues) => {
        if (!certificate) return

        const name = getIndividualNameObj(
          certificate.collector.individual.name,
          window.config.LANGUAGES
        )
        const collectorLabel = () => {
          const relation = CollectorRelationLabelArray.find(
            (labelItem) =>
              labelItem.value === certificate.collector.relationship
          )
          const collectorName = `${name?.firstNames} ${name?.familyName}`
          if (relation)
            return `${collectorName} (${intl.formatMessage(relation.label)})`
          return collectorName
        }

        return {
          hasShowedVerifiedDocument: certificate.hasShowedVerifiedDocument
            ? intl.formatMessage(certificateMessages.idCheckVerify)
            : intl.formatMessage(certificateMessages.idCheckWithoutVerify),
          collector: collectorLabel()
        }
      })
      .filter((item: IDynamicValues) => null != item)
  }

  const declarationUpdates = dataChange(actionDetailsData)
  const collectorData = certificateCollectorData(actionDetailsData)
  const pageChangeHandler = (cp: number) => setCurrentPage(cp)
  return (
    <>
      {/* For Reject Reason */}
      {actionDetailsData.statusReason &&
        actionDetailsData.action === SUBMISSION_STATUS.REJECTED && (
          <ListTable
            noResultText=" "
            hideBoxShadow={true}
            columns={reasonColumn}
            content={[actionDetailsData.statusReason]}
          ></ListTable>
        )}

      {/* For Comments */}
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={commentsColumn}
        content={actionDetailsData.comments}
      ></ListTable>

      {/* For Data Updated */}
      {declarationUpdates.length > 0 && (
        <ListTable
          noResultText=" "
          hideBoxShadow={true}
          columns={declarationUpdatedColumns}
          content={declarationUpdates}
          pageSize={10}
          totalItems={declarationUpdates.length}
          currentPage={currentPage}
          onPageChange={pageChangeHandler}
        ></ListTable>
      )}

      {/* For Certificate */}
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={certificateCollector}
        content={collectorData}
        pageSize={10}
        totalItems={collectorData.length}
        currentPage={currentPage}
        onPageChange={pageChangeHandler}
      ></ListTable>
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={certificateCollectorVerified}
        content={collectorData}
        pageSize={10}
        totalItems={collectorData.length}
        currentPage={currentPage}
        onPageChange={pageChangeHandler}
      ></ListTable>
    </>
  )
}

const ActionDetailsModal = ({
  show,
  actionDetailsData,
  toggleActionDetails,
  intl,
  goToUser,
  registerForm,
  offlineData
}: {
  show: boolean
  actionDetailsData: IActionDetailsData
  toggleActionDetails: (param: IActionDetailsData | null) => void
  intl: IntlShape
  goToUser: typeof goToUserProfile
  registerForm: IForm
  offlineData: Partial<IOfflineData>
}) => {
  if (isEmpty(actionDetailsData)) return <></>

  const title =
    (DECLARATION_STATUS_LABEL[actionDetailsData?.action] &&
      intl.formatMessage(
        DECLARATION_STATUS_LABEL[actionDetailsData?.action]
      )) ||
    ''

  const nameObj = getIndividualNameObj(
    actionDetailsData.user.name,
    window.config.LANGUAGES
  )
  const userName = nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''

  return (
    <ResponsiveModal
      actions={[]}
      handleClose={() => toggleActionDetails(null)}
      show={show}
      responsive={true}
      title={title}
      width={1024}
      autoHeight={true}
    >
      <>
        <div>
          <CLinkButton
            onClick={() => {
              goToUser && goToUser(actionDetailsData.user.id)
            }}
          >
            {userName}
          </CLinkButton>
          <span> — {getFormattedDate(actionDetailsData.date)}</span>
        </div>
        {ActionDetailsModalListTable(
          actionDetailsData,
          registerForm,
          intl,
          offlineData
        )}
      </>
    </ResponsiveModal>
  )
}

function RecordAuditBody({
  archiveDeclaration,
  reinstateDeclaration,
  clearCorrectionChange,
  declaration,
  draft,
  tab,
  intl,
  goToCertificateCorrection,
  goToPrintCertificate,
  goToPage,
  goToRegistrarHomeTab,
  scope,
  userDetails,
  registerForm,
  goToUserProfile,
  goToTeamUserList,
  goBack,
  offlineData
}: {
  declaration: IDeclarationData
  draft: IDeclaration | null
  intl: IntlShape
  scope: Scope | null
  userDetails: IUserDetails | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
  tab: IRecordAuditTabs
} & IDispatchProps) {
  const [showDialog, setShowDialog] = React.useState(false)
  const [showActionDetails, setActionDetails] = React.useState(false)
  const [actionDetailsData, setActionDetailsData] = React.useState({})

  if (!registerForm.registerForm || !declaration.type) return <></>

  const toggleActionDetails = (actionItem: IActionDetailsData | null) => {
    actionItem && setActionDetailsData(actionItem)
    setActionDetails((prevValue) => !prevValue)
  }
  const toggleDisplayDialog = () => setShowDialog((prevValue) => !prevValue)

  const userHasRegisterScope = scope && scope.includes('register')
  const userHasValidateScope = scope && scope.includes('validate')

  const actions: React.ReactElement[] = []
  const mobileActions: React.ReactElement[] = []
  const desktopActionsView: React.ReactElement[] = []

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
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (
    isDownloaded &&
    declaration.status &&
    ARCHIVABLE_STATUSES.includes(declaration.status) &&
    (userHasRegisterScope ||
      (userHasValidateScope && declaration.status !== VALIDATED))
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
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (
    isDownloaded &&
    (userHasValidateScope || userHasRegisterScope) &&
    declaration.status &&
    ARCHIVED.includes(declaration.status)
  ) {
    actions.push(
      <StyledTertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        id="reinstate_button"
        key="reinstate_button"
        icon={() => <RotateLeft />}
        onClick={toggleDisplayDialog}
      >
        {intl.formatMessage(buttonMessages.reinstate)}
      </StyledTertiaryButton>
    )
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (!isDownloaded) {
    actions.push(showDownloadButton(declaration, draft, userDetails))
    desktopActionsView.push(actions[actions.length - 1])
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
  if (actions[actions.length - 1].key) {
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }

  actions.push(
    showUpdateButton({
      declaration,
      intl,
      userDetails,
      draft,
      goToPage
    })
  )

  if (actions[actions.length - 1].key) {
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }

  actions.push(
    showPrintButton({
      declaration,
      intl,
      userDetails,
      draft,
      goToPrintCertificate,
      goToTeamUserList
    })
  )
  if (actions[actions.length - 1].key) {
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }

  let regForm: IForm
  const eventType = declaration.type
  if (eventType in registerForm.registerForm)
    regForm = get(registerForm.registerForm, eventType)
  else regForm = registerForm.registerForm['birth']

  const actionDetailsModalProps = {
    show: showActionDetails,
    actionDetailsData,
    toggleActionDetails,
    intl,
    goToUser: goToUserProfile,
    registerForm: regForm,
    offlineData
  }

  const mobileProps: IPageHeaderProps = {
    id: 'mobileHeader',
    mobileTitle:
      declaration.name || intl.formatMessage(recordAuditMessages.noName),
    mobileLeft: [
      <BackButtonDiv>
        <BackButton onClick={() => goBack()}>
          <BackArrow />
        </BackButton>
      </BackButtonDiv>
    ],
    mobileRight: desktopActionsView
  }

  return (
    <>
      <MobileHeader {...mobileProps} />
      <Content
        title={
          declaration.name || intl.formatMessage(recordAuditMessages.noName)
        }
        titleColor={declaration.name ? 'copy' : 'grey600'}
        size={ContentSize.LARGE}
        topActionButtons={desktopActionsView}
        icon={() => (
          <DeclarationIcon
            isArchive={declaration?.status === ARCHIVED}
            color={
              STATUSTOCOLOR[
                (declaration && declaration.status) || SUBMISSION_STATUS.DRAFT
              ]
            }
          />
        )}
      >
        {getDeclarationInfo(declaration, isDownloaded, intl, mobileActions)}
        {GetHistory({
          declaration,
          intl,
          draft,
          userDetails,
          goToUserProfile,
          goToTeamUserList,
          toggleActionDetails
        })}
      </Content>
      <ActionDetailsModal {...actionDetailsModalProps} />
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
                reinstateDeclaration(declaration.id)
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
        {declaration.status && ARCHIVED.includes(declaration.status)
          ? intl.formatMessage(
              recordAuditMessages.reinstateDeclarationDialogDescription
            )
          : intl.formatMessage(recordAuditMessages.confirmationBody)}
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
                key={`record-audit-${declarationId}`}
                {...actionProps}
                declaration={getGQLDeclaration(
                  data.fetchRegistration,
                  language
                )}
                tab={tab}
                draft={draft}
                intl={intl}
                scope={scope}
                userDetails={userDetails}
                goBack={goBack}
              />
            )
          }}
        </Query>
      </>
    )
  }

  const trackingId =
    draft?.data?.registration?.trackingId?.toString() ||
    workqueueDeclaration?.registration?.trackingId ||
    ''

  const declaration = draft
    ? getDraftDeclarationData(draft, resources, intl, trackingId)
    : getWQDeclarationData(
        workqueueDeclaration as NonNullable<typeof workqueueDeclaration>,
        language,
        trackingId
      )
  return (
    <RecordAuditBody
      key={`record-audit-${declarationId}`}
      {...actionProps}
      declaration={declaration}
      draft={draft}
      tab={tab}
      intl={intl}
      scope={scope}
      userDetails={userDetails}
    />
  )
}

const RecordAuditComp = (props: IFullProps) => {
  return (
    <>
      <DesktopHeader />
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
      state.declarationsState.declarations.find(
        (declaration) =>
          declaration.id === declarationId ||
          declaration.compositionId === declarationId
      ) || null,
    language: getLanguage(state),
    resources: getOfflineData(state),
    scope: getScope(state),
    tab,
    userDetails: state.profile.userDetails,
    registerForm: state.registerForm,
    offlineData: state.offline.offlineData,
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
  reinstateDeclaration,
  clearCorrectionChange,
  goToCertificateCorrection,
  goToPage,
  goToPrintCertificate,
  goToRegistrarHomeTab,
  goToUserProfile,
  goToTeamUserList,
  goBack
})(injectIntl(RecordAuditComp))
