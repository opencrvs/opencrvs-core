/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import {
  clearUserFormData,
  fetchAndStoreUserData
} from '@client/user/userReducer'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { UserForm } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { ApolloClient } from '@apollo/client'
import { withApollo, WithApolloClient } from '@apollo/client/react/hoc'
import React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { gqlToDraftTransformer } from '@client/transformer'
import { getOfflineData } from '@client/offline/selectors'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import {
  generateCreateUserSectionUrl,
  generateUserReviewFormUrl
} from '@client/navigation'
import { Scope, SCOPES, UUID } from '@opencrvs/commons/client'
import UpdateUserReviewForm from '../userUpdate/UpdateUserReviewForm'
import CreateUserReviewForm from '../userCreation/CreateUserReviewForm'

type UserFormPageProps = {
  userId?: string
  section: IFormSection
  activeGroup: IFormSectionGroup
  nextSectionId: string
  nextGroupId: string
  formData: IFormSectionData
  submitting: boolean
  userDetailsStored?: boolean
  loadingRoles?: boolean
}

type IDispatchProps = {
  clearUserFormData: typeof clearUserFormData
  fetchAndStoreUserData: typeof fetchAndStoreUserData
}

type Titleprops = {
  title: string
  loadingMessage: string
}

type Props = RouteComponentProps &
  UserFormPageProps &
  IDispatchProps &
  IntlShapeProps &
  Titleprops

const Container = styled.div`
  display: flex;
  min-height: 80vh;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`

const SpinnerWrapper = styled.div`
  background: ${({ theme }) => theme.colors.white};
  font: ${({ theme }) => theme.fonts.bold14};
  border: solid 1px ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
  width: 244px;
  height: 163px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`
export const UserFormPageComponent = (props: WithApolloClient<Props>) => {
  const {
    title,
    loadingMessage,
    userId,
    router,
    submitting,
    section,
    userDetailsStored,
    loadingRoles,
    client
  } = props

  const determineNavigationUrl = userId
    ? generateUserReviewFormUrl({
        userId: userId,
        sectionId: props.nextSectionId,
        groupId: props.nextGroupId
      })
    : generateCreateUserSectionUrl({
        sectionId: props.nextSectionId,
        groupId: props.nextGroupId
      })

  const renderLoadingPage = () => (
    <ActionPageLight
      title={title}
      goBack={() => router.navigate(-1)}
      hideBackground={true}
    >
      <Container>
        <SpinnerWrapper>
          <Spinner id="user-form-submitting-spinner" size={25} />
          <p>{loadingMessage}</p>
        </SpinnerWrapper>
      </Container>
    </ActionPageLight>
  )

  if (submitting || loadingRoles || (userId && !userDetailsStored)) {
    return renderLoadingPage()
  }

  if (section.viewType === 'form') {
    return (
      <UserForm {...props} formActionNavigationUrl={determineNavigationUrl} />
    )
  }

  if (section.viewType === 'preview') {
    return userId ? (
      <UpdateUserReviewForm
        userId={userId}
        section={section}
        formData={props.formData}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        client={client as ApolloClient<any>}
        title={title}
      />
    ) : (
      <CreateUserReviewForm
        section={section}
        formData={props.formData}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        client={client as ApolloClient<any>}
        title={title}
      />
    )
  }

  return null
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
      (section) => section.viewType !== 'hidden'
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

function addJurisdictionFilterToLocationSearchInput(
  section: IFormSection,
  userOfficeId: UUID
): IFormSection {
  return {
    ...section,
    groups: section.groups.map((group) => ({
      ...group,
      fields: group.fields.map((field) => {
        if (field.type !== 'LOCATION_SEARCH_INPUT') {
          return field
        }
        return {
          ...field,
          userOfficeId
        }
      })
    }))
  }
}

const mapStateToProps = (state: IStoreState, props: RouteComponentProps) => {
  const config = getOfflineData(state)
  const user = getUserDetails(state)
  const scopes = getScope(state) ?? []
  const sectionId =
    props.router.params.sectionId || state.userForm.userForm!.sections[0].id

  let section = state.userForm.userForm.sections.find(
    (section) => section.id === sectionId
  )

  if (!section) {
    throw new Error(`No section found ${sectionId}`)
  }

  if (!user?.primaryOffice.id) {
    throw new Error(`No primary office found for user`)
  }

  section = scopes.some((scope) =>
    (
      [
        SCOPES.USER_CREATE_MY_JURISDICTION,
        SCOPES.USER_UPDATE_MY_JURISDICTION
      ] as Scope[]
    ).includes(scope)
  )
    ? addJurisdictionFilterToLocationSearchInput(
        section,
        user.primaryOffice.id as UUID
      )
    : section

  let formData = { ...state.userForm.userFormData }
  if (props.router.params.locationId) {
    formData = {
      ...gqlToDraftTransformer(
        { sections: [section] },
        {
          [section.id]: {
            primaryOffice: { id: props.router.params.locationId }
          }
        }
      )[section.id],
      ...formData,
      skippedOfficeSelction: true
    }
  } else {
    formData = {
      ...formData,
      skippedOfficeSelction: false
    }
  }
  const groupId =
    props.router.params.groupId ||
    getVisibleSectionGroupsBasedOnConditions(section, formData)[0].id
  const group = section.groups.find(
    (group) => group.id === groupId
  ) as IFormSectionGroup

  const fields = replaceInitialValues(
    group.fields,
    formData,
    { userForm: formData },
    config,
    user
  )
  const nextGroupId = getNextSectionIds(
    state.userForm.userForm!.sections,
    section,
    group,
    formData
  ) || { sectionId: '', groupId: '' }

  return {
    userId: props.router.params.userId,
    sectionId,
    section,
    formData,
    submitting: state.userForm.submitting,
    userDetailsStored: state.userForm.userDetailsStored,
    loadingRoles: state.userForm.loadingRoles,
    activeGroup: {
      ...group,
      fields
    },
    nextSectionId: nextGroupId && nextGroupId.sectionId,
    nextGroupId: nextGroupId && nextGroupId.groupId
  }
}

export const UserFormPage = withRouter(
  connect(mapStateToProps, {
    clearUserFormData,
    fetchAndStoreUserData
  })(injectIntl(withApollo<Props>(UserFormPageComponent)))
)
