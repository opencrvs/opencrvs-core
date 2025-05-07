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
import {
  CorrectorRelationship,
  getCorrectorSection
} from '@client/forms/correction/corrector'
import { connect, useSelector } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import {
  generateVerifyCorrectorUrl,
  generateGoToHomeTabUrl,
  generateGoToPageGroupUrl
} from '@client/navigation'
import { IFormSection, IFormSectionData, ReviewSection } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { FormFieldGenerator } from '@client/components/form'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { groupHasError } from './utils'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useNavigate } from 'react-router-dom'

type IProps = {
  declaration: IDeclaration
}

type IDispatchProps = {
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function CorrectorFormComponent(props: IFullProps) {
  const navigate = useNavigate()
  const { declaration, intl } = props
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const section = getCorrectorSection(declaration)

  const group = React.useMemo(
    () => ({
      ...section.groups[0],
      fields: replaceInitialValues(
        section.groups[0].fields,
        declaration.data[section.id] || {},
        declaration.data,
        config,
        user
      )
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const modifyDeclaration = (
    sectionData: IFormSectionData,
    section: IFormSection,
    declaration: IDeclaration
  ) => {
    props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [section.id]: {
          ...declaration.data[section.id],
          ...sectionData
        }
      }
    })
  }
  const continueButtonHandler = () => {
    const relationship = (
      declaration.data.corrector.relationship as IFormSectionData
    ).value as string
    if (
      relationship === CorrectorRelationship.REGISTRAR ||
      relationship === CorrectorRelationship.ANOTHER_AGENT
    ) {
      const changed = {
        ...declaration,
        data: {
          ...declaration.data,
          corrector: {
            ...declaration.data.corrector,
            hasShowedVerifiedDocument: false
          }
        }
      }
      props.modifyDeclaration(changed)
      props.writeDeclaration(changed)
      navigate(
        generateGoToPageGroupUrl({
          pageRoute: CERTIFICATE_CORRECTION_REVIEW,
          declarationId: declaration.id,
          pageId: ReviewSection.Review,
          groupId: 'review-view-group',
          event: declaration.event
        })
      )
    } else {
      props.writeDeclaration(declaration)
      navigate(
        generateVerifyCorrectorUrl({
          declarationId: declaration.id,
          corrector: relationship
        })
      )
    }
  }

  const continueButton = (
    <Button
      id="confirm_form"
      key="confirm_form"
      type="primary"
      size="large"
      fullWidth
      onClick={continueButtonHandler}
      disabled={groupHasError(
        group,
        declaration.data[section.id],
        config,
        declaration.data,
        user
      )}
    >
      {intl.formatMessage(buttonMessages.continueButton)}
    </Button>
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
          size={ContentSize.SMALL}
          title={group.title && intl.formatMessage(group.title)}
          subtitle={
            declaration.event === EventType.Birth
              ? intl.formatMessage(messages.birthCorrectionNote)
              : undefined
          }
          bottomActionButtons={[continueButton]}
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

export const CorrectorForm = connect(undefined, {
  modifyDeclaration,
  writeDeclaration
})(injectIntl(CorrectorFormComponent))
