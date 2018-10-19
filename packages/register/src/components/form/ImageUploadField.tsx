import * as React from 'react'
import styled from 'styled-components'
import { IconAction } from '@opencrvs/components/lib/buttons'
import { Camera } from '@opencrvs/components/lib/icons'
import { IActionProps } from '@opencrvs/components/lib/buttons/Action'
import { ActionTitle } from '@opencrvs/components/lib/buttons/IconAction'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { ImageUploader } from '@opencrvs/components/lib/forms'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { Form } from 'src/components/form'
import { IFormSection, IFormSectionData, IFileValue } from 'src/forms'
import { hasFormError } from 'src/forms/utils'

const Container = styled.div`
  width: 100%;
`
export const StyledIcon = styled(Camera)`
  border-radius: 2px;
  box-shadow: 0 0 4px 3px rgba(0, 0, 0, 0.1);
  height: 50px;
  width: 50px;
  background-color: ${({ theme }) => theme.colors.cardGradientEnd};
`

export const PhotoIconAction = styled(IconAction)`
  outline-style: dashed;
  outline-color: ${({ theme }) => theme.colors.cardGradientEnd};
  outline-width: 1px;
  min-height: 90px;
  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    font-size: 18px;
    margin-left: 75px;
    line-height: 24px;
  }
`
const FormContainer = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
`
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`
const FormImageUploader = styled(ImageUploader)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

type State = {
  data: IFormSectionData
  showNestedFormSection: boolean
  showUploadButton: boolean
}

type IProps = IActionProps & {
  files: IFileValue[]
  nestedSection: IFormSection
  onComplete: (files: IFileValue[]) => void
}

export class ImageUploadField extends React.Component<IProps, State> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      data: {},
      showNestedFormSection: false,
      showUploadButton: false
    }
  }

  toggleNestedSection = () => {
    this.setState({ showUploadButton: false })
    this.setState({ showNestedFormSection: !this.state.showNestedFormSection })
  }

  onComplete = (file: IFileValue) => {
    const files = this.props.files ? this.props.files : []
    files.push(file)
    this.props.onComplete(files)
    this.toggleNestedSection()
  }

  /* functions for nestedSection -- thinking of bringing this out as a separate component*/
  storeLocalData = (documentData: IFormSectionData) => {
    this.setState({ data: documentData })
    if (this.shouldShowUploadButton(documentData)) {
      this.setState({ showUploadButton: true })
    }
  }

  shouldShowUploadButton = (documentData: IFormSectionData) => {
    return (
      documentData &&
      !hasFormError(this.props.nestedSection.fields, documentData)
    )
  }

  handleFileChange = (uploadedImage: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        this.onComplete({
          subject: Object.values(this.state.data).join(' '),
          type: uploadedImage.type,
          value: reader.result.toString()
        })
      }
    }
    reader.readAsDataURL(uploadedImage)
  }

  render = () => {
    const { title, nestedSection, files } = this.props
    const { showNestedFormSection, showUploadButton } = this.state

    return (
      <Container>
        <PhotoIconAction
          type="button"
          icon={() => <StyledIcon />}
          title={title}
          {...this.props}
          onClick={this.toggleNestedSection}
        />
        {files && <div>File name: {files.length}</div>}
        {showNestedFormSection && (
          <OverlayContainer>
            <ActionPage
              title="Upload" // TODO: need to support internationalized text
              goBack={this.toggleNestedSection}
            >
              <FormContainer>
                <Box>
                  <Form
                    id={nestedSection.id}
                    onChange={this.storeLocalData}
                    setAllFieldsDirty={false}
                    fields={nestedSection.fields}
                  />
                  {showUploadButton && (
                    <FormAction>
                      <FormImageUploader
                        id="upload_document"
                        title="Upload" // TODO: need to support internationalized text
                        icon={() => <ArrowForward />}
                        handleFileChange={this.handleFileChange}
                      />
                    </FormAction>
                  )}
                </Box>
              </FormContainer>
            </ActionPage>
          </OverlayContainer>
        )}
      </Container>
    )
  }
}
