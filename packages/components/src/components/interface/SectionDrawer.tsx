import * as React from 'react'
import styled from 'styled-components'
import { ExpansionButton } from './../buttons'

const SectionDrawerContainer = styled.div.attrs<{ expanded: boolean }>({})`
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ expanded }) =>
    expanded ? `0 0 12px 0 rgba(0, 0, 0, 0.11)` : ``};
`
const TitleContainer = styled.div`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  display: flex;
  align-items: center;
  border-bottom: solid 1px ${({ theme }) => theme.colors.background};
  cursor: pointer;
`
const Title = styled.div`
  width: 100vw;
  padding: 25px;
`
const EditLink = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  text-decoration: underline;
`
const ExpandedIndicator = styled.div.attrs<{ expanded: boolean }>({})`
  height: 4px;
  border-radius: 1px 1px 0 0;
  transition: background 300ms;
  background: ${({ theme, expanded }) =>
    expanded === true ? theme.colors.expandedIndicator : 'none'};
`
const Seperator = styled.span`
  color: ${({ theme }) => theme.colors.background};
  margin: 0px 15px;
  &:before {
    content: '|';
  }
`
const SectionContainer = styled.div.attrs<{ expanded: boolean }>({})`
  max-height: ${({ expanded }) => (expanded ? `1000px` : `0px`)};
  overflow: hidden;
  transition: ${({ expanded }) =>
    expanded
      ? 'max-height 0.6s cubic-bezier(0.65, 0.05, 0.36, 1)'
      : 'max-height 0ms'};
`
interface IProps {
  title: string
  linkText: string
  expandable?: boolean
  linkClickHandler: () => void
}

interface IState {
  isExpanded: boolean
}

export class SectionDrawer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isExpanded: false
    }
  }
  toggleExpand = () => {
    this.setState({
      isExpanded: !this.state.isExpanded
    })
  }

  render() {
    const {
      title,
      children,
      linkText,
      expandable = true,
      linkClickHandler
    } = this.props

    return (
      <SectionDrawerContainer expanded={this.state.isExpanded}>
        {<ExpandedIndicator expanded={this.state.isExpanded} />}
        <TitleContainer
          onClick={() => {
            if (expandable === true) {
              this.toggleExpand()
            }
          }}
        >
          <Title>
            <b>{title}</b>
            {this.state.isExpanded && <Seperator />}
            {this.state.isExpanded && (
              <EditLink
                onClick={e => {
                  e.stopPropagation()
                  linkClickHandler()
                }}
              >
                {linkText}
              </EditLink>
            )}
          </Title>
          {expandable && (
            <ExpansionButton
              expanded={this.state.isExpanded}
              onClick={this.toggleExpand}
            />
          )}
        </TitleContainer>
        <SectionContainer expanded={this.state.isExpanded}>
          {children}
        </SectionContainer>
      </SectionDrawerContainer>
    )
  }
}
