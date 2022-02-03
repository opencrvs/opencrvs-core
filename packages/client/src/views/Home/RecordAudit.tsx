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

import React, { useEffect } from 'react'
import { Header } from '@client/components/interface/Header/Header'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { Navigation } from '@client/components/interface/Navigation'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { ApplicationIcon } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import { goToApplicationDetails } from '@client/navigation'
import { RouteComponentProps, withRouter } from 'react-router'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  IWorkqueue,
  updateRegistrarWorkqueue,
  IApplication,
  SUBMISSION_STATUS
} from '@client/applications'
import { IStoreState } from '@client/store'
import {
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import moment from 'moment'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { get } from 'lodash'
import { IFormSectionData } from '@client/forms'

const BodyContainer = styled.div`
  margin-left: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
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

const ValueContainer = styled.div<{ value: boolean }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey : theme.colors.grey600};
  ${({ theme }) => theme.fonts.captionBigger};
`

interface IStateProps {
  workqueue: IWorkqueue
  resources: IOfflineData
  drafts: IApplication[]
}

interface IDispatchProps {
  goToApplicationDetails: typeof goToApplicationDetails
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
}

type IFullProps = IDispatchProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps & { theme: ITheme } & RouteComponentProps<{
    applicationId: string
  }>

interface ILabel {
  [key: string]: string | false | undefined
}

interface IApplicationData {
  id: string
  childName?: string
  status?: string
  trackingId?: string
  type?: string
  dateOfBirth?: string
  placeOfBirth?: string
  informant?: string
  informantContact?: string
}

const KEY_LABEL: ILabel = {
  status: 'Status',
  type: 'Event',
  trackingId: 'Tracking ID',
  dateOfBirth: 'Date of birth',
  placeOfBirth: 'Place of birth',
  informant: 'Informant'
}

const NO_DATA_LABEL: ILabel = {
  status: 'No status',
  type: 'No event',
  trackingId: 'No tracking id',
  dateOfBirth: 'No date of birth',
  placeOfBirth: 'No place of birth',
  informant: 'No informant'
}

const isBirthApplication = (
  reg: GQLEventSearchSet | null
): reg is GQLBirthEventSearchSet => {
  return (reg && reg.type === 'Birth') || false
}

const getDraftApplications = (props: IFullProps): IApplicationData[] => {
  const drafts = props.drafts
  console.log(drafts)
  const applicationId = props.match.params.applicationId

  const applications = drafts
    .filter((application: IApplication) => {
      return application.id === applicationId
    })
    .map((application) => {
      let name = ''
      if (application.data.child) {
        if (
          application.data.child.firstNamesEng &&
          application.data.child.familyNameEng
        ) {
          name =
            application.data.child.firstNamesEng +
            ' ' +
            application.data.child.familyNameEng
        } else if (application.data.child.familyNameEng) {
          name = application.data.child.familyNameEng as string
        } else if (application.data.child.firstNamesEng) {
          name = application.data.child.firstNamesEng as string
        }
      }

      return {
        id: application.id,
        childName: name,
        status:
          (application.data.submissionStatus &&
            application.data.submissionStatus.toString()) ||
          (application.data.registrationStatus &&
            application.data.registrationStatus.toString()) ||
          '',
        type:
          (application.data.event && application.data.event.toString()) || '',
        trackingId:
          (application.data.contactPoint &&
            application.data.contactPoint.trackingId &&
            application.data.contactPoint.trackingId.toString()) ||
          '',
        dateOfBirth:
          (application.data.child &&
            application.data.child.childBirthDate &&
            application.data.child.childBirthDate.toString()) ||
          '',
        placeOfBirth:
          (application.data.child &&
            application.data.child.birthLocation &&
            application.data.child.birthLocation.toString()) ||
          '',
        informant:
          (application.data.registration &&
            application.data.registration.contactPoint &&
            (
              application.data.registration.contactPoint as IFormSectionData
            ).value.toString()) ||
          ''
        //   informantContact: application.data.registration &&
        //   application.data.registration.contactPoint &&
        //   application.data.registration.contactPoint.toString() || '',
      }
    })

  return applications
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
  let name = ''
  if (specificApplication) {
    if (
      isBirthApplication(specificApplication) &&
      specificApplication.childName &&
      specificApplication.childName[0]
    ) {
      if (
        specificApplication.childName[0].firstNames &&
        specificApplication.childName[0].familyName
      ) {
        name =
          specificApplication.childName[0].firstNames +
          ' ' +
          specificApplication.childName[0].familyName
      } else if (specificApplication.childName[0].familyName) {
        name = specificApplication.childName[0].familyName
      }
    }

    applicationData = {
      id: specificApplication.id,
      childName: name,
      type: (specificApplication.type && specificApplication.type) || '',
      status: 'In review',
      trackingId: specificApplication.registration?.trackingId || '',
      dateOfBirth:
        (isBirthApplication(specificApplication) &&
          specificApplication.dateOfBirth) ||
        '',
      placeOfBirth:
        (specificApplication.registration &&
          specificApplication.registration.eventLocationId &&
          specificApplication.registration.eventLocationId) ||
        '',
      informant:
        (specificApplication.registration &&
          specificApplication.registration.contactRelationship +
            ' . ' +
            specificApplication.registration.contactNumber) ||
        ''
    }
  }

  return applicationData
}

const getApplicationInfo = (
  props: IFullProps,
  application: IApplicationData
) => {
  const facility =
    get(props.resources.facilities, application.placeOfBirth || '') || {}

  const info: ILabel = {
    status: 'In review',
    type: application.type && application.type,
    trackingId: application.trackingId,
    dateOfBirth: application.dateOfBirth,
    placeOfBirth: facility.alias,
    informant: application.informant
  }

  return (
    <>
      {Object.entries(info).map(([key, value]) => {
        return (
          <InfoContainer key={key}>
            <KeyContainer>{KEY_LABEL[key]}</KeyContainer>
            <ValueContainer value={value as boolean}>
              {value
                ? key === 'dateOfBirth'
                  ? moment(new Date(value)).format('MMMM DD, YYYY')
                  : value
                : NO_DATA_LABEL[key]}
            </ValueContainer>
          </InfoContainer>
        )
      })}
    </>
  )
}

export const ShowRecordAudit = (props: IFullProps) => {
  useEffect(() => {
    props.updateRegistrarWorkqueue()
  }, [])

  let application: IApplicationData | null
  application = getWQApplication(props)

  if (!application) {
    application = getDraftApplications(props)[0]
  }

  return (
    <div id={'recordAudit'}>
      <Header />
      <Navigation />
      <BodyContainer>
        {application && (
          <Content
            title={application.childName}
            size={'large'}
            icon={() => <ApplicationIcon />}
          >
            {getApplicationInfo(props, application)}
          </Content>
        )}
      </BodyContainer>
    </div>
  )
}

function mapStateToProps(state: IStoreState): IStateProps {
  return {
    workqueue: state.workqueueState.workqueue,
    resources: getOfflineData(state),
    drafts:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
  }
}

export const RecordAudit = connect<
  IStateProps,
  IDispatchProps,
  {},
  IStoreState
>(mapStateToProps, {
  goToApplicationDetails,
  updateRegistrarWorkqueue
})(injectIntl(withTheme(withRouter(ShowRecordAudit))))
