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
  DataSection,
  IDataProps,
  ActionPageLight
} from '@opencrvs/components/lib/interface'
import {
  FIELD_GROUP_TITLE,
  IFormField,
  IFormSection,
  IFormSectionData,
  SIMPLE_DOCUMENT_UPLOADER,
  IAttachmentValue,
  SEARCH_FIELD
} from '@client/forms'
import { goToCreateUserSection, goBack } from '@client/navigation'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import {
  FormTitle,
  Action
} from '@client/views/SysAdmin/tabs/user/userCreation/UserForm'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Dispatch } from 'redux'
import { submitUserFormData } from '@client/user/userReducer'
import ApolloClient from 'apollo-client'
import { createUserMutation } from '@client/forms/user/fieldDefinitions/mutation/mutations'
import { draftToGqlTransformer } from '@client/transformer'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import { userMessages, buttonMessages as messages } from '@client/i18n/messages'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { deserializeFormSection } from '@client/forms/mappings/deserializer'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { userSection } from '@client/forms/user/fieldDefinitions/user-section'

export interface IUserReviewFormProps {
  section: IFormSection
  formData: IFormSectionData
  client: ApolloClient<unknown>
}

interface IDispatchProps {
  goToCreateUserSection: typeof goToCreateUserSection
  submitForm: () => void
  offlineResources: IOfflineData
  goBack: typeof goBack
}

interface ISectionData {
  title: string
  items: IDataProps[]
}

type IFullProps = IUserReviewFormProps & IntlShapeProps

class UserReviewFormComponent extends React.Component<
  IFullProps & IDispatchProps
> {
  transformSectionData = () => {
    const { intl } = this.props
    const sections: ISectionData[] = []
    getVisibleSectionGroupsBasedOnConditions(
      deserializeFormSection(userSection),
      this.props.formData
    ).forEach(group => {
      group.fields.forEach((field: IFormField) => {
        if (field && field.type === FIELD_GROUP_TITLE) {
          sections.push({ title: intl.formatMessage(field.label), items: [] })
        } else if (field && sections.length > 0) {
          sections[sections.length - 1].items.push({
            label:
              field.type === SIMPLE_DOCUMENT_UPLOADER
                ? ''
                : intl.formatMessage(field.label),
            value: this.getValue(field),
            action: {
              id: `btn_change_${field.name}`,
              label: intl.formatMessage(messages.change),
              handler: () =>
                this.props.goToCreateUserSection(
                  userSection.id,
                  group.id,
                  field.name
                )
            }
          })
        }
      })
    })

    return sections
  }

  getValue = (field: IFormField) => {
    const { intl, formData } = this.props

    if (field.type === SIMPLE_DOCUMENT_UPLOADER) {
      const files = (formData[field.name] as unknown) as IAttachmentValue

      return (
        <SimpleDocumentUploader
          label={intl.formatMessage(field.label)}
          disableDeleteInPreview={true}
          name={field.name}
          onComplete={() => {}}
          files={files}
        />
      )
    }

    if (field.type === SEARCH_FIELD) {
      const offlineLocations = this.props.offlineResources[
        field.searchableResource
      ]

      const locationId = formData[field.name] as string
      return offlineLocations[locationId] && offlineLocations[locationId].name
    }

    return formData[field.name]
      ? typeof formData[field.name] !== 'object'
        ? field.name === 'role'
          ? intl.formatMessage(userMessages[formData.role as string])
          : field.name === 'type'
          ? intl.formatMessage(userMessages[formData.type as string])
          : String(formData[field.name])
        : (formData[field.name] as IDynamicValues).label
      : ''
  }

  render() {
    const { intl, section } = this.props

    return (
      <ActionPageLight
        title={intl.formatMessage(section.title)}
        goBack={this.props.goBack}
      >
        <FormTitle id={`${section.id}_title`}>
          {intl.formatMessage(section.name)}
        </FormTitle>
        {this.transformSectionData().map((sec, index) => (
          <DataSection key={index} {...sec} />
        ))}
        <Action>
          <PrimaryButton id="submit_user_form" onClick={this.props.submitForm}>
            {intl.formatMessage(messages.createUser)}
          </PrimaryButton>
        </Action>
      </ActionPageLight>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: IFullProps) => {
  return {
    goToCreateUserSection: (sec: string, group: string, fieldName?: string) =>
      dispatch(goToCreateUserSection(sec, group, fieldName)),
    goBack: () => dispatch(goBack()),
    submitForm: () => {
      const variables = draftToGqlTransformer(
        { sections: [deserializeFormSection(userSection)] },
        { user: props.formData }
      )
      dispatch(submitUserFormData(props.client, createUserMutation, variables))
    }
  }
}
export const UserReviewForm = connect(
  (store: IStoreState) => {
    return {
      offlineResources: getOfflineData(store)
    }
  },
  mapDispatchToProps
)(injectIntl<'intl', IFullProps & IDispatchProps>(UserReviewFormComponent))
