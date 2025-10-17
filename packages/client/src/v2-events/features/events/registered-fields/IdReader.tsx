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
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Box, Divider, Stack, Text } from '@opencrvs/components'
import {
  EventState,
  IdReaderField,
  IdReaderFieldValue,
  QrReaderFieldValue,
  isQrReaderFieldType
} from '@opencrvs/commons/client'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

const MainContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  border: none;
  flex: 1;
`

const ReadersContainer = styled.div`
  display: flex;
  width: 100%;

  & > section {
    flex: 1;
    display: flex;
    gap: 8px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    & > section {
      flex-direction: column;
      gap: 0;
    }
  }

  & > section > div {
    width: 100%;
  }

  & > section > div > button {
    flex: 1 1 0;
  }
`

const messages = {
  dividerLabel: {
    id: 'views.idReader.label.or',
    defaultMessage: 'Or',
    description: 'Label that shows on the divider'
  },
  manualInputInstructionLabel: {
    id: 'views.idReader.label.manualInput',
    defaultMessage: 'Complete fields below',
    description: 'Label that shows below the divider on the id reader component'
  }
}

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
  onChange
}: {
  id: string
  methods: IdReaderField['methods']
  onChange: (data: IdReaderFieldValue) => void
}) {
  const intl = useIntl()
  const validatorContext = useValidatorContext()

  return (
    <MainContainer>
      <Stack alignItems="center" direction="column" gap={0}>
        <ReadersContainer>
          <FormFieldGenerator
            fields={methods}
            id={id}
            validatorContext={validatorContext}
            onChange={(values) => {
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
        </ReadersContainer>
        <Divider>
          <Text align="center" color="grey500" element="p" variant="reg18">
            {intl.formatMessage(messages.dividerLabel)}
          </Text>
        </Divider>
        <Text align="center" element="span" variant="reg16">
          {intl.formatMessage(messages.manualInputInstructionLabel)}
        </Text>
      </Stack>
    </MainContainer>
  )
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
