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

import { ActionPageLight, Content } from '@client/../../components/lib'
import { PrimaryButton } from '@client/../../components/lib/buttons'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { IDeclaration, modifyDeclaration } from '@client/declarations'
import { IFormData, IFormSection, IFormSectionGroup } from '@client/forms'
import { issueGroupForBirthAppWithDetails } from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { getCorrectorSection } from '@client/forms/correction/corrector'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import {
  goBack,
  goToHomeTab,
  goToVerifyIssueCollector
} from '@client/navigation'
import { getGroupWithVisibleFields } from '@client/views/CorrectionForm'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { selectDeclaration } from '@client/declarations/selectors'
import { Redirect, useParams } from 'react-router'
import { HOME } from '@client/navigation/routes'
import { Event } from '@client/utils/gateway'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

interface IProps {
  formGroup: IFormSectionGroup
  formData: IFormData
  declaration: IDeclaration
  section: IFormSection
  store: IStoreState
}

interface IDispatchProps {
  getCorrectorSection: typeof getCorrectorSection
  getGroupWithVisibleFields: typeof getGroupWithVisibleFields
  modifyDeclaration: typeof modifyDeclaration
}

export const IssueCollectorForm = (props: IProps & IDispatchProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const [error, setShowError] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState('')
  const { registrationId: declarationId, groupId } = useParams<{
    registrationId: string
    groupId: string
  }>()

  const declaration = useSelector((store: IStoreState) =>
    selectDeclaration(store, declarationId)
  )
  const event = declaration?.event

  if (!declaration) {
    return <Redirect to={HOME} />
  }

  const collector = declaration.data.informant.relationship

  const section = issueGroupForBirthAppWithDetails

  const group = issueGroupForBirthAppWithDetails.groups.find(
    (grp) => grp.id === groupId
  )

  //const group = getGroupWithVisibleFields(section, declaration)

  const continueButtonHandler = () => {
    console.log('selectedValue', selectedValue)

    return dispatch(
      goToVerifyIssueCollector(declarationId, Event.Birth, collector as string)
    )
  }

  return (
    <>
      <ActionPageLight
        id="issueCollectorForm"
        hideBackground
        title={intl.formatMessage(constantsMessages.issueCertificate)}
        goBack={goBack}
        goHome={() => dispatch(goToHomeTab(WORKQUEUE_TABS.readyToIssue))}
      >
        <Content title={intl.formatMessage(constantsMessages.issueCertificate)}>
          <FormFieldGenerator
            id={group.id}
            onChange={(values) => {
              if (values && values.issueCertificate) {
                setSelectedValue(values as unknown as string)
              }
            }}
            setAllFieldsDirty={false}
            fields={group.fields}
            draftData={declaration.data}
            //   onUploadingStateChanged={}
          />
          <PrimaryButton
            id="confirmForm"
            onClick={() => continueButtonHandler()}
            disabled={Boolean(selectedValue)}
          >
            {intl.formatMessage(buttonMessages.continueButton)}
          </PrimaryButton>
        </Content>
      </ActionPageLight>
    </>
  )
}
