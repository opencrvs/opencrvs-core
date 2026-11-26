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
import React from 'react'
import styled from 'styled-components'
import {
  EventState,
  IdReaderField,
  IdReaderFieldValue,
  QrReaderFieldValue,
  isQrReaderFieldType,
  ActionUpdate
} from '@opencrvs/commons/client'
import { FormConditionalContext } from '@client/v2-events/components/forms/formConditionalContext'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

const SubComponentStack = styled.div`
  & > section {
    width: 100%;
  }

  & > section > div + div {
    margin-top: -14px;
    margin-bottom: 0;
  }
`

function getQrFieldValue(fields: IdReaderField['methods'], values: EventState) {
  const qrField = fields.find((f) =>
    isQrReaderFieldType({ config: f, value: values[f.id] })
  )
  if (!qrField) {
    return { data: null }
  }
  return values[qrField.id] as QrReaderFieldValue
}

function IdReaderInput({
  id,
  methods,
  annotates,
  siblingValues,
  conditionalContext,
  onChange
}: {
  id: string
  methods: IdReaderField['methods']
  /** See `formForConditionals`. */
  annotates: ActionUpdate | null
  /** See `formForConditionals`. */
  siblingValues?: ActionUpdate
  /** The context of the form that the field is in. */
  conditionalContext: FormConditionalContext
  onChange: (data: IdReaderFieldValue) => void
}) {
  return (
    <SubComponentStack>
      <FormFieldGenerator
        annotates={annotates}
        attachmentPath={null}
        conditionalContext={conditionalContext}
        fields={methods}
        id={id}
        siblingValues={siblingValues}
        onFormChange={(values) => {
          /**
           * Extracts the actual value from nested field definitions (passed as `methods`)
           * to prevent redundant nesting in the resulting form data.
           *
           * This ensures that the parent form receives only the relevant value,
           * without needing awareness of the nested field structure.
           *
           * Currently, this logic applies only to QR Reader fields —
           * hence, we specifically search for and extract values from QR Reader field types.
           */
          onChange(getQrFieldValue(methods, values))
        }}
      />
    </SubComponentStack>
  )
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
