import React from 'react'
import { PrintRecordHeader } from '@client/views/PrintRecord/Header'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import { useSelector } from 'react-redux'
import { useParams, Redirect } from 'react-router'
import { IDeclaration } from '@client/declarations'
import styled from 'styled-components'

const PageContainer = styled.div`
  padding: 16px 24px;
`
export function PrintRecord() {
  const params = useParams<{ declarationId: string }>()
  const { declarationId } = params
  const declaration = useSelector<IStoreState, IDeclaration | undefined>(
    (state) =>
      state.declarationsState.declarations.find(
        ({ id }) => id === declarationId
      )
  )

  if (!declaration) {
    return (
      <Redirect
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyForReview,
          selectorId: ''
        })}
      />
    )
  }

  return (
    <PageContainer>
      <PrintRecordHeader declaration={declaration} />
    </PageContainer>
  )
}
