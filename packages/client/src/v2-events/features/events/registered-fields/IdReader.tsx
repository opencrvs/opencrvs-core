import React from 'react'
import { FieldType } from '@opencrvs/commons/client'
import { QrReader } from '@opencrvs/components/src/IDReader/readers/QrReader/QrReader'

type SupportedReadingMethod = typeof FieldType.QR_READER | typeof FieldType.HTTP
interface ReadingMethod {
  type: (typeof FieldType)[keyof typeof FieldType]
}
interface IdReaderInputProps {
  methods: ReadingMethod[]
}

function isSupportedReadingMethod(
  method: ReadingMethod
): method is { type: SupportedReadingMethod } {
  return method.type === FieldType.QR_READER || method.type === FieldType.HTTP
}

function GeneratedReaderInput(props: ReadingMethod) {
  if (!isSupportedReadingMethod(props)) {
    throw new Error(
      `Unsupported reading method used in IdReaderInput. ${JSON.stringify(props)}`
    )
  }
  if (props.type === FieldType.QR_READER) {
    return (
      <QrReader
        labels={{
          button: 'Scan ID QR code',
          scannerDialogSupportingCopy: '',
          tutorial: { cameraCleanliness: '', distance: '', lightBalance: '' }
        }}
        onScan={(data) => console.log(data)}
      />
    )
  }

  if (props.type === FieldType.HTTP) {
    return null
  }
  return null
}

function IdReaderInput() {
  return null
}

export const IdReader = {
  Input: IdReaderInput,
  Output: null
}
