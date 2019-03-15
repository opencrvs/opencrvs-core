import * as React from 'react'
import styled from 'styled-components'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 25px;
  margin-bottom: 1px;
`
const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  &:last-child {
    margin-bottom: 0;
  }
`
const BoldSpan = styled.span`
  font-weight: bold;
  padding: 0 10px;
`
type IProps = InjectedIntlProps & {
  data: {
    [key: string]: string & Array<{ [key: string]: string | any }>
  }
}
const viewableField = ['name', 'dob', 'dod']
const messages = defineMessages({
  name: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  dob: {
    id: 'register.workQueue.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  dod: {
    id: 'register.workQueue.labels.results.dod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item'
  }
})

export class ExpansionContentComp extends React.Component<IProps> {
  renderExpansionContent = (item: {
    [key: string]: string & Array<{ [key: string]: string }>
  }) => {
    const { intl } = this.props
    return viewableField.map((itemElem, index) => {
      return (
        itemElem in item &&
        item[itemElem] && (
          <ExpansionContainer key={index}>
            <label>{intl.formatMessage(messages[itemElem])}:</label>
            <BoldSpan>{item[itemElem]}</BoldSpan>
          </ExpansionContainer>
        )
      )
    })
  }

  render() {
    const { data } = this.props
    return (
      <ExpansionContent>{this.renderExpansionContent(data)}</ExpansionContent>
    )
  }
}

export const ExpansionContentInfo = connect(
  null,
  null
)(injectIntl(ExpansionContentComp))
