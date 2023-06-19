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
import { Select, ISelectOption as SelectComponentOptions } from '../Select'
import { DocumentImage } from './components/DocumentImage'
import { isEqual } from 'lodash'

const Container = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
  box-sizing: border-box;
  height: calc(100vh - 104px);
  width: 100%;
  overflow: hidden;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }

  > div#document_image {
    padding-top: 0px;
    padding-left: 0px;
  }
`
const DoucumentViewerHeader = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  z-index: 10;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};

  > div#select_document {
    z-index: 99;
    padding-left: 16px;
  }
`

export interface IDocumentViewerOptions {
  selectOptions: SelectComponentOptions[]
  documentOptions: SelectComponentOptions[]
}

interface IProps {
  id?: string
  options: IDocumentViewerOptions
  children?: React.ReactNode
}

interface IState {
  selectedOption: string
  selectedDocument: string
}

export class DocumentViewer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selectedOption:
        typeof this.props.options.selectOptions[0] !== 'undefined'
          ? this.props.options.selectOptions[0].value
          : '',
      selectedDocument:
        typeof this.props.options.documentOptions[0] !== 'undefined'
          ? this.props.options.documentOptions[0].value
          : ''
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (!isEqual(prevProps.options, this.props.options)) {
      this.setState({
        selectedOption:
          typeof this.props.options.selectOptions[0] !== 'undefined'
            ? this.props.options.selectOptions[0].value
            : '',
        selectedDocument:
          typeof this.props.options.documentOptions[0] !== 'undefined'
            ? this.props.options.documentOptions[0].value
            : ''
      })
    }
  }

  render() {
    const { options, children, id } = this.props

    return (
      <Container id={id}>
        <>
          <DoucumentViewerHeader>
            <Select
              id="select_document"
              options={options.selectOptions}
              color="inherit"
              value={this.state.selectedOption as string}
              onChange={(val: string) => {
                const imgArray = options.documentOptions.filter((doc) => {
                  return doc.label === val
                })
                if (imgArray[0]) {
                  this.setState({
                    selectedOption: val,
                    selectedDocument: imgArray[0].value
                  })
                }
              }}
            />
          </DoucumentViewerHeader>
          <DocumentImage
            id="document_image"
            image={this.state.selectedDocument}
          />
          {children}
        </>
      </Container>
    )
  }
}
