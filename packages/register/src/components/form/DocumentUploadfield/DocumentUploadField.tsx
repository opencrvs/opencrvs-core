import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FormFieldGenerator } from '@register/components/form'
import { IFormSectionData, IFormField } from '@register/forms'

interface IProps {
  id: string
  fields: IFormField[]
}
type IFullProps = IProps & InjectedIntlProps

class DocumentUploadComponent extends React.Component<IFullProps> {
  constructor(props: IFullProps) {
    super(props)
  }

  storeData = (documentData: IFormSectionData) => {
    console.log(documentData)
  }

  render() {
    const { id, fields } = this.props
    return (
      <FormFieldGenerator
        id={id}
        onChange={this.storeData}
        setAllFieldsDirty={false}
        fields={fields}
      />
    )
  }
}

export const DocumentUploadWraper = injectIntl<IFullProps>(
  DocumentUploadComponent
)
