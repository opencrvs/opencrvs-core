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
import * as React from 'react'
import {
  modifyDeclaration,
  IDeclaration,
  writeDeclaration
} from '@client/declarations'
import { connect, useSelector } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import {
  generateCertificateCorrectionUrl,
  generateGoToHomeTabUrl
} from '@client/navigation'
import {
  CorrectionSection,
  IFormSection,
  IFormSectionData
} from '@client/forms'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { FormFieldGenerator } from '@client/components/form'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { correctReasonSection } from '@client/forms/correction/reason'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { groupHasError } from './utils'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { UserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useNavigate } from 'react-router-dom'

type IProps = {
  declaration: IDeclaration
}

type IDispatchProps = {
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function getGroupWithInitialValues(
  section: IFormSection,
  declaration: IDeclaration,
  config: IOfflineData,
  user: UserDetails | null
) {
  const group = section.groups[0]

  return {
    ...group,
    fields: replaceInitialValues(
      group.fields,
      declaration.data[section.id] || {},
      declaration.data,
      config,
      user
    )
  }
}

function CorrectionReasonFormComponent(props: IFullProps) {
  const { declaration, intl } = props
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const navigate = useNavigate()

  const section = correctReasonSection

  const group = React.useMemo(
    () => getGroupWithInitialValues(section, declaration, config, user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    declaration: IDeclaration
  ) => {
    props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [activeSection.id]: {
          ...declaration.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  const continueButtonHandler = () => {
    props.writeDeclaration(declaration)
    navigate(
      generateCertificateCorrectionUrl({
        declarationId: declaration.id,
        pageId: CorrectionSection.Summary
      })
    )
  }

  const continueButton = (
    <PrimaryButton
      id="confirm_form"
      key="confirm_form"
      onClick={continueButtonHandler}
      disabled={groupHasError(
        group,
        declaration.data[section.id],
        config,
        props.declaration.data,
        user
      )}
    >
      {intl.formatMessage(buttonMessages.continueButton)}
    </PrimaryButton>
  )

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={section.title && intl.formatMessage(section.title)}
        hideBackground
        goBack={() => navigate(-1)}
        goHome={() =>
          navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyForReview
            })
          )
        }
      >
        <Content
          title={group.title && intl.formatMessage(group.title)}
          bottomActionButtons={[continueButton]}
          size={ContentSize.SMALL}
          showTitleOnMobile={true}
        >
          <FormFieldGenerator
            id={group.id}
            key={group.id}
            onChange={(values) => {
              modifyDeclaration(values, section, declaration)
            }}
            setAllFieldsDirty={false}
            fields={group.fields}
            draftData={declaration.data}
          />
        </Content>
      </ActionPageLight>
    </>
  )
}

export const CorrectionReasonForm = connect(undefined, {
  modifyDeclaration,
  writeDeclaration
})(injectIntl(CorrectionReasonFormComponent))
