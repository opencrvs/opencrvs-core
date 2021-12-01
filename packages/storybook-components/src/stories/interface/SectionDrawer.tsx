/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled from 'styled-components'
import { ExpansionButton } from './../buttons'
import * as ReactDOM from 'react-dom'
import { Link } from '../typography'

const SectionDrawerContainer = styled.div<{ expanded: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ expanded }) =>
    expanded ? `0 0 12px 0 rgba(0, 0, 0, 0.11)` : ``};
`
const TitleContainer = styled.div<{ expandable: boolean }>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  display: flex;
  align-items: center;
  border-bottom: solid 1px ${({ theme }) => theme.colors.background};
  cursor: ${({ expandable }) => (expandable ? 'pointer' : 'auto')};
`
const Title = styled.div<{ visited: boolean; isExpanded: boolean }>`
  width: 100vw;
  padding: 25px;
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  color: ${({ theme, visited, isExpanded }) =>
    visited && !isExpanded ? theme.colors.primary : theme.colors.copy};
`

const ExpandedIndicator = styled.div<{ expanded: boolean }>`
  height: 4px;
  border-radius: 1px 1px 0 0;
  transition: background 300ms;
  background: ${({ theme, expanded }) =>
    expanded === true ? theme.colors.primary : 'none'};
`
const Seperator = styled.span`
  color: ${({ theme }) => theme.colors.background};
  margin: 0px 15px;
  &:before {
    content: '|';
  }
`
const SectionContainer = styled.div<{
  expanded: boolean
  maxHeight: string
}>`
  max-height: ${({ expanded, maxHeight }) => (expanded ? maxHeight : `0px`)};
  overflow: hidden;
  transition: ${({ expanded }) =>
    expanded
      ? 'max-height 0.2s cubic-bezier(0.65, 0.05, 0.36, 1)'
      : 'max-height 0.2s'};
`
interface IProps {
  title: string
  linkText: string
  expandable?: boolean
  linkClickHandler: () => void
  expansionButtonHandler: () => void
  isExpanded: boolean
  visited?: boolean
}

interface IState {
  maxHeight: string
}

interface IElement extends Element {
  querySelector: (selector: string) => Element
}

export class SectionDrawer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      maxHeight: '0px'
    }
  }

  componentDidMount() {
    this.calculateMaxHeight()
  }

  componentDidUpdate() {
    this.calculateMaxHeight()
  }

  calculateMaxHeight() {
    const extraHeight = 130
    const elem = ReactDOM.findDOMNode(this) as IElement

    const maxHeight =
      elem.querySelector('div:nth-child(3) > div').clientHeight +
      extraHeight +
      'px'

    if (this.state.maxHeight !== maxHeight) {
      this.setState(() => ({ maxHeight }))
    }
  }

  render() {
    const {
      title,
      children,
      linkText,
      expandable = true,
      linkClickHandler,
      expansionButtonHandler,
      isExpanded,
      visited = false
    } = this.props

    return (
      <SectionDrawerContainer expanded={isExpanded}>
        {<ExpandedIndicator expanded={isExpanded} />}
        <TitleContainer
          expandable={expandable}
          onClick={() => {
            if (expandable === true) {
              expansionButtonHandler()
            }
          }}
        >
          <Title visited={visited} isExpanded={isExpanded}>
            <b>{title}</b>
            {isExpanded && <Seperator />}
            {isExpanded && (
              <Link
                id={`${title.replace(/[' ]+/g, '').trim()}_link`}
                onClick={e => {
                  e.stopPropagation()
                  linkClickHandler()
                }}
              >
                {linkText}
              </Link>
            )}
          </Title>
          {expandable && (
            <ExpansionButton
              className="_expansionBtn"
              expanded={isExpanded}
              onClick={e => {
                e.stopPropagation()
                expansionButtonHandler()
              }}
            />
          )}
        </TitleContainer>

        <SectionContainer
          className="_sectionContainer"
          expanded={isExpanded}
          maxHeight={this.state.maxHeight}
        >
          <div>{children}</div>
        </SectionContainer>
      </SectionDrawerContainer>
    )
  }
}
