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
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import { IStoreState } from '@client/store'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { UserForm } from '@client/views/SysAdmin/tabs/user/userCreation/UserForm'
import { UserReviewForm } from '@client/views/SysAdmin/tabs/user/userCreation/UserReviewForm'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ApolloClient from 'apollo-client'
import { withApollo } from 'react-apollo'
import { Spinner, ActionPageLight } from '@opencrvs/components/lib/interface'
import styled from '@client/styledComponents'
import { goBack } from '@client/navigation'
import { processRoles } from '@client/user/userReducer'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import { formMessages } from '@client/i18n/messages'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'

interface IMatchParams {
  sectionId: string
  groupId: string
}

type INewUserProps = {
  section: IFormSection
  activeGroup: IFormSectionGroup
  nextSectionId: string
  nextGroupId: string
  formData: IFormSectionData
  submitting: boolean
  client: ApolloClient<unknown>
}

interface IDispatchProps {
  goBack: typeof goBack
  processRoles: typeof processRoles
}

export type Props = RouteComponentProps<IMatchParams> &
  INewUserProps &
  IntlShapeProps

const Container = styled.div`
  display: flex;
  min-height: 80vh;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`

class CreateNewUserComponent extends React.Component<Props & IDispatchProps> {
  renderLoadingPage = () => {
    const { intl } = this.props
    return (
      <ActionPageLight
        title={intl.formatMessage(formMessages.userFormTitle)}
        goBack={this.props.goBack}
      >
        <Container>
          <Spinner id="user-form-submitting-spinner" />
        </Container>
      </ActionPageLight>
    )
  }

  componentDidMount() {
    /* TODO
     * The following hardcoded location id will have to be replaced by the
     * id of the selected location.
     */
    this.props.processRoles('56df364b-6e36-432f-98d5-4f3ed07e142b')
  }

  render() {
    const { section, submitting } = this.props
    if (submitting) {
      return this.renderLoadingPage()
    }

    if (section.viewType === 'form') {
      return <UserForm {...this.props} />
    }

    if (section.viewType === 'preview') {
      return <UserReviewForm {...this.props} />
    }
  }
}

function getNextSectionIds(
  sections: IFormSection[],
  fromSection: IFormSection,
  fromSectionGroup: IFormSectionGroup,
  formData: IFormSectionData
) {
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    fromSection,
    formData || {}
  )
  const currentGroupIndex = visibleGroups.findIndex(
    (group: IFormSectionGroup) => group.id === fromSectionGroup.id
  )

  if (currentGroupIndex === visibleGroups.length - 1) {
    const visibleSections = sections.filter(
      section => section.viewType !== 'hidden'
    )
    const currentIndex = visibleSections.findIndex(
      (section: IFormSection) => section.id === fromSection.id
    )

    if (currentIndex === visibleSections.length - 1) {
      return null
    }
    return {
      sectionId: visibleSections[currentIndex + 1].id,
      groupId: visibleSections[currentIndex + 1].groups[0].id
    }
  }
  return {
    sectionId: fromSection.id,
    groupId: visibleGroups[currentGroupIndex + 1].id
  }
}

const mapStateToProps = (state: IStoreState, props: Props) => {
  const sectionId =
    props.match.params.sectionId || state.userForm.userForm.sections[0].id
  const section = state.userForm.userForm.sections.find(
    section => section.id === sectionId
  ) as IFormSection

  const groupId = props.match.params.groupId || section.groups[0].id

  const group = section.groups.find(
    group => group.id === groupId
  ) as IFormSectionGroup

  if (!section) {
    throw new Error(`No section found ${sectionId}`)
  }

  const fields = replaceInitialValues(group.fields, state.userForm.userFormData)

  const nextGroupId = getNextSectionIds(
    state.userForm.userForm.sections,
    section,
    group,
    state.userForm.userFormData
  ) || { sectionId: '', groupId: '' }

  return {
    sectionId: sectionId,
    section,
    formData: state.userForm.userFormData,
    submitting: state.userForm.submitting,
    activeGroup: {
      ...group,
      fields
    },
    nextSectionId: nextGroupId && nextGroupId.sectionId,
    nextGroupId: nextGroupId && nextGroupId.groupId
  }
}

export const CreateNewUser = connect(
  mapStateToProps,
  { goBack, processRoles }
)(injectIntl(withApollo(CreateNewUserComponent)))
