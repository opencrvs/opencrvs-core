import * as React from 'react'
import { useParams } from 'react-router'
import { client } from '@client/utils/apolloClient'
import { IDeclaration } from '@client/declarations'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ReviewSection } from '@client/views/Duplicates/ReviewSection'
import { getQueryMapping } from '@client/views/DataProvider/QueryProvider'
import { DownloadAction, IForm } from '@client/forms'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { gqlToDraftTransformer } from '@client/transformer'
import { Event } from '@client/utils/gateway'
import { Loader } from '@opencrvs/components/lib/interface'

function findDeclarationById(id: string, declarations: IDeclaration[]) {
  return declarations.find((declaration) => declaration.id === id)
}

async function fetchDeclaration(
  id: string,
  event: Event,
  form: Record<Event, IForm>
) {
  const mapping = getQueryMapping(
    event,
    DownloadAction.LOAD_CERTIFICATE_DECLARATION
  )
  const { data } = await client.query({
    query: mapping?.query,
    variables: { id }
  })

  if (mapping?.dataKey && data?.[mapping.dataKey]) {
    const queryData = data[mapping.dataKey]
    const declarationData = gqlToDraftTransformer(
      form[event as Event],
      queryData
    )
    return { id, data: declarationData, event }
  }
}

export function ReviewDuplicate() {
  const { id, existingId, event } = useParams()
  const declarations = useSelector<IStoreState, IDeclaration[]>(
    (state) => state.declarationsState.declarations
  )
  const form = useSelector(getRegisterForm)
  const [loading, setLoading] = React.useState(2)
  const [left, setLeft] = React.useState(findDeclarationById(id, declarations))
  const [right, setRight] = React.useState(
    findDeclarationById(existingId, declarations)
  )

  React.useEffect(() => {
    async function fetchLeft() {
      const declaration = await fetchDeclaration(id, event, form)
      setLeft(declaration)
      setLoading((l) => l - 1)
    }
    async function fetchRight() {
      const declaration = await fetchDeclaration(existingId, event, form)
      setRight(declaration)
      setLoading((l) => l - 1)
    }

    if (!left) {
      fetchLeft()
    }
    if (!right) {
      fetchRight()
    }
  }, [id, existingId, event, form, left, right])

  if (loading > 0) {
    return <Loader id="review-duplicate-loader" marginPercent={23}></Loader>
  }

  if (left && right) {
    return <ReviewSection pageRoute="" readonly draft={left} draft2={right} />
  }
  return null
}
