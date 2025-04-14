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
import { formMessages } from '@client/i18n/messages'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import {
  clearUserFormData,
  fetchAndStoreUserData
} from '@client/user/userReducer'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { UserForm } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { UserReviewForm } from '@client/views/SysAdmin/Team/user/userCreation/UserReviewForm'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { ApolloClient } from '@apollo/client'
import { withApollo, WithApolloClient } from '@apollo/client/react/hoc'
import React, { useEffect } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { gqlToDraftTransformer } from '@client/transformer'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { CREATE_USER_ON_LOCATION } from '@client/navigation/routes'
import { getOfflineData } from '@client/offline/selectors'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { Scope, SCOPES, UUID } from '@opencrvs/commons/client'

type IUserProps = {
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

interface IDispatchProps {
  clearUserFormData: typeof clearUserFormData
  fetchAndStoreUserData: typeof fetchAndStoreUserData
}

type Props = RouteComponentProps & IUserProps & IDispatchProps & IntlShapeProps

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
const CreateNewUserComponent = (props: WithApolloClient<Props>) => {
  const {
    userId,
    router,
    intl,
    submitting,
    clearUserFormData,
    fetchAndStoreUserData,
    client,
    section,
    userDetailsStored,
    loadingRoles
  } = props

  useEffect(() => {
    const initialize = async () => {
      if (
        router.location.pathname.includes(
          CREATE_USER_ON_LOCATION.split('/:')[0]
        )
      ) {
        clearUserFormData()
      }
      if (userId) {
        fetchAndStoreUserData(client as ApolloClient<any>, {
          userId
        })
      }
    }

    initialize()

    return () => {
      clearUserFormData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderLoadingPage = () => (
    <ActionPageLight
      title={
        userId
          ? intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
          : intl.formatMessage(formMessages.userFormTitle)
      }
      goBack={() => router.navigate(-1)}
      hideBackground={true}
    >
      <Container>
        {submitting ? (
          <SpinnerWrapper>
            <Spinner id="user-form-submitting-spinner" size={25} />
            <p>
              {userId
                ? intl.formatMessage(userFormMessages.updatingUser)
                : intl.formatMessage(userFormMessages.creatingNewUser)}
            </p>
          </SpinnerWrapper>
        ) : (
          <Spinner id="user-form-submitting-spinner" size={25} />
        )}
      </Container>
    </ActionPageLight>
  )

  if (submitting || loadingRoles || (userId && !userDetailsStored)) {
    return renderLoadingPage()
  }

  if (section.viewType === 'form') {
    return <UserForm {...props} />
  }

  if (section.viewType === 'preview') {
    return <UserReviewForm client={client as ApolloClient<any>} {...props} />
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

export const CreateNewUser = withRouter(
  connect(mapStateToProps, {
    clearUserFormData,
    fetchAndStoreUserData
  })(injectIntl(withApollo<Props>(CreateNewUserComponent)))
)
