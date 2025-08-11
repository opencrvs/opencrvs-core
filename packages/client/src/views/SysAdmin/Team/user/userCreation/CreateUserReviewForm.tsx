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
import { IFormSection, IFormSectionData } from '@client/forms'
import { createOrUpdateUserMutation } from '@client/forms/user/mutation/mutations'
import { buttonMessages as messages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { submitUserFormData } from '@client/user/userReducer'
import { Button } from '@opencrvs/components/lib/Button'
import { ApolloClient } from '@apollo/client'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { draftToGqlTransformer } from '@client/transformer'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'
import { UserReviewFormCommon } from '../commons/UserReviewFormCommon'
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'

interface IUserReviewFormProps {
  section: IFormSection
  formData: IFormSectionData
  client: ApolloClient<unknown>
  title: string
}

const CreateUserReviewFormComponent = (props: IUserReviewFormProps) => {
  const { formData, client } = props
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { userForm } = useSelector((state: IStoreState) => state.userForm)
  const userFormSection = userForm?.sections[0]
  const offlineCountryConfiguration = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  const userRoles = useSelector(
    (state: IStoreState) => state.userForm.userRoles
  )

  const userRole = userRoles.find(({ id }) => id === formData.role)

  const handleSubmit = () => {
    const variables = draftToGqlTransformer(
      { sections: [userFormSection] },
      { user: formData },
      '',
      userDetails,
      offlineCountryConfiguration,
      undefined
    )
    if (variables.user._fhirID) {
      variables.user.id = variables.user._fhirID
      delete variables.user._fhirID
    }

    if (variables.user.signature) {
      delete variables.user.signature.name
      delete variables.user.signature.__typename
    }
    submitForm(variables)
  }

  const navigateToUserList = () =>
    navigate({
      pathname: routes.TEAM_USER_LIST,
      search: stringify({
        locationId: formData.registrationOffice as string
      })
    })

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const submitForm = (variables: Record<string, any>) => {
    dispatch(
      submitUserFormData(
        client,
        createOrUpdateUserMutation,
        variables,
        formData.registrationOffice as string,
        false, // detect if update or create
        navigateToUserList
      )
    )
  }

  const actionComponent = (
    <Button
      id="submit_user_form"
      type="positive"
      size="large"
      fullWidth
      disabled={
        userRole?.scopes?.includes('profile.electronic-signature') &&
        !formData.signature
      }
      onClick={handleSubmit}
    >
      {intl.formatMessage(messages.createUser)}
    </Button>
  )

  return (
    <UserReviewFormCommon
      intl={intl}
      title={props.title}
      section={props.section}
      formData={formData}
      userFormSection={userFormSection}
      userRoles={userRoles}
      userDetails={userDetails}
      offlineCountryConfiguration={offlineCountryConfiguration}
      actionComponent={actionComponent}
      submitForm={handleSubmit}
    />
  )
}

const CreateUserReviewForm = CreateUserReviewFormComponent
export default CreateUserReviewForm
