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

import React from 'react'
import styled from '@client/styledComponents'
import { goToUserProfile, IDynamicValues } from '@client/navigation'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { SUBMISSION_STATUS } from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import { ResponsiveModal, ListTable } from '@opencrvs/components/lib/interface'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { IForm, IFormSection, IFormField } from '@client/forms'
import { constantsMessages } from '@client/i18n/messages'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { messages } from '@client/i18n/messages/views/correction'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { isEmpty, find, flatten, values } from 'lodash'
import {
  getFieldValue,
  DECLARATION_STATUS_LABEL,
  getFormattedDate
} from './utils'
import { CollectorRelationLabelArray } from '@client/forms/correction/corrector'
import { IActionDetailsData } from './History'
import { getRejectionReasonDisplayValue } from '@client/views/SearchResult/SearchResult'

interface IActionDetailsModalListTable {
  actionDetailsData: IActionDetailsData
  registerForm: IForm
  intl: IntlShape
  offlineData: Partial<IOfflineData>
}

export const ActionDetailsModalListTable = ({
  actionDetailsData,
  registerForm,
  intl,
  offlineData
}: IActionDetailsModalListTable) => {
  const [currentPage, setCurrentPage] = React.useState(1)

  if (registerForm === undefined) return <></>

  const sections = registerForm?.sections || []
  const commentsColumn = [
    {
      key: 'comment',
      label: intl.formatMessage(constantsMessages.comment),
      width: 100
    }
  ]
  const reasonColumn = [
    {
      key: 'text',
      label: intl.formatMessage(constantsMessages.reason),
      width: 100
    }
  ]
  const declarationUpdatedColumns = [
    {
      key: 'item',
      label: intl.formatMessage(messages.correctionSummaryItem),
      width: 33.33
    },
    {
      key: 'original',
      label: intl.formatMessage(messages.correctionSummaryOriginal),
      width: 33.33
    },
    { key: 'edit', label: 'Edit', width: 33.33 }
  ]
  const certificateCollector = [
    {
      key: 'collector',
      label: intl.formatMessage(certificateMessages.printedOnCollection),
      width: 100
    }
  ]
  const certificateCollectorVerified = [
    {
      key: 'hasShowedVerifiedDocument',
      label: intl.formatMessage(certificateMessages.collectorIDCheck),
      width: 100
    }
  ]

  const getItemName = (
    sectionName: MessageDescriptor,
    fieldLabel: MessageDescriptor
  ) => {
    const label = intl.formatMessage(fieldLabel)
    const section = intl.formatMessage(sectionName)

    return (label && label.trim().length > 0 && `${label} (${section})`) || ''
  }

  const dataChange = (
    actionDetailsData: IActionDetailsData
  ): IDynamicValues[] => {
    const result: IDynamicValues[] = []
    actionDetailsData.input.forEach((item: { [key: string]: any }) => {
      const editedValue = actionDetailsData.output.find(
        (oi: { valueId: string; valueCode: string }) =>
          oi.valueId === item.valueId && oi.valueCode === item.valueCode
      )

      const section = find(
        sections,
        (section) => section.id === item.valueCode
      ) as IFormSection

      const indexes: string[] = item.valueId.split('.')

      if (indexes.length > 1) {
        const [parentField, , nestedField] = indexes

        const nestedFields = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField)

        const fieldObj = flatten(values(nestedFields?.nestedFields)).find(
          (field) => field.name === nestedField
        ) as IFormField

        result.push({
          item: getItemName(section.name, fieldObj.label),
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      } else {
        const [parentField] = indexes

        const fieldObj = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField) as IFormField

        result.push({
          item: getItemName(section.name, fieldObj.label),
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      }
    })

    return result
  }
  const certificateCollectorData = (
    actionDetailsData: IActionDetailsData
  ): IDynamicValues[] => {
    if (!actionDetailsData.certificates) return []
    return actionDetailsData.certificates
      .map((certificate: IDynamicValues) => {
        if (!certificate) {
          return
        }

        const name = getIndividualNameObj(
          certificate.collector.individual.name,
          window.config.LANGUAGES
        )
        const collectorLabel = () => {
          const relation = CollectorRelationLabelArray.find(
            (labelItem) =>
              labelItem.value === certificate.collector.relationship
          )
          const collectorName = `${name?.firstNames} ${name?.familyName}`
          if (relation)
            return `${collectorName} (${intl.formatMessage(relation.label)})`
          return collectorName
        }

        return {
          hasShowedVerifiedDocument: certificate.hasShowedVerifiedDocument
            ? intl.formatMessage(certificateMessages.idCheckVerify)
            : intl.formatMessage(certificateMessages.idCheckWithoutVerify),
          collector: collectorLabel()
        }
      })
      .filter((item: IDynamicValues) => null != item)
  }

  const declarationUpdates = dataChange(actionDetailsData)
  const collectorData = certificateCollectorData(actionDetailsData)
  const pageChangeHandler = (cp: number) => setCurrentPage(cp)
  return (
    <>
      {/* For Reject Reason */}
      {actionDetailsData.reason &&
        actionDetailsData.action === SUBMISSION_STATUS.REJECTED && (
          <ListTable
            noResultText=" "
            hideBoxShadow={true}
            columns={reasonColumn}
            content={[
              {
                text: intl.formatMessage(
                  getRejectionReasonDisplayValue(actionDetailsData.reason)
                )
              }
            ]}
          />
        )}

      {/* For Comments */}
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={commentsColumn}
        content={actionDetailsData.comments
          .concat(actionDetailsData.statusReason?.text || [])
          .map((text: string | { comment: string }) => ({
            comment: typeof text === 'string' ? text : text.comment
          }))}
      />

      {/* For Data Updated */}
      {declarationUpdates.length > 0 && (
        <ListTable
          noResultText=" "
          hideBoxShadow={true}
          columns={declarationUpdatedColumns}
          content={declarationUpdates}
          pageSize={10}
          totalItems={declarationUpdates.length}
          currentPage={currentPage}
          onPageChange={pageChangeHandler}
        />
      )}

      {/* For Certificate */}
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={certificateCollector}
        content={collectorData}
        pageSize={10}
        totalItems={collectorData.length}
        currentPage={currentPage}
        onPageChange={pageChangeHandler}
      />
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={certificateCollectorVerified}
        content={collectorData}
        pageSize={10}
        totalItems={collectorData.length}
        currentPage={currentPage}
        onPageChange={pageChangeHandler}
      />
    </>
  )
}

export const ActionDetailsModal = ({
  show,
  actionDetailsData,
  toggleActionDetails,
  intl,
  goToUser,
  registerForm,
  offlineData
}: {
  show: boolean
  actionDetailsData: IActionDetailsData
  toggleActionDetails: (param: IActionDetailsData | null) => void
  intl: IntlShape
  goToUser: typeof goToUserProfile
  registerForm: IForm
  offlineData: Partial<IOfflineData>
}) => {
  if (isEmpty(actionDetailsData)) return <></>

  const title =
    (DECLARATION_STATUS_LABEL[actionDetailsData?.action] &&
      intl.formatMessage(
        DECLARATION_STATUS_LABEL[actionDetailsData?.action]
      )) ||
    ''

  const nameObj = getIndividualNameObj(
    actionDetailsData.user.name,
    window.config.LANGUAGES
  )
  const userName = nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''

  return (
    <ResponsiveModal
      actions={[]}
      handleClose={() => toggleActionDetails(null)}
      show={show}
      responsive={true}
      title={title}
      width={1024}
      autoHeight={true}
    >
      <>
        <div>
          <>{userName}</>
          <span> — {getFormattedDate(actionDetailsData.date)}</span>
        </div>
        <ActionDetailsModalListTable
          actionDetailsData={actionDetailsData}
          registerForm={registerForm}
          intl={intl}
          offlineData={offlineData}
        />
      </>
    </ResponsiveModal>
  )
}
