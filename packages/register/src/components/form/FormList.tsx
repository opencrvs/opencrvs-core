import * as React from 'react'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { List } from '@opencrvs/components/lib/typography'

export interface IProps {
  list: FormattedMessage.MessageDescriptor[]
}

const FormListComponent = ({
  list,
  intl,
  ...otherProps
}: IProps & InjectedIntlProps) => {
  const localizedList = list.map((item: FormattedMessage.MessageDescriptor) =>
    intl.formatMessage(item)
  )

  return <List list={localizedList} {...otherProps} />
}

export const FormList = injectIntl(FormListComponent)
