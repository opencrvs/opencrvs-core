import * as React from 'react'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { List } from '@opencrvs/components/lib/interface'

interface IListType {
  id: string
  defaultMessage: string
}
export interface IProps {
  list: IListType[]
}

const FormListComponent = ({ list, intl }: IProps & InjectedIntlProps) => {
  const localizedList = list.map((item: IListType) => intl.formatMessage(item))

  return <List list={localizedList} />
}

export const FormList = injectIntl(FormListComponent)
