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
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { MimeType } from '@opencrvs/commons/client'
import { bytesToMB } from '@client/utils/imageUtils'

const messages = {
  fileSizeError: {
    id: 'v2.file.upload.fileSize.error',
    defaultMessage: 'File size must be less than {maxSize}mb',
    description: 'Error message when the selected file is too large'
  },
  fileTypeError: {
    id: 'v2.file.upload.fileType.error',
    defaultMessage:
      'File format not supported. Please attach {types} (max {maxSize}mb)',
    description: 'Error message when the selected file type is not supported'
  }
}

/**
 * @param acceptedFileTypes Array of accepted file types
 * @param onComplete Callback function to be called when file upload is complete
 * @param onUploadingStateChanged @todo: ask what this is
 * @param maxFileSize Maximum file size in bytes
 *
 * @returns Given configuration for file upload, returns a function that handles file change with possible error
 */
export function useOnFileChange({
  acceptedFileTypes,
  onComplete,
  onUploadingStateChanged,
  maxFileSize
}: {
  acceptedFileTypes: MimeType[]
  onComplete: (file: File | null) => void
  onUploadingStateChanged?: (isUploading: boolean) => void
  maxFileSize: number
}) {
  const intl = useIntl()
  const [error, setError] = useState('')

  const [filesBeingUploaded, setFilesBeingUploaded] = useState<
    { label: string }[]
  >([])

  const handleFileChange = (uploadedFile: File) => {
    setFilesBeingUploaded([...filesBeingUploaded, { label: uploadedFile.name }])

    // @TODO: figure out why this is called so many times
    onUploadingStateChanged?.(false)

    const isFileTooLarge = uploadedFile.size > maxFileSize

    const hasFileCriteria = acceptedFileTypes.length > 0
    const isWrongFileType = acceptedFileTypes.every(
      (fileType) => fileType !== uploadedFile.type
    )
    if ((hasFileCriteria && isWrongFileType) || isFileTooLarge) {
      onUploadingStateChanged?.(false)
      setFilesBeingUploaded([])

      const newErrorMessage = isFileTooLarge
        ? intl.formatMessage(messages.fileSizeError, {
            maxSize: bytesToMB(maxFileSize)
          })
        : intl.formatMessage(messages.fileTypeError, {
            types: acceptedFileTypes
              .map((fileType) => fileType.split('/').pop())
              .join(', '),
            maxSize: bytesToMB(maxFileSize)
          })

      setError(newErrorMessage)
    } else {
      onUploadingStateChanged?.(false)

      onComplete(uploadedFile)
      setError('')
      setFilesBeingUploaded([])
    }
  }

  return {
    error,
    handleFileChange
  }
}
