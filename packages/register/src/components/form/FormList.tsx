import * as React from 'react'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor
} from 'react-intl'
import { List } from '@opencrvs/components/lib/typography'

export interface IProps {
  list: MessageDescriptor[]
}

const FormListComponent = ({
  list,
  intl,
  ...otherProps
}: IProps & IntlShapeProps) => {
  const localizedList = list.map((item: MessageDescriptor) =>
    intl.formatMessage(item)
  )

  return <List list={localizedList} {...otherProps} />
}

export const FormList = injectIntl(FormListComponent)
