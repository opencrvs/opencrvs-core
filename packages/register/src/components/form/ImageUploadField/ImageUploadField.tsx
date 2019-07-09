import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '@register/styledComponents'
import { IconAction } from '@opencrvs/components/lib/buttons'
import { Camera } from '@opencrvs/components/lib/icons'
import { IActionProps } from '@opencrvs/components/lib/buttons/Action'
import { ActionTitle } from '@opencrvs/components/lib/buttons/IconAction'
import { FileItem } from '@opencrvs/components/lib/files'
import { IFormSection, IFileValue } from '@register/forms'
import { ImageUploadOption } from '@register/components/form/ImageUploadField/ImageUploadOption'
import { ImagePreview } from '@register/components/form/ImageUploadField/ImagePreview'

const Container = styled.div`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
  padding-bottom: 35px;
`
const StyledIcon = styled(Camera)`
  border-radius: 2px;
  box-shadow: 0 0 4px 3px rgba(0, 0, 0, 0.1);
  height: 50px;
  width: 50px;
  background-color: ${({ theme }) => theme.colors.secondary};
`
const PhotoIconAction = styled(IconAction)`
  outline-style: dashed;
  outline-color: ${({ theme }) => theme.colors.secondary};
  outline-width: 1px;
  min-height: 90px;
  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    ${({ theme }) => theme.fonts.bigBodyStyle};
    margin-left: 75px;
  }
`
const FileViewer = styled.div`
  margin-top: 15px;
`
const FileViewerLabel = styled.label`
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.bodyStyle};
`
const FileItemContainer = styled.div`
  margin-top: 12px;
`
const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  uploadedList: {
    id: 'formFields.imageUpload.uploadedList',
    defaultMessage: 'Uploaded:',
    description: 'label for uploaded list'
  },
  delete: {
    id: 'formFields.imageUpload.delete',
    defaultMessage: 'Delete',
    description: 'label for delete a uploaded item'
  },
  preview: {
    id: 'formFields.imageUpload.preview',
    defaultMessage: 'Preview',
    description: 'label for preview a uploaded item'
  },
  upload: {
    id: 'register.form.upload',
    defaultMessage: 'Upload',
    description: 'title for option view'
  }
})

type IProps = {
  files?: IFileValue[]
  optionSection: IFormSection
  onComplete: (files: IFileValue[]) => void
}
type IFullProps = IActionProps & InjectedIntlProps & IProps

interface IFullFileValues extends IFileValue {
  title: string
  description: string
}

interface ITempFullFileValues extends IFileValue {
  title?: string
  description?: string
}
/* feels weired may need to change a bit */
function augmentFile(file: IFileValue): IFullFileValues {
  const augmentedFile: ITempFullFileValues = file
  if (file.optionValues) {
    augmentedFile.title = file.optionValues[0].toString()
    if (file.optionValues.length > 1) {
      augmentedFile.description = file.optionValues[1].toString()
    }
  }
  return augmentedFile as IFullFileValues
}
class ImageUploadComponent extends React.Component<
  IFullProps,
  {
    showNestedOptionSection: boolean
    previewImage: IFileValue | null
    previewIndex: number
  }
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      showNestedOptionSection: false,
      previewImage: null,
      previewIndex: 0
    }
  }

  toggleNestedSection = () => {
    this.setState({
      showNestedOptionSection: !this.state.showNestedOptionSection
    })
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  onDelete = (index: number): void => {
    this.closePreviewSection()
    const files = this.props.files ? this.props.files : []
    files.splice(index, 1)
    this.props.onComplete(files)
  }

  onPreview = (file: IFileValue, index: number): void => {
    this.setState({ previewImage: file, previewIndex: index })
  }

  onComplete = (file: IFileValue) => {
    const files = this.props.files ? this.props.files : []
    this.props.onComplete(files.concat(file))
    this.toggleNestedSection()
  }

  render = () => {
    const { title, optionSection, files, intl } = this.props
    const fileList =
      files &&
      files.map((file: IFileValue, index: number) => {
        const augmentedFile: IFullFileValues = augmentFile(file)
        return (
          <FileItemContainer key={index}>
            <FileItem
              id={`file_item_${index}`}
              file={augmentedFile}
              deleteLabel={intl.formatMessage(messages.delete)}
              onDelete={() => this.onDelete(index)}
              previewLabel={intl.formatMessage(messages.preview)}
              onPreview={() => this.onPreview(file, index)}
            />
          </FileItemContainer>
        )
      })
    return (
      <Container>
        <PhotoIconAction
          type="button"
          icon={() => <StyledIcon />}
          title={title}
          {...this.props}
          onClick={this.toggleNestedSection}
        />

        {fileList && fileList.length > 0 && (
          <FileViewer id="file_list_viewer">
            <FileViewerLabel>
              {intl.formatMessage(messages.uploadedList)}
            </FileViewerLabel>
            {fileList}
          </FileViewer>
        )}

        {this.state.showNestedOptionSection && (
          <ImageUploadOption
            option={optionSection}
            title={intl.formatMessage(messages.upload)}
            backLabel={intl.formatMessage(messages.back)}
            onComplete={this.onComplete}
            toggleNestedSection={this.toggleNestedSection}
          />
        )}

        {this.state.previewImage && (
          <ImagePreview
            previewImage={this.state.previewImage}
            title={augmentFile(this.state.previewImage).title}
            goBack={this.closePreviewSection}
            onDelete={() => this.onDelete(0)}
          />
        )}
      </Container>
    )
  }
}
export const ImageUploadField = injectIntl<IFullProps>(ImageUploadComponent)
