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
} from '@register/forms'
import { goToCreateUserSection, goBack } from '@register/navigation'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { FormTitle, Action } from '@register/views/SysAdmin/views/UserForm'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Dispatch } from 'redux'
import { submitUserFormData } from '@register/views/SysAdmin/forms/userReducer'
import ApolloClient from 'apollo-client'
import { createUserMutation } from '@register/views/SysAdmin/user/mutations'
import { draftToGqlTransformer } from '@register/transformer'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import {
  userMessages,
  buttonMessages as messages
} from '@register/i18n/messages'
import { getVisibleSectionGroupsBasedOnConditions } from '@register/forms/utils'
import { SimpleDocumentUploader } from '@register/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { deserializeFormSection } from '@register/forms/mappings/deserializer'
import { IStoreState } from '@register/store'
import { getOfflineData } from '@register/offline/selectors'
import { IOfflineData } from '@register/offline/reducer'

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
      const locationId = formData[field.name].toString()
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
