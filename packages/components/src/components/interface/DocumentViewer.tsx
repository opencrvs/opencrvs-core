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
import { Select, ISelectOption as SelectComponentOptions } from './../forms'
import { DocumentImage } from './components/DocumentImage'

const Container = styled.div`
  width: calc(40vw - 50px);
  position: fixed;
  top: 80px;
  background-color: ${({ theme }) => theme.colors.grey100};
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
  box-sizing: border-box;
  height: 720px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }

  > div {
    width: 100%;
    padding-top: 16px;
    padding-left: 16px;
  }

  > div#select_document {
    z-index: 2;
    background: ${({ theme }) => theme.colors.white};
    top: 16px;
    left: 16px;
    width: 250px;
    padding-top: 0px;
    padding-left: 0px;
  }

  > div#document_image {
    padding-top: 0px;
    padding-left: 0px;
  }
`
export interface IDocumentViewerOptions {
  selectOptions: SelectComponentOptions[]
  documentOptions: SelectComponentOptions[]
}

interface IProps {
  id?: string
  options: IDocumentViewerOptions
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

  render() {
    const { options, children, id } = this.props

    return (
      <Container id={id}>
        {options.documentOptions.length > 0 && (
          <>
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
            {this.state.selectedDocument && (
              <DocumentImage
                id="document_image"
                image={this.state.selectedDocument}
              />
            )}
          </>
        )}
        {options.documentOptions.length === 0 && children}
      </Container>
    )
  }
}
